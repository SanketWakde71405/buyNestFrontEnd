import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import {
  IoArrowBack,
  IoPricetagOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

// Services
import CategoryApi from "../../services/CategoryApi.js";
import BrandApi from "../../services/BrandApi.js";

// Components
import AddBrandForm from "./Screens/AddBrandForm.jsx";
import BrandReview from "./Screens/BrandReview.jsx";

function AddBrandOutlet() {
  const navigate = useNavigate();
  const [createdBrandId, setCreatedBrandId] = useState(null);
  const [createdBrand, setCreatedBrand] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  const isReviewing = Boolean(createdBrand);

  useEffect(() => {
    const fetchAllCategoriesFlat = async () => {
      const parents = (await CategoryApi.getCategoriesForStore()) || [];
      const flat = [...parents];

      const fetchChildren = async (category) => {
        let children = [];
        try {
          children = (await CategoryApi.getSubCategories(category?._id)) || [];
        } catch (err) {
          return;
        }
        if (children.length > 0) {
          flat.push(...children);
          await Promise.all(children.map(fetchChildren));
        }
      };

      await Promise.all(parents.map(fetchChildren));

      const seen = new Set();
      return flat.filter((cat) => {
        if (seen.has(cat._id)) return false;
        seen.add(cat._id);
        return true;
      });
    };

    fetchAllCategoriesFlat()
      .then(setAllCategories)
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    if (createdBrandId) {
      BrandApi.getBrandById(createdBrandId)
        .then(setCreatedBrand)
        .catch((err) => console.error("Failed to load created brand", err));
    }
  }, [createdBrandId]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/brands")}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
          >
            <IoArrowBack size={16} /> Back to Brands
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoPricetagOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              {isReviewing ? "Review Brand" : "Add New Brand"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isReviewing
                ? "Double-check the details below and fix anything that isn't right."
                : "Enter brand details to add a new brand to your store."}
            </p>
          </div>
        </div>

        {isReviewing && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <IoCheckmarkCircle size={16} />
            Brand created successfully.
          </div>
        )}

        {isReviewing ? (
          <BrandReview
            brand={createdBrand}
            allCategories={allCategories}
            onBrandUpdated={setCreatedBrand}
          />
        ) : (
          <AddBrandForm onCreated={setCreatedBrandId} />
        )}
      </div>
    </div>
  );
}

export default AddBrandOutlet;
