import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { MonthOption } from "../../utils/dateUtils";
import { GlassCard } from "./GlassCard";

export interface MRTMonthSectionProps {
  loading: boolean;
  filteredMonths: MonthOption[];
  selectedMonthLabel?: string | null;
  onOpenPicker: () => void;
}

export function MRTMonthSection({
  loading,
  filteredMonths,
  selectedMonthLabel,
  onOpenPicker,
}: MRTMonthSectionProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <GlassCard
      title="Monthly review (MRT)"
      subtitle="Select a month, then submit scores (3–5) and remarks."
      spacing="default"
    >
      {loading ? (
        <View style={s.loaderRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.bodyMuted}>Loading months…</Text>
        </View>
      ) : filteredMonths.length > 0 ? (
        <>
          <Text style={s.fieldLabel}>Month</Text>
          <TouchableOpacity
            style={s.monthPickerTrigger}
            activeOpacity={0.85}
            onPress={onOpenPicker}
          >
            <Text style={s.monthPickerTriggerText} numberOfLines={1}>
              {selectedMonthLabel ?? "Choose a month"}
            </Text>
            <Icon
              name="keyboard-arrow-down"
              size={24}
              color={
                isDark
                  ? "rgba(148, 163, 184, 0.9)"
                  : "rgba(71, 85, 105, 0.95)"
              }
            />
          </TouchableOpacity>
        </>
      ) : (
        <View style={s.emptyMonths}>
          <Icon
            name="event-busy"
            size={32}
            color={
              isDark
                ? "rgba(248, 113, 113, 0.85)"
                : "rgba(220, 38, 38, 0.85)"
            }
          />
          <Text style={s.emptyMonthsText}>
            No months available for this student.
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 8,
      marginTop: 4,
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    monthPickerTrigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
    },
    monthPickerTriggerText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    emptyMonths: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 12,
    },
    emptyMonthsText: {
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      color: colors.error,
      paddingHorizontal: 12,
    },
  });
}
