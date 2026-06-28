import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
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
      {children}
    </AuthContext.Provider>
  );
}
