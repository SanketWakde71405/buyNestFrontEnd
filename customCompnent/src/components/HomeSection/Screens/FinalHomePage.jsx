import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import { IoCheckmarkCircle, IoSparkles } from "react-icons/io5";
import {
  HiOutlineTag,
  HiOutlineBuildingStorefront,
  HiOutlineMegaphone,
  HiOutlineCreditCard,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineArrowRight,
  HiOutlinePresentationChartLine,
  HiOutlineSquares2X2, // ← new: categories
  HiOutlineUserGroup, // ← new: team/employees
} from "react-icons/hi2";

const GET_STARTED_CARDS = [
  {
    title: "Add More Products",
    description: "Expand your product range and attract more customers.",
    linkLabel: "Add Products",
    icon: (
      <HiOutlineTag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    ),
    iconBg: "bg-violet-100",
    darkIconBg: "dark:bg-slate-800",
    navigation: "/products",
  },
  {
    title: "Manage Categories",
    description: "Organize your catalog with categories and subcategories.",
    linkLabel: "Manage Categories",
    icon: (
      <HiOutlineSquares2X2 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
    ),
    iconBg: "bg-orange-100",
    darkIconBg: "dark:bg-slate-800",
    navigation: "/categories",
  },
  {
    title: "Invite Your Team",
    description:
      "Add employees to help manage products, brands, and categories.",
    linkLabel: "Invite Team",
    icon: (
      <HiOutlineUserGroup className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    ),
    iconBg: "bg-blue-100",
    darkIconBg: "dark:bg-slate-800",
    navigation: "/employees",
  },
  {
    title: "Configure Payments",
    description: "Enable secure payment methods for your customers.",
    linkLabel: "Configure Now",
    icon: (
      <HiOutlineCreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    ),
    iconBg: "bg-emerald-100",
    darkIconBg: "dark:bg-slate-800",
    navigation: "/settings",
  },
];

const STORE_STATS = [
  {
    label: "Total Sales",
    value: "$0.00",
    sublabel: "All time",
    icon: (
      <HiOutlineShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    ),
    iconBg: "bg-violet-100",
    darkIconBg: "dark:bg-slate-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    label: "Orders",
    value: "0",
    sublabel: "All time",
    icon: (
      <HiOutlineShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    ),
    iconBg: "bg-emerald-100",
    darkIconBg: "dark:bg-slate-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Customers",
    value: "0",
    sublabel: "All time",
    icon: (
      <HiOutlineUsers className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    ),
    iconBg: "bg-blue-100",
    darkIconBg: "dark:bg-slate-800",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
];

const TIPS = [
  "Add at least 3 high-quality product images — the first one becomes your thumbnail",
  "Write clear, keyword-rich product descriptions to improve discoverability",
  "Set a discount price to highlight deals and drive conversions",
  "Upload a brand logo so your products look trustworthy and complete",
  "Organize products under the right categories so customers can find them easily",
  "Keep stock counts accurate to avoid overselling out-of-stock items",
  "Use consistent, unique slugs for products and brands to avoid conflicts",
  "Invite employees to help manage products, brands, and categories as your catalog grows",
  "Mark products inactive instead of deleting them if you want to pause sales temporarily",
  "Promote your store on social media to drive your first orders",
];

const DEFAULT_TIPS_COUNT = 4;

export default function FinalHomePage({
  storeOwnerName = "John",
  productsCount = 10,
  onGoToDashboard,
}) {
  const navigate = useNavigate();
  const [showAllTips, setShowAllTips] = useState(false);

  const visibleTips = showAllTips ? TIPS : TIPS.slice(0, DEFAULT_TIPS_COUNT);

  return (
    <div className="w-full bg-[#f7f7fb] dark:bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-gray-200">
            Welcome to ShopVista, {storeOwnerName}! 🎉
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your store setup is complete. You&apos;re all set to grow your
            business.
          </p>
        </div>

        {/* Decorative shop illustration */}
        <img
          src="https://res.cloudinary.com/dx88pbasu/image/upload/v1787134510/store_swbef9.png"
          className="w-65 object-cover"
          alt="logo"
        />
      </div>

      {/* Store setup completed banner */}
      <div className="flex items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <IoCheckmarkCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
              Store setup completed!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Great job! You have added {productsCount} products to your store.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToDashboard}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 dark:border dark:border-slate-700 text-zinc-800 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          Go to Dashboard
          <HiOutlineArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Get Started */}
      <div>
        <h2 className="text-lg font-bold text-zinc-800 dark:text-gray-200">
          Get Started
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
          Follow these steps to launch and grow your store.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GET_STARTED_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${card.iconBg} ${card.darkIconBg}`}
              >
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-200 mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {card.description}
              </p>
              <a
                onClick={() => {
                  navigate(card.navigation);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
              >
                {card.linkLabel}
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Store Overview + Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Store Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-zinc-800 dark:text-gray-200">
            My Store Overview
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-5">
            Here&apos;s what&apos;s happening in your store.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STORE_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg} ${stat.darkIconBg}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-zinc-800 dark:text-gray-200 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {stat.sublabel}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <HiOutlineChartBar className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Products
                </p>
                <p className="text-lg font-bold text-zinc-800 dark:text-gray-200 leading-tight">
                  {productsCount}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Total Products
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
            <HiOutlinePresentationChartLine className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Start promoting your store to see your first sale and grow your
              business.
            </p>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-start gap-3 bg-violet-50 dark:bg-slate-900 rounded-xl p-4 -m-1 mb-4">
            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <HiOutlineLightBulb className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-gray-200">
                Helpful Tips
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Simple tips to help you get your first sale.
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {visibleTips.map((tip) => (
              <div key={tip} className="flex items-center gap-2.5">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-zinc-700 dark:text-gray-300">
                  {tip}
                </span>
              </div>
            ))}
          </div>

          <a
            onClick={() => setShowAllTips((prev) => !prev)}
            className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
          >
            {showAllTips ? "Show Fewer Tips" : "View All Tips"}
            <HiOutlineArrowRight
              className={`w-3.5 h-3.5 transition-transform ${showAllTips ? "-rotate-90" : ""}`}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
