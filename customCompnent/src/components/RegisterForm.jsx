import React from 'react'
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { PiSignInBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { HiOutlineUserPlus } from "react-icons/hi2";

import InputBox from "./InputBox";


function RegisterForm() {
  return (
    <div className="flex flex-1 flex-col justify-center items-start px-4 py-2">
      {/* Form heading */}
      <span className="text-zinc-800 font-bold text-2xl text-start">
        Create your Account👋
      </span>
      <span className="text-gray-400 text-base text-start">
        Join BuyNest Admin and take your store to the next level.
      </span>

      {/* Input fields */}
      <div className="flex flex-1 flex-col w-full gap-1">
        <InputBox
          label="Full Name"
          placeholder="Enter your full name"
          icon={
            <CiUser
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
        <InputBox
          label="Email Address"
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
          id="terms"
        />
        <label className="pb-1 font-medium" htmlFor="terms">
          <div className="flex flex-row gap-1">
            <span className="text-zinc-800">I agree to the</span>
            <span className="text-indigo-600">Terms of Service</span>
            <span className="text-zinc-800">and</span>
            <span className="text-indigo-600">Privacy Policy</span>
          </div>
        </label>
      </div>

      {/* Create Account button */}
      <button className="flex flex-1 flex-row gap-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600  hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 rounded-lg w-full mt-1 justify-center items-center px-3 py-2">
        <HiOutlineUserPlus className="text-white" size={25} />
        <span className="text-white">Create Account</span>
      </button>

      {/* Divider — "or continue with" */}
      <div className="mt-2 flex flex-row justify-between items-center flex-1 w-full">
        <div className="w-[33%] h-0 border border-gray-200"></div>
        <span className="text-gray-400">or continue with</span>
        <div className="w-[33%] h-0 border border-gray-200"></div>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-row w-full gap-2 mt-1">
        <div className="rounded-lg flex flex-row w-[50%] gap-1 justify-center px-2 py-2 items-center border-1 border-violet-100">
          <FcGoogle size={30} />
          <span className="text-zinc-800 font-medium">Google</span>
        </div>
        <div className="rounded-lg flex flex-row w-[50%] gap-1 justify-center px-2 py-2 items-center border-1 border-violet-100">
          <IoLogoGithub size={30} />
          <span className="text-zinc-800 font-medium">GitHub</span>
        </div>
      </div>

      {/* Sign In redirect */}
      <div className="flex flex-1 gap-2 w-full flex-row justify-center items-center mt-1">
        <span className="text-zinc-800">Already have an account?</span>
        <span className="text-indigo-600">Sign In</span>
      </div>
    </div>
  );
}

export default RegisterForm