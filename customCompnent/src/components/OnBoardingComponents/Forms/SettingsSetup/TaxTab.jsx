import React, { useEffect, useState } from "react";

import Toggler from "../../../Toggler.jsx";
import InputBox from "../../../InputBox.jsx";

import { RiBillLine } from "react-icons/ri";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoRadioButtonOffOutline } from "react-icons/io5";
import { IoRadioButtonOnOutline } from "react-icons/io5";
import { LuMinus } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { GoTag } from "react-icons/go";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import useTheme from "../../../../contexts/ThemeContext.jsx";
import StoreApi from "../../../../services/StoreApi.js";

// UI uses "Exclusive"/"Inclusive" for the radio selection; the schema
// stores lowercase pricingType values. Keep the mapping in one place.
const PRICING_TYPE_TO_SELECTION = {
  exclusive: "Exclusive",
  inclusive: "Inclusive",
};
const SELECTION_TO_PRICING_TYPE = {
  Exclusive: "exclusive",
  Inclusive: "inclusive",
};

function TaxTab({ onBack, onNext }) {
  const [isGSTRegisterd, setIsGSTRegistered] = useState(false);
  const [gstin, setGstin] = useState("");
  const [selection, setSelection] = useState("Inclusive");
  const [displayTax, setDisplayTax] = useState(false);
  const [roundOff, setRoundOff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  // Load whatever tax settings already exist for this store.
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await StoreApi.getMyStore();
        const store = response?.data || response;
        const tax = store?.settings?.tax;

        if (cancelled || !tax) return;

        setIsGSTRegistered(!!tax.gstRegistered);
        setGstin(tax.gstin || "");
        setSelection(PRICING_TYPE_TO_SELECTION[tax.pricingType] || "Exclusive");
        setDisplayTax(!!tax.displayTaxSeparately);
        setRoundOff(!!tax.roundOffTax);
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

  const handleGstinChange = ({ target }) => {
    setGstin(target.value);

    if (error) {
      setError("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (isGSTRegisterd && !gstin.trim()) {
        throw new Error("GSTIN is required when GST registered is enabled");
      }

      const response = await StoreApi.updateStoreSettings({
        tax: {
          gstRegistered: isGSTRegisterd,
          gstin: isGSTRegisterd ? gstin.trim() : "",
          pricingType: SELECTION_TO_PRICING_TYPE[selection],
          displayTaxSeparately: displayTax,
          roundOffTax: roundOff,
        },
      });

      onNext?.(response?.data || response);
    } catch (err) {
      setError(err?.message || "Failed to save tax settings");
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
          <div className="grid grid-flow-row grid-cols-2 gap-2 my-2">
            {/* 1st card */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                  GST Settings
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Manage your GST registration and tax preferences.
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col gap-2 my-2">
                <div className="flex flex-row justify-between items-start border-b border-gray-200 dark:border-slate-700 w-full py-2 px-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                      GST Registered
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Enable if your GST registred.
                    </span>
                  </div>

                  <Toggler
                    name="GSTRegistration"
                    checked={isGSTRegisterd}
                    onChange={() => {
                      setIsGSTRegistered((prev) => !prev);
                    }}
                    showLabel={false}
                    showStatusText={false}
                  />
                </div>

                {/* Body — owns its own padding too */}
                <div className="flex flex-col gap-2 px-4 pb-2">
                  <InputBox
                    label="GSTIN"
                    notOptional
                    labelClassName="text-xs"
                    icon={<RiBillLine size={20} />}
                    placeholder="22AAAAA0000A1Z5"
                    type="text"
                    name="gstin"
                    value={gstin}
                    onChange={handleGstinChange}
                    disabled={!isGSTRegisterd}
                  />
                  <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">
                    Enter your 15-character GST Identification Number.
                  </span>
                  <div className="flex flex-row gap-2 justify-start items-start mb-2">
                    <IoShieldCheckmark size={15} className="text-indigo-600" />
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-normal italic">
                      GST details are used for generating compliant invoices.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2nd card */}
            <div className="flex flex-col gap-2">
              {/* Headers */}
              <div className="flex flex-col gap-1 px-2">
                <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                  Pricing Preference
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Choose how you want to set your product prices.
                </span>
              </div>

              {/* Selectors */}
              <div className="rounded-lg flex flex-col gap-2">
                {/* Exclusive Selection */}
                <div
                  onClick={() => {
                    setSelection("Exclusive");
                  }}
                  className={`rounded-lg flex flex-row gap-2 p-4 border m-2 ${selection === "Exclusive" ? "border-indigo-600" : "border-gray-200 dark:border-slate-700"} `}
                >
                  {selection === "Exclusive" ? (
                    <IoRadioButtonOnOutline
                      size={30}
                      className="text-indigo-600 pt-2"
                    />
                  ) : (
                    <IoRadioButtonOffOutline
                      size={30}
                      className="text-gray-500 dark:text-gray-400 pt-2"
                    />
                  )}

                  <div className="relative flex w-10 h-10 justify-center items-center rounded-full bg-violet-100 dark:bg-slate-800">
                    <GoTag size={25} className="text-indigo-600" />
                    <div className="absolute -bottom-1 -right-1 flex w-5 h-5 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950">
                      <FaPlus size={10} className="text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <span className="text-zinc-800 dark:text-gray-200 text-sm font-semibold">
                      Tax Exclusive
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                      Add tax on top of the product prices at checkout.
                    </span>
                  </div>
                </div>

                {/* Inclusive Selection */}
                <div
                  onClick={() => {
                    setSelection("Inclusive");
                  }}
                  className={`rounded-lg flex flex-row gap-2 p-4 border m-2 ${selection === "Inclusive" ? "border-indigo-600" : "border-gray-200 dark:border-slate-700"} `}
                >
                  {selection === "Inclusive" ? (
                    <IoRadioButtonOnOutline
                      size={30}
                      className="text-indigo-600 pt-2"
                    />
                  ) : (
                    <IoRadioButtonOffOutline
                      size={30}
                      className="text-gray-500 dark:text-gray-400 pt-2"
                    />
                  )}

                  <div className="relative flex w-10 h-10 justify-center items-center rounded-full bg-violet-100 dark:bg-slate-800">
                    <GoTag size={25} className="text-indigo-600" />
                    <div className="absolute -bottom-1 -right-1 flex w-5 h-5 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950">
                      <LuMinus size={10} className="text-white" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pl-4">
                    <span className="text-zinc-800 dark:text-gray-200 text-sm font-semibold">
                      Tax Inclusive
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                      Product prices already include applicable tax.
                    </span>
                  </div>
                </div>

                <div className="flex flex-row gap-2 justify-start items-start pt-4 px-2">
                  <IoIosInformationCircleOutline
                    size={15}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-normal italic">
                    You can change this later from Settings.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col rounded-lg border border-gray-200 dark:border-slate-700 px-4 py-2">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                Additional Tax options
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                Configure how tax is calculated and displayed.
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-purple-50 dark:bg-slate-950 px-4 py-2 m-3">
              <div className="flex flex-row justify-between items-start py-3 border-b border-gray-200 dark:border-slate-700">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                    Display tax amount separately on invoices
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                    Show tax amount as a separate line item.
                  </span>
                </div>
                <Toggler
                  name="displayTax"
                  checked={displayTax}
                  onChange={() => {
                    setDisplayTax((prev) => !prev);
                  }}
                  showLabel={false}
                  showStatusText={false}
                />
              </div>

              <div className="flex flex-row justify-between items-start py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                    Round off tax at checkout
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                    Round off tax to nearest integer at checkout.
                  </span>
                </div>
                <Toggler
                  name="roundOff"
                  checked={roundOff}
                  onChange={() => {
                    setRoundOff((prev) => !prev);
                  }}
                  showLabel={false}
                  showStatusText={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-[30%] justify-center items-start px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border dark:border-slate-700">
          <div className="flex w-full justify-center items-center">
            {theme === "dark" ? (
              <img
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786364928/tax_dark_tx1aga.png"
                alt="tax.png"
                className="w-85 object-cover"
              />
            ) : (
              <img
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786364931/tax_light_i4c9ub.png"
                alt="tax.png"
                className="w-85 object-cover"
              />
            )}
          </div>

          <span className="text-zinc-800 dark:text-gray-200 font-bold">
            Stay Compliant, Sell Confidently
          </span>

          {/* Bullet points */}
          <div className="flex flex-col gap-5 my-2">
            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Configure GST and pricing preferences
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Generate accurate tax invoices
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Stay compliant with tax regulations
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Update anytime from store settings
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

export default TaxTab;
