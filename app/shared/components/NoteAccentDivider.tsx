import React, { useMemo } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";

export interface NoteAccentDividerProps {
  /** Material Icons glyph name shown between the lines */
  iconName?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  marginTop?: number;
  marginBottom?: number;
}

/**
 * Horizontal accent rule with a centered icon (default music note).
 * Matches styling used under section headings across student/profile UI.
 */
export function NoteAccentDivider({
  iconName = "music-note",
  iconSize = 17,
  style,
  marginTop,
  marginBottom = 14,
}: NoteAccentDividerProps) {
  const { isDark } = useTheme();
  const s = useMemo(() => createStyles(isDark), [isDark]);
  const iconColor = isDark
    ? "rgba(167, 139, 250, 0.75)"
    : "rgba(109, 40, 217, 0.55)";

  return (
    <View style={[s.row, { marginTop, marginBottom }, style]}>
      <View style={s.line} />
      <MaterialIcons
        name={iconName as React.ComponentProps<typeof MaterialIcons>["name"]}
        size={iconSize}
        color={iconColor}
        style={s.icon}
      />
      <View style={s.line} />
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.25)"
        : "rgba(45, 212, 191, 0.35)",
    },
    icon: {
      marginHorizontal: 10,
    },
  });
}
