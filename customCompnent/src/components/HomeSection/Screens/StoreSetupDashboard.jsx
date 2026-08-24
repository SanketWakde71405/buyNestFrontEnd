import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import {
  IoCheckmarkCircle,
  IoChevronForward,
  IoAddCircleOutline,
} from "react-icons/io5";
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlinePencil,
  HiOutlineCreditCard,
  HiOutlineComputerDesktop,
  HiOutlineCube,
  HiOutlinePhoto,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { BsCircle } from "react-icons/bs";

import BrandApi from "../../../services/BrandApi.js";

// ---- data ------------------------------------------------------------

const KPI_CARDS = [
  {
    label: "Total Sales",
    value: "$0.00",
    sublabel: "This Month",
    icon: (
      <HiOutlineCurrencyDollar className="text-violet-600 dark:text-violet-400" />
    ),
    iconBg: "bg-purple-50",
    darkIconBg: "dark:bg-slate-800",
  },
  {
    label: "Orders",
    value: "0",
    sublabel: "This Month",
    icon: (
      <HiOutlineShoppingCart className="text-green-600 dark:text-green-400" />
    ),
    iconBg: "bg-green-50",
    darkIconBg: "dark:bg-slate-800",
  },
  {
    label: "Visitors",
    value: "0",
    sublabel: "This Month",
    icon: <HiOutlineUsers className="text-blue-600 dark:text-blue-400" />,
    iconBg: "bg-blue-50",
    darkIconBg: "dark:bg-slate-800",
  },
];

const COMPLETED_MILESTONES = [
  "Store Setup",
  "Payments Configured",
  "Shipping & Tax Set",
  "Store Launched",
];

const QUICK_ACTIONS = [
  {
    label: "Add New Product",
    description: "Add more products to your store",
    icon: <HiOutlineCube className="text-indigo-600 dark:text-indigo-400" />,
    iconBg: "bg-violet-50",
    darkIconBg: "dark:bg-slate-800",
    navigation: "/products",
  },
  {
    label: "Add a Brand",
    description: "Register another brand you sell",
    icon: <HiOutlinePencil className="text-indigo-600 dark:text-indigo-400" />,
    iconBg: "bg-violet-50",
    navigation: "/brands",
    darkIconBg: "dark:bg-slate-800",
  },
  {
    label: "Update Store Settings",
    description: "Adjust payment, shipping or tax preferences",
    icon: (
      <HiOutlineCreditCard className="text-indigo-600 dark:text-indigo-400" />
    ),
    navigation: "/settings",
    iconBg: "bg-violet-50",
    darkIconBg: "dark:bg-slate-800",
  },
  {
    label: "View Store",
    description: "Preview your store",
    icon: (
      <HiOutlineComputerDesktop className="text-indigo-600 dark:text-indigo-400" />
    ),
    navigation: "/products",
    iconBg: "bg-violet-50",
    darkIconBg: "dark:bg-slate-800",
  },
];

const TIPS = [
  {
    title: "Add More Products",
    description:
      "More products = more sales. Add variety to attract customers.",
    icon: (
      <HiOutlineCube className="w-4.5 h-4.5 text-orange-500 dark:text-orange-400" />
    ),
  },
  {
    title: "Set Product Images",
    description: "High-quality images increase trust and sales.",
    icon: (
      <HiOutlinePhoto className="w-4.5 h-4.5 text-orange-500 dark:text-orange-400" />
    ),
  },
  {
    title: "Write Good Descriptions",
    description: "Clear descriptions help customers make decisions.",
    icon: (
      <HiOutlineDocumentText className="w-4.5 h-4.5 text-orange-500 dark:text-orange-400" />
    ),
  },
];

export default function StoreSetupDashboard({
  storeOwnerName = "John",
  products,
  targetProductsCount = 10,
}) {
  const [productsList, setProductsList] = useState();
  const [brands, setBrands] = useState([]);

  const productsCount = products.length;
  const navigate = useNavigate();

  const remainingProducts = Math.max(targetProductsCount - productsCount, 0);
  const productProgressPercent = Math.min(
    Math.round((productsCount / targetProductsCount) * 100),
    100,
  );

  const kpiCards = [
    ...KPI_CARDS,
    {
      label: "Products",
      value: String(productsCount),
      sublabel: "Total Products",
      icon: (
        <HiOutlineChartBar className="text-orange-600 dark:text-orange-400" />
      ),
      iconBg: "bg-orange-50",
      darkIconBg: "dark:bg-slate-800",
    },
  ];

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const uniqueBrandIds = [
          ...new Set(products.map((product) => product?.brand).filter(Boolean)),
        ];

        const brandList = await Promise.all(
          uniqueBrandIds.map((brandId) => BrandApi.getBrandById(brandId)),
        );

        const brandsWithCategoryNames = brandList.map((brand) => ({
          ...brand,
          categories: (brand?.categories || []).map(
            (category) => category?.name,
          ),
        }));

        setBrands(brandsWithCategoryNames);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };

    if (products?.length > 0) {
      loadBrands();
    }
  }, [products]);

  return (
    <div className="w-full bg-[#f7f7fb] dark:bg-slate-950 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-gray-200">
            Welcome to ShopVista, {storeOwnerName}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Let&apos;s set up your store and start selling to your first
            customers.
          </p>
        </div>
      </div>

      {/* Hero: single remaining action */}
      <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {COMPLETED_MILESTONES.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full"
                >
                  <IoCheckmarkCircle className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-bold text-zinc-800 dark:text-gray-200">
              You&apos;re almost ready! 🎉
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              {remainingProducts > 0 ? (
                <>
                  Your store setup is complete. Add{" "}
                  <span className="font-semibold text-zinc-700 dark:text-gray-300">
                    {remainingProducts} more product
                    {remainingProducts === 1 ? "" : "s"}
                  </span>{" "}
                  to unlock your full dashboard with sales analytics, order
                  tracking, and more.
                </>
              ) : (
                "You've added enough products — your full dashboard is unlocking now."
              )}
            </p>

            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-700 dark:text-gray-300">
                  {productsCount} of {targetProductsCount} products added
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {productProgressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${productProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/products");
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 text-white text-sm font-semibold px-5 py-3 flex-shrink-0"
          >
            <IoAddCircleOutline className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5 flex items-center gap-3"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${kpi.iconBg} ${kpi.darkIconBg}`}
            >
              {kpi.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {kpi.label}
              </p>
              <p className="text-xl font-bold text-zinc-800 dark:text-gray-200 leading-tight">
                {kpi.value}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {kpi.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-zinc-800 dark:text-gray-200 mb-1">
            Quick Actions
          </h3>
          <div>
            {QUICK_ACTIONS.map((action, index) => (
              <button
                type="button"
                key={action.label}
                onClick={() => {
                  navigate(action.navigation);
                }}
                className={`w-full flex items-center justify-between gap-3 py-3 text-left ${
                  index == QUICK_ACTIONS.length - 1
                    ? ""
                    : "border-b border-gray-100 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.iconBg} ${action.darkIconBg}`}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
                <IoChevronForward className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Tips for Getting Started */}
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-zinc-800 dark:text-gray-200 mb-4">
            Tips for Getting Started
          </h3>
          <div className="space-y-4">
            {TIPS.map((tip) => (
              <div key={tip.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                    {tip.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {tip.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a className="inline-block mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
            View All Tips
          </a>
        </div>
      </div>

      {/* Products / Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Your Products */}
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Your Products
            </h3>
            <a className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {products.length} product added
          </p>

          <div className="space-y-3">
            {products.map((product) => {
              return (
                <div
                  key={product._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                      <img src={product.images[0]} alt="product-img" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        ₹ {product.price}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    {product.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Brands */}
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
              Your Brands
            </h3>
            <a className="text-xs font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              View All
            </a>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {brands.length} brand added
          </p>

          <div className="space-y-3">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-gray-200">
                      {brand.name}
                    </p>
                    {brand.categories?.length > 0 && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {brand.categories.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
