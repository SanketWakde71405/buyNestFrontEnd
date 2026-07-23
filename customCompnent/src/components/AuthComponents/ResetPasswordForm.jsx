import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Icons
import { LuLock, LuRefreshCw } from "react-icons/lu";
import { IoSparklesSharp } from "react-icons/io5";
import { CiLock } from "react-icons/ci";
import { IoMdInformationCircleOutline, IoMdArrowBack } from "react-icons/io";

// Components
import InputBox from "../InputBox";

// Services
import AuthApi from "../../services/AuthApi";

function ResetPasswordForm({ onResetSuccess }) {
  const navigate = useNavigate();
  const { resetToken } = useParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.newPassword.trim()) {
      return "New password is required.";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response= await AuthApi.resetPassword(resetToken, formData.newPassword);
      console.log("Response", response);
      onResetSuccess?.(); // just notify — don't navigate here anymore
    } catch (error) {
      setError(
        error.message || "Unable to reset password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-start items-center w-full"
    >
      {/* Heading icon */}
      <div className="relative w-20 h-20 flex items-center justify-center my-2">
        <LuRefreshCw
          className="absolute text-violet-200 dark:text-slate-700"
          size={72}
          strokeWidth={1.5}
        />
        <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-violet-300/50 dark:shadow-none">
          <LuLock className="text-white" size={20} strokeWidth={2.5} />
        </div>
        <IoSparklesSharp
          className="absolute -top-0.5 -left-1 text-violet-300 dark:text-indigo-700"
          size={14}
        />
        <IoSparklesSharp
          className="absolute -bottom-1 -right-0.5 text-violet-400 dark:text-indigo-800"
          size={12}
        />
        <IoSparklesSharp
          className="absolute -top-3 right-3 text-violet-400/60 dark:text-indigo-800/60"
          size={11}
        />
        <IoSparklesSharp
          className="absolute bottom-3 -left-5 text-indigo-300/80 dark:text-indigo-700/80"
          size={8}
        />
      </div>

      <span className="text-zinc-800 text-center dark:text-white font-medium">
        Create New Password
      </span>

      <span className="text-gray-500 dark:text-gray-400 text-xs mb-1">
        Enter your new password to reset your password.
      </span>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-3">
          {error}
        </div>
      )}

      <div className="my-2 flex flex-col w-full">
        <InputBox
          label="New Password"
          placeholder="Enter your new password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          icon={
            <CiLock
              size={22}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          }
        />
        <InputBox
          label="Confirm New Password"
          placeholder="Confirm your new password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          icon={
            <CiLock
              size={22}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          }
        />
      </div>

      <div className="flex justify-start items-start gap-2 bg-violet-200 dark:border dark:border-slate-700 dark:bg-slate-800 rounded-lg w-full mx-2 my-2 px-4 py-2">
        <IoMdInformationCircleOutline
          size={30}
          className="text-indigo-800 dark:text-gray-400 bg-violet-100 dark:bg-slate-700 rounded-full p-1"
        />
        <div className="flex flex-col">
          <span className="text-indigo-800 px-2 pt-1 font-medium">
            Password must:
          </span>
          <div className="flex flex-row gap-2 pl-5 ml-2 my-2 text-gray-500 dark:text-gray-400">
            <ul className="list-disc pr-2">
              <li>Be at least 8 characters long.</li>
              <li>Include an uppercase letter.</li>
            </ul>
            <ul className="list-disc pl-2">
              <li>Include a number.</li>
              <li>Include a special character.</li>
            </ul>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full my-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 py-4 text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CiLock size={22} />
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      <button
        type="button"
        onClick={() => navigate("/auth/signin")}
        className="my-2 text-indigo-600 hover:text-indigo-800 flex gap-2"
      >
        <IoMdArrowBack size={22} />
        <span className="font-medium">Back to Sign In</span>
      </button>
    </form>
  );
}

export default ResetPasswordForm;
