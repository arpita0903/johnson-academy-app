import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { useTeacherContext } from "../../../context/TeacherContext";
import { ThemeColors } from "../../../theme/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTeacherClasses } from "../../../shared/hooks/useTeacherClasses";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import type { ClassByTeacher } from "../../../types/classes";

const MUSIC_BLUE = "#7DD3FC";
const MUSIC_CORAL = "#FB7185";

interface TeacherDashboardProps {
  navigation: any;
}

const TeacherDashboard = ({ navigation }: TeacherDashboardProps) => {
  const { user } = useAppContext();
  const { selectClass } = useTeacherContext();
  const { colors, isDark } = useTheme();
  const userId = user?.id ?? null;
  const s = createStyles(colors, isDark);

  const { data: classes = [], isLoading, isError } = useTeacherClasses(userId);
  useRefreshOnFocus();

  const handleClassPress = (classItem: ClassByTeacher) => {
    navigation.navigate("StudentList", {
      batch: {
        id: classItem.id,
        name: classItem.name,
        students: classItem.studentsInClass,
      },
    });
    selectClass(classItem);
  };

  const displayName = user?.name?.trim() || "Teacher";
  const profilePictureUri =
    typeof user?.profilePicture === "string" && user.profilePicture.length > 0
      ? user.profilePicture
      : null;

  const renderItem: ListRenderItem<ClassByTeacher> = ({ item }) => {
    const enrolled = new Set(
      item.studentsInClass
        ?.map((entry) => entry.user?.id)
        .filter((id): id is string => Boolean(id)) ?? [],
    ).size;
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => handleClassPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}, student list`}
        style={s.classCardTouchable}
      >
        <View style={s.classGlassCard}>
          <View style={s.classRow}>
            <View style={s.classMain}>
              <View style={s.courseThumbWell}>
                {item.courseId?.image ? (
                  <Image
                    source={{ uri: item.courseId.image }}
                    style={s.courseThumb}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={s.courseThumbPlaceholder}>
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
                )}
              </View>
              <View style={s.classTextBlock}>
                <Text style={s.classTitle} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={s.classMetaRow}>
                  <Icon
                    name="person-outline"
                    size={14}
                    color={
                      isDark
                        ? "rgba(148, 163, 184, 0.95)"
                        : "rgba(71, 85, 105, 0.9)"
                    }
                    style={s.classMetaIcon}
                  />
                  <Text style={s.classMetaText}>
                    {enrolled} {enrolled === 1 ? "student" : "students"}{" "}
                    enrolled
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.classTrail}>
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
        </View>
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View>
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
              <Image
                source={
                  profilePictureUri
                    ? { uri: profilePictureUri }
                    : require("../../../../assets/images/round-logo.png")
                }
                style={s.heroAvatar}
                accessibilityLabel="Profile photo"
                resizeMode="cover"
              />
              <View style={s.heroTextBlock}>
                <Text style={s.heroTitle} numberOfLines={2}>
                  Hello, <Text style={s.heroTitleAccent}>{displayName}</Text>
                </Text>
                <View style={s.heroSubRow}>
                  <Icon
                    name="menu-book"
                    size={18}
                    color={
                      isDark
                        ? "rgba(167, 139, 250, 0.85)"
                        : "rgba(109, 40, 217, 0.65)"
                    }
                    style={s.heroEqIcon}
                  />
                  <Text style={s.heroSubtitle}>
                    <Text style={s.subMusic}>Teach </Text>
                    <Text style={s.subNeutral}>with purpose — </Text>
                    <Text style={s.subDance}>inspire </Text>
                    <Text style={s.subNeutral}>growth</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
      {classes.length > 0 ? (
        <Text style={s.sectionLabel}>Your classes</Text>
      ) : null}
    </View>
  );

  const listEmpty = (
    <View style={s.emptyCard}>
      <View style={s.emptyIconCircle}>
        <Icon name="folder-open" size={32} color={colors.primary} />
      </View>
      <Text style={s.emptyTitle}>No classes yet</Text>
      <Text style={s.emptySubtext}>
        When you’re assigned to classes, they’ll appear here so you can open the
        student list for each one.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.stateText}>Loading your classes…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={s.safeArea} edges={["top"]}>
        <ScreenGradientBackground isDark={isDark} />
        <View style={s.stateWrap}>
          <Icon
            name="error-outline"
            size={40}
            color={isDark ? MUSIC_CORAL : "#be123c"}
            style={s.stateIcon}
          />
          <Text style={s.stateTitle}>Couldn’t load classes</Text>
          <Text style={s.stateSubtext}>
            Check your connection and pull to refresh, or try again shortly.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <ScreenGradientBackground isDark={isDark} />
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
      flexGrow: 1,
    },
    stateWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      backgroundColor: "transparent",
    },
    stateIcon: {
      marginBottom: 16,
      opacity: 0.95,
    },
    stateTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    stateText: {
      marginTop: 16,
      fontSize: 15,
      color: isDark ? "#94A3B8" : "#64748B",
      fontWeight: "500",
      textAlign: "center",
    },
    stateSubtext: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      maxWidth: 300,
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
    heroAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginRight: 14,
      borderWidth: 2,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.45)"
        : "rgba(45, 212, 191, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.6)"
        : "rgba(255, 255, 255, 0.9)",
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      fontSize: 23,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.4,
      lineHeight: 30,
    },
    heroTitleAccent: {
      color: colors.primary,
      fontWeight: "800",
    },
    heroSubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },
    heroEqIcon: {
      marginRight: 8,
    },
    heroSubtitle: {
      flexShrink: 1,
      fontSize: 11,
      lineHeight: 19,
    },
    subMusic: {
      color: isDark ? MUSIC_BLUE : "#0d9488",
      fontWeight: "600",
    },
    subNeutral: {
      color: isDark ? "#94A3B8" : "#64748B",
      fontWeight: "500",
    },
    subDance: {
      color: isDark ? MUSIC_CORAL : "#7C3AED",
      fontWeight: "600",
    },
    sectionLabel: {
      fontSize: 20,
      ...Platform.select({
        ios: { fontFamily: "Snell Roundhand" },
        android: { fontFamily: "serif" },
      }),
      fontWeight: "800",
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
      marginTop: 10,
      marginBottom: 12,
      marginLeft: 2,
    },
    classCardTouchable: {
      marginBottom: 14,
    },
    classGlassCard: {
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
    classRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    classMain: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      marginRight: 8,
    },
    courseThumbWell: {
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
    courseThumb: {
      width: 44,
      height: 44,
      borderRadius: 12,
    },
    courseThumbPlaceholder: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    classTextBlock: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
    },
    classTitle: {
      fontWeight: "800",
      fontSize: 17,
      letterSpacing: -0.35,
      lineHeight: 22,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    classCourseLine: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    classMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    classMetaIcon: {
      marginRight: 6,
    },
    classMetaText: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.2,
      color: isDark ? "#CBD5E1" : "#64748B",
      flex: 1,
    },
    classTrail: {
      justifyContent: "center",
      paddingLeft: 4,
    },
    emptyCard: {
      alignItems: "center",
      paddingVertical: 36,
      paddingHorizontal: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.16)"
        : "rgba(167, 139, 250, 0.22)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.72)"
        : "rgba(255, 255, 255, 0.82)",
      marginTop: 12,
    },
    emptyIconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    emptyTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      maxWidth: 300,
    },
  });

export default TeacherDashboard;
