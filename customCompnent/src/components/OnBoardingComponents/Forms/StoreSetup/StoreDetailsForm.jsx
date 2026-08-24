import React from "react";

// Icons
import { IoStorefrontOutline } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";

// Components
import InputBox from "../../../InputBox";
import MultiSelect from "../../../MultiSelect";

function StoreDetailsForm({ formData, handleChange, options, onNext }) {
  const isFormValid =
    formData.storeName.trim() !== "" &&
    formData.description.trim() !== "" &&
    formData.categories.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    console.log("Form data", formData);
    onNext();
  };

  return (
    <div className="flex flex-col justify-center w-full px-2 sm:px-4 py-1">
      {/* Heading and subtitle */}
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-zinc-800 dark:text-gray-200 text-center text-xl font-bold">
          Add your Store
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-center font-medium text-sm">
          Let's start by adding your store details.
        </span>
      </div>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <InputBox
          name="storeName"
          label="Store Name"
          notOptional
          placeholder="Enter your store name"
          type="text"
          value={formData.storeName}
          onChange={handleChange}
          icon={<IoStorefrontOutline size={20} />}
        />

        <InputBox
          name="description"
          label="Description"
          type="text"
          notOptional
          value={formData.description}
          onChange={handleChange}
          multiline
          icon={<LuNotepadText size={20} />}
          placeholder="Describe your store in few words..."
          maxLength="150"
        />

        <MultiSelect
          name="categories"
          label="Store Category"
          placeholder="Select your store categories"
          notOptional
          options={options} // array of {_id, name, ...} from CategoryApi
          selected={formData.categories} // array of _id strings
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={!isFormValid}
          className="text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 flex gap-2 w-full justify-center items-center font-medium my-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <IoIosArrowRoundForward size={20} />
        </button>
      </form>

      <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        You can update these details anytime from settings.
      </span>
    </div>
  );
}

export default StoreDetailsForm;
