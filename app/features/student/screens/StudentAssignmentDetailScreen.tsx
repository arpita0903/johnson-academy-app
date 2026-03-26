import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useAppContext } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { ThemeColors } from "../../../theme/colors";
import { Assignment } from "../../../types/assignment";
import Icon from "react-native-vector-icons/Ionicons";
import { submitAssignment } from "../../../services/assignment";

interface StudentAssignmentDetailScreenProps {
  route: {
    params: {
      assignment: Assignment;
      onSubmissionSuccess?: () => void;
    };
  };
  navigation: any;
}

const StudentAssignmentDetailScreen: React.FC<
  StudentAssignmentDetailScreenProps
> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { userId } = useAppContext();
  const { showError, showSuccess, showInfo } = useToast();
  const dynamicStyles = createStyles(colors);
  const { assignment, onSubmissionSuccess } = route.params;

  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      assignment.status !== "submitted" &&
      assignment.status !== "graded"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return colors.success || "#4CAF50";
      case "assigned":
        return colors.warning || "#FF9800";
      case "overdue":
        return colors.error;
      case "graded":
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "assigned":
        return "Pending";
      case "overdue":
        return "Overdue";
      case "graded":
        return "Graded";
      default:
        return status;
    }
  };

  const currentStatus = isOverdue(assignment.dueDate)
    ? "overdue"
    : assignment.status;

  const handleSubmitAssignment = async () => {
    if (!fileUrl || !fileUrl.trim()) {
      showError("Please enter a valid file URL.");
      return;
    }

    // Validate URL format
    try {
      new URL(fileUrl.trim());
    } catch {
      showError("Please enter a valid URL format.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await submitAssignment(assignment.id, fileUrl.trim());

      showSuccess("Your assignment has been submitted successfully!");

      // Call the callback to refresh assignment data
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      showError(
        (error as Error).message ||
          "Failed to submit assignment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAttachment = async (attachment: string) => {
    try {
      if (!attachment) {
        showError("No valid URL found for this attachment.");
        return;
      }

      const supported = await Linking.canOpenURL(attachment);
      if (supported) {
        await Linking.openURL(attachment);
      } else {
        showInfo("Cannot open this attachment. Please check the URL.");
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      showError("Failed to open attachment. Please try again.");
    }
  };

  const hasUserSubmitted = assignment.submissions?.some(
    (submission) => submission.student.id === userId
  );

  const userSubmission = assignment.submissions?.find(
    (submission) => submission.student.id === userId
  );

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={dynamicStyles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Assignment Details</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Assignment Content */}
        <View style={dynamicStyles.content}>
          {/* Title and Status */}
          <View style={dynamicStyles.titleSection}>
            <Text style={dynamicStyles.title}>{assignment.title}</Text>
            <View
              style={[
                dynamicStyles.statusBadge,
                { backgroundColor: getStatusColor(currentStatus) },
              ]}
            >
              <Text style={dynamicStyles.statusText}>
                {getStatusText(currentStatus)}
              </Text>
            </View>
          </View>

          {/* Class Information */}
          <View style={dynamicStyles.infoCard}>
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Class</Text>
              <Text style={dynamicStyles.infoValue}>
                {assignment.classId.name}
              </Text>
            </View>
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Instructor</Text>
              <Text style={dynamicStyles.infoValue}>
                {assignment.teacherId.name}
              </Text>
            </View>
          </View>

          {/* Due Date */}
          <View
            style={[
              dynamicStyles.dueDateCard,
              {
                borderLeftColor: isOverdue(assignment.dueDate)
                  ? colors.error
                  : colors.primary,
              },
            ]}
          >
            <View style={dynamicStyles.dueDateHeader}>
              <Icon name="calendar-outline" size={20} color={colors.primary} />
              <Text style={dynamicStyles.dueDateLabel}>Due Date</Text>
            </View>
            <Text
              style={[
                dynamicStyles.dueDate,
                {
                  color: isOverdue(assignment.dueDate)
                    ? colors.error
                    : colors.text,
                },
              ]}
            >
              {formatDate(assignment.dueDate)}
            </Text>
            {isOverdue(assignment.dueDate) && (
              <Text style={dynamicStyles.overdueText}>
                This assignment is overdue
              </Text>
            )}
          </View>

          {/* Description */}
          {assignment.description && (
            <View style={dynamicStyles.descriptionCard}>
              <Text style={dynamicStyles.descriptionLabel}>Description</Text>
              <Text style={dynamicStyles.description}>
                {assignment.description}
              </Text>
            </View>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <View style={dynamicStyles.attachmentsCard}>
              <Text style={dynamicStyles.sectionTitle}>Assignment Files</Text>
              {assignment.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={index}
                  style={dynamicStyles.attachmentItem}
                  onPress={() => handleOpenAttachment(attachment)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="document-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={dynamicStyles.attachmentText}>
                    {attachment.includes("http")
                      ? `Attachment ${index + 1}`
                      : attachment}
                  </Text>
                  <Icon
                    name="open-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Submission Status */}
          <View style={dynamicStyles.submissionCard}>
            <Text style={dynamicStyles.sectionTitle}>Your Submission</Text>
            {hasUserSubmitted ? (
              <View style={dynamicStyles.submittedStatus}>
                <Icon
                  name="checkmark-circle"
                  size={24}
                  color={colors.success || "#4CAF50"}
                />
                <View style={dynamicStyles.submittedInfo}>
                  <Text style={dynamicStyles.submittedText}>
                    Assignment Submitted
                  </Text>
                  <Text style={dynamicStyles.submittedDate}>
                    Submitted on{" "}
                    {userSubmission?.submittedAt
                      ? new Date(
                          userSubmission.submittedAt
                        ).toLocaleDateString()
                      : "Unknown date"}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={dynamicStyles.pendingStatus}>
                <Icon
                  name="time-outline"
                  size={24}
                  color={colors.warning || "#FF9800"}
                />
                <Text style={dynamicStyles.pendingText}>
                  Assignment Pending
                </Text>
              </View>
            )}
          </View>

          {/* Student Submitted Attachment */}
          {hasUserSubmitted && userSubmission?.fileUrl && (
            <View style={dynamicStyles.submittedAttachmentCard}>
              <Text style={dynamicStyles.sectionTitle}>
                Your Submitted File
              </Text>
              <TouchableOpacity
                style={dynamicStyles.submittedAttachmentItem}
                onPress={() => handleOpenAttachment(userSubmission.fileUrl)}
                activeOpacity={0.7}
              >
                <Icon
                  name="document-outline"
                  size={20}
                  color={colors.success || "#4CAF50"}
                />
                <Text style={dynamicStyles.submittedAttachmentText}>
                  {userSubmission.fileUrl.includes("http")
                    ? `Your submitted file`
                    : userSubmission.fileUrl}
                </Text>
                <Icon
                  name="open-outline"
                  size={16}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Submission Form */}
          {!hasUserSubmitted && (
            <View style={dynamicStyles.submissionForm}>
              <Text style={dynamicStyles.sectionTitle}>Submit Your Work</Text>
              <TextInput
                style={dynamicStyles.urlInput}
                placeholder="Enter file URL (e.g., https://example.com/your-file.pdf)"
                placeholderTextColor={colors.textSecondary}
                value={fileUrl}
                onChangeText={setFileUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  dynamicStyles.submitButton,
                  {
                    backgroundColor: isOverdue(assignment.dueDate)
                      ? colors.error
                      : colors.primary,
                  },
                ]}
                onPress={handleSubmitAssignment}
                disabled={submitting || !fileUrl.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Icon
                      name="cloud-upload-outline"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={dynamicStyles.submitButtonText}>
                      {isOverdue(assignment.dueDate)
                        ? "Submit Late"
                        : "Submit Assignment"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    content: {
      padding: 16,
    },
    titleSection: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
      lineHeight: 32,
    },
    statusBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    statusText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "600",
    },
    dueDateCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dueDateHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    dueDateLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
      fontWeight: "500",
    },
    dueDate: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    overdueText: {
      fontSize: 12,
      color: colors.error,
      fontStyle: "italic",
    },
    descriptionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    descriptionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    attachmentsCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    attachmentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    attachmentText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
    submissionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submittedStatus: {
      flexDirection: "row",
      alignItems: "center",
    },
    submittedInfo: {
      marginLeft: 12,
    },
    submittedText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.success || "#4CAF50",
      marginBottom: 4,
    },
    submittedDate: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    pendingStatus: {
      flexDirection: "row",
      alignItems: "center",
    },
    pendingText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.warning || "#FF9800",
      marginLeft: 12,
    },
    submissionForm: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    urlInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
      marginBottom: 16,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      opacity: 1,
    },
    submitButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    submittedAttachmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submittedAttachmentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.success || "#4CAF50",
    },
    submittedAttachmentText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
  });

export default StudentAssignmentDetailScreen;
