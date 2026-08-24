import React from "react";

// Icons
import { IoStorefront } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { IoIosArrowRoundForward } from "react-icons/io";

function StoreSuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[90%] max-w-sm flex flex-col text-center justify-center items-center shadow-xl">
       
        {/* Hero Icon */}
        <div className="relative mx-auto h-24 w-28">
          {/* main icon — behind the confetti shapes */}
          <div className="absolute inset-0 z-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <IoStorefront className="h-8 w-8 text-green-600" />
            <div className="absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 ring-2 ring-white">
              <FaCheck className="h-2 w-2 text-white" />
            </div>
          </div>

          {/* decorative confetti shapes — in front, pushed slightly further out */}
          <span className="absolute left-[20%] top-[10%] z-10 h-1.5 w-1.5 rotate-45 bg-violet-500" />
          <span className="absolute left-[6%] top-[38%] z-10 h-1 w-1 rounded-full bg-violet-400" />
          <span className="absolute left-[16%] top-[78%] z-10 h-1 w-1 rounded-full bg-amber-400" />
          <HiSparkles className="absolute right-[6%] top-[0%] z-10 h-3 w-3 text-violet-500" />
          <span className="absolute right-[0%] top-[38%] z-10 h-1 w-1 rounded-full bg-green-500" />
          <span className="absolute right-[2%] top-[50%] z-10 h-1.5 w-1.5 rotate-45 bg-amber-400" />
          <span className="absolute right-[3%] top-[76%] z-10 h-1.5 w-1.5 rounded-full bg-sky-400" />
        </div>

        {/* Message */}
        <div className="flex flex-col w-full gap-2 my-2">
          <h2 className="font-bold text-xl text-zinc-800 dark:text-gray-200">
            Store created successfully!
          </h2>
          <span className="text-gray-500 dark:text-gray-400">
            Your store has been setup and is ready to go. <br />
            Complete the next steps to launch your store.
          </span>
        </div>

        {/* Button  */}
        <button
          onClick={onClose}
          className="flex flex-row gap-2 my-2 justify-center items-center text-white text-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 flex gap-2 w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <IoIosArrowRoundForward size={20} />
        </button>
      </div>
    </div>
  );
}

export default StoreSuccessModal;
