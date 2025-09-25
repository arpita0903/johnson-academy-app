import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAppContext } from "../context/AppContext";
import { ThemeColors } from "../theme/colors";
import { getProgressFromStudentIdClassId } from "../services/student";
import { Module } from "../types/studentProgress";

type RootStackParamList = {
  Detail: { item: any };
  TeacherCourseDetail: { item: any };
  ModuleDetail: { progressId: string; selectedModule: any };
};

const getStatusIcon = (status: string, colors: ThemeColors) => {
  switch (status) {
    case "completed":
      return (
        <Icon
          name="check-circle"
          size={24}
          color={colors.success}
          style={{ marginRight: 8 }}
        />
      );
    case "inprogress":
      return (
        <Icon
          name="timelapse"
          size={24}
          color={colors.primary}
          style={{ marginRight: 8 }}
        />
      );
    case "upcoming":
    default:
      return (
        <Icon
          name="radio-button-unchecked"
          size={24}
          color={colors.textMuted}
          style={{ marginRight: 8 }}
        />
      );
  }
};

const CourseDetails = ({
  route,
}: {
  route: { params: { studentClass: string; student?: any; batch?: any } };
}) => {
  const { studentClass = {}, student = {}, batch = {} } = route.params;
  const { colors } = useTheme();
  const { role } = useAppContext();

  // Memoize the extracted IDs to prevent infinite re-renders
  const { studentId, classId } = useMemo(() => {
    let extractedStudentId: string | null = null;
    let extractedClassId: string | null = null;

    // Handle both scenarios: teacher view (student + batch) or student view (studentClass)
    if (student?.id && batch?.id) {
      // From teacher view - use student.id and batch.id
      extractedStudentId = student.id;
      extractedClassId = batch.id;
    } else if (studentClass) {
      // From student view - extract from studentClass
      const { id, students } = studentClass as any;
      extractedStudentId = students?.id;
      extractedClassId = id;
    }

    return { studentId: extractedStudentId, classId: extractedClassId };
  }, [student?.id, batch?.id, studentClass]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<
    "theory" | "technical" | "repertoire" | "others"
  >("theory");
  const [progressId, setProgressId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredModules, setFilteredModules] = useState({
    theory: [] as Module[],
    technical: [] as Module[],
    repertoire: [] as Module[],
    others: [] as Module[],
  });

  const handleDetailsNavigation = (item: any) => {
    // Navigate to the new ModuleDetail screen with progressId and selected module
    // navigation.navigate("Detail", { item });
    navigation.navigate("ModuleDetail", {
      progressId: progressId,
      selectedModule: item,
    });
  };

  useEffect(() => {
    const fetchStudentProgress = async () => {
      // Guard clause to prevent API calls without valid IDs
      if (!studentId || !classId) {
        console.log("No valid student or class IDs available yet");
        setLoading(false);
        return;
      }

      try {
        const progressData: any = await getProgressFromStudentIdClassId(
          studentId,
          classId
        );

        setProgressId(progressData.id);
        if (progressData?.syllabusProgress?.[0]?.modules) {
          const modules = progressData.syllabusProgress[0].modules;

          // Filter out any modules with invalid or missing moduleId
          const validModules = modules.filter(
            (m: any) => m && m.moduleId && m.moduleId.type
          );

          setFilteredModules({
            theory: validModules.filter(
              (m: any) => m.moduleId.type === "theory"
            ),
            technical: validModules.filter(
              (m: any) => m.moduleId.type === "technical"
            ),
            repertoire: validModules.filter(
              (m: any) => m.moduleId.type === "learning"
            ),
            others: validModules.filter(
              (m: any) => m.moduleId.type === "others"
            ),
          });
        } else {
          // Set empty arrays if no modules data
          setFilteredModules({
            theory: [],
            technical: [],
            repertoire: [],
            others: [],
          });
        }
      } catch (error) {
        console.error("Error fetching student progress:", error);
      }
      setLoading(false);
    };

    fetchStudentProgress();
  }, [studentId, classId]);

  const onRefresh = async () => {
    // Guard clause to prevent API calls without valid IDs
    if (!studentId || !classId) {
      console.log("No valid student or class IDs available for refresh");
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const progressData: any = await getProgressFromStudentIdClassId(
        studentId,
        classId
      );

      if (progressData?.syllabusProgress?.[0]?.modules) {
        const modules = progressData.syllabusProgress[0].modules;

        setFilteredModules({
          theory: modules.filter((m: any) => m?.moduleId?.type === "theory"),
          technical: modules.filter(
            (m: any) => m?.moduleId?.type === "technical"
          ),
          repertoire: modules.filter(
            (m: any) => m?.moduleId?.type === "learning"
          ),
          others: modules.filter((m: any) => m?.moduleId?.type === "others"),
        });
      }
    } catch (error) {
      console.error("Error refreshing student progress:", error);
    }
    setRefreshing(false);
  };

  const dynamicStyles = createStyles(colors);

  const renderModules = (modules: Module[], emptyText: string) => {
    if (modules.length === 0) {
      return (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyStateText}>{emptyText}</Text>
        </View>
      );
    }
    return modules.map((module) => {
      const isUpcoming = module.status === "upcoming";
      const shouldDisable = isUpcoming && role === "student";

      return (
        <TouchableOpacity
          key={module.moduleId.id}
          onPress={() => !shouldDisable && handleDetailsNavigation(module)}
          disabled={shouldDisable}
          style={shouldDisable ? dynamicStyles.disabledTouchable : undefined}
        >
          <Card
            style={[
              dynamicStyles.card,
              shouldDisable && dynamicStyles.disabledCard,
            ]}
          >
            <Card.Title
              title={
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {getStatusIcon(module.status, colors)}
                  <Text
                    style={[
                      dynamicStyles.cardText,
                      shouldDisable && dynamicStyles.disabledText,
                    ]}
                  >
                    {module.moduleId.title}
                  </Text>
                </View>
              }
              subtitle={`Session ${module.moduleId.session}`}
              subtitleStyle={[
                dynamicStyles.cardSubtitle,
                shouldDisable && dynamicStyles.disabledSubtitle,
              ]}
            />
          </Card>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={dynamicStyles.container}>
      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>
            Loading course details...
          </Text>
        </View>
      ) : filteredModules.theory.length === 0 &&
        filteredModules.technical.length === 0 &&
        filteredModules.repertoire.length === 0 &&
        filteredModules.others.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyStateText}>No modules available</Text>
        </View>
      ) : (
        <>
          {/* Custom Tabs */}
          <View style={dynamicStyles.tabBar}>
            {["theory", "technical", "repertoire", "others"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  dynamicStyles.tabItem,
                  activeTab === tab && dynamicStyles.activeTab,
                ]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text
                  style={[
                    dynamicStyles.tabText,
                    activeTab === tab && dynamicStyles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <ScrollView
            style={dynamicStyles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor={colors.card}
              />
            }
          >
            {activeTab === "theory" &&
              renderModules(
                filteredModules.theory,
                "No theory modules available"
              )}
            {activeTab === "technical" &&
              renderModules(
                filteredModules.technical,
                "No technical modules available"
              )}
            {activeTab === "repertoire" &&
              renderModules(
                filteredModules.repertoire,
                "No learning modules available"
              )}
            {activeTab === "others" &&
              renderModules(
                filteredModules.others,
                "No other modules available"
              )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 16,
      alignItems: "center",
    },
    tabText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "500",
      opacity: 0.8,
    },
    activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: colors.primaryText,
    },
    activeTabText: {
      opacity: 1,
      fontWeight: "bold",
    },
    content: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    card: {
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    cardText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    cardSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
      backgroundColor: colors.background,
    },
    emptyStateText: {
      fontSize: 18,
      color: colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: "500",
    },
    disabledTouchable: {
      opacity: 0.6,
    },
    disabledCard: {
      backgroundColor: colors.background,
      borderColor: colors.textMuted,
      opacity: 0.7,
    },
    disabledText: {
      color: colors.textMuted,
      opacity: 0.8,
    },
    disabledSubtitle: {
      color: colors.textMuted,
      opacity: 0.6,
    },
  });

export default CourseDetails;
