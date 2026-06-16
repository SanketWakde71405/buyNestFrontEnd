import React from "react";
import { useAuth } from "../App";
import HeroSection from "../components/HeroSection";
import OnBoarding from "../components/Onboarding";

function Home() {
  // ✅ useAuth() instead of useOutletContext()
  const { signedIn, isFirstLogin, setIsFirstLogin } = useAuth();

  const handleDismissOnboarding = () => {
    localStorage.setItem("isFirstLogin", "false");
    setIsFirstLogin(false);
  };

  if (signedIn && isFirstLogin) {
    return <OnBoarding onDismiss={handleDismissOnboarding} />;
  }

  return <HeroSection />;
}

export default Home;
