import React, { useState, useMemo } from "react";
import useTheme from "../../contexts/ThemeContext";
// Icons
import {
  IoAdd,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoFilter,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { CgShoppingBag } from "react-icons/cg";
import { HiTrendingUp } from "react-icons/hi";

// Components
import ButtonIcon from "../ButtonIcon";
import BrandCard from "./BrandCard";
import SearchBar from "../SearchBar";
import Dropdown from "../Dropdown";
import Pagination from "../Pagination";

// ── Dummy Data (86 brands) ──────────────────────────────────────────────────
import {
  ALL_BRANDS,
  ITEMS_PER_PAGE,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from "./DummyBrands";

function BrandOutlet() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sort, setSort] = useState("Sort by: Recently Added");
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();

  const brandCards = [
    {
      id: "brands_total",
      icon: <CgShoppingBag className="text-violet-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Brands",
      subTitle: "86",
      desc: "All registered brands",
    },
    {
      id: "brands_active",
      icon: <IoCheckmarkCircleOutline className="text-emerald-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-emerald-100",
      title: "Active Brands",
      subTitle: "78",
      desc: "Currently active",
    },
    {
      id: "brands_products_total",
      icon: <IoCubeOutline className="text-amber-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Total Products",
      subTitle: "3,245",
      desc: "Across all brands",
    },
    {
      id: "brands_top",
      icon: <HiTrendingUp className="text-sky-600" size={26} />,
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      title: "Top Brand",
      subTitle: "Apple",
      desc: "By sales this month",
    },
  ];

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...ALL_BRANDS];

    if (search.trim())
      list = list.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()),
      );

    if (status !== "All Status") list = list.filter((b) => b.status === status);

    if (sort === "Sort by: Name (A–Z)")
      list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "Sort by: Name (Z–A)")
      list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "Sort by: Most Products")
      list.sort((a, b) => b.products - a.products);
    // default: Recently Added → already sorted by id desc order from data

    return list;
  }, [search, status, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset to page 1 whenever filters change
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };
  const handleStatus = (val) => {
    setStatus(val);
    setCurrentPage(1);
  };
  const handleSort = (val) => {
    setSort(val);
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-5 px-6 py-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl tracking-tight">
            Brands
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage all product brands in your store
          </span>
        </div>
        <ButtonIcon text="Add New Brand" icon={<IoAdd size={25} />} />
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="flex flex-row gap-3">
        {brandCards.map((card) => (
          <BrandCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-100 dark:border dark:border-slate-800 shadow-sm overflow-hidden">
        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-row justify-between py-4 px-2 border-b border-gray-100 dark:border-b dark:border-slate-800 items-center gap-3 flex-wrap">
          <SearchBar
            search={search}
            setSearch={handleSearch}
            placeholder="Search brands by name..."
          />
          <div className="flex flex-row justify-center items-center gap-2">
            <Dropdown
              value={status}
              options={STATUS_OPTIONS}
              onChange={handleStatus}
            />
            <Dropdown
              value={sort}
              options={SORT_OPTIONS}
              onChange={handleSort}
            />
            <button className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-gray-200 bg-white dark:bg-slate-950 hover:border-indigo-400 hover:text-indigo-400 transition-colors">
              <IoFilter size={15} />
              Filter
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-b dark:border-slate-800 text-zinc-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[22%]">
                Brand
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[32%]">
                Description
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[10%]">
                Products
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[12%]">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[14%]">
                Added On
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide w-[10%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  No brands match your search.
                </td>
              </tr>
            ) : (
              paginated.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Brand */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-transparent flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `<span class="text-xs font-bold text-zinc-800 dark:text-gray-200">${brand.name[0]}</span>`;
                          }}
                        />
                      </div>
                      <span className="font-medium text-zinc-800 dark:text-gray-200">
                        {brand.name}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 leading-snug">
                    {brand.description}
                  </td>

                  {/* Products */}
                  <td className="px-5 py-3 text-zinc-800 dark:text-gray-200 font-medium">
                    {brand.products.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        brand.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          brand.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-red-400"
                        }`}
                      />
                      {brand.status}
                    </span>
                  </td>

                  {/* Added On */}
                  <td className="px-5 py-3 text-zinc-800 dark:text-gray-200">
                    {brand.addedOn}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <IoPencilOutline size={15} />
                      </button>
                      <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-red-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <IoTrashOutline size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-t dark:border-slate-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
            to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} brands
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BrandOutlet;
