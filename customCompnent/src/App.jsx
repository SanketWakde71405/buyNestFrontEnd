import { createContext, useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";

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
