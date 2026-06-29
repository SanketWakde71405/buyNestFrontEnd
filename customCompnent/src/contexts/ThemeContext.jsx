import { createContext, useContext, useState } from "react";


// Context creation the default values are null and can be set in any file (in this case App.jsx)
export const ThemeContext = createContext({
  theme: "light",
  darkTheme: () => {},
  lightTheme: () => {},
});

// Context provider
export const ThemeProvider = ThemeContext.Provider;

// Using the variables from the context 
export default function useTheme() {
  return useContext(ThemeContext);
}