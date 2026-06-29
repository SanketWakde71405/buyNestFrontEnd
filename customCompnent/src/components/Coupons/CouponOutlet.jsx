import React, { useState, useMemo } from "react";
import useTheme from "../../contexts/ThemeContext";

// Icons
import {
  IoAdd,
  IoPricetagOutline,
  IoFunnelOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { RiCouponLine } from "react-icons/ri";
import { HiTrendingUp } from "react-icons/hi";
import { CiDollar } from "react-icons/ci";

// Components
import Pagination from "../Pagination";
import SearchBar from "../SearchBar";
import Dropdown from "../Dropdown";
import CouponCard from "./CouponCard";
import ButtonIcon from "../ButtonIcon";

// ── Dummy Data ───────────────────────────────────────────────────────────────
import {
  ALL_COUPONS,
  ROWS_PER_PAGE,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  CODE_COLOURS,
} from "./DummyCoupons";

function codeColour(id) {
  return CODE_COLOURS[(id - 1) % CODE_COLOURS.length];
}

// ── Usage progress bar ───────────────────────────────────────────────────────
function UsageBar({ redeemed, limit }) {
  const pct = limit ? Math.min(100, Math.round((redeemed / limit) * 100)) : 100;
  const barColour =
    pct >= 100
      ? "bg-indigo-500"
      : pct >= 60
        ? "bg-indigo-400"
        : "bg-indigo-300";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-700 font-medium">
        {redeemed.toLocaleString()}
        <span className="text-gray-400 font-normal ml-1">({pct}%)</span>
      </span>
      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    Active: {
      cls: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: <IoCheckmarkCircleOutline size={12} />,
    },
    Expired: {
      cls: "bg-red-50 text-red-500 border-red-100",
      icon: <IoCloseCircleOutline size={12} />,
    },
    Scheduled: {
      cls: "bg-sky-50 text-sky-600 border-sky-100",
      icon: <IoTimeOutline size={12} />,
    },
  };
  const { cls, icon } = cfg[status] || cfg["Active"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      {icon}
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function CouponOutlet() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { theme } = useTheme();

  const couponCards = [
    {
      id: "coupons_total",
      icon: <RiCouponLine className="text-violet-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      title: "Total Coupons",
      subTitle: "48",
      desc: "All coupons created",
    },
    {
      id: "coupons_active",
      icon: <IoPricetagOutline className="text-emerald-600" size={24} />,
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-emerald-100",
      title: "Active Coupons",
      subTitle: "32",
      desc: "Currently active",
    },
    {
      id: "coupons_redeemed",
      icon: (
        <HiTrendingUp
          className="border-b-2 border-l-2 border-sky-600 text-sky-600"
          size={24}
        />
      ),
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      title: "Total Redeemed",
      subTitle: "12,458",
      desc: "Across all coupons",
    },
    {
      id: "coupons_discount_total",
      icon: <CiDollar className="text-amber-600" size={26} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-amber-100",
      title: "Total Discounts Given",
      subTitle: "$23,456.78",
      desc: "Overall Discount",
    },
  ];

  // Filtering
  const filtered = useMemo(() => {
    return ALL_COUPONS.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All Status" || c.status === statusFilter;
      const matchType = typeFilter === "All Types" || c.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);

  const reset = () => setCurrentPage(1);
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
            Coupons
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Create, manage and track your store coupons
          </span>
        </div>
        <ButtonIcon text="Generate New Coupon" icon={<IoAdd size={25} />} />
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex flex-row gap-3">
        {couponCards.map((card) => (
          <CouponCard key={card.id} {...card} />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-row items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-b dark:border-slate-800">
          <SearchBar
            search={search}
            setSearch={(v) => {
              setSearch(v);
              reset();
            }}
            placeholder="Search coupons..."
          />

          <div className="flex items-center gap-2 ml-auto">
            <Dropdown
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(v) => {
                setStatusFilter(v);
                reset();
              }}
            />
            <Dropdown
              value={typeFilter}
              options={TYPE_OPTIONS}
              onChange={(v) => {
                setTypeFilter(v);
                reset();
              }}
            />

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                showFilters
                  ? "border-violet-400 text-violet-600 bg-violet-50"
                  : "border-gray-200 dark:border-slate-800 text-zinc-800 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-400"
              }`}
            >
              <IoFunnelOutline size={15} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-b dark:border-slate-800 text-zinc-800  dark:text-gray-200 bg-gray-100 dark:bg-slate-900">
              {[
                "Coupon Code",
                "Description",
                "Discount",
                "Type",
                "Min. Purchase",
                "Usage Limit",
                "Redeemed",
                "Valid Till",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm"
                >
                  No coupons match your search.
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Code */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${codeColour(c.id)}`}
                    >
                      {c.code}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3.5 dark:text-gray-400 text-gray-500 max-w-[180px] leading-snug">
                    {c.description}
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 font-semibold whitespace-nowrap">
                    {c.discount}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                    {c.type}
                  </td>

                  {/* Min Purchase */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                    {c.minPurchase === 0
                      ? "$0.00"
                      : `$${c.minPurchase.toFixed(2)}`}
                  </td>

                  {/* Usage Limit */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                    {c.usageLimit === null
                      ? "Unlimited"
                      : c.usageLimit.toLocaleString()}
                  </td>

                  {/* Redeemed + progress */}
                  <td className="px-4 py-3.5">
                    <UsageBar redeemed={c.redeemed} limit={c.usageLimit} />
                  </td>

                  {/* Valid Till */}
                  <td className="px-4 py-3.5 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                    {c.validTill}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <IoPencilOutline size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <IoTrashOutline size={15} />
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
            Showing {startRow} to {endRow} of {filtered.length} coupons
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

export default CouponOutlet;
