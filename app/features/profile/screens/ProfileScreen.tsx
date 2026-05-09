import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import MyCourses from "../components/MyCourses";
import TeachingOverviewSection from "../components/TeachingOverviewSection";

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen = (_props: ProfileScreenProps) => {
  const { user } = useAppContext();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <Image
            source={
              user?.profilePicture
                ? { uri: user.profilePicture }
                : require("../../../../assets/images/profileDefault.png")
            }
            style={s.heroAvatar}
            accessibilityLabel="Profile photo"
          />
          <View style={s.heroTextBlock}>
            <Text style={s.heroName} numberOfLines={2}>
              {user?.name?.trim() || "User"}
            </Text>
            {user?.email ? (
              <Text style={s.heroEmail} numberOfLines={2}>
                {user.email}
              </Text>
            ) : null}
            <View style={s.rolePill}>
              <Text style={s.rolePillText}>
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </Text>
            </View>
          </View>
        </View>

        {user?.role === "student" ? (
          <MyCourses userId={user?.id} />
        ) : (
          <TeachingOverviewSection teacherId={user?.id} />
        )}
      </ScrollView>
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
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      flexGrow: 1,
    },
    heroCard: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.22)"
        : "rgba(167, 139, 250, 0.28)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.88)"
        : "rgba(255, 255, 255, 0.92)",
    },
    heroAvatar: {
      width: 72,
      height: 72,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.45)"
        : "rgba(45, 212, 191, 0.45)",
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
      marginLeft: 14,
      justifyContent: "center",
    },
    heroName: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    heroEmail: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    rolePill: {
      marginTop: 8,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : `${colors.primary}18`,
    },
    rolePillText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
  });

export default ProfileScreen;
