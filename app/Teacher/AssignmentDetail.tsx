import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { deleteAssignment, getAssignmentById } from "../services/assignment";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import Icon from "react-native-vector-icons/Ionicons";
import SubmissionDetailModal from "../components/modals/SubmissionDetailModal";

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

interface ClassInfo {
  id: string;
  name: string;
  teacherId: string;
  courseId: string;
  students: string[];
}

interface Teacher {
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  attachments: any[];
  status: string;
  students: Student[];
  classId: ClassInfo;
  teacherId: Teacher;
  createdBy: Teacher;
  dueDate: string;
  submissions: Submission[];
  createdAt?: string;
  updatedAt?: string;
}

interface AssignmentDetailProps {
  route: {
    params?: {
      assignmentId: string;
      assignment: Assignment;
    };
  };
  navigation: any;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAppContext();
  const { showSuccess, showInfo } = useToast();
  const { assignmentId, assignment: initialAssignment } = route.params || {};
  const [assignment, setAssignment] = useState<Assignment>(
    initialAssignment || {
      id: "",
      title: "",
      description: "",
      attachments: [],
      status: "",
      students: [],
      classId: { id: "", name: "", teacherId: "", courseId: "", students: [] },
      teacherId: {
        id: "",
        name: "",
        email: "",
        role: "",
        isEmailVerified: false,
        subjects: [],
        isActive: true,
        classes: [],
        courses: [],
        progress: [],
        isCompleteProfile: false,
      },
      createdBy: {
        id: "",
        name: "",
        email: "",
        role: "",
        isEmailVerified: false,
        subjects: [],
        isActive: true,
        classes: [],
        courses: [],
        progress: [],
        isCompleteProfile: false,
      },
      dueDate: "",
      submissions: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);

  useEffect(() => {
    // Fetch fresh assignment data if needed
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      const fetchedAssignment = await getAssignmentById(assignmentId);
      setAssignment(fetchedAssignment as Assignment);
    } catch (err: any) {
      console.error("Error fetching assignment details:", err);
      // Keep using initial assignment data if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleShareAssignment = async () => {
    try {
      const shareContent = {
        title: assignment.title,
        message: `${assignment.title}\n\n${assignment.description}${
          assignment.dueDate
            ? `\n\nDue: ${new Date(assignment.dueDate).toLocaleDateString()}`
            : ""
        }${
          assignment.attachments && assignment.attachments.length > 0
            ? `\n\nAttachments: ${assignment.attachments.length} file(s)`
            : ""
        }`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error("Error sharing assignment:", error);
    }
  };

  const handleSubmitAssignment = () => {
    // This feature will be implemented to allow students to submit their work.
    // Using toast for info message instead of Alert
  };

  const handleEditAssignment = () => {
    if (user?.role === "teacher") {
      navigation.navigate("EditAssignment", { assignment });
    }
  };

  const handleDeleteAssignment = () => {
    if (user?.role === "teacher") {
      Alert.alert(
        "Delete Assignment",
        "Are you sure you want to delete this assignment? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              // deleteAssignment
              // Implement delete functionality
              await deleteAssignment(assignment.id);
              showSuccess("Assignment deleted successfully.");
              //go back to the previous screen
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSubmissionModalVisible(true);
  };

  const handleCloseSubmissionModal = () => {
    setSubmissionModalVisible(false);
    setSelectedSubmission(null);
  };

  const handleGradeSubmitted = () => {
    // Refresh assignment data to show updated grades
    fetchAssignmentDetails();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading assignment details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={32} color="#ff6b35" />
        </TouchableOpacity>

        {user?.role === "teacher" && (
          <View style={styles.actionButtons}>
            {/* <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditAssignment}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAssignment}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Assignment Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{assignment.title}</Text>

        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDateLabel}>Due Date:</Text>
          <Text style={styles.dueDate}>
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "No due date set"}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.status,
              {
                color:
                  assignment.status === "submitted" ? "#4CAF50" : "#ff6b35",
              },
            ]}
          >
            {assignment.status.charAt(0).toUpperCase() +
              assignment.status.slice(1)}
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>

        {/* Attachments Section */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.sectionTitle}>Assignment Files</Text>
            {assignment.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachmentButton}
                onPress={() => Linking.openURL(attachment.url)}
              >
                <Text style={styles.attachmentButtonText}>
                  📄 {attachment.name || `Attachment ${index + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Submissions Section */}
        {assignment.submissions && assignment.submissions.length > 0 && (
          <View style={styles.submissionsSection}>
            <Text style={styles.sectionTitle}>
              Student Submissions ({assignment.submissions.length})
            </Text>
            {assignment.submissions.map((submission) => (
              <TouchableOpacity
                key={submission._id}
                style={styles.submissionCard}
                onPress={() => handleViewSubmission(submission)}
              >
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionStudentName}>
                    {submission.student.name}
                  </Text>
                  <Text style={styles.submissionDate}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.submissionFooter}>
                  <View style={styles.gradeStatus}>
                    {true ? (
                      <View style={styles.gradeInfo}>
                        <Text style={styles.gradeLabel}>Grade:</Text>
                        <View style={styles.starsDisplay}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              name={
                                star <= submission.grade!
                                  ? "star"
                                  : "star-outline"
                              }
                              size={16}
                              color={
                                star <= submission.grade! ? "#ffd700" : "#666"
                              }
                            />
                          ))}
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.pendingGrade}>Pending Grade</Text>
                    )}
                  </View>
                  <View style={styles.gradeAction}>
                    <Text style={styles.gradeActionText}>
                      {submission.grade ? "Update Grade" : "Grade"}
                    </Text>
                    <Icon name="chevron-forward" size={20} color="#ff6b35" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Students Section */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>
            Assigned Students ({assignment.students.length})
          </Text>
          {assignment.students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
              </View>
              <View style={styles.studentStatus}>
                <Text
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: assignment.submissions.some(
                        (sub) => sub.student.id === student.id
                      )
                        ? "#4CAF50"
                        : "#ff6b35",
                    },
                  ]}
                >
                  {assignment.submissions.some(
                    (sub) => sub.student.id === student.id
                  )
                    ? "Submitted"
                    : "Pending"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Student Actions */}
        {user?.role === "student" && (
          <View style={styles.studentActions}>
            <Text style={styles.sectionTitle}>Your Actions</Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitAssignment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Assignment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Share Section */}
        {/* <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Assignment</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareAssignment}
          >
            <Text style={styles.shareButtonText}>📤 Share Assignment</Text>
          </TouchableOpacity> */}
        {/* </View> */}

        {/* Assignment Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Assignment Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Assignment ID:</Text>
            <Text style={styles.infoValue}>{assignment.id}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Class:</Text>
            <Text style={styles.infoValue}>{assignment.classId.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Teacher:</Text>
            <Text style={styles.infoValue}>{assignment.teacherId.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Created By:</Text>
            <Text style={styles.infoValue}>{assignment.createdBy.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Students:</Text>
            <Text style={styles.infoValue}>{assignment.students.length}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Submissions:</Text>
            <Text style={styles.infoValue}>
              {assignment.submissions.length} / {assignment.students.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        visible={submissionModalVisible}
        submission={selectedSubmission}
        assignmentId={assignment.id}
        onClose={handleCloseSubmissionModal}
        onGradeSubmitted={handleGradeSubmitted}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3d3d3d",
  },

  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
    lineHeight: 32,
  },
  dueDateContainer: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b35",
  },
  dueDateLabel: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b35",
  },
  statusContainer: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statusLabel: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b35",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#cccccc",
    lineHeight: 24,
  },
  attachmentsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
  },
  attachmentButton: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff6b35",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentButtonText: {
    color: "#ff6b35",
    fontSize: 16,
    fontWeight: "600",
  },
  submissionsSection: {
    marginBottom: 24,
  },
  submissionCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ff6b35",
    shadowColor: "#ff6b35",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  submissionStudentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  submissionDate: {
    fontSize: 14,
    color: "#cccccc",
  },
  submissionButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submissionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  studentsSection: {
    marginBottom: 24,
  },
  studentCard: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3d3d3d",
  },
  studentInfo: {
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
  studentStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  studentActions: {
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#ff6b35",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareSection: {
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoItem: {
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
  loadingText: {
    color: "#ffffff",
    marginTop: 12,
    fontSize: 16,
  },
  submissionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  gradeStatus: {
    flex: 1,
  },
  gradeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  gradeLabel: {
    fontSize: 14,
    color: "#cccccc",
    marginRight: 8,
  },
  starsDisplay: {
    flexDirection: "row",
  },
  pendingGrade: {
    fontSize: 14,
    color: "#ff6b35",
    fontStyle: "italic",
  },
  gradeAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  gradeActionText: {
    fontSize: 14,
    color: "#ff6b35",
    fontWeight: "600",
    marginRight: 4,
  },
});

export default AssignmentDetail;
