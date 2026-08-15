import React from "react";

// Icons
import { IoStorefrontOutline } from "react-icons/io5";

// Components
import ReviewStepCard from "./ReviewStepCard";
import ReviewField from "./ReviewField";

function StoreSetupSummary({ store, isLast, onEdit }) {
  const location =
    store?.address?.city && store?.address?.state
      ? `${store.address.city}, ${store.address.state}`
      : "";

  return (
    <ReviewStepCard
      number={1}
      title="Store Setup"
      icon={IoStorefrontOutline}
      iconBg="bg-purple-50"
      iconColor="text-indigo-600"
      isLast={isLast}
      onEdit={onEdit}
    >
      <ReviewField label="Store Name" value={store?.storeName || ""} />
      <ReviewField label="Store Email" value={store?.businessEmail || ""} />
      <ReviewField label="Business Type" value={store?.businessType || ""} />
      <ReviewField label="Location" value={location} />
    </ReviewStepCard>
  );
}

export default StoreSetupSummary;
