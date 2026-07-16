import React from "react";
import useAuth from "../contexts/AuthContext"; // ✅ default import, correct path
import HeroSection from "../components/HomeSection/HeroSection";
import Onboarding from "../components/HomeSection/Onboarding";
import Dashboard from "./Dashboard";

function Home() {
  const { user, isFirstLogin, loading, completeOnboarding } = useAuth();

  // Still resolving auth state — avoid flashing the wrong screen
  if (loading) {
    return null; // or a spinner/skeleton component
  }

  // Not logged in
  if (!user) {
    return <HeroSection />;
  }

  // Logged in, first time
  if (isFirstLogin) {
    return <Onboarding onDismiss={completeOnboarding} />;
  }

  // Logged in, returning user
  return <Dashboard />;
}

export default Home;
