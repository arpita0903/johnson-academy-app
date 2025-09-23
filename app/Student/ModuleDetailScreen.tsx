import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getStudentProgress } from "../services/student";
import { startModule, endModule } from "../services/student-progress";
import { StudentProgressResponse, Module } from "../types/studentProgress";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import StarRating from "../components/StarRating";

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
  const [progressData, setProgressData] =
    useState<StudentProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [remark, setRemark] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedModuleForEnd, setSelectedModuleForEnd] =
    useState<Module | null>(null);
  const { user } = useAppContext();
  const { colors } = useTheme();

  useEffect(() => {
    fetchProgressData();
  }, [progressId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const data = await getStudentProgress(progressId);
      setProgressData(data);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  const handleStartCourse = async (module: Module) => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User ID not found. Please try again.");
        return;
      }

      // Get syllabus ID from the progress data
      const syllabusId = progressData?.syllabusProgress?.[0]?.syllabusId?.id;
      if (!syllabusId) {
        Alert.alert("Error", "Syllabus ID not found. Please try again.");
        return;
      }

      await startModule(progressId, module.moduleId.id, syllabusId);

      Alert.alert(
        "Module Started",
        `Module "${module.moduleId.title}" has been started successfully.`,
        [{ text: "OK" }]
      );

      // Refresh the data to update the status
      await fetchProgressData();
    } catch (error) {
      console.error("Error starting module:", error);
      Alert.alert("Error", "Failed to start the module. Please try again.");
    }
  };

  const handleEndCourse = async (module: Module) => {
    setSelectedModuleForEnd(module);
    setShowEndModal(true);
  };

  const confirmEndModule = async () => {
    try {
      if (!user?.id || !selectedModuleForEnd) {
        Alert.alert("Error", "User ID or module not found. Please try again.");
        return;
      }

      // Get syllabus ID from the progress data
      const syllabusId = progressData?.syllabusProgress?.[0]?.syllabusId?.id;
      if (!syllabusId) {
        Alert.alert("Error", "Syllabus ID not found. Please try again.");
        return;
      }

      await endModule(
        progressId,
        selectedModuleForEnd.moduleId.id,
        syllabusId,
        remark,
        starRating.toString()
      );

      Alert.alert(
        "Module Ended",
        `Module "${selectedModuleForEnd.moduleId.title}" has been ended successfully.`,
        [{ text: "OK" }]
      );

      // Clear the form and close modal
      setRemark("");
      setStarRating(0);
      setShowEndModal(false);
      setSelectedModuleForEnd(null);

      // Refresh the data to update the status
      await fetchProgressData();
    } catch (error) {
      console.error("Error ending module:", error);
      Alert.alert("Error", "Failed to end the module. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <MaterialIcons name="check-circle" size={20} color="#27ae60" />;
      case "inprogress":
        return <MaterialIcons name="timelapse" size={20} color="#f39c12" />;
      case "upcoming":
      default:
        return (
          <MaterialIcons
            name="radio-button-unchecked"
            size={20}
            color="#95a5a6"
          />
        );
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
          Alert.alert(
            "Cannot Open PDF",
            "No PDF viewer app found on your device. Please install a PDF reader app.",
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "No PDF File",
          "PDF file path is not available for this resource.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open PDF. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const dynamicStyles = createStyles(colors);

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dynamicStyles.loadingText}>Loading module details...</Text>
      </View>
    );
  }

  if (!progressData) {
    return (
      <View style={dynamicStyles.errorContainer}>
        <Text style={dynamicStyles.errorText}>
          Failed to load module details
        </Text>
      </View>
    );
  }

  const student = progressData.studentId;
  const course = progressData.courseId;
  const classInfo = progressData.classId;
  const syllabus = progressData.syllabusProgress?.[0];

  return (
    <ScrollView
      contentContainerStyle={dynamicStyles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#6200ee"]}
          tintColor="#6200ee"
        />
      }
    >
      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.title}>{selectedModule.moduleId.title}</Text>

        {selectedModule.moduleId.description && (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.labelRow}>
              <Text style={dynamicStyles.label}>Description</Text>
              <View style={dynamicStyles.pillContainer}>
                <Text style={dynamicStyles.pillText}>
                  Session {selectedModule.moduleId.session}
                </Text>
              </View>
            </View>
            <Text style={dynamicStyles.text}>
              {selectedModule.moduleId.description}
            </Text>
          </View>
        )}
        {!selectedModule.moduleId.description && (
          <View style={dynamicStyles.pillPostion}>
            <View style={[dynamicStyles.pillContainer]}>
              <Text style={dynamicStyles.pillText}>
                Session {selectedModule.moduleId.session}
              </Text>
            </View>
          </View>
        )}
        {/* Resources Section */}
        {selectedModule.moduleId.resources &&
          selectedModule.moduleId.resources.length > 0 && (
            <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
              <Text style={dynamicStyles.label}>Resources</Text>
              {selectedModule.moduleId.resources.map((resource, index) => (
                <View
                  key={resource.key || index}
                  style={dynamicStyles.resourceItem}
                >
                  <View style={dynamicStyles.resourceHeader}>
                    <MaterialIcons
                      name="picture-as-pdf"
                      size={20}
                      color="#d32f2f"
                    />
                    <Text style={dynamicStyles.resourceTitle}>
                      PDF Resource
                    </Text>
                  </View>
                  <Text style={dynamicStyles.resourceDescription}>
                    {resource.key || `Resource ${index + 1}`}
                  </Text>
                  <View style={dynamicStyles.resourceActions}>
                    <TouchableOpacity
                      style={[
                        dynamicStyles.resourceLink,
                        dynamicStyles.viewButton,
                      ]}
                      onPress={() => handleViewPDF(resource)}
                    >
                      <MaterialIcons
                        name="visibility"
                        size={16}
                        color={colors.success}
                      />
                      <Text
                        style={[
                          dynamicStyles.resourceLinkText,
                          dynamicStyles.viewButtonText,
                        ]}
                      >
                        View PDF
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Status */}
        <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
          <View style={dynamicStyles.labelRow}>
            <Text style={dynamicStyles.label}>Status</Text>
            <View style={dynamicStyles.statusContainer}>
              {getStatusIcon(selectedModule.status)}
              <Text style={dynamicStyles.statusText}>
                {selectedModule.status.charAt(0).toUpperCase() +
                  selectedModule.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Teacher Controls - Only show if user is a teacher */}
        {user?.role === "teacher" && (
          <View style={[dynamicStyles.section, dynamicStyles.teacherControls]}>
            <Text style={dynamicStyles.label}>Teacher Actions</Text>
            <View style={dynamicStyles.buttonRow}>
              <TouchableOpacity
                style={[
                  dynamicStyles.teacherButton,
                  dynamicStyles.startButton,
                  selectedModule.status !== "upcoming" &&
                    dynamicStyles.disabledButton,
                ]}
                onPress={() => handleStartCourse(selectedModule)}
                disabled={selectedModule.status !== "upcoming"}
              >
                <MaterialIcons
                  name="play-arrow"
                  size={18}
                  color={colors.text}
                />
                <Text style={dynamicStyles.buttonText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.teacherButton,
                  dynamicStyles.endButton,
                  selectedModule.status !== "inprogress" &&
                    dynamicStyles.disabledButton,
                ]}
                onPress={() => handleEndCourse(selectedModule)}
                disabled={selectedModule.status !== "inprogress"}
              >
                <MaterialIcons name="stop" size={18} color={colors.text} />
                <Text style={dynamicStyles.buttonText}>End</Text>
              </TouchableOpacity>
            </View>

            {/* Status-based message */}
            {selectedModule.status === "completed" && (
              <View style={dynamicStyles.statusMessage}>
                <Text style={dynamicStyles.statusMessageText}>
                  This module has been completed and cannot be modified.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Start Date */}
        {selectedModule.startDate && (
          <View style={[dynamicStyles.section, dynamicStyles.dateContainer]}>
            <MaterialIcons name="event" size={20} color={colors.primary} />
            <Text style={dynamicStyles.dateLabel}>Start Date:</Text>
            <View style={dynamicStyles.dateBadge}>
              <Text style={dynamicStyles.dateText}>
                {formatDate(selectedModule.startDate)}
              </Text>
            </View>
          </View>
        )}

        {/* End Date */}
        {selectedModule.endDate && (
          <View style={[dynamicStyles.section, dynamicStyles.dateContainer]}>
            <MaterialIcons
              name="event-available"
              size={20}
              color={colors.primary}
            />
            <Text style={dynamicStyles.dateLabel}>End Date:</Text>
            <View
              style={[
                dynamicStyles.dateBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[dynamicStyles.dateText, { color: "#2d8659" }]}>
                {formatDate(selectedModule.endDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Days to Complete */}
        {selectedModule.dateTakenToComplete && (
          <View style={[dynamicStyles.section, dynamicStyles.dateContainer]}>
            <MaterialIcons name="schedule" size={20} color={colors.primary} />
            <Text style={dynamicStyles.dateLabel}>Days to Complete:</Text>
            <View
              style={[
                dynamicStyles.dateBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[dynamicStyles.dateText, { color: "#d35400" }]}>
                {selectedModule.dateTakenToComplete} days
              </Text>
            </View>
          </View>
        )}

        {/* Score */}
        {selectedModule.score && (
          <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
            <Text style={dynamicStyles.label}>Rating</Text>
            <View style={dynamicStyles.scoreDisplayContainer}>
              <StarRating
                rating={convertScoreToStars(selectedModule.score)}
                size={24}
                colors={colors}
                readonly={true}
              />
              <Text style={dynamicStyles.scoreText}>
                {convertScoreToStars(selectedModule.score)} out of 5 stars
              </Text>
            </View>
          </View>
        )}

        {/* Remark */}
        {selectedModule.remark && (
          <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
            <Text style={dynamicStyles.label}>Remark</Text>
            <Text style={dynamicStyles.text}>{selectedModule.remark}</Text>
          </View>
        )}

        {/* Progress Overview */}
        <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
          <Text style={dynamicStyles.label}>Progress Overview</Text>
          <View style={dynamicStyles.progressRow}>
            <View style={dynamicStyles.progressItem}>
              <Text style={dynamicStyles.progressNumber}>
                {progressData.totalModules}
              </Text>
              <Text style={dynamicStyles.progressLabel}>Total</Text>
            </View>
            <View style={dynamicStyles.progressItem}>
              <Text style={dynamicStyles.progressNumber}>
                {progressData.completedModules}
              </Text>
              <Text style={dynamicStyles.progressLabel}>Completed</Text>
            </View>
            <View style={dynamicStyles.progressItem}>
              <Text style={dynamicStyles.progressNumber}>
                {progressData.inProgressModules}
              </Text>
              <Text style={dynamicStyles.progressLabel}>In Progress</Text>
            </View>
            <View style={dynamicStyles.progressItem}>
              <Text style={dynamicStyles.progressNumber}>
                {progressData.upcomingModules}
              </Text>
              <Text style={dynamicStyles.progressLabel}>Upcoming</Text>
            </View>
          </View>
          <View style={dynamicStyles.overallProgress}>
            <Text style={dynamicStyles.label}>Overall Progress:</Text>
            <Text style={dynamicStyles.progressPercentage}>
              {progressData.progress}%
            </Text>
          </View>
        </View>
      </View>

      {/* End Module Modal */}
      {showEndModal && (
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>End Module</Text>
            <Text style={dynamicStyles.modalSubtitle}>
              {selectedModuleForEnd?.moduleId.title}
            </Text>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.inputLabel}>Rating</Text>
              <View style={dynamicStyles.starRatingContainer}>
                <StarRating
                  rating={starRating}
                  onRatingChange={setStarRating}
                  size={32}
                  colors={colors}
                />
                {starRating > 0 && (
                  <Text style={dynamicStyles.ratingText}>
                    {starRating} out of 5 stars
                  </Text>
                )}
              </View>
            </View>

            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.inputLabel}>Remark</Text>
              <TextInput
                style={dynamicStyles.textInput}
                value={remark}
                onChangeText={setRemark}
                placeholder="Enter remark (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={dynamicStyles.modalButtonRow}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => {
                  setShowEndModal(false);
                  setSelectedModuleForEnd(null);
                  setRemark("");
                  setStarRating(0);
                }}
              >
                <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.confirmButton]}
                onPress={confirmEndModule}
              >
                <Text style={dynamicStyles.confirmButtonText}>End Module</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 10,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 16,
      color: "#d32f2f",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 28,
      textAlign: "center",
    },
    section: {
      marginBottom: 18,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    text: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    pillContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    pillPostion: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 18,
    },
    pillText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    sectionBgAlt: {
      backgroundColor: colors.surface,
      padding: 12,
      marginTop: 20,
      borderRadius: 8,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    dateBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 4,
      marginLeft: 8,
    },
    dateText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusText: {
      fontSize: 16,
      color: "#7f8c8d",
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    progressItem: {
      alignItems: "center",
      flex: 1,
    },
    progressNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    overallProgress: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.inputBorder,
    },
    progressPercentage: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    resourceItem: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    resourceHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    resourceTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    resourceDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    resourceLink: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    resourceLinkText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      marginRight: 6,
    },
    resourceActions: {
      flexDirection: "row",
      gap: 12,
    },
    viewButton: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    },
    viewButtonText: {
      color: colors.primary,
    },
    teacherControls: {
      marginTop: 20,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginHorizontal: 0,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      gap: 12,
    },
    teacherButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      flex: 1,
      minHeight: 48,
    },
    startButton: {
      backgroundColor: colors.primary,
    },
    endButton: {
      backgroundColor: colors.error,
    },
    disabledButton: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
      textAlign: "center",
    },
    statusMessage: {
      marginTop: 10,
      padding: 10,
      backgroundColor: colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    statusMessageText: {
      fontSize: 14,
      color: colors.primary,
      textAlign: "center",
    },
    // Modal styles
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      margin: 20,
      width: "90%",
      maxWidth: 400,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    modalButtonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    cancelButton: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    confirmButton: {
      backgroundColor: colors.error,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    confirmButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    starRatingContainer: {
      alignItems: "center",
      paddingVertical: 12,
    },
    ratingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      fontWeight: "500",
    },
    scoreDisplayContainer: {
      alignItems: "center",
      gap: 8,
    },
    scoreText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
      textAlign: "center",
    },
  });

export default ModuleDetailScreen;
