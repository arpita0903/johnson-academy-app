import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { AssignmentCardProps } from "../../types/assignment";

type TeacherAssignmentStatus = "graded" | "submitted" | "assigned" | "overdue";

const STATUS_LABELS: Record<TeacherAssignmentStatus, string> = {
  graded: "Graded",
  submitted: "Submitted",
  assigned: "Assigned",
  overdue: "Overdue",
};

const STATUS_ICONS: Record<TeacherAssignmentStatus, string> = {
  graded: "grade",
  submitted: "check-circle",
  assigned: "timelapse",
  overdue: "warning-amber",
};

const TeacherAssignmentCard = ({
  assignment,
  onPress,
}: AssignmentCardProps) => {
  const { colors, isDark } = useTheme();
  const dynamicStyles = createStyles(colors, isDark);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSubmissionStats = () => {
    const totalStudents = assignment.students?.length || 0;
    const submittedCount = assignment.submissions?.length || 0;
    const gradedCount =
      assignment.submissions?.filter(
        (submission) => submission.grade !== undefined
      ).length || 0;

    return {
      total: totalStudents,
      submitted: submittedCount,
      graded: gradedCount,
      pending: Math.max(0, totalStudents - submittedCount),
    };
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const resolveStatus = (): TeacherAssignmentStatus => {
    if (assignment.status === "graded") return "graded";
    if (assignment.status === "submitted") return "submitted";
    if (assignment.status === "overdue" || isOverdue(assignment.dueDate)) {
      return "overdue";
    }
    return "assigned";
  };

  const status = resolveStatus();
  const stats = getSubmissionStats();
  const overdue = status === "overdue";

  const statusIconColor = {
    graded: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    submitted: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    assigned: isDark ? "rgba(196, 181, 253, 0.98)" : "rgba(109, 40, 217, 0.9)",
    overdue: isDark ? "#FBBF24" : "#D97706",
  }[status];

  const statusWellStyle = [
    dynamicStyles.statusIconWell,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusWellSuccess,
    status === "assigned" && dynamicStyles.statusWellPending,
    status === "overdue" && dynamicStyles.statusWellOverdue,
  ];

  const statusBadgeStyle = [
    dynamicStyles.statusBadge,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusBadgeSuccess,
    status === "assigned" && dynamicStyles.statusBadgePending,
    status === "overdue" && dynamicStyles.statusBadgeOverdue,
  ];

  const statusBadgeLabelStyle = [
    dynamicStyles.statusBadgeLabel,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusBadgeLabelSuccess,
    status === "assigned" && dynamicStyles.statusBadgeLabelPending,
    status === "overdue" && dynamicStyles.statusBadgeLabelOverdue,
  ];

  return (
    <TouchableOpacity
      style={dynamicStyles.cardTouchable}
      onPress={() => onPress(assignment)}
      activeOpacity={0.82}
      accessibilityRole="button"
    >
      <View style={dynamicStyles.glassCard}>
        <View style={dynamicStyles.cardRow}>
          <View style={statusWellStyle}>
            <Icon name={STATUS_ICONS[status]} size={26} color={statusIconColor} />
          </View>
          <View style={dynamicStyles.cardTextBlock}>
            <Text numberOfLines={2} style={dynamicStyles.cardTitle}>
              {assignment.title}
            </Text>
            <Text numberOfLines={1} style={dynamicStyles.cardMetaLine}>
              {assignment.classId.name}
            </Text>
            <View style={dynamicStyles.dueRow}>
              <Icon
                name="event"
                size={14}
                color={
                  overdue
                    ? colors.error
                    : isDark
                      ? "#CBD5E1"
                      : "#64748B"
                }
                style={dynamicStyles.dueIcon}
              />
              <Text
                style={[
                  dynamicStyles.dueLabel,
                  overdue && { color: colors.error },
                ]}
              >
                Due {formatDate(assignment.dueDate)}
              </Text>
            </View>
          </View>
          <View style={dynamicStyles.cardTrail}>
            <View style={statusBadgeStyle}>
              <Text style={statusBadgeLabelStyle}>{STATUS_LABELS[status]}</Text>
            </View>
            <Icon
              name="chevron-right"
              size={26}
              color={
                isDark
                  ? "rgba(148, 163, 184, 0.75)"
                  : "rgba(100, 116, 139, 0.85)"
              }
            />
          </View>
        </View>

        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statItem}>
            <View style={[dynamicStyles.statPill, dynamicStyles.statPillSubmitted]}>
              <Text style={[dynamicStyles.statNumber, dynamicStyles.statNumberSubmitted]}>
                {stats.submitted}
              </Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Submitted</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <View style={[dynamicStyles.statPill, dynamicStyles.statPillGraded]}>
              <Text style={[dynamicStyles.statNumber, dynamicStyles.statNumberGraded]}>
                {stats.graded}
              </Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Graded</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <View style={[dynamicStyles.statPill, dynamicStyles.statPillPending]}>
              <Text style={[dynamicStyles.statNumber, dynamicStyles.statNumberPending]}>
                {stats.pending}
              </Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Pending</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <View style={[dynamicStyles.statPill, dynamicStyles.statPillTotal]}>
              <Text style={[dynamicStyles.statNumber, dynamicStyles.statNumberTotal]}>
                {stats.total}
              </Text>
            </View>
            <Text style={dynamicStyles.statLabel}>Total</Text>
          </View>
        </View>

        {assignment.attachments && assignment.attachments.length > 0 && (
          <View style={dynamicStyles.attachmentsRow}>
            <Icon
              name="attach-file"
              size={14}
              color={isDark ? "#94A3B8" : "#64748B"}
              style={dynamicStyles.attachmentsIcon}
            />
            <Text style={dynamicStyles.attachmentsText}>
              {assignment.attachments.length} attachment
              {assignment.attachments.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    cardTouchable: {
      marginBottom: 14,
    },
    glassCard: {
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    },
    statusWellSuccess: {
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
    },
    statusWellPending: {
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
    },
    statusWellOverdue: {
      backgroundColor: isDark
        ? "rgba(251, 146, 60, 0.12)"
        : "rgba(251, 146, 60, 0.1)",
      borderColor: isDark
        ? "rgba(251, 146, 60, 0.5)"
        : "rgba(234, 88, 12, 0.4)",
    },
    cardTextBlock: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    cardTitle: {
      fontWeight: "800",
      fontSize: 16,
      letterSpacing: -0.3,
      lineHeight: 21,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    cardMetaLine: {
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
      marginTop: 8,
    },
    dueIcon: {
      marginRight: 4,
    },
    dueLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    cardTrail: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
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
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statPill: {
      minWidth: 40,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 6,
    },
    statPillSubmitted: {
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
    },
    statPillGraded: {
      backgroundColor: isDark
        ? "rgba(34, 197, 94, 0.16)"
        : "rgba(34, 197, 94, 0.12)",
    },
    statPillPending: {
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
    },
    statPillTotal: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
    },
    statNumber: {
      fontSize: 16,
      fontWeight: "800",
    },
    statNumberSubmitted: {
      color: isDark ? "rgba(94, 234, 212, 0.98)" : "rgba(13, 148, 136, 0.96)",
    },
    statNumberGraded: {
      color: isDark ? "#86EFAC" : "#16A34A",
    },
    statNumberPending: {
      color: isDark ? "#DDD6FE" : "#6D28D9",
    },
    statNumberTotal: {
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    statLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    attachmentsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.2)",
    },
    attachmentsIcon: {
      marginRight: 6,
    },
    attachmentsText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
  });

export default TeacherAssignmentCard;
