import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { IoClose } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoPricetagsOutline } from "react-icons/io5";
import { IoPencilOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { IoCloseCircleOutline } from "react-icons/io5";

// Services
import CategoryApi from "../../../services/CategoryApi.js";

function StatCard({ icon, label, value, onClick }) {
  return (
    <div onClick={onClick} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-zinc-800 dark:text-gray-100 mt-0.5">
          {value}
        </p>
      </div>
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-violet-500 shrink-0">
        {icon}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 text-sm gap-4">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-zinc-800 dark:text-gray-200 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function CategoryDetailsPanel({
  category,
  subCategoryCount,
  onClose,
  onEdit,
  onDelete,
}) {
  const [brandCount, setBrandCount] = useState(0);
  const [brandCountLoading, setBrandCountLoading] = useState(false);

  useEffect(() => {
    if (!category?._id) {
      setBrandCount(0);
      return;
    }

    let cancelled = false;
    setBrandCountLoading(true);

    CategoryApi.getBrandsForCategory(category._id)
      .then((count) => {
        if (!cancelled) setBrandCount(count || 0);
      })
      .catch(() => {
        if (!cancelled) setBrandCount(0);
      })
      .finally(() => {
        if (!cancelled) setBrandCountLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category?._id]);

  if (!category) return null;

  const isActive = category.status === "active";

  const navigate= useNavigate();

  return (
    <div className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm p-5 h-fit">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-zinc-800 dark:text-gray-100">
          Category Details
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <IoClose size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 dark:bg-indigo-950 text-violet-600 dark:text-violet-300 font-semibold">
          {category.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-gray-100">
              {category.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-red-50 text-red-500 border border-red-100"
              }`}
            >
              {isActive ? (
                <IoCheckmarkCircleOutline size={12} />
              ) : (
                <IoCloseCircleOutline size={12} />
              )}
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {category.parentCategoryName ? "Sub-category" : "Parent Category"}
          </p>
        </div>
      </div>

      {/* Overview */}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
        Overview
      </p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <StatCard
          icon={<IoCubeOutline size={16} />}
          label="Products"
          value={(category.productCount || 0).toLocaleString()}
          onClick={()=>{navigate(`/categories/${category?._id}/products`)}}
        />
        <StatCard
          icon={<IoLayersOutline size={16} />}
          label="Sub-categories"
          value={subCategoryCount}
        />
        <StatCard
          icon={<IoPricetagsOutline size={16} />}
          label="Brands"
          value={brandCountLoading ? "…" : brandCount.toLocaleString()}
        />
      </div>

      {/* Category Information */}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
        Category Information
      </p>
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        <InfoRow label="Category Name" value={category.name} />
        <InfoRow label="Slug" value={category.slug} />
        <InfoRow label="Description" value={category.description} />
        <InfoRow label="Display Order" value={category.displayOrder} />
        <InfoRow
          label="Parent Category"
          value={category.parentCategoryName || "—"}
        />
      </div>

      {/* Timestamps */}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mt-4 mb-1">
        Timestamps
      </p>
      <div className="divide-y divide-gray-100 dark:divide-slate-800 mb-5">
        <InfoRow label="Created On" value={formatDate(category.createdAt)} />
        <InfoRow label="Updated On" value={formatDate(category.updatedAt)} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={()=>{ navigate(`/edit/category/${category?._id}`)}}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-800 text-zinc-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
        >
          <IoPencilOutline size={14} />
          Edit Category
        </button>
        <button
          onClick={() => onDelete(category)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <IoTrashOutline size={14} />
          Delete Category
        </button>
      </div>
    </div>
  );
}

export default CategoryDetailsPanel;
