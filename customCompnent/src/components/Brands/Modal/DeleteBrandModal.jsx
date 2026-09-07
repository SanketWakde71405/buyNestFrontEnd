import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// Icons
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";

import BrandApi from "../../../services/BrandApi.js";

function DeleteBrandModal({ brandId, onClose, formData }) {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const handleDeleteBrand = async () => {
    setDeleting(true);
    try {
      await BrandApi.deleteBrand(brandId);
      toast.success("Brand deleted successfully.");
      navigate("/brands");
    } catch (err) {
      toast.error("Failed to delete brand.");
      console.error("Failed to delete brand:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2.5 text-red-600 dark:text-red-400">
          <IoAlertCircleOutline size={20} />
          <h2 className="text-base font-semibold text-zinc-800 dark:text-white">
            Delete this brand?
          </h2>
        </div>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          This will permanently remove "{formData?.name}". This action can't be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteBrand}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            <IoTrashOutline size={16} />
            {deleting ? "Deleting…" : "Delete Brand"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBrandModal;
