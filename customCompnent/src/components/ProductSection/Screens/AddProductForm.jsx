import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { IoArrowForward } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoImagesOutline } from "react-icons/io5";
import { IoSparklesOutline } from "react-icons/io5";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { IoPricetagOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { LuLink } from "react-icons/lu";
import { LuNotepadText } from "react-icons/lu";

import CategoryApi from "../../../services/CategoryApi.js";
import BrandApi from "../../../services/BrandApi.js";
import ProductApi from "../../../services/ProductApi.js";

// Components
import InputBox from "../../InputBox.jsx";
import Dropdown from "../../Dropdown.jsx";
import MultiSelect from "../../MultiSelect.jsx";
import FeatureInput from "../../FeatureInput.jsx";
import ButtonIcon from "../../ButtonIcon.jsx";
import SectionCard from "../../SectionCard.jsx";

import {
  MIN_ACTIVE_IMAGES,
  MAX_IMAGES,
  LOW_STOCK_THRESHOLD,
  classifyStock,
  toneClasses,
  mergeBrandLists,
  validateProductForm,
  getBrandFieldStatus,
} from "../utils/productStock.js";

import { slugify } from "../../../utils/commonFunctions.js";
const fieldLabelClass =
  "text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2 block";

export default function AddProductForm({ onCreated }) {
  // Hooks
  const navigate = useNavigate();

  // use States
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    fullDescription: "",
    price: "",
    discountPrice: "",
    costPrice: "",
    stock: "",
    isActive: true,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null); // { _id, name }
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle"); // idle | saving | error
  const [submitMessage, setSubmitMessage] = useState("");
  const fileInputRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const parentCategories = await CategoryApi.getCategoriesForStore();
        const subCategoryResponses = await Promise.all(
          (parentCategories || []).map((parent) =>
            CategoryApi.getSubCategories(parent?._id).catch((error) => {
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
        setSelectedBrand((prev) =>
          prev && merged.some((b) => b._id === prev._id) ? prev : null,
        );
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

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  }, []);

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  };

  const addImages = useCallback((fileList) => {
    setImages((prev) => {
      const files = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, Math.max(0, MAX_IMAGES - prev.length));
      const withPreviews = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...withPreviews];
    });
  }, []);

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  };

  const validate = () => {
    const next = validateProductForm(formData, {
      selectedCategoryIds,
      selectedBrand,
      images,
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildProductPayload = () => {
    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description:
        formData.fullDescription.trim() || formData.description.trim(),
      price: Number(formData.price),
      discountPrice: Number(formData.discountPrice),
      stock: Number(formData.stock),
      brand: selectedBrand._id,
      category: selectedCategoryIds,
      features,
      isActive: formData.isActive,
    };

    if (formData.costPrice !== "") {
      payload.costPrice = Number(formData.costPrice);
    }
    return payload;
  };

  const submitProduct = async () => {
    setSubmitState("saving");
    setSubmitMessage("");
    try {
      const created = await ProductApi.addProduct(buildProductPayload());
      const productId = created?._id;

      if (!productId) {
        throw new Error(
          "Product was created but no id came back in the response.",
        );
      }

      let finalProduct = created;

      if (images.length > 0) {
        const imageForm = new FormData();
        imageForm.append("productId", productId);
        images.forEach((img) => imageForm.append("images", img.file));
        const imagesResp = await ProductApi.addProductImages(imageForm);
        finalProduct = imagesResp || finalProduct;
      }

      onCreated(finalProduct);
      setSubmitState("idle");
    } catch (err) {
      setSubmitState("error");
      setSubmitMessage(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Try again.",
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setSubmitState("error");
      setSubmitMessage("Fix the highlighted fields and try again.");
      return;
    }
    submitProduct();
  };

  const stockPreview = classifyStock(formData.stock);
  const brandOptions = brands.map((b) => b.name);

  const brandFieldStatus = getBrandFieldStatus({
    selectedCategoryIds,
    brandsLoading,
    brandsError,
    brands,
  });

  return (
    <>
      {submitMessage && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <IoCloseCircle size={16} />
          {submitMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <SectionCard
            icon={IoDocumentTextOutline}
            title="Product Information"
            description="Basic information about your product."
          >
            <div className="flex flex-col gap-3">
              <InputBox
                label="Product Name"
                notOptional
                name="title"
                icon={<IoPricetagOutline size={20} />}
                placeholder="Enter product name"
                value={formData.title}
                onChange={handleField}
                maxLength={120}
              />
              {errors.title && (
                <p className="-mt-2 text-xs text-red-500">{errors.title}</p>
              )}

              <div>
                <InputBox
                  label="URL slug"
                  notOptional
                  name="slug"
                  icon={<LuLink size={20} />}
                  placeholder="product-slug"
                  onChange={(e) => {
                    setSlugTouched(true);
                    setFormData((prev) => ({
                      ...prev,
                      slug: slugify(e.target.value),
                    }));
                  }}
                  value={formData.slug}
                />
                {errors.slug && (
                  <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
                )}
              </div>

              {/* Categories comes first — Brand is derived from it. */}
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
                <p className="-mt-2 text-xs text-red-500">{errors.category}</p>
              )}
              <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
                You can select multiple categories.
              </p>

              <div>
                <label className={fieldLabelClass}>
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
                    <div className="text-xs text-amber-800 dark:text-amber-300">
                      <p className="font-medium">
                        No brands found for the selected{" "}
                        {selectedCategoryIds.length > 1
                          ? "categories"
                          : "category"}
                        .
                      </p>
                      <p className="mt-0.5">
                        Add a brand for{" "}
                        {selectedCategoryIds.length > 1
                          ? "one of these categories"
                          : "this category"}{" "}
                        before you can add the product.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/brands")}
                        className="mt-2 font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        + Add a brand
                      </button>
                    </div>
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
                label="Short Description"
                notOptional
                multiline
                icon={<LuNotepadText size={20} />}
                rows={2}
                maxLength={500}
                name="description"
                placeholder="Write a short description about your product"
                value={formData.description}
                onChange={handleField}
              />
              {errors.description && (
                <p className="-mt-2 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
              <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
                This will be shown on product listings.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={IoPricetagOutline}
            title="Key Features"
            description="Highlight what makes this product stand out."
          >
            <FeatureInput
              label="Add a feature"
              placeholder="e.g. Active noise cancellation"
              features={features}
              onAdd={(f) => setFeatures((prev) => [...prev, f])}
              onRemove={(i) =>
                setFeatures((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          </SectionCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <SectionCard
            icon={IoImageOutline}
            title="Product Images"
            description="Upload high-quality images of your product."
            action={
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                {images.length} / {MAX_IMAGES} Images
              </span>
            }
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                isDragging
                  ? "border-indigo-400 bg-indigo-50 dark:bg-slate-800"
                  : "border-violet-100 dark:border-slate-800"
              }`}
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                <IoCloudUploadOutline size={22} />
              </span>
              <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                Drag and drop images here
              </p>
              <p className="my-1 text-xs text-gray-400 dark:text-gray-500">
                or
              </p>
              <ButtonIcon
                icon={<IoCloudUploadOutline size={16} />}
                text="Browse Files"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files?.length && addImages(e.target.files)
                }
              />
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                Upload {MIN_ACTIVE_IMAGES} to {MAX_IMAGES} high-quality images.
                First image will be the product cover.
              </p>
            </div>
            {errors.images && (
              <p className="mt-2 text-xs text-red-500">{errors.images}</p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <IoImageOutline className="text-gray-400" size={16} />
                <div className="text-xs">
                  <p className="font-medium text-zinc-700 dark:text-gray-300">
                    JPG, PNG or WebP
                  </p>
                  <p className="text-gray-400 dark:text-gray-500">
                    Max 5MB per image
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IoSparklesOutline className="text-gray-400" size={16} />
                <div className="text-xs">
                  <p className="font-medium text-zinc-700 dark:text-gray-300">
                    Recommended
                  </p>
                  <p className="text-gray-400 dark:text-gray-500">
                    1000 x 1000px
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IoImagesOutline className="text-gray-400" size={16} />
                <div className="text-xs">
                  <p className="font-medium text-zinc-700 dark:text-gray-300">
                    Up to {MAX_IMAGES} images
                  </p>
                  <p className="text-gray-400 dark:text-gray-500">
                    You can reorder later
                  </p>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {images.map((img, index) => (
                  <div
                    key={img.previewUrl}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-violet-100 dark:border-slate-800"
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <IoClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={IoPricetagOutline}
            title="Pricing & Inventory"
            description="Set the price and stock details."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputBox
                label="Selling Price"
                notOptional
                icon={<span className="text-sm font-semibold">₹</span>}
                type="number"
                name="price"
                placeholder="Enter selling price"
                value={formData.price}
                onChange={handleField}
              />
              <InputBox
                label="Cost Price"
                icon={<span className="text-sm font-semibold">₹</span>}
                type="number"
                name="costPrice"
                placeholder="Enter cost price"
                value={formData.costPrice}
                onChange={handleField}
              />
              <div>
                <InputBox
                  label="Discount Price"
                  notOptional
                  icon={<span className="text-sm font-semibold">₹</span>}
                  type="number"
                  name="discountPrice"
                  placeholder="Enter discount price"
                  value={formData.discountPrice}
                  onChange={handleField}
                />
                {errors.discountPrice && (
                  <p className="-mt-1 text-xs text-red-500">
                    {errors.discountPrice}
                  </p>
                )}
              </div>
              <div>
                <InputBox
                  label="Stock Quantity"
                  notOptional
                  type="number"
                  name="stock"
                  icon={<IoCubeOutline size={20} />}
                  placeholder="Enter available stock"
                  value={formData.stock}
                  onChange={handleField}
                />
                <p className="-mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Number of items in stock.
                </p>
              </div>
            </div>
            {(errors.price || errors.stock) && (
              <p className="mt-1 text-xs text-red-500">
                {errors.price || errors.stock}
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
                List as active immediately
              </label>
              {stockPreview && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[stockPreview.tone]}`}
                >
                  {stockPreview.label}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Products with fewer than {LOW_STOCK_THRESHOLD} units, or fewer
              than {MIN_ACTIVE_IMAGES} images, are automatically marked inactive
              regardless of this setting.
            </p>
          </SectionCard>
        </div>
      </form>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitState === "saving"}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitState === "saving" ? "Saving…" : "Save & Continue"}
            <IoArrowForward size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
