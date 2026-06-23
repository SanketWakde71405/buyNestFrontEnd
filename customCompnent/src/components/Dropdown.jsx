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
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-zinc-700 bg-white hover:border-violet-400 transition-colors min-w-[140px] justify-between"
      >
        <span>{value}</span>
        <IoChevronDown
          size={15}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-violet-50 hover:text-violet-700 transition-colors ${value === opt ? "text-violet-700 font-medium bg-violet-50" : "text-zinc-700"}`}
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