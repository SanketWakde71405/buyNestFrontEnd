import { useState } from "react";
import {
  IoChevronDown
} from "react-icons/io5";

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-gray-200 dark:border dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-gray-200 bg-white dark:bg-slate-950 hover:border-violet-400 dark:hover:border-slate-700 transition-colors min-w-[140px] justify-between"
      >
        <span>{value}</span>
        <IoChevronDown
          size={15}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border dark:border-slate-800 rounded-lg shadow-lg py-1 text-sm">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 dark:hover:text-indigo-400 hover:text-violet-700 transition-colors ${value === opt ? "text-indigo-600 dark:text-indigo-400  font-medium bg-indigo-50 dark:bg-slate-800" : "text-zinc-800 dark:text-gray-200"}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown