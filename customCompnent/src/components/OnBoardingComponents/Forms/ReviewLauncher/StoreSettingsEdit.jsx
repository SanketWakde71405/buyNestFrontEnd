import React, { useState } from "react";

// Icons
import { MdOutlinePayments } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { IoCashOutline } from "react-icons/io5";
import { LuRefreshCcw } from "react-icons/lu";

// Components
import InputBox from "../../../InputBox";
import Dropdown from "../../../Dropdown";
import Toggler from "../../../Toggler";

// Services
import StoreApi from "../../../../services/StoreApi";

// Constants 
const PRICING_TYPES = ["inclusive", "exclusive"];

const DELIVERY_ESTIMATES = [
  "1 - 3 Business Days",
  "3 - 5 Business Days",
  "5 - 7 Business Days",
  "7 - 10 Business Days",
  "10 - 14 Business Days",
];

function StoreSettingsEdit({ store, onUpdateSuccess }) {
  // Local editable copy of the "basic" settings only.
  const [basicSettings, setBasicSettings] = useState({
    payment: {
      codOrderLimit: store?.settings?.payment?.codOrderLimit ?? "",
      methods: {
        upi: store?.settings?.payment?.methods?.upi ?? false,
        cards: store?.settings?.payment?.methods?.cards ?? false,
        netBanking: store?.settings?.payment?.methods?.netBanking ?? false,
        cod: store?.settings?.payment?.methods?.cod ?? false,
        wallets: store?.settings?.payment?.methods?.wallets ?? false,
      },
    },
    shipping: {
      freeShippingThreshold:
        store?.settings?.shipping?.freeShippingThreshold ?? "",
      estimatedDeliveryDays:
        store?.settings?.shipping?.estimatedDeliveryDays ?? "",
    },
    tax: {
      gstRegistered: store?.settings?.tax?.gstRegistered ?? false,
      pricingType: store?.settings?.tax?.pricingType ?? "inclusive",
    },
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Handles plain inputs using dot notation, e.g. name="shipping.freeShippingThreshold"
  const handleChange = ({ target }) => {
    const { name, value } = target;
    const [section, field] = name.split(".");

    setBasicSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    if (error) setError("");
  };

  // Handles the payment method toggles. Toggler fires onChange with an
  // event-shaped payload: { target: { name, checked, ... } }.
  const handleMethodToggle = ({ target }) => {
    const { name, checked } = target;

    setBasicSettings((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        // Turning COD off makes the limit meaningless, so zero it out.
        codOrderLimit:
          name === "cod" && !checked ? 0 : prev.payment.codOrderLimit,
        methods: {
          ...prev.payment.methods,
          [name]: checked,
        },
      },
    }));
  };

  const handleGstRegisteredToggle = ({ target }) => {
    setBasicSettings((prev) => ({
      ...prev,
      tax: {
        ...prev.tax,
        gstRegistered: target.checked,
      },
    }));
  };

  const handleEstimatedDeliveryChange = (val) => {
    setBasicSettings((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        estimatedDeliveryDays: val,
      },
    }));
  };

  const handlePricingTypeChange = (val) => {
    setBasicSettings((prev) => ({
      ...prev,
      tax: {
        ...prev.tax,
        pricingType: val,
      },
    }));
  };

  const handleUpdateSettings = async () => {
    setSaving(true);
    setError("");

    // Merge edited basic fields back into the full settings object so
    // advanced fields (payout details, gstin, domesticOnly, etc.) that
    // this component doesn't touch are preserved as-is.
    const mergedSettings = {
      payment: {
        ...store?.settings?.payment,
        codOrderLimit: Number(basicSettings.payment.codOrderLimit) || 0,
        methods: {
          ...store?.settings?.payment?.methods,
          ...basicSettings.payment.methods,
        },
      },
      shipping: {
        ...store?.settings?.shipping,
        freeShippingThreshold:
          Number(basicSettings.shipping.freeShippingThreshold) || 0,
        estimatedDeliveryDays: basicSettings.shipping.estimatedDeliveryDays,
      },
      tax: {
        ...store?.settings?.tax,
        gstRegistered: basicSettings.tax.gstRegistered,
        pricingType: basicSettings.tax.pricingType,
      },
    };

    try {
      const response = await StoreApi.updateStoreSettings(mergedSettings);
      onUpdateSuccess?.();
      console.log("Store settings updated successfully.", response);
    } catch (err) {
      console.error("Failed to update store settings", err?.message);
      setError(err?.message || "Failed to update store settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 justify-start items-end border borde-gray-200 rounded-lg dark:border-slate-700 px-4 py-2">
      <div className="flex flex-col gap-6 w-full px-4 py-2">
        {/* Payment */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <MdOutlinePayments size={20} className="text-indigo-600" />
            <span className="text-zinc-800 dark:text-gray-200 font-medium">
              Payment
            </span>
          </div>

          <div className="grid grid-flow-row grid-cols-2 gap-x-6">
            <div className="flex flex-row items-center justify-between gap-4 py-2">
              <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
                UPI
              </span>
              <Toggler
                name="upi"
                checked={basicSettings.payment.methods.upi}
                onChange={handleMethodToggle}
                showLabel={false}
                showStatusText={false}
              />
            </div>

            <div className="flex flex-row items-center justify-between gap-4 py-2">
              <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
                Cards
              </span>
              <Toggler
                name="cards"
                checked={basicSettings.payment.methods.cards}
                onChange={handleMethodToggle}
                showLabel={false}
                showStatusText={false}
              />
            </div>

            <div className="flex flex-row items-center justify-between gap-4 py-2">
              <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
                Net Banking
              </span>
              <Toggler
                name="netBanking"
                checked={basicSettings.payment.methods.netBanking}
                onChange={handleMethodToggle}
                showLabel={false}
                showStatusText={false}
              />
            </div>

            <div className="flex flex-row items-center justify-between gap-4 py-2">
              <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
                Cash on Delivery
              </span>
              <Toggler
                name="cod"
                checked={basicSettings.payment.methods.cod}
                onChange={handleMethodToggle}
                showLabel={false}
                showStatusText={false}
              />
            </div>

            <div className="flex flex-row items-center justify-between gap-4 py-2">
              <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
                Wallets
              </span>
              <Toggler
                name="wallets"
                checked={basicSettings.payment.methods.wallets}
                onChange={handleMethodToggle}
                showLabel={false}
                showStatusText={false}
              />
            </div>
          </div>

          <InputBox
            label="COD Order Limit"
            labelClassName="text-xs"
            name="payment.codOrderLimit"
            type="number"
            icon={<IoCashOutline size={20} />}
            placeholder="Maximum order value eligible for COD"
            value={basicSettings.payment.codOrderLimit}
            onChange={handleChange}
            disabled={!basicSettings.payment.methods.cod}
          />
        </div>

        {/* Shipping */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <TbTruckDelivery size={20} className="text-indigo-600" />
            <span className="text-zinc-800 dark:text-gray-200 font-medium">
              Shipping
            </span>
          </div>

          <div className="grid grid-flow-row grid-cols-2 gap-2">
            <InputBox
              label="Free Shipping Threshold"
              labelClassName="text-xs"
              name="shipping.freeShippingThreshold"
              type="number"
              notOptional
              icon={<TbTruckDelivery size={20} />}
              placeholder="Order value above which shipping is free"
              value={basicSettings.shipping.freeShippingThreshold}
              onChange={handleChange}
            />

            <div className="flex flex-col gap-3 pt-2">
              <label
                htmlFor="Estimated Delivery"
                className="flex gap-2 text-zinc-800 dark:text-gray-200 font-medium text-base"
              >
                Estimated Delivery
              </label>
              <Dropdown
                value={basicSettings.shipping.estimatedDeliveryDays}
                onChange={handleEstimatedDeliveryChange}
                options={DELIVERY_ESTIMATES}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Tax */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center gap-2">
            <LiaFileInvoiceDollarSolid size={20} className="text-indigo-600" />
            <span className="text-zinc-800 dark:text-gray-200 font-medium">
              Tax
            </span>
          </div>

          <div className="flex flex-row items-center justify-between gap-4 py-2">
            <span className="text-zinc-800 dark:text-gray-200 text-sm font-medium">
              GST Registered
            </span>
            <Toggler
              name="gstRegistered"
              checked={basicSettings.tax.gstRegistered}
              onChange={handleGstRegisteredToggle}
              showLabel={false}
              showStatusText={false}
            />
          </div>

          <div className="flex flex-col gap-3 my-2">
            <label
              htmlFor="Pricing Type"
              className="flex gap-2 text-zinc-800 dark:text-gray-200 font-medium text-sm"
            >
              Pricing Type
            </label>
            <Dropdown
              value={basicSettings.tax.pricingType}
              onChange={handlePricingTypeChange}
              options={PRICING_TYPES}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {error && (
        <span className="text-red-500 text-sm font-medium px-4">{error}</span>
      )}

      <button
        type="button"
        onClick={handleUpdateSettings}
        disabled={saving}
        className="flex flex-row gap-2 justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-white font-semibold">
          {saving ? "Updating..." : "Update Settings"}
        </span>
        <LuRefreshCcw className="text-white font-semibold" size={20} />
      </button>
    </div>
  );
}

export default StoreSettingsEdit;
