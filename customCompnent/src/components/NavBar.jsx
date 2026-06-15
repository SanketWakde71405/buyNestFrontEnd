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
import { PiSignInBold } from "react-icons/pi";


import ButtonIcon from "./ButtonIcon";

function NavBar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const [signedIn,setSignedIn]= useState(false);
  return (
    <div className="sticky top-0 z-10 py-2 flex h-16 w-full bg-white border-b border-gray-200">
      <div
        className={`flex-1 px-4 flex justify-between gap-4 items-center w-full`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg border border-gray-200 hidden md:block hover:bg-slate-100"
        >
          <RiMenu2Fill className="text-black" size={24} />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 rounded-lg bg-white border border-gray-200 shadow-lg hover:bg-slate-100 z-20">
            <MdOutlineDarkMode className="text-black " size={24} />
          </button>

          {signedIn ? (
            <ButtonIcon
              text="Sign Out"
              onClick={() => navigate("/auth/logout")}
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
