import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import type { Course } from "../../types/course";

export interface CoursePickerBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  courses: Course[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelectCourse: (course: Course) => void;
  onClose: () => void;
  title?: string;
}

export function CoursePickerBottomSheet({
  sheetRef,
  courses,
  isLoading,
  isError,
  onRetry,
  onSelectCourse,
  onClose,
  title = "Select course",
}: CoursePickerBottomSheetProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const snapPoints = useMemo(() => ["45%", "70%"], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={s.sheetBackground}
      handleIndicatorStyle={s.sheetHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={s.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sheetTitle}>{title}</Text>

        {isLoading ? (
          <View style={s.centeredState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.stateText}>Loading courses…</Text>
          </View>
        ) : isError ? (
          <View style={s.centeredState}>
            <Icon
              name="error-outline"
              size={36}
              color={colors.error}
              style={s.stateIcon}
            />
            <Text style={s.stateText}>Failed to load courses.</Text>
            <TouchableOpacity
              style={s.retryButton}
              activeOpacity={0.85}
              onPress={onRetry}
            >
              <Text style={s.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : courses.length === 0 ? (
          <View style={s.centeredState}>
            <Icon
              name="menu-book"
              size={36}
              color={
                isDark
                  ? "rgba(148, 163, 184, 0.65)"
                  : "rgba(100, 116, 139, 0.55)"
              }
              style={s.stateIcon}
            />
            <Text style={s.stateText}>No courses available.</Text>
          </View>
        ) : (
          courses.map((course) => (
            <TouchableOpacity
              key={course._id}
              activeOpacity={0.82}
              onPress={() => onSelectCourse(course)}
              accessibilityRole="button"
              style={s.coursePickerRow}
            >
              <View style={s.coursePickerIconWell}>
                <Icon
                  name="menu-book"
                  size={22}
                  color={
                    isDark
                      ? "rgba(167, 139, 250, 0.95)"
                      : "rgba(109, 40, 217, 0.85)"
                  }
                />
              </View>
              <View style={s.coursePickerTextBlock}>
                <Text style={s.coursePickerName} numberOfLines={2}>
                  {course.name}
                </Text>
                {course.instrument ? (
                  <Text style={s.coursePickerMeta} numberOfLines={1}>
                    {course.instrument}
                  </Text>
                ) : null}
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={
                  isDark
                    ? "rgba(148, 163, 184, 0.75)"
                    : "rgba(100, 116, 139, 0.85)"
                }
              />
            </TouchableOpacity>
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
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
      marginBottom: 12,
      paddingHorizontal: 12,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    centeredState: {
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 16,
      gap: 10,
    },
    stateIcon: {
      marginBottom: 4,
    },
    stateText: {
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    retryButton: {
      marginTop: 6,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.12)"
        : "rgba(255, 122, 46, 0.1)",
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primary,
    },
    coursePickerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 8,
      marginBottom: 10,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(148, 163, 184, 0.35)",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.04)"
        : "rgba(248, 250, 252, 0.95)",
    },
    coursePickerIconWell: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.35)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.08)"
        : "rgba(45, 212, 191, 0.08)",
    },
    coursePickerTextBlock: {
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    coursePickerName: {
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    coursePickerMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#CBD5E1" : "#64748B",
    },
  });
}
