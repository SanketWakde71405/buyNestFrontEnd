import React, { useState, useMemo } from "react";

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
      <p className="font-medium text-zinc-800">{stock}</p>
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

  const headingCards = [
    {
      id: "products",
      icon: <BsFillBagHeartFill className="text-violet-600" size={30} />,
      iconBackground: "bg-violet-100",
      title: "Total Products",
      subTitle: "248",
      desc: "All products in the store",
    },
    {
      id: "trending",
      icon: <HiTrendingUp className="text-red-600" size={30} />,
      iconBackground: "bg-red-100",
      title: "Trending Products",
      subTitle: "28",
      desc: "High Demand Products",
    },
    {
      id: "noStock",
      icon: <TbPackageOff className="text-rose-600" size={30} />,
      iconBackground: "bg-rose-100",
      title: "Out of Stock",
      subTitle: "8",
      desc: "Currently unavailable",
    },
    {
      id: "lowStock",
      icon: <TbAlertTriangleFilled className="text-amber-300" size={30} />,
      iconBackground: "bg-amber-100",
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
          <span className="text-zinc-800 font-semibold text-2xl">Products</span>
          <span className="text-gray-500 text-sm">
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* ── Search + Filters ── */}
          <div className="flex flex-row w-full justify-between border-b border-gray-100 py-2 rounded-lg items-center gap-3 px-3">
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
              <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-zinc-600 bg-white hover:border-violet-400 hover:text-violet-700 transition-colors">
                <IoFilter size={16} />
                Filter
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Stock
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-zinc-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
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
                    className={`border-b border-gray-100 hover:bg-violet-50/40 transition-colors ${idx === paginated.length - 1 ? "border-b-0" : ""}`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <BsFillBagHeartFill
                            size={18}
                            className="text-violet-400"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-medium text-zinc-800">
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
                        <button className="p-1.5 rounded-md border border-gray-200 text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                          <MdEdit size={16} />
                        </button>
                        <button className="p-1.5 rounded-md border border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-300 transition-colors">
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
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-zinc-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-zinc-700">
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-zinc-700">{filtered.length}</span>{" "}
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
