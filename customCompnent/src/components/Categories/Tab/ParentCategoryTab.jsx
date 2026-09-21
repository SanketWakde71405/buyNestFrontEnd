import React from "react";

// Icons
import { IoLinkOutline } from "react-icons/io5";
import { IoFolderOutline } from "react-icons/io5";
import { IoAddOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";

// Components
import SearchBar from "../../SearchBar";
import SectionHeader from "../comps/SectionHeader";
import CategoryFormFields from "../comps/CategoryFormFields";

function ParentCategoryTab({
  parentMode,
  onParentModeChange,
  search,
  onSearchChange,
  filteredUnassignedParents,
  loadingUnassigned,
  selectedParent,
  onSelectParent,
  name,
  slug,
  description,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  formError,
}) {
  if (parentMode === "select") {
    return (
      <>
        <SectionHeader
          icon={<IoLinkOutline size={18} />}
          title="Find a Category"
          description="Categories that exist in the database but aren't linked to your store yet."
        />
        <div className="flex flex-col gap-4">
          <SearchBar
            search={search}
            setSearch={onSearchChange}
            placeholder="Search parent categories..."
          />

          <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 -mx-1 px-1">
            {loadingUnassigned ? (
              <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                Loading categories...
              </div>
            ) : filteredUnassignedParents.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
                No unassigned categories match your search.
              </div>
            ) : (
              filteredUnassignedParents.map((cat) => {
                const isSelected = selectedParent?._id === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => onSelectParent(cat)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? "border-violet-300 bg-violet-50 dark:bg-indigo-950 dark:border-violet-700"
                        : "border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300">
                      <IoFolderOutline size={16} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-zinc-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {(cat.productCount || 0).toLocaleString()} products
                      </span>
                    </span>
                    {isSelected && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-300">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => onParentModeChange("create")}
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-300 hover:underline py-1"
          >
            <IoAddOutline size={15} />
            Can't find it? Create a new category
          </button>

          {formError && <p className="text-sm text-red-500">{formError}</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        icon={<IoFolderOutline size={18} />}
        title="Category Information"
        description="Basic information about the category."
      />
      <div className="flex flex-col gap-5">
        <button
          onClick={() => onParentModeChange("select")}
          className="self-start flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-300 hover:underline"
        >
          <IoSearchOutline size={14} />
          Search existing categories instead
        </button>

        <CategoryFormFields
          nameLabel="Category Name"
          namePlaceholder="e.g. Footwear"
          name={name}
          slug={slug}
          description={description}
          onNameChange={onNameChange}
          onSlugChange={onSlugChange}
          onDescriptionChange={onDescriptionChange}
          formError={formError}
        />
      </div>
    </>
  );
}

export default ParentCategoryTab;
