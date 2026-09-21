import React from "react";

// Icons
import { IoFolderOutline } from "react-icons/io5";

// Components
import Dropdown from "../../Dropdown";
import SectionHeader from "../comps/SectionHeader";
import CategoryFormFields from "../comps/CategoryFormFields";

const CREATE_HERE_OPTION = "— Create subcategory here —";

// One dropdown "rung" in the parent-chain ladder. Shared by the top-level
// picker (fed by storeParents) and every deeper picker (fed by fetched
// subcategories), so all levels look and behave the same.
function LevelPicker({
  label,
  required,
  options,
  loading,
  emptyText,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {loading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
          Loading categories...
        </div>
      ) : options.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
          {emptyText}
        </div>
      ) : (
        <Dropdown value={value} options={options} onChange={onChange} />
      )}
    </div>
  );
}

function SubCategoryTab({
  storeParents,
  loadingStoreParents,
  parentPath,
  childOptions,
  loadingChild,
  onSelectAtDepth,
  name,
  slug,
  description,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  formError,
}) {
  // Build the ladder of pickers: the top-level pick, then one more rung for
  // every level the user has chosen to drill into. At each rung the user can
  // either stop (the new subcategory is created directly under that pick) or
  // pick one of its own subcategories to go one level deeper.
  const levels = [];

  levels.push(
    <LevelPicker
      key="depth-0"
      label="Parent Category"
      required
      loading={loadingStoreParents}
      options={storeParents.map((cat) => cat.name)}
      emptyText='No parent categories on your store yet. Add one first using the "Parent Category" type above.'
      value={parentPath[0]?.name || "Select a parent category"}
      onChange={(selectedName) => {
        const match = storeParents.find((cat) => cat.name === selectedName);
        if (match) onSelectAtDepth(0, match);
      }}
    />,
  );

  let depth = 1;
  while (parentPath[depth - 1]) {
    const parent = parentPath[depth - 1];
    const options = childOptions[depth - 1];
    const loading = loadingChild[depth - 1];

    if (loading) {
      levels.push(
        <p
          key={`loading-${depth}`}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          Loading subcategories of "{parent.name}"...
        </p>,
      );
      break;
    }

    if (!options || options.length === 0) {
      levels.push(
        <p key={`empty-${depth}`} className="text-xs text-gray-400">
          "{parent.name}" has no subcategories yet — the new subcategory will be
          created directly under it.
        </p>,
      );
      break;
    }

    levels.push(
      <LevelPicker
        key={`depth-${depth}`}
        label={`Go deeper under "${parent.name}"?`}
        options={[CREATE_HERE_OPTION, ...options.map((cat) => cat.name)]}
        loading={false}
        emptyText=""
        value={parentPath[depth]?.name || CREATE_HERE_OPTION}
        onChange={(selectedName) => {
          if (selectedName === CREATE_HERE_OPTION) {
            onSelectAtDepth(depth, null);
            return;
          }
          const match = options.find((cat) => cat.name === selectedName);
          if (match) onSelectAtDepth(depth, match);
        }}
      />,
    );

    // Nothing picked at this rung yet — stop, this is as deep as we can go
    // until the user makes a choice here.
    if (!parentPath[depth]) break;
    depth += 1;
  }

  return (
    <>
      <SectionHeader
        icon={<IoFolderOutline size={18} />}
        title="Category Information"
        description="Basic information about the category."
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Where should this subcategory live?
          </span>
          {levels}
        </div>

        <CategoryFormFields
          nameLabel="Subcategory Name"
          namePlaceholder="e.g. Running Shoes"
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

export default SubCategoryTab;
