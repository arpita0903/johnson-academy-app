import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { AttendanceData, AttendanceResponse } from "../../types/attendance";
import {
  ALL_ATTENDANCE_PERIOD,
  filterDatesByPeriod,
  formatDate,
  generateAttendanceMonthOptions,
  MonthOption,
} from "../../utils/dateUtils";
import { GlassCard } from "./GlassCard";
import { StatInfoRow } from "./StatInfoRow";
import { MonthPickerModal } from "./MonthPickerModal";

const CHIP_OPTION_LIMIT = 6;

export interface StudentAttendanceSectionProps {
  attendanceData: AttendanceResponse;
  fallbackJoiningDate?: string | null;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

export function StudentAttendanceSection({
  attendanceData,
  fallbackJoiningDate,
  selectedPeriod,
  onSelectPeriod,
}: StudentAttendanceSectionProps) {
  const records = attendanceData.results ?? [];

  if (records.length === 0) {
    return (
      <GlassCard
        title="Attendance"
        subtitle="No attendance record for this class yet"
        spacing="default"
      >
        {null}
      </GlassCard>
    );
  }

  return (
    <>
      {records.map((record) => (
        <AttendanceStatsCard
          key={record.id}
          record={record}
          fallbackJoiningDate={fallbackJoiningDate}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={onSelectPeriod}
        />
      ))}
    </>
  );
}

interface AttendanceStatsCardProps {
  record: AttendanceData;
  fallbackJoiningDate?: string | null;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
}

function AttendanceStatsCard({
  record,
  fallbackJoiningDate,
  selectedPeriod: selectedPeriodProp,
  onSelectPeriod,
}: AttendanceStatsCardProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [expanded, setExpanded] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(selectedPeriodProp);

  const joiningDate = record.joiningDate || fallbackJoiningDate || "";

  useEffect(() => {
    setSelectedPeriod(selectedPeriodProp);
  }, [selectedPeriodProp]);

  useEffect(() => {
    setExpanded(false);
    setSelectedPeriod(ALL_ATTENDANCE_PERIOD);
    onSelectPeriod(ALL_ATTENDANCE_PERIOD);
  }, [record.id, record.joiningDate, onSelectPeriod]);

  const handleSelectPeriod = (period: string) => {
    setSelectedPeriod(period);
    onSelectPeriod(period);
  };

  const monthOptions = useMemo(
    () => generateAttendanceMonthOptions(joiningDate),
    [joiningDate],
  );

  const periodOptions: MonthOption[] = useMemo(
    () => [{ label: "ALL", value: ALL_ATTENDANCE_PERIOD }, ...monthOptions],
    [monthOptions],
  );

  const useChips = periodOptions.length <= CHIP_OPTION_LIMIT;
  const isAll = selectedPeriod === ALL_ATTENDANCE_PERIOD;

  const presentCount = filterDatesByPeriod(
    record.presentDates,
    selectedPeriod,
  ).length;
  const absentCount = filterDatesByPeriod(
    record.absentDates,
    selectedPeriod,
  ).length;

  const lastAttendanceLabel = useMemo(() => {
    if (isAll) {
      return record.lastDate ? formatDate(record.lastDate) : null;
    }

    const dates = [
      ...filterDatesByPeriod(record.presentDates, selectedPeriod),
      ...filterDatesByPeriod(record.absentDates, selectedPeriod),
    ];
    if (dates.length === 0) return null;
    const latest = dates.reduce((max, iso) => (iso > max ? iso : max));
    return formatDate(latest);
  }, [isAll, record.lastDate, record.presentDates, record.absentDates, selectedPeriod]);

  const joiningDateLabel = joiningDate ? formatDate(joiningDate) : "—";
  const selectedPeriodLabel =
    periodOptions.find((option) => option.value === selectedPeriod)?.label ??
    "ALL";

  return (
    <GlassCard spacing="default">
      <TouchableOpacity
        onPress={() => setExpanded((open) => !open)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Attendance, ${presentCount} present, ${absentCount} absent. ${expanded ? "Collapse" : "Expand"}`}
        style={s.headerToggle}
      >
        <View style={s.headerTextBlock}>
          <Text style={s.sectionHeading}>Attendance</Text>
          <Text style={s.subtitle}>Student attendance snapshot</Text>
          <View style={s.countRow}>
            <View style={[s.countPill, s.countPillSuccess]}>
              <Text style={s.countPillText}>Present {presentCount}</Text>
            </View>
            <View style={[s.countPill, s.countPillError]}>
              <Text style={s.countPillText}>Absent {absentCount}</Text>
            </View>
          </View>
        </View>
        <Icon
          name={expanded ? "expand-less" : "expand-more"}
          size={26}
          color={
            isDark ? "rgba(148, 163, 184, 0.9)" : "rgba(71, 85, 105, 0.9)"
          }
        />
      </TouchableOpacity>

      <View style={s.monthControlWrap}>
        <Text style={s.fieldLabel}>Period</Text>
        {useChips ? (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {periodOptions.map((option) => {
              const selected = option.value === selectedPeriod;
              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.82}
                  onPress={() => handleSelectPeriod(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Show attendance stats for ${option.label}`}
                  style={[s.chip, selected && s.chipActive]}
                >
                  <Text style={[s.chipText, selected && s.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={s.monthSelect}
            activeOpacity={0.85}
            onPress={() => setMonthPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Show attendance stats for ${selectedPeriodLabel}`}
          >
            <Text style={s.monthSelectText} numberOfLines={1}>
              {selectedPeriodLabel}
            </Text>
            <Icon
              name="keyboard-arrow-down"
              size={22}
              color={
                isDark
                  ? "rgba(148, 163, 184, 0.9)"
                  : "rgba(71, 85, 105, 0.95)"
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {expanded ? (
        <View style={s.body}>
          <View style={s.statDivider} />

          <StatInfoRow
            icon="event"
            label="Joining date"
            value={joiningDateLabel}
          />

          <StatInfoRow
            icon="calendar-month"
            label="Available months"
            value={monthOptions.length}
          />

          <StatInfoRow
            icon="check-circle"
            iconColor={colors.success}
            label="Present days"
            value={presentCount}
            variant="success"
          />

          <StatInfoRow
            icon="cancel"
            iconColor={colors.error}
            label="Absent days"
            value={absentCount}
            variant="error"
          />

          {lastAttendanceLabel ? (
            <StatInfoRow
              icon="update"
              label="Last attendance"
              value={lastAttendanceLabel}
            />
          ) : null}
        </View>
      ) : null}

      <MonthPickerModal
        visible={monthPickerOpen}
        onClose={() => setMonthPickerOpen(false)}
        months={periodOptions}
        selectedMonth={selectedPeriod}
        onSelectMonth={handleSelectPeriod}
        title="Filter attendance"
      />
    </GlassCard>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    headerToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
    },
    countRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
    countPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
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
      fontSize: 12,
      fontWeight: "800",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    monthControlWrap: {
      marginTop: 12,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 8,
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    chipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingRight: 4,
      paddingBottom: 2,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.55)"
        : "rgba(248, 250, 252, 0.95)",
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: isDark
        ? `${String(colors.primary)}22`
        : `${String(colors.primary)}18`,
    },
    chipText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.2,
      color: isDark ? "#CBD5E1" : "#475569",
    },
    chipTextActive: {
      color: colors.primary,
    },
    monthSelect: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
    },
    monthSelectText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    body: {
      marginTop: 4,
    },
    statDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.4)",
      marginVertical: 14,
    },
  });
}
