import React, { useEffect, useState } from "react";

// Services
import BrandApi from "../services/BrandApi";

// Components
import SearchBar from "./SearchBar";

// category: the lowest-level (leaf) category object selected via CategorySelector, e.g. { _id, name }
// onSelect: ({ brand, isNewBrand: false, skipLogoStep: true }) => void — fired when an existing brand is chosen
// onCreateNew: ({ name, category }) => void — fired when the user wants to add a brand that doesn't exist yet;
//   the parent (ProductOnboardingOutlet) is responsible for rendering the actual create-brand form/step
function BrandSelector({ category, onSelect, onCreateNew, className }) {
  const [search, setSearch] = useState("");
  const [brandsForCategory, setBrandsForCategory] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [confirmedBrand, setConfirmedBrand] = useState(null);
  const [newBrandRequested, setNewBrandRequested] = useState(false);

  // Reset the whole widget whenever the selected category changes.
  useEffect(() => {
    setSearch("");
    setBrandsForCategory([]);
    setConfirmedBrand(null);
    setNewBrandRequested(false);
  }, [category?._id]);

  // Fetch the brand list for this category once, up front.
  useEffect(() => {
    if (!category?._id) return;

    const fetchBrands = async () => {
      setFetching(true);
      try {
        const brands = await BrandApi.getBrandForCategories(category._id);
        setBrandsForCategory(brands || []);
      } catch (err) {
        // A 404 here just means no brand has been added under this category yet —
        // treat that as an empty list rather than a hard failure.
        setBrandsForCategory([]);
      } finally {
        setFetching(false);
      }
    };
    fetchBrands();
  }, [category?._id]);

  const trimmedSearch = search.trim();
  const matches = trimmedSearch
    ? brandsForCategory.filter((brand) =>
        brand.name.toLowerCase().includes(trimmedSearch.toLowerCase()),
      )
    : [];
  // "Negative" search: user typed something, brand list has loaded, and nothing matched.
  const showAddNewOption =
    !confirmedBrand &&
    !newBrandRequested &&
    !fetching &&
    trimmedSearch.length > 0 &&
    matches.length === 0;

  const handleSelectExisting = (brand) => {
    setConfirmedBrand(brand);
    onSelect?.({ brand, isNewBrand: false, skipLogoStep: true });
  };

  const handleAddNewClick = () => {
    setNewBrandRequested(true);
    onCreateNew?.({ name: trimmedSearch, category });
  };

  if (!category) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500">
        Select a category to continue.
      </span>
    );
  }

  if (confirmedBrand) {
    return (
      <div className="flex items-center gap-3 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
        {confirmedBrand.logo && (
          <img
            src={confirmedBrand.logo}
            alt={confirmedBrand.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
            {confirmedBrand.name}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            Existing brand selected — logo upload step skipped.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search for a brand"
        className="w-full"
      />

      {fetching && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Loading brands...
        </span>
      )}

      {!fetching && matches.length > 0 && (
        <ul className="flex flex-col gap-1">
          {matches.map((brand) => (
            <li key={brand._id}>
              <button
                type="button"
                onClick={() => handleSelectExisting(brand)}
                className="w-full flex items-center gap-3 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-left hover:border-violet-400 dark:hover:border-slate-700 transition-colors"
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="text-sm text-zinc-800 dark:text-gray-200">
                  {brand.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAddNewOption && (
        <button
          type="button"
          onClick={handleAddNewClick}
          className="w-full text-left border border-dashed border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
        >
          + Add "{trimmedSearch}" as a new brand
        </button>
      )}
    </div>
  );
}

export default BrandSelector;
