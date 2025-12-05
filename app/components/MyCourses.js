import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getStudentProfile } from "../services/student";
const MyCourses = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState(null);
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);

  // "courses":[
  //     {
  //        "description":"Learn to play the guitar confidently with clear, step-by-step guidance.",
  //        "id":"6873723c32a37cbadbaae98a",
  //        "image":"https://ik.imagekit.io/slipnscore/johnson-academy/guitar-159661_640.png?updatedAt=1752395585967",
  //        "instrument":"Guitar",
  //        "name":"Guitar Beginners Course - Level 1",
  //        "syllabus":[
  //           "Array"
  //        ]

  //     },
  //     {
  //        "description":"Piano Begineer -Level 1 descrption",
  //        "id":"68a0bcb48202d14219617a0e",
  //        "image":"https://ik.imagekit.io/slipnscore/johnson-academy/courses/1755364525227_icon-of-piano-keyboard-2HP8P99_Vmnu10aXX.jpg",
  //        "instrument":"Piano",
  //        "name":"Piano Begineer -Level 1",
  //        "syllabus":[
  //           "Array"
  //        ]
  //     }
  //  ],
  //        "progress":[
  //        {
  //           "courseId": "6873723c32a37cbadbaae98a",
  //           "progress": 50,
  // "totalModules": 34,
  //           "completedModules": 4,
  //           "inProgressModules": 1,
  //           "upcomingModules": 29,
  //        },
  //        {
  //           "courseId": "68a0bcb48202d14219617a0e",
  //           "progress": 75,
  //           "totalModules": 34,
  //           "completedModules": 4,
  //           "inProgressModules": 1,
  //           "upcomingModules": 29,
  //        }
  //        ]

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getStudentProfile(userId);
      setCourses(data.courses || []);
      setProgress(data.progress || []);
      // Only set active instrument if courses array exists and has at least one element
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

  // Helper function to get the active course data
  const getActiveCourse = () => {
    const course = courses.find(
      (course) => course.instrument === activeInstrument
    );
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
  };

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
              {courses.map((course, index) => (
                <TouchableOpacity
                  key={index}
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

          {/* Active Course Details */}
          {getActiveCourse() && (
            <View style={dynamicStyles.courseDetails}>
              <Text style={dynamicStyles.courseName}>
                {getActiveCourse().name}
              </Text>

              {/* Progress Section */}
              <View style={dynamicStyles.progressSection}>
                <View style={dynamicStyles.progressHeader}>
                  <Text style={dynamicStyles.progressLabel}>Progress</Text>
                  <Text style={dynamicStyles.progressPercentage}>
                    {getActiveCourse().progress}%
                  </Text>
                </View>
                <View style={dynamicStyles.progressBarContainer}>
                  <View
                    style={[
                      dynamicStyles.progressBar,
                      { width: `${getActiveCourse().progress}%` },
                    ]}
                  />
                </View>

                {/* Module Statistics */}
                <View style={dynamicStyles.moduleStats}>
                  <View style={dynamicStyles.moduleStatItem}>
                    <View
                      style={[
                        dynamicStyles.moduleStatDot,
                        { backgroundColor: colors.success },
                      ]}
                    />
                    <Text style={dynamicStyles.moduleStatText}>
                      {getActiveCourse().completedModules} Completed
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
                      {getActiveCourse().inProgressModules} In Progress
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
                      {getActiveCourse().upcomingModules} Upcoming
                    </Text>
                  </View>
                </View>

                {/* Total Modules */}
                <View style={dynamicStyles.totalModules}>
                  <Text style={dynamicStyles.totalModulesText}>
                    Total: {getActiveCourse().totalModules} modules
                  </Text>
                </View>
              </View>

              {/* <Text style={dynamicStyles.courseDescription}>
              {getActiveCourse().description}
            </Text> */}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const createStyles = (colors) =>
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
