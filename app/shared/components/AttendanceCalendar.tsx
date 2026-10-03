import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import {
  getStudentAttendance,
  markStudentPresent,
  markStudentAbsent,
  clearStudentAttendance,
} from "../../services/attendance";
import {
  AttendanceCalendarProps,
  AttendanceResponse,
} from "../../types/attendance";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { toLocalYmd } from "../../utils/dateUtils";

type AttendanceStatus = "present" | "absent" | "unmarked";
type UpdatingAction = "present" | "absent" | "clear" | null;

type DayMark = {
  customStyles: {
    container: {
      backgroundColor: string;
      borderRadius: number;
      borderWidth: number;
      borderColor: string;
    };
    text: {
      color: string;
      fontWeight: "700";
    };
  };
};

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  studentId,
  classId,
  onMarked,
}) => {
  const today = moment().format("YYYY-MM-DD");
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [present, setPresent] = useState<string[]>([]);
  const [absent, setAbsent] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState<Record<string, DayMark>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState<UpdatingAction>(null);
  const { showError, showSuccess } = useToast();

  const updating = updatingAction !== null;

  const fetchAttendanceData = async () => {
    if (!studentId || !classId) {
      setError("Student ID and Class ID are required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await getStudentAttendance(
        studentId,
        classId,
      )) as AttendanceResponse;

      if (response.results && response.results.length > 0) {
        const attendanceData = response.results[0];

        setAttendanceId(attendanceData.id);

        const presentDates =
          attendanceData.presentDates?.map((date: string) => toLocalYmd(date)) ||
          [];

        const absentDates =
          attendanceData.absentDates?.map((date: string) => toLocalYmd(date)) ||
          [];

        setPresent(presentDates);
        setAbsent(absentDates);
      } else {
        setAttendanceId(null);
        setPresent([]);
        setAbsent([]);
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [studentId, classId]);

  useEffect(() => {
    const newMarks: Record<string, DayMark> = {};
    const selectedBorder = colors.primary;

    const markDay = (
      date: string,
      backgroundColor: string,
      textColor: string,
    ) => {
      newMarks[date] = {
        customStyles: {
          container: {
            backgroundColor,
            borderRadius: 10,
            borderWidth: date === selectedDate ? 2 : 0,
            borderColor: selectedBorder,
          },
          text: {
            color: textColor,
            fontWeight: "700",
          },
        },
      };
    };

    present.forEach((date) => {
      markDay(date, colors.success, "#FFFFFF");
    });

    absent.forEach((date) => {
      markDay(date, colors.error, "#FFFFFF");
    });

    if (!newMarks[selectedDate]) {
      markDay(
        selectedDate,
        isDark ? "rgba(255, 107, 53, 0.18)" : "rgba(255, 122, 46, 0.14)",
        colors.primary,
      );
    }

    setMarkedDates(newMarks);
  }, [present, absent, selectedDate, colors, isDark]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const selectedStatus: AttendanceStatus = present.includes(selectedDate)
    ? "present"
    : absent.includes(selectedDate)
      ? "absent"
      : "unmarked";

  const isSelectedMarked = selectedStatus !== "unmarked";
  const formattedSelectedDate = moment(selectedDate).format("D MMM YYYY");
  const selectedWeekday = moment(selectedDate).format("dddd");
  const isToday = selectedDate === today;

  const getErrorMessage = (err: unknown) =>
    (err as { message?: string })?.message || "Something went wrong";

  const markAttendance = async (status: "present" | "absent") => {
    if (!attendanceId) {
      showError("Attendance record not found. Please refresh the page.");
      return;
    }

    if (updating || selectedStatus === status) {
      return;
    }

    try {
      setUpdatingAction(status);

      const payload = {
        studentId,
        classId,
        date: selectedDate,
      };

      if (status === "present") {
        await markStudentPresent(attendanceId, payload);
      } else {
        await markStudentAbsent(attendanceId, payload);
      }

      const targetArray = status === "present" ? present : absent;
      const setTarget = status === "present" ? setPresent : setAbsent;
      const otherArray = status === "present" ? absent : present;
      const setOther = status === "present" ? setAbsent : setPresent;

      if (!targetArray.includes(selectedDate)) {
        if (otherArray.includes(selectedDate)) {
          setOther(otherArray.filter((d) => d !== selectedDate));
        }
        setTarget([...targetArray, selectedDate]);
      }

      showSuccess(`Marked as ${status} for ${formattedSelectedDate}`);
      onMarked?.(status);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setUpdatingAction(null);
    }
  };

  const clearAttendance = () => {
    if (!attendanceId) {
      showError("Attendance record not found. Please refresh the page.");
      return;
    }

    if (!isSelectedMarked || updating) {
      return;
    }

    Alert.alert(
      "Clear attendance",
      `Remove attendance mark for ${formattedSelectedDate}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdatingAction("clear");

              await clearStudentAttendance(attendanceId, {
                studentId,
                classId,
                date: selectedDate,
              });

              setPresent((prev) => prev.filter((d) => d !== selectedDate));
              setAbsent((prev) => prev.filter((d) => d !== selectedDate));
              showSuccess(`Cleared attendance for ${formattedSelectedDate}`);
            } catch (err: unknown) {
              showError(getErrorMessage(err));
            } finally {
              setUpdatingAction(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Loading attendance…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.container, s.centered]}>
        <Icon name="error-outline" size={36} color={colors.error} />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity
          style={s.retryButton}
          onPress={fetchAttendanceData}
          activeOpacity={0.85}
        >
          <Text style={s.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.calendarCard}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="custom"
          enableSwipeMonths
          style={s.calendar}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: isDark ? "#94A3B8" : "#64748B",
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.primaryText,
            todayTextColor: colors.primary,
            dayTextColor: isDark ? "#F8FAFC" : "#0f172a",
            textDisabledColor: isDark
              ? "rgba(148, 163, 184, 0.35)"
              : "rgba(100, 116, 139, 0.35)",
            arrowColor: colors.primary,
            monthTextColor: isDark ? "#F8FAFC" : "#0f172a",
            indicatorColor: colors.primary,
            textDayFontWeight: "600",
            textMonthFontWeight: "800",
            textDayHeaderFontWeight: "700",
            textDayFontSize: 15,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      <View style={s.legendRow}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.success }]} />
          <Text style={s.legendLabel}>Present</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: colors.error }]} />
          <Text style={s.legendLabel}>Absent</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, s.legendDotSelected]} />
          <Text style={s.legendLabel}>Selected</Text>
        </View>
      </View>

      <View style={s.statusCard}>
        <View style={s.statusTextBlock}>
          <View style={s.statusDateRow}>
            <Text style={s.statusWeekday}>{selectedWeekday}</Text>
            {isToday ? (
              <View style={s.todayBadge}>
                <Text style={s.todayBadgeText}>Today</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.statusDate}>{formattedSelectedDate}</Text>
        </View>
        <View
          style={[
            s.statusPill,
            selectedStatus === "present" && s.statusPillPresent,
            selectedStatus === "absent" && s.statusPillAbsent,
          ]}
        >
          <Icon
            name={
              selectedStatus === "present"
                ? "check-circle"
                : selectedStatus === "absent"
                  ? "cancel"
                  : "radio-button-unchecked"
            }
            size={14}
            color={
              selectedStatus === "present"
                ? colors.success
                : selectedStatus === "absent"
                  ? colors.error
                  : isDark
                    ? "#94A3B8"
                    : "#64748B"
            }
          />
          <Text
            style={[
              s.statusPillText,
              selectedStatus === "present" && s.statusPillTextPresent,
              selectedStatus === "absent" && s.statusPillTextAbsent,
            ]}
          >
            {selectedStatus === "present"
              ? "Present"
              : selectedStatus === "absent"
                ? "Absent"
                : "Not marked"}
          </Text>
        </View>
      </View>

      <View style={s.buttonContainer}>
        <TouchableOpacity
          style={[
            s.button,
            s.presentButton,
            selectedStatus === "present" && s.buttonSelected,
            (updating || selectedStatus === "present") && s.buttonDisabled,
          ]}
          onPress={() => markAttendance("present")}
          disabled={updating || selectedStatus === "present"}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Mark ${formattedSelectedDate} as present`}
        >
          {updatingAction === "present" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="check-circle" size={18} color="#FFFFFF" />
          )}
          <Text style={s.buttonText}>
            {updatingAction === "present" ? "Saving…" : "Mark as Present"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.button,
            s.absentButton,
            selectedStatus === "absent" && s.buttonSelected,
            (updating || selectedStatus === "absent") && s.buttonDisabled,
          ]}
          onPress={() => markAttendance("absent")}
          disabled={updating || selectedStatus === "absent"}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Mark ${formattedSelectedDate} as absent`}
        >
          {updatingAction === "absent" ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="cancel" size={18} color="#FFFFFF" />
          )}
          <Text style={s.buttonText}>
            {updatingAction === "absent" ? "Saving…" : "Mark as Absent"}
          </Text>
        </TouchableOpacity>
      </View>

      {isSelectedMarked ? (
        <TouchableOpacity
          style={[s.clearButton, updating && s.buttonDisabled]}
          onPress={clearAttendance}
          disabled={updating}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Undo attendance for ${formattedSelectedDate}`}
        >
          {updatingAction === "clear" ? (
            <ActivityIndicator size="small" color={colors.warning} />
          ) : (
            <Icon name="undo" size={18} color={colors.warning} />
          )}
          <Text style={s.clearButtonText}>
            {updatingAction === "clear" ? "Clearing…" : "Undo marking"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default AttendanceCalendar;

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
    centered: {
      minHeight: 280,
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    calendarCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.92)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
      paddingBottom: 6,
    },
    calendar: {
      borderRadius: 16,
    },
    legendRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendDotSelected: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    legendLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    statusCard: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.22)",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.95)",
    },
    statusTextBlock: {
      flex: 1,
      minWidth: 0,
      marginRight: 10,
    },
    statusDateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusWeekday: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.3,
      color: isDark ? "#94A3B8" : "#64748B",
      textTransform: "uppercase",
    },
    todayBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.16)"
        : "rgba(255, 122, 46, 0.12)",
    },
    todayBadgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.primary,
    },
    statusDate: {
      marginTop: 4,
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
    },
    statusPillPresent: {
      backgroundColor: isDark
        ? "rgba(76, 175, 80, 0.16)"
        : "rgba(76, 175, 80, 0.12)",
    },
    statusPillAbsent: {
      backgroundColor: isDark
        ? "rgba(244, 67, 54, 0.16)"
        : "rgba(244, 67, 54, 0.12)",
    },
    statusPillText: {
      fontSize: 12,
      fontWeight: "700",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    statusPillTextPresent: {
      color: colors.success,
    },
    statusPillTextAbsent: {
      color: colors.error,
    },
    buttonContainer: {
      marginTop: 14,
      gap: 10,
    },
    button: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 14,
    },
    presentButton: {
      backgroundColor: colors.success,
    },
    absentButton: {
      backgroundColor: colors.error,
    },
    buttonSelected: {
      opacity: 0.55,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 15,
    },
    clearButton: {
      marginTop: 12,
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 152, 0, 0.45)"
        : "rgba(255, 152, 0, 0.55)",
      backgroundColor: isDark
        ? "rgba(255, 152, 0, 0.08)"
        : "rgba(255, 152, 0, 0.06)",
    },
    clearButtonText: {
      color: colors.warning,
      fontWeight: "700",
      fontSize: 14,
    },
    loadingText: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    errorText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.error,
      textAlign: "center",
      paddingHorizontal: 12,
    },
    retryButton: {
      marginTop: 4,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    retryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
      fontSize: 14,
    },
  });
}
