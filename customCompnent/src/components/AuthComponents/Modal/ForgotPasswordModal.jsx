import React from 'react';

// Icons
import { IoMdClose } from "react-icons/io";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

function ForgotPasswordModal({ onClose, mail }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[90%] max-w-sm flex flex-col text-center justify-center items-center shadow-xl">
        <div className="w-full flex justify-end">
          <IoMdClose
            size={25}
            onClick={onClose}
            className="cursor-pointer text-zinc-800 dark:text-gray-200"
          />
        </div>
        <div className="flex justify-center items-center rounded-full w-20 h-20 p-2 bg-violet-100">
          <MdOutlineMarkEmailRead size={25} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-200 my-2">
          Check your Email!✉️
        </h2>
        <p className="text-gray-500 dark:text-gray-400 my-2">
          We've sent a password reset link to
          <br />
          {mail && (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {mail}
            </span>
          )}
        </p>
        <p className="text-gray-500 dark:text-gray-400 my-2">
          Please check your inbox and click on the link <br />
          to reset your password.
        </p>
        <div className="flex w-full py-2 px-4 my-2 justify-center gap-2 items-start bg-violet-100 dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400">
          <div className="flex justify-center items-center bg-indigo-200 dark:bg-slate-700 p-2 rounded-full">
            <IoMdInformationCircleOutline
              size={20}
              className="text-indigo-800 dark:text-gray-200"
            />
          </div>
          <span className="text-start">
            If you don't find the email, please check your spam or promotions
            folder.
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex justify-center items-center gap-2 rounded-lg my-2 w-full mb-4 px-4 py-2 bg-indigo-600 text-white"
        >
          <IoIosCheckmarkCircleOutline size={20} />
          <span className="font-medium pb-1">Got it</span>
        </button>

        <div className="flex w-full justify-center items-center rounded-lg px-4 hover:border hover:border-indigo-600 dark:hover:border dark:hover:border-slate-700  py-2">
          <span
            onClick={onClose}
            className="text-indigo-600 dark:text-indigo-400 font-medium my-2"
          >
            Back to Sign in
          </span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal