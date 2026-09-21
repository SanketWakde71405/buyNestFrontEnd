import React from "react";

// Icons
import { IoGridOutline } from "react-icons/io5";
import { PiHashStraight } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";

// Components
import InputBox from "../../InputBox";

// Constants
const NAME_MAX_LENGTH = 100;
const SLUG_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 300;

function CategoryFormFields({
  nameLabel,
  namePlaceholder,
  name,
  slug,
  description,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  formError,
}) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <InputBox
          label={nameLabel}
          notOptional
          type="text"
          name="name"
          icon={<IoGridOutline size={20} />}
          value={name}
          maxLength={NAME_MAX_LENGTH}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
        />
        <span className="text-xs text-gray-400">
          This will be the official name of the category.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <InputBox
          label="Slug"
          notOptional
          type="text"
          name="slug"
          value={slug}
          icon={<PiHashStraight size={20} />}
          maxLength={SLUG_MAX_LENGTH}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="e.g. running-shoes"
        />
        <span className="text-xs text-gray-400">
          Auto-filled from the name — used in the category's URL. Edit it if you
          need something different.
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <InputBox
          label="Description"
          multiline
          name="description"
          value={description}
          icon={<LuNotepadText size={20} />}
          rows={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter a brief description about the category"
        />
        <span className="text-xs text-gray-400">
          This description will help customers understand the category.
        </span>
      </div>

      {formError && <p className="text-sm text-red-500">{formError}</p>}
    </>
  );
}

export default CategoryFormFields;
