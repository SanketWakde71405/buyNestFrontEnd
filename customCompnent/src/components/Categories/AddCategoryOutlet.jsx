import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

import AddCategoryForm from "./Form/AddCategoryForm";
import CategoryReview from "./Form/CategoryReview";

// Thin page-level container: shows AddCategoryForm first, then swaps to
// CategoryReview once a category has been created (or an existing one
// linked to the store). All the actual add-category logic lives in
// AddCategoryForm; all the review/edit logic lives in CategoryReview.
function AddCategoryOutlet() {
  const navigate = useNavigate();

  const [view, setView] = useState("form"); // "form" | "review"
  const [reviewData, setReviewData] = useState(null);

  const handleBack = () => navigate(-1);

  const handleCategoryCreated = (data) => {
    setReviewData(data);
    setView("review");
  };

  return (
    <div className="w-full bg-white dark:bg-slate-950 flex flex-col gap-5 px-6 py-4 pb-28">
      {/* ── Back button ── */}
      <button
        onClick={handleBack}
        className="self-start flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-800 text-sm font-medium text-violet-600 dark:text-violet-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
      >
        <IoArrowBack size={16} />
        Back to Categories
      </button>

      {view === "form" ? (
        <AddCategoryForm onCategoryCreated={handleCategoryCreated} />
      ) : (
        <CategoryReview
          category={reviewData?.category}
          categoryType={reviewData?.categoryType}
          parentPath={reviewData?.parentPath}
          wasExisting={reviewData?.wasExisting}
          onDone={handleBack}
        />
      )}
    </div>
  );
}

export default AddCategoryOutlet;
