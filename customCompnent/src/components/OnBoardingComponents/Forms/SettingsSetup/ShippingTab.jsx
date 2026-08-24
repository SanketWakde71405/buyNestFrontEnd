import React, { useEffect, useState } from "react";

import { LuTruck } from "react-icons/lu";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import IndianMap from "../../../../assets/india-map.svg?react";
import IndianMapDark from "../../../../assets/india-map-dark.svg?react";
import { IoEarth } from "react-icons/io5";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import useTheme from "../../../../contexts/ThemeContext.jsx";
import Toggler from "../../../Toggler.jsx";
import InputBox from "../../../InputBox.jsx";
import Dropdown from "../../../Dropdown.jsx";
import StoreApi from "../../../../services/StoreApi.js";

function ShippingTab({ onBack, onNext }) {
  const [freeShippingOption, setFreeShipingOption] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(
    "3 - 5 Business Days",
  );

  const [selection, setSelection] = useState("Domestic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { theme } = useTheme();

  const deliveryTimeOptions = [
    "1 - 2 Business Days",
    "3 - 5 Business Days",
    "5 - 7 Business Days",
    "7 - 10 Business Days",
  ];

  // Load whatever shipping settings already exist for this store so the
  // form isn't reset to defaults every time the admin revisits this tab.
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await StoreApi.getMyStore();
        const store = response?.data || response;
        const shipping = store?.settings?.shipping;

        if (cancelled || !shipping) return;

        setSelection(
          shipping.domesticOnly === false ? "International" : "Domestic",
        );

        if (shipping.freeShippingThreshold != null) {
          setFreeShipingOption(true);
          setFreeShippingThreshold(String(shipping.freeShippingThreshold));
        } else {
          setFreeShipingOption(false);
          setFreeShippingThreshold("");
        }

        if (shipping.estimatedDeliveryDays) {
          setEstimatedDeliveryTime(shipping.estimatedDeliveryDays);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load current settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleThresholdChange = ({ target }) => {
    setFreeShippingThreshold(target.value);

    if (error) {
      setError("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      // Toggle off → no threshold at all (schema has no separate
      // "enabled" flag, so null threshold *is* "disabled").
      const threshold =
        freeShippingOption && freeShippingThreshold !== ""
          ? Number(freeShippingThreshold)
          : null;

      if (freeShippingOption && (threshold === null || threshold < 0)) {
        throw new Error("Enter a valid free shipping amount");
      }

      const response = await StoreApi.updateStoreSettings({
        shipping: {
          domesticOnly: selection === "Domestic",
          freeShippingThreshold: threshold,
          estimatedDeliveryDays: estimatedDeliveryTime,
        },
      });

      onNext?.(response?.data || response);
    } catch (err) {
      setError(err?.message || "Failed to save shipping settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <AiOutlineLoading3Quarters
          size={28}
          className="animate-spin text-indigo-600"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 w-full my-2">
        <div className="flex flex-col gap-2 w-[70%]">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <span className="text-zinc-800 dark:text-gray-200 text-base font-semibold">
              Shipping Preferences
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
              Set up how you deliver orders to your customers.
            </span>
          </div>

          <div className="grid grid-flow-row grid-cols-2 gap-2 my-2">
            {/* First Card  */}
            <div className="flex flex-col gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border dark:border-slate-700">
              <span className="text-sm text-zinc-800 dark:text-gray-200 font-medium">
                Shipping zones.
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Choose the regions you want to ship to.
              </span>
              <div
                onClick={() => {
                  setSelection("Domestic");
                }}
                className={`px-4 flex flex-row gap-2 py-2 m-2 border  items-center rounded-lg ${selection === "Domestic" ? "border-indigo-600" : "border-gray-200 dark:border-slate-700"}`}
              >
                {selection === "Domestic" ? (
                  <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
                ) : (
                  <MdOutlineRadioButtonUnchecked
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                )}

                <div className="w-16 h-16 p-2">
                  {theme === "dark" ? (
                    <IndianMapDark className="w-10 h-10 object-cover" />
                  ) : (
                    <IndianMap className="w-10 h-10 object-cover" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-800 dark:text-gray-200">
                    Domestic Only.
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ship orders within India only.
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  setSelection("International");
                }}
                className={`px-4 flex flex-row gap-2 py-2 m-2 border border-gray-200 dark:border items-center rounded-lg ${selection === "International" ? "border-indigo-600" : "border-gray-200 dark:border-slate-700"}`}
              >
                {selection === "International" ? (
                  <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
                ) : (
                  <MdOutlineRadioButtonUnchecked
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                )}
                <div className="w-16 h-16 p-2">
                  <IoEarth className="w-10 h-10 object-cover text-zinc-800 dark:text-gray-200" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-zinc-800 dark:text-gray-200">
                    Domestic + International.
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ship within India and to international locations.
                  </span>
                </div>
              </div>
            </div>

            {/* Second card  */}
            <div className="flex flex-col gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border dark:border-slate-700">
              <span className="text-sm text-zinc-800 dark:text-gray-200 font-medium">
                Free Shipping.
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Offer free shipping on orders above a certain amount.
              </span>
              <div className="flex flex-row justify-between items-start my-2 pt-5">
                <span className="font-medium text-sm text-zinc-800 dark:text-gray-200">
                  Enable free shipping.
                </span>

                <Toggler
                  name="freeShipping"
                  checked={freeShippingOption}
                  onChange={() => {
                    setFreeShipingOption((prev) => !prev);
                  }}
                  showLabel={false}
                  showStatusText={false}
                />
              </div>

              <div className="flex flex-col gap-1">
                <InputBox
                  label="Free Shipping on orders above"
                  labelClassName="text-xs"
                  className="border-gray-100 dark:bg-gray-900"
                  placeholder={0.0}
                  icon={<FaIndianRupeeSign size={20} />}
                  type="number"
                  name="freeShippingThreshold"
                  value={freeShippingThreshold}
                  onChange={handleThresholdChange}
                  disabled={!freeShippingOption}
                />
                <span className="text-gray-500 dark:text-gray-400 text-xs font-light">
                  Orders above this amount will get free shipping.
                </span>
              </div>
            </div>

            {/* Third Card */}
            <div className="flex flex-col gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border dark:border-slate-700">
              <span className="text-sm text-zinc-800 dark:text-gray-200 font-medium">
                Estimated delivery time.
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Set the estimated time it takes to deliver orders.
              </span>

              <div className="flex flex-col gap-1 my-2">
                <span className="text-xs text-zinc-800 dark:text-gray-200 font-medium">
                  Estimated Delivery Time
                </span>

                <Dropdown
                  value={estimatedDeliveryTime}
                  options={deliveryTimeOptions}
                  onChange={setEstimatedDeliveryTime}
                  className="w-full"
                />

                <span className="text-gray-500 dark:text-gray-400 text-xs font-light">
                  This will be shown to customers at checkout.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border dark:border-slate-700">
              <span className="text-sm text-zinc-800 dark:text-gray-200 font-medium">
                Shipping Rates
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Define shopping charges based on order value or weight.
              </span>

              <div className="flex flex-row gap-2 m-1 w-full px-4 py-2 bg-violet-100 rounded-lg dark:bg-slate-950 border border-gray-200 dark:border dark:border-slate-700">
                <div className="flex justify-center w-10 h-10 items-center rounded-full bg-violet-200 dark:bg-slate-800">
                  <LuTruck className="text-indigo-600" size={20} />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                    Manage Shipping Rates
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    Add multiple rate tiers, based on order value, weight or
                    location.
                  </span>

                  <button className="px-4 py-2 flex w-[50%] justify-start rounded-lg border border-gray-200 bg-white dark:bg-transparent dark:border dark:border-slate-600 items-start gap-2">
                    <span className="text-indigo-600 text-base font-semibold">
                      Manage Rates
                    </span>
                    <IoIosArrowRoundForward
                      className="text-indigo-600"
                      size={25}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-[30%] justify-center items-start px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-950 mb-2 mt-16 border border-gray-200 dark:border dark:border-slate-700">
          <div className="flex w-full justify-center items-center">
            <img
              src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786354879/shipping_nrxi7v.png"
              alt="shipping.png"
              className="w-85 object-cover"
            />
          </div>

          <span className="text-zinc-800 dark:text-gray-200 font-bold">
            Shipping made simple
          </span>

          {/* Bullet points */}
          <div className="flex flex-col gap-5 my-2">
            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Configure shipping zones and rates
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Offer free shipping to boost sales
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Provide accurate delivery estimates
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Manage everything from one place
              </span>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <span className="text-red-500 text-sm text-start font-medium px-1">
          {error}
        </span>
      )}

      <div className="flex flex-row justify-between items-start">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="flex flex-row gap-2 border border-gray-200 dark:border rounded-lg dark:border-slate-700 bg-transparent px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoIosArrowRoundBack
            size={25}
            className="text-zinc-800 dark:text-gray-200"
          />
          <span className="text-zinc-800 dark:text-gray-200">Back</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex flex-row gap-2 rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <AiOutlineLoading3Quarters
                size={20}
                className="animate-spin text-slate-100"
              />
              <span className="text-slate-100 font-semibold">Saving...</span>
            </>
          ) : (
            <>
              <span className="text-slate-100 font-semibold">
                Save & Continue
              </span>
              <IoIosArrowRoundForward
                size={25}
                className="text-gray-100 font-semibold "
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ShippingTab;
