import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAppContext } from "../context/AppContext";
import { ThemeColors } from "../theme/colors";
import { Assignment, AssignmentCardProps } from "../types/assignment";

const AssignmentCard = ({ assignment, onPress }: AssignmentCardProps) => {
  const { colors } = useTheme();
  const { userId } = useAppContext();
  const dynamicStyles = createStyles(colors);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return colors.success || "#4CAF50";
      case "pending":
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
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      case "graded":
        return "Graded";
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

  const getAssignmentStatus = (assignment: Assignment) => {
    // Check if current user has submitted this assignment

    if (assignment.status === "submitted") {
      return "submitted";
    }

    // If not submitted, check if it's overdue
    const isOverdue = new Date(assignment.dueDate) < new Date();
    return isOverdue ? "overdue" : "pending";
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const currentStatus = getAssignmentStatus(assignment);

  return (
    <TouchableOpacity
      style={dynamicStyles.card}
      onPress={() => onPress(assignment)}
      activeOpacity={0.7}
    >
      <View style={dynamicStyles.cardContent}>
        <View style={dynamicStyles.headerRow}>
          <Text style={dynamicStyles.title} numberOfLines={2}>
            {assignment.title}
          </Text>
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

        <View style={dynamicStyles.infoRow}>
          <Text style={dynamicStyles.className}>
            {assignment.classId?.name || "Unknown Class"}
          </Text>
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
            {formatDate(assignment.dueDate)}
          </Text>
        </View>
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
      marginRight: 16,
      width: 260,
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
      marginBottom: 16,
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
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
  });

export default AssignmentCard;
