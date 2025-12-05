import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getStudentClasses } from "../services/student";
import { getUserId } from "../services/auth";
import { ThemeColors } from "../theme/colors";
import { useTheme } from "../context/ThemeContext";

interface StudentClass {
  name: string;
  courseId: {
    name: string;
    description: string;
    image: string;
    syllabus: string[];
    id: string;
  };
  studentProgressId: string;
  students: {
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    subjects: any[];
    isActive: boolean;
    classes: string[];
    courses: string[];
    progress: string[];
    id: string;
  };
  id: string;
}

interface InstrumentSectionProps {
  onInstrumentPress: (item: any) => void;
}

const InstrumentSection = ({ onInstrumentPress }: InstrumentSectionProps) => {
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  useEffect(() => {
    const fetchStudentClasses = async () => {
      try {
        setLoading(true);
        const userId = await getUserId();
        if (!userId) {
          setError("User not authenticated");
          return;
        }
        const data = await getStudentClasses(userId);
        setStudentClasses(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch classes");
        console.error("Error in InstrumentSection:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, []);

  if (loading) {
    return (
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.primaryText}>My Classes</Text>
          {/* <Text style={dynamicStyles.seeAll}>See all</Text> */}
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a1dc2" />
          <Text style={dynamicStyles.loadingText}>Loading your classes...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.primaryText}>My Classes</Text>
          {/* <Text style={styles.seeAll}>See all</Text> */}
        </View>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (studentClasses.length === 0) {
    return (
      // give border radius and background color to the empty container
      // add gray background color to the empty container
      <View style={dynamicStyles.emptyContainer}>
        <Text style={dynamicStyles.emptyText}>🎉 No classes found!</Text>
        <Text style={dynamicStyles.emptySubtext}>
          No classes found. Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.header}>
      <View style={dynamicStyles.sectionHeader}>
        <Text style={dynamicStyles.primaryText}>My Classes</Text>
        {/* <Text style={styles.seeAll}>See all</Text> */}
      </View>

      <FlatList
        data={studentClasses}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onInstrumentPress(item)}>
            <View style={dynamicStyles.instrumentCard}>
              <Image
                source={{ uri: item?.courseId?.image }}
                style={dynamicStyles.instrumentIcon}
              />
              <Text style={dynamicStyles.instrumentName}>{item.name}</Text>
              // ellipsis one line text
              <Text style={dynamicStyles.courseName} numberOfLines={1}>
                {item.courseId.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// const createStyles = (colors: ThemeColors) =>
//   StyleSheet.create({

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
    },
    primaryText: {
      color: "#FF7043",
      fontSize: 18,
      fontWeight: "600" as const,
    },
    seeAll: {
      color: "#FF7043",
      fontWeight: "600" as const,
    },
    instrumentCard: {
      backgroundColor: "#F8F9FA",
      borderRadius: 16,
      padding: 12,
      paddingBottom: 20,
      width: 180,
      marginRight: 12,
      alignItems: "center" as const,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: "#E9ECEF",
    },
    instrumentIcon: {
      width: 150,
      height: 150,
      marginBottom: 8,
      resizeMode: "contain" as const,
      borderRadius: 100,
    },
    instrumentName: {
      fontWeight: "bold" as const,
      fontSize: 20,
    },
    courseName: {
      fontSize: 14,
      color: "#666",
      textAlign: "center" as const,
      marginTop: 4,
    },
    loadingContainer: {
      alignItems: "center" as const,
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: "#666",
    },
    errorContainer: {
      alignItems: "center" as const,
      paddingVertical: 40,
    },
    errorText: {
      fontSize: 16,
      color: "#d32f2f",
      textAlign: "center" as const,
    },
    emptyContainer: {
      marginVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
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

export default InstrumentSection;
