import React, { useState } from "react";

// Icons
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoFolderOutline } from "react-icons/io5";
import { IoPencilOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";

// Services
import CategoryApi from "../../../services/CategoryApi.js";

// Components
import SectionHeader from "../comps/SectionHeader.jsx";
import CategoryFormFields from "../comps/CategoryFormFields.jsx";

// Util functions
import { slugify } from "../../../utils/commonFunctions.js";

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

function DetailField({ label, value }) {
  return (
    <div className="flex flex-col gap-1 bg-white dark:bg-slate-950">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="text-sm text-zinc-700 dark:text-gray-300">{value}</span>
    </div>
  );
}

// Shown right after AddCategoryForm succeeds — either a brand new category
// was created, or an existing one was linked to the store. Lets the user
// double-check what was saved and fix name/slug/description via
// `updateCategory` if something's off. Status and display order are shown
// for reference only; they're not editable from here.
function CategoryReview({
  category,
  categoryType,
  parentPath = [],
  wasExisting,
  onDone,
}) {
  const [current, setCurrent] = useState(category || {});
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(category?.description || "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!current || !current._id) {
    return null;
  }

  const breadcrumb = parentPath.map((cat) => cat.name).join(" > ");

  const headingText = wasExisting
    ? "Category Added"
    : categoryType === "subcategory"
      ? "Subcategory Created"
      : "Category Created";

  const handleNameChange = (value) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSlugChange = (value) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const handleStartEdit = () => {
    setName(current.name || "");
    setSlug(current.slug || "");
    setSlugTouched(false);
    setDescription(current.description || "");
    setFormError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormError(null);
  };

  const handleSaveEdit = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    setFormError(null);

    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }
    if (!trimmedSlug) {
      setFormError("Slug is required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await CategoryApi.updateCategory(current._id, {
        name: trimmedName,
        slug: trimmedSlug,
        description: description.trim(),
      });
      setCurrent((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
    } catch (err) {
      setFormError(err?.message || "Couldn't update the category. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
          <IoCheckmarkCircleOutline size={26} />
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            {headingText}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Review the details below, and fix anything that isn't quite right.
          </span>
        </div>
      </div>

      {/* ── Details card ── */}
      <div className="bg-white dark:bg-slate-950 h-screen mt-5 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <SectionHeader
            icon={<IoFolderOutline size={18} />}
            title="Category Details"
            description="These are the details saved for this category."
          />
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-300 hover:underline shrink-0"
            >
              <IoPencilOutline size={14} />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-5">
            <CategoryFormFields
              nameLabel={
                categoryType === "subcategory"
                  ? "Subcategory Name"
                  : "Category Name"
              }
              namePlaceholder="e.g. Footwear"
              name={name}
              slug={slug}
              description={description}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onDescriptionChange={setDescription}
              formError={formError}
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-sm font-medium text-zinc-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                <IoCloseOutline size={15} />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <IoSaveOutline size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 font-semibold text-lg">
                {current.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                  {current.name}
                </span>
                <span className="text-xs text-gray-400">
                  {categoryType === "subcategory"
                    ? breadcrumb
                      ? `${breadcrumb} > ${current.name}`
                      : current.name
                    : "Top-level category"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DetailField label="Slug" value={current.slug || "—"} />
              <DetailField
                label="Status"
                value={
                  current.status ? <StatusPill status={current.status} /> : "—"
                }
              />
              <DetailField
                label="Display Order"
                value={
                  current.displayOrder === undefined ||
                  current.displayOrder === null
                    ? "Auto-assigned"
                    : current.displayOrder
                }
              />
              <DetailField
                label="Products"
                value={(current.productCount || 0).toLocaleString()}
              />
            </div>

            <DetailField
              label="Description"
              value={current.description?.trim() || "No description provided."}
            />
          </div>
        )}
      </div>

      {/* ── Sticky footer ── */}
      <div className="fixed border-t border-gray-200 bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-end">
        <button
          onClick={onDone}
          disabled={isEditing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default CategoryReview;
