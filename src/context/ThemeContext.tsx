import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LIGHT_THEME, DARK_THEME } from "../theme/theme";

type ThemeType = typeof LIGHT_THEME;

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: "light" | "dark" | "system") => void;
  themeMode: "light" | "dark" | "system";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<"light" | "dark" | "system">(
    "system",
  );

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedMode = await AsyncStorage.getItem("themeMode");
      if (savedMode) {
        setThemeModeState(savedMode as "light" | "dark" | "system");
      }
    } catch (e) {
      console.error("Failed to load theme", e);
    }
  };

  const setThemeMode = async (mode: "light" | "dark" | "system") => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const toggleTheme = () => {
    const nextMode = isDarkMode ? "light" : "dark";
    setThemeMode(nextMode);
  };

  const isDarkMode =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider
      value={{ theme, isDarkMode, toggleTheme, setThemeMode, themeMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
