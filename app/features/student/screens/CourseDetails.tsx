import React, { useMemo, useState } from "react";
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
import { useTheme } from "../../../context/ThemeContext";
import { useAppContext } from "../../../context/AppContext";
import { ThemeColors } from "../../../theme/colors";
import { Module } from "../../../types/studentProgress";
import { useStudentProgress } from "../../../shared/hooks/useStudentProgress";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";

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

function filterModulesByType(modules: Module[]): {
  theory: Module[];
  technical: Module[];
  repertoire: Module[];
  others: Module[];
} {
  const validModules = modules.filter(
    (m) => m && m.moduleId && m.moduleId.type,
  );
  return {
    theory: validModules.filter((m) => m.moduleId.type === "theory"),
    technical: validModules.filter((m) => m.moduleId.type === "technical"),
    repertoire: validModules.filter((m) => m.moduleId.type === "learning"),
    others: validModules.filter((m) => m.moduleId.type === "others"),
  };
}

const CourseDetails = ({
  route,
}: {
  route: { params: { studentClass: string; student?: any; batch?: any } };
}) => {
  const { studentClass = {}, student = {}, batch = {} } = route.params;
  const { colors } = useTheme();
  const { role } = useAppContext();

  const { studentId, classId } = useMemo(() => {
    let extractedStudentId: string | null = null;
    let extractedClassId: string | null = null;

    if (student?.id && batch?.id) {
      extractedStudentId = student.id;
      extractedClassId = batch.id;
    } else if (studentClass) {
      const { id, students } = studentClass as any;
      extractedStudentId = students?.id;
      extractedClassId = id;
    }

    return { studentId: extractedStudentId, classId: extractedClassId };
  }, [student?.id, batch?.id, studentClass]);

  const {
    data: progressData,
    isLoading,
    isRefetching,
    refetch,
  } = useStudentProgress(studentId, classId);
  useRefreshOnFocus();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<
    "theory" | "technical" | "repertoire" | "others"
  >("theory");

  const filteredModules = useMemo(() => {
    const modules = (progressData as any)?.syllabusProgress?.[0]?.modules ?? [];
    return filterModulesByType(modules);
  }, [progressData]);

  const progressId = (progressData as any)?.id ?? "";

  const handleDetailsNavigation = (item: Module) => {
    navigation.navigate("ModuleDetail", {
      progressId,
      selectedModule: item,
    });
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
      const shouldDisable = isUpcoming && role !== "teacher";

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

  const hasAnyModules =
    filteredModules.theory.length > 0 ||
    filteredModules.technical.length > 0 ||
    filteredModules.repertoire.length > 0 ||
    filteredModules.others.length > 0;

  return (
    <View style={dynamicStyles.container}>
      {isLoading ? (
        <View style={dynamicStyles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>
            Loading course details...
          </Text>
        </View>
      ) : !hasAnyModules ? (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyStateText}>No modules available</Text>
        </View>
      ) : (
        <>
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

          <ScrollView
            style={dynamicStyles.content}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => refetch()}
                colors={[colors.primary]}
                tintColor={colors.primary}
                progressBackgroundColor={colors.card}
              />
            }
          >
            {activeTab === "theory" &&
              renderModules(
                filteredModules.theory,
                "No theory modules available",
              )}
            {activeTab === "technical" &&
              renderModules(
                filteredModules.technical,
                "No technical modules available",
              )}
            {activeTab === "repertoire" &&
              renderModules(
                filteredModules.repertoire,
                "No learning modules available",
              )}
            {activeTab === "others" &&
              renderModules(
                filteredModules.others,
                "No other modules available",
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
