export const Colors = {
  light: {
    background: "#ffffff",
    surface: "#ffffff",
    text: "#000000",
    textSecondary: "#666666",
    textMuted: "#999999",
    primary: "#ff6b35", // Orange theme for consistency
    primaryDark: "#e55a2b",
    primaryLight: "#ff8c5a",
    accent: "#ff9966",
    primaryText: "#ffffff",
    border: "#cccccc",
    inputBackground: "#ffffff",
    inputBorder: "#dddddd",
    placeholderText: "#A8A8A8",
    error: "#ff0000",
    success: "#4caf50",
    warning: "#ff9800",
    shadow: "#000000",
    card: "#ffffff",
    cardBorder: "#eeeeee",
    black: "#000000",
    white: "#ffffff",
  },
  dark: {
    background: "#121212",
    surface: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#b3b3b3",
    textMuted: "#808080",
    primary: "#ff6b35", // Main orange color
    primaryDark: "#e55a2b", // Darker orange for pressed states
    primaryLight: "#ff8c5a", // Lighter orange for accents
    accent: "#ff9966", // Secondary orange
    primaryText: "#ffffff",
    border: "#333333",
    inputBackground: "#2a2a2a",
    inputBorder: "#404040",
    placeholderText: "#666666",
    error: "#ff4444",
    success: "#4caf50",
    warning: "#ff9800",
    shadow: "#000000",
    card: "#2a2a2a",
    cardBorder: "#404040",
    black: "#000000",
    white: "#ffffff",
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.dark;
