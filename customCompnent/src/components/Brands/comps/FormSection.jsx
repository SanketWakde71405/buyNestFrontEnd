import React from "react";

// A form-section wrapper matching the card styling used across the app
// (white/slate-950 surface, hairline border, rounded-xl, icon + title header).
function FormSection({ icon, title, subtitle, action, children }) {
  return (
    <div className="bg-white dark:bg-slate-950 dark:border dark:border-slate-800 border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800 dark:text-gray-200">
              {title}
            </span>
            {subtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default FormSection;
