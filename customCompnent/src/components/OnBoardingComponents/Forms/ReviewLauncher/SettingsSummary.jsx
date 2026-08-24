import React from "react";

// Icons
import { IoSettingsOutline } from "react-icons/io5";

// Components
import ReviewStepCard from "./ReviewStepCard";
import ReviewField from "./ReviewField";

// Constants
const MAX_VISIBLE_PAYMENT_METHODS = 3;

function SettingsSummary({ store, isLast, onEdit }) {
  const methods = store?.settings?.payment?.methods;

  const allMethods = [];
  if (methods?.upi) allMethods.push("UPI");
  if (methods?.cards) allMethods.push("Cards");
  if (methods?.netBanking) allMethods.push("Net Banking");
  if (methods?.cod) allMethods.push("COD");
  if (methods?.wallets) allMethods.push("Wallets");

  const visibleMethods = allMethods.slice(0, MAX_VISIBLE_PAYMENT_METHODS);
  const remainingCount = allMethods.length - visibleMethods.length;

  const shipping = store?.settings?.shipping?.domesticOnly
    ? "Domestic Only"
    : "Domestic + International";

  const gstRegistered = store?.settings?.tax?.gstRegistered ? "Yes" : "No";

  const pricing =
    store?.settings?.tax?.pricingType === "inclusive"
      ? "Tax Inclusive"
      : "Tax Exclusive";

  return (
    <ReviewStepCard
      number={3}
      title="Configure Settings"
      icon={IoSettingsOutline}
      iconBg="bg-blue-50"
      iconColor="text-blue-600"
      isLast={isLast}
      onEdit={onEdit}
    >
      <ReviewField
        label="Payment Methods"
        value={visibleMethods.join(", ")}
        note={remainingCount > 0 ? `+${remainingCount} more` : ""}
      />
      <ReviewField label="Shipping" value={shipping} />
      <ReviewField label="GST Registered" value={gstRegistered} />
      <ReviewField label="Pricing" value={pricing} />
    </ReviewStepCard>
  );
}

export default SettingsSummary;
