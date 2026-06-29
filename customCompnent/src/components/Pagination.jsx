import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

/**
 * Reusable Pagination Component
 *
 * Props:
 * - currentPage  {number}   - The active page (1-indexed)
 * - totalPages   {number}   - Total number of pages
 * - onPageChange {function} - Callback fired with the new page number
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-700 text-zinc-800 dark:text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <IoChevronBack size={16} />
      </button>

      {/* Page numbers */}
      {getPages().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 text-zinc-800 dark:text-gray-200 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors border ${
              currentPage === page
                ? "bg-indigo-600 text-white border-violet-600"
                : "border-gray-200 dark:border-slate-800 text-zinc-800 dark:text-gray-200 hover:border-violet-400 hover:text-violet-600"
            }`}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-700 text-zinc-800 dark:text-gray-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <IoChevronForward size={16} />
      </button>
    </div>
  );
}

export default Pagination;
