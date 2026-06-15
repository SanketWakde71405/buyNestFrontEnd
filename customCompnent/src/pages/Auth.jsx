import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Logo from "../assets/companyLogoGradient.svg?react";

import { LuShieldCheck } from "react-icons/lu";
import { GiElectric } from "react-icons/gi";
import { IoMdCloud } from "react-icons/io";
import { PiNetworkFill } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa6";
import { LuUserRoundPlus } from "react-icons/lu";

// Register Form Icons
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { PiSignInBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { IoLogoGithub } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { HiOutlineUserPlus } from "react-icons/hi2";

import FeatureItem from "../components/FeatureItem";
import InputBox from "../components/InputBox";
import ButtonIcon from "../components/ButtonIcon";
import SignInForm from "../components/SignInForm";
import RegisterForm from "../components/RegisterForm";

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setactiveTab] = useState("signin");


  // Feature items data — unchanged
  const featureItems = [
    {
      id: "secure",
      title: "Secure & safe",
      desc: "Enterprise-grade security",
      icon: <LuShieldCheck className="text-violet-700" size={30} />,
      iconBackground: "bg-violet-100",
    },
    {
      id: "fast",
      title: "Fast & Reliable",
      desc: "Built for performance",
      icon: <GiElectric className="text-green-500" size={30} />,
      iconBackground: "bg-green-100",
    },
    {
      id: "scalable",
      title: "Scalable",
      desc: "Grow without limits",
      icon: <PiNetworkFill className="text-amber-500" size={30} />,
      iconBackground: "bg-amber-100",
    },
  ];

  return (
    <div className="flex flex-row w-full h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* ───── Left column — unchanged ───── */}
      <div className="flex flex-col justify-between w-[50%] h-full py-6 px-8">
        {/* Logo */}
        <div className="flex flex-row items-center gap-2">
          <Logo className="w-16 h-16" />
          <div className="flex flex-col justify-center items-start">
            <span
              className="font-bold text-2xl text-zinc-800"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              BuyNest
            </span>
            <span
              className="text-sm text-indigo-600"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Admin
            </span>
          </div>
        </div>

        {/* Headline + subtext */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <span className="text-4xl font-bold text-zinc-800">
              Manage Your
            </span>
            <span className="text-4xl font-bold text-indigo-600">Store.</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <span className="text-4xl font-bold text-zinc-800">Grow Your</span>
            <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Business.
            </span>
          </div>
          <p className="text-base text-gray-400 w-[75%] mt-1">
            Powerful tools to manage products, orders, customers, and boost your
            ecommerce success
          </p>
        </div>

        {/* Dashboard preview image */}
        <img
          src="https://res.cloudinary.com/dx88pbasu/image/upload/v1781166781/ChatGPT_Image_Jun_11__2026__01_53_59_PM-removebg-preview_qngafv.png"
          className="w-full max-w-xl h-auto object-contain items-center"
          alt="Dashboard Preview"
        />

        {/* Feature items */}
        <div className="flex flex-row gap-2 w-full items-center py-4 bg-white shadow-xl rounded-lg overflow-hidden px-3">
          {featureItems.map((item) => (
            <FeatureItem
              key={item.id}
              id={item.id}
              title={item.title}
              desc={item.desc}
              icon={item.icon}
              iconBackground={item.iconBackground}
            />
          ))}
        </div>
      </div>

      {/* ───── Right column — Forms ───── */}
      {/* CHANGED: added py-4 to prevent card from touching top/bottom edges */}
      <div className="flex flex-col flex-1 w-[50%] h-screen justify-center items-center py-4">
        <div className="flex flex-col w-[80%] py-4 px-5 mx-10 bg-white rounded-lg shadow-xl z-20">
          {/* Form toggle Buttons Container — unchanged */}
          <div className="flex flex-row justify-center items-center bg-violet-50 border border-violet-100 rounded-lg p-2 mx-2 my-1">
            {/* Sign In tab button */}
            <div
              className={`flex flex-1 gap-2 justify-center rounded-lg py-2 items-center ${
                activeTab === "signin"
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600"
                  : "bg-transparent"
              }`}
              onClick={() => {
                setactiveTab("signin");
                navigate("/auth/signin");
              }}
            >
              <FaRegUser
                className={`${activeTab === "signin" ? "text-white" : "text-zinc-800"}`}
                size={25}
              />
              <span
                className={`${activeTab === "signin" ? "text-white" : "text-zinc-800"}`}
              >
                Sign In
              </span>
            </div>

            {/* Register tab button */}
            <div
              onClick={() => {
                setactiveTab("register");
                navigate("/auth/register");
              }}
              className={`flex flex-1 gap-2 justify-center rounded-lg py-2 items-center ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600"
                  : "bg-transparent"
              }`}
            >
              <LuUserRoundPlus
                className={`${activeTab === "register" ? "text-white" : "text-zinc-800"}`}
                size={25}
              />
              <span
                className={`${activeTab === "register" ? "text-white" : "text-zinc-800"}`}
              >
                Register
              </span>
            </div>
          </div>

          {activeTab === "signin" ? <SignInForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

export default Auth;
