import React from "react";

import { IoSettingsOutline } from "react-icons/io5";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoIosArrowRoundForward } from "react-icons/io";

import useTheme from "../../../../contexts/ThemeContext";

function SettingsSetupSuccessModal({onNext}){
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-950 rounded-lg p-5 w-[95%] max-w-lg flex flex-col text-center justify-center items-center shadow-xl">
        {theme === "dark" ? (
          <img
            src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786388682/settings_success_dark_xhnv4n.png"
            alt="settings_success.png"
            className="w-65"
          />
        ) : (
          <img
            src="https://res.cloudinary.com/dx88pbasu/image/upload/v1786387904/settings_success_light_fpn1kr.png"
            alt="settings_success.png"
            className="w-65"
          />
        )}

        <div className="flex flex-col gap-2 justify-center items-center px-4 py-2 w-full">
          <div className="flex flex-row justify-center items-center gap-2">
            <IoIosCheckmarkCircle size={35} className="text-green-600" />
            <span className="text-xl font-semibold text-zinc-800 dark:text-gray-200">
              Store Settings Configured!
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium px-10">
            Your payment, shipping and tax preferences have been set up
            successfully.
          </span>

          <div className="flex flex-row gap-5 justify-start items-start w-full m-2 p-4 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700">
            <div className="flex justify-center rounded-full items-center w-12 h-12 dark:bg-slate-800 bg-purple-100 mt-2">
              <IoSettingsOutline size={25} className="text-indigo-600" />
            </div>

            <div className="flex flex-col justify-start items-start gap-1">
              <span className="text-zinc-800 dark:text-gray-200 font-semibold text-sm">
                You can change these settings anytime
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">
                All your store settings can be updated later from
              </span>
              <span className="text-indigo-800 dark:text-indigo-600 font-semibold text-sm">
                Settings &gt; Store Settings
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="flex flex-row justify-center items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            <span className="text-slate-100 font-semibold">
              Continue to Next Step
            </span>
            <IoIosArrowRoundForward
              size={25}
              className="text-gray-100 font-semibold "
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsSetupSuccessModal;
