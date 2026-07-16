import React from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { RiMenu2Fill } from "react-icons/ri";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { PiSignInBold } from "react-icons/pi";

// Contexts
import useTheme from "../contexts/ThemeContext";
import useAuth from "../contexts/AuthContext";

// Components
import ButtonIcon from "./ButtonIcon";

function NavBar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const { theme, lightTheme, darkTheme } = useTheme();

  const themeSwitcher = () => {
    if (theme === "dark") {
      lightTheme();
    } else {
      darkTheme();
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();

      navigate("/auth/signin", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-gray-200 bg-white py-2 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex h-full items-center justify-between px-4">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden rounded-lg border border-gray-200 p-2 transition hover:bg-slate-100 dark:border-none dark:bg-gray-800 dark:hover:bg-gray-700 md:block"
        >
          <RiMenu2Fill className="text-zinc-800 dark:text-gray-200" size={24} />
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={themeSwitcher}
            className="rounded-lg border border-gray-200 bg-white p-2 shadow hover:bg-slate-100 dark:border-none dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <MdOutlineLightMode
                className="text-zinc-800 dark:text-gray-200"
                size={22}
              />
            ) : (
              <MdOutlineDarkMode
                className="text-zinc-800 dark:text-gray-200"
                size={22}
              />
            )}
          </button>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 rounded-lg p-2 ">
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500 bg-indigo-600 text-sm font-semibold text-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
            </div>
          )}

          {/* Authentication Button */}
          {user ? (
            <ButtonIcon
              text="Sign Out"
              icon={<PiSignInBold size={20} />}
              onClick={handleSignOut}
            />
          ) : (
            <ButtonIcon
              text="Sign In"
              icon={<PiSignInBold size={20} />}
              onClick={() => navigate("/auth/signin")}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
