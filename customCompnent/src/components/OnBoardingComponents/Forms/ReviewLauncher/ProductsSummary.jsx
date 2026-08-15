import React from "react";

// Icons
import { GoPackage } from "react-icons/go";

// Components
import ReviewStepCard from "./ReviewStepCard";
import ReviewField from "./ReviewField";

function ProductsSummary({ isLast, onEdit, store, products }) {
  return (
    <ReviewStepCard
      number={2}
      title="Add Products"
      icon={GoPackage}
      iconBg="bg-green-50"
      iconColor="text-green-600"
      isLast={isLast}
      onEdit={onEdit}
    >
      <ReviewField label="Total Products" value={products?.length} />
      <ReviewField label="Categories" value={store?.categories?.length} />
      <ReviewField
        label="Sample Products"
        value={products?.length > 0 ? "Added" : "Not Added"}
      />
    </ReviewStepCard>
  );
}

export default ProductsSummary;
