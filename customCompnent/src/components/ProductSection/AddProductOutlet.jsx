import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoBagHandleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

import AddProductForm from "./Screens/AddProductForm.jsx";
import ProductReview from "./Screens/ProductReview.jsx";

export default function AddProductOutlet() {
  const navigate = useNavigate();
  const [createdProduct, setCreatedProduct] = useState(null);

  const isReviewing = Boolean(createdProduct);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
          >
            <IoArrowBack size={16} /> Back to Products
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoBagHandleOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              {isReviewing ? "Review Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isReviewing
                ? "Double-check the details below and fix anything that needs a correction."
                : "Fill in the details below to add a new product to your store."}
            </p>
          </div>
        </div>

        {isReviewing && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <IoCheckmarkCircle size={16} />
            Product created successfully.
          </div>
        )}

        {isReviewing ? (
          <ProductReview
            product={createdProduct}
            onUpdated={setCreatedProduct}
            onDone={() => navigate("/products")}
          />
        ) : (
          <AddProductForm onCreated={setCreatedProduct} />
        )}
      </div>
    </div>
  );
}
