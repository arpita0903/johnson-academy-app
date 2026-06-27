import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";

export type StatInfoRowVariant = "badge" | "success" | "error";

export interface StatInfoRowProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string | number;
  variant?: StatInfoRowVariant;
}

export function StatInfoRow({
  icon,
  iconColor,
  label,
  value,
  variant = "badge",
}: StatInfoRowProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <View style={s.dateRow}>
      <Icon name={icon} size={20} color={resolvedIconColor} />
      <Text style={s.statLabel}>{label}</Text>
      {variant === "badge" ? (
        <View style={s.dateBadge}>
          <Text style={s.dateBadgeText}>{value}</Text>
        </View>
      ) : (
        <View
          style={[
            s.countPill,
            variant === "success" ? s.countPillSuccess : s.countPillError,
          ]}
        >
          <Text style={s.countPillText}>{value}</Text>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
    },
    statLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    dateBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
    },
    dateBadgeText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },
    countPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      minWidth: 40,
      alignItems: "center",
    },
    countPillSuccess: {
      backgroundColor: isDark
        ? "rgba(34, 197, 94, 0.2)"
        : "rgba(34, 197, 94, 0.18)",
    },
    countPillError: {
      backgroundColor: isDark
        ? "rgba(239, 68, 68, 0.22)"
        : "rgba(239, 68, 68, 0.14)",
    },
    countPillText: {
      fontSize: 14,
      fontWeight: "900",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
  });
}
