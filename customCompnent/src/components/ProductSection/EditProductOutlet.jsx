import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoImageOutline } from "react-icons/io5";
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import { IoPricetagOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";
import { IoFlagOutline } from "react-icons/io5";
import { IoReorderThreeOutline } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { LuNotepadText } from "react-icons/lu";
import { LuLink } from "react-icons/lu";

// Services
import CategoryApi from "../../services/CategoryApi.js";
import BrandApi from "../../services/BrandApi.js";
import ProductApi from "../../services/ProductApi.js";

// Components
import InputBox from "../InputBox.jsx";
import Dropdown from "../Dropdown.jsx";
import MultiSelect from "../MultiSelect.jsx";
import FeatureInput from "../FeatureInput.jsx";
import SectionCard from "../SectionCard.jsx";
import DeleteProductModal from "./Modal/DeleteProductModal.jsx";

// Product stock
import {
  MIN_ACTIVE_IMAGES,
  MAX_IMAGES,
  LOW_STOCK_THRESHOLD,
  classifyStock,
  toneClasses,
  mergeBrandLists,
  validateProductForm,
  getBrandFieldStatus,
} from "./utils/productStock.js";

import { slugify, collectCategoriesRecursively } from "../../utils/commonFunctions.js";

export default function EditProductOutlet() {
  // Hooks and params
  const navigate = useNavigate();
  const { productId } = useParams();

  // use States
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    costPrice: "",
    stock: "",
    isActive: true,
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null); // { _id, name }
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const pendingBrandIdRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]); // string URLs, straight from the product record
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [removingImageUrl, setRemovingImageUrl] = useState(null);
  const [imageActionError, setImageActionError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState("idle"); // idle | saving | success | error
  const [submitMessage, setSubmitMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef(null);

  // Use Effects
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const product = await ProductApi.getProductById(productId);
        if (cancelled) return;
        if (!product) throw new Error("Product not found.");

        setFormData({
          title: product.title || "",
          slug: product.slug || "",
          description: product.description || "",
          price: product.price ?? "",
          discountPrice: product.discountPrice ?? "",
          costPrice: product.costPrice ?? "",
          stock: product.stock ?? "",
          isActive: product.isActive ?? true,
        });

        const categoryIds = (product.category || []).map((c) =>
          typeof c === "string" ? c : c._id,
        );
        setSelectedCategoryIds(categoryIds);
        pendingBrandIdRef.current =
          typeof product.brand === "string"
            ? product.brand
            : product.brand?._id || null;

        setFeatures(product.features || []);
        setImages(product.images || []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load product.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const parentCategories = await CategoryApi.getCategoriesForStore();

        const allCategories =
          await collectCategoriesRecursively(parentCategories);

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

  const handleField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImages = useCallback(
    async (fileList) => {
      const files = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, Math.max(0, MAX_IMAGES - images.length));
      if (files.length === 0) return;

      setUploadingImages(true);
      setImageActionError("");
      try {
        const form = new FormData();
        form.append("productId", productId);
        files.forEach((f) => form.append("images", f));
        const updated = await ProductApi.addProductImages(form);
        setImages(updated?.images || images);
      } catch (err) {
        setImageActionError(
          err.response?.data?.message ||
            err.message ||
            "Failed to upload images.",
        );
      } finally {
        setUploadingImages(false);
      }
    },
    [images, productId],
  );

  const handleRemoveImage = async (url) => {
    setRemovingImageUrl(url);
    setImageActionError("");
    try {
      const updated = await ProductApi.deleteProductImage(productId, url);
      setImages(updated?.images || images.filter((i) => i !== url));
    } catch (err) {
      setImageActionError(
        err.response?.data?.message || err.message || "Failed to remove image.",
      );
    } finally {
      setRemovingImageUrl(null);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleAddImages(e.dataTransfer.files);
  };

  const validate = () => {
    const next = validateProductForm(formData, {
      selectedCategoryIds,
      selectedBrand,
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildUpdatePayload = () => ({
    productId,
    title: formData.title.trim(),
    slug: formData.slug.trim(),
    description: formData.description.trim(),
    price: Number(formData.price),
    discountPrice: Number(formData.discountPrice),
    costPrice:
      formData.costPrice !== "" ? Number(formData.costPrice) : undefined,
    stock: Number(formData.stock),
    isActive: formData.isActive,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setSubmitState("error");
      setSubmitMessage("Fix the highlighted fields and try again.");
      return;
    }

    setSubmitState("saving");
    setSubmitMessage("");
    try {
      await Promise.all([
        ProductApi.updateProduct(buildUpdatePayload()),
        ProductApi.updateFeatures({ productId, featuresArray: features }),
        ProductApi.updateProductCategories({
          productId,
          categoryIds: selectedCategoryIds,
        }),
        ProductApi.updateProductBrand({
          productId,
          brandId: selectedBrand._id,
        }),
      ]);
      setSubmitState("success");
      setSubmitMessage("Changes saved.");
    } catch (err) {
      setSubmitState("error");
      setSubmitMessage(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Try again.",
      );
    }
  };

  const stockPreview = classifyStock(formData.stock);
  const brandOptions = brands.map((b) => b.name);
  const brandFieldStatus = getBrandFieldStatus({
    selectedCategoryIds,
    brandsLoading,
    brandsError,
    brands,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading product…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-red-500">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 dark:border-slate-800 dark:text-gray-300"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
          >
            <IoArrowBack size={16} /> Back to Products
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-slate-800"
            >
              <IoTrashOutline size={16} />
              Delete Product
            </button>
            <button
              type="button"
              onClick={() => navigate(`/products/view/${productId}`)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
            >
              <IoEyeOutline size={16} /> Product Details
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
            >
              <IoOpenOutline size={16} /> View on Storefront
            </button>
            <button
              type="submit"
              form="edit-product-form"
              disabled={submitState === "saving"}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              <IoSaveOutline size={16} />
              {submitState === "saving" ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoCreateOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              Edit Product
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your product information and click Save Changes.
            </p>
          </div>
        </div>

        {submitMessage && (
          <div
            className={`mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
              submitState === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {submitState === "success" ? (
              <IoCheckmarkCircle size={16} />
            ) : (
              <IoCloseCircle size={16} />
            )}
            {submitMessage}
          </div>
        )}

        <form
          id="edit-product-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <SectionCard
              icon={IoDocumentTextOutline}
              title="Product Information"
              description="Update the basic information about your product."
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
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: slugify(e.target.value),
                      }))
                    }
                  />
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
                  )}
                </div>

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
                <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
                  You can select multiple categories.
                </p>

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
                  label="Short Description"
                  notOptional
                  multiline
                  rows={10}
                  icon={<LuNotepadText size={20} />}
                  maxLength={1000}
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
              description="Manage your product images."
              action={
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  {images.length} / {MAX_IMAGES} Images
                </span>
              }
            >
              {images.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {images.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-violet-100 dark:border-slate-800"
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-1 top-1 flex h-5 w-5 cursor-not-allowed items-center justify-center rounded bg-black/50 text-white/70">
                        <IoReorderThreeOutline size={12} />
                      </span>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        disabled={removingImageUrl === url}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                      >
                        <IoClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50 dark:bg-slate-800"
                    : "border-violet-100 dark:border-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages || images.length >= MAX_IMAGES}
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400"
                >
                  <IoCloudUploadOutline size={16} />
                  {uploadingImages ? "Uploading…" : "Upload New Images"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.length && handleAddImages(e.target.files)
                  }
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  JPG, PNG or WebP • Max 5MB per image • Recommended 1000x1000px
                </p>
              </div>
              {imageActionError && (
                <p className="mt-2 text-xs text-red-500">{imageActionError}</p>
              )}
              {images.length < MIN_ACTIVE_IMAGES && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <IoAlertCircleOutline size={14} />
                  Fewer than {MIN_ACTIVE_IMAGES} images — this product will show
                  as inactive until more are added.
                </p>
              )}
            </SectionCard>

            <SectionCard
              icon={IoCubeOutline}
              title="Pricing & Inventory"
              description="Update pricing and stock information."
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
            </SectionCard>

            <SectionCard
              icon={IoFlagOutline}
              title="Product Status"
              description="Update the status of your product."
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label className="text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2 block">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    value={formData.isActive ? "Active" : "Inactive"}
                    options={["Active", "Inactive"]}
                    onChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: val === "Active",
                      }))
                    }
                  />
                </div>
                {stockPreview && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[stockPreview.tone]}`}
                  >
                    {stockPreview.label}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                Inactive products will not be visible to customers. Products
                with fewer than {LOW_STOCK_THRESHOLD} units, or fewer than{" "}
                {MIN_ACTIVE_IMAGES} images, are automatically marked inactive
                regardless of this setting.
              </p>
            </SectionCard>
          </div>
        </form>
      </div>

      {showDeleteModal && (
        <DeleteProductModal
          product={{ _id: productId, title: formData.title }}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
