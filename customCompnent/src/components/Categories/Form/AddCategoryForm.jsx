import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { IoGridOutline } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import { IoLinkOutline } from "react-icons/io5";
import { IoSaveOutline } from "react-icons/io5";
import { HiOutlineViewGrid } from "react-icons/hi";

// Services
import CategoryApi from "../../../services/CategoryApi.js";
import StoreApi from "../../../services/StoreApi.js";

// Components
import SectionHeader from "../comps/SectionHeader.jsx";
import CategoryPreviewCard from "../comps/CategoryPreviewCard.jsx";

// Tabs
import ParentCategoryTab from "../Tab/ParentCategoryTab.jsx";
import SubCategoryTab from "../Tab/SubCategoryTab.jsx";

// Util functions
import { slugify } from "../../../utils/commonFunctions.js";

// Constants
const NO_CATEGORIES_MESSAGE = "No categories found for this store.";

const CATEGORY_TYPES = [
  {
    id: "parent",
    icon: IoLinkOutline,
    title: "Parent Category",
    description: "Search for an existing category, or create a new one.",
  },
  {
    id: "subcategory",
    icon: IoLayersOutline,
    title: "New Subcategory",
    description: "Nest a new category under one already on your store.",
  },
];

// Owns the whole "add a category" flow — picking or creating a parent
// category, or nesting a new subcategory under one already on the store.
// Doesn't navigate away on success; instead it calls `onCategoryCreated`
// with what was created/linked so the caller (AddCategoryOutlet) can move
// on to the review step.
function AddCategoryForm({ onCategoryCreated }) {
  const navigate = useNavigate();

  const [categoryType, setCategoryType] = useState("parent");
  const [parentMode, setParentMode] = useState("select");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [storeParents, setStoreParents] = useState([]);
  const [parentPath, setParentPath] = useState([]); // chain of selected categories, root → deepest
  const [childOptions, setChildOptions] = useState([]); // childOptions[i] = subcategories of parentPath[i]
  const [loadingChild, setLoadingChild] = useState([]); // loadingChild[i] = true while fetching childOptions[i]
  const [loadingStoreParents, setLoadingStoreParents] = useState(false);
  const [search, setSearch] = useState("");
  const [unassignedParents, setUnassignedParents] = useState([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const resetFormState = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setDisplayOrder("");
    setFormError(null);
    setParentPath([]);
    setChildOptions([]);
    setLoadingChild([]);
    setSelectedParent(null);
    setParentMode("select");
    setSearch("");
  };

  const handleTypeChange = (nextType) => {
    if (nextType === categoryType) return;
    setCategoryType(nextType);
    resetFormState();
  };

  const handleParentModeChange = (nextMode) => {
    if (nextMode === parentMode) return;
    setParentMode(nextMode);
    setFormError(null);
  };

  const handleNameChange = (value) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const loadStoreParents = useCallback(async () => {
    setLoadingStoreParents(true);
    try {
      const stored = await CategoryApi.getCategoriesForStore();
      setStoreParents((stored || []).filter((cat) => !cat.parentCategoryName));
    } catch (err) {
      if (err?.message === NO_CATEGORIES_MESSAGE) {
        // Store has no categories yet — not an error, just nothing to pick.
        setStoreParents([]);
      } else {
        setFormError("Couldn't load your store's parent categories.");
      }
    } finally {
      setLoadingStoreParents(false);
    }
  }, []);

  const loadUnassignedParents = useCallback(async () => {
    setLoadingUnassigned(true);
    setFormError(null);
    try {
      const allParents = await CategoryApi.getParentCategories();

      let storeCategories = [];
      try {
        storeCategories = await CategoryApi.getCategoriesForStore();
      } catch (err) {
        if (err?.message === NO_CATEGORIES_MESSAGE) {
          // Store has no categories yet — every parent category counts as
          // "unassigned" in that case, not an error.
          storeCategories = [];
        } else {
          throw err;
        }
      }

      const storeIds = new Set(
        (storeCategories || []).map((cat) => cat._id).filter(Boolean),
      );
      setUnassignedParents(
        (allParents || []).filter((cat) => !storeIds.has(cat._id)),
      );
    } catch (err) {
      setFormError("Couldn't load categories available to add.");
    } finally {
      setLoadingUnassigned(false);
    }
  }, []);

  // Selecting a category at `depth` sets it as the chain's target at that
  // level, discards any deeper selections that no longer apply, and fetches
  // its own subcategories so the user can choose to drill one level deeper
  // or leave it as-is (the new subcategory is created under this selection).
  // Passing `category` as null clears this depth and everything below it.
  const handleSelectAtDepth = useCallback(async (depth, category) => {
    if (!category) {
      setParentPath((prev) => prev.slice(0, depth));
      setChildOptions((prev) => prev.slice(0, depth));
      setLoadingChild((prev) => prev.slice(0, depth));
      return;
    }

    setParentPath((prev) => [...prev.slice(0, depth), category]);
    setChildOptions((prev) => prev.slice(0, depth));
    setLoadingChild((prev) => {
      const next = prev.slice(0, depth);
      next[depth] = true;
      return next;
    });

    let subCategories = [];
    try {
      subCategories = await CategoryApi.getSubCategories(category?._id);
    } catch (err) {
      subCategories = [];
    }

    setChildOptions((prev) => {
      const next = prev.slice(0, depth);
      next[depth] = subCategories || [];
      return next;
    });
    setLoadingChild((prev) => {
      const next = prev.slice(0, depth);
      next[depth] = false;
      return next;
    });
  }, []);

  useEffect(() => {
    if (categoryType === "subcategory") loadStoreParents();
    if (categoryType === "parent" && parentMode === "select") {
      loadUnassignedParents();
    }
  }, [categoryType, parentMode, loadStoreParents, loadUnassignedParents]);

  const filteredUnassignedParents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return unassignedParents;
    return unassignedParents.filter((cat) =>
      (cat.name || "").toLowerCase().includes(term),
    );
  }, [search, unassignedParents]);

  const isParentSelectMode =
    categoryType === "parent" && parentMode === "select";

  const handleCancel = () => navigate(-1);

  const handleAddExistingToStore = async () => {
    if (!selectedParent) {
      setFormError("Pick a category to add first.");
      return;
    }
    setAssigning(true);
    setFormError(null);
    try {
      await StoreApi.addCategoriesToStore([selectedParent._id]);
      onCategoryCreated({
        category: selectedParent,
        categoryType: "parent",
        parentPath: [],
        wasExisting: true,
      });
    } catch (err) {
      setFormError(err?.message || "Couldn't add that category to your store.");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateSubmit = async () => {
    setFormError(null);
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const parentCategoryId = parentPath.length
      ? parentPath[parentPath.length - 1]._id
      : "";

    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }
    if (!trimmedSlug) {
      setFormError("Slug is required.");
      return;
    }
    if (categoryType === "subcategory" && !parentCategoryId) {
      setFormError("Choose a parent category for this subcategory.");
      return;
    }

    const payload = { name: trimmedName, slug: trimmedSlug };
    if (categoryType === "subcategory") {
      payload.parentCategory = parentCategoryId;
    }
    if (description.trim()) payload.description = description.trim();
    if (displayOrder !== "") payload.displayOrder = Number(displayOrder);

    setSubmitting(true);
    try {
      const created = await CategoryApi.createCategory(payload);
      if (categoryType === "parent" && created?._id) {
        await StoreApi.addCategoriesToStore([created._id]);
      }

      onCategoryCreated({
        category: created,
        categoryType,
        parentPath: categoryType === "subcategory" ? parentPath : [],
        wasExisting: false,
      });
    } catch (err) {
      setFormError(err?.message || "Couldn't create the category. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimarySubmit = isParentSelectMode
    ? handleAddExistingToStore
    : handleCreateSubmit;
  const primaryDisabled = isParentSelectMode
    ? assigning || !selectedParent
    : submitting;
  const primaryLabel = isParentSelectMode
    ? assigning
      ? "Adding..."
      : "Add to Store"
    : submitting
      ? "Saving..."
      : "Save Category";

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300">
          <IoGridOutline size={26} />
        </div>
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            Add New Category
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Enter category details to add a new category to your store.
          </span>
        </div>
      </div>

      {/* ── Category Type ── */}
      <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader
          icon={<HiOutlineViewGrid size={18} />}
          title="Category Type"
          description="Choose how you'd like to add this category."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = categoryType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`flex flex-col gap-2 items-start text-left p-4 rounded-xl border transition-colors ${
                  isSelected
                    ? "border-violet-300 bg-violet-50 dark:bg-indigo-950 dark:border-violet-700"
                    : "border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <Icon size={16} />
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                  {type.title}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {type.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: category-type-specific tab */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-6">
          {categoryType === "parent" ? (
            <ParentCategoryTab
              parentMode={parentMode}
              onParentModeChange={handleParentModeChange}
              search={search}
              onSearchChange={setSearch}
              filteredUnassignedParents={filteredUnassignedParents}
              loadingUnassigned={loadingUnassigned}
              selectedParent={selectedParent}
              onSelectParent={setSelectedParent}
              name={name}
              slug={slug}
              description={description}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onDescriptionChange={setDescription}
              formError={formError}
            />
          ) : (
            <SubCategoryTab
              storeParents={storeParents}
              loadingStoreParents={loadingStoreParents}
              parentPath={parentPath}
              childOptions={childOptions}
              loadingChild={loadingChild}
              onSelectAtDepth={handleSelectAtDepth}
              name={name}
              slug={slug}
              description={description}
              onNameChange={handleNameChange}
              onSlugChange={handleSlugChange}
              onDescriptionChange={setDescription}
              formError={formError}
            />
          )}
        </div>

        {/* Right column: preview + additional info */}
        <div className="flex flex-col gap-5">
          <CategoryPreviewCard
            isParentSelectMode={isParentSelectMode}
            selectedParent={selectedParent}
            categoryType={categoryType}
            name={name}
            parentPath={parentPath}
          />
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="fixed border-t border-gray-200 bottom-0 left-0 right-0  bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-sm font-medium text-zinc-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePrimarySubmit}
          disabled={primaryDisabled}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IoSaveOutline size={16} />
          {primaryLabel}
        </button>
      </div>
    </>
  );
}

export default AddCategoryForm;
