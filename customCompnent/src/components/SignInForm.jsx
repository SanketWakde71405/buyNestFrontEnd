import React from 'react'
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { PiSignInBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";

import InputBox from './InputBox';

function SignInForm({ onClick }) {
  return (
    <div className="flex flex-1 flex-col justify-center items-start px-4 py-5">
      <span className="text-zinc-800 font-bold text-2xl text-start ">
        Welcome Back!👋
      </span>
      <span className="text-gray-400 pt-1 text-lg text-start">
        Sign in to continue to your Admin Dashboard
      </span>

      <div className="flex flex-1 flex-col w-full gap-2">
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
          placeholder="Enter your password"
          type="password"
          icon={
            <CiLock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={25}
            />
          }
        />
      </div>

      <div className="flex flex-1 w-full flex-row justify-between items-start mt-2">
        <div className="flex flex-row justify-center items-center gap-1">
          <input
            type="checkbox"
            className="w-5 h-5"
            className="accent-indigo-600"
            name="Remember Me"
            id=""
          />
          <label className="pb-1 font-medium" htmlFor="Remember Me">
            {" "}
            Remember Me
          </label>
        </div>
        <span className="text-indigo-600">Forgot Password?</span>
      </div>
      <button
        className="flex flex-1 flex-row gap-1 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600  hover:from-violet-600 hover:via-purple-700 hover:to-indigo-600 rounded-lg w-full mt-1 justify-center items-center px-3 py-4"
        onClick={onClick}
      >
        <PiSignInBold className="text-white" size={25} />
        <span className="text-white">Sign In</span>
      </button>

      <div className="mt-5 flex flex-row justify-between items-center flex-1 w-full">
        <div className="w-[33%] h-0 border border-gray-200"></div>
        <span className="text-gray-400">or continue with</span>
        <div className="w-[33%] h-0 border border-gray-200"></div>
      </div>

      <div className="flex flex-row w-full gap-2 mt-2">
        <div className="rounded-lg flex flex-row w-[50%] gap-1 justify-center px-2 py-2 items-center border-1 border-violet-100">
          <FcGoogle size={30} />
          <span className="text-zinc-800 font-medium">Google</span>
        </div>

        <div className="rounded-lg flex flex-row w-[50%] gap-1 justify-center px-2 py-2 items-center border-1 border-violet-100">
          <IoLogoGithub size={30} />
          <span className="text-zinc-800 font-medium">GitHub</span>
        </div>
      </div>

      <div className="flex flex-1 gap-2 w-full flex-row justify-center items-center mt-2">
        <span className="text-zinc-800">Don't have an account?</span>
        <span className="text-indigo-600">Register Now</span>
      </div>
    </div>
  );
}

export default SignInForm