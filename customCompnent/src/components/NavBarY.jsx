import React from "react";
import logo from "../assets/companyLogo.svg";
import { AiOutlineHome } from "react-icons/ai";
import { BsGraphUp } from "react-icons/bs";
import {
  IoCubeOutline,
  IoBarChartOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { LuUsers, LuBadgeHelp } from "react-icons/lu";
import { BiCategory } from "react-icons/bi";
import { BsCart2 } from "react-icons/bs";
import { RiDiscountPercentLine } from "react-icons/ri";

function NavBarY({ isCollapsed }) {
  const navItems = [
    { icon: <AiOutlineHome size={22} />, text: "Home" },
    { icon: <BsGraphUp size={22} />, text: "Dashboard" },
    { icon: <IoCubeOutline size={22} />, text: "Products" },
    { icon: <BsCart2 size={22} />, text: "Orders" },
    { icon: <LuUsers size={22} />, text: "Customers" },
    { icon: <BiCategory size={22} />, text: "Categories" },
    { icon: <RiDiscountPercentLine size={22} />, text: "Coupons" },
    { icon: <IoBarChartOutline size={22} />, text: "Reports" },
    { icon: <IoSettingsOutline size={22} />, text: "Settings" },
    { icon: <LuBadgeHelp size={22} />, text: "Help & Support" },
  ];

  return (
    <>
      {/* Sidebar — hidden on mobile, visible md+ */}
      <div
        className={`
          hidden md:flex flex-col bg-slate-900 text-white h-screen
          transition-all duration-300
          ${isCollapsed ? "w-20" : "lg:w-64 md:w-20"}
        `}
      >
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center justify-center gap-2 p-3">
          <img className="w-10 h-10 text-white" src={logo} alt="Logo" />
          {/* Show label only on lg+ when not collapsed */}
          {!isCollapsed && (
            <div className="hidden lg:flex flex-col">
              <span
                className="text-white font-semibold text-2xl leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                BuyNest
              </span>
              <span
                className="text-gray-400 text-sm tracking-widest"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Ecommerce Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <ul className="mt-4 flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              // collapsed on md unless lg+ and not isCollapsed
              isCollapsed={isCollapsed}
              showLabel={!isCollapsed}
            />
          ))}
        </ul>
      </div>

      {/* Bottom nav — visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white z-50 border-t border-slate-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.text}
              className="flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-indigo-600 transition-colors flex-shrink-0"
              title={item.text}
            >
              {item.icon}
              <span className="text-xs text-gray-400">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function NavItem({ icon, text, showLabel }) {
  return (
    <li
      className={`flex items-center p-4 mx-2 my-1 rounded-lg cursor-pointer hover:bg-indigo-600 transition-colors
        ${showLabel ? "lg:gap-3" : "justify-center"}
      `}
    >
      {icon}
      {showLabel && <span className="hidden lg:inline">{text}</span>}
    </li>
  );
}

export default NavBarY;
