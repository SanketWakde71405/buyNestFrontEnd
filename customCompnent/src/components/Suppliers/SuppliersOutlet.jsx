import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useTheme from "../../contexts/ThemeContext";

// Icons
import { LuUsers, LuUserPlus, LuWallet } from "react-icons/lu";
import {
  IoAlertCircleOutline,
  IoEyeOutline,
  IoTrashOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

// Services
import SupplierApi from "../../services/SupplierApi.js";

// Components
import ButtonIcon from "../ButtonIcon";
import Pagination from "../Pagination";
import Dropdown from "../Dropdown";
import SearchBar from "../SearchBar";
import DatePicker from "../DatePicker";
import EditSupplierDetails from "./EditSupplierDetails";

const SUPPLIERS_PER_PAGE = 10;
const PAYMENT_STATUS_OPTIONS = ["All Payment Status", "Pending", "Settled"];

// A handful of Tailwind color pairs to cycle avatar initials through, so
// suppliers get some visual variety without the backend needing to store a
// color for each one.
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic (not random) so the same supplier always gets the same
// avatar color across re-renders and pages.
function getAvatarColor(seed = "") {
  const sum = seed
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// contactDetails might come back as a plain string, or as an object with
// phone/email — handle both without assuming which.
function formatContactDetails(contactDetails) {
  if (!contactDetails) return "—";
  if (typeof contactDetails === "string") return contactDetails;
  const parts = [contactDetails.phone, contactDetails.email].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function PendingBadge({ amount }) {
  const isSettled = !amount || amount <= 0;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        isSettled
          ? "bg-green-50 text-green-600 border-green-100"
          : "bg-red-50 text-red-500 border-red-100"
      }`}
    >
      {isSettled ? "Settled" : formatCurrency(amount)}
    </span>
  );
}

// A small, self-contained stat card built for this screen — no external
// Card import, just markup that lives alongside the rest of the outlet.
function StatCard({ icon, iconBackground, cardName, cardDesc }) {
  return (
    <div className="flex flex-1 items-center gap-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border dark:border-slate-800 rounded-xl shadow-sm px-4 py-3">
      <span
        className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBackground}`}
      >
        {icon}
      </span>
      <div className="flex flex-col justify-center leading-tight">
        <span className="text-zinc-800 dark:text-gray-200 font-semibold text-xl">
          {cardName}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-xs">
          {cardDesc}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function SuppliersOutlet() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // The row being edited in EditSupplierDetails — null means the modal
  // is closed. This one component now covers both the profile fields
  // and the pending amount, so there's a single source of truth here.
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("All Payment Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupplierApi.getAllSuppliers();
      setSuppliers(data || []);
    } catch (err) {
      setError(err?.message || "Couldn't load suppliers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const resetPage = () => setCurrentPage(1);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    resetPage();
  };

  // NOTE: "/suppliers/add" and `/suppliers/${id}` are assumed route names —
  // point these at whatever your router actually uses for the create/detail
  // supplier pages.
  const handleAddSupplier = () => navigate("/suppliers/add");
  const handleViewSupplier = (supplier) =>
    navigate(`/suppliers/${supplier._id}`);

  const handleDeleteSupplier = async (supplier) => {
    const confirmed = window.confirm(
      `Remove ${supplier.supplierName} from your suppliers? This can't be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(supplier._id);
    try {
      await SupplierApi.deleteSupplier(supplier._id);
      setSuppliers((prev) => prev.filter((s) => s._id !== supplier._id));
    } catch (err) {
      setError(err?.message || "Couldn't delete that supplier.");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditSupplier = (supplier) => setEditingSupplier(supplier);
  const closeEditSupplier = () => setEditingSupplier(null);

  // Called by EditSupplierDetails once it has successfully saved — merges
  // the returned supplier straight into local state so the table (and the
  // stat cards, which derive from `suppliers`) update without a refetch.
  const handleSupplierUpdated = (updatedSupplier) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s._id === updatedSupplier._id ? { ...s, ...updatedSupplier } : s,
      ),
    );
    setEditingSupplier(null);
  };

  const filtered = useMemo(() => {
    return suppliers.filter((supplier) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        supplier.supplierName?.toLowerCase().includes(q) ||
        supplier.contactPerson?.toLowerCase().includes(q);

      const pending = Number(supplier.pendingAmount || 0);
      const matchStatus =
        paymentStatus === "All Payment Status" ||
        (paymentStatus === "Pending" && pending > 0) ||
        (paymentStatus === "Settled" && pending <= 0);

      let matchDate = true;
      if (startDate && supplier.createdAt) {
        const added = new Date(supplier.createdAt);
        added.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          matchDate = added >= start && added <= end;
        } else {
          matchDate = added.getTime() === start.getTime();
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [suppliers, search, paymentStatus, startDate, endDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / SUPPLIERS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pageSuppliers = filtered.slice(
    (safePage - 1) * SUPPLIERS_PER_PAGE,
    safePage * SUPPLIERS_PER_PAGE,
  );

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // ── Stat cards — every number here comes from the suppliers actually
  // loaded, nothing hardcoded. ──
  const totalSuppliers = suppliers.length;

  const newSuppliersCount = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return suppliers.filter(
      (s) => s.createdAt && new Date(s.createdAt) >= cutoff,
    ).length;
  }, [suppliers]);

  const pendingSuppliersCount = useMemo(
    () => suppliers.filter((s) => Number(s.pendingAmount || 0) > 0).length,
    [suppliers],
  );

  const totalPendingAmount = useMemo(
    () => suppliers.reduce((sum, s) => sum + Number(s.pendingAmount || 0), 0),
    [suppliers],
  );

  const statCards = [
    {
      id: "suppliers_total",
      icon: <LuUsers className="text-violet-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-indigo-950" : "bg-violet-100",
      cardName: String(totalSuppliers),
      cardDesc: "Total Suppliers",
    },
    {
      id: "suppliers_new",
      icon: <LuUserPlus className="text-green-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-teal-950" : "bg-green-100",
      cardName: String(newSuppliersCount),
      cardDesc: "New in last 30 days",
    },
    {
      id: "suppliers_pending",
      icon: <IoAlertCircleOutline className="text-orange-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-stone-900" : "bg-orange-100",
      cardName: String(pendingSuppliersCount),
      cardDesc: "With Pending Dues",
    },
    {
      id: "suppliers_pending_amount",
      icon: <LuWallet className="text-sky-600" size={28} />,
      iconBackground: theme === "dark" ? "bg-slate-800" : "bg-sky-100",
      cardName: formatCurrency(totalPendingAmount),
      cardDesc: "Total Pending Amount",
    },
  ];

  return (
    <div className="flex flex-col w-full px-3 py-2 mx-4 my-2">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between gap-3 items-center">
        <div className="flex flex-col justify-start items-start">
          <span className="text-zinc-800 dark:text-gray-200 font-semibold text-2xl">
            Suppliers
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            View and manage your suppliers
          </span>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center m-4">
          <ButtonIcon
            text="Add Supplier"
            icon={<LuUserPlus size={20} />}
            onClick={handleAddSupplier}
          />
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="flex flex-row gap-2 justify-center items-center pr-4 py-1">
        {statCards.map((card) => (
          <StatCard
            key={card.id}
            icon={card.icon}
            iconBackground={card.iconBackground}
            cardName={card.cardName}
            cardDesc={card.cardDesc}
          />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="mt-4 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-b dark:border-slate-800 flex-wrap">
          {/* Search */}
          <SearchBar
            search={search}
            setSearch={setSearch}
            placeholder="Search suppliers..."
            onSearch={() => resetPage()}
          />

          {/* Payment status */}
          <Dropdown
            value={paymentStatus}
            options={PAYMENT_STATUS_OPTIONS}
            onChange={(v) => {
              setPaymentStatus(v);
              resetPage();
            }}
          />

          {/* Added-on date range */}
          <DatePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            placeholder="Select added-on range"
          />

          {/* Filter */}
          <button className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-950 hover:border-indigo-600 hover:text-indigo-600 dark:hover-text-indigo-400 dark:hover:border-indigo-400 transition-colors ml-auto">
            <CiFilter size={18} />
            <span>Filter</span>
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-800 dark:text-gray-200 bg-gray-100 dark:bg-slate-900 uppercase tracking-wide border-b border-gray-100 dark:border-b dark:border-slate-800">
                <th className="px-4 py-3 text-left font-medium">Supplier</th>
                <th className="px-4 py-3 text-left font-medium">
                  Contact Person
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Contact Details
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Pending Amount
                </th>
                <th className="px-4 py-3 text-left font-medium">Added On</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-y dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    Loading suppliers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-red-500 text-sm"
                  >
                    {error}
                  </td>
                </tr>
              ) : pageSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No suppliers match your filters.
                  </td>
                </tr>
              ) : (
                pageSuppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Supplier */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(
                            supplier.supplierName || supplier._id,
                          )}`}
                        >
                          {getInitials(supplier.supplierName) || "?"}
                        </span>
                        <span className="text-zinc-800 dark:text-gray-200 font-medium leading-tight">
                          {supplier.supplierName}
                        </span>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200">
                      {supplier.contactPerson || "—"}
                    </td>

                    {/* Contact Details */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                      {formatContactDetails(supplier.contactDetails)}
                    </td>

                    {/* Pending Amount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <PendingBadge amount={supplier.pendingAmount} />
                    </td>

                    {/* Added On */}
                    <td className="px-4 py-4 text-zinc-800 dark:text-gray-200 whitespace-nowrap">
                      {supplier.createdAt
                        ? new Date(supplier.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSupplier(supplier)}
                          className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-colors"
                        >
                          <IoEyeOutline size={16} />
                        </button>
                        <button
                          onClick={() => openEditSupplier(supplier)}
                          title="Edit supplier"
                          className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-sky-400 hover:text-sky-600 transition-colors"
                        >
                          <IoPencilOutline size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier)}
                          disabled={deletingId === supplier._id}
                          className="p-1.5 rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-t dark:border-slate-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            {filtered.length === 0
              ? 0
              : (safePage - 1) * SUPPLIERS_PER_PAGE + 1}{" "}
            to {Math.min(safePage * SUPPLIERS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} suppliers
          </span>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* ── Edit Supplier Modal ── */}
      {editingSupplier && (
        <EditSupplierDetails
          supplier={editingSupplier}
          onClose={closeEditSupplier}
          onUpdated={handleSupplierUpdated}
        />
      )}
    </div>
  );
}

export default SuppliersOutlet;
