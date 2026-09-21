import React from "react";

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-violet-50 dark:bg-indigo-950 text-violet-600 dark:text-violet-300">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-zinc-800 dark:text-gray-200">
          {title}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </span>
      </div>
    </div>
  );
}

export default SectionHeader;
