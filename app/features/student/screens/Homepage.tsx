import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import InstrumentSection, {
  StudentCoursePressPayload,
} from "../components/InstrumentSection";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";

/** Hero accents — teal / violet stage-light vibe */
const MUSIC_BLUE = "#7DD3FC";
const MUSIC_CORAL = "#FB7185";

interface HomepageProps {
  navigation: any;
}

const Homepage = ({ navigation }: HomepageProps) => {
  const { user } = useAppContext();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);

  const handleSubmit = ({ studentClass, course }: StudentCoursePressPayload) => {
    navigation.navigate("Course", {
      studentClass,
      course: { ...course, id: course._id },
    });
  };

  const displayName = user?.name?.trim() || "Student";

  const profilePictureUri =
    typeof user?.profilePicture === "string" && user.profilePicture.length > 0
      ? user.profilePicture
      : null;

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroOuter}>
          <LinearGradient
            colors={
              isDark
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
                      name="graphic-eq"
                      size={18}
                      color={
                        isDark
                          ? "rgba(167, 139, 250, 0.85)"
                          : "rgba(109, 40, 217, 0.65)"
                      }
                      style={s.heroEqIcon}
                    />
                    <Text style={s.heroSubtitle}>
                      <Text style={s.subMusic}>Practice </Text>
                      <Text style={s.subNeutral}>today — </Text>
                      <Text style={s.subDance}>perform </Text>
                      <Text style={s.subNeutral}>tomorrow</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <InstrumentSection onInstrumentPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#040814" : colors.background,
      paddingTop: 12,
    },
    scroll: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 28,
    },
    heroOuter: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 22,
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
      fontSize: 13,
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
  });

export default Homepage;
