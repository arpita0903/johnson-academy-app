import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/** Native splash is a solid color; match the first stop of the active gradient. */
export const NATIVE_SPLASH_BACKGROUND_LIGHT = "#faf5ff";
export const NATIVE_SPLASH_BACKGROUND_DARK = "#0c1224";

const LIGHT_GRADIENT_COLORS = ["#faf5ff", "#f5f3ff", "#ecfeff"] as const;
const LIGHT_GRADIENT_LOCATIONS = [0, 0.42, 1] as const;

const DARK_GRADIENT_COLORS = ["#0c1224", "#080816", "#041016"] as const;
const DARK_GRADIENT_LOCATIONS = [0, 0.48, 1] as const;

export interface ScreenGradientBackgroundProps {
  isDark: boolean;
}

/**
 * Full-screen gradient behind scroll/content. Uses pointerEvents="none"
 * so touches pass through to children layered above.
 */
export function ScreenGradientBackground({
  isDark,
}: ScreenGradientBackgroundProps) {
  if (!isDark) {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={[...LIGHT_GRADIENT_COLORS]}
          locations={[...LIGHT_GRADIENT_LOCATIONS]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...DARK_GRADIENT_COLORS]}
        locations={[...DARK_GRADIENT_LOCATIONS]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
