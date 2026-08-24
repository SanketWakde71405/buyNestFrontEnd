import React from "react";

function ReviewField({ label, value, note }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
        {label}
      </span>
      <span className="text-zinc-800 dark:text-gray-200 text-sm font-semibold">
        {value}
      </span>
      {note && (
        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          {note}
        </span>
      )}
    </div>
  );
}

export default ReviewField;
