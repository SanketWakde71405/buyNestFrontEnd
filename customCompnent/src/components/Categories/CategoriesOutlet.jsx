import React, { useState, useMemo } from "react";
import useTheme from "../../contexts/ThemeContext";
// Icons
import {
  IoAdd,
  IoGridOutline,
  IoFunnelOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRemoveOutline,
  IoStarOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";
import { LuBox } from "react-icons/lu";
import { LuBaby } from "react-icons/lu";

// Reusable Components
import Pagination from "../Pagination";
import SearchBar from "../SearchBar";
import Dropdown from "../Dropdown";
import CategoryCard from "./CategoryCard";
import ButtonIcon from "../ButtonIcon";

// ── Dummy data ──────────────────────────────────────────────────────────────
import {
  ALL_CATEGORIES,
  ROWS_PER_PAGE,
  STATUS_OPTIONS,
  PERFORMANCE_OPTIONS,
} from "./DummyCategories";

// ── Badge helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        <IoCheckmarkCircleOutline size={13} />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-100">
      <IoCloseCircleOutline size={13} />
      Inactive
    </span>
  );
}

function PerformanceBadge({ performance }) {
  const config = {
    "Best Seller": {
      cls: "bg-violet-50 text-violet-600 border-violet-100",
      icon: <IoStarOutline size={12} />,
    },
    "High Performer": {
      cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: <IoTrendingUpOutline size={12} />,
    },
    Average: {
      cls: "bg-amber-50 text-amber-600 border-amber-100",
      icon: <IoRemoveOutline size={12} />,
    },
    Underperforming: {
      cls: "bg-red-50 text-red-500 border-red-100",
      icon: <IoTrendingDownOutline size={12} />,
    },
  };
  const { cls, icon } = config[performance] || config["Average"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {icon}
      {performance}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function CategoriesOutlet() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [perfFilter, setPerfFilter] = useState("All Performance");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { theme } = useTheme();

  const categoryCards = [
    {
      id: "categories_total",
      icon: <IoGridOutline className="text-violet-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Categories",
      subTitle: "24",
      desc: "All product categories",
    },
    {
      id: "categories_best",
      icon: (
        <HiTrendingUp
          className="text-emerald-600 border-l-2 border-b-2 border-emerald-600"
          size={24}
        />
      ),
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-emerald-100",
      title: "Best Seller Category",
      subTitle: "Electronics",
      desc: "1,248 products sold",
    },
    {
      id: "categories_underperforming",
      icon: (
        <HiTrendingDown
          className="text-amber-600 border-l-2 border-b-2 border-amber-600"
          size={24}
        />
      ),
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Underperforming",
      subTitle: "Home Decor",
      desc: "12 products sold",
    },
    {
      id: "categories_products",
      icon: <LuBox className="text-sky-600" size={24} />,
      iconBackground:theme==="dark"?"bg-slate-800": "bg-sky-100",
      title: "Total Products",
      subTitle: "2,458",
      desc: "Across all categories",
    },
  ];

  // Filtering
  const filtered = useMemo(() => {
    return ALL_CATEGORIES.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All Status" || cat.status === statusFilter;
      const matchPerf =
        perfFilter === "All Performance" || cat.performance === perfFilter;
      return matchSearch && matchStatus && matchPerf;
    });
  }, [search, statusFilter, perfFilter]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

  // Reset to page 1 on filter change
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleStatus = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };
  const handlePerf = (val) => {
    setPerfFilter(val);
    setCurrentPage(1);
  };

  const paginated = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  const startRow =
    filtered.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endRow = Math.min(currentPage * ROWS_PER_PAGE, filtered.length);

  return (
    <div className="w-full flex flex-col gap-5 px-6 py-4">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            Categories
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage product categories and organize your store
          </span>
        </div>
        <ButtonIcon text="Add New Category" icon={<IoAdd size={25} />} />
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex flex-row gap-3">
        {categoryCards.map((card) => (
          <CategoryCard
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            title={card.title}
            subTitle={card.subTitle}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-row items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-b dark:border-slate-800">
          <SearchBar
            search={search}
            setSearch={handleSearch}
            placeholder="Search categories..."
          />

          <div className="flex items-center gap-2 ml-auto">
            <Dropdown
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={handleStatus}
            />

            {showFilters && (
              <Dropdown
                value={perfFilter}
                options={PERFORMANCE_OPTIONS}
                onChange={handlePerf}
              />
            )}

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                showFilters
                  ? "border-violet-400 text-violet-600 bg-violet-50 dark:bg-slate-950 dark:border-slate-800 dark:text-gray-200"
                  : "border-gray-200 dark:border-slate-800 text-zinc-800 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              <IoFunnelOutline size={15} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border dark:border-slate-800 text-zinc-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900">
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-5 py-3 w-[220px]">
                Category
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3">
                Description
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 w-[100px]">
                Products
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 w-[110px]">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 w-[150px]">
                Performance
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide px-5 py-3 w-[90px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm"
                >
                  No categories match your search.
                </td>
              </tr>
            ) : (
              paginated.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-100/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Category */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.iconBg}`}
                      >
                        {cat.icon}
                      </div>
                      <span className="font-semibold text-zinc-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 leading-snug">
                    {cat.description}
                  </td>

                  {/* Products */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 font-medium">
                    {cat.products.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={cat.status} />
                  </td>

                  {/* Performance */}
                  <td className="px-4 py-3.5">
                    <PerformanceBadge performance={cat.performance} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-blue-500 dark:text-blue-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <IoPencilOutline size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg text-red-400  hover:bg-red-50 transition-colors">
                        <IoTrashOutline size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-t dark:border-slate-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {startRow} to {endRow} of {filtered.length} categories
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriesOutlet;
