import React from "react";
import { useAuth } from "../App";
import HeroSection from "../components/HomeSection/HeroSection";
import Onboarding from "../components/HomeSection/Onboarding";
import Dashboard from "../components/HomeSection/Dashboard";

function Home() {
  // ✅ useAuth() instead of useOutletContext()
  const { signedIn, isFirstLogin, setIsFirstLogin } = useAuth();

  const handleDismissOnboarding = () => {
    localStorage.setItem("isFirstLogin", "false");
    setIsFirstLogin(false);
  };

  if (signedIn && isFirstLogin) {
    return <Onboarding onDismiss={handleDismissOnboarding} />;
  }

  return <HeroSection />;
}

export default Home;
