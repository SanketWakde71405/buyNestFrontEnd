import React from "react";
import { useNavigate } from "react-router-dom";
// Components
import Card from "../Card";
import ButtonIcon from "../ButtonIcon";
import FeatureItem from "../FeatureItem";
//Icons
import { PiSignInBold } from "react-icons/pi";
import { AiOutlineCompass } from "react-icons/ai";
import { BsStars } from "react-icons/bs";
import { HiShoppingBag } from "react-icons/hi";
import { RiShoppingCart2Fill } from "react-icons/ri";
import { HiUsers } from "react-icons/hi";
import { FaTag } from "react-icons/fa6";
import { PiChartBarFill } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";
import { LuShieldCheck } from "react-icons/lu";
import { GiElectric } from "react-icons/gi";
import { IoMdCloud } from "react-icons/io";
import { PiNetworkFill } from "react-icons/pi";

function HeroSection() {
  const cardItems = [
    {
      id: "products",
      icon: <HiShoppingBag className="text-blue-600" size={30} />,
      iconBackground: "bg-blue-100",
      cardName: "Products",
      cardDesc: "Add, edit and manage your products easily.",
    },
    {
      id: "orders",
      icon: <RiShoppingCart2Fill className="text-green-600" size={30} />,
      iconBackground: "bg-green-100",
      cardName: "Orders",
      cardDesc: "Track, manage and fulfill orders.",
    },
    {
      id: "customers",
      icon: <HiUsers className="text-violet-600" size={30} />,
      iconBackground: "bg-violet-100",
      cardName: "Customers",
      cardDesc: "View and manage your customers.",
    },
    {
      id: "coupons",
      icon: <FaTag className="text-amber-400" size={30} />,
      iconBackground: "bg-amber-100",
      cardName: "Coupons",
      cardDesc: "Create discounts and promotions.",
    },
    {
      id: "reports",
      icon: <PiChartBarFill className="text-rose-500" size={30} />,
      iconBackground: "bg-rose-100",
      cardName: "Reports",
      cardDesc: "Analyze sales and grow your business.",
    },
    {
      id: "settings",
      icon: <IoSettings className="text-cyan-400" size={30} />,
      iconBackground: "bg-cyan-100",
      cardName: "Settings",
      cardDesc: "Configure your store settings.",
    },
  ];

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
      id: "easy",
      title: "Easy to Use",
      desc: "Intuitive interface",
      icon: <IoMdCloud className="text-blue-500" size={30} />,
      iconBackground: "bg-blue-100",
    },

    {
      id: "scalable",
      title: "Scalable",
      desc: "Grow without limits",
      icon: <PiNetworkFill className="text-amber-500" size={30} />,
      iconBackground: "bg-amber-100",
    },
  ];

  const navigate= useNavigate();

  return (
    <div className="flex flex-col items-center text-center w-full">
      <section className="bg-transparent flex items-center px-4 py-8 lg:px-16 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-10">
          {/* Left — text content */}
          <div className="flex-1 flex flex-col gap-5 max-w-lg">
            {/* Badge */}
            <div className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full w-fit shadow-sm">
              <BsStars size={16} />
              <span>Welcome to BuyNest Admin</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-bold text-start text-slate-900 leading-tight">
              Manage Your <span className="text-indigo-500">Store.</span>
              <br />
              Grow Your{" "}
              <span className="bg-gradient-to-r from-violet-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Business.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-500 text-base leading-relaxed text-start">
              Powerful tools to manage products, orders, customers, and boost
              your ecommerce success.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <ButtonIcon
                onClick={() => navigate("/auth/signin")}
                text="Sign In to Admin Panel"
                icon={<PiSignInBold size={20} />}
              />
              <button className="flex items-center gap-2 text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors">
                <AiOutlineCompass size={20} />
                <span>Explore Dashboard</span>
              </button>
            </div>
          </div>

          {/* Right — dashboard preview image (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center lg:justify-end">
            <img
              src="https://res.cloudinary.com/dx88pbasu/image/upload/v1781166781/ChatGPT_Image_Jun_11__2026__01_53_59_PM-removebg-preview_qngafv.png"
              className="max-w-full h-auto"
              alt="Dashboard Preview"
            />
          </div>
        </div>
      </section>

      <p className="text-black font-bold text-2xl px-4">
        Everything you need to run your store
      </p>

      <div className="flex flex-col md:flex-row flex-wrap py-2 mt-2 px-4 mb-2 w-full">
        {cardItems.map((cardItem) => (
          <Card
            key={cardItem.id}
            icon={cardItem.icon}
            iconBackground={cardItem.iconBackground}
            cardName={cardItem.cardName}
            cardDesc={cardItem.cardDesc}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-12 mx-5 px-25 justify-center items-center py-5 bg-white shadow-xl rounded-lg">
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
      <footer className="my-5 mx-auto px-5">
        <p className="font-medium text-base text-center">
          © 2026 BuyNest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default HeroSection;
