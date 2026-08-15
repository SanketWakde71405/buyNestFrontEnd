import React, { useEffect, useState } from "react";

// Components
import Dropdown from "./Dropdown";

// Services
import CategoryApi from "../services/CategoryApi";

// Each level = { options: [{_id, name}], selectedId, selectedName }
function CategorySelector({ onChange, className }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoading(true);
      try {
        const parents = await CategoryApi.getCategoriesForStore();
        setLevels([
          { options: parents || [], selectedId: null, selectedName: null },
        ]);
      } catch (err) {
        console.error("Failed to fetch parent categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParentCategories();
  }, []);

  const handleSelect = async (levelIndex, selectedName) => {
    const selectedCategory = levels[levelIndex].options.find(
      (opt) => opt.name === selectedName,
    );
    if (!selectedCategory) return;

    // Record the selection at this level, and drop any deeper levels
    // that belonged to the previous choice.
    const updatedLevels = levels.slice(0, levelIndex + 1);
    updatedLevels[levelIndex] = {
      ...updatedLevels[levelIndex],
      selectedId: selectedCategory._id,
      selectedName: selectedCategory.name,
    };
    setLevels(updatedLevels);

    if (onChange) {
      // Full chain of everything selected so far, from the top-level
      // parent category down to the current (deepest) selection.
      const chain = updatedLevels
        .filter((level) => level.selectedId)
        .map((level) => ({ _id: level.selectedId, name: level.selectedName }));
      onChange(selectedCategory, chain);
    }

    // Look one level deeper. If this category has children, add a new
    // dropdown for them; if not, the chain ends here.
    setLoading(true);
    try {
      const subCategories = await CategoryApi.getSubCategories(
        selectedCategory.name,
      );
      if (subCategories && subCategories.length > 0) {
        setLevels((prev) => [
          ...prev,
          { options: subCategories, selectedId: null, selectedName: null },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      {levels.map((level, index) => (
        <Dropdown
          key={index}
          value={
            level.selectedName ||
            (index === 0 ? "Select category" : "Select subcategory")
          }
          className="w-full"
          options={level.options.map((opt) => opt.name)}
          onChange={(name) => handleSelect(index, name)}
        />
      ))}
      {loading && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Loading...
        </span>
      )}
    </div>
  );
}

export default CategorySelector;
