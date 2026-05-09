import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { Assignment } from "../../types/assignment";
import { getAssignmentsByStudent } from "../../services/assignment";
import AssignmentCard from "./AssignmentCard";

interface AssignmentSectionProps {
  navigation: any;
  studentId?: string;
}

const AssignmentSection = ({
  navigation,
  studentId,
}: AssignmentSectionProps) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAssignmentsByStudent(studentId);
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [studentId]);

  // Function to refresh assignments data
  const handleSubmissionSuccess = () => {
    fetchAssignments();
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    // Navigate to student assignment detail screen with refresh callback
    navigation.navigate("StudentAssignmentDetail", {
      assignment,
      onSubmissionSuccess: handleSubmissionSuccess,
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading assignments...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>{error}</Text>
        </View>
      );
    }

    if (assignments.length === 0) {
      return (
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>
            🎉 No assignments right now!
          </Text>
          <Text style={dynamicStyles.emptySubtext}>
            No tasks for now. Time to jam with your favorite tunes!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollContent}
        style={dynamicStyles.scrollView}
      >
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onPress={handleAssignmentPress}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <>
      <View style={dynamicStyles.sectionHeader}>
        <Text style={dynamicStyles.sectionTitle}>Assignments</Text>
        {assignments.length > 0 && (
          <Text style={dynamicStyles.assignmentCount}>
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      <View style={dynamicStyles.assignmentContainer}>{renderContent()}</View>
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    assignmentCount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    assignmentContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 200,
    },
    scrollView: {
      flexGrow: 0,
    },
    scrollContent: {
      padding: 16,
      paddingRight: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

export default AssignmentSection;
