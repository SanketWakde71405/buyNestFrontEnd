import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

// Icons
import { CiMail, CiLock } from "react-icons/ci";
import { PiSignInBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";

// Components
import InputBox from "../InputBox";

// Services
import AuthApi from "../../services/AuthApi";

// Contexts
import useAuth from "../../contexts/AuthContext"; 

function SignInForm({ onLoginSuccess, onAccessDenied }) {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target }) => {
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email.";
    }

    if (!formData.password.trim()) {
      return "Password is required.";
    }

    return null;
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError("");

      const user = await AuthApi.googleAuth(tokenResponse.access_token);

      if (user.role !== "Admin") {
        await logout();
        onAccessDenied?.(user);
        return;
      }

      login(user);
      onLoginSuccess?.(user);
      navigate("/");
    } catch (error) {
      setError(error.message || "Unable to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in failed."),
  });

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

      const user = await AuthApi.loginUser(formData);

      if (user.role !== "Admin") {
        // Log them straight back out — don't let an unauthorized
        // session linger even for a moment
        await logout();
        onAccessDenied?.(user);
        return; // 🔑 stop here — no login(), no navigate
      }

       login(user);
       onLoginSuccess?.(user);

      navigate("/"); // ✅ redirect logic
    } catch (error) {
      setError(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col justify-center items-start px-4 py-5"
    >
      <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl">
        Welcome Back! 👋
      </span>

      <span className="text-gray-500 dark:text-gray-400 pt-1 text-lg">
        Sign in to continue to your Admin Dashboard
      </span>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-3">
          {error}
        </div>
      )}

      <div className="flex flex-col w-full gap-3 mt-5">
        <InputBox
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          icon={
            <CiMail
              size={22}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          }
        />

        <InputBox
          label="Password"
          placeholder="Enter your password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          icon={
            <CiLock
              size={22}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          }
        />
      </div>

      <div className="flex justify-between items-center w-full mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-indigo-600" />
          Remember me
        </label>

        <button type="button" className="text-indigo-600 hover:underline">
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full mt-6 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 py-4 text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <PiSignInBold size={22} />
        {loading ? "Signing In..." : "Sign In"}
      </button>

      <div className="flex items-center w-full mt-6">
        <div className="flex-1 border-t border-gray-200 dark:border-slate-800" />
        <span className="mx-4 text-gray-500 text-sm">or continue with</span>
        <div className="flex-1 border-t border-gray-200 dark:border-slate-800" />
      </div>

      <div className="flex gap-3 w-full mt-5">
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-1/2 border rounded-lg py-3 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FcGoogle size={28} />
          Google
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 w-1/2 border rounded-lg py-3 dark:border-slate-700"
        >
          <IoLogoGithub size={28} />
          GitHub
        </button>
      </div>

      <div className="flex justify-center gap-2 w-full mt-6 text-sm">
        <span>Don't have an account?</span>
        <button
          type="button"
          onClick={() => navigate("/auth/register")}
          className="text-indigo-600 hover:underline cursor-pointer"
        >
          Register Now
        </button>
      </div>
    </form>
  );
}

export default SignInForm;
