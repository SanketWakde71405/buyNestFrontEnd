import React, { useState, useMemo } from "react";
import useTheme from "../../contexts/ThemeContext";
// Icons
import { IoAdd,IoFilter } from "react-icons/io5";
import { BsFillBagHeartFill } from "react-icons/bs";
import { HiTrendingUp } from "react-icons/hi";
import { TbPackageOff, TbAlertTriangleFilled } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";

import ButtonIcon from "../ButtonIcon";
import Pagination from "../Pagination";
import HeadingCard from "./HeadingCard";
import Dropdown from "../Dropdown";
import SearchBar from "../SearchBar";

import {
  ALL_PRODUCTS,
  CATEGORIES,
  STATUSES,
  PAGE_SIZE,
  statusConfig,
} from "./dummyProducts";

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig["In Stock"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon} {status}
    </span>
  );
}

// ─── Stock Cell ───────────────────────────────────────────────────────────────
function StockCell({ stock, status }) {
  const color =
    status === "Out of Stock"
      ? "text-red-500"
      : status === "Low Stock"
        ? "text-amber-500"
        : "text-green-600";
  return (
    <div>
      <p className="font-medium text-zinc-800 dark:text-gray-200">{stock}</p>
      <p className={`text-xs ${color}`}>
        {status === "Trending" ? "In Stock" : status}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ProductsOutlet() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const {theme} = useTheme();
  const headingCards = [
    {
      id: "products",
      icon: <BsFillBagHeartFill className="text-violet-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Products",
      subTitle: "248",
      desc: "All products in the store",
    },
    {
      id: "trending",
      icon: <HiTrendingUp className="text-red-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-stone-800" : "bg-red-100",
      title: "Trending Products",
      subTitle: "28",
      desc: "High Demand Products",
    },
    {
      id: "noStock",
      icon: <TbPackageOff className="text-rose-600" size={30} />,
      iconBackground: theme === "dark" ? "bg-stone-800" : "bg-rose-100",
      title: "Out of Stock",
      subTitle: "8",
      desc: "Currently unavailable",
    },
    {
      id: "lowStock",
      icon: <TbAlertTriangleFilled className="text-amber-600" size={30} />,
      iconBackground: theme==="dark"?"bg-stone-900": "bg-amber-100",
      title: "Low Stock",
      subTitle: "15",
      desc: "Near Stock limit",
    },
  ];

  // ── Filtering ──
  const filtered = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        category === "All Categories" || p.category === category;
      const matchStatus = status === "All Statuses" || p.status === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, category, status]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-4 px-5 mx-2 my-2">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center gap-1 px-5">
        <div className="flex flex-col justify-start items-start">
          <span className="text-zinc-800 dark:text-gray-200 font-semibold text-2xl">
            Products
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Manage and organize your store products
          </span>
        </div>
        <ButtonIcon text="Add Product" icon={<IoAdd size={25} />} />
      </div>

      {/* ── Heading Cards ── */}
      <div className="flex flex-row gap-2 justify-center items-center px-3 py-1">
        {headingCards.map((card) => (
          <HeadingCard
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            title={card.title}
            subTitle={card.subTitle}
            desc={card.desc}
          />
        ))}
      </div>

      {/* ── Table ── */}
      <div className="px-3">
        <div className="bg-white dark:bg-slate-950  rounded-xl border border-gray-200 dark:border dark:border-slate-800 overflow-hidden">
          {/* ── Search + Filters ── */}
          <div className="flex flex-row w-full justify-between border-b border-gray-100 dark:border-b dark:border-slate-800 py-2 rounded-lg items-center gap-3 px-3">
            {/* Search */}
            <SearchBar
              search={search}
              setSearch={setSearch}
              placeholder="Search products..."
              onSearch={() => setPage(1)}
            />

            <div className="flex flex-row gap-2">
              {/* Category Dropdown */}
              <Dropdown
                value={category}
                options={CATEGORIES}
                onChange={handleFilterChange(setCategory)}
              />

              {/* Status Dropdown */}
              <Dropdown
                value={status}
                options={STATUSES}
                onChange={handleFilterChange(setStatus)}
              />

              {/* Filter Button */}
              <button className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-gray-200 bg-white dark:bg-slate-950 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-600 transition-colors">
                <IoFilter size={16} />
                Filter
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-b dark:border-slate-800 bg-gray-100 dark:bg-slate-900">
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Stock
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-800 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <TbPackageOff
                      size={36}
                      className="mx-auto mb-2 opacity-40"
                    />
                    <p className="text-sm">No products match your filters</p>
                  </td>
                </tr>
              ) : (
                paginated.map((product, idx) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-b dark:border-slate-800 hover:bg-violet-50/40 dark:hover:bg-slate-800/50 transition-colors ${idx === paginated.length - 1 ? "border-b-0" : ""}`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                          <BsFillBagHeartFill
                            size={18}
                            className="text-indigo-400"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-gray-200">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-violet-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-gray-200">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockCell
                        stock={product.stock}
                        status={product.status}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-slate-600 transition-colors">
                          <MdEdit size={16} />
                        </button>
                        <button className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 hover:border-red-300 dark:hover:border-slate-600 transition-colors">
                          <RiDeleteBin5Fill size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination Row ── */}
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-zinc-800 dark:text-gray-200">
            {filtered.length}
          </span>{" "}
          products
        </p>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default ProductsOutlet;
