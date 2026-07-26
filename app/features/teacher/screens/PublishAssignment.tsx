import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import { useAppContext } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { ThemeColors, loginButtonGradientColors } from "../../../theme/colors";
import { createAssignment } from "../../../services/assignment";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";

interface PublishAssignmentProps {
  route: any;
  navigation: any;
}

const PublishAssignment = ({ route, navigation }: PublishAssignmentProps) => {
  const { batch } = route.params;
  const { colors, isDark } = useTheme();
  const { user } = useAppContext();
  const { showSuccess, showError } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // yyyy-MM-dd format
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleFileUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled) {
      setAttachment(result);
    }
  };

  const handleDateSelect = (day: any) => {
    setDueDate(day.dateString); // day.dateString is already in yyyy-MM-dd format
    setShowCalendar(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      description: "",
      dueDate: "",
    };

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Assignment title is required";
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate due date (already has default value, but we can add additional checks)
    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.description && !newErrors.dueDate;
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const clearSubmitError = () => {
    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setSubmitError("");

      try {
        // Create assignment payload
        const assignmentPayload = {
          title: title.trim(),
          description: description.trim(),
          classId: batch.id,
          teacherId: user?.id,
          dueDate: dueDate,
          createdBy: user?.id,
        };

        await createAssignment(assignmentPayload);

        showSuccess("Assignment created successfully!");
        navigation.goBack();
      } catch (error: any) {
        setSubmitError((error as Error).message);
        showError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const dynamicStyles = createStyles(colors, isDark);
  const calendarTheme = {
    backgroundColor: isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(248, 250, 252, 0.92)",
    calendarBackground: isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(248, 250, 252, 0.92)",
    textSectionTitleColor: colors.text,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.primaryText,
    todayTextColor: colors.primary,
    dayTextColor: colors.text,
    textDisabledColor: colors.textMuted,
    dotColor: colors.primary,
    selectedDotColor: colors.primaryText,
    arrowColor: colors.primary,
    monthTextColor: colors.text,
    indicatorColor: colors.primary,
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <KeyboardAvoidingView
        style={dynamicStyles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.container}>
            <View style={dynamicStyles.heroOuter}>
              <LinearGradient
                colors={
                  !isDark
                    ? ["rgba(94, 234, 212, 0.14)", "rgba(167, 139, 250, 0.16)"]
                    : ["rgba(45, 212, 191, 0.14)", "rgba(167, 139, 250, 0.12)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={dynamicStyles.heroGradientFill}
              >
                <View style={dynamicStyles.heroInner}>
                  <View style={dynamicStyles.heroTopRow}>
                    <View style={dynamicStyles.heroIconWell}>
                      <Icon
                        name="assignment"
                        size={28}
                        color={
                          isDark
                            ? "rgba(167, 139, 250, 0.95)"
                            : "rgba(109, 40, 217, 0.85)"
                        }
                      />
                    </View>
                    <View style={dynamicStyles.heroTextBlock}>
                      <Text style={dynamicStyles.title}>Create Assignment</Text>
                      <View style={dynamicStyles.heroSubRow}>
                        <Icon
                          name="groups"
                          size={16}
                          color={
                            isDark
                              ? "rgba(148, 163, 184, 0.95)"
                              : "rgba(71, 85, 105, 0.9)"
                          }
                          style={dynamicStyles.heroSubIcon}
                        />
                        <Text style={dynamicStyles.batchName} numberOfLines={1}>
                          {batch.name}
                        </Text>
                      </View>
                      <Text style={dynamicStyles.heroCourseLine}>
                        Publish practice work, resources, and deadlines for this
                        class.
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>Assignment Title</Text>
              <TextInput
                style={[
                  dynamicStyles.input,
                  errors.title && dynamicStyles.inputError,
                ]}
                placeholder="Assignment Title"
                placeholderTextColor={colors.placeholderText}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  clearError("title");
                  clearSubmitError();
                }}
              />
              {errors.title ? (
                <Text style={dynamicStyles.errorText}>{errors.title}</Text>
              ) : null}
            </View>

            <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>Description</Text>
              <TextInput
                style={[
                  dynamicStyles.input,
                  dynamicStyles.multilineInput,
                  errors.description && dynamicStyles.inputError,
                ]}
                placeholder="Description"
                placeholderTextColor={colors.placeholderText}
                multiline
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  clearError("description");
                  clearSubmitError();
                }}
              />
              {errors.description ? (
                <Text style={dynamicStyles.errorText}>
                  {errors.description}
                </Text>
              ) : null}
            </View>

            <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>Due Date</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCalendar(!showCalendar);
                  clearError("dueDate");
                  clearSubmitError();
                }}
                style={[
                  dynamicStyles.dateButton,
                  errors.dueDate && dynamicStyles.dateButtonError,
                ]}
                activeOpacity={0.85}
              >
                <View style={dynamicStyles.dateButtonContent}>
                  <View style={dynamicStyles.dateIconWell}>
                    <Icon name="event" size={20} color={colors.primary} />
                  </View>
                  <View style={dynamicStyles.dateTextWrap}>
                    <Text style={dynamicStyles.dateButtonText}>
                      {formatDate(dueDate)}
                    </Text>
                    <Text style={dynamicStyles.dateButtonSubtext}>
                      Tap to change
                    </Text>
                  </View>
                  <Icon
                    name={showCalendar ? "expand-less" : "expand-more"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
              {errors.dueDate ? (
                <Text style={dynamicStyles.errorText}>{errors.dueDate}</Text>
              ) : null}

              {showCalendar && (
                <View style={dynamicStyles.calendarContainer}>
                  <Calendar
                    onDayPress={handleDateSelect}
                    markedDates={{
                      [dueDate]: {
                        selected: true,
                        selectedColor: colors.primary,
                      },
                    }}
                    minDate={new Date().toISOString().split("T")[0]}
                    theme={{
                      backgroundColor: calendarTheme.backgroundColor,
                      calendarBackground: calendarTheme.calendarBackground,
                      textSectionTitleColor:
                        calendarTheme.textSectionTitleColor,
                      selectedDayBackgroundColor:
                        calendarTheme.selectedDayBackgroundColor,
                      selectedDayTextColor: calendarTheme.selectedDayTextColor,
                      todayTextColor: calendarTheme.todayTextColor,
                      dayTextColor: calendarTheme.dayTextColor,
                      textDisabledColor: calendarTheme.textDisabledColor,
                      dotColor: calendarTheme.dotColor,
                      selectedDotColor: calendarTheme.selectedDotColor,
                      arrowColor: calendarTheme.arrowColor,
                      monthTextColor: calendarTheme.monthTextColor,
                      indicatorColor: calendarTheme.indicatorColor,
                      textDayFontWeight: "500",
                      textMonthFontWeight: "bold",
                      textDayHeaderFontWeight: "600",
                      textDayFontSize: 16,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 14,
                    }}
                    style={dynamicStyles.calendar}
                  />
                </View>
              )}
            </View>

            <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>Attachment</Text>
              <Text style={dynamicStyles.sectionBodyMuted}>
                Attach a PDF reference for students if needed.
              </Text>
              <TouchableOpacity
                onPress={handleFileUpload}
                style={dynamicStyles.uploadButton}
                activeOpacity={0.85}
              >
                <View style={dynamicStyles.uploadIconWell}>
                  <Icon
                    name={
                      attachment && !attachment.canceled
                        ? "task-alt"
                        : "upload-file"
                    }
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={dynamicStyles.uploadTextWrap}>
                  <Text style={dynamicStyles.uploadText}>
                    {attachment && !attachment.canceled
                      ? attachment.assets?.[0]?.name || "PDF Selected"
                      : "Upload PDF"}
                  </Text>
                  <Text style={dynamicStyles.uploadSubtext}>
                    {attachment && !attachment.canceled
                      ? "Tap to replace the selected file"
                      : "Optional supporting file"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {submitError ? (
              <View style={dynamicStyles.errorContainer}>
                <Text style={dynamicStyles.errorText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={dynamicStyles.submitSection}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  dynamicStyles.submitButton,
                  isLoading && dynamicStyles.submitButtonDisabled,
                ]}
                disabled={isLoading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    isLoading
                      ? [colors.textMuted, colors.textMuted]
                      : loginButtonGradientColors
                  }
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={dynamicStyles.submitGradient}
                >
                  {isLoading ? (
                    <View style={dynamicStyles.loadingContainer}>
                      <ActivityIndicator
                        color={colors.primaryText}
                        size="small"
                      />
                      <Text
                        style={[dynamicStyles.submitText, { marginLeft: 8 }]}
                      >
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Icon
                        name="publish"
                        size={20}
                        color={colors.primaryText}
                      />
                      <Text style={dynamicStyles.submitText}>
                        Create Assignment
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <Text style={dynamicStyles.submitCaption}>
                Students in this class will see the assignment after publishing.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PublishAssignment;

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    container: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 32,
      backgroundColor: "transparent",
    },
    heroOuter: {
      borderRadius: 20,
      overflow: "hidden",
      marginTop: 8,
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
    heroIconWell: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
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
    title: {
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
    batchName: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
      flex: 1,
    },
    heroCourseLine: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: -0.15,
      color: isDark ? "rgba(167, 139, 250, 0.95)" : "rgba(109, 40, 217, 0.82)",
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
      marginBottom: 14,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginBottom: 10,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    sectionBodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      marginBottom: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.9)",
      color: colors.text,
      padding: 16,
      borderRadius: 16,
      fontSize: 16,
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 2,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginTop: 8,
      marginLeft: 4,
    },
    multilineInput: {
      height: 120,
      textAlignVertical: "top",
    },
    dateButton: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.9)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
    },
    dateButtonError: {
      borderColor: colors.error,
      borderWidth: 2,
    },
    dateButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    dateIconWell: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : "rgba(109, 40, 217, 0.08)",
    },
    dateTextWrap: {
      flex: 1,
      paddingRight: 8,
    },
    dateButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    dateButtonSubtext: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    calendarContainer: {
      marginTop: 12,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.92)",
      borderRadius: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
    },
    calendar: {
      borderRadius: 12,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.9)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
      borderStyle: "dashed",
    },
    uploadIconWell: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : "rgba(109, 40, 217, 0.08)",
    },
    uploadTextWrap: {
      flex: 1,
    },
    uploadText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    uploadSubtext: {
      marginTop: 4,
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    submitSection: {
      marginTop: 6,
    },
    submitButton: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.18,
      shadowRadius: 8,
      elevation: 6,
    },
    submitGradient: {
      minHeight: 56,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonDisabled: {
      shadowOpacity: 0.1,
    },
    submitText: {
      color: colors.primaryText,
      fontWeight: "800",
      fontSize: 16,
      marginLeft: 8,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    submitCaption: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 18,
    },
    errorContainer: {
      backgroundColor: isDark
        ? "rgba(239, 68, 68, 0.14)"
        : "rgba(239, 68, 68, 0.1)",
      padding: 14,
      borderRadius: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(239, 68, 68, 0.38)"
        : "rgba(239, 68, 68, 0.22)",
    },
  });
