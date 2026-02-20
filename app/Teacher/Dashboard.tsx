import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { getTopLevelPrefixes } from "../utils/folderUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { getClassesByTeacher, getTeacherById } from "../services/teacher";
import { useTeacherContext } from "../context/TeacherContext";
import Icon from "react-native-vector-icons/Ionicons";

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
          console.log("classesData", JSON.stringify(classesData));
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

  const classNames = useMemo(() => classes.map((c) => c.name), [classes]);
  const prefixes = useMemo(() => getTopLevelPrefixes(classNames), [classNames]);

  const getClassCountByPrefix = (prefix: string) =>
    classes.filter(
      (c) => c.name === prefix || c.name.startsWith(`${prefix}/`)
    ).length;

  const handlePrefixPress = (prefix: string) => {
    navigation.navigate("FolderItems", {
      prefix,
      classes,
    });
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

        {prefixes.length === 0 ? (
          <View style={dynamicStyles.noClassesContainer}>
            <Text style={dynamicStyles.noClassesText}>No classes found</Text>
            <Text style={dynamicStyles.noClassesSubtext}>
              You haven't been assigned to any classes yet.
            </Text>
          </View>
        ) : (
          <View style={dynamicStyles.classesContainer}>
            <Text style={dynamicStyles.sectionTitle}>Browse by batch</Text>
            <FlatList
              data={prefixes}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item: prefix }) => {
                const count = getClassCountByPrefix(prefix);
                return (
                  <Pressable
                    style={({ pressed }) => [
                      dynamicStyles.prefixRow,
                      pressed && dynamicStyles.prefixRowPressed,
                    ]}
                    onPress={() => handlePrefixPress(prefix)}
                  >
                    <View style={dynamicStyles.prefixIconContainer}>
                      <Icon
                        name="folder-open"
                        size={26}
                        color={colors.primary}
                      />
                    </View>
                    <View style={dynamicStyles.prefixContent}>
                      <Text style={dynamicStyles.prefixLabel} numberOfLines={1}>
                        {prefix}
                      </Text>
                      <View style={dynamicStyles.prefixMetaRow}>
                        <View style={dynamicStyles.prefixBadge}>
                          <Text style={dynamicStyles.prefixBadgeText}>
                            {count} {count === 1 ? "class" : "classes"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={dynamicStyles.chevronContainer}>
                      <Icon
                        name="chevron-forward"
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 12,
    },
    classesContainer: {
      marginTop: 8,
    },
    prefixRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      marginBottom: 12,
      backgroundColor: "#252525",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.06)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    prefixRowPressed: {
      opacity: 0.88,
      backgroundColor: "#2a2a2a",
    },
    prefixIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: `${colors.primary}22`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    prefixContent: {
      flex: 1,
      minWidth: 0,
    },
    prefixLabel: {
      fontSize: 17,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    prefixMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    prefixBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    prefixBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.75)",
      letterSpacing: 0.2,
    },
    chevronContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
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
