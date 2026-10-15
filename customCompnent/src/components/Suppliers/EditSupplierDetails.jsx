import React, { useState } from "react";

// Icons
import {
  IoClose,
  IoBusinessOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoWalletOutline,
} from "react-icons/io5";

// Services
import SupplierApi from "../../services/SupplierApi.js";

// Components
import InputBox from "../InputBox";
import ButtonIcon from "../ButtonIcon";

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

// Pending-amount mode, selected via pill buttons rather than a dropdown.
const PENDING_MODES = [
  { value: "add", label: "Add due" },
  { value: "subtract", label: "Record payment" },
  { value: "set", label: "Set exact" },
];

/**
 * Modal for editing a supplier's profile fields (name, contact person,
 * contact details) and, optionally, their pending amount — in one save.
 *
 * Props:
 *  - supplier: the supplier object being edited (required)
 *  - onClose(): called when the modal should close without changes
 *  - onUpdated(updatedSupplier): called with the merged, saved supplier
 *    once every requested change has been persisted
 */
function EditSupplierDetails({ supplier, onClose, onUpdated }) {
  const [supplierName, setSupplierName] = useState(
    supplier?.supplierName || "",
  );
  const [contactPerson, setContactPerson] = useState(
    supplier?.contactPerson || "",
  );
  const [email, setEmail] = useState(supplier?.contactDetails?.email || "");
  const [phone, setPhone] = useState(supplier?.contactDetails?.phone || "");
  const [address, setAddress] = useState(
    supplier?.contactDetails?.address || "",
  );

  // Pending amount is optional to touch: leaving the amount field blank
  // means "don't change it", so a details-only edit doesn't force a
  // pending-amount write.
  const [pendingMode, setPendingMode] = useState("add");
  const [pendingAmountInput, setPendingAmountInput] = useState("");

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!supplierName.trim()) {
      setFormError("Supplier name is required.");
      return;
    }

    const wantsPendingUpdate = pendingAmountInput.trim() !== "";
    let pendingAmountNum = null;
    if (wantsPendingUpdate) {
      pendingAmountNum = Number(pendingAmountInput);
      if (isNaN(pendingAmountNum) || pendingAmountNum < 0) {
        setFormError("Enter a valid, non-negative pending amount.");
        return;
      }
    }

    setSaving(true);
    try {
      // 1. Save the profile fields.
      const detailsResponse = await SupplierApi.updateSupplierDetails(
        supplier._id,
        {
          supplierName: supplierName.trim(),
          contactPerson: contactPerson.trim(),
          contactDetails: {
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
        },
      );

      let finalSupplier = detailsResponse?.data ??
        detailsResponse ?? {
          ...supplier,
          supplierName: supplierName.trim(),
          contactPerson: contactPerson.trim(),
          contactDetails: {
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
          },
        };

      // 2. If a pending-amount change was requested, save that separately —
      // it's its own endpoint with its own add/subtract/set semantics.
      if (wantsPendingUpdate) {
        const pendingResponse = await SupplierApi.updateSupplierPendingAmount(
          supplier._id,
          pendingAmountNum,
          pendingMode,
        );
        const pendingSupplier = pendingResponse?.data ?? pendingResponse;
        finalSupplier = { ...finalSupplier, ...pendingSupplier };
      }

      onUpdated?.(finalSupplier);
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = () => {
    if (!saving) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-xl shadow-lg p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-zinc-800 dark:text-gray-200 font-semibold text-base">
              Edit Supplier
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
              {supplier?.supplierName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !saving && onClose?.()}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <InputBox
            label="Supplier Name"
            notOptional
            icon={<IoBusinessOutline size={18} />}
            placeholder="Supplier name"
            name="supplierName"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />

          <InputBox
            label="Contact Person"
            icon={<IoPersonOutline size={18} />}
            placeholder="Contact person"
            name="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />

          <div className="flex gap-3">
            <InputBox
              label="Email"
              icon={<IoMailOutline size={18} />}
              type="email"
              placeholder="email@example.com"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputBox
              label="Phone"
              icon={<IoCallOutline size={18} />}
              placeholder="Phone number"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <InputBox
            label="Address"
            icon={<IoLocationOutline size={18} />}
            placeholder="Address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* ── Pending amount (optional) ── */}
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-base text-zinc-800 dark:text-gray-200 font-bold py-2">
                Pending Amount
              </span>
              <span className="text-xs text-zinc-800 dark:text-gray-200 font-medium">
                Current: {formatCurrency(supplier?.pendingAmount)}
              </span>
            </div>

            <div className="flex gap-2 mb-2">
              {PENDING_MODES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPendingMode(opt.value)}
                  className={`flex-1 text-xs font-medium rounded-lg border px-2 py-2 transition-colors ${
                    pendingMode === opt.value
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : "border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <InputBox
              label="Amount (₹)"
              icon={<IoWalletOutline size={18} />}
              type="number"
              placeholder="Leave blank to leave unchanged"
              name="pendingAmount"
              value={pendingAmountInput}
              onChange={(e) => setPendingAmountInput(e.target.value)}
            />
          </div>

          {formError && (
            <p className="text-xs text-red-500 mt-1">{formError}</p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <ButtonIcon
              text="Cancel"
              type="button"
              disabled={saving}
              onClick={() => !saving && onClose?.()}
              className="!bg-none bg-gray-100 !text-gray-700 hover:!from-gray-100 hover:!via-gray-100 hover:!to-gray-100 dark:bg-slate-800 dark:!text-gray-200"
            />
            <ButtonIcon
              text={saving ? "Saving..." : "Save changes"}
              type="submit"
              disabled={saving}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSupplierDetails;
