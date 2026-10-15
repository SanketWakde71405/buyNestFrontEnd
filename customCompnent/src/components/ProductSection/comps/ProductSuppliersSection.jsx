import { useEffect, useMemo, useState } from "react";
import {
  IoAddCircleOutline,
  IoAlertCircleOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline,
  IoBusinessOutline,
} from "react-icons/io5";

import SupplierApi from "../../../services/SupplierApi.js";
import SectionCard from "../../SectionCard.jsx";

/* ------------------------------------------------------------------ */
/* Helpers shared by Add / Edit flows                                  */
/* ------------------------------------------------------------------ */

// API product.suppliers -> editable rows (inputs stay strings).
export const toSupplierRows = (suppliers = []) =>
  suppliers.map((s) => {
    const populated = s.supplier && typeof s.supplier === "object";
    return {
      supplier: populated ? s.supplier._id : s.supplier,
      supplierInfo: populated ? s.supplier : null,
      costPrice: s.costPrice ?? "",
      leadTimeDays: s.leadTimeDays ?? "",
      minOrderQty: s.minOrderQty ?? "",
      isPrimary: Boolean(s.isPrimary),
    };
  });

// Editable rows -> payload for createProduct / updateProductSuppliers.
export const buildSuppliersPayload = (rows) =>
  rows.map((r) => ({
    supplier: r.supplier,
    costPrice: Number(r.costPrice),
    ...(r.leadTimeDays !== "" && { leadTimeDays: Number(r.leadTimeDays) }),
    ...(r.minOrderQty !== "" && { minOrderQty: Number(r.minOrderQty) }),
    isPrimary: r.isPrimary,
  }));

// Mirrors the backend rules so the user sees errors before the request.
// Returns { [rowIndex]: { costPrice?, leadTimeDays?, minOrderQty? } }.
export const validateSuppliers = (rows) => {
  const errors = {};
  rows.forEach((r, i) => {
    const e = {};
    if (r.costPrice === "" || isNaN(Number(r.costPrice))) {
      e.costPrice = "Cost price is required.";
    } else if (Number(r.costPrice) < 0) {
      e.costPrice = "Cost can't be negative.";
    }
    if (
      r.leadTimeDays !== "" &&
      (isNaN(Number(r.leadTimeDays)) || Number(r.leadTimeDays) < 0)
    ) {
      e.leadTimeDays = "Use 0 or more days.";
    }
    if (
      r.minOrderQty !== "" &&
      (isNaN(Number(r.minOrderQty)) || Number(r.minOrderQty) < 1)
    ) {
      e.minOrderQty = "Must be at least 1.";
    }
    if (Object.keys(e).length) errors[i] = e;
  });
  return errors;
};

export const getPrimaryCost = (rows) => {
  const primary = rows.find((r) => r.isPrimary) || rows[0];
  if (!primary || primary.costPrice === "") return null;
  return Number(primary.costPrice);
};

const rupee = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-100";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * value:               rows (see toSupplierRows)
 * onChange(rows):      called with the next rows
 * errors:              output of validateSuppliers
 * sellingPrice:        number, used for the per-supplier margin preview
 * suggestedSupplierId: optional — the brand's official distributor
 */
export default function ProductSuppliersSection({
  value,
  onChange,
  errors = {},
  sellingPrice = null,
  suggestedSupplierId = null,
}) {
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pickId, setPickId] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await SupplierApi.getAllSuppliers();
        const list = Array.isArray(res)
          ? res
          : res?.suppliers || res?.docs || res?.data || [];
        if (!cancelled) setAllSuppliers(list);
      } catch (err) {
        if (!cancelled)
          setLoadError(
            err.response?.data?.message || "Couldn't load suppliers.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(
    () => new Map(allSuppliers.map((s) => [s._id, s])),
    [allSuppliers],
  );
  const linkedIds = new Set(value.map((r) => r.supplier));
  const available = allSuppliers.filter((s) => !linkedIds.has(s._id));
  const suggested =
    suggestedSupplierId &&
    !linkedIds.has(suggestedSupplierId) &&
    byId.get(suggestedSupplierId);

  const addSupplier = (id) => {
    const info = byId.get(id);
    if (!info || linkedIds.has(id)) return;
    onChange([
      ...value,
      {
        supplier: id,
        supplierInfo: info,
        costPrice: "",
        leadTimeDays: "",
        minOrderQty: "",
        isPrimary: value.length === 0,
      },
    ]);
    setPickId("");
  };

  const updateRow = (index, patch) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const setPrimary = (index) =>
    onChange(value.map((r, i) => ({ ...r, isPrimary: i === index })));

  const removeRow = (index) => {
    const next = value.filter((_, i) => i !== index);
    if (next.length && !next.some((r) => r.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  };

  return (
    <SectionCard
      icon={IoBusinessOutline}
      title="Suppliers"
      description="Who provides this product, and at what cost."
      action={
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
          {value.length} linked
        </span>
      }
    >
      {/* Rows */}
      {value.length === 0 ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
          <IoAlertCircleOutline
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            size={16}
          />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            No supplier linked yet. Without one, cost and profit can&apos;t be
            calculated for this product.
          </p>
        </div>
      ) : (
        <div className="mb-4 flex flex-col gap-3">
          {value.map((row, i) => {
            const info = byId.get(row.supplier) || row.supplierInfo;
            const cost = row.costPrice === "" ? null : Number(row.costPrice);
            const margin =
              sellingPrice != null && cost != null && !isNaN(cost)
                ? sellingPrice - cost
                : null;
            const marginPct =
              margin != null && sellingPrice > 0
                ? (margin / sellingPrice) * 100
                : null;
            const rowErr = errors[i] || {};

            return (
              <div
                key={row.supplier}
                className={`rounded-xl border p-3 ${
                  row.isPrimary
                    ? "border-indigo-300 bg-indigo-50/40 dark:border-indigo-500/40 dark:bg-slate-800/40"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-gray-100">
                      {info?.supplierName || "Unknown supplier"}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {[
                        info?.contactPerson,
                        info?.contactDetails?.email,
                        info?.contactDetails?.phone,
                      ]
                        .filter(Boolean)
                        .join(" • ") || "No contact details"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      title={
                        row.isPrimary ? "Primary supplier" : "Make primary"
                      }
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        row.isPrimary
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-gray-300"
                      }`}
                    >
                      {row.isPrimary ? (
                        <IoStar size={12} />
                      ) : (
                        <IoStarOutline size={12} />
                      )}
                      {row.isPrimary ? "Primary" : "Make primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      title="Unlink supplier"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-slate-800"
                    >
                      <IoTrashOutline size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                      Cost price (₹) <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="number"
                      min="0"
                      className={inputCls}
                      placeholder="0.00"
                      value={row.costPrice}
                      onChange={(e) =>
                        updateRow(i, { costPrice: e.target.value })
                      }
                    />
                    {rowErr.costPrice && (
                      <p className="mt-1 text-xs text-red-500">
                        {rowErr.costPrice}
                      </p>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                      Lead time (days)
                    </span>
                    <input
                      type="number"
                      min="0"
                      className={inputCls}
                      placeholder="Optional"
                      value={row.leadTimeDays}
                      onChange={(e) =>
                        updateRow(i, { leadTimeDays: e.target.value })
                      }
                    />
                    {rowErr.leadTimeDays && (
                      <p className="mt-1 text-xs text-red-500">
                        {rowErr.leadTimeDays}
                      </p>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-gray-300">
                      Min. order qty
                    </span>
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      placeholder="Optional"
                      value={row.minOrderQty}
                      onChange={(e) =>
                        updateRow(i, { minOrderQty: e.target.value })
                      }
                    />
                    {rowErr.minOrderQty && (
                      <p className="mt-1 text-xs text-red-500">
                        {rowErr.minOrderQty}
                      </p>
                    )}
                  </label>
                </div>

                {margin != null && (
                  <p
                    className={`mt-2 text-xs ${
                      margin < 0
                        ? "text-red-500 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {margin < 0 ? "Loss" : "Profit"} of{" "}
                    {rupee(Math.abs(margin))} per unit
                    {marginPct != null &&
                      ` (${marginPct.toFixed(1)}% margin)`}{" "}
                    at this cost.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add control */}
      {loading && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Loading suppliers…
        </p>
      )}
      {loadError && <p className="text-xs text-red-500">{loadError}</p>}

      {!loading && !loadError && (
        <>
          {suggested && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
              <span>
                <strong>{suggested.supplierName}</strong> is this brand&apos;s
                distributor.
              </span>
              <button
                type="button"
                onClick={() => addSupplier(suggested._id)}
                className="font-medium underline underline-offset-2"
              >
                Link supplier
              </button>
            </div>
          )}

          {available.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {allSuppliers.length === 0
                ? "No suppliers exist yet. Create one on the Suppliers page first."
                : "Every supplier is already linked to this product."}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={pickId}
                onChange={(e) => setPickId(e.target.value)}
                className={inputCls}
              >
                <option value="">Select a supplier to link</option>
                {available.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!pickId}
                onClick={() => addSupplier(pickId)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <IoAddCircleOutline size={16} /> Link
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        The primary supplier&apos;s cost is what product profit is calculated
        from. A product can have several suppliers, each with its own terms.
      </p>
    </SectionCard>
  );
}
