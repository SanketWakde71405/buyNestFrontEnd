import { createContext, useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";

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

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function App() {
  const [signedIn, setSignedIn] = useState(
    () => localStorage.getItem("signedIn") === "true",
  );
  const [isFirstLogin, setIsFirstLogin] = useState(
    () => localStorage.getItem("isFirstLogin") === "true",
  );

  return (
    <AuthContext.Provider
      value={{ signedIn, setSignedIn, isFirstLogin, setIsFirstLogin }}
    >
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
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
