import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { Assignment, AssignmentCardProps } from "../../types/assignment";

type AssignmentStatus = "submitted" | "pending" | "overdue" | "graded";

const STATUS_LABELS: Record<AssignmentStatus, string> = {
  submitted: "Submitted",
  pending: "Pending",
  overdue: "Overdue",
  graded: "Graded",
};

const STATUS_ICONS: Record<AssignmentStatus, string> = {
  submitted: "check-circle",
  pending: "timelapse",
  overdue: "warning-amber",
  graded: "grade",
};

const getAssignmentStatus = (assignment: Assignment): AssignmentStatus => {
  if (assignment.status === "graded") {
    return "graded";
  }
  if (assignment.status === "submitted") {
    return "submitted";
  }
  const isOverdue = new Date(assignment.dueDate) < new Date();
  return isOverdue ? "overdue" : "pending";
};

const AssignmentCard = ({ assignment, onPress }: AssignmentCardProps) => {
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

  const status = getAssignmentStatus(assignment);

  const statusIconColor = {
    submitted: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    graded: isDark ? "rgba(94, 234, 212, 0.95)" : "rgba(13, 148, 136, 0.95)",
    pending: isDark ? "rgba(196, 181, 253, 0.98)" : "rgba(109, 40, 217, 0.9)",
    overdue: isDark ? "#FBBF24" : "#D97706",
  }[status];

  const statusWellStyle = [
    dynamicStyles.statusIconWell,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusWellSuccess,
    status === "pending" && dynamicStyles.statusWellPending,
    status === "overdue" && dynamicStyles.statusWellOverdue,
  ];

  const statusBadgeStyle = [
    dynamicStyles.statusBadge,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusBadgeSuccess,
    status === "pending" && dynamicStyles.statusBadgePending,
    status === "overdue" && dynamicStyles.statusBadgeOverdue,
  ];

  const statusBadgeLabelStyle = [
    dynamicStyles.statusBadgeLabel,
    (status === "submitted" || status === "graded") &&
      dynamicStyles.statusBadgeLabelSuccess,
    status === "pending" && dynamicStyles.statusBadgeLabelPending,
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
              {assignment.classId?.name || "Unknown Class"}
            </Text>
            <View style={dynamicStyles.dueRow}>
              <Icon
                name="event"
                size={14}
                color={
                  status === "overdue"
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
                  status === "overdue" && { color: colors.error },
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
  });

export default AssignmentCard;
