import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { gradeSubmission } from "../../../services/assignment";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../ScreenGradientBackground";

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  subjects: string[];
  isActive: boolean;
  classes: string[];
  courses: string[];
  progress: string[];
  isCompleteProfile: boolean;
  phoneNumber?: string;
  profilePicture?: string;
}

interface Submission {
  _id: string;
  student: Student;
  submittedAt: string;
  fileUrl: string;
  grade?: number;
  feedback?: string;
}

interface SubmissionDetailModalProps {
  visible: boolean;
  submission: Submission | null;
  assignmentId: string;
  onClose: () => void;
  onGradeSubmitted: () => void;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  visible,
  submission,
  assignmentId,
  onClose,
  onGradeSubmitted,
}) => {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const [selectedGrade, setSelectedGrade] = useState(submission?.grade || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [submitting, setSubmitting] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    setSelectedGrade(submission?.grade || 0);
    setFeedback(submission?.feedback || "");
  }, [submission]);

  const handleGradeSubmit = async () => {
    if (!submission || selectedGrade === 0) {
      showError("Please select a grade before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const gradeData = {
        studentId: submission.student.id,
        grade: selectedGrade,
        feedback: feedback.trim(),
      };

      await gradeSubmission(assignmentId, gradeData);
      showSuccess("Grade submitted successfully!");
      onGradeSubmitted();
      onClose();
    } catch (error: any) {
      console.error("Error submitting grade:", error);
      showError(error.message || "Failed to submit grade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const mutedIconColor = isDark ? "#94A3B8" : "#64748B";

  const renderStars = () => (
    <View style={s.starsContainer}>
      <Text style={s.starsLabel}>Grade (1-5 stars)</Text>
      <View style={s.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedGrade(star)}
            style={s.starButton}
            accessibilityRole="button"
            accessibilityLabel={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Icon
              name={star <= selectedGrade ? "star" : "star-border"}
              size={32}
              color={star <= selectedGrade ? "#FBBF24" : mutedIconColor}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.gradeText}>
        {selectedGrade > 0 ? `${selectedGrade}/5 stars` : "No grade selected"}
      </Text>
    </View>
  );

  if (!submission) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
        <ScreenGradientBackground isDark={isDark} />

        <View style={s.header}>
          <TouchableOpacity
            onPress={onClose}
            style={s.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Icon
              name="close"
              size={22}
              color={isDark ? "#F8FAFC" : "#0f172a"}
            />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Submission Details</Text>
          <View style={s.headerSpacer} />
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>Student Information</Text>
            <View style={s.studentRow}>
              <View style={s.studentIconWell}>
                <Icon
                  name="person"
                  size={22}
                  color={
                    isDark
                      ? "rgba(196, 181, 253, 0.98)"
                      : "rgba(109, 40, 217, 0.9)"
                  }
                />
              </View>
              <View style={s.studentDetails}>
                <Text style={s.studentName}>{submission.student.name}</Text>
                <Text numberOfLines={1} style={s.studentEmail}>
                  {submission.student.email}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>Submission Information</Text>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Submitted At</Text>
              <Text style={s.infoValue}>
                {new Date(submission.submittedAt).toLocaleString()}
              </Text>
            </View>
            <View style={[s.infoRow, s.infoRowLast]}>
              <Text style={s.infoLabel}>Current Grade</Text>
              <Text style={s.infoValue}>
                {submission.grade
                  ? `${submission.grade}/5 stars`
                  : "Not graded"}
              </Text>
            </View>
          </View>

          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>Submitted File</Text>
            <TouchableOpacity
              style={s.fileButton}
              onPress={() => Linking.openURL(submission.fileUrl)}
              activeOpacity={0.82}
              accessibilityRole="button"
            >
              <View style={s.fileIconWell}>
                <Icon
                  name="insert-drive-file"
                  size={18}
                  color={
                    isDark
                      ? "rgba(94, 234, 212, 0.98)"
                      : "rgba(13, 148, 136, 0.96)"
                  }
                />
              </View>
              <Text style={s.fileButtonText}>View Submission File</Text>
              <Icon name="open-in-new" size={18} color={mutedIconColor} />
            </TouchableOpacity>
          </View>

          {submission.feedback ? (
            <View style={s.glassCard}>
              <Text style={s.sectionTitle}>Current Feedback</Text>
              <Text style={s.currentFeedbackText}>{submission.feedback}</Text>
            </View>
          ) : null}

          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>
              {submission.grade ? "Update Grade" : "Grade Submission"}
            </Text>

            {renderStars()}

            <View style={s.feedbackContainer}>
              <Text style={s.feedbackLabel}>Feedback</Text>
              <TextInput
                style={s.feedbackInput}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Enter feedback for the student..."
                placeholderTextColor={colors.placeholderText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                s.submitButton,
                (selectedGrade === 0 || submitting) && s.submitButtonDisabled,
              ]}
              onPress={handleGradeSubmit}
              disabled={selectedGrade === 0 || submitting}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={colors.primaryText} size="small" />
              ) : (
                <>
                  <Icon
                    name="check-circle"
                    size={20}
                    color={colors.primaryText}
                  />
                  <Text style={s.submitButtonText}>
                    {submission.grade ? "Update Grade" : "Submit Grade"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 4,
    },
    closeButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    headerSpacer: {
      width: 42,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 28,
    },
    glassCard: {
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 12,
    },
    studentRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
    },
    studentIconWell: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.38)"
        : "rgba(109, 40, 217, 0.24)",
    },
    studentDetails: {
      flex: 1,
      minWidth: 0,
    },
    studentName: {
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 2,
    },
    studentEmail: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      flex: 1,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
      flex: 1,
      textAlign: "right",
    },
    fileButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(94, 234, 212, 0.35)"
        : "rgba(45, 212, 191, 0.3)",
    },
    fileIconWell: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
    },
    fileButtonText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "rgba(94, 234, 212, 0.98)" : "rgba(13, 148, 136, 0.96)",
      marginRight: 8,
    },
    currentFeedbackText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#CBD5E1" : "#475569",
      lineHeight: 21,
    },
    starsContainer: {
      padding: 14,
      borderRadius: 14,
      marginBottom: 16,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
    },
    starsLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      marginBottom: 12,
      textAlign: "center",
    },
    starsRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 8,
    },
    starButton: {
      padding: 4,
      marginHorizontal: 4,
    },
    gradeText: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#FBBF24" : "#D97706",
      textAlign: "center",
    },
    feedbackContainer: {
      marginBottom: 16,
    },
    feedbackLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      marginBottom: 8,
    },
    feedbackInput: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
      borderRadius: 14,
      padding: 14,
      color: isDark ? "#F8FAFC" : "#0f172a",
      fontSize: 14,
      fontWeight: "500",
      minHeight: 110,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    submitButtonDisabled: {
      backgroundColor: isDark ? "rgba(148, 163, 184, 0.2)" : colors.textMuted,
      opacity: 0.7,
    },
    submitButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
  });

export default SubmissionDetailModal;
