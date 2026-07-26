import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
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
  const { colors, isDark } = useTheme();
  const dynamicStyles = createStyles(colors, isDark);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getAssignmentsByStudent(studentId);
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    setLoading(true);
    fetchAssignments();
  }, [fetchAssignments]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const handleSubmissionSuccess = () => {
    fetchAssignments();
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    navigation.navigate("StudentAssignmentDetail", {
      assignment,
      onSubmissionSuccess: handleSubmissionSuccess,
    });
  };

  if (loading) {
    return (
      <View style={dynamicStyles.centeredState}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={dynamicStyles.scrollView}
      contentContainerStyle={dynamicStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressBackgroundColor={colors.card}
        />
      }
    >
      <View style={dynamicStyles.sectionHeader}>
        <Text style={dynamicStyles.sectionTitle}>Your Assignments</Text>
        {assignments.length > 0 && (
          <View style={dynamicStyles.countBadge}>
            <Text style={dynamicStyles.countBadgeLabel}>
              {assignments.length}
            </Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={dynamicStyles.stateCard}>
          <Icon name="error-outline" size={32} color={colors.error} />
          <Text style={dynamicStyles.errorText}>{error}</Text>
        </View>
      ) : assignments.length === 0 ? (
        <View style={dynamicStyles.stateCard}>
          <View style={dynamicStyles.emptyIconWell}>
            <Icon
              name="assignment-turned-in"
              size={28}
              color={
                isDark
                  ? "rgba(167, 139, 250, 0.95)"
                  : "rgba(109, 40, 217, 0.85)"
              }
            />
          </View>
          <Text style={dynamicStyles.emptyText}>No assignments right now</Text>
          <Text style={dynamicStyles.emptySubtext}>
            No tasks for now. Time to jam with your favorite tunes!
          </Text>
        </View>
      ) : (
        assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onPress={handleAssignmentPress}
          />
        ))
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginRight: 10,
    },
    countBadge: {
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.32)"
        : "rgba(109, 40, 217, 0.26)",
    },
    countBadgeLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: isDark ? "#DDD6FE" : "#5B21B6",
    },
    centeredState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    stateCard: {
      alignItems: "center",
      paddingVertical: 36,
      paddingHorizontal: 24,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    errorText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: "600",
      color: colors.error,
      textAlign: "center",
    },
    emptyIconWell: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.08)"
        : "rgba(45, 212, 191, 0.08)",
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 6,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 19,
    },
  });

export default AssignmentSection;
