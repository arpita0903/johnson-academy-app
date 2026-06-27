import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { startModule, endModule } from "../../../services/student-progress";
import { Module, Resource } from "../../../types/studentProgress";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors, loginButtonGradientColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import StarRating from "../../../shared/components/StarRating";
import { useToast } from "../../../context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import { useModuleProgress } from "../../../shared/hooks/useModuleProgress";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { queryKeys } from "../../../config/queryKeys";

interface ModuleDetailScreenProps {
  route: {
    params: {
      progressId: string;
      selectedModule: Module;
    };
  };
  navigation: any;
}

const convertScoreToStars = (score: number | string): number => {
  // Convert numeric score to stars (assuming score is already 1-5)
  const numericScore = typeof score === "string" ? parseFloat(score) : score;

  // If score is in 1-5 range, return as is
  if (numericScore >= 1 && numericScore <= 5) {
    return Math.round(numericScore);
  }

  // If score appears to be percentage-based, convert to 1-5
  if (numericScore > 5) {
    if (numericScore <= 20) return 1;
    if (numericScore <= 40) return 2;
    if (numericScore <= 60) return 3;
    if (numericScore <= 80) return 4;
    return 5;
  }

  return 0;
};

const ModuleDetailScreen = ({ route, navigation }: ModuleDetailScreenProps) => {
  const { progressId, selectedModule } = route.params;
  const [starRating, setStarRating] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedModuleForEnd, setSelectedModuleForEnd] =
    useState<Module | null>(null);
  const { user } = useAppContext();
  const { showError, showSuccess, showInfo } = useToast();
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();

  const {
    data: progressData,
    isLoading: loading,
    isRefetching: refreshing,
    refetch,
  } = useModuleProgress(progressId);
  useRefreshOnFocus();

  // Use fresh module from progressData so status/UI updates after start/end actions
  const displayModule = useMemo(() => {
    if (!progressData?.syllabusProgress?.[0]?.modules) return selectedModule;
    const freshModule = progressData.syllabusProgress[0].modules.find(
      (m: Module) => m.moduleId?.id === selectedModule.moduleId?.id,
    );
    return freshModule ?? selectedModule;
  }, [progressData, selectedModule]);

  const onRefresh = () => refetch();

  const handleStartCourse = async (module: Module) => {
    try {
      if (!user?.id) {
        showError("User ID not found. Please try again.");
        return;
      }

      // Get syllabus ID from the progress data
      const syllabusId = progressData?.syllabusProgress?.[0]?.syllabusId?.id;
      if (!syllabusId) {
        showError("Syllabus ID not found. Please try again.");
        return;
      }

      await startModule(progressId, module.moduleId.id, syllabusId);

      showSuccess(`Module has been started successfully.`);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.moduleProgress(progressId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.studentProgress(
          progressData.studentId?.id ?? null,
          progressData.classId?.id ?? null,
        ),
      });
    } catch {
      showError("Failed to start the module. Please try again.");
    }
  };

  const handleEndCourse = async (module: Module) => {
    setSelectedModuleForEnd(module);
    setShowEndModal(true);
  };

  const confirmEndModule = async () => {
    try {
      if (!user?.id || !selectedModuleForEnd) {
        showError("User ID or module not found. Please try again.");
        return;
      }

      // Validate minimum star rating
      if (starRating < 3) {
        showError("Please provide a rating of at least 3 stars.");
        return;
      }

      // Get syllabus ID from the progress data
      const syllabusId = progressData?.syllabusProgress?.[0]?.syllabusId?.id;
      if (!syllabusId) {
        showError("Syllabus ID not found. Please try again.");
        return;
      }

      await endModule(
        progressId,
        selectedModuleForEnd.moduleId.id,
        syllabusId,
        starRating.toString(),
      );

      showSuccess(`Module has been ended successfully.`);

      // Clear the form and close modal
      setStarRating(0);
      setShowEndModal(false);
      setSelectedModuleForEnd(null);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.moduleProgress(progressId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.studentProgress(
          progressData.studentId?.id ?? null,
          progressData.classId?.id ?? null,
        ),
      });
    } catch {
      showError("Failed to end the module. Please try again.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewPDF = async (resource: any) => {
    try {
      if (resource.file) {
        // Try to open the PDF file
        const supported = await Linking.canOpenURL(resource.file);
        if (supported) {
          await Linking.openURL(resource.file);
        } else {
          showInfo(
            "No PDF viewer app found on your device. Please install a PDF reader app.",
          );
        }
      } else {
        showError("PDF file path is not available for this resource.");
      }
    } catch {
      showError("Failed to open PDF. Please try again.");
    }
  };

  const s = createStyles(colors, isDark);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={s.safeArea} edges={["top"]}>
          <ScreenGradientBackground isDark={isDark} />
          <View style={s.centeredFallback}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.loadingText}>Loading module details...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!progressData && !loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={s.safeArea} edges={["top"]}>
          <ScreenGradientBackground isDark={isDark} />
          <View style={s.centeredFallback}>
            <Icon
              name="error-outline"
              size={48}
              color={colors.error}
              style={{ marginBottom: 12 }}
            />
            <Text style={s.errorTextBold}>Failed to load module details</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!progressData) {
    return null;
  }

  const courseMeta =
    progressData.courseId &&
    typeof progressData.courseId === "object" &&
    progressData.courseId !== null &&
    ("title" in progressData.courseId || "name" in progressData.courseId)
      ? String(
          (progressData.courseId as { title?: string; name?: string }).title ??
            (progressData.courseId as { title?: string; name?: string }).name ??
            "",
        ).trim()
      : "";

  const statusLabel =
    displayModule.status.charAt(0).toUpperCase() +
    displayModule.status.slice(1);

  const heroSubtitleSecondary = [
    `Session ${displayModule.moduleId.session}`,
    statusLabel,
  ].join(" · ");

  const aboutCopy = displayModule.moduleId.description?.trim() ?? "";
  const pdfList = displayModule.moduleId.resources ?? [];
  const showAboutCard = aboutCopy.length > 0 || pdfList.length > 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
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
                      name="menu-book"
                      size={28}
                      color={
                        isDark
                          ? "rgba(167, 139, 250, 0.95)"
                          : "rgba(109, 40, 217, 0.85)"
                      }
                    />
                  </View>
                  <View style={s.heroTextBlock}>
                    <Text style={s.heroTitle} numberOfLines={3}>
                      {displayModule.moduleId.title}
                    </Text>
                    <View style={s.heroSubRow}>
                      <Icon
                        name="schedule"
                        size={16}
                        color={
                          isDark
                            ? "rgba(148, 163, 184, 0.95)"
                            : "rgba(71, 85, 105, 0.9)"
                        }
                        style={s.heroSubIcon}
                      />
                      <Text style={s.heroSubtitle} numberOfLines={2}>
                        {heroSubtitleSecondary}
                      </Text>
                    </View>
                    {courseMeta.length > 0 && (
                      <Text style={s.heroCourseLine} numberOfLines={2}>
                        {courseMeta}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {showAboutCard ? (
            <View style={[s.glassSection, s.sectionSpacing]}>
              <View style={s.sectionTitleRow}>
                <Text style={s.sectionHeading}>About this module</Text>
              </View>
              {aboutCopy.length > 0 ? (
                <Text style={s.bodyText}>{aboutCopy}</Text>
              ) : null}
              {pdfList.length > 0 ? (
                <View
                  style={[
                    s.aboutPdfRow,
                    aboutCopy.length > 0 ? s.aboutPdfRowAfterBody : null,
                  ]}
                >
                  {pdfList.map((resource: Resource, index: number) => (
                    <TouchableOpacity
                      key={resource.key ?? `pdf-${index}`}
                      activeOpacity={0.82}
                      onPress={() => handleViewPDF(resource)}
                      style={s.aboutPdfIcon}
                      accessibilityRole="button"
                      accessibilityLabel={
                        resource.key
                          ? `Open PDF: ${resource.key}`
                          : `Open PDF ${index + 1}`
                      }
                    >
                      <Icon
                        name="picture-as-pdf"
                        size={26}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {user?.role === "teacher" ? (
            <View style={[s.glassSection, s.sectionSpacing, s.teacherPanel]}>
              <Text style={s.sectionHeading}>Teacher actions</Text>
              <View style={s.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleStartCourse(displayModule)}
                  disabled={displayModule.status !== "upcoming"}
                  style={[
                    s.teacherButtonShell,
                    displayModule.status !== "upcoming" && s.disabledButton,
                  ]}
                >
                  <LinearGradient
                    colors={[...loginButtonGradientColors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={s.teacherGradientFill}
                  >
                    <Icon name="play-arrow" size={18} color="#FFFFFF" />
                    <Text style={s.gradientButtonLabel}>Start</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleEndCourse(displayModule)}
                  disabled={displayModule.status !== "inprogress"}
                  style={[
                    s.teacherEndButton,
                    displayModule.status !== "inprogress" && s.disabledButton,
                  ]}
                >
                  <Icon name="stop" size={18} color="#FFFFFF" />
                  <Text style={s.gradientButtonLabel}>End</Text>
                </TouchableOpacity>
              </View>

              {displayModule.status === "completed" ? (
                <View style={s.teacherNotice}>
                  <Icon
                    name="info-outline"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={s.teacherNoticeText}>
                    This module has been completed and cannot be modified.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {(displayModule.startDate ||
            displayModule.endDate ||
            displayModule.dateTakenToComplete) && (
            <View style={[s.glassSection, s.sectionSpacing]}>
              <Text style={[s.sectionHeading, s.sectionHeadingStandalone]}>
                Timeline
              </Text>
              {displayModule.startDate ? (
                <View style={s.dateRow}>
                  <Icon name="event" size={20} color={colors.primary} />
                  <Text style={s.dateLabel}>Start</Text>
                  <View style={s.dateBadge}>
                    <Text style={s.dateBadgeText}>
                      {formatDate(displayModule.startDate)}
                    </Text>
                  </View>
                </View>
              ) : null}
              {displayModule.endDate ? (
                <View style={s.dateRow}>
                  <Icon
                    name="event-available"
                    size={20}
                    color={colors.success}
                  />
                  <Text style={s.dateLabel}>End</Text>
                  <View style={s.dateBadge}>
                    <Text style={[s.dateBadgeText, { color: colors.success }]}>
                      {formatDate(displayModule.endDate)}
                    </Text>
                  </View>
                </View>
              ) : null}
              {displayModule.dateTakenToComplete ? (
                <View style={s.dateRow}>
                  <Icon name="schedule" size={20} color={colors.warning} />
                  <Text style={s.dateLabel}>Days to complete</Text>
                  <View style={s.dateBadge}>
                    <Text style={[s.dateBadgeText, { color: colors.warning }]}>
                      {displayModule.dateTakenToComplete} days
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {displayModule.score ? (
            <View style={[s.glassSection, s.sectionSpacing]}>
              <Text style={s.sectionHeading}>Rating</Text>
              <View style={s.scoreDisplayContainer}>
                <StarRating
                  rating={convertScoreToStars(displayModule.score)}
                  size={24}
                  colors={colors}
                  readonly={true}
                />
                <Text style={s.scoreSupportingText}>
                  {convertScoreToStars(displayModule.score)} out of 5 stars
                </Text>
              </View>
            </View>
          ) : null}

          {displayModule.remark ? (
            <View style={[s.glassSection, s.sectionSpacing]}>
              <Text style={s.sectionHeading}>Remark</Text>
              <Text style={s.bodyText}>{displayModule.remark}</Text>
            </View>
          ) : null}

          <View
            style={[s.glassSection, s.sectionSpacing, s.sectionSpacingBottom]}
          >
            <Text style={s.sectionHeading}>Progress overview</Text>
            <View style={s.progressGrid}>
              <View style={s.progressCell}>
                <Text style={s.progressNumber}>
                  {progressData.totalModules}
                </Text>
                <Text style={s.progressFootnote}>Total</Text>
              </View>
              <View style={s.progressCell}>
                <Text style={s.progressNumber}>
                  {progressData.completedModules}
                </Text>
                <Text style={s.progressFootnote}>Completed</Text>
              </View>
              <View style={s.progressCell}>
                <Text style={s.progressNumber}>
                  {progressData.inProgressModules}
                </Text>
                <Text style={s.progressFootnote}>In progress</Text>
              </View>
              <View style={s.progressCell}>
                <Text style={s.progressNumber}>
                  {progressData.upcomingModules}
                </Text>
                <Text style={s.progressFootnote}>Upcoming</Text>
              </View>
            </View>
            <View style={s.overallProgress}>
              <Text style={s.overallProgressLabel}>Overall progress</Text>
              <Text style={s.progressPercentage}>{progressData.progress}%</Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showEndModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowEndModal(false);
            setSelectedModuleForEnd(null);
            setStarRating(0);
          }}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>End module</Text>
              <Text style={s.modalSubtitle} numberOfLines={3}>
                {selectedModuleForEnd?.moduleId.title}
              </Text>

              <View style={s.modalField}>
                <Text style={s.modalFieldLabel}>Rating</Text>
                <View style={s.starRatingContainer}>
                  <StarRating
                    rating={starRating}
                    onRatingChange={setStarRating}
                    size={32}
                    colors={colors}
                  />
                  {starRating > 0 ? (
                    <Text style={s.ratingText}>
                      {starRating} out of 5 stars
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={s.modalButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[s.modalButton, s.cancelButton]}
                  onPress={() => {
                    setShowEndModal(false);
                    setSelectedModuleForEnd(null);
                    setStarRating(0);
                  }}
                >
                  <Text style={s.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={confirmEndModule}
                  style={s.modalGradientButtonShell}
                >
                  <LinearGradient
                    colors={[...loginButtonGradientColors]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={s.modalGradientButtonFill}
                  >
                    <Text style={s.confirmGradientText}>End module</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
      paddingTop: 8,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 28,
    },
    centeredFallback: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    loadingText: {
      marginTop: 14,
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : colors.textSecondary,
    },
    errorTextBold: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.error,
      textAlign: "center",
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
      marginTop: 10,
    },
    heroSubIcon: {
      marginRight: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    heroCourseLine: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: -0.15,
      color: isDark ? "rgba(167, 139, 250, 0.95)" : "rgba(109, 40, 217, 0.82)",
    },
    glassSection: {
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    sectionSpacing: {
      marginBottom: 14,
    },
    sectionSpacingBottom: {
      marginBottom: 6,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginBottom: 10,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    sectionHeadingStandalone: {
      marginBottom: 14,
    },
    bodyText: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "500",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    aboutPdfRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
    },
    aboutPdfRowAfterBody: {
      marginTop: 16,
    },
    aboutPdfIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(239, 68, 68, 0.45)"
        : "rgba(220, 38, 38, 0.35)",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(248, 250, 252, 1)",
    },
    teacherPanel: {
      paddingBottom: 18,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
      gap: 12,
    },
    teacherButtonShell: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      minHeight: 50,
    },
    teacherGradientFill: {
      flex: 1,
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      gap: 8,
    },
    teacherEndButton: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      gap: 8,
      backgroundColor: colors.error,
    },
    gradientButtonLabel: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
    disabledButton: {
      opacity: 0.55,
    },
    teacherNotice: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.1)"
        : "rgba(255, 107, 53, 0.08)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 107, 53, 0.25)"
        : "rgba(255, 107, 53, 0.2)",
    },
    teacherNoticeText: {
      flex: 1,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
    },
    dateLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    dateBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
    },
    dateBadgeText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.primary,
    },
    scoreDisplayContainer: {
      alignItems: "center",
      gap: 10,
      paddingTop: 6,
    },
    scoreSupportingText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    progressGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 8,
    },
    progressCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.08)"
        : "rgba(241, 245, 249, 0.9)",
    },
    progressNumber: {
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.4,
      color: colors.primary,
    },
    progressFootnote: {
      marginTop: 6,
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
      color: isDark ? "#94A3B8" : "#64748B",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    overallProgress: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 18,
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
    },
    overallProgressLabel: {
      fontSize: 14,
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#0f172a",
    },
    progressPercentage: {
      fontSize: 20,
      fontWeight: "900",
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: "rgba(15, 23, 42, 0.62)",
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 22,
      paddingHorizontal: 22,
      paddingVertical: 22,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.98)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.35)"
        : "rgba(167, 139, 250, 0.28)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 22,
      elevation: 14,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.4,
      textAlign: "center",
      marginBottom: 10,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    modalSubtitle: {
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 22,
      color: isDark ? "#CBD5E1" : "#475569",
    },
    modalField: {
      marginBottom: 12,
    },
    modalFieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 10,
      letterSpacing: 0.2,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    starRatingContainer: {
      alignItems: "center",
      paddingVertical: 8,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: "700",
      marginTop: 10,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 18,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    cancelButton: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(241, 245, 249, 1)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    modalGradientButtonShell: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      minHeight: 50,
    },
    modalGradientButtonFill: {
      flex: 1,
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    confirmGradientText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFFFFF",
    },
  });

export default ModuleDetailScreen;
