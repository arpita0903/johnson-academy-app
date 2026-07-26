import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import TeacherAssignmentCard from "../../../shared/components/TeacherAssignmentCard";
import { useAssignmentsByClass } from "../../../shared/hooks/useAssignmentsByClass";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { Assignment } from "../../../types/assignment";

interface Batch {
  id: string;
  name: string;
  students?: any[];
}

interface AssignmentListProps {
  route: {
    params: {
      batch: Batch;
    };
  };
  navigation: any;
}

const AssignmentList = React.memo<AssignmentListProps>(
  ({ route, navigation }) => {
    const { batch } = route.params;
    const { colors, isDark } = useTheme();
    const s = createStyles(colors, isDark);

    const {
      data: assignments = [],
      isLoading,
      isError,
      isFetching,
      refetch,
    } = useAssignmentsByClass(batch.id);
    useRefreshOnFocus();

    const handleRefresh = () => refetch();

    const handleAssignmentPress = (assignment: Assignment) => {
      navigation.navigate("AssignmentDetail", {
        assignmentId: assignment.id,
        assignment: assignment,
      });
    };

    const renderAssignment = ({ item }: { item: Assignment }) => (
      <TeacherAssignmentCard
        assignment={item}
        onPress={handleAssignmentPress}
      />
    );

    const keyExtractor = (item: Assignment) => item.id;

    if (isLoading) {
      return (
        <SafeAreaView style={s.safeArea} edges={["top"]}>
          <ScreenGradientBackground isDark={isDark} />
          <View style={s.centeredState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>Loading assignments...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (isError) {
      return (
        <SafeAreaView style={s.safeArea} edges={["top"]}>
          <ScreenGradientBackground isDark={isDark} />
          <View style={s.centeredState}>
            <View style={s.stateCard}>
              <Icon name="error-outline" size={36} color={colors.error} />
              <Text style={s.errorText}>
                Failed to load assignments. Please try again.
              </Text>
              <TouchableOpacity
                style={s.retryButton}
                onPress={handleRefresh}
                activeOpacity={0.82}
              >
                <Text style={s.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    const renderEmptyComponent = () => (
      <View style={s.stateCard}>
        <View style={s.emptyIconWell}>
          <Icon
            name="assignment"
            size={28}
            color={
              isDark
                ? "rgba(167, 139, 250, 0.95)"
                : "rgba(109, 40, 217, 0.85)"
            }
          />
        </View>
        <Text style={s.emptyText}>No assignments found</Text>
        <Text style={s.emptySubText}>
          Assignments will appear here once they are created.
        </Text>
      </View>
    );

    const renderHeader = () => (
      <View style={s.heroOuter}>
        <LinearGradient
          colors={
            !isDark
              ? ["rgba(94, 234, 212, 0.14)", "rgba(167, 139, 250, 0.16)"]
              : ["rgba(45, 212, 191, 0.14)", "rgba(167, 139, 250, 0.12)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroGradientFill}
        >
          <View style={s.heroInner}>
            <View style={s.heroTopRow}>
              <View style={s.heroIconWell}>
                <Icon
                  name="assignment"
                  size={28}
                  color={
                    isDark
                      ? "rgba(167, 139, 250, 0.95)"
                      : "rgba(109, 40, 217, 0.85)"
                  }
                />
              </View>
              <View style={s.heroTextBlock}>
                <Text style={s.heroTitle} numberOfLines={2}>
                  {batch.name}
                </Text>
                <View style={s.heroSubRow}>
                  <Icon
                    name="list-alt"
                    size={16}
                    color={
                      isDark
                        ? "rgba(148, 163, 184, 0.95)"
                        : "rgba(71, 85, 105, 0.9)"
                    }
                    style={s.heroSubIcon}
                  />
                  <Text style={s.heroSubtitle}>
                    {assignments.length}{" "}
                    {assignments.length === 1 ? "assignment" : "assignments"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );

    return (
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            assignments.length === 0 ? s.listContentEmpty : s.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
            />
          }
        />
      </SafeAreaView>
    );
  },
);

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
      paddingTop: 8,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 28,
    },
    listContentEmpty: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 4,
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
    heroOuter: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.18)"
        : "rgba(167, 139, 250, 0.22)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.85)"
        : "rgba(255, 255, 255, 0.88)",
    },
    heroGradientFill: {
      borderRadius: 19,
    },
    heroInner: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    heroIconWell: {
      width: 56,
      height: 56,
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
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    heroSubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    heroSubIcon: {
      marginRight: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
      flex: 1,
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
      marginBottom: 16,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    retryButtonText: {
      color: colors.primaryText,
      fontWeight: "700",
      fontSize: 15,
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
    emptySubText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 19,
    },
  });

export default AssignmentList;
