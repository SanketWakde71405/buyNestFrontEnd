import React from "react";

function FeatureItem({ id, title, desc, icon, iconBackground, compact }) {
  return (
    <div
      className={`bg-transparent flex flex-1 w-full justify-start items-center gap-2 
      ${id === "scalable" ? "" : "md:border-r-3 md:border-gray-200"}
    `}
    >
      <div
        className={`rounded-full flex items-center flex-shrink-0 p-3 ${iconBackground}`}
      >
        {icon}
      </div>
      <div className="flex flex-col justify-start items-start min-w-0">
        <span className="font-semibold text-base text-black">{title}</span>
        <span className="text-start text-black text-sm text-wrap break-words">
          {desc}
        </span>
      </div>
    </div>
  );
}
export default FeatureItem;
