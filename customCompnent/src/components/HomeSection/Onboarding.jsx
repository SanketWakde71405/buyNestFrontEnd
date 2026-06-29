import React from "react";
import { HiOutlineLightBulb } from "react-icons/hi";
import useTheme from "../../contexts/ThemeContext";

const Connector = ({ active }) => (
  <div className="flex-1 flex items-center mx-2">
    {active ? (
      <div className="w-full h-[2px] flex">
        <div className="w-1/2 h-full bg-indigo-600" />
        <div
          className="w-1/2 h-full bg-repeat-x"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "8px 2px",
          }}
        />
      </div>
    ) : (
      <div
        className="w-full h-[2px] bg-repeat-x"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "8px 2px",
        }}
      />
    )}
  </div>
);

function Onboarding() {
  const {theme} = useTheme();
  const steps = [
    {
      number: 1,
      title: "Store Setup",
      description: "Add your store details, logo, and basic information.",
      cta: "Start Now",
    },
    {
      number: 2,
      title: "Add Products",
      description: "Add your first products or import from existing store.",
      cta: "Add Products",
    },
    {
      number: 3,
      title: "Configure Settings",
      description: "Set up payment methods, shipping & tax preferences.",
      cta: "Configure",
    },
    {
      number: 4,
      title: "Customize Store",
      description: "Choose a theme and customize your store appearance.",
      cta: "Customize",
    },
    {
      number: 5,
      title: "Go Live",
      description: "Review everything and launch your store to the world!",
      cta: "Review & Launch",
    },
  ];

  return (
    <div className="h-screen w-full bg-transparent flex flex-col justify-center overflow-hidden px-5 py-3 gap-6">
      {/* Hero row */}
      <div className="flex flex-row w-full justify-center items-center px-3">
        <div className="flex flex-col w-[50%]">
          <div className="rounded-3xl bg-violet-100 dark:bg-slate-900 w-[38%] px-3 py-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm text-nowrap text-start">
              👋 Welcome to BuyNest Admin
            </span>
          </div>

          <div className="flex flex-col w-[85%] mt-2">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-gray-200">
              Welcome Aboard! 🎉
            </h2>
            <span className="pt-1 text-gray-800 dark:text-gray-200 text-lg leading-snug">
              Thank you for choosing BuyNest.
              <br />
              Let's get your store set up in just a few simple steps.
            </span>
          </div>
        </div>

        <div className="w-[50%] hidden md:flex flex-1 justify-center lg:justify-end">
          {theme === "dark" ? (
            <img
              src="https://res.cloudinary.com/dx88pbasu/image/upload/v1782672011/Frame_104_dark_gkd3tl.png"
              alt="Dashboard Preview"
            />
          ) : (
            <img
              src="https://res.cloudinary.com/dx88pbasu/image/upload/v1781596866/onboarding_yfmila.png"
              alt="Dashboard Preview"
            />
          )}
        </div>
      </div>

      {/* Steps card */}
      <div className="w-full bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-xl px-8 py-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-gray-200">
          Let&apos;s Get You Started
        </h2>
        <p className="text-xs text-gray-800 dark:text-gray-500 mt-1 mb-5">
          Complete these steps to launch your store
        </p>

        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center w-40">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold mb-3 ${
                    step.number === 1
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-500 border border-gray-300 dark:border dark:border-slate-700"
                  }`}
                >
                  {step.number}
                </div>

                <h3 className="text-sm font-semibold text-zinc-800 dark:text-gray-500 mb-1">
                  {step.title}
                </h3>

                <p className="text-xs text-gray-800 dark:text-gray-500 leading-snug mb-3 min-h-[32px]">
                  {step.description}
                </p>

                <button
                  className={`text-xs font-medium px-4 py-1.5 rounded-md transition-colors ${
                    step.number === 1
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-white dark:bg-slate-900 dark:text-gray-200 text-gray-700 border border-gray-300 dark:border dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {step.cta}
                </button>
              </div>

              {index < steps.length - 1 && (
                <Connector active={step.number === 1} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Pro tip bar */}
      <div className="bg-violet-50 dark:bg-gray-900 shadow-base w-full rounded-xl px-4 py-2 flex flex-row justify-between items-center gap-1">
        <div className="flex flex-row gap-2 items-center font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
          <HiOutlineLightBulb
            className="text-indigo-600 dark:text-indigo-400"
            size={20}
          />
          Pro Tip:
          <span className="text-zinc-800 dark:text-gray-200  font-normal">
            You can always come back to these steps anytime from the dashboard.
          </span>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <div className="rounded-lg text-indigo-600 dark:text-indigo-400 px-3 text-sm font-semibold py-1.5 bg-transparent hover:border hover:border-indigo-600 dark:hover:border dark:hover:border-indigo-400 cursor-pointer">
            Skip for now
          </div>
          <div className="rounded-lg text-white text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
            Take a Tour
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
