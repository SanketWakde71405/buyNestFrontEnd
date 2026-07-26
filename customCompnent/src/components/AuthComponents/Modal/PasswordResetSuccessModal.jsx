import React from "react";
import { LuCircleCheck } from "react-icons/lu";

function PasswordResetSuccessModal({ onGoToSignIn }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-lg shadow-xl p-8 w-full max-w-sm mx-4">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <LuCircleCheck
            className="text-green-600 dark:text-green-400"
            size={32}
          />
        </div>

        <span className="text-zinc-800 dark:text-white font-semibold text-lg text-center">
          Password Updated Successfully
        </span>

        <span className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Your password has been reset. You can now sign in with your new
          password.
        </span>

        <button
          type="button"
          onClick={onGoToSignIn}
          className="w-full mt-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 py-3 text-white font-medium"
        >
          Go Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default PasswordResetSuccessModal;
