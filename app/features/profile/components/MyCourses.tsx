import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../context/ThemeContext";
import { useStudentProfile } from "../../../shared/hooks/useStudentProfile";
import type { StudentProfileCourse } from "../../../types/student";
import type { ThemeColors } from "../../../theme/colors";
import { NoteAccentDivider } from "../../../shared/components/NoteAccentDivider";

type ActiveCourse = StudentProfileCourse & {
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
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { data, isLoading } = useStudentProfile(userId ?? null);

  const courses = data?.courses ?? [];
  const progress = data?.progress ?? [];

  useEffect(() => {
    if (data?.courses?.length) {
      setActiveCourseId(data.courses[0].id);
    } else {
      setActiveCourseId(null);
    }
  }, [userId, data]);

  const activeCourse = useMemo((): ActiveCourse | null => {
    const course = courses.find((c) => c.id === activeCourseId);
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
  }, [courses, progress, activeCourseId]);

  const headerBlock = (
    <>
      <Text style={s.sectionHeading}>My courses</Text>
      <Text style={s.sectionMuted}>
        Progress across your enrolled programmes.
      </Text>
      <NoteAccentDivider marginTop={4} />
    </>
  );

  if (isLoading) {
    return (
      <View style={s.glassOuter}>
        {headerBlock}
        <View style={s.statePanel}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.statePanelText}>Loading your courses…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.glassOuter}>
      {headerBlock}

      {courses.length === 0 ? (
        <View style={s.emptyPanel}>
          <MaterialIcons
            name="library-music"
            size={40}
            color={
              isDark ? "rgba(167, 139, 250, 0.55)" : "rgba(109, 40, 217, 0.45)"
            }
          />
          <Text style={s.emptyTitle}>No courses yet</Text>
          <Text style={s.emptySubtext}>
            When you’re enrolled in a programme, it will show here with your
            module progress.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabScrollContent}
          >
            {courses.map((course) => {
              const selected = activeCourseId === course.id;
              return (
                <TouchableOpacity
                  key={course.id}
                  activeOpacity={0.82}
                  onPress={() => setActiveCourseId(course.id)}
                  style={[s.instrumentChip, selected && s.instrumentChipActive]}
                >
                  <MaterialIcons
                    name="menu-book"
                    size={18}
                    color={
                      selected ? colors.primary : isDark ? "#94A3B8" : "#64748B"
                    }
                    style={s.chipIcon}
                  />
                  <Text
                    style={[s.instrumentChipText, selected && s.chipTextActive]}
                    numberOfLines={2}
                  >
                    {course.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {activeCourse ? (
            <View style={s.detailSection}>
              <View style={s.courseTitleRow}>
                {activeCourse.image ? (
                  <Image
                    source={{ uri: activeCourse.image }}
                    style={s.courseThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={s.courseThumbPlaceholder}>
                    <MaterialIcons
                      name="menu-book"
                      size={24}
                      color={
                        isDark
                          ? "rgba(167, 139, 250, 0.95)"
                          : "rgba(109, 40, 217, 0.85)"
                      }
                    />
                  </View>
                )}
                <View style={s.courseTitleText}>
                  <Text style={s.courseName} numberOfLines={2}>
                    {activeCourse.name}
                  </Text>
                  <Text style={s.courseInstrumentLine} numberOfLines={1}>
                    {activeCourse.instrument}
                  </Text>
                </View>
              </View>

              <View style={s.progressBlock}>
                <View style={s.progressHeader}>
                  <Text style={s.progressLabel}>Overall progress</Text>
                  <View style={s.progressBadge}>
                    <Text style={s.progressBadgeText}>
                      {Math.min(
                        100,
                        Math.max(0, Math.round(activeCourse.progress)),
                      )}
                      %
                    </Text>
                  </View>
                </View>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${Math.min(100, Math.max(0, activeCourse.progress))}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={s.innerDivider} />

              <View style={s.statRow}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={s.statRowLabel}>Completed</Text>
                <View style={s.statValuePill}>
                  <Text style={s.statValueText}>
                    {activeCourse.completedModules}
                  </Text>
                </View>
              </View>
              <View style={s.statRow}>
                <MaterialIcons
                  name="hourglass-top"
                  size={20}
                  color={colors.warning}
                />
                <Text style={s.statRowLabel}>In progress</Text>
                <View style={s.statValuePill}>
                  <Text style={s.statValueText}>
                    {activeCourse.inProgressModules}
                  </Text>
                </View>
              </View>
              <View style={s.statRow}>
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={
                    isDark
                      ? "rgba(148, 163, 184, 0.95)"
                      : "rgba(71, 85, 105, 0.9)"
                  }
                />
                <Text style={s.statRowLabel}>Upcoming</Text>
                <View style={s.statValuePill}>
                  <Text style={s.statValueText}>
                    {activeCourse.upcomingModules}
                  </Text>
                </View>
              </View>

              <Text style={s.totalFoot}>
                Total modules:{" "}
                <Text style={s.totalFootStrong}>
                  {activeCourse.totalModules}
                </Text>
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    glassOuter: {
      overflow: "hidden",
      marginBottom: 24,
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
    sectionHeading: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginBottom: 6,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    sectionMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      marginBottom: 4,
    },
    statePanel: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.45)"
        : "rgba(248, 250, 252, 0.9)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.2)"
        : "rgba(148, 163, 184, 0.35)",
    },
    statePanelText: {
      marginTop: 14,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    emptyPanel: {
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.45)"
        : "rgba(248, 250, 252, 0.9)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.2)"
        : "rgba(148, 163, 184, 0.35)",
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: isDark ? "#E2E8F0" : "#0f172a",
      marginTop: 14,
      textAlign: "center",
    },
    emptySubtext: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "500",
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 20,
    },
    tabScrollContent: {
      flexDirection: "row",
      gap: 10,
      paddingBottom: 4,
      paddingRight: 4,
    },
    instrumentChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
      maxWidth: 260,
    },
    instrumentChipActive: {
      borderColor: colors.primary,
      backgroundColor: isDark
        ? `${String(colors.primary)}22`
        : `${String(colors.primary)}18`,
    },
    chipIcon: {
      marginRight: 8,
    },
    instrumentChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
      flexShrink: 1,
    },
    chipTextActive: {
      color: colors.primary,
    },
    detailSection: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.4)",
    },
    courseTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    courseThumb: {
      width: 52,
      height: 52,
      borderRadius: 16,
      marginRight: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: colors.inputBackground,
    },
    courseThumbPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 16,
      marginRight: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.06)"
        : "rgba(148, 163, 184, 0.08)",
    },
    courseTitleText: {
      flex: 1,
      minWidth: 0,
    },
    courseName: {
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
      lineHeight: 22,
    },
    courseInstrumentLine: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "rgba(167, 139, 250, 0.95)" : "rgba(109, 40, 217, 0.82)",
    },
    progressBlock: {
      marginBottom: 4,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    progressBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
    },
    progressBadgeText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primary,
    },
    progressTrack: {
      height: 10,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.15)"
        : "rgba(148, 163, 184, 0.22)",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: colors.primary,
    },
    innerDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.4)",
      marginVertical: 14,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },
    statRowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
    },
    statValuePill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(148, 163, 184, 0.14)",
      minWidth: 44,
      alignItems: "center",
    },
    statValueText: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.primary,
    },
    totalFoot: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    totalFootStrong: {
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#334155",
    },
  });

export default MyCourses;
