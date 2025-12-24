import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Card, Divider, List, Avatar, Badge } from "react-native-paper";

import { Menu, Button } from "react-native-paper";
import { TextInput } from "react-native";
import { useTeacherContext } from "../context/TeacherContext";
import { getStudentAttendance } from "../services/attendance";
import {
  generateFilteredMonths,
  MonthOption,
  formatDate,
  convertMonthFormat,
} from "../utils/dateUtils";
import { AttendanceResponse } from "../types/attendance";
import { submitMRT } from "../services/mrt";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";

const StudentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedStudent, selectedClass } = useTeacherContext();
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<AttendanceResponse | null>(null);
  const [filteredMonths, setFilteredMonths] = useState<MonthOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    "SPT & File Submission": "",
    Regularity: "",
    "Learning Speed": "",
    "Song Learning": "",
    Assignment: "",
    "Theory and Technicals": "",
    remarks: "",
  });

  // Fetch student attendance and generate filtered months
  useEffect(() => {
    const fetchAttendanceAndGenerateMonths = async () => {
      if (!selectedStudent?.id || !selectedClass?.id) return;

      setLoading(true);
      try {
        const attendance = await getStudentAttendance(
          selectedStudent.id,
          selectedClass.id
        );

        setAttendanceData(attendance as AttendanceResponse);

        // Generate filtered months based on joining date
        // Check if we have results and the first result has joiningDate
        const attendanceData = attendance as AttendanceResponse;
        if (
          attendanceData?.results &&
          attendanceData.results.length > 0 &&
          attendanceData.results[0]?.joiningDate
        ) {
          const joiningDate = attendanceData.results[0].joiningDate;

          // Parse the date properly
          const parsedJoiningDate = new Date(joiningDate);

          // Check if joining date is in the future
          const currentDate = new Date();
          if (parsedJoiningDate > currentDate) {
            console.warn(
              "Joining date is in the future, using current date as fallback"
            );
            const months = generateFilteredMonths(currentDate);
            setFilteredMonths(months);
            if (months.length > 0) {
              setSelectedMonth(months[0].value);
            }
          } else {
            const months = generateFilteredMonths(parsedJoiningDate);

            setFilteredMonths(months);

            // Set first available month as default if months exist
            if (months.length > 0) {
              setSelectedMonth(months[0].value);
            }
          }
        } else {
          console.warn(
            "No joining date found in attendance data, using student's date_of_joining as fallback"
          );
          // Fallback to student's date_of_joining if attendance data doesn't have joiningDate
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
        // Fallback to current year months if API fails
        const currentYear = new Date().getFullYear();

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
    // For numeric fields (excluding remarks), validate input in real-time
    if (key !== "remarks") {
      // Allow empty string for clearing
      if (value === "") {
        setFormData((prev) => ({ ...prev, [key]: value }));
        return;
      }

      // Only allow numeric input
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue === "") {
        setFormData((prev) => ({ ...prev, [key]: "" }));
        return;
      }

      const num = parseInt(numericValue);
      // Enforce max value of 5
      if (num > 5) {
        return; // Don't update if value exceeds 5
      }

      setFormData((prev) => ({ ...prev, [key]: numericValue }));
    } else {
      // For remarks, allow any text
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedMonth || !selectedStudent || !selectedClass) {
      console.warn("Missing required data for MRT submission");
      return;
    }

    // Validate all required fields
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
      return !value || value.trim() === "" || parseInt(value) === 0;
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate remarks field (mandatory)
    if (!formData.remarks || formData.remarks.trim() === "") {
      alert("Please fill in the Remarks field");
      return;
    }

    // Validate score ranges (> 2 and max 5, so 3-5)
    const invalidScores = requiredFields.filter((field) => {
      const score = parseInt(formData[field]);
      return score <= 2 || score > 5;
    });

    if (invalidScores.length > 0) {
      alert("All scores must be more than 2 and maximum 5 (valid range: 3-5)");
      return;
    }

    try {
      // Convert month format from "Jan-2025" to "MM-YYYY"
      const formattedMonth = convertMonthFormat(selectedMonth);

      // Validate the formatted month
      if (formattedMonth.includes("NaN")) {
        throw new Error("Invalid month format. Please select a valid month.");
      }

      const mrtData = {
        month: formattedMonth,
        classId: selectedClass.id,
        studentId: selectedStudent.id,
        sptAndFileSubmission: parseInt(formData["SPT & File Submission"]) || 0,
        regularity: parseInt(formData.Regularity) || 0,
        learningSpeed: parseInt(formData["Learning Speed"]) || 0,
        songLearning: parseInt(formData["Song Learning"]) || 0,
        assignment: parseInt(formData.Assignment) || 0,
        theoryAndTechnicals: parseInt(formData["Theory and Technicals"]) || 0,
        remarks: formData.remarks || "",
      };

      const response = await submitMRT(mrtData);

      // Clear form after successful submission
      setFormData({
        "SPT & File Submission": "",
        Regularity: "",
        "Learning Speed": "",
        "Song Learning": "",
        Assignment: "",
        "Theory and Technicals": "",
        remarks: "",
      });

      // Show success message (you can add a toast or alert here)
      alert("MRT submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting MRT:", error);
      alert(error.message || "Failed to submit MRT. Please try again.");
    }
  };

  if (!selectedStudent) {
    return (
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.errorText}>No Data Available...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {attendanceData && (
          <Card style={dynamicStyles.attendanceCard}>
            <Card.Content>
              <View style={dynamicStyles.attendanceHeader}>
                <Avatar.Icon
                  size={40}
                  icon="calendar-check"
                  style={dynamicStyles.attendanceIcon}
                />
                <View style={dynamicStyles.attendanceTitleContainer}>
                  <Text style={dynamicStyles.attendanceTitle}>
                    Attendance Information
                  </Text>
                  <Text style={dynamicStyles.attendanceSubtitle}>
                    Student performance tracking
                  </Text>
                </View>
              </View>

              <Divider style={dynamicStyles.divider} />

              <View style={dynamicStyles.attendanceStats}>
                <View style={dynamicStyles.statRow}>
                  <List.Icon icon="calendar" color={colors.textSecondary} />
                  <View style={dynamicStyles.statContent}>
                    <Text style={dynamicStyles.statLabel}>Joining Date</Text>
                    <Text style={dynamicStyles.statValue}>
                      {attendanceData.results?.[0]?.joiningDate
                        ? formatDate(attendanceData.results[0].joiningDate)
                        : selectedStudent.date_of_joining || "Not available"}
                    </Text>
                  </View>
                </View>

                <View style={dynamicStyles.statRow}>
                  <List.Icon
                    icon="calendar-month"
                    color={colors.textSecondary}
                  />
                  <View style={dynamicStyles.statContent}>
                    <Text style={dynamicStyles.statLabel}>
                      Available Months
                    </Text>
                    <View style={dynamicStyles.monthDisplayContainer}>
                      <Text style={dynamicStyles.monthCountText}>
                        {filteredMonths.length}
                      </Text>
                      <Text style={dynamicStyles.monthLabelText}>
                        {filteredMonths.length === 1 ? "month" : "months"}
                      </Text>
                    </View>
                  </View>
                </View>

                {attendanceData.results?.[0]?.presentDates && (
                  <View style={dynamicStyles.statRow}>
                    <List.Icon icon="check-circle" color={colors.success} />
                    <View style={dynamicStyles.statContent}>
                      <Text style={dynamicStyles.statLabel}>Present Days</Text>
                      <Badge size={24} style={dynamicStyles.presentBadge}>
                        {attendanceData.results[0].presentDates.length}
                      </Badge>
                    </View>
                  </View>
                )}

                {attendanceData.results?.[0]?.absentDates && (
                  <View style={dynamicStyles.statRow}>
                    <List.Icon icon="cancel" color={colors.error} />
                    <View style={dynamicStyles.statContent}>
                      <Text style={dynamicStyles.statLabel}>Absent Days</Text>
                      <Badge size={24} style={dynamicStyles.absentBadge}>
                        {attendanceData.results[0].absentDates.length}
                      </Badge>
                    </View>
                  </View>
                )}

                {attendanceData.results?.[0]?.lastDate && (
                  <View style={dynamicStyles.statRow}>
                    <List.Icon icon="update" color={colors.primary} />
                    <View style={dynamicStyles.statContent}>
                      <Text style={dynamicStyles.statLabel}>
                        Last Attendance
                      </Text>
                      <Text style={dynamicStyles.statValue}>
                        {formatDate(attendanceData.results[0].lastDate)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={dynamicStyles.mrtSection}>
          <Card style={dynamicStyles.mrtCard}>
            <Card.Content>
              <View style={dynamicStyles.mrtHeader}>
                <Avatar.Icon
                  size={40}
                  icon="clipboard-check"
                  style={dynamicStyles.mrtIcon}
                />
                <View style={dynamicStyles.mrtTitleContainer}>
                  <Text style={dynamicStyles.mrtHeading}>
                    Monthly Review Test (30 Marks)
                  </Text>
                  <Text style={dynamicStyles.mrtSubtitle}>
                    Evaluate student performance for selected month
                  </Text>
                </View>
              </View>

              {loading ? (
                <View style={dynamicStyles.loadingContainer}>
                  <Text style={dynamicStyles.loadingText}>
                    Loading months...
                  </Text>
                </View>
              ) : (
                <>
                  {filteredMonths.length > 0 ? (
                    <View style={dynamicStyles.dropdownContainer}>
                      <Text style={dynamicStyles.dropdownLabel}>
                        Select Month
                      </Text>
                      <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                          <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            style={dynamicStyles.dropdown}
                            contentStyle={{ justifyContent: "flex-start" }}
                            textColor={colors.text}
                            buttonColor="transparent"
                          >
                            {selectedMonth
                              ? filteredMonths.find(
                                  (m) => m.value === selectedMonth
                                )?.label || "Choose a month"
                              : "Choose a month"}
                          </Button>
                        }
                      >
                        {filteredMonths.map((month) => (
                          <Menu.Item
                            key={month.value}
                            onPress={() => {
                              setSelectedMonth(month.value);
                              setMenuVisible(false);
                            }}
                            title={month.label}
                          />
                        ))}
                      </Menu>
                    </View>
                  ) : (
                    <View style={dynamicStyles.noMonthsContainer}>
                      <Text style={dynamicStyles.noMonthsText}>
                        No months available for this student
                      </Text>
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </View>

        {selectedMonth && (
          <Card style={dynamicStyles.formCard}>
            <Card.Content>
              <View style={dynamicStyles.formHeader}>
                <Avatar.Icon
                  size={32}
                  icon="form-select"
                  style={dynamicStyles.formIcon}
                />
                <Text style={dynamicStyles.formTitle}>MRT Evaluation Form</Text>
              </View>

              <Divider style={dynamicStyles.formDivider} />

              <View style={dynamicStyles.formContainer}>
                {[
                  "SPT & File Submission",
                  "Regularity",
                  "Learning Speed",
                  "Theory and Technicals",
                  "Song Learning",
                  "Assignment",
                  "remarks",
                ].map((field, idx) => (
                  <View key={field} style={dynamicStyles.inputGroup}>
                    <Text style={dynamicStyles.inputLabel}>
                      {field === "remarks" ? "Remarks *" : `${field} *`}
                    </Text>
                    <TextInput
                      style={dynamicStyles.input}
                      value={formData[field]}
                      onChangeText={(text) => handleChange(field, text)}
                      placeholder={
                        field === "remarks" ? "Enter remarks" : `Range: 3-5`
                      }
                      placeholderTextColor={colors.placeholderText}
                      keyboardType={field === "remarks" ? "default" : "numeric"}
                      multiline={field === "remarks"}
                      numberOfLines={field === "remarks" ? 3 : 1}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={dynamicStyles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={dynamicStyles.submitButtonText}>Submit MRT</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentDetailsScreen;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    backText: {
      fontSize: 16,
      marginLeft: 6,
      color: colors.text,
    },
    detailsBox: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    sheetTitle: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
      color: colors.text,
    },
    detailText: {
      fontSize: 16,
      marginBottom: 10,
      color: colors.textSecondary,
    },
    boldLabel: {
      fontWeight: "bold",
    },
    mrtButton: {
      marginTop: 20,
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    mrtButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "bold",
    },
    mrtSection: {
      marginTop: 30,
      marginBottom: 10,
    },
    mrtHeading: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    dropdown: {
      fontSize: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      color: colors.text,
      backgroundColor: colors.inputBackground,
    },
    formContainer: {
      paddingHorizontal: 0,
      paddingTop: 10,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      marginTop: 16,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "bold",
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 10,
    },
    attendanceCard: {
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    attendanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    attendanceIcon: {
      marginRight: 10,
    },
    attendanceTitleContainer: {
      flex: 1,
    },
    attendanceTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    attendanceSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    divider: {
      marginVertical: 10,
    },
    attendanceStats: {
      paddingHorizontal: 10,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 10,
    },
    statContent: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    statValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    monthDisplayContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    monthCountText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    monthLabelText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    presentBadge: {
      backgroundColor: colors.success,
      borderRadius: 12,
      paddingHorizontal: 10,
    },
    absentBadge: {
      backgroundColor: colors.error,
      borderRadius: 12,
      paddingHorizontal: 10,
    },
    noMonthsText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center",
      marginTop: 10,
      fontStyle: "italic",
    },
    mrtCard: {
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    mrtHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    mrtIcon: {
      marginRight: 10,
    },
    mrtTitleContainer: {
      flex: 1,
    },
    mrtSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    loadingContainer: {
      paddingVertical: 10,
      alignItems: "center",
    },
    dropdownContainer: {
      marginTop: 10,
    },
    dropdownLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
      color: colors.text,
    },
    noMonthsContainer: {
      marginTop: 10,
      alignItems: "center",
    },
    formCard: {
      marginTop: 10,
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    formIcon: {
      marginRight: 10,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    formDivider: {
      marginVertical: 10,
    },
  });
