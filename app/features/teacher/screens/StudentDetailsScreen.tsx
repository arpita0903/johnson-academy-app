import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useTeacherContext } from "../../../context/TeacherContext";
import { getStudentAttendance } from "../../../services/attendance";
import {
  generateFilteredMonths,
  MonthOption,
  convertMonthFormat,
} from "../../../utils/dateUtils";
import { AttendanceResponse } from "../../../types/attendance";
import { submitMRT } from "../../../services/mrt";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import { ScreenHeroCard } from "../../../shared/components/ScreenHeroCard";
import { GlassCard } from "../../../shared/components/GlassCard";
import { StudentAttendanceSection } from "../../../shared/components/StudentAttendanceSection";
import { MRTMonthSection } from "../../../shared/components/MRTMonthSection";
import { MonthPickerModal } from "../../../shared/components/MonthPickerModal";
import {
  MRTEvaluationForm,
  MRTFormData,
  EMPTY_MRT_FORM,
  MRT_SCORE_FIELDS,
  handleMRTFieldChange,
} from "../../../shared/components/MRTEvaluationForm";
import { usePromoteStudentFlow } from "../../../shared/hooks/usePromoteStudentFlow";
import {
  PromoteStudentCard,
  PromoteStudentOverlays,
} from "../../../shared/components/PromoteStudentSection";

const StudentDetailsScreen = () => {
  const { selectedStudent, selectedClass } = useTeacherContext();
  const route = useRoute();
  const routeCourse = (
    route.params as { course?: { id?: string; name?: string } } | undefined
  )?.course;
  const courseId = routeCourse?.id ?? null;
  const courseName = routeCourse?.name ?? "";
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<AttendanceResponse | null>(null);
  const [filteredMonths, setFilteredMonths] = useState<MonthOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [formData, setFormData] = useState<MRTFormData>(EMPTY_MRT_FORM);

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

  const handleChange = (key: keyof MRTFormData, value: string) => {
    handleMRTFieldChange(key, value, setFormData);
  };

  const handleSubmit = async () => {
    if (!selectedMonth || !selectedStudent || !selectedClass || !courseId) {
      console.warn("Missing required data for MRT submission");
      if (!courseId) {
        alert(
          "Course information is missing. Please open this screen from a course.",
        );
      }
      return;
    }

    const missingFields = MRT_SCORE_FIELDS.filter((field) => {
      const value = formData[field];
      return !value || value.trim() === "";
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!formData.remarks || formData.remarks.trim() === "") {
      alert("Please fill in the Remarks field");
      return;
    }

    const invalidScores = MRT_SCORE_FIELDS.filter((field) => {
      const score = parseInt(formData[field], 10);
      return Number.isNaN(score) || score < 2 || score > 5;
    });

    if (invalidScores.length > 0) {
      alert("All scores must be between 2 and 5 (valid range: 2-5)");
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
        courseId,
        regularity: parseInt(formData["Regularity (5M)"], 10),
        learningSpeed: parseInt(formData["Learning Speed (5M)"], 10),
        theory: parseInt(formData["Theory (5M)"], 10),
        technicalExercises: parseInt(formData["Technical Exercises (5M)"], 10),
        repertoireRhythmSense: parseInt(
          formData["Repertoire (Rhythm Sense) (5M)"],
          10,
        ),
        repertoireDynamics: parseInt(
          formData["Repertoire (Dynamics) (5M)"],
          10,
        ),
        remarks: formData.remarks || "",
      };

      await submitMRT(mrtData);
      setFormData(EMPTY_MRT_FORM);
      alert("MRT submitted successfully!");
    } catch (error) {
      console.error("Error submitting MRT:", error);
      const message = (error as Error).message;
      alert(message);
    }
  };

  const studentName =
    selectedStudent?.name ??
    (selectedStudent as { user?: { name?: string } })?.user?.name ??
    "Student";
  const rollNumber =
    (selectedStudent as { rollNumber?: string })?.rollNumber ??
    (selectedStudent as { user?: { rollNumber?: string } })?.user?.rollNumber ??
    "";
  const profilePic =
    (selectedStudent as { profilePicture?: string })?.profilePicture ??
    (selectedStudent as { user?: { profilePicture?: string } })?.user
      ?.profilePicture;
  const classLabel =
    (selectedClass as { name?: string })?.name ??
    (selectedClass as { title?: string })?.title ??
    "";
  const classId =
    (selectedClass as { id?: string })?.id ??
    (selectedClass as { _id?: string })?._id ??
    null;
  const studentId = selectedStudent?.id ?? null;

  const promoteFlow = usePromoteStudentFlow({
    studentId,
    classId,
    studentName,
    courseId,
    courseName,
  });

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
            <ScreenHeroCard
              title={studentName}
              subtitle={rollNumber ? `Roll ${rollNumber}` : "Student details"}
              imageUri={profilePic}
              accentLine={classLabel.length > 0 ? classLabel : undefined}
            />

            {loading && !attendanceData ? (
              <GlassCard style={s.loaderCard}>
                <View style={s.loaderRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={s.bodyMuted}>Loading attendance…</Text>
                </View>
              </GlassCard>
            ) : null}

            {attendanceData ? (
              <StudentAttendanceSection
                attendanceData={attendanceData}
                filteredMonthsCount={filteredMonths.length}
                fallbackJoiningDate={selectedStudent.date_of_joining}
              />
            ) : null}

            <PromoteStudentCard flow={promoteFlow} />

            <MRTMonthSection
              loading={loading}
              filteredMonths={filteredMonths}
              selectedMonthLabel={selectedMonthLabel}
              onOpenPicker={() => setMonthPickerOpen(true)}
            />

            {selectedMonth ? (
              <MRTEvaluationForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        <PromoteStudentOverlays flow={promoteFlow} />

        <MonthPickerModal
          visible={monthPickerOpen}
          onClose={() => setMonthPickerOpen(false)}
          months={filteredMonths}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
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
    loaderCard: {
      marginBottom: 14,
    },
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
    },
  });
