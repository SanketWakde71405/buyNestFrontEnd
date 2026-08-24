import React, { useState } from "react";

// Icons
import { IoAddCircleOutline, IoClose } from "react-icons/io5";

function FeatureInput({
  label,
  labelClassName,
  placeholder,
  notOptional,
  features = [],
  onAdd,
  onRemove,
}) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();

    if (!trimmed) return;

    // Avoid adding an exact duplicate feature
    if (features.includes(trimmed)) {
      setValue("");
      return;
    }

    onAdd?.(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="w-full flex flex-1 gap-1 flex-col">
      <label
        className={`${labelClassName ? labelClassName : "text-base"} text-zinc-800 dark:text-gray-200 font-bold text-start py-2`}
      >
        {label} {notOptional && <span className="text-red-500">*</span>}
      </label>

      <div className="relative w-full">
        <input
          className="w-full pl-3 pr-10 text-zinc-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none bg-transparent rounded-lg shadow-base px-3 py-2 border-2 border-violet-100 dark:border dark:border-slate-800"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add feature"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-violet-500 transition-colors hover:bg-violet-600/10 dark:text-violet-400"
        >
          <IoAddCircleOutline size={22} />
        </button>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {features.map((feature, index) => (
            <span
              key={`${feature}-${index}`}
              className="flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-slate-800 pl-3 pr-2 py-1 text-xs font-medium text-violet-700 dark:text-gray-200"
            >
              {feature}
              <button
                type="button"
                onClick={() => onRemove?.(index)}
                aria-label={`Remove ${feature}`}
                className="flex h-4 w-4 items-center justify-center rounded-full text-violet-500 hover:bg-violet-600/20 dark:text-gray-400"
              >
                <IoClose size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeatureInput;
