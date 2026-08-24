import React from "react";

// Icons
import { IoCheckmark } from "react-icons/io5";
import { MdOutlineModeEditOutline } from "react-icons/md";

function ReviewStepCard({
  number,
  title,
  icon: Icon,
  iconBg,
  iconColor,
  isLast,
  onEdit,
  children,
}) {
  return (
    <div
      className={`flex flex-row gap-2 w-full justify-between items-start py-2 my-2 ${
        isLast ? "" : "pb-5 border-b border-gray-200 dark:border-slate-800"
      }`}
    >
      {/* Logo + Details */}
      <div className="flex justify-start items-start gap-3">
        {/* Logo */}
        <div
          className={`w-16 h-16 rounded-lg ${iconBg} flex justify-center items-center`}
        >
          <Icon size={30} className={iconColor} />
        </div>

        {/* Actual Details */}
        <div className="flex flex-col gap-2">
          {/* Feature name and status */}
          <div className="flex flex-row gap-2">
            <span className="text-base font-semibold text-zinc-800 dark:text-gray-200">
              {number}. {title}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 flex flex-row gap-1 text-green-600 font-medium">
              <IoCheckmark size={15} />
              <p>Completed</p>
            </span>
          </div>

          {/* Step-specific details */}
          <div className="flex flex-row gap-5">{children}</div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        type="button"
        onClick={onEdit}
        className="border border-gray-300 dark:border-slate-800 rounded-lg px-3 py-1 flex flex-row gap-2 justify-center items-center text-indigo-600"
      >
        <MdOutlineModeEditOutline size={20} />
        <span className="text-base font-medium">Edit</span>
      </button>
    </div>
  );
}

export default ReviewStepCard;
