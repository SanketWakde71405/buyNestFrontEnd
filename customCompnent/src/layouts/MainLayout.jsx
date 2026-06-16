import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBarY from "../components/NavBarY";
import NavBar from "../components/NavBar";
import { useAuth } from "../App";

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  // ✅ Use AuthContext instead of local state — stays in sync with Auth.jsx
  const { signedIn, setSignedIn } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <NavBarY isCollapsed={isCollapsed} />
      <div className="bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex-1 flex flex-col overflow-y-auto gap-0 pb-20 md:pb-0">
        <NavBar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          signedIn={signedIn}
          setSignedIn={setSignedIn}
        />
        {/* No need to pass context via Outlet anymore — children use useAuth() */}
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
