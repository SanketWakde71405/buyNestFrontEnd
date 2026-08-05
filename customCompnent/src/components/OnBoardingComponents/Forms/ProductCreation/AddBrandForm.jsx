import React, { useState } from "react";

// Components
import CategorySelector from "../../../CategorySelector";
import BrandSelector from "../../../BrandSelector";
import InputBox from "../../../InputBox";

// Icons
import { IoStorefrontOutline } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import { LuNotepadText } from "react-icons/lu";
import { IoIosArrowRoundForward } from "react-icons/io";

// Services
import BrandApi from "../../../../services/BrandApi";

const initialBrandData = {
  name: "",
  slug: "",
  categories: [],
  description: "",
};

// Step 1 of the product onboarding wizard: pick a category, pick an existing
// brand (or create a new one). Owns all of its own category/brand state;
// the only thing it reports upward is the final brand selection, via
// onBrandSelected, so the parent wizard can decide which step to show next.
//
// onBrandSelected: ({ brand, isNewBrand, skipLogoStep }) => void
function AddBrandForm({ onBrandSelected, onNewBrandCreation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryChain, setSelectedCategoryChain] = useState([]);
  const [brandCreationForm, setBrandCreationForm] = useState(false);
  const [brandData, setBrandData] = useState(initialBrandData);
  const [error, setError] = useState("");

  const handleCategoryChange = (category, chain) => {
    setSelectedCategory(category);
    setSelectedCategoryChain(chain || []);
  };

  const handleBrandCreationForm = ({ name } = {}) => {
    setBrandData((prev) => ({
      ...prev,
      // Pre-fill with whatever the user had already typed into the brand search bar.
      name: name ?? prev.name,
      // All parent categories and subcategories selected so far, not just the leaf.
      categories: selectedCategoryChain.length
        ? selectedCategoryChain
        : prev.categories,
    }));

    setBrandCreationForm(true);
  };

  const createBrand = async () => {
    try {
      const apiResponse = await BrandApi.createBrand(brandData);
      const brand = apiResponse?.data || apiResponse;
      onNewBrandCreation?.(brand);
    } catch (err) {
      console.error("Failed to create a new brand", err);
      setError(err);
    }
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setBrandData((prev) => {
      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });

    if (error) {
      setError("");
    }
  };

  const handleBrandSelect = ({ brand, isNewBrand, skipLogoStep }) => {
    onBrandSelected?.({ brand, isNewBrand, skipLogoStep });
  };

  return (
    <div className="flex flex-col items-stretch my-3 flex-1 min-w-0">
      <div className="flex flex-col gap-1 my-2 w-full">
        <span className="text-zinc-800 text-start font-semibold text-lg dark:text-gray-200">
          Add Brand Details
        </span>
        <span className="text-gray-500 dark:text-gray-400 w-full font-medium text-start text-sm">
          Create or add existing brand of the product you want to add.
        </span>
      </div>

      <div className="flex flex-col gap-2 my-2">
        <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200 mb-3">
          Select a Category <span className="text-red-500">*</span>
        </span>
        <CategorySelector onChange={handleCategoryChange} className="w-full" />
      </div>

      {selectedCategory && (
        <div className="flex flex-col gap-2 my-2">
          <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200 mb-1">
            Brand <span className="text-red-500">*</span>
          </span>
          <BrandSelector
            category={selectedCategory}
            onSelect={handleBrandSelect}
            onCreateNew={handleBrandCreationForm}
          />
        </div>
      )}

      {brandCreationForm && (
        <div className="flex flex-col gap-2">
          <form className="flex flex-col gap-2 my-2">
            <div className="flex flex-col gap-1">
              <InputBox
                label="Brand name"
                name="name"
                labelClassName="text-sm"
                placeholder="Enter brand name"
                icon={<IoStorefrontOutline size={20} />}
                value={brandData.name}
                onChange={handleChange}
                notOptional
                type="text"
              />
              <span className="text-gray-500 text-sm dark:text-gray-400 text-start">
                This name will be visible to your customers.
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <InputBox
                label="Slug"
                name="slug"
                labelClassName="text-sm"
                placeholder="Enter brand slug (unique identifier)"
                icon={<IoIosLink size={20} />}
                value={brandData.slug}
                onChange={handleChange}
                notOptional
                type="text"
              />
              <span className="text-gray-500 text-sm dark:text-gray-400 text-start">
                Use lowercase letters,numbers and hyphens only.
              </span>
            </div>

            <InputBox
              label="Description"
              name="description"
              labelClassName="text-sm"
              placeholder="Enter brand description"
              multiline
              maxLength={1000}
              rows={6}
              icon={<LuNotepadText size={20} />}
              value={brandData.description}
              onChange={handleChange}
              notOptional
              type="text"
            />
          </form>
          <button
            type="submit"
            onClick={createBrand}
            className="text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 flex gap-2 w-full justify-center items-center font-medium my-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Save &amp; Continue</span>
            <IoIosArrowRoundForward size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default AddBrandForm;
