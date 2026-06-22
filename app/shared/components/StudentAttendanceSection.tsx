import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { AttendanceResponse } from "../../types/attendance";
import { formatDate } from "../../utils/dateUtils";
import { GlassCard } from "./GlassCard";
import { StatInfoRow } from "./StatInfoRow";

export interface StudentAttendanceSectionProps {
  attendanceData: AttendanceResponse;
  filteredMonthsCount: number;
  fallbackJoiningDate?: string | null;
}

export function StudentAttendanceSection({
  attendanceData,
  filteredMonthsCount,
  fallbackJoiningDate,
}: StudentAttendanceSectionProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(isDark), [isDark]);

  const firstResult = attendanceData.results?.[0];
  const joiningDateLabel = firstResult?.joiningDate
    ? formatDate(firstResult.joiningDate)
    : fallbackJoiningDate
      ? formatDate(fallbackJoiningDate)
      : "—";

  return (
    <GlassCard
      title="Attendance"
      subtitle="Student attendance snapshot"
      spacing="default"
    >
      <View style={s.statDivider} />

      <StatInfoRow
        icon="event"
        label="Joining date"
        value={joiningDateLabel}
      />

      <StatInfoRow
        icon="calendar-month"
        label="Available months"
        value={filteredMonthsCount}
      />

      {firstResult?.presentDates ? (
        <StatInfoRow
          icon="check-circle"
          iconColor={colors.success}
          label="Present days"
          value={firstResult.presentDates.length}
          variant="success"
        />
      ) : null}

      {firstResult?.absentDates ? (
        <StatInfoRow
          icon="cancel"
          iconColor={colors.error}
          label="Absent days"
          value={firstResult.absentDates.length}
          variant="error"
        />
      ) : null}

      {firstResult?.lastDate ? (
        <StatInfoRow
          icon="update"
          label="Last attendance"
          value={formatDate(firstResult.lastDate)}
        />
      ) : null}
    </GlassCard>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    statDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.4)",
      marginVertical: 14,
    },
  });
}
