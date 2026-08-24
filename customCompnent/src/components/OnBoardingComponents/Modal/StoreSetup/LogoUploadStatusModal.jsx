import React from "react";

// Icons
import { IoCheckmark, IoClose } from "react-icons/io5";
import { HiOutlineExclamation } from "react-icons/hi";
import { IoIosArrowRoundForward } from "react-icons/io";

// Constants
const STATUS_CONFIG = {
  success: {
    ringBg: "bg-green-100",
    badgeBg: "bg-green-600",
    Icon: IoCheckmark,
    defaultTitle: "Logo uploaded successfully!",
    defaultMessage: "Your store logo has been saved.",
    primaryLabel: "Next",
    primaryClasses:
      "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 text-white",
  },
  error: {
    ringBg: "bg-red-100",
    badgeBg: "bg-red-600",
    Icon: HiOutlineExclamation,
    defaultTitle: "Logo upload failed",
    defaultMessage:
      "Something went wrong while uploading your logo. Please try again.",
    primaryLabel: "Try Again",
    primaryClasses: "bg-red-600 hover:bg-red-700 text-white",
  },
};

function LogoUploadStatusModal({
  status = "success", // "success" | "error"
  title,
  message,
  onPrimaryAction, // called on "Next" (success) or "Try Again" (error)
  onClose,
  showSecondaryAction = false, // e.g. "Skip for now" alongside "Try Again"
  onSecondaryAction,
  secondaryLabel = "Skip for now",
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.success;
  const { ringBg, badgeBg, Icon, primaryClasses } = config;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex w-[90%] max-w-sm flex-col items-center justify-center rounded-lg bg-white p-5 text-center shadow-xl dark:bg-slate-900">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        )}

        {/* Status icon */}
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${ringBg}`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${badgeBg}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Message */}
        <div className="my-4 flex w-full flex-col gap-2">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-200">
            {title || config.defaultTitle}
          </h2>
          <span className="text-gray-500 dark:text-gray-400">
            {message || config.defaultMessage}
          </span>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 ${primaryClasses}`}
          >
            <span>{config.primaryLabel}</span>
            {status === "success" && <IoIosArrowRoundForward size={20} />}
          </button>

          {showSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogoUploadStatusModal;
