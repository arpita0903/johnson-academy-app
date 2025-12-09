import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { getClassesByTeacher, getTeacherById } from "../services/teacher";
import { useTeacherContext } from "../context/TeacherContext";

interface TeacherDashboardProps {
  navigation: any;
}

interface ClassData {
  id: string;
  name: string;
  teacherId: {
    name: string;
    email: string;
    role: string;
    id: string;
  };
  courseId: {
    name: string;
    description: string;
    image: string;
    id: string;
  };
  students: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

const TeacherDashboard = ({ navigation }: TeacherDashboardProps) => {
  const { user } = useAppContext();
  const { selectClass } = useTeacherContext();
  const { colors } = useTheme();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (user && user.id) {
          const classesData = await getClassesByTeacher(user.id);
          setClasses(classesData);
        }
      } catch (error) {
        console.error("Error fetching classes data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  const handleClassPress = (classItem: ClassData) => {
    navigation.navigate("StudentList", {
      batch: {
        id: classItem.id,
        name: classItem.name,
        students: classItem.students,
      },
    });
    selectClass(classItem);
  };

  const dynamicStyles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.header}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScrollView style={dynamicStyles.container}>
        <Text style={dynamicStyles.header}>
          Welcome, {user?.name || "Teacher"} 👋
        </Text>

        {classes.length === 0 ? (
          <View style={dynamicStyles.noClassesContainer}>
            <Text style={dynamicStyles.noClassesText}>No classes found</Text>
            <Text style={dynamicStyles.noClassesSubtext}>
              You haven't been assigned to any classes yet.
            </Text>
          </View>
        ) : (
          <View style={dynamicStyles.classesContainer}>
            <View style={dynamicStyles.summaryContainer}>
              <Text style={dynamicStyles.summaryTitle}>Dashboard Summary</Text>
              <View style={dynamicStyles.summaryStats}>
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statNumber}>{classes.length}</Text>
                  <Text style={dynamicStyles.statLabel}>Total Classes</Text>
                </View>
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statNumber}>
                    {classes.reduce(
                      (total, cls) => total + cls.students.length,
                      0
                    )}
                  </Text>
                  <Text style={dynamicStyles.statLabel}>Total Students</Text>
                </View>
              </View>
            </View>

            {classes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={dynamicStyles.classCard}
                onPress={() => handleClassPress(item)}
              >
                <View style={dynamicStyles.cardHeader}>
                  <View style={dynamicStyles.classInfo}>
                    <Text style={dynamicStyles.className}>{item.name}</Text>
                    <Text style={dynamicStyles.courseName}>
                      {item.courseId?.name}
                    </Text>
                  </View>
                  {item.courseId?.image && (
                    <View>
                      <Image
                        source={{ uri: item.courseId.image }}
                        style={dynamicStyles.courseImageContainer}
                      />
                    </View>
                  )}
                </View>

                <View style={dynamicStyles.cardFooter}>
                  <View style={dynamicStyles.studentInfo}>
                    <Text style={dynamicStyles.studentCount}>
                      {item.students.length} student
                      {item.students.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                  <View style={dynamicStyles.actionButton}>
                    <Text style={dynamicStyles.viewStudents}>
                      View Students →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 24,
      color: "#ffffff",
      textAlign: "center",
    },
    className: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 4,
      color: "#ffffff",
    },
    courseName: {
      fontSize: 14,
      color: "#ffffff",
      fontStyle: "italic",
      opacity: 0.9,
    },
    studentCount: {
      fontSize: 14,
      color: "#ffffff",
      opacity: 0.9,
    },
    viewStudents: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: 14,
    },
    noClassesContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      backgroundColor: "#2a2a2a",
      borderRadius: 15,
      margin: 16,
      borderWidth: 1,
      borderColor: "#404040",
    },
    noClassesText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 8,
    },
    noClassesSubtext: {
      fontSize: 16,
      color: "#ffffff",
      textAlign: "center",
      opacity: 0.9,
    },
    classesContainer: {
      // Container for all classes content
    },
    classCard: {
      backgroundColor: "#2a2a2a",
      width: "100%",
      padding: 18,
      borderRadius: 15,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#404040",
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
      borderLeftWidth: 5,
      borderLeftColor: colors.primary,
    },
    cardHeader: {
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    summaryContainer: {
      backgroundColor: "#2a2a2a",
      padding: 20,
      borderRadius: 15,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#404040",
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 20,
      textAlign: "center",
    },
    summaryStats: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
      backgroundColor: "#1e1e1e",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      minWidth: 120,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 6,
    },
    statLabel: {
      fontSize: 14,
      color: "#ffffff",
      textAlign: "center",
      fontWeight: "500",
      opacity: 0.9,
    },
    classInfo: {
      flex: 1,
      marginRight: 12,
    },
    courseImageContainer: {
      //contain the image
      objectFit: "contain",
      width: 56,
      height: 56,
      // backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      // borderWidth: 1,
      // borderColor: colors.border,
    },
    imagePlaceholder: {
      fontSize: 28,
    },
    courseDescription: {
      fontSize: 12,
      color: "#ffffff",
      marginTop: 4,
      lineHeight: 16,
      opacity: 0.9,
    },
    studentInfo: {
      flex: 1,
    },
    studentNames: {
      fontSize: 12,
      color: "#ffffff",
      marginTop: 2,
      fontStyle: "italic",
      opacity: 0.9,
    },
    actionButton: {
      alignItems: "flex-end",
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 0,
    },
  });

export default TeacherDashboard;
