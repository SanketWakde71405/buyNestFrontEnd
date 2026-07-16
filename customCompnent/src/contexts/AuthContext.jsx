import { createContext, useContext } from "react";

// Context creation - default values are set here, actual values are provided in App.jsx
export const AuthContext = createContext({
  user: null,
  signedIn: false,
  loading: true,
  isFirstLogin: false,
  login: () => {},
  logout: () => {},
  checkAuth: () => {},
  completeOnboarding: () => {},
});

// Context provider
export const AuthProvider = AuthContext.Provider;

// Using the variables from the context
export default function useAuth() {
  return useContext(AuthContext);
}
