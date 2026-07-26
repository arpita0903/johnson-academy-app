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
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import { useAppContext } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { ThemeColors, loginButtonGradientColors } from "../../../theme/colors";
import { Assignment } from "../../../types/assignment";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
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
  const { colors, isDark } = useTheme();
  const { userId } = useAppContext();
  const { showError, showSuccess, showInfo } = useToast();
  const dynamicStyles = createStyles(colors, isDark);
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

  const statusConfig = getStatusConfig(currentStatus, isDark, colors);
  const heroSubIconColor = isDark
    ? "rgba(148, 163, 184, 0.95)"
    : "rgba(71, 85, 105, 0.9)";
  const overdue = isOverdue(assignment.dueDate);

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
          "Failed to submit assignment. Please try again.",
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
    (submission) => submission.student.id === userId,
  );

  const userSubmission = assignment.submissions?.find(
    (submission) => submission.student.id === userId,
  );

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <KeyboardAvoidingView
        style={dynamicStyles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={dynamicStyles.content}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={dynamicStyles.backButton}
              accessibilityRole="button"
            >
              <Icon name="arrow-back" size={22} color={colors.primary} />
              <Text style={dynamicStyles.backButtonLabel}>Back</Text>
            </TouchableOpacity>

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
                        name={
                          currentStatus === "graded"
                            ? "star-outline"
                            : currentStatus === "overdue"
                              ? "alert-circle-outline"
                              : "document-text-outline"
                        }
                        size={28}
                        color={statusConfig.iconColor}
                      />
                    </View>
                    <View style={dynamicStyles.heroTextBlock}>
                      <Text style={dynamicStyles.title} numberOfLines={2}>
                        {assignment.title}
                      </Text>
                      <View style={dynamicStyles.heroSubRow}>
                        <Icon
                          name="school-outline"
                          size={16}
                          color={heroSubIconColor}
                          style={dynamicStyles.heroSubIcon}
                        />
                        <Text
                          style={dynamicStyles.heroSubtitle}
                          numberOfLines={1}
                        >
                          {assignment.classId.name}
                        </Text>
                      </View>
                      <Text style={dynamicStyles.heroCourseLine}>
                        {assignment.teacherId.name}
                      </Text>
                    </View>
                  </View>
                  <View style={dynamicStyles.heroDivider} />
                  <View style={dynamicStyles.heroDueRow}>
                    <Icon
                      name="calendar-outline"
                      size={18}
                      color={overdue ? colors.error : heroSubIconColor}
                      style={dynamicStyles.heroDueIcon}
                    />
                    <View style={dynamicStyles.metaTextBlock}>
                      <Text
                        style={[
                          dynamicStyles.heroDueText,
                          overdue && { color: colors.error },
                        ]}
                      >
                        {formatDate(assignment.dueDate)}
                      </Text>
                      <Text style={dynamicStyles.metaSecondaryText}>
                        {overdue
                          ? "This assignment is overdue"
                          : "Submit before the due date"}
                      </Text>
                    </View>
                  </View>
                  <View style={statusConfig.badgeStyle}>
                    <Text style={statusConfig.badgeLabelStyle}>
                      {getStatusText(currentStatus)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {userSubmission?.grade !== undefined ? (
              <View style={dynamicStyles.glassSection}>
                <Text style={dynamicStyles.sectionHeading}>
                  Grade & Feedback
                </Text>
                <View style={dynamicStyles.metaRow}>
                  <View style={dynamicStyles.metaIconWellSuccess}>
                    <Icon
                      name="star"
                      size={20}
                      color={isDark ? "#FBBF24" : "#D97706"}
                    />
                  </View>
                  <View style={dynamicStyles.metaTextBlock}>
                    <Text style={dynamicStyles.gradePrimaryText}>
                      {userSubmission.grade} out of 5 stars
                    </Text>
                    <Text style={dynamicStyles.metaSecondaryText}>
                      Graded by {assignment.teacherId.name}
                    </Text>
                  </View>
                </View>
                {userSubmission.feedback ? (
                  <>
                    <View style={dynamicStyles.divider} />
                    <Text style={dynamicStyles.feedbackLabel}>
                      Instructor feedback
                    </Text>
                    <Text style={dynamicStyles.bodyText}>
                      {userSubmission.feedback}
                    </Text>
                  </>
                ) : null}
              </View>
            ) : null}

            {/* <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>
                Class Information
              </Text>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Class</Text>
                <Text style={dynamicStyles.infoValue}>
                  {assignment.classId.name}
                </Text>
              </View>
              <View style={dynamicStyles.divider} />
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Instructor</Text>
                <Text style={dynamicStyles.infoValue}>
                  {assignment.teacherId.name}
                </Text>
              </View>
            </View> */}

            {assignment.description ? (
              <View style={dynamicStyles.glassSection}>
                <Text style={dynamicStyles.sectionHeading}>Description</Text>
                <Text style={dynamicStyles.bodyText}>
                  {assignment.description}
                </Text>
              </View>
            ) : null}

            {assignment.attachments && assignment.attachments.length > 0 ? (
              <View style={dynamicStyles.glassSection}>
                <Text style={dynamicStyles.sectionHeading}>
                  Assignment Files
                </Text>
                {assignment.attachments.map((attachment, index) => (
                  <TouchableOpacity
                    key={index}
                    style={dynamicStyles.linkRow}
                    onPress={() => handleOpenAttachment(attachment)}
                    activeOpacity={0.82}
                  >
                    <View style={dynamicStyles.linkIconWell}>
                      <Icon
                        name="document-attach-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={dynamicStyles.linkTextWrap}>
                      <Text style={dynamicStyles.linkPrimaryText}>
                        {attachment.includes("http")
                          ? `Attachment ${index + 1}`
                          : attachment}
                      </Text>
                      <Text style={dynamicStyles.linkSecondaryText}>
                        Tap to open attachment
                      </Text>
                    </View>
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={
                        isDark
                          ? "rgba(148, 163, 184, 0.75)"
                          : "rgba(100, 116, 139, 0.85)"
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View style={dynamicStyles.glassSection}>
              <Text style={dynamicStyles.sectionHeading}>Your Submission</Text>
              {hasUserSubmitted ? (
                <View style={dynamicStyles.metaRow}>
                  <View style={dynamicStyles.metaIconWellSuccess}>
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color={colors.success || "#4CAF50"}
                    />
                  </View>
                  <View style={dynamicStyles.metaTextBlock}>
                    <Text style={dynamicStyles.successPrimaryText}>
                      Assignment Submitted
                    </Text>
                    <Text style={dynamicStyles.metaSecondaryText}>
                      Submitted on{" "}
                      {userSubmission?.submittedAt
                        ? new Date(
                            userSubmission.submittedAt,
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={dynamicStyles.metaRow}>
                  <View style={dynamicStyles.metaIconWellWarning}>
                    <Icon
                      name="time-outline"
                      size={20}
                      color={colors.warning || "#FF9800"}
                    />
                  </View>
                  <View style={dynamicStyles.metaTextBlock}>
                    <Text style={dynamicStyles.warningPrimaryText}>
                      Assignment Pending
                    </Text>
                    <Text style={dynamicStyles.metaSecondaryText}>
                      Add your submission link below.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {hasUserSubmitted && userSubmission?.fileUrl ? (
              <View style={dynamicStyles.glassSection}>
                <Text style={dynamicStyles.sectionHeading}>
                  Your Submitted File
                </Text>
                <TouchableOpacity
                  style={dynamicStyles.linkRow}
                  onPress={() => handleOpenAttachment(userSubmission.fileUrl)}
                  activeOpacity={0.82}
                >
                  <View style={dynamicStyles.linkIconWellSuccess}>
                    <Icon
                      name="document-outline"
                      size={20}
                      color={colors.success || "#4CAF50"}
                    />
                  </View>
                  <View style={dynamicStyles.linkTextWrap}>
                    <Text style={dynamicStyles.linkPrimaryText}>
                      {userSubmission.fileUrl.includes("http")
                        ? "Your submitted file"
                        : userSubmission.fileUrl}
                    </Text>
                    <Text style={dynamicStyles.linkSecondaryText}>
                      Tap to open submission
                    </Text>
                  </View>
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color={
                      isDark
                        ? "rgba(148, 163, 184, 0.75)"
                        : "rgba(100, 116, 139, 0.85)"
                    }
                  />
                </TouchableOpacity>
              </View>
            ) : null}

            {!hasUserSubmitted ? (
              <View style={dynamicStyles.glassSection}>
                <Text style={dynamicStyles.sectionHeading}>
                  Submit Your Work
                </Text>
                <Text style={dynamicStyles.sectionBodyMuted}>
                  Paste a valid file URL so your instructor can review it.
                </Text>
                <TextInput
                  style={dynamicStyles.urlInput}
                  placeholder="Enter file URL (e.g., https://example.com/your-file.pdf)"
                  placeholderTextColor={colors.placeholderText}
                  value={fileUrl}
                  onChangeText={setFileUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    dynamicStyles.submitButton,
                    (submitting || !fileUrl.trim()) &&
                      dynamicStyles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitAssignment}
                  disabled={submitting || !fileUrl.trim()}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      submitting || !fileUrl.trim()
                        ? [colors.textMuted, colors.textMuted]
                        : isOverdue(assignment.dueDate)
                          ? [colors.error, colors.error]
                          : loginButtonGradientColors
                    }
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={dynamicStyles.submitGradient}
                  >
                    {submitting ? (
                      <View style={dynamicStyles.loadingContainer}>
                        <ActivityIndicator
                          color={colors.primaryText}
                          size="small"
                        />
                        <Text style={dynamicStyles.submitButtonText}>
                          Submitting...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Icon
                          name="cloud-upload-outline"
                          size={20}
                          color={colors.primaryText}
                        />
                        <Text style={dynamicStyles.submitButtonText}>
                          {isOverdue(assignment.dueDate)
                            ? "Submit Late"
                            : "Submit Assignment"}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function getStatusConfig(status: string, isDark: boolean, colors: ThemeColors) {
  if (status === "graded") {
    return {
      iconColor: isDark ? "#FBBF24" : "#D97706",
      badgeStyle: {
        alignSelf: "flex-start" as const,
        marginTop: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: isDark
          ? "rgba(251, 191, 36, 0.12)"
          : "rgba(251, 191, 36, 0.1)",
        borderColor: isDark
          ? "rgba(251, 191, 36, 0.42)"
          : "rgba(217, 119, 6, 0.28)",
      },
      badgeLabelStyle: {
        fontSize: 10,
        fontWeight: "800" as const,
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
        color: isDark ? "#FBBF24" : "#D97706",
      },
    };
  }

  if (status === "submitted") {
    return {
      iconColor: isDark
        ? "rgba(94, 234, 212, 0.95)"
        : "rgba(13, 148, 136, 0.95)",
      badgeStyle: {
        alignSelf: "flex-start" as const,
        marginTop: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: isDark
          ? "rgba(94, 234, 212, 0.1)"
          : "rgba(13, 148, 136, 0.1)",
        borderColor: isDark
          ? "rgba(94, 234, 212, 0.35)"
          : "rgba(45, 212, 191, 0.3)",
      },
      badgeLabelStyle: {
        fontSize: 10,
        fontWeight: "800" as const,
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
        color: isDark ? "rgba(94, 234, 212, 0.98)" : "rgba(13, 148, 136, 0.96)",
      },
    };
  }

  if (status === "overdue") {
    return {
      iconColor: isDark ? "#FBBF24" : "#D97706",
      badgeStyle: {
        alignSelf: "flex-start" as const,
        marginTop: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: isDark
          ? "rgba(251, 146, 60, 0.12)"
          : "rgba(251, 146, 60, 0.1)",
        borderColor: isDark
          ? "rgba(251, 146, 60, 0.5)"
          : "rgba(234, 88, 12, 0.4)",
      },
      badgeLabelStyle: {
        fontSize: 10,
        fontWeight: "800" as const,
        letterSpacing: 0.5,
        textTransform: "uppercase" as const,
        color: isDark ? "#FBBF24" : "#D97706",
      },
    };
  }

  return {
    iconColor: isDark ? "#DDD6FE" : "#6D28D9",
    badgeStyle: {
      alignSelf: "flex-start" as const,
      marginTop: 14,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.38)"
        : "rgba(109, 40, 217, 0.24)",
    },
    badgeLabelStyle: {
      fontSize: 10,
      fontWeight: "800" as const,
      letterSpacing: 0.5,
      textTransform: "uppercase" as const,
      color: isDark ? "#DDD6FE" : "#6D28D9",
    },
  };
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
      paddingTop: 8,
    },
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      paddingBottom: 32,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginBottom: 12,
      paddingHorizontal: 4,
      paddingVertical: 6,
    },
    backButtonLabel: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
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
      color: isDark ? "rgba(167, 139, 250, 0.95)" : "rgba(109, 40, 217, 0.82)",
    },
    heroDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
      marginTop: 14,
      marginBottom: 12,
    },
    heroDueRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    heroDueIcon: {
      marginRight: 8,
      marginTop: 2,
    },
    heroDueText: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
      lineHeight: 18,
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
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
      lineHeight: 32,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#64748B",
      fontWeight: "600",
    },
    infoValue: {
      fontSize: 14,
      color: isDark ? "#F8FAFC" : "#0f172a",
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaIconWell: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : "rgba(109, 40, 217, 0.08)",
    },
    metaIconWellSuccess: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.12)"
        : "rgba(13, 148, 136, 0.08)",
    },
    metaIconWellWarning: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(251, 146, 60, 0.12)"
        : "rgba(251, 146, 60, 0.1)",
    },
    metaTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    metaPrimaryText: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    metaSecondaryText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 18,
    },
    successPrimaryText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.success || "#4CAF50",
    },
    warningPrimaryText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.warning || "#FF9800",
    },
    gradePrimaryText: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#FBBF24" : "#D97706",
    },
    feedbackLabel: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.2,
      color: isDark ? "#94A3B8" : "#64748B",
      marginTop: 12,
      marginBottom: 8,
    },
    bodyText: {
      fontSize: 15,
      lineHeight: 23,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.9)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
    },
    linkIconWell: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : "rgba(109, 40, 217, 0.08)",
    },
    linkIconWellSuccess: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.12)"
        : "rgba(13, 148, 136, 0.08)",
    },
    linkTextWrap: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    linkPrimaryText: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    linkSecondaryText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    urlInput: {
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.14)"
        : "rgba(148, 163, 184, 0.18)",
      borderRadius: 16,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.9)",
      marginBottom: 16,
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
    submitButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "800",
      marginLeft: 8,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default StudentAssignmentDetailScreen;
