import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { gradeSubmission } from "../../services/assignment";

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
  const [selectedGrade, setSelectedGrade] = useState(submission?.grade || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [submitting, setSubmitting] = useState(false);

  const handleGradeSubmit = async () => {
    if (!submission || selectedGrade === 0) {
      Alert.alert("Error", "Please select a grade before submitting.");
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
      Alert.alert("Success", "Grade submitted successfully!");
      onGradeSubmitted();
      onClose();
    } catch (error: any) {
      console.error("Error submitting grade:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit grade. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.starsLabel}>Grade (1-5 stars):</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setSelectedGrade(star)}
              style={styles.starButton}
            >
              <Icon
                name={star <= selectedGrade ? "star" : "star-outline"}
                size={32}
                color={star <= selectedGrade ? "#ffd700" : "#666"}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.gradeText}>
          {selectedGrade > 0 ? `${selectedGrade}/5 stars` : "No grade selected"}
        </Text>
      </View>
    );
  };

  if (!submission) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#ff6b35" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submission Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Student Info */}
          <View style={styles.studentInfoSection}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            <View style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <Icon name="person-circle" size={40} color="#ff6b35" />
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>
                    {submission.student.name}
                  </Text>
                  <Text style={styles.studentEmail}>
                    {submission.student.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Submission Info */}
          <View style={styles.submissionInfoSection}>
            <Text style={styles.sectionTitle}>Submission Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted At:</Text>
                <Text style={styles.infoValue}>
                  {new Date(submission.submittedAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Grade:</Text>
                <Text style={styles.infoValue}>
                  {submission.grade
                    ? `${submission.grade}/5 stars`
                    : "Not graded"}
                </Text>
              </View>
            </View>
          </View>

          {/* File Viewing */}
          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>Submitted File</Text>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => Linking.openURL(submission.fileUrl)}
            >
              <Icon name="document-text" size={24} color="#4CAF50" />
              <Text style={styles.fileButtonText}>View Submission File</Text>
              <Icon name="chevron-forward" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* Current Feedback */}
          {submission.feedback && (
            <View style={styles.currentFeedbackSection}>
              <Text style={styles.sectionTitle}>Current Feedback</Text>
              <View style={styles.feedbackCard}>
                <Text style={styles.currentFeedbackText}>
                  {submission.feedback}
                </Text>
              </View>
            </View>
          )}

          {/* Grading Section */}
          <View style={styles.gradingSection}>
            <Text style={styles.sectionTitle}>
              {submission.grade ? "Update Grade" : "Grade Submission"}
            </Text>

            {renderStars()}

            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>Feedback:</Text>
              <TextInput
                style={styles.feedbackInput}
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Enter feedback for the student..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (selectedGrade === 0 || submitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleGradeSubmit}
              disabled={selectedGrade === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>
                    {submission.grade ? "Update Grade" : "Submit Grade"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  studentInfoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b35",
    marginBottom: 12,
  },
  studentCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d3d3d",
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: "#cccccc",
  },
  submissionInfoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d3d3d",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },
  infoLabel: {
    fontSize: 14,
    color: "#cccccc",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  fileSection: {
    marginBottom: 20,
  },
  fileButton: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  fileButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  currentFeedbackSection: {
    marginBottom: 20,
  },
  feedbackCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3d3d3d",
  },
  currentFeedbackText: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 20,
  },
  gradingSection: {
    marginBottom: 20,
  },
  starsContainer: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3d3d3d",
  },
  starsLabel: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 12,
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
    fontSize: 14,
    color: "#ffd700",
    textAlign: "center",
    fontWeight: "600",
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackLabel: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: "#2d2d2d",
    borderWidth: 1,
    borderColor: "#3d3d3d",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 14,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: "#ff6b35",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#666",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SubmissionDetailModal;
