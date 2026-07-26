import React, { useState, useRef, useEffect } from "react";

// Icons
import { IoChevronDown, IoClose } from "react-icons/io5";

function MultiSelect({
  label,
  placeholder,
  options,
  selected = [],
  onChange,
  name,
  notOptional,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const alreadySelected = selected.includes(id);
    const updated = alreadySelected
      ? selected.filter((item) => item !== id)
      : [...selected, id];

    onChange({ target: { name, value: updated } });
  };

  const removeOption = (id, e) => {
    e.stopPropagation();
    onChange({
      target: { name, value: selected.filter((item) => item !== id) },
    });
  };

  // helper to get the display name for a selected id
  const getNameById = (id) => options.find((opt) => opt._id === id)?.name || "";

  return (
    <div className="w-full flex flex-1 gap-1 flex-col my-2" ref={containerRef}>
      <label className="text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2">
        {label} {notOptional && <span className="text-red-500">*</span>}
      </label>

      <div className="relative w-full">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full min-h-[44px] flex flex-wrap items-center gap-2 pl-3 pr-10 py-2 text-gray-500 dark:text-gray-400 bg-transparent rounded-lg shadow-base border-2 border-violet-100 dark:border dark:border-slate-800 cursor-pointer"
        >
          {selected.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              {placeholder}
            </span>
          )}

          {selected.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-1 rounded-md"
            >
              {getNameById(id)}
              <IoClose
                size={14}
                className="cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300"
                onClick={(e) => removeOption(id, e)}
              />
            </span>
          ))}

          <IoChevronDown
            size={16}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-violet-100 dark:border-slate-800 rounded-lg shadow-lg">
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No options</div>
            )}

            {options.map((option) => {
              const isSelected = selected.includes(option._id);
              return (
                <div
                  key={option._id}
                  onClick={() => toggleOption(option._id)}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-violet-50 dark:hover:bg-slate-800 ${
                    isSelected
                      ? "text-indigo-600 dark:text-indigo-400 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.name}
                  {isSelected && <span>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiSelect;
