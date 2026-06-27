import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";
import { useAppContext } from "../../../context/AppContext";
import { ThemeColors, loginButtonGradientColors } from "../../../theme/colors";
import { Module } from "../../../types/studentProgress";
import { useStudentProgress } from "../../../shared/hooks/useStudentProgress";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";

type RootStackParamList = {
  Detail: { item: any };
  TeacherCourseDetail: { item: any };
  ModuleDetail: { progressId: string; selectedModule: any };
};

const getStatusIcon = (
  status: string,
  colors: ThemeColors,
  options?: { studentLocked?: boolean; inWell?: boolean; isDark?: boolean },
) => {
  const iconWrap = options?.inWell
    ? undefined
    : { marginRight: 10, marginTop: 2 };
  const d = options?.isDark ?? false;

  switch (status) {
    case "completed":
      return (
        <Icon
          name="check-circle"
          size={options?.inWell ? 26 : 24}
          color={
            options?.inWell
              ? d
                ? "rgba(94, 234, 212, 0.95)"
                : "rgba(13, 148, 136, 0.95)"
              : colors.success
          }
          style={iconWrap}
        />
      );
    case "inprogress":
      return (
        <Icon
          name="timelapse"
          size={options?.inWell ? 26 : 24}
          color={
            options?.inWell
              ? d
                ? "rgba(196, 181, 253, 0.98)"
                : "rgba(109, 40, 217, 0.9)"
              : colors.primary
          }
          style={iconWrap}
        />
      );
    case "upcoming":
      if (options?.studentLocked) {
        return (
          <Icon
            name="lock-clock"
            size={options?.inWell ? 26 : 24}
            color={
              options?.inWell ? (d ? "#FBBF24" : "#D97706") : colors.primary
            }
            style={iconWrap}
          />
        );
      }
      return (
        <Icon
          name="event-note"
          size={options?.inWell ? 26 : 24}
          color={
            options?.inWell
              ? d
                ? "rgba(226, 232, 240, 0.9)"
                : "rgba(71, 85, 105, 0.9)"
              : colors.textSecondary
          }
          style={iconWrap}
        />
      );
    default:
      return (
        <Icon
          name="event-note"
          size={options?.inWell ? 26 : 24}
          color={
            options?.inWell
              ? d
                ? "rgba(226, 232, 240, 0.9)"
                : "rgba(71, 85, 105, 0.9)"
              : colors.textSecondary
          }
          style={iconWrap}
        />
      );
  }
};

type EnabledTrailTone = "success" | "primary" | "muted";

const getEnabledModuleTrail = (
  status: string,
): { label: string; tone: EnabledTrailTone } => {
  switch (status) {
    case "completed":
      return { label: "Done", tone: "success" };
    case "inprogress":
      return { label: "In progress", tone: "primary" };
    default:
      return { label: "Upcoming", tone: "muted" };
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
  route: {
    params: { studentClass: string; student?: any; batch?: any; course?: any };
  };
}) => {
  const {
    studentClass = {},
    student = {},
    batch = {},
    course = {},
  } = route.params;
  const { colors, isDark } = useTheme();
  const { role } = useAppContext();

  const { studentId, classId, courseId } = useMemo(() => {
    let extractedStudentId: string | null = null;
    let extractedClassId: string | null = null;
    let extractedCourseId: string | null = null;
    if (course?.id) {
      extractedCourseId = course.id;
    }

    if (student?.id && batch?.id) {
      extractedStudentId = student.id;
      extractedClassId = batch.id;
    } else if (studentClass) {
      const { id, students } = studentClass as any;
      extractedStudentId = students?.id;
      extractedClassId = id;
    }

    return {
      studentId: extractedStudentId,
      classId: extractedClassId,
      courseId: extractedCourseId,
    };
  }, [student?.id, batch?.id, studentClass, course?.id]);

  const {
    data: progressData,
    isLoading,
    isRefetching,
    refetch,
  } = useStudentProgress(studentId, classId, courseId);
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

  const dynamicStyles = createStyles(colors, isDark);

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
      const trail = !shouldDisable
        ? getEnabledModuleTrail(module.status)
        : null;

      const statusWellStyle = shouldDisable
        ? dynamicStyles.statusIconWellLocked
        : [
            dynamicStyles.statusIconWell,
            module.status === "completed" && dynamicStyles.statusWellCompleted,
            module.status === "inprogress" &&
              dynamicStyles.statusWellInProgress,
            module.status !== "completed" &&
              module.status !== "inprogress" &&
              dynamicStyles.statusWellNeutral,
          ];

      return (
        <TouchableOpacity
          key={module.moduleId.id}
          activeOpacity={shouldDisable ? 1 : 0.82}
          onPress={() => !shouldDisable && handleDetailsNavigation(module)}
          disabled={shouldDisable}
          accessibilityRole="button"
          accessibilityState={{ disabled: shouldDisable }}
          style={dynamicStyles.moduleCardTouchable}
        >
          <View
            style={[
              dynamicStyles.moduleGlassCard,
              shouldDisable && dynamicStyles.moduleGlassCardLocked,
            ]}
          >
            <View style={dynamicStyles.moduleRow}>
              <View style={dynamicStyles.moduleMain}>
                <View style={statusWellStyle}>
                  {getStatusIcon(module.status, colors, {
                    studentLocked: shouldDisable,
                    inWell: true,
                    isDark,
                  })}
                </View>
                <View style={dynamicStyles.moduleTextBlock}>
                  <Text
                    numberOfLines={2}
                    style={[
                      dynamicStyles.cardText,
                      shouldDisable && dynamicStyles.upcomingLockedTitle,
                    ]}
                  >
                    {module.moduleId.title}
                  </Text>
                  <Text
                    style={[
                      dynamicStyles.moduleSessionLabel,
                      shouldDisable && dynamicStyles.upcomingLockedSubtitle,
                    ]}
                  >
                    Session {module.moduleId.session}
                  </Text>
                </View>
              </View>
              {shouldDisable ? (
                <View style={dynamicStyles.upcomingBadge}>
                  <Icon
                    name="schedule"
                    size={14}
                    color={isDark ? "#DDD6FE" : "#5B21B6"}
                    style={dynamicStyles.upcomingBadgeIcon}
                  />
                  <Text style={dynamicStyles.upcomingBadgeLabel}>Upcoming</Text>
                </View>
              ) : trail ? (
                <View style={dynamicStyles.moduleTrail}>
                  <View
                    style={[
                      dynamicStyles.trailBadge,
                      trail.tone === "success" &&
                        dynamicStyles.trailBadgeSuccess,
                      trail.tone === "primary" &&
                        dynamicStyles.trailBadgePrimary,
                      trail.tone === "muted" && dynamicStyles.trailBadgeMuted,
                    ]}
                  >
                    <Text
                      style={[
                        dynamicStyles.trailBadgeLabel,
                        trail.tone === "success" &&
                          dynamicStyles.trailBadgeLabelSuccess,
                        trail.tone === "primary" &&
                          dynamicStyles.trailBadgeLabelPrimary,
                        trail.tone === "muted" &&
                          dynamicStyles.trailBadgeLabelMuted,
                      ]}
                    >
                      {trail.label}
                    </Text>
                  </View>
                  <View style={dynamicStyles.moduleChevronWrap}>
                    <Icon
                      name="chevron-right"
                      size={26}
                      color={
                        isDark
                          ? "rgba(148, 163, 184, 0.75)"
                          : "rgba(100, 116, 139, 0.85)"
                      }
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </View>
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
      <ScreenGradientBackground isDark={isDark} />
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
            <View style={dynamicStyles.tabTrack}>
              {(
                [
                  {
                    key: "theory" as const,
                    label: "Theory",
                    icon: "menu-book",
                  },
                  {
                    key: "technical" as const,
                    label: "Technical",
                    icon: "handyman",
                  },
                  {
                    key: "repertoire" as const,
                    label: "Repertoire",
                    icon: "library-music",
                  },
                  {
                    key: "others" as const,
                    label: "Others",
                    icon: "category",
                  },
                ] as const
              ).map(({ key, label, icon }) => {
                const selected = activeTab === key;
                return (
                  <TouchableOpacity
                    key={key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    style={[
                      dynamicStyles.tabPill,
                      selected && dynamicStyles.tabPillActiveShadow,
                    ]}
                    onPress={() => setActiveTab(key)}
                    activeOpacity={0.85}
                  >
                    {selected ? (
                      <LinearGradient
                        colors={loginButtonGradientColors}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={dynamicStyles.tabPillGradientFill}
                      />
                    ) : null}
                    <View
                      style={dynamicStyles.tabPillInner}
                      pointerEvents="none"
                    >
                      <Icon
                        name={icon}
                        size={18}
                        color={
                          selected ? colors.primaryText : colors.textSecondary
                        }
                        style={dynamicStyles.tabIcon}
                      />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          dynamicStyles.tabPillLabel,
                          selected && dynamicStyles.tabPillLabelActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
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

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    tabBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
      backgroundColor: "transparent",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.cardBorder,
    },
    tabTrack: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      padding: 3,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.cardBorder,
    },
    tabPill: {
      flex: 1,
      minWidth: 0,
      borderRadius: 11,
      overflow: "hidden",
    },
    tabPillActiveShadow: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: 3,
      elevation: 2,
    },
    tabPillGradientFill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 11,
    },
    tabPillInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 4,
    },
    tabIcon: {
      marginRight: 5,
    },
    tabPillLabel: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: -0.2,
      color: colors.textSecondary,
      flexShrink: 1,
    },
    tabPillLabelActive: {
      color: colors.primaryText,
    },
    content: {
      flex: 1,
      padding: 16,
      backgroundColor: "transparent",
    },
    /** Matches My Classes instrument cards (`InstrumentSection` glass + neon rim) */
    moduleCardTouchable: {
      marginBottom: 14,
    },
    moduleGlassCard: {
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    moduleGlassCardLocked: {
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.88)"
        : "rgba(255, 255, 255, 0.9)",
    },
    moduleRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    moduleMain: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      marginRight: 8,
      paddingVertical: 2,
    },
    statusIconWell: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
    },
    statusIconWellLocked: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      backgroundColor: isDark
        ? "rgba(251, 146, 60, 0.12)"
        : "rgba(251, 146, 60, 0.1)",
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(251, 146, 60, 0.5)"
        : "rgba(234, 88, 12, 0.4)",
    },
    statusWellCompleted: {
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
    },
    statusWellInProgress: {
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
    },
    statusWellNeutral: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(148, 163, 184, 0.1)",
    },
    moduleTextBlock: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
      paddingVertical: 2,
    },
    cardText: {
      fontWeight: "800",
      fontSize: 17,
      letterSpacing: -0.35,
      lineHeight: 22,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    moduleSessionLabel: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      color: isDark ? "#CBD5E1" : "#64748B",
      textTransform: "uppercase",
    },
    upcomingLockedTitle: {
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    upcomingLockedSubtitle: {
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    upcomingBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : "rgba(167, 139, 250, 0.14)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.32)"
        : "rgba(109, 40, 217, 0.26)",
    },
    upcomingBadgeIcon: {
      marginRight: 4,
    },
    upcomingBadgeLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      color: isDark ? "#DDD6FE" : "#5B21B6",
    },
    moduleTrail: {
      flexDirection: "row",
      alignItems: "center",
    },
    moduleChevronWrap: {
      justifyContent: "center",
      paddingLeft: 4,
      marginLeft: 2,
    },
    trailBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    trailBadgeSuccess: {
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
      borderColor: isDark
        ? "rgba(94, 234, 212, 0.35)"
        : "rgba(45, 212, 191, 0.3)",
    },
    trailBadgePrimary: {
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : "rgba(109, 40, 217, 0.1)",
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.38)"
        : "rgba(109, 40, 217, 0.24)",
    },
    trailBadgeMuted: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.1)"
        : "rgba(100, 116, 139, 0.08)",
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.2)"
        : "rgba(167, 139, 250, 0.22)",
    },
    trailBadgeLabel: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    trailBadgeLabelSuccess: {
      color: isDark ? "rgba(94, 234, 212, 0.98)" : "rgba(13, 148, 136, 0.96)",
    },
    trailBadgeLabelPrimary: {
      color: isDark ? "#DDD6FE" : "#6D28D9",
    },
    trailBadgeLabelMuted: {
      color: isDark ? "#CBD5E1" : "#475569",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
      backgroundColor: "transparent",
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
      backgroundColor: "transparent",
    },
    loadingText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: "500",
    },
  });

export default CourseDetails;
