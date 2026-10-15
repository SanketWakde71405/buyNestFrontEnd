import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { IoArrowBack } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { IoPricetagOutline } from "react-icons/io5";
import { IoCubeOutline } from "react-icons/io5";
import { IoFlagOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import { IoStarOutline } from "react-icons/io5";
import { IoTimeOutline } from "react-icons/io5";
import { IoAlertCircleOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import { IoBusinessOutline } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";

// Services
import ProductApi from "../../services/ProductApi.js";
import CategoryApi from "../../services/CategoryApi.js";
import BrandApi from "../../services/BrandApi.js";

// Components
import SectionCard from "../SectionCard.jsx";
import ProductImageSlider from "./comps/ProductImageSlider.jsx";

// Utils
import { classifyStock, toneClasses } from "./utils/productStock.js";
import { formatDate, formatCurrency } from "../../utils/commonFunctions.js";

function DetailRow({ label, value, valueClassName = "", logo }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      {label === "Brand" ? (
        <div className="flex flex-row gap-2 justify-center items-center">
          {logo && (
            <div className="w-8 h-8 flex">
              <img src={logo} alt="" className="object-contain" />
            </div>
          )}
          <span
            className={`text-sm font-semibold text-zinc-800 dark:text-gray-100 text-right ${valueClassName}`}
          >
            {value}
          </span>
        </div>
      ) : (
        <span
          className={`text-sm font-semibold text-zinc-800 dark:text-gray-100 text-right ${valueClassName}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default function ViewProductOutlet() {
  // Hooks and params
  const navigate = useNavigate();
  const { productId } = useParams();

  // Use states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // use Effects
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await ProductApi.getProductById(productId);

        if (!data) throw new Error("Product not found.");

        const [categoriesList, brandDetails] = await Promise.all([
          Promise.all(
            (data.category || []).map((categoryId) =>
              CategoryApi.getCategoryById(categoryId),
            ),
          ),
          BrandApi.getBrandById(data.brand),
        ]);

        const categoriesName = categoriesList.map((category) => category?.name);

        const updatedProduct = {
          ...data,
          category: categoriesName,
          brand: {
            name: brandDetails?.name,
            logo: brandDetails?.logo,
          },
        };

        if (cancelled) return;
        setProduct(updatedProduct);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load product.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading product…
        </p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-red-500">
          {loadError || "Product not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 dark:border-slate-800 dark:text-gray-300"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const stockPreview = classifyStock(product.stock);
  const suppliers = product.suppliers || [];
  const sellingPrice = product.discountPrice ?? product.price;
  // costPrice and profit are virtuals derived from the primary supplier.
  const hasCostPrice = product.costPrice != null;
  const profit = product.profit ?? null;

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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/products/edit/${productId}`)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <IoCreateOutline size={16} /> Edit Product
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300 dark:hover:border-indigo-800"
            >
              <IoEyeOutline size={16} /> View on Storefront
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        {/* Page heading */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
            <IoEyeOutline size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
              Product Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View detailed information about this product.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <SectionCard
              icon={IoPricetagOutline}
              title="Product Gallery"
              description="Images uploaded for this product."
            >
              <ProductImageSlider
                images={product.images}
                title={product.title}
              />
            </SectionCard>

            <SectionCard
              icon={IoDocumentTextOutline}
              title={product.title}
              description={product.slug}
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                    product.isActive
                      ? "bg-indigo-50 text-indigo-600 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20"
                      : "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:ring-slate-700"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
                {product.category.map((cat, i) => (
                  <span
                    key={cat._id || cat || i}
                    className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-slate-800 dark:text-violet-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <p className="text-sm leading-relaxed text-zinc-600 dark:text-gray-300">
                {product.description || "No description provided."}
              </p>
            </SectionCard>

            {product.features?.length > 0 && (
              <SectionCard
                icon={IoLayersOutline}
                title="Key Features"
                description="What makes this product stand out."
              >
                <ul className="flex flex-col gap-2">
                  {product.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            <SectionCard
              icon={IoStarOutline}
              title="Ratings"
              description="Customer feedback on this product."
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-zinc-800 dark:text-white">
                  {(product.ratingsAverage ?? 0).toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) =>
                      i < Math.round(product.ratingsAverage ?? 0) ? (
                        <IoStar key={i} size={16} className="text-amber-400" />
                      ) : (
                        <IoStarOutline
                          key={i}
                          size={16}
                          className="text-gray-300 dark:text-slate-600"
                        />
                      ),
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Based on {product.ratingsCount ?? 0}{" "}
                    {product.ratingsCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <SectionCard
              icon={IoCubeOutline}
              title="Pricing & Inventory"
              description="Selling price, cost from your primary supplier, and stock."
            >
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <DetailRow
                  label="Selling Price"
                  value={formatCurrency(product.price)}
                />
                <DetailRow
                  label="Discount Price"
                  value={formatCurrency(product.discountPrice)}
                />
                <DetailRow
                  label="Cost Price (primary supplier)"
                  value={
                    hasCostPrice ? formatCurrency(product.costPrice) : "Not set"
                  }
                />
                <DetailRow
                  label="Profit"
                  value={profit != null ? formatCurrency(profit) : "—"}
                  valueClassName={
                    profit != null && profit < 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }
                />
                <DetailRow
                  label="Stock Quantity"
                  value={`${product.stock ?? 0} Units`}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={IoBusinessOutline}
              title="Suppliers"
              description="Who provides this product and on what terms."
              action={
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  {suppliers.length} linked
                </span>
              }
            >
              {suppliers.length === 0 ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No supplier is linked, so cost and profit aren&apos;t
                    available for this product.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/products/edit/${productId}`)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300"
                  >
                    Link a supplier
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {suppliers.map((s) => {
                    const info = s.supplier || {};
                    const margin =
                      sellingPrice != null ? sellingPrice - s.costPrice : null;
                    const contact = [
                      info.contactPerson,
                      info.contactDetails?.email,
                      info.contactDetails?.phone,
                    ]
                      .filter(Boolean)
                      .join(" • ");
                    return (
                      <div
                        key={info._id || s._id}
                        className={`rounded-xl border p-3 ${
                          s.isPrimary
                            ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-500/40 dark:bg-slate-800/40"
                            : "border-gray-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-800 dark:text-gray-100">
                              {info.supplierName || "Unknown supplier"}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {contact || "No contact details"}
                            </p>
                          </div>
                          {s.isPrimary && (
                            <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Cost
                            </p>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">
                              {formatCurrency(s.costPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Profit / unit
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                margin != null && margin < 0
                                  ? "text-red-500 dark:text-red-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {margin != null ? formatCurrency(margin) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Lead time
                            </p>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">
                              {s.leadTimeDays != null
                                ? `${s.leadTimeDays} days`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Min. order
                            </p>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">
                              {s.minOrderQty != null
                                ? `${s.minOrderQty} units`
                                : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              icon={IoFlagOutline}
              title="Product Status"
              description="Visibility and stock-level status."
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Status
                  </span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-gray-100">
                    {product.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {stockPreview && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClasses[stockPreview.tone]}`}
                  >
                    {stockPreview.label}
                  </span>
                )}
              </div>

              {!product.isActive && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <IoAlertCircleOutline
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                    size={16}
                  />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    This product is not visible to customers. It's marked
                    inactive because it's low/out of stock, has too few images,
                    or was manually deactivated.
                  </p>
                </div>
              )}
              {product.isActive && (
                <div className="mt-4 rounded-lg bg-indigo-50 px-3 py-2.5 text-xs text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
                  This product is active and visible to customers.
                </div>
              )}
            </SectionCard>

            <SectionCard
              icon={IoPersonOutline}
              title="Brand & Categories"
              description="How this product is organized."
            >
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <DetailRow
                  label="Brand"
                  logo={product.brand.logo}
                  value={product.brand.name}
                />
                <DetailRow
                  label="Categories"
                  value={
                    product.category.length > 0
                      ? product.category.map((c) => c).join(", ")
                      : "Not set"
                  }
                  valueClassName="max-w-[60%]"
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={IoTimeOutline}
              title="Timestamps"
              description="When this product was added and last changed."
            >
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <DetailRow
                  label="Added On"
                  value={formatDate(product.createdAt)}
                />
                <DetailRow
                  label="Last Updated"
                  value={formatDate(product.updatedAt)}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
