import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHome, AiOutlineMenu } from "react-icons/ai";
import { BsGraphUp } from "react-icons/bs";
import {
  IoCubeOutline,
  IoBarChartOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuUsers, LuBadgeHelp } from "react-icons/lu";
import { BiCategory } from "react-icons/bi";
import { RiDiscountPercentLine } from "react-icons/ri";
import { RiMenu2Fill } from "react-icons/ri";
import { MdOutlineDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";

import { PiSignInBold } from "react-icons/pi";
import useTheme from "../contexts/ThemeContext";

import ButtonIcon from "./ButtonIcon";

function NavBar({ isCollapsed, setIsCollapsed, signedIn, setSignedIn }) {
  const navigate = useNavigate();
  const { theme, lightTheme, darkTheme } = useTheme();

  const themeSwitcher = () => {
    if (theme === "dark") {
      console.log("Theme", theme);
      lightTheme();
    } else {
      console.log("Theme", theme);
      darkTheme();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("signedIn");
    localStorage.removeItem("isFirstLogin");
    setSignedIn(false);
    navigate("/auth/signin");
  };

  return (
    <div className="sticky top-0 z-20 py-2 flex h-16 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-700">
      <div
        className={`flex-1 px-4 flex justify-between gap-4 items-center w-full`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg border border-gray-200 dark:text-gray-200 dark:border-none dark:bg-gray-800 hidden md:block hover:bg-slate-100 dark:hover:bg-gray-700"
        >
          <RiMenu2Fill className="text-zinc-800 dark:text-gray-200" size={24} />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="p-2 rounded-lg bg-white border border-gray-200 dark:text-gray-200 dark:border-none dark:bg-gray-800 shadow-lg hover:bg-slate-100 dark:hover:bg-gray-700 z-20"
            onClick={themeSwitcher}
          >
            {theme === "dark" ? (
              <MdOutlineLightMode
                className="text-zinc-800 dark:text-gray-200"
                size={24}
              />
            ) : (
              <MdOutlineDarkMode
                className="text-zinc-800 dark:text-gray-200"
                size={24}
              />
            )}
          </button>

          {signedIn ? (
            <ButtonIcon
              text="Sign Out"
              onClick={handleSignOut}
              icon={<PiSignInBold size={24} />}
            />
          ) : (
            <ButtonIcon
              text="SignIn"
              onClick={() => navigate("/auth/signin")}
              icon={<PiSignInBold size={24} />}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
