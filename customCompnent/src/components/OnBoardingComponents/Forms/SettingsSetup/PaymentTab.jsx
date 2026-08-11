import React, { useEffect, useState } from "react";

import UPILogo from "../../../../assets/upi-icon.svg?react";
import CreditCard from "../../../../assets/credit-card.svg?react";
import { RiBankFill } from "react-icons/ri";
import { FcMoneyTransfer } from "react-icons/fc";
import { IoWallet } from "react-icons/io5";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdLockOutline } from "react-icons/md";
import { LuUser } from "react-icons/lu";
import { CiBank } from "react-icons/ci";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoIosArrowRoundForward } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import useTheme from "../../../../contexts/ThemeContext.jsx";

import Toggler from "../../../Toggler.jsx";
import InputBox from "../../../InputBox.jsx";
import StoreApi from "../../../../services/StoreApi.js";

const initialAccountDetails = {
  accountHolderName: "",
  // Full account number, entered by the user. Only the server keeps the
  // encrypted value — on reload we only ever get `accountNumberLast4`
  // back, so this field is intentionally left blank rather than
  // pre-filled with masked digits the user didn't type.
  accountNumber: "",
  ifscCode: "",
};

// Mirrors settings.payment.methods on the Store model — keep these keys in
// sync with paymentMethodsSchema in store.models.js.
const initialPaymentMethods = {
  upi: false,
  cards: false,
  netBanking: false,
  cod: false,
  wallets: false,
};

function PaymentTab({ onBack, onNext }) {
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [accountFormData, setAccountFormData] = useState(initialAccountDetails);
  const [savedAccountLast4, setSavedAccountLast4] = useState("");
  const [codOrderLimit, setCodOrderLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { theme } = useTheme();

  // Load whatever settings already exist for this store so the form isn't
  // blank every time the admin revisits this tab.
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await StoreApi.getMyStore();
        const store = response?.data || response;
        const payment = store?.settings?.payment;

        if (cancelled || !payment) return;

        setPaymentMethods((prev) => ({ ...prev, ...payment.methods }));
        setCodOrderLimit(
          payment.codOrderLimit != null ? String(payment.codOrderLimit) : "",
        );
        setAccountFormData((prev) => ({
          ...prev,
          accountHolderName: payment.payout?.accountHolderName || "",
          ifscCode: payment.payout?.ifscCode || "",
        }));
        setSavedAccountLast4(payment.payout?.accountNumberLast4 || "");
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

  const initialPaymentMethodCards = [
    {
      id: "upi",
      title: "UPI",
      desc: "Accept payment via UPI apps.",
      logo: <UPILogo />,
      togglerName: "upi",
      togglerChecked: paymentMethods.upi,
    },
    {
      id: "cards",
      title: "Cards",
      desc: "Visa, Rupay, Mastercard & more.",
      logo: <CreditCard />,
      togglerName: "cards",
      togglerChecked: paymentMethods.cards,
    },
    {
      id: "netBanking",
      title: "Net Banking",
      desc: "Accept payments via net banking.",
      logo: (
        <RiBankFill size={30} className="text-slate-800 dark:text-gray-200" />
      ),
      togglerName: "netBanking",
      togglerChecked: paymentMethods.netBanking,
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      desc: "Allow customers to pay on delivery.",
      logo: <FcMoneyTransfer size={30} />,
      togglerName: "cod",
      togglerChecked: paymentMethods.cod,
    },
    {
      id: "wallets",
      title: "Wallets",
      desc: "Paytm, Amazon Pay & other wallets.",
      logo: <IoWallet size={30} className="text-indigo-600" />,
      togglerName: "wallets",
      togglerChecked: paymentMethods.wallets,
    },
  ];

  // Toggler calls onChange with { target: { name, checked, ... } } —
  // same shape InputBox/handleChange use elsewhere in the app, so this
  // slots into the existing pattern rather than inventing a new one.
  const handleToggle = ({ target }) => {
    const { name, checked } = target;

    setPaymentMethods((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setAccountFormData((prev) => {
      if (name.includes(".")) {
        const [parentKey, childKey] = name.split(".");
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey],
            [childKey]: value,
          },
        };
      }

      return { ...prev, [name]: value };
    });

    if (error) {
      setError("");
    }
  };

  const handleCodLimitChange = ({ target }) => {
    setCodOrderLimit(target.value);

    if (error) {
      setError("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const payout = {};

      if (accountFormData.accountHolderName) {
        payout.accountHolderName = accountFormData.accountHolderName;
      }
      if (accountFormData.ifscCode) {
        payout.ifscCode = accountFormData.ifscCode;
      }
      // Only send accountNumber if the admin actually typed a new one —
      // an empty field means "leave the existing saved number as-is".
      if (accountFormData.accountNumber) {
        payout.accountNumber = accountFormData.accountNumber;
      }

      const response = await StoreApi.updateStoreSettings({
        payment: {
          methods: paymentMethods,
          codOrderLimit: codOrderLimit === "" ? null : Number(codOrderLimit),
          ...(Object.keys(payout).length ? { payout } : {}),
        },
      });

      const store = response?.data || response;
      // console.log("Store",response);
      setSavedAccountLast4(
        store?.settings?.payment?.payout?.accountNumberLast4 ||
          savedAccountLast4,
      );
      // Clear the raw account number from local state now that it's saved —
      // never keep the full number sitting in memory longer than needed.
      setAccountFormData((prev) => ({ ...prev, accountNumber: "" }));

      onNext?.(store);
    } catch (err) {
      setError(err?.message || "Failed to save payment settings");
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
        {/* Left section */}
        <div className="flex flex-col gap-2 w-[70%]">
          <div className="flex flex-col gap-1">
            <span className="text-zinc-800 dark:text-gray-200 text-base font-semibold">
              Payment Methods
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
              Select payment methods you want to accept.
            </span>
          </div>

          <div className="grid grid-flow-row grid-cols-3 gap-2 my-2">
            {initialPaymentMethodCards.map((card) => (
              <PaymentMethodCards
                key={card.id}
                id={card.id}
                title={card.title}
                desc={card.desc}
                icon={card.logo}
                togglerName={card.togglerName}
                togglerChecked={card.togglerChecked}
                handleToggle={handleToggle}
                codOrderLimit={codOrderLimit}
                onCodOrderLimitChange={handleCodLimitChange}
              />
            ))}
          </div>

          <div className="flex flex-col w-full rounded-lg px-4 py-2 border border-gray-300 dark:border dark:border-slate-700">
            {/* Header */}
            <div className="flex flex-row gap-2 my-2">
              <div className="rounded-full flex justify-center items-center w-12 h-12 bg-violet-200">
                <MdLockOutline size={40} className="text-indigo-600 p-2" />
              </div>
              <div className="flex flex-col w-full">
                <span className="text-zinc-800 dark:text-gray-200 text-base font-medium">
                  Secure Payout Details
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Your bank details are encrypted and securely stored.
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-row gap-2 my-2 justify-start">
              <InputBox
                label="Account Holder Name"
                placeholder="John Doe"
                value={accountFormData.accountHolderName}
                onChange={handleChange}
                type="text"
                notOptional
                name="accountHolderName"
                labelClassName="text-sm"
                icon={<LuUser size={20} />}
              />

              <InputBox
                label="Account Number"
                placeholder={
                  savedAccountLast4
                    ? `•••• •••• ${savedAccountLast4}`
                    : "XXXX XXXX XXXX"
                }
                value={accountFormData.accountNumber}
                onChange={handleChange}
                type="text"
                notOptional
                name="accountNumber"
                labelClassName="text-sm"
                icon={<CiBank size={25} />}
              />

              <InputBox
                label="IFSC Code"
                placeholder="HDFC001234"
                value={accountFormData.ifscCode}
                onChange={handleChange}
                type="text"
                notOptional
                name="ifscCode"
                labelClassName="text-sm"
                icon={<CiBank size={25} />}
              />
            </div>

            <div className="flex flex-row gap-2 my-2">
              <div className="w-8 h-8 rounded-full bg-violet-200 flex justify-center items-center">
                <IoShieldCheckmarkOutline
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                We never share your bank details with anyone.
              </span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div
          className="flex flex-col gap-2 w-[30%] rounded-lg px-4 py-2 border border-gray-200 dark:border dark:border-slate-700 
              bg-gray-50 dark:bg-slate-950"
        >
          {/* Header */}
          <div className="flex flex-row gap-2 my-2">
            <span className="text-zinc-800 dark:text-gray-200 font-medium text-base">
              About Payment
            </span>
            <IoInformationCircleOutline
              size={25}
              className="text-indigo-800 dark:text-indigo-600"
            />
          </div>

          {/* Bullet Points  */}
          <div className="flex flex-col gap-5 my-2">
            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Enable the payment methods you want to accept.
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                COD is available for eligible pin codes only.
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                Payouts are processed to your bank account.
              </span>
            </div>

            <div className="flex flex-row gap-1">
              <IoIosCheckmarkCircle size={20} className="text-indigo-600" />
              <span className="dark:text-gray-400 text-gray-500 text-sm">
                You can update these settings any time.
              </span>
            </div>
          </div>

          <div className="flex justify-center items-center w-full">
            {theme === "dark" ? (
              <img
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786213846/payment_dark_g13vd5.png"
                alt="payment_light.jpg"
                className="w-100 h-[95%] object-cover"
              />
            ) : (
              <img
                src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786214135/payment_light_zekxha.png"
                alt="payment_light.jpg"
                className="w-100 h-[95%] object-cover"
              />
            )}
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

function PaymentMethodCards({
  id,
  icon,
  title,
  desc,
  togglerName,
  togglerChecked,
  handleToggle,
  codOrderLimit,
  onCodOrderLimitChange,
}) {
  return (
    <div
      className={`flex flex-col w-full gap-2 rounded-lg border border-gray-300 dark:border dark:border-slate-700 ${id === "wallets" ? "h-[40%]" : "h-full"}`}
    >
      <div className="flex flex-row gap-1 px-4 py-3  w-full ">
        {/* Icon */}
        <div className="w-16 h-16 pt-2">{icon}</div>

        {/* Title + Desc */}
        <div className="flex flex-col w-full">
          <span className="text-base font-semibold text-zinc-800 dark:text-gray-200">
            {title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {desc}
          </span>
        </div>

        {/* Toggler */}
        <Toggler
          name={togglerName}
          checked={togglerChecked}
          onChange={handleToggle}
          showLabel={false}
          showStatusText={false}
        />
      </div>
      {id === "cod" && (
        <div className="px-4 py-2 m-2 mb-3 flex flex-col rounded-lg bg-indigo-100 dark:bg-slate-950 justify-start items-start dark:border dark:border-slate-700">
          <span className="text-indigo-800 dark:text-indigo-600 font-medium">
            COD Order Limit
          </span>
          <InputBox
            label="Enable COD for orders above"
            name="codOrderLimit"
            value={codOrderLimit}
            onChange={onCodOrderLimitChange}
            icon={
              <FaIndianRupeeSign
                size={15}
                className="text-gray-500 dark:text-gray-400"
              />
            }
            type="number"
            placeholder={0.0}
          />
        </div>
      )}
    </div>
  );
}

export default PaymentTab;
