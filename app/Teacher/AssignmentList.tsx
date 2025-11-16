import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAssignmentsByClass } from "../services/assignment";
import { useAppContext } from "../context/AppContext";
import TeacherAssignmentCard from "../components/TeacherAssignmentCard";

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
    const { user } = useAppContext();
    const { batch } = route.params;
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      fetchAssignments();
    }, [batch.id]);

    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use batch.id as classId for fetching assignments
        const classId = batch.id;

        const fetchedAssignments = await getAssignmentsByClass(classId);
        setAssignments(fetchedAssignments || []);
      } catch (err: any) {
        console.error("Error fetching assignments:", err);
        setError(err?.message || "Failed to fetch assignments");
        Alert.alert("Error", "Failed to load assignments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const handleRefresh = () => {
      fetchAssignments();
    };

    const handleAssignmentPress = (assignment: Assignment) => {
      // Navigate to assignment detail screen with assignment ID
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

    if (loading) {
      return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
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
          <Text style={styles.heading}>Assignments</Text>
          <Text style={styles.batchName}>{batch.name}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={styles.container}>
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
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
    color: "#ff6b35",
  },
  batchName: {
    fontSize: 14,
    color: "#cccccc",
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: "#ff6b35",
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
    color: "#ffffff",
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#ff6b35",
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
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    color: "#cccccc",
    fontSize: 14,
    textAlign: "center",
  },
});

export default AssignmentList;
