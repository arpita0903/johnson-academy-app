import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../context/ThemeContext";
import { useAppContext } from "../context/AppContext";
import { ThemeColors } from "../theme/colors";
import { createAssignment } from "../services/assignment";

interface PublishAssignmentProps {
  route: any;
  navigation: any;
}

const PublishAssignment = ({ route, navigation }: PublishAssignmentProps) => {
  const { batch } = route.params;
  const { colors } = useTheme();
  const { user } = useAppContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0]
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

        console.log("Assignment Payload:", assignmentPayload);
        const result = await createAssignment(assignmentPayload);

        Alert.alert("Success", "Assignment created successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error: any) {
        console.error("Error creating assignment:", error);
        const errorMessage =
          error?.message || "Failed to create assignment. Please try again.";
        setSubmitError(errorMessage);
        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.title}>Create Assignment</Text>
        <Text style={dynamicStyles.batchName}>Class: {batch.name}</Text>

        <View>
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

        <View>
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
            <Text style={dynamicStyles.errorText}>{errors.description}</Text>
          ) : null}
        </View>

        <View>
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
          >
            <Text style={dynamicStyles.dateButtonText}>
              Due Date: {formatDate(dueDate)}
            </Text>
            <Text style={dynamicStyles.dateButtonSubtext}>Tap to change</Text>
          </TouchableOpacity>
          {errors.dueDate ? (
            <Text style={dynamicStyles.errorText}>{errors.dueDate}</Text>
          ) : null}
        </View>

        {showCalendar && (
          <View style={dynamicStyles.calendarContainer}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [dueDate]: { selected: true, selectedColor: colors.primary },
              }}
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                backgroundColor: colors.card,
                calendarBackground: colors.card,
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

        <TouchableOpacity
          onPress={handleFileUpload}
          style={dynamicStyles.uploadButton}
        >
          <Text style={dynamicStyles.uploadText}>
            {attachment && !attachment.canceled
              ? attachment.assets?.[0]?.name || "PDF Selected"
              : "Upload PDF"}
          </Text>
        </TouchableOpacity>

        {submitError ? (
          <View style={dynamicStyles.errorContainer}>
            <Text style={dynamicStyles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            dynamicStyles.submitButton,
            isLoading && dynamicStyles.submitButtonDisabled,
          ]}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={dynamicStyles.loadingContainer}>
              <ActivityIndicator color={colors.primaryText} size="small" />
              <Text style={[dynamicStyles.submitText, { marginLeft: 8 }]}>
                Creating...
              </Text>
            </View>
          ) : (
            <Text style={dynamicStyles.submitText}>Create Assignment</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PublishAssignment;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.primary,
      textAlign: "center",
    },
    batchName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 24,
      color: colors.textSecondary,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    inputError: {
      borderColor: colors.error,
      borderWidth: 2,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginBottom: 8,
      marginLeft: 4,
    },
    multilineInput: {
      height: 120,
      textAlignVertical: "top",
    },
    dateButton: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
    },
    dateButtonError: {
      borderColor: colors.error,
      borderWidth: 2,
    },
    dateButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    dateButtonSubtext: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    calendarContainer: {
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    calendar: {
      borderRadius: 8,
    },
    uploadButton: {
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderStyle: "dashed",
    },
    uploadText: {
      color: colors.text,
      textAlign: "center",
      fontSize: 16,
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      shadowOpacity: 0.1,
    },
    submitText: {
      color: colors.primaryText,
      fontWeight: "bold",
      fontSize: 18,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    errorContainer: {
      backgroundColor: colors.error + "20",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.error,
    },
  });
