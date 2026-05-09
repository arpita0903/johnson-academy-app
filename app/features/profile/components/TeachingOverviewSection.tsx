import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { useTeacherClasses } from "../../../shared/hooks/useTeacherClasses";
import type { ClassByTeacher } from "../../../types/classes";

interface TeachingOverviewSectionProps {
  teacherId: string | null | undefined;
}

export default function TeachingOverviewSection({
  teacherId,
}: TeachingOverviewSectionProps) {
  const { colors, isDark } = useTheme();
  const { data, isPending } = useTeacherClasses(teacherId ?? null);
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const classes: ClassByTeacher[] = useMemo(() => data ?? [], [data]);
  const totalStudents = useMemo(
    () =>
      classes.reduce(
        (total, cls) =>
          total + (cls.studentsInClass?.length ?? cls.students?.length ?? 0),
        0,
      ),
    [classes],
  );

  if (isPending) {
    return (
      <View style={[s.card, s.loadingWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={s.card}>
      <View style={s.titleRow}>
        <View style={s.iconBadge}>
          <MaterialIcons name="workspace-premium" size={22} color={colors.primary} />
        </View>
        <View style={s.titleTextWrap}>
          <Text style={s.title}>Teaching overview</Text>
          <Text style={s.subtitle}>
            Snapshot of your classes and enrolled students.
          </Text>
        </View>
      </View>

      <View style={s.metricsRow}>
        <View style={s.metricCell}>
          <View style={s.metricIconRow}>
            <MaterialIcons name="menu-book" size={18} color={colors.primary} />
            <Text style={s.metricValue}>{classes.length}</Text>
          </View>
          <Text style={s.metricLabel}>Classes</Text>
        </View>

        <View style={s.metricDivider} />

        <View style={s.metricCell}>
          <View style={s.metricIconRow}>
            <MaterialIcons name="groups" size={18} color={colors.primary} />
            <Text style={s.metricValue}>{totalStudents}</Text>
          </View>
          <Text style={s.metricLabel}>Students</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    card: {
      overflow: "hidden",
      marginBottom: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.22)"
        : "rgba(167, 139, 250, 0.22)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.88)"
        : "rgba(255, 255, 255, 0.92)",
      paddingVertical: 18,
      paddingHorizontal: 16,
    },
    loadingWrap: {
      minHeight: 120,
      alignItems: "center",
      justifyContent: "center",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : `${colors.primary}16`,
    },
    titleTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "stretch",
      marginTop: 20,
      paddingTop: 18,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
    },
    metricCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 4,
    },
    metricDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: "stretch",
      marginVertical: 4,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
    },
    metricIconRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metricValue: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.5,
      color: colors.primary,
    },
    metricLabel: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.35,
      textTransform: "uppercase",
      color: isDark ? "#94A3B8" : "#64748B",
    },
  });
