import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

export interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  spacing?: "default" | "bottom" | "none";
}

export function GlassCard({
  children,
  title,
  subtitle,
  style,
  spacing = "default",
}: GlassCardProps) {
  const { isDark } = useTheme();
  const s = useMemo(() => createStyles(isDark), [isDark]);

  const spacingStyle =
    spacing === "bottom"
      ? s.sectionSpacingBottom
      : spacing === "none"
        ? undefined
        : s.sectionSpacing;

  return (
    <View style={[s.glassSection, spacingStyle, style]}>
      {title ? (
        <Text style={[s.sectionHeading, s.sectionHeadingStandalone]}>
          {title}
        </Text>
      ) : null}
      {subtitle ? <Text style={s.bodyMuted}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    glassSection: {
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    sectionSpacing: {
      marginBottom: 14,
    },
    sectionSpacingBottom: {
      marginBottom: 18,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginBottom: 6,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    sectionHeadingStandalone: {
      marginBottom: 6,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      marginBottom: 4,
    },
  });
}
