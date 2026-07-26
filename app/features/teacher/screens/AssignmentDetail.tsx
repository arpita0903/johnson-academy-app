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
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  deleteAssignment,
  getAssignmentById,
} from "../../../services/assignment";
import { useAppContext } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import SubmissionDetailModal from "../../../shared/components/modals/SubmissionDetailModal";

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

type AssignmentStatus = "graded" | "submitted" | "assigned" | "overdue";

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  graded: "Graded",
  submitted: "Submitted",
  assigned: "Assigned",
  overdue: "Overdue",
};

const STATUS_ICONS: Record<AssignmentStatus, string> = {
  graded: "grade",
  submitted: "check-circle",
  assigned: "timelapse",
  overdue: "warning-amber",
};

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAppContext();
  const { showSuccess, showInfo } = useToast();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
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
    },
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
              await deleteAssignment(assignment.id);
              showSuccess("Assignment deleted successfully.");
              navigation.goBack();
            },
          },
        ],
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

  const resolveStatus = (): AssignmentStatus => {
    if (assignment.status === "graded") return "graded";
    if (assignment.status === "submitted") return "submitted";
    if (
      assignment.status === "overdue" ||
      (assignment.dueDate && new Date(assignment.dueDate) < new Date())
    ) {
      return "overdue";
    }
    return "assigned";
  };

  const status = resolveStatus();

  const statusIconColor = {
    graded: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    submitted: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    assigned: isDark ? "rgba(196, 181, 253, 0.98)" : "rgba(109, 40, 217, 0.9)",
    overdue: isDark ? "#FBBF24" : "#D97706",
  }[status];

  const statusBadgeStyle = [
    s.statusBadge,
    (status === "submitted" || status === "graded") && s.statusBadgeSuccess,
    status === "assigned" && s.statusBadgePending,
    status === "overdue" && s.statusBadgeOverdue,
  ];

  const statusBadgeLabelStyle = [
    s.statusBadgeLabel,
    (status === "submitted" || status === "graded") &&
      s.statusBadgeLabelSuccess,
    status === "assigned" && s.statusBadgeLabelPending,
    status === "overdue" && s.statusBadgeLabelOverdue,
  ];

  const mutedIconColor = isDark ? "#94A3B8" : "#64748B";

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <View style={s.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading assignment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            style={s.headerIconButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon
              name="arrow-back"
              size={22}
              color={isDark ? "#F8FAFC" : "#0f172a"}
            />
          </TouchableOpacity>

          {user?.role === "teacher" && (
            <TouchableOpacity
              style={s.deleteButton}
              onPress={handleDeleteAssignment}
              accessibilityRole="button"
              accessibilityLabel="Delete assignment"
            >
              <Icon
                name="delete-outline"
                size={18}
                color={isDark ? "#FCA5A5" : "#DC2626"}
              />
              <Text style={s.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hero Card */}
        <View style={s.glassCard}>
          <View style={s.heroRow}>
            <View style={s.statusIconWell}>
              <Icon
                name={STATUS_ICONS[status]}
                size={26}
                color={statusIconColor}
              />
            </View>
            <View style={s.heroTextBlock}>
              <Text style={s.title}>{assignment.title}</Text>
              <Text numberOfLines={1} style={s.metaLine}>
                {assignment.classId.name}
              </Text>
            </View>
            <View style={statusBadgeStyle}>
              <Text style={statusBadgeLabelStyle}>{STATUS_LABELS[status]}</Text>
            </View>
          </View>

          <View style={s.dueRow}>
            <Icon
              name="event"
              size={16}
              color={status === "overdue" ? colors.error : mutedIconColor}
              style={s.dueIcon}
            />
            <Text
              style={[
                s.dueLabel,
                status === "overdue" && { color: colors.error },
              ]}
            >
              {assignment.dueDate
                ? `Due ${new Date(assignment.dueDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}`
                : "No due date set"}
            </Text>
          </View>
        </View>

        {/* Description */}
        {assignment.description ? (
          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>Description</Text>
            <Text style={s.description}>{assignment.description}</Text>
          </View>
        ) : null}

        {/* Attachments Section */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>
              Assignment Files ({assignment.attachments.length})
            </Text>
            {assignment.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={s.attachmentRow}
                onPress={() => Linking.openURL(attachment.url)}
                activeOpacity={0.82}
                accessibilityRole="button"
              >
                <View style={s.attachmentIconWell}>
                  <Icon
                    name="insert-drive-file"
                    size={18}
                    color={
                      isDark
                        ? "rgba(196, 181, 253, 0.98)"
                        : "rgba(109, 40, 217, 0.9)"
                    }
                  />
                </View>
                <Text numberOfLines={1} style={s.attachmentName}>
                  {attachment.name || `Attachment ${index + 1}`}
                </Text>
                <Icon name="open-in-new" size={18} color={mutedIconColor} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Submissions Section */}
        {assignment.submissions && assignment.submissions.length > 0 && (
          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>
              Student Submissions ({assignment.submissions.length})
            </Text>
            {assignment.submissions.map((submission) => (
              <TouchableOpacity
                key={submission._id}
                style={s.submissionCard}
                onPress={() => handleViewSubmission(submission)}
                activeOpacity={0.82}
                accessibilityRole="button"
              >
                <View style={s.submissionHeader}>
                  <Text style={s.submissionStudentName}>
                    {submission.student.name}
                  </Text>
                  <Text style={s.submissionDate}>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={s.submissionFooter}>
                  <View style={s.gradeStatus}>
                    {submission.grade !== undefined ? (
                      <View style={s.gradeInfo}>
                        <Text style={s.gradeLabel}>Grade:</Text>
                        <View style={s.starsDisplay}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              name={
                                star <= submission.grade!
                                  ? "star"
                                  : "star-border"
                              }
                              size={16}
                              color={
                                star <= submission.grade!
                                  ? "#FBBF24"
                                  : mutedIconColor
                              }
                            />
                          ))}
                        </View>
                      </View>
                    ) : (
                      <Text style={s.pendingGrade}>Pending Grade</Text>
                    )}
                  </View>
                  <View style={s.gradeAction}>
                    <Text style={s.gradeActionText}>
                      {submission.grade ? "Update Grade" : "Grade"}
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Students Section */}
        <View style={s.glassCard}>
          <Text style={s.sectionTitle}>
            Assigned Students ({assignment.students.length})
          </Text>
          {assignment.students.map((student) => {
            const hasSubmitted = assignment.submissions.some(
              (sub) => sub.student.id === student.id,
            );
            return (
              <View key={student.id} style={s.studentRow}>
                <View style={s.studentInfo}>
                  <Text style={s.studentName}>{student.name}</Text>
                  <Text numberOfLines={1} style={s.studentEmail}>
                    {student.email}
                  </Text>
                </View>
                <View
                  style={[
                    s.studentBadge,
                    hasSubmitted ? s.statusBadgeSuccess : s.statusBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      s.statusBadgeLabel,
                      hasSubmitted
                        ? s.statusBadgeLabelSuccess
                        : s.statusBadgeLabelPending,
                    ]}
                  >
                    {hasSubmitted ? "Submitted" : "Pending"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Student Actions */}
        {user?.role === "student" && (
          <View style={s.glassCard}>
            <Text style={s.sectionTitle}>Your Actions</Text>
            <TouchableOpacity
              style={s.submitButton}
              onPress={handleSubmitAssignment}
              disabled={submitting}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={colors.primaryText} size="small" />
              ) : (
                <Text style={s.submitButtonText}>Submit Assignment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Assignment Info */}
        {/* <View style={s.glassCard}>
          <Text style={s.sectionTitle}>Assignment Information</Text>
          <View style={s.infoItem}>
            <Text style={s.infoLabel}>Assignment ID</Text>
            <Text style={s.infoValue}>{assignment.id}</Text>
          </View>
          <View style={s.infoItem}>
            <Text style={s.infoLabel}>Class</Text>
            <Text style={s.infoValue}>{assignment.classId.name}</Text>
          </View>
          <View style={s.infoItem}>
            <Text style={s.infoLabel}>Teacher</Text>
            <Text style={s.infoValue}>{assignment.teacherId.name}</Text>
          </View>
          <View style={s.infoItem}>
            <Text style={s.infoLabel}>Created By</Text>
            <Text style={s.infoValue}>{assignment.createdBy.name}</Text>
          </View>
          <View style={s.infoItem}>
            <Text style={s.infoLabel}>Total Students</Text>
            <Text style={s.infoValue}>{assignment.students.length}</Text>
          </View>
          <View style={[s.infoItem, s.infoItemLast]}>
            <Text style={s.infoLabel}>Submissions</Text>
            <Text style={s.infoValue}>
              {assignment.submissions.length} / {assignment.students.length}
            </Text>
          </View>
        </View> */}
      </ScrollView>

      {/* Submission Detail Modal */}
      <SubmissionDetailModal
        visible={submissionModalVisible}
        submission={selectedSubmission}
        assignmentId={assignment.id}
        onClose={handleCloseSubmissionModal}
        onGradeSubmitted={handleGradeSubmitted}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 28,
    },
    centeredState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerIconButton: {
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
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(239, 68, 68, 0.14)"
        : "rgba(239, 68, 68, 0.08)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(220, 38, 38, 0.3)",
    },
    deleteButtonText: {
      color: isDark ? "#FCA5A5" : "#DC2626",
      fontWeight: "700",
      fontSize: 13,
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
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    statusIconWell: {
      width: 52,
      height: 52,
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
      marginRight: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.35,
      lineHeight: 26,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    metaLine: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
      color: isDark ? "#CBD5E1" : "#64748B",
      textTransform: "uppercase",
    },
    dueRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    dueIcon: {
      marginRight: 6,
    },
    dueLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      alignSelf: "flex-start",
    },
    statusBadgeSuccess: {
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
      borderColor: isDark
        ? "rgba(94, 234, 212, 0.35)"
        : "rgba(45, 212, 191, 0.3)",
    },
    statusBadgePending: {
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.38)"
        : "rgba(109, 40, 217, 0.24)",
    },
    statusBadgeOverdue: {
      backgroundColor: isDark
        ? "rgba(251, 146, 60, 0.12)"
        : "rgba(251, 146, 60, 0.1)",
      borderColor: isDark
        ? "rgba(251, 146, 60, 0.5)"
        : "rgba(234, 88, 12, 0.4)",
    },
    statusBadgeLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    statusBadgeLabelSuccess: {
      color: isDark ? "rgba(94, 234, 212, 0.98)" : "rgba(13, 148, 136, 0.96)",
    },
    statusBadgeLabelPending: {
      color: isDark ? "#DDD6FE" : "#6D28D9",
    },
    statusBadgeLabelOverdue: {
      color: isDark ? "#FBBF24" : "#D97706",
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 12,
    },
    description: {
      fontSize: 14,
      fontWeight: "500",
      color: isDark ? "#CBD5E1" : "#475569",
      lineHeight: 21,
    },
    attachmentRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 8,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
    },
    attachmentIconWell: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
    },
    attachmentName: {
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#E2E8F0" : "#334155",
      marginRight: 8,
    },
    submissionCard: {
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
    },
    submissionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    submissionStudentName: {
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    submissionDate: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    submissionFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    gradeStatus: {
      flex: 1,
    },
    gradeInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    gradeLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      marginRight: 8,
    },
    starsDisplay: {
      flexDirection: "row",
    },
    pendingGrade: {
      fontSize: 12,
      fontWeight: "600",
      fontStyle: "italic",
      color: isDark ? "#FBBF24" : "#D97706",
    },
    gradeAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    gradeActionText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary,
      marginRight: 2,
    },
    studentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      marginBottom: 8,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.2)",
    },
    studentInfo: {
      flex: 1,
      minWidth: 0,
      marginRight: 10,
    },
    studentName: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 2,
    },
    studentEmail: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    studentBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },
    submitButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    infoItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    infoItemLast: {
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
  });

export default AssignmentDetail;
