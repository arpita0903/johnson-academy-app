import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { useTeacherContext } from "../../../context/TeacherContext";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import AttendanceCalendar from "../../../shared/components/AttendanceCalendar";

type AttendanceStudent = {
  id: string;
  name: string;
};

const getStudentId = (item: { user?: { id?: string; _id?: string } }) =>
  item.user?.id ?? item.user?._id ?? "";

const StudentList = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { batch } = route.params;
  const { colors, isDark } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const [attendanceStudent, setAttendanceStudent] =
    useState<AttendanceStudent | null>(null);

  const students = useMemo(() => batch?.students ?? [], [batch?.students]);

  const { selectStudent } = useTeacherContext();

  const handleStudentPress = (student: any) => {
    selectStudent(student);
    navigation.navigate("Course", { student, batch });
  };

  const openAttendanceSheet = (item: {
    user?: { id?: string; _id?: string; name?: string };
  }) => {
    const studentId = getStudentId(item);
    if (!studentId) return;

    setAttendanceStudent({
      id: studentId,
      name: item.user?.name ?? "Student",
    });
    bottomSheetRef.current?.expand();
  };

  const closeAttendanceSheet = () => {
    setAttendanceStudent(null);
  };

  const classId = batch?.id ?? batch?._id ?? "";
  const s = createStyles(colors, isDark);

  const renderHeader = () => (
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
                name="groups"
                size={28}
                color={
                  isDark
                    ? "rgba(167, 139, 250, 0.95)"
                    : "rgba(109, 40, 217, 0.85)"
                }
              />
            </View>
            <View style={s.heroTextBlock}>
              <Text style={s.heroTitle} numberOfLines={2}>
                {batch?.name ?? "Class"}
              </Text>
              <View style={s.heroSubRow}>
                <Icon
                  name="person-outline"
                  size={16}
                  color={
                    isDark
                      ? "rgba(148, 163, 184, 0.95)"
                      : "rgba(71, 85, 105, 0.9)"
                  }
                  style={s.heroSubIcon}
                />
                <Text style={s.heroSubtitle}>
                  {students.length}{" "}
                  {students.length === 1 ? "student" : "students"} enrolled
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmpty = () => (
    <View style={s.emptyState}>
      <Icon
        name="sentiment-neutral"
        size={44}
        color={
          isDark ? "rgba(148, 163, 184, 0.65)" : "rgba(100, 116, 139, 0.55)"
        }
        style={s.emptyIcon}
      />
      <Text style={s.emptyStateText}>No students in this class yet</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <FlatList
          data={students}
          keyExtractor={(item, index) =>
            item?._id != null ? String(item._id) : `student-${index}`
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            students.length === 0 ? s.listContentEmpty : s.listContent
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={s.studentCardTouchable}>
              <View style={s.studentGlassCard}>
                <View style={s.studentRow}>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => handleStudentPress(item.user)}
                    accessibilityRole="button"
                    style={s.studentMainTouchable}
                  >
                    <View style={s.studentMain}>
                      <View style={s.avatarWell}>
                        <Image
                          source={
                            item.user?.profilePicture
                              ? { uri: item.user.profilePicture }
                              : require("../../../../assets/images/profileDefault.png")
                          }
                          style={s.studentAvatar}
                          accessibilityLabel={`Photo of ${item.user?.name ?? "student"}`}
                        />
                      </View>
                      <View style={s.studentTextBlock}>
                        <Text style={s.studentName} numberOfLines={1}>
                          {item.user?.name ?? "Student"}
                        </Text>
                        <Text style={s.studentEmail} numberOfLines={2}>
                          {item.user?.rollNumber ?? ""}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View style={s.trail}>
                    <TouchableOpacity
                      onPress={() => openAttendanceSheet(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Attendance for ${item.user?.name ?? "student"}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={s.attendanceButton}
                    >
                      <Icon
                        name="calendar-month"
                        size={24}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={() => handleStudentPress(item.user)}
                      accessibilityRole="button"
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                    >
                      <Icon
                        name="chevron-right"
                        size={26}
                        color={
                          isDark
                            ? "rgba(148, 163, 184, 0.75)"
                            : "rgba(100, 116, 139, 0.85)"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={closeAttendanceSheet}
          backgroundStyle={s.sheetBackground}
          handleIndicatorStyle={s.sheetHandle}
        >
          <BottomSheetScrollView
            contentContainerStyle={s.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            {attendanceStudent && classId ? (
              <>
                <Text style={s.sheetTitle}>
                  Attendance — {attendanceStudent.name}
                </Text>
                <AttendanceCalendar
                  studentId={attendanceStudent.id}
                  classId={classId}
                />
              </>
            ) : null}
          </BottomSheetScrollView>
        </BottomSheet>
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
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 28,
    },
    listContentEmpty: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 28,
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
      marginTop: 8,
    },
    heroSubIcon: {
      marginRight: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
      flex: 1,
    },
    studentCardTouchable: {
      marginBottom: 14,
    },
    studentGlassCard: {
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    studentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    studentMainTouchable: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    studentMain: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },
    avatarWell: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.06)"
        : "rgba(148, 163, 184, 0.08)",
    },
    studentAvatar: {
      width: 44,
      height: 44,
      borderRadius: 12,
    },
    studentTextBlock: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
    },
    studentName: {
      fontWeight: "800",
      fontSize: 17,
      letterSpacing: -0.35,
      lineHeight: 22,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    studentEmail: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.3,
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    trail: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    attendanceButton: {
      padding: 6,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.12)"
        : "rgba(255, 122, 46, 0.1)",
    },
    sheetBackground: {
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    sheetHandle: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.45)"
        : "rgba(148, 163, 184, 0.55)",
    },
    sheetContent: {
      paddingHorizontal: 8,
      paddingBottom: 32,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
      textAlign: "center",
      marginBottom: 8,
      paddingHorizontal: 12,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
      minHeight: 280,
    },
    emptyIcon: {
      marginBottom: 14,
    },
    emptyStateText: {
      fontSize: 17,
      color: colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
      maxWidth: 280,
    },
  });

export default StudentList;
