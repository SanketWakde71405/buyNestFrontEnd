import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

// Context imports
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import apiClient from "./services/ApiClient";
import AuthApi from "./services/AuthApi";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Coupons from "./pages/Coupons";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Brands from "./pages/Brands";

function App() {
  /*___________________Theme Context_____________________*/
  // state to manage theme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  // null functions from context initialized here
  const lightTheme = () => {
    setTheme("light");
  };

  const darkTheme = () => {
    setTheme("dark");
  };

  // The actual change in theme for tailwind
  useEffect(() => {
    document.querySelector("html").classList.remove("light", "dark");
    document.querySelector("html").classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /*____________Auth Context___________________ */
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFirstLogin = user?.isFirstLogin;
  console.log("Login val", isFirstLogin);

  const checkAuth = async () => {
    try {
      const currentUser = await AuthApi.getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (user) {
        await AuthApi.logoutUser();
      }
    } catch (error) {
      // Ignore network/server errors.
    } finally {
      setUser(null);
    }
  };

  const completeOnboarding = async () => {
    if (!user?._id) return;

    try {
      await AuthApi.completeOnboarding(user._id);
      setUser((prev) => (prev ? { ...prev, isFirstLogin: false } : prev));
    } catch (error) {
      console.error("Failed to complete onboarding:", error.message);
    }
  };

  /*Check authentication once when the app boots.*/
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    apiClient.setLogoutHandler(logout);
  }, []);

  const authValue = useMemo(
    () => ({
      user,
      loading,
      isFirstLogin,
      login,
      logout,
      checkAuth,
      completeOnboarding,
    }),
    [user, loading, isFirstLogin],
  );

  return (
    // The context provider is passed with value
    <ThemeProvider value={{ theme, lightTheme, darkTheme }}>
      <AuthProvider value={authValue}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/auth/signin" element={<Auth />} />
            <Route path="/auth/register" element={<Auth />} />
            <Route path="/auth/reset-password/:resetToken" element={<Auth />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
