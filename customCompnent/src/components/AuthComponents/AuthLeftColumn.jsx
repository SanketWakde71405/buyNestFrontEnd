import React from "react";
import Logo from "../../assets/companyLogoGradient.svg?react";

import useTheme from "../../contexts/ThemeContext";
import FeatureItem from "../FeatureItem";

// Icons
import { LuShieldCheck } from "react-icons/lu";
import { GiElectric } from "react-icons/gi";
import { PiNetworkFill } from "react-icons/pi";

function AuthLeftColumn({
  headingText,
  headingTextGradient,
  subHeadingText,
  subHeadingTextGradient,
  subTitle,
  image,
  imageDark,
  isLock,
}) {
  
  const { theme } = useTheme();

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
    <div className="flex flex-col justify-between w-[50%] shrink-0 h-screen overflow-hidden py-6 px-8">
      <div className="flex flex-row items-center gap-2">
        <Logo className="w-16 h-16" />
        <div className="flex flex-col justify-center items-start">
          <span
            className="font-bold text-2xl text-zinc-800 dark:text-gray-200"
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <span className="text-4xl font-bold text-zinc-800 dark:text-gray-200">
            {headingText}
          </span>
          <span className="text-4xl font-bold text-indigo-600">
            {headingTextGradient}.
          </span>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <span className="text-4xl font-bold text-zinc-800 dark:text-gray-200">
            {subHeadingText}
          </span>
          <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            {subHeadingTextGradient}.
          </span>
        </div>
        <p className="text-base text-gray-500 dark:text-gray-400 w-[75%] mt-1">
          {subTitle}
        </p>
      </div>
      {theme === "dark" ? (
        <div className="flex justify-center items-center my-1">
          <img
            src={imageDark}
            className={`w-full max-w-xl object-contain items-center ${isLock ? "h-90" : "h-auto"}`}
            alt="Dashboard Preview"
          />
        </div>
      ) : (
        <div className="flex justify-center items-center my-1">
          <img
            src={image}
            className={`w-full max-w-xl object-contain items-center ${isLock ? "h-90" : "h-auto"}`}
            alt="Dashboard Preview"
          />
        </div>
      )}
      <div className="flex flex-row gap-2 w-full items-center py-4 bg-white dark:bg-slate-900 dark:border dark:border-slate-800 shadow-xl rounded-lg overflow-hidden px-3">
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
  );
}

export default AuthLeftColumn;
