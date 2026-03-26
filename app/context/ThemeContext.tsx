import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Colors, ColorScheme, ThemeColors } from "../theme/colors";

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

  const toggleTheme = useCallback(() => {
    setColorScheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const value = useMemo<ThemeContextType>(
    () => ({
      colorScheme,
      colors,
      toggleTheme,
      isDark,
    }),
    [colorScheme, colors, toggleTheme, isDark]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
