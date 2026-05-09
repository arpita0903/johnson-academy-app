import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import TeacherAssignmentCard from "../../../shared/components/TeacherAssignmentCard";
import { useAssignmentsByClass } from "../../../shared/hooks/useAssignmentsByClass";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  fileUrl?: string;
  classId: string;
  teacherId: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

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
    const { colors } = useTheme();

    const {
      data: assignments = [],
      isLoading,
      isError,
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
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading assignments...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={[styles.container, styles.centered]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Failed to load assignments. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const renderEmptyComponent = () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No assignments found</Text>
        <Text style={styles.emptySubText}>
          Assignments will appear here once they are created.
        </Text>
      </View>
    );

    const renderHeader = () => (
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.heading, { color: colors.primary }]}>
            Assignments
          </Text>
          <Text style={[styles.batchName, { color: colors.textSecondary }]}>
            {batch.name}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={false}
          onRefresh={handleRefresh}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
  },
  batchName: {
    fontSize: 14,
    marginTop: 2,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default AssignmentList;
