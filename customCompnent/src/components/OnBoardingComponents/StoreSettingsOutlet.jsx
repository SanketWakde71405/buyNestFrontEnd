import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { IoSettingsOutline } from "react-icons/io5";
import { ImCreditCard } from "react-icons/im";
import { LuTruck } from "react-icons/lu";
import { TbTax } from "react-icons/tb";

// Forms (Tabs)
import PaymentTab from "./Forms/SettingsSetup/PaymentTab";
import ShippingTab from "./Forms/SettingsSetup/ShippingTab";
import TaxTab from "./Forms/SettingsSetup/TaxTab";

// Modal
import SettingsSetupSuccessModal from "./Modal/SettingsSetup/SettingsSetupSuccessModal";

// Constants
import { ONBOARDING_PROGRESS_KEY } from "../HomeSection/Onboarding";

const TABS = [
  { id: "Payment", label: "Payment", icon: ImCreditCard },
  { id: "Shipping", label: "Shipping", icon: LuTruck },
  { id: "Tax", label: "Tax", icon: TbTax },
];

function StoreSettingsOutlet() {
  // Hooks
  const navigate = useNavigate();

  // Tab Setter
  const [activeTab, setActiveTab] = useState("Payment");

  // Data state
  const [store, setStore] = useState(null);

  // Tab Toggler
  const switchActiveTab = (tabName) => {
    setActiveTab(tabName);
  };

  // Payment Settings Update Handler
  const handlePaymentSettingsUpdate = (store) => {
    setStore(store);
    switchActiveTab("Shipping");
  };

  // Shipping navigates back to Payment
  const handleBackForShipping = () => {
    switchActiveTab("Payment");
  };

  // Shipping details Update handler
  const handleShippingSettingsUpdate = (updatedStore) => {
    setStore(updatedStore);
    switchActiveTab("Tax");
  };

  // Tax navigates back to payment Tab
  const handleBackForTax = () => {
    switchActiveTab("Shipping");
  };

  // Tax Settings Update Handler
  const handleTaxSettingsUpdate = (updatedStore) => {
    setStore(updatedStore);
    // Tax is the last step in this settings wizard — move on rather than
    // switching to another tab.
    setShowSettingSuccess(true);
  };

  // Setting Update Modal 
  const [showSettingSuccess, setShowSettingSuccess] = useState(false);

  // Mark Third step of onboarding as completed
  const markSettingsSetupComplete = () => {
      try {
        const progress =
          JSON.parse(localStorage.getItem(ONBOARDING_PROGRESS_KEY)) || {};
        progress[3] = true;
        localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
      } catch (err) {
        console.error("Failed to persist onboarding progress", err);
      }
    };

  
  // Completing store settings configuration
  const handleStoreSettingsSuccess=()=>{
      markSettingsSetupComplete();
      navigate("/");
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Background layer — pinned to viewport, independent of content height */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 dark:bg-none dark:bg-slate-950" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 dark:bg-violet-600/30 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600/30 rounded-full blur-3xl -z-10" />
     
      <div className="relative z-10 w-full min-h-screen flex justify-center items-start sm:items-center px-4 py-8">
        <div className="relative flex flex-col w-full min-h-screen border border-gray-200 rounded-lg bg-white dark:bg-slate-950 dark:border dark:border-slate-800 z-20 px-6 py-6 my-auto">
          <div className="flex flex-col gap-1 my-2">
            <div className="flex flex-row gap-2">
              <span className="text-2xl font-semibold text-zinc-800 dark:text-gray-200">
                Configure Store Settings
              </span>
              <IoSettingsOutline size={30} className="text-indigo-600 pt-2" />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-base">
              Configure payment, shipping and tax preferences to run your store
              smoothly.
            </span>
          </div>

          <div className="flex flex-col border-b border-gray-300 dark:border-b dark:border-slate-800 px-4 py-2">
            <div className="flex flex-row gap-3 w-full">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchActiveTab(id)}
                  className="flex flex-row gap-1 justify-start py-2 px-4 items-start"
                >
                  <Icon
                    className={
                      activeTab === id ? "text-indigo-700" : "text-gray-500"
                    }
                    size={25}
                  />
                  <span
                    className={`${
                      activeTab === id ? "text-indigo-700" : "text-gray-500"
                    } font-medium`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab panels go here, keyed off activeTab */}
          {activeTab === "Payment" && (
            <PaymentTab
              onBack={() => {
                navigate("/");
              }}
              onNext={handlePaymentSettingsUpdate}
            />
          )}

          {activeTab === "Shipping" && (
            <ShippingTab
              onBack={handleBackForShipping}
              onNext={handleShippingSettingsUpdate}
            />
          )}

          {activeTab === "Tax" && (
            <TaxTab
              onBack={handleBackForTax}
              onNext={handleTaxSettingsUpdate}
            />
          )}
        </div>

        {showSettingSuccess && (
          <SettingsSetupSuccessModal onNext={handleStoreSettingsSuccess} />
        )}
      </div>
    </div>
  );
}

export default StoreSettingsOutlet;
