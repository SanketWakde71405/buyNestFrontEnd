import React from "react";

function Toggler({
  label,
  labelClassName,
  name,
  checked,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  showLabel = true,
  showStatusText = true,
  activeColor = "bg-indigo-600",
}) {
  const handleToggle = () => {
    onChange?.({
      target: {
        name,
        value: !checked,
        type: "checkbox",
        checked: !checked,
      },
    });
  };

  const switchButton = (
    <button
      type="button"
      id={name}
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? activeColor : "bg-gray-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  // Bare mode — just the switch, no label row, no status text, no wrapper
  // gap/flex-col layout that assumes a label is present above it.
  if (!showLabel && !showStatusText) {
    return switchButton;
  }

  return (
    <div className="w-full flex flex-1 gap-1 flex-col">
      {showLabel && (
        <label
          className={`${labelClassName ? labelClassName : "text-base"} text-zinc-800 dark:text-gray-200 font-bold text-start py-2`}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2 h-[42px]">
        {switchButton}

        {showStatusText && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {checked ? activeLabel : inactiveLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default Toggler;
