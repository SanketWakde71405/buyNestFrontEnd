import React from "react";

// Icons
import { IoMdClose } from "react-icons/io";
import { IoLockClosed } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import { IoIosArrowRoundForward } from "react-icons/io";

function AccessDeniedModal({onClose, deniedUser}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[90%] max-w-sm flex flex-col text-center justify-center items-center shadow-xl">
        <div className="w-full flex justify-end">
          <IoMdClose onClick={onClose} size={25} className="cursor-pointer text-zinc-800 dark:text-gray-200" />
        </div>
        <div className="flex justify-center items-center rounded-full w-20 h-20 p-2 bg-red-100">
          <IoLockClosed size={30} className="text-rose-600" />
        </div>
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-200 mb-2">
            Access Denied
          </h2>
          <IoWarningOutline className="text-rose-600 mb-2" size={20} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          BuyNest Admin panel is restricted to admin users only. If you believe
          this is a mistake, please contact your system administrator.
          {deniedUser?.email && (
            <>
              <br />
              <span className="font-medium">{deniedUser.email}</span> does not
              have admin access.
            </>
          )}
        </p>
        <button
          onClick={onClose}
          className="flex justify-center items-center gap-2 rounded-lg w-full bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400 px-4 py-2 text-white"
        >
          <span className="font-medium">Go to Sign In</span>
          <IoIosArrowRoundForward size={20} />
        </button>
      </div>
    </div>
  );
}

export default AccessDeniedModal;
