import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";
import { IoCopyOutline } from "react-icons/io5";
import { IoGridOutline } from "react-icons/io5";
import { PiHashStraight } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";

// Components
import InputBox from "../InputBox";
import Dropdown from "../Dropdown";

// Services
import CategoryApi from "../../services/CategoryApi.js";

import { formatDate, collectCategoriesRecursively } from "../../utils/commonFunctions.js";

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;
const NO_PARENT_LABEL = "No parent (top-level category)";

// CategoryApi methods return the raw ApiResponse envelope
// ({ statusCode, data, message }) unless an axios interceptor has already
// unwrapped it upstream. Handle both shapes defensively.
const unwrapData = (result) =>
  result && typeof result === "object" && "data" in result
    ? result.data
    : result;


function CategoryAvatar({ name, size = "md" }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const dimensions = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${dimensions} rounded-lg flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 font-semibold`}
    >
      {initial}
    </div>
  );
}

function StatusPill({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-red-50 text-red-500 border border-red-100"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function EditCategoryOutlet() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [subCategoryCount, setSubCategoryCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentCategory: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [categoryRes, storeParentsRes, subCategoriesRes, brandsRes] =
        await Promise.all([
          CategoryApi.getCategoryById(categoryId),
          CategoryApi.getCategoriesForStore(),
          CategoryApi.getSubCategories(categoryId).catch(() => []),
          CategoryApi.getBrandsForCategory(categoryId).catch(() => 0),
        ]);

      const loadedCategory = unwrapData(categoryRes);
      const storeParentCategories = unwrapData(storeParentsRes) || [];
      const loadedCategories = await collectCategoriesRecursively(
        Array.isArray(storeParentCategories) ? storeParentCategories : [],
      );
      const loadedSubCategories = unwrapData(subCategoriesRes) || [];
      const loadedBrandCount = unwrapData(brandsRes) ?? 0;

      if (!loadedCategory) {
        throw new Error("Category not found");
      }

      setCategory(loadedCategory);
      setAllCategories(Array.isArray(loadedCategories) ? loadedCategories : []);
      setSubCategoryCount(
        Array.isArray(loadedSubCategories) ? loadedSubCategories.length : 0,
      );
      setBrandCount(
        typeof loadedBrandCount === "number" ? loadedBrandCount : 0,
      );

      setFormData({
        name: loadedCategory.name || "",
        slug: loadedCategory.slug || "",
        description: loadedCategory.description || "",
        parentCategory: loadedCategory.parentCategory
          ? loadedCategory.parentCategory.toString?.() ||
            loadedCategory.parentCategory
          : "",
      });
    } catch (err) {
      console.error("Failed to load category", err);
      setLoadError(err?.message || "Failed to load category details");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const parentOptions = useMemo(
    () => allCategories.filter((cat) => cat._id !== categoryId),
    [allCategories, categoryId],
  );

  const selectedParent = useMemo(
    () =>
      formData.parentCategory
        ? allCategories.find((cat) => cat._id === formData.parentCategory)
        : null,
    [allCategories, formData.parentCategory],
  );

  const parentDropdownOptions = useMemo(
    () => [NO_PARENT_LABEL, ...parentOptions.map((opt) => opt.name)],
    [parentOptions],
  );

  const handleFieldChange = (field) => (e) => {
    setSaveSuccess(false);
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleParentSelect = (name) => {
    setSaveSuccess(false);
    if (name === NO_PARENT_LABEL) {
      setFormData((prev) => ({ ...prev, parentCategory: "" }));
      return;
    }
    const match = parentOptions.find((opt) => opt.name === name);
    setFormData((prev) => ({
      ...prev,
      parentCategory: match ? match._id : prev.parentCategory,
    }));
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(categoryId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy category ID", err);
    }
  };

  const handleSave = async () => {
    if (!category) return;

    const trimmedName = formData.name.trim();
    const trimmedSlug = formData.slug.trim();

    if (!trimmedName || !trimmedSlug) {
      setSaveError("Name and slug cannot be empty.");
      return;
    }

    const payload = {};

    if (trimmedName !== category.name) payload.name = trimmedName;
    if (trimmedSlug !== category.slug) payload.slug = trimmedSlug;
    if (formData.description.trim() !== (category.description || "")) {
      payload.description = formData.description.trim();
    }

    const originalParentId = category.parentCategory
      ? category.parentCategory.toString?.() || category.parentCategory
      : "";
    if (formData.parentCategory !== originalParentId) {
      payload.parentCategory = formData.parentCategory || null;
    }

    if (Object.keys(payload).length === 0) {
      setSaveSuccess(true);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await CategoryApi.updateCategory(categoryId, payload);
      const updated = unwrapData(response);
      setCategory(updated);
      setFormData({
        name: updated.name || "",
        slug: updated.slug || "",
        description: updated.description || "",
        parentCategory: updated.parentCategory
          ? updated.parentCategory.toString?.() || updated.parentCategory
          : "",
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error("Failed to update category", err);
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-24 text-gray-500 dark:text-gray-400 text-sm">
        Loading category...
      </div>
    );
  }

  if (loadError || !category) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-24">
        <IoAlertCircleOutline className="text-red-400" size={32} />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {loadError || "Category not found."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-800 text-zinc-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  const breadcrumbParent = selectedParent?.name || category.parentCategoryName;

  return (
    <div className="w-full bg-white dark:bg-slate-950 flex flex-col gap-5 px-6 py-4">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-indigo-900 transition-colors shrink-0"
          >
            <IoArrowBack size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
              Edit Category
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Home &gt; Categories &gt; Edit Category
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/category/${categoryId}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-800 text-zinc-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
          >
            <IoOpenOutline size={15} />
            View Category
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            <IoSaveOutline size={15} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
          <IoAlertCircleOutline size={16} className="shrink-0" />
          {saveError}
        </div>
      )}
      {saveSuccess && !saveError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-sm">
          <IoCheckmarkOutline size={16} className="shrink-0" />
          Category updated successfully.
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left column: Basic Information */}
        <div className="flex-1 min-w-0 w-full bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-semibold text-zinc-800 dark:text-gray-200">
              Basic Information
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update the basic details of this category.
            </p>
          </div>

          {/* Name */}
          <InputBox
            label="Category Name"
            notOptional
            value={formData.name}
            icon={<IoGridOutline size={20} />}
            maxLength={NAME_MAX_LENGTH}
            onChange={handleFieldChange("name")}
            placeholder="Enter category name"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
            Enter a clear and descriptive name for this category.
          </p>

          {/* Slug */}
          <InputBox
            label="Slug"
            notOptional
            value={formData.slug}
            icon={<PiHashStraight size={20} />}
            onChange={handleFieldChange("slug")}
            placeholder="mobiles-tablets"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
            A unique slug for the category. Example: mobiles-tablets
          </p>

          {/* Parent Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-gray-300">
              Parent Category
            </label>
            <Dropdown
              value={selectedParent?.name || NO_PARENT_LABEL}
              options={parentDropdownOptions}
              onChange={handleParentSelect}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select the parent category (choose "{NO_PARENT_LABEL}" if this is
              a top-level category).
            </p>
          </div>

          {/* Description */}
          <InputBox
            label="Description"
            multiline
            rows={3}
            icon={<LuNotepadText size={20} />}
            value={formData.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={handleFieldChange("description")}
            placeholder="Provide a short description for this category"
          />

          {/* Status + Display Order (read-only, backend-managed) */}
          <div className="flex flex-row gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                Status
              </label>
              <div className="px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 flex items-center">
                <StatusPill status={category.status} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Set automatically based on whether products are assigned.
              </p>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-gray-300">
                Display Order
              </label>
              <div className="px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 text-sm text-zinc-700 dark:text-gray-300">
                {category.displayOrder ?? 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag categories in the tree to reorder.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Preview + Info */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4">
          {/* Preview */}
          <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-zinc-800 dark:text-gray-200">
              Category Preview
            </h2>
            <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/60 p-4 flex gap-3">
              <CategoryAvatar name={formData.name} size="lg" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-800 dark:text-gray-200 truncate">
                    {formData.name || "Untitled category"}
                  </span>
                  <StatusPill status={category.status} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {breadcrumbParent
                    ? `${breadcrumbParent} > ${formData.name}`
                    : formData.name}
                </span>
                {formData.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-zinc-800 dark:text-gray-200">
              Category Information
            </h2>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Category ID
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-700 dark:text-gray-300 truncate font-mono text-xs">
                    {categoryId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded text-gray-400 hover:text-violet-600 hover:bg-gray-100 dark:hover:bg-slate-800 shrink-0"
                  >
                    {copied ? (
                      <IoCheckmarkOutline size={13} />
                    ) : (
                      <IoCopyOutline size={13} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Created On
                </span>
                <span className="text-zinc-700 dark:text-gray-300">
                  {formatDate(category.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Updated On
                </span>
                <span className="text-zinc-700 dark:text-gray-300">
                  {formatDate(category.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Products
                </span>
                <span className="text-zinc-700 dark:text-gray-300">
                  {(category.productCount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Brands
                </span>
                <span className="text-zinc-700 dark:text-gray-300">
                  {brandCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Total Sub-categories
                </span>
                <span className="text-zinc-700 dark:text-gray-300">
                  {subCategoryCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Note ── */}
      <div className="flex items-start gap-2.5 px-5 py-4 rounded-2xl bg-violet-50 dark:bg-indigo-950/30 border border-violet-100 dark:border-indigo-900/50">
        <IoInformationCircleOutline
          className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5"
          size={18}
        />
        <div>
          <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
            Note
          </p>
          <p className="text-sm text-violet-600/80 dark:text-violet-400/80 mt-0.5">
            Changes to this category will not affect products already assigned
            to it.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EditCategoryOutlet;
