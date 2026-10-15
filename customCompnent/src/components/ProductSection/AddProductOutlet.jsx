import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoArrowBack,
  IoBagHandleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";

import AddProductForm from "./Screens/AddProductForm.jsx";
import ProductReview from "./Screens/ProductReview.jsx";
import ProductSuppliersSection, {
  buildSuppliersPayload,
  validateSuppliers,
} from "./comps/ProductSuppliersSection.jsx";
import ProductApi from "../../services/ProductApi.js";

const STEPS = ["Product details", "Suppliers", "Review"];

function Stepper({ current }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-gray-400"
              }`}
            >
              {done ? <IoCheckmarkCircle size={14} /> : i + 1}
            </span>
            <span
              className={
                active
                  ? "font-medium text-zinc-800 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-6 bg-gray-300 dark:bg-slate-700" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const HEADINGS = [
  {
    title: "Add New Product",
    text: "Fill in the details below to add a new product to your store.",
  },
  {
    title: "Link Suppliers",
    text: "Choose who provides this product and what it costs you. You can skip this and add suppliers later.",
  },
  {
    title: "Review Product",
    text: "Double-check the details below and fix anything that needs a correction.",
  },
];

export default function AddProductOutlet() {
  const navigate = useNavigate();
  const [createdProduct, setCreatedProduct] = useState(null);
  const [suppliersStepDone, setSuppliersStepDone] = useState(false);

  // Supplier step state
  const [supplierRows, setSupplierRows] = useState([]);
  const [supplierErrors, setSupplierErrors] = useState({});
  const [savingSuppliers, setSavingSuppliers] = useState(false);
  const [supplierMessage, setSupplierMessage] = useState("");

  const step = !createdProduct ? 0 : !suppliersStepDone ? 1 : 2;
  const heading = HEADINGS[step];

  const sellingPrice = createdProduct
    ? (createdProduct.discountPrice ?? createdProduct.price)
    : null;

  const saveSuppliers = async () => {
    // Nothing linked: just move on.
    if (supplierRows.length === 0) {
      setSuppliersStepDone(true);
      return;
    }

    const problems = validateSuppliers(supplierRows);
    setSupplierErrors(problems);
    if (Object.keys(problems).length) {
      setSupplierMessage("Fix the highlighted fields and try again.");
      return;
    }

    setSavingSuppliers(true);
    setSupplierMessage("");
    try {
      const updated = await ProductApi.updateProductSuppliers({
        productId: createdProduct._id,
        suppliers: buildSuppliersPayload(supplierRows),
      });
      // The response omits some fields (e.g. isActive), so merge instead of replace.
      setCreatedProduct((prev) => ({ ...prev, ...updated }));
      setSuppliersStepDone(true);
    } catch (err) {
      setSupplierMessage(
        err.response?.data?.message ||
          err.message ||
          "Couldn't link suppliers. Try again.",
      );
    } finally {
      setSavingSuppliers(false);
    }
  };

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
              {heading.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {heading.text}
            </p>
          </div>
        </div>

        <Stepper current={step} />

        {step > 0 && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <IoCheckmarkCircle size={16} />
            {step === 1
              ? "Product created successfully."
              : suppliersStepDone && supplierRows.length > 0
                ? "Product created and suppliers linked."
                : "Product created successfully."}
          </div>
        )}

        {step === 0 && <AddProductForm onCreated={setCreatedProduct} />}

        {step === 1 && (
          <div className="mx-auto max-w-3xl">
            {supplierMessage && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                <IoCloseCircle size={16} />
                {supplierMessage}
              </div>
            )}

            <ProductSuppliersSection
              value={supplierRows}
              onChange={setSupplierRows}
              errors={supplierErrors}
              sellingPrice={sellingPrice}
              suggestedSupplierId={
                typeof createdProduct.brand === "object"
                  ? createdProduct.brand?.supplier
                  : null
              }
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSuppliersStepDone(true)}
                disabled={savingSuppliers}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-800 dark:text-gray-300"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={saveSuppliers}
                disabled={savingSuppliers}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingSuppliers ? "Saving…" : "Save & continue"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <ProductReview
            product={createdProduct}
            onUpdated={setCreatedProduct}
            onDone={() => navigate("/products")}
          />
        )}
      </div>
    </div>
  );
}
