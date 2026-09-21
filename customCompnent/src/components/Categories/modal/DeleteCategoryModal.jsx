import React, { useState } from "react";

// Icons
import { IoWarningOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

// Services
import CategoryApi from "../../../services/CategoryApi.js";

function DeleteCategoryModal({ category, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!category) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await CategoryApi.deleteCategory(category._id);
      onDeleted(category._id);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to delete category. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <IoWarningOutline className="text-red-500" size={20} />
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-1">
          <h2 className="text-zinc-800 dark:text-gray-100 font-semibold text-base">
            Delete "{category.name}"?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 leading-relaxed">
            This can't be undone. Categories with products, brands, or
            subcategories still attached can't be deleted until those are
            cleared first.
          </p>

          {category.productCount > 0 && (
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-2 font-medium">
              This category still has {category.productCount.toLocaleString()}{" "}
              {category.productCount === 1 ? "product" : "products"} assigned to
              it — you'll need to reassign or delete{" "}
              {category.productCount === 1 ? "it" : "them"} first.
            </p>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 mt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-800 text-zinc-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete category"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCategoryModal;
