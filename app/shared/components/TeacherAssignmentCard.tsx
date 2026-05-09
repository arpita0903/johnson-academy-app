import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { AssignmentCardProps } from "../../types/assignment";

const TeacherAssignmentCard = ({
  assignment,
  onPress,
}: AssignmentCardProps) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return colors.success || "#4CAF50";
      case "submitted":
        return colors.primary;
      case "assigned":
        return colors.warning || "#FF9800";
      case "overdue":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "graded":
        return "Graded";
      case "submitted":
        return "Submitted";
      case "assigned":
        return "Assigned";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

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

  const stats = getSubmissionStats();

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={() => onPress(assignment)}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.cardContent}>
        {/* Header Row */}
        <View style={dynamicStyles.headerRow}>
          <Text style={dynamicStyles.title} numberOfLines={2}>
            {assignment.title}
          </Text>
          <View
            style={[
              dynamicStyles.statusBadge,
              { backgroundColor: getStatusColor(assignment.status) },
            ]}
          >
            <Text style={dynamicStyles.statusText}>
              {getStatusText(assignment.status)}
            </Text>
          </View>
        </View>

        {/* Class and Due Date Row */}
        <View style={dynamicStyles.infoRow}>
          <Text style={dynamicStyles.className}>{assignment.classId.name}</Text>
          <Text
            style={[
              dynamicStyles.dueDate,
              {
                color: isOverdue(assignment.dueDate)
                  ? colors.error
                  : colors.textSecondary,
              },
            ]}
          >
            Due: {formatDate(assignment.dueDate)}
          </Text>
        </View>

        {/* Submission Stats */}
        <View style={dynamicStyles.statsContainer}>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statNumber}>{stats.submitted}</Text>
            <Text style={dynamicStyles.statLabel}>Submitted</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statNumber}>{stats.graded}</Text>
            <Text style={dynamicStyles.statLabel}>Graded</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statNumber}>{stats.pending}</Text>
            <Text style={dynamicStyles.statLabel}>Pending</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statNumber}>{stats.total}</Text>
            <Text style={dynamicStyles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Attachments indicator */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <View style={dynamicStyles.attachmentsRow}>
            <Text style={dynamicStyles.attachmentsText}>
              📎 {assignment.attachments.length} attachment
              {assignment.attachments.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    cardContent: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      marginRight: 12,
      lineHeight: 24,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 80,
      alignItems: "center",
    },
    statusText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    className: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      flex: 1,
    },
    dueDate: {
      fontSize: 14,
      fontWeight: "500",
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      alignItems: "center",
      flex: 1,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    attachmentsRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    attachmentsText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
  });

export default TeacherAssignmentCard;
