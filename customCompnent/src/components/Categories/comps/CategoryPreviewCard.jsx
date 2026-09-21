import React from "react";
import { IoInformationCircleOutline, IoFolderOutline } from "react-icons/io5";

import SectionHeader from "./SectionHeader";

function AvatarPreview({ name }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 font-semibold text-xl">
      {initial}
    </div>
  );
}

function CategoryPreviewCard({
  isParentSelectMode,
  selectedParent,
  categoryType,
  name,
  parentPath = [],
}) {
  const breadcrumb = parentPath.map((cat) => cat.name).join(" > ");
  return (
    <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader
        icon={<IoInformationCircleOutline size={18} />}
        title="Preview"
        description="How this will look in your category list."
      />
      {isParentSelectMode ? (
        selectedParent ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
            <AvatarPreview name={selectedParent.name} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                {selectedParent.name}
              </span>
              <span className="text-xs text-gray-400">
                {(selectedParent.productCount || 0).toLocaleString()} products
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
            <span className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <IoFolderOutline size={18} />
            </span>
            <span className="text-xs text-gray-400">
              Selection will appear here
            </span>
          </div>
        )
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
          <AvatarPreview name={name} />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
              {name.trim() || "Category name"}
            </span>
            <span className="text-xs text-gray-400">
              {categoryType === "subcategory"
                ? breadcrumb
                  ? `${breadcrumb} > ${name.trim() || "..."}`
                  : "Select a parent category"
                : "Top-level category"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPreviewCard;
