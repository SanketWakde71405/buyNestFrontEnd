import React from "react";

function Connector({ active, orientation = "horizontal" }) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={
        isVertical
          ? "flex-1 flex justify-center my-2"
          : "flex-1 flex items-center mx-2"
      }
    >
      <div
        className={
          isVertical ? "relative h-full w-[2px]" : "relative w-full h-[2px]"
        }
      >
        {/* Base layer: dotted line, always present */}
        <div
          className="absolute inset-0 bg-repeat"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: isVertical ? "2px 8px" : "8px 2px",
          }}
        />

        {/* Overlay: solid line, animates in from start when active */}
        <div
          className={
            isVertical
              ? "absolute inset-x-0 top-0 w-full bg-indigo-600 transition-all duration-700 ease-out"
              : "absolute inset-y-0 left-0 h-full bg-indigo-600 transition-all duration-700 ease-out"
          }
          style={
            isVertical
              ? { height: active ? "100%" : "0%" }
              : { width: active ? "100%" : "0%" }
          }
        />
      </div>
    </div>
  );
}

export default Connector;
