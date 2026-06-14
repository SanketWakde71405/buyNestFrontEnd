import React from 'react'
import { Outlet } from "react-router-dom";
import { useState } from "react";
import NavBarY from '../components/NavBarY';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div className="flex h-screen overflow-hidden">
      <NavBarY isCollapsed={isCollapsed} />
      <div className="bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex-1 flex flex-col overflow-y-auto gap-0 pb-20 md:pb-0">
        {" "}
        {/* pb-16 for mobile bottom nav */}
        <NavBar
          className="bg-white"
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <Outlet/>
      </div>
    </div>
  );
}

export default MainLayout