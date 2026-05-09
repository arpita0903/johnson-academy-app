import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTeacherContext } from "../../../context/TeacherContext";
import { getStudentAttendance } from "../../../services/attendance";
import {
  generateFilteredMonths,
  MonthOption,
  formatDate,
  convertMonthFormat,
} from "../../../utils/dateUtils";
import { AttendanceResponse } from "../../../types/attendance";
import { submitMRT } from "../../../services/mrt";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors, loginButtonGradientColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";

const StudentDetailsScreen = () => {
  const { selectedStudent, selectedClass } = useTeacherContext();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<AttendanceResponse | null>(null);
  const [filteredMonths, setFilteredMonths] = useState<MonthOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    "SPT & File Submission": "",
    Regularity: "",
    "Learning Speed": "",
    "Song Learning": "",
    Assignment: "",
    "Theory and Technicals": "",
    remarks: "",
  });

  useEffect(() => {
    const fetchAttendanceAndGenerateMonths = async () => {
      if (!selectedStudent?.id || !selectedClass?.id) return;

      setLoading(true);
      try {
        const attendance = await getStudentAttendance(
          selectedStudent.id,
          selectedClass.id,
        );

        setAttendanceData(attendance as AttendanceResponse);

        const attendancePayload = attendance as AttendanceResponse;
        if (
          attendancePayload?.results &&
          attendancePayload.results.length > 0 &&
          attendancePayload.results[0]?.joiningDate
        ) {
          const joiningDate = attendancePayload.results[0].joiningDate;
          const parsedJoiningDate = new Date(joiningDate);
          const currentDate = new Date();
          if (parsedJoiningDate > currentDate) {
            console.warn(
              "Joining date is in the future, using current date as fallback",
            );
            const months = generateFilteredMonths(currentDate);
            setFilteredMonths(months);
            if (months.length > 0) {
              setSelectedMonth(months[0].value);
            }
          } else {
            const months = generateFilteredMonths(parsedJoiningDate);
            setFilteredMonths(months);
            if (months.length > 0) {
              setSelectedMonth(months[0].value);
            }
          }
        } else {
          console.warn(
            "No joining date found in attendance data, using student's date_of_joining as fallback",
          );
          const joiningDate = selectedStudent.date_of_joining;
          if (joiningDate) {
            const months = generateFilteredMonths(joiningDate);
            setFilteredMonths(months);
            if (months.length > 0) {
              setSelectedMonth(months[0].value);
            }
          } else {
            setFilteredMonths([]);
          }
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setFilteredMonths([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceAndGenerateMonths();
  }, [
    selectedStudent?.id,
    selectedClass?.id,
    selectedStudent?.date_of_joining,
  ]);

  const handleChange = (key: string, value: string) => {
    if (key !== "remarks") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [key]: value }));
        return;
      }
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue === "") {
        setFormData((prev) => ({ ...prev, [key]: "" }));
        return;
      }
      const num = parseInt(numericValue, 10);
      if (num > 5) {
        return;
      }
      setFormData((prev) => ({ ...prev, [key]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedMonth || !selectedStudent || !selectedClass) {
      console.warn("Missing required data for MRT submission");
      return;
    }

    const requiredFields = [
      "SPT & File Submission",
      "Regularity",
      "Learning Speed",
      "Song Learning",
      "Assignment",
      "Theory and Technicals",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || value.trim() === "" || parseInt(value, 10) === 0;
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!formData.remarks || formData.remarks.trim() === "") {
      alert("Please fill in the Remarks field");
      return;
    }

    const invalidScores = requiredFields.filter((field) => {
      const score = parseInt(formData[field], 10);
      return score <= 2 || score > 5;
    });

    if (invalidScores.length > 0) {
      alert("All scores must be more than 2 and maximum 5 (valid range: 3-5)");
      return;
    }

    try {
      const formattedMonth = convertMonthFormat(selectedMonth);
      if (formattedMonth.includes("NaN")) {
        throw new Error("Invalid month format. Please select a valid month.");
      }

      const mrtData = {
        month: formattedMonth,
        classId: selectedClass.id,
        studentId: selectedStudent.id,
        sptAndFileSubmission:
          parseInt(formData["SPT & File Submission"], 10) || 0,
        regularity: parseInt(formData.Regularity, 10) || 0,
        learningSpeed: parseInt(formData["Learning Speed"], 10) || 0,
        songLearning: parseInt(formData["Song Learning"], 10) || 0,
        assignment: parseInt(formData.Assignment, 10) || 0,
        theoryAndTechnicals:
          parseInt(formData["Theory and Technicals"], 10) || 0,
        remarks: formData.remarks || "",
      };

      await submitMRT(mrtData);

      setFormData({
        "SPT & File Submission": "",
        Regularity: "",
        "Learning Speed": "",
        "Song Learning": "",
        Assignment: "",
        "Theory and Technicals": "",
        remarks: "",
      });

      alert("MRT submitted successfully!");
    } catch (error: unknown) {
      console.error("Error submitting MRT:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit MRT.";
      alert(message);
    }
  };

  const studentName =
    selectedStudent?.name ?? (selectedStudent as { user?: { name?: string } })?.user?.name ?? "Student";
  const rollNumber =
    (selectedStudent as { rollNumber?: string })?.rollNumber ??
    (selectedStudent as { user?: { rollNumber?: string } })?.user?.rollNumber ??
    "";
  const profilePic =
    (selectedStudent as { profilePicture?: string })?.profilePicture ??
    (selectedStudent as { user?: { profilePicture?: string } })?.user?.profilePicture;
  const classLabel =
    (selectedClass as { name?: string })?.name ??
    (selectedClass as { title?: string })?.title ??
    "";

  const selectedMonthLabel =
    selectedMonth &&
    filteredMonths.find((m) => m.value === selectedMonth)?.label;

  if (!selectedStudent) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={s.safeArea} edges={["top"]}>
          <ScreenGradientBackground isDark={isDark} />
          <View style={s.centeredFallback}>
            <Icon name="person-off" size={48} color={colors.error} />
            <Text style={s.errorFallbackText}>No student selected</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const firstResult = attendanceData?.results?.[0];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.heroOuter}>
              <LinearGradient
                colors={
                  !isDark
                    ? ["rgba(94, 234, 212, 0.14)", "rgba(167, 139, 250, 0.16)"]
                    : ["rgba(45, 212, 191, 0.14)", "rgba(167, 139, 250, 0.12)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.heroGradientFill}
              >
                <View style={s.heroInner}>
                  <View style={s.heroTopRow}>
                    <View style={s.heroAvatarWell}>
                      {profilePic ? (
                        <Image
                          source={{ uri: profilePic }}
                          style={s.heroAvatar}
                          accessibilityLabel={`Photo of ${studentName}`}
                        />
                      ) : (
                        <View style={s.heroIconWell}>
                          <Icon
                            name="person"
                            size={28}
                            color={
                              isDark
                                ? "rgba(167, 139, 250, 0.95)"
                                : "rgba(109, 40, 217, 0.85)"
                            }
                          />
                        </View>
                      )}
                    </View>
                    <View style={s.heroTextBlock}>
                      <Text style={s.heroTitle} numberOfLines={2}>
                        {studentName}
                      </Text>
                      <View style={s.heroSubRow}>
                        <Icon
                          name="badge"
                          size={16}
                          color={
                            isDark
                              ? "rgba(148, 163, 184, 0.95)"
                              : "rgba(71, 85, 105, 0.9)"
                          }
                          style={s.heroSubIcon}
                        />
                        <Text style={s.heroSubtitle} numberOfLines={1}>
                          {rollNumber ? `Roll ${rollNumber}` : "Student details"}
                        </Text>
                      </View>
                      {classLabel.length > 0 ? (
                        <Text style={s.heroCourseLine} numberOfLines={2}>
                          {classLabel}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {loading && !attendanceData ? (
              <View style={[s.glassSection, s.sectionSpacing, s.loaderRow]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={s.bodyMuted}>Loading attendance…</Text>
              </View>
            ) : null}

            {attendanceData ? (
              <View style={[s.glassSection, s.sectionSpacing]}>
                <Text style={[s.sectionHeading, s.sectionHeadingStandalone]}>
                  Attendance
                </Text>
                <Text style={s.bodyMuted}>Student attendance snapshot</Text>

                <View style={s.statDivider} />

                <View style={s.dateRow}>
                  <Icon name="event" size={20} color={colors.primary} />
                  <Text style={s.statLabel}>Joining date</Text>
                  <View style={s.dateBadge}>
                    <Text style={s.dateBadgeText}>
                      {firstResult?.joiningDate
                        ? formatDate(firstResult.joiningDate)
                        : selectedStudent.date_of_joining
                          ? formatDate(selectedStudent.date_of_joining)
                          : "—"}
                    </Text>
                  </View>
                </View>

                <View style={s.dateRow}>
                  <Icon
                    name="calendar-month"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={s.statLabel}>Available months</Text>
                  <View style={s.dateBadge}>
                    <Text style={s.dateBadgeText}>
                      {filteredMonths.length}
                    </Text>
                  </View>
                </View>

                {firstResult?.presentDates ? (
                  <View style={s.dateRow}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={s.statLabel}>Present days</Text>
                    <View style={[s.countPill, s.countPillSuccess]}>
                      <Text style={s.countPillText}>
                        {firstResult.presentDates.length}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {firstResult?.absentDates ? (
                  <View style={s.dateRow}>
                    <Icon name="cancel" size={20} color={colors.error} />
                    <Text style={s.statLabel}>Absent days</Text>
                    <View style={[s.countPill, s.countPillError]}>
                      <Text style={s.countPillText}>
                        {firstResult.absentDates.length}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {firstResult?.lastDate ? (
                  <View style={s.dateRow}>
                    <Icon name="update" size={20} color={colors.primary} />
                    <Text style={s.statLabel}>Last attendance</Text>
                    <View style={s.dateBadge}>
                      <Text style={s.dateBadgeText}>
                        {formatDate(firstResult.lastDate)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={[s.glassSection, s.sectionSpacing]}>
              <Text style={[s.sectionHeading, s.sectionHeadingStandalone]}>
                Monthly review (MRT)
              </Text>
              <Text style={s.bodyMuted}>
                Select a month, then submit scores (3–5) and remarks.
              </Text>

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
                    onPress={() => setMonthPickerOpen(true)}
                  >
                    <Text
                      style={s.monthPickerTriggerText}
                      numberOfLines={1}
                    >
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
            </View>

            {selectedMonth ? (
              <View style={[s.glassSection, s.sectionSpacingBottom]}>
                <Text style={[s.sectionHeading, s.sectionHeadingStandalone]}>
                  Evaluation form
                </Text>

                {(
                  [
                    "SPT & File Submission",
                    "Regularity",
                    "Learning Speed",
                    "Theory and Technicals",
                    "Song Learning",
                    "Assignment",
                    "remarks",
                  ] as const
                ).map((field) => (
                  <View key={field} style={s.inputGroup}>
                    <Text style={s.fieldLabel}>
                      {field === "remarks" ? "Remarks *" : `${field} *`}
                    </Text>
                    <TextInput
                      style={
                        field === "remarks"
                          ? [s.input, s.inputMultiline]
                          : s.input
                      }
                      value={formData[field]}
                      onChangeText={(text) => handleChange(field, text)}
                      placeholder={
                        field === "remarks" ? "Enter remarks" : "Range: 3–5"
                      }
                      placeholderTextColor={
                        isDark ? "rgba(148, 163, 184, 0.5)" : colors.placeholderText
                      }
                      keyboardType={
                        field === "remarks" ? "default" : "number-pad"
                      }
                      multiline={field === "remarks"}
                      numberOfLines={field === "remarks" ? 4 : 1}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSubmit}
                  style={s.submitShell}
                >
                  <LinearGradient
                    colors={[...loginButtonGradientColors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={s.submitGradient}
                  >
                    <Icon name="send" size={20} color="#FFFFFF" />
                    <Text style={s.submitGradientText}>Submit MRT</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          visible={monthPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMonthPickerOpen(false)}
        >
          <Pressable
            style={s.modalBackdrop}
            onPress={() => setMonthPickerOpen(false)}
          >
            <Pressable style={s.monthModalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={s.monthModalTitle}>Select month</Text>
              <ScrollView
                style={s.monthModalList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {filteredMonths.map((month) => {
                  const selected = month.value === selectedMonth;
                  return (
                    <TouchableOpacity
                      key={month.value}
                      style={[s.monthRow, selected && s.monthRowSelected]}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedMonth(month.value);
                        setMonthPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          s.monthRowText,
                          selected && s.monthRowTextSelected,
                        ]}
                      >
                        {month.label}
                      </Text>
                      {selected ? (
                        <Icon name="check" size={22} color={colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default StudentDetailsScreen;

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
      paddingTop: 8,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 32,
    },
    centeredFallback: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      gap: 12,
    },
    errorFallbackText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.error,
      textAlign: "center",
    },
    heroOuter: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.18)"
        : "rgba(167, 139, 250, 0.22)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.85)"
        : "rgba(255, 255, 255, 0.88)",
    },
    heroGradientFill: {
      borderRadius: 19,
    },
    heroInner: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    heroAvatarWell: {
      marginRight: 14,
    },
    heroAvatar: {
      width: 56,
      height: 56,
      borderRadius: 16,
    },
    heroIconWell: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.08)"
        : "rgba(45, 212, 191, 0.08)",
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    heroSubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    heroSubIcon: {
      marginRight: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    heroCourseLine: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: -0.15,
      color: isDark
        ? "rgba(167, 139, 250, 0.95)"
        : "rgba(109, 40, 217, 0.82)",
    },
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
    statDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.4)",
      marginVertical: 14,
    },
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
      backgroundColor: isDark ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.18)",
    },
    countPillError: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.22)" : "rgba(239, 68, 68, 0.14)",
    },
    countPillText: {
      fontSize: 14,
      fontWeight: "900",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
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
      borderColor: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(148, 163, 184, 0.45)",
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
    inputGroup: {
      marginBottom: 14,
    },
    input: {
      borderWidth: 1.5,
      borderColor: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(148, 163, 184, 0.45)",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: "600",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.55)"
        : "rgba(248, 250, 252, 0.98)",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: "top",
      paddingTop: 12,
    },
    submitShell: {
      marginTop: 8,
      borderRadius: 14,
      overflow: "hidden",
    },
    submitGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    submitGradientText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    monthModalCard: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingTop: 18,
      paddingBottom: Platform.OS === "ios" ? 28 : 20,
      paddingHorizontal: 20,
      maxHeight: "55%",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.28)"
        : "rgba(167, 139, 250, 0.22)",
    },
    monthModalTitle: {
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.35,
      marginBottom: 12,
      textAlign: "center",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    monthModalList: {
      flexGrow: 0,
    },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? "rgba(148, 163, 184, 0.25)"
        : "rgba(148, 163, 184, 0.35)",
    },
    monthRowSelected: {
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.12)"
        : "rgba(255, 122, 46, 0.1)",
    },
    monthRowText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    monthRowTextSelected: {
      fontWeight: "800",
      color: colors.primary,
    },
  });
