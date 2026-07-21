import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

// Icons
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { PiSignInBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { HiOutlineUserPlus } from "react-icons/hi2";

// Components
import InputBox from "../InputBox";

// APIs
import AuthApi from "../../services/AuthApi";

// Contexts
import useAuth from "../../contexts/AuthContext";

function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const { login, logout } = useAuth();

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Name is required.";
    }
    if (!formData.email.trim()) {
      return "Email is required.";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please enter a valid email.";
    }

    if (!formData.password.trim()) {
      return "Password is required.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Password and Confirm Password should match.";
    }

    return null;
  };

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

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      setError("");

      const user = await AuthApi.googleAuth(tokenResponse.access_token);

      if (user.role !== "Admin") {
        await logout();
        setError("This Google account isn't linked to an Admin account.");
        return;
      }

      login(user);
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

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "Admin",
      };

      // console.log("Register payload (ready for API):", payload);

      const user = await AuthApi.registerUser(payload);

      onRegisterSuccess?.(user);
      console.log("User:", user);
    } catch (error) {
      setError(error.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-1 flex-col justify-center items-start px-4 py-2"
    >
      {/* Form heading */}
      <span className="text-zinc-800 dark:text-gray-200 font-bold text-2xl text-start">
        Create your Account👋
      </span>
      <span className="text-gray-500 dark:text-gray-400 text-base text-start">
        Join BuyNest Admin and take your store to the next level.
      </span>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-3">
          {error}
        </div>
      )}

      {/* Input fields */}
      <div className="flex flex-1 flex-col w-full gap-1">
        <InputBox
          label="Full Name"
          placeholder="Enter your full name"
          name="name"
          onChange={handleChange}
          value={formData.name}
          icon={
            <CiUser
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
        <InputBox
          label="Email Address"
          name="email"
          onChange={handleChange}
          value={formData.email}
          placeholder="Enter your email"
          icon={
            <CiMail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
        <InputBox
          label="Password"
          placeholder="Create a password"
          type="password"
          value={formData.password}
          name="password"
          onChange={handleChange}
          icon={
            <CiLock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
        <InputBox
          label="Confirm Password"
          placeholder="Confirm password"
          type="password"
          onChange={handleChange}
          value={formData.confirmPassword}
          name="confirmPassword"
          icon={
            <CiLock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
      </div>

      {/* Terms checkbox */}
      <div className="flex flex-row justify-center items-center gap-1 mt-1">
        <input
          type="checkbox"
          className="accent-indigo-600"
          name="Terms and Services "
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          id="terms"
        />
        <label className="pb-1 font-medium" htmlFor="terms">
          <div className="flex flex-row gap-1">
            <span className="text-zinc-800 dark:text-gray-200">
              I agree to the
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              Terms of Service
            </span>
            <span className="text-zinc-800 dark:text-gray-200">and</span>
            <span className="text-indigo-600 dark:text-indigo-400">
              Privacy Policy
            </span>
          </div>
        </label>
      </div>

      {/* Create Account button */}
      <button
        type="submit"
        disabled={loading || !termsAccepted}
        className="flex flex-1 flex-row gap-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600  hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 rounded-lg w-full mt-1 justify-center items-center px-3 py-2"
      >
        <HiOutlineUserPlus className="text-white" size={25} />
        <span className="text-white">
          {" "}
          {loading ? "Creating account..." : "Create Account"}
        </span>
      </button>

      {/* Divider — "or continue with" */}
      <div className="mt-2 flex flex-row justify-between items-center flex-1 w-full">
        <div className="w-[33%] h-0 border border-gray-200 dark:border dark:border-slate-800"></div>
        <span className="text-gray-500 dark:text-gray-400">
          or continue with
        </span>
        <div className="w-[33%] h-0 border border-gray-200 dark:border dark:border-slate-800"></div>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-row w-full gap-2 mt-1">
       
        {/* Google Button */}
        <div
          onClick={() => !loading && googleLogin()}
          className={`rounded-lg flex w-full flex-row w-[50%] gap-1 justify-center px-2 py-2 items-center border-1 border-violet-100 dark:border-1 dark:border-slate-800 cursor-pointer ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <FcGoogle size={30} />
          <span className="text-zinc-800 dark:text-gray-200 font-medium">
            Google
          </span>
        </div>

        
      </div>

      {/* Sign In redirect */}
      <div className="flex flex-1 gap-2 w-full flex-row justify-center items-center mt-1">
        <span className="text-zinc-800 dark:text-gray-200">
          Already have an account?
        </span>
        <span
          onClick={() => navigate("/auth/signin")}
          className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline"
        >
          Sign In
        </span>
      </div>
    </form>
  );
}

export default RegisterForm;
