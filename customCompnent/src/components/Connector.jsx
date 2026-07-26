import React from "react";

function Connector({ active }) {
  return (
    <div className="flex-1 flex items-center mx-2">
      <div className="relative w-full h-[2px]">
        {/* Base layer: dotted line, always present */}
        <div
          className="absolute inset-0 h-full bg-repeat-x"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "8px 2px",
          }}
        />

        {/* Overlay: solid line, animates in from left when active */}
        <div
          className="absolute inset-y-0 left-0 h-full bg-indigo-600 transition-all duration-700 ease-out"
          style={{ width: active ? "100%" : "0%" }}
        />
      </div>
    </div>
  );
}

export default Connector;
