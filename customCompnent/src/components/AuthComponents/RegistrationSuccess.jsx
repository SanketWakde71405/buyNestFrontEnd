import React from "react";

//Icons
import { IoMailOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { IoMdInformationCircleOutline } from "react-icons/io";


function RegistrationSuccessModal({ onClose, onGoToSignIn, registeredUser }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-5 w-[90%] max-w-sm flex flex-col text-center justify-center items-center  shadow-xl">
        <div className="w-full flex gap-2">
          <div className="w-[90%]"></div>
          <IoMdClose
            className="text-zinc-800 dark:text-white"
            onClick={onClose}
            size={25}
          />
        </div>
        <div className="flex justify-center items-center rounded-full w-20 h-20 p-2 bg-violet-100 dark:bg-slate-800">
          <FaCheck size={30} className="text-indigo-600 dark:text-indigo-800" />
        </div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-gray-200 mb-2">
          Account Created Successfully 🎉
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Your account has been created successfully.
          <br />
          We've sent a verification link to your email address.
          <br />
          <br />
          Please verify your email before signing in.
        </p>

        {registeredUser && (
          <div className="flex w-full py-2 px-4 mb-4 justify-center gap-2 items-center bg-violet-100 dark:bg-slate-900 dark:border dark:border-slate-800 rounded-lg text-indigo-600 dark:text-indigo-800">
            <div className="flex justify-center items-center bg-violet-200 dark:bg-slate-700 p-2 rounded-full">
              <IoMailOutline size={20} />
            </div>
            {registeredUser?.email}
          </div>
        )}

        <div className="flex w-full py-2 px-4 mb-4 justify-center gap-2 items-start bg-indigo-100 dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg">
          <div className="flex justify-center items-center bg-indigo-200 dark:bg-slate-700 p-2 rounded-full">
            <IoMdInformationCircleOutline
              className="text-indigo-800 dark:text-gray-200"
              size={20}
            />
          </div>
          <span className="text-start text-indigo-800 dark:text-indigo-400">
            Can't find the email? Please check your spam or promotions folder.
          </span>
        </div>

        <button className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 mb-4 text-white flex justify-center items-center gap-2 rounded-lg px-4 py-2 w-full">
          <IoMailOutline size={25} />
          Resend Verification Email
        </button>

        <button
          onClick={onGoToSignIn}
          className="flex justify-center items-center rounded-lg w-full bg-violet-100 dark:bg-transparent dark:hover:bg-slate-800 mb-4 px-4 py-2 border border-indigo-600 dark:border dark:border-slate-700 text-indigo-600 dark:text-indigo-400"
        >
          <span className="font-medium">Go to Sign In</span>
        </button>

        <span className="w-full text-gray-500 dark:text-gray-400">
          The verification link is valid for 24 hrs.
        </span>
      </div>
    </div>
  );
}

export default RegistrationSuccessModal;
