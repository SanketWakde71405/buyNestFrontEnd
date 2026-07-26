import React, { useEffect, useRef } from "react";

function InputBox({
  label,
  placeholder,
  icon,
  type,
  name,
  value,
  multiline,
  notOptional,
  onChange,
  maxLength,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (multiline && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, multiline]);

  return (
    <div className="w-full flex flex-1 gap-1 flex-col">
      <label
        className="text-base text-zinc-800 dark:text-gray-200 font-bold text-start py-2"
        htmlFor={label}
      >
        {label} {notOptional && <span className="text-red-500">*</span>}
      </label>

      <div className="relative w-[100%]">
        {icon && (
          <span
            className={`absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none ${multiline ? "top-3" : "top-1/2 -translate-y-1/2"}`}
          >
            {icon}
          </span>
        )}

        {multiline ? (
          <textarea
            ref={textareaRef}
            className="w-full  text-gray-500 dark:text-gray-400 focus:outline-none bg-transparent rounded-lg shadow-base px-3 py-2 border-2 border-violet-100 dark:border dark:border-slate-800 resize-none overflow-hidden min-h-[48px]"
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={3}
            maxLength={maxLength}
          />
        ) : (
          <input
            className="w-full pl-10 text-gray-500 dark:text-gray-400 focus:outline-none bg-transparent rounded-lg shadow-base px-3 py-2 border-2 border-violet-100 dark:border dark:border-slate-800"
            type={type ? type : "text"}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )}

        {multiline && maxLength && (
          <div className="w-full flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>Max {maxLength} characters</span>
            <span
              className={
                value.length >= maxLength ? "text-red-500 font-medium" : ""
              }
            >
              {value.length}/{maxLength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InputBox;
