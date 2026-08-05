import React from "react";

function Toggler({
  label,
  labelClassName,
  name,
  checked,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
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

  return (
    <div className="w-full flex flex-1 gap-1 flex-col">
      <label
        className={`${labelClassName ? labelClassName : "text-base"} text-zinc-800 dark:text-gray-200 font-bold text-start py-2`}
        htmlFor={name}
      >
        {label}
      </label>

      <div className="flex items-center gap-2 h-[42px]">
        <button
          type="button"
          id={name}
          role="switch"
          aria-checked={checked}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            checked ? "bg-green-500" : "bg-gray-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>

        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {checked ? activeLabel : inactiveLabel}
        </span>
      </div>
    </div>
  );
}

export default Toggler;
