import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { getStudentProfile } from "../../../services/student";
import type { ThemeColors } from "../../../theme/colors";

interface ProfileCourse {
  id: string;
  name: string;
  instrument: string;
  description?: string;
  image?: string;
  syllabus?: unknown[];
}

interface CourseProgressEntry {
  courseId: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  upcomingModules: number;
}

type ActiveCourse = ProfileCourse & {
  progress: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  upcomingModules: number;
};

interface MyCoursesProps {
  userId?: string | null;
}

const MyCourses = ({ userId }: MyCoursesProps) => {
  const [loading, setLoading] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState<string | null>(null);
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const [courses, setCourses] = useState<ProfileCourse[]>([]);
  const [progress, setProgress] = useState<CourseProgressEntry[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getStudentProfile(userId);
      setCourses(data.courses || []);
      setProgress(data.progress || []);
      if (
        data.courses &&
        Array.isArray(data.courses) &&
        data.courses.length > 0
      ) {
        setActiveInstrument(data.courses[0].instrument);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeCourse = useMemo((): ActiveCourse | null => {
    const course = courses.find((c) => c.instrument === activeInstrument);
    if (!course) return null;

    const courseProgress = progress.find((p) => p.courseId === course.id);
    return {
      ...course,
      progress: courseProgress ? courseProgress.progress : 0,
      totalModules: courseProgress ? courseProgress.totalModules : 0,
      completedModules: courseProgress ? courseProgress.completedModules : 0,
      inProgressModules: courseProgress ? courseProgress.inProgressModules : 0,
      upcomingModules: courseProgress ? courseProgress.upcomingModules : 0,
    };
  }, [courses, progress, activeInstrument]);

  if (loading) {
    return (
      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>My Courses</Text>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={dynamicStyles.card}>
      <Text style={dynamicStyles.sectionTitle}>My Courses</Text>
      {courses.length === 0 ? (
        <View style={dynamicStyles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>No courses available</Text>
        </View>
      ) : (
        <>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  onPress={() => setActiveInstrument(course.instrument)}
                  style={[
                    dynamicStyles.instrumentTab,
                    activeInstrument === course.instrument &&
                      dynamicStyles.instrumentTabActive,
                  ]}
                >
                  <Text
                    style={[
                      dynamicStyles.instrumentTabText,
                      activeInstrument === course.instrument &&
                        dynamicStyles.instrumentTabTextActive,
                    ]}
                  >
                    {course.instrument}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {activeCourse && (
            <View style={dynamicStyles.courseDetails}>
              <Text style={dynamicStyles.courseName}>{activeCourse.name}</Text>

              <View style={dynamicStyles.progressSection}>
                <View style={dynamicStyles.progressHeader}>
                  <Text style={dynamicStyles.progressLabel}>Progress</Text>
                  <Text style={dynamicStyles.progressPercentage}>
                    {activeCourse.progress}%
                  </Text>
                </View>
                <View style={dynamicStyles.progressBarContainer}>
                  <View
                    style={[
                      dynamicStyles.progressBar,
                      { width: `${activeCourse.progress}%` },
                    ]}
                  />
                </View>

                <View style={dynamicStyles.moduleStats}>
                  <View style={dynamicStyles.moduleStatItem}>
                    <View
                      style={[
                        dynamicStyles.moduleStatDot,
                        { backgroundColor: colors.success },
                      ]}
                    />
                    <Text style={dynamicStyles.moduleStatText}>
                      {activeCourse.completedModules} Completed
                    </Text>
                  </View>

                  <View style={dynamicStyles.moduleStatItem}>
                    <View
                      style={[
                        dynamicStyles.moduleStatDot,
                        { backgroundColor: colors.warning },
                      ]}
                    />
                    <Text style={dynamicStyles.moduleStatText}>
                      {activeCourse.inProgressModules} In Progress
                    </Text>
                  </View>

                  <View style={dynamicStyles.moduleStatItem}>
                    <View
                      style={[
                        dynamicStyles.moduleStatDot,
                        { backgroundColor: colors.textMuted },
                      ]}
                    />
                    <Text style={dynamicStyles.moduleStatText}>
                      {activeCourse.upcomingModules} Upcoming
                    </Text>
                  </View>
                </View>

                <View style={dynamicStyles.totalModules}>
                  <Text style={dynamicStyles.totalModulesText}>
                    Total: {activeCourse.totalModules} modules
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.text,
    },
    instrumentTab: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    instrumentTabActive: {
      backgroundColor: colors.primary,
    },
    instrumentTabText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "bold",
    },
    instrumentTabTextActive: {
      color: colors.primaryText,
    },
    peerRankLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },
    levelLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    levelTag: {
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 12,
      marginTop: 4,
      color: colors.text,
    },
    levelValue: {
      fontSize: 14,
      fontWeight: "500",
      marginTop: 4,
      color: colors.text,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    courseDetails: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    courseName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    courseDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    progressSection: {
      marginTop: 12,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.surface,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    moduleStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
      paddingHorizontal: 4,
    },
    moduleStatItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    moduleStatDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    moduleStatText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    },
    totalModules: {
      marginTop: 8,
      alignItems: "center",
    },
    totalModulesText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 40,
      marginTop: 20,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
  });

export default MyCourses;
