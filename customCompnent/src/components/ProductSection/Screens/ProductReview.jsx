import { useEffect, useRef, useState } from "react";

// Icons
import { IoPricetagOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";

// Components
import InputBox from "../../InputBox.jsx";
import Dropdown from "../../Dropdown.jsx";
import MultiSelect from "../../MultiSelect.jsx";
import FeatureInput from "../../FeatureInput.jsx";
import SectionCard from "../../SectionCard.jsx";

// Services
import ProductApi from "../../../services/ProductApi.js";
import CategoryApi from "../../../services/CategoryApi.js";
import BrandApi from "../../../services/BrandApi.js";

// Utils
import {
  classifyStock,
  toneClasses,
  validateProductForm,
  getBrandFieldStatus,
  mergeBrandLists,
} from "../utils/productStock.js";

// Display value function
const displayName = (value) =>
  typeof value === "object" && value !== null ? value.name : value;

export default function ProductReview({ product, onUpdated, onDone }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(() => toFormData(product));
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() =>
    toCategoryIds(product),
  );
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null); // { _id, name }
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const [features, setFeatures] = useState(() => product?.features || []);
  const pendingBrandIdRef = useRef(toBrandId(product));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [removingImage, setRemovingImage] = useState(null);

  useEffect(() => {
    if (!editing) {
      setFormData(toFormData(product));
      setSelectedCategoryIds(toCategoryIds(product));
      pendingBrandIdRef.current = toBrandId(product);
      setFeatures(product?.features || []);
    }
  }, [product, editing]);

  // Full category list for the MultiSelect, loaded once.
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const parentCategories = await CategoryApi.getCategoriesForStore();

        const subCategoryResponses = await Promise.all(
          (parentCategories || []).map((parent) =>
            CategoryApi.getSubCategories(parent?.name).catch((error) => {
              console.error(
                `Failed to fetch subcategories for ${parent?.name}`,
                error,
              );
              return [];
            }),
          ),
        );

        const allCategories = [
          ...(parentCategories || []),
          ...subCategoryResponses.flat(),
        ].filter(Boolean);

        const deduped = Array.from(
          new Map(allCategories.map((c) => [c._id, c])).values(),
        );

        setCategories(deduped);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  const categoryKey = selectedCategoryIds.join(",");

  useEffect(() => {
    if (selectedCategoryIds.length === 0) {
      setBrands([]);
      setSelectedBrand(null);
      setBrandsError("");
      return;
    }

    let cancelled = false;

    const loadBrands = async () => {
      setBrandsLoading(true);
      setBrandsError("");
      try {
        const results = await Promise.all(
          selectedCategoryIds.map((id) =>
            BrandApi.getBrandForCategories(id).catch(() => []),
          ),
        );
        if (cancelled) return;

        const merged = mergeBrandLists(results);
        setBrands(merged);

        setSelectedBrand((prev) => {
          const wantId = prev?._id ?? pendingBrandIdRef.current;
          if (!wantId) return null;
          const match = merged.find((b) => b._id === wantId) || null;
          if (match) pendingBrandIdRef.current = null;
          return match;
        });
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load brands for selected categories", err);
        setBrands([]);
        setBrandsError("Couldn't load brands. Try again.");
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    };

    loadBrands();
    return () => {
      cancelled = true;
    };
  }, [categoryKey]);

  function toFormData(p) {
    return {
      title: p?.title || "",
      slug: p?.slug || "",
      description: p?.description || "",
      price: p?.price ?? "",
      discountPrice: p?.discountPrice ?? "",
      costPrice: p?.costPrice ?? "",
      stock: p?.stock ?? "",
      isActive: p?.isActive ?? true,
    };
  }

  function toCategoryIds(p) {
    return (p?.category || []).map((c) => (typeof c === "string" ? c : c._id));
  }

  function toBrandId(p) {
    return typeof p?.brand === "string" ? p.brand : p?.brand?._id || null;
  }

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const stockPreview = classifyStock(formData.stock);
  const viewStockPreview = classifyStock(product?.stock);
  const brandOptions = brands.map((b) => b.name);
  const brandFieldStatus = getBrandFieldStatus({
    selectedCategoryIds,
    brandsLoading,
    brandsError,
    brands,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const nextErrors = validateProductForm(formData, {
      selectedCategoryIds,
      selectedBrand,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Fix the highlighted fields and try again.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        productId: product._id,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice),
        stock: Number(formData.stock),
        isActive: formData.isActive,
      };
      if (formData.costPrice !== "") {
        payload.costPrice = Number(formData.costPrice);
      }

      const [updated] = await Promise.all([
        ProductApi.updateProduct(payload),
        ProductApi.updateFeatures({
          productId: product._id,
          featuresArray: features,
        }),
        ProductApi.updateProductCategories({
          productId: product._id,
          categoryIds: selectedCategoryIds,
        }),
        ProductApi.updateProductBrand({
          productId: product._id,
          brandId: selectedBrand._id,
        }),
      ]);

      onUpdated({
        ...product,
        ...updated,
        category: categories.filter((c) => selectedCategoryIds.includes(c._id)),
        brand: selectedBrand,
        features,
      });
      setEditing(false);
      setErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't save changes. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async (url) => {
    setRemovingImage(url);
    setError("");
    try {
      const updated = await ProductApi.deleteProductImage(product._id, url);
      onUpdated({ ...product, ...updated });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't remove that image. Try again.",
      );
    } finally {
      setRemovingImage(null);
    }
  };

  const categoryNames = (product?.category || []).map(displayName);
  const brandName = displayName(product?.brand) || "—";

  return (
    <>
      {error && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <IoCloseCircle size={16} />
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <SectionCard
            icon={IoPricetagOutline}
            title="Product Information"
            description="Review the details below — correct anything that's off."
            action={
              !editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
                >
                  <IoCreateOutline size={14} /> Edit Details
                </button>
              )
            }
          >
            {editing ? (
              <div className="flex flex-col gap-3">
                <InputBox
                  label="Product Name"
                  notOptional
                  name="title"
                  value={formData.title}
                  onChange={handleField}
                  maxLength={120}
                />
                {errors.title && (
                  <p className="-mt-2 text-xs text-red-500">{errors.title}</p>
                )}
                <InputBox
                  label="URL slug"
                  notOptional
                  name="slug"
                  value={formData.slug}
                  onChange={handleField}
                />
                {errors.slug && (
                  <p className="-mt-2 text-xs text-red-500">{errors.slug}</p>
                )}

                <MultiSelect
                  label="Categories"
                  notOptional
                  name="category"
                  placeholder="Select categories"
                  options={categories}
                  selected={selectedCategoryIds}
                  onChange={(e) => setSelectedCategoryIds(e.target.value)}
                />
                {errors.category && (
                  <p className="-mt-2 text-xs text-red-500">
                    {errors.category}
                  </p>
                )}

                <div>
                  <label className="text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2 block">
                    Brand <span className="text-red-500">*</span>
                  </label>

                  {brandFieldStatus === "no-category" && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Select a category above to see available brands.
                    </p>
                  )}
                  {brandFieldStatus === "loading" && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Loading brands…
                    </p>
                  )}
                  {brandFieldStatus === "error" && (
                    <p className="text-xs text-red-500">{brandsError}</p>
                  )}
                  {brandFieldStatus === "empty" && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                      <IoAlertCircleOutline
                        className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                        size={16}
                      />
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        No brands found for the selected{" "}
                        {selectedCategoryIds.length > 1
                          ? "categories"
                          : "category"}
                        .
                      </p>
                    </div>
                  )}
                  {brandFieldStatus === "ready" && (
                    <Dropdown
                      className="w-full"
                      value={selectedBrand?.name || "Select brand"}
                      options={brandOptions}
                      onChange={(name) =>
                        setSelectedBrand(brands.find((b) => b.name === name))
                      }
                    />
                  )}
                  {errors.brand && brandFieldStatus === "ready" && (
                    <p className="mt-1 text-xs text-red-500">{errors.brand}</p>
                  )}
                </div>

                <InputBox
                  label="Description"
                  multiline
                  rows={4}
                  maxLength={2000}
                  name="description"
                  value={formData.description}
                  onChange={handleField}
                />
                {errors.description && (
                  <p className="-mt-2 text-xs text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <ReadRow label="Product Name" value={product?.title} />
                <ReadRow label="URL slug" value={product?.slug} />
                <ReadRow label="Description" value={product?.description} />
                <ReadRow
                  label="Categories"
                  value={categoryNames.length ? categoryNames.join(", ") : "—"}
                />
                <ReadRow label="Brand" value={brandName} />
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={IoLayersOutline}
            title="Key Features"
            description="Highlight what makes this product stand out."
          >
            {editing ? (
              <FeatureInput
                label="Add a feature"
                placeholder="e.g. Active noise cancellation"
                features={features}
                onAdd={(f) => setFeatures((prev) => [...prev, f])}
                onRemove={(i) =>
                  setFeatures((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ) : product?.features?.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {product.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No features added yet.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <SectionCard
            icon={IoImageOutline}
            title="Product Images"
            description="Remove anything that doesn't belong — add more from the product's edit page."
          >
            {product?.images?.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {product.images.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-violet-100 dark:border-slate-800"
                  >
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      disabled={removingImage === url}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                    >
                      {removingImage === url ? (
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                      ) : (
                        <IoTrashOutline size={12} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No images on this product.
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={IoCubeOutline}
            title="Pricing & Inventory"
            description="Adjust price or stock if something's wrong."
          >
            {editing ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InputBox
                    label="Selling Price"
                    notOptional
                    icon={<span className="text-sm font-semibold">₹</span>}
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleField}
                  />
                  <InputBox
                    label="Cost Price"
                    icon={<span className="text-sm font-semibold">₹</span>}
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleField}
                  />
                  <InputBox
                    label="Discount Price"
                    notOptional
                    icon={<span className="text-sm font-semibold">₹</span>}
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleField}
                  />
                  <InputBox
                    label="Stock Quantity"
                    notOptional
                    type="number"
                    name="stock"
                    icon={<IoCubeOutline size={20} />}
                    value={formData.stock}
                    onChange={handleField}
                  />
                </div>
                {(errors.price || errors.discountPrice || errors.stock) && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.price || errors.discountPrice || errors.stock}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                    />
                    Listed as active
                  </label>
                  {stockPreview && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[stockPreview.tone]}`}
                    >
                      {stockPreview.label}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <ReadRow
                  label="Selling Price"
                  value={`₹${Number(product?.price || 0).toFixed(2)}`}
                />
                <ReadRow
                  label="Discount Price"
                  value={
                    product?.discountPrice != null
                      ? `₹${Number(product.discountPrice).toFixed(2)}`
                      : "—"
                  }
                />
                <ReadRow
                  label="Cost Price"
                  value={
                    product?.costPrice != null
                      ? `₹${Number(product.costPrice).toFixed(2)}`
                      : "—"
                  }
                />
                <ReadRow label="Stock" value={product?.stock} />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  {viewStockPreview && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[viewStockPreview.tone]}`}
                    >
                      {viewStockPreview.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </form>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormData(toFormData(product));
                  setSelectedCategoryIds(toCategoryIds(product));
                  pendingBrandIdRef.current = toBrandId(product);
                  setFeatures(product?.features || []);
                  setEditing(false);
                  setError("");
                  setErrors({});
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-slate-800"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
                <IoCheckmarkCircle size={16} />
              </button>
            </>
          ) : (
            <>
              <span />
              <button
                type="button"
                onClick={onDone}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Looks Good — Back to Products
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ReadRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-right text-zinc-800 dark:text-gray-200">
        {value || "—"}
      </span>
    </div>
  );
}
