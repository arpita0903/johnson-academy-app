import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { logout } from "../../../services/auth";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import CompleteProfileModal from "./modals/completeProfile";
import { ScreenGradientBackground } from "@/app/shared/components/ScreenGradientBackground";
import type { ThemeColors } from "../../../theme/colors";

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 16,
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
    },
    profileImage: {
      width: 68,
      height: 68,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
    },
    profileTextBlock: {
      flex: 1,
      minWidth: 0,
      marginLeft: 14,
      justifyContent: "center",
    },
    name: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    subtext: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      marginTop: 4,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 16,
      gap: 6,
    },
    editProfileButtonText: {
      color: colors.primaryText,
      fontSize: 14,
      fontWeight: "600",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginTop: 16,
    },
    statNumber: {
      fontSize: 16,
      fontWeight: "bold",
    },
    statLabel: {
      fontSize: 12,
    },
    logoutButton: {
      backgroundColor: colors.error,
      color: colors.primaryText,
      padding: 8,
      borderRadius: 6,
      fontWeight: "bold",
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.text,
    },
    cardSub: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    minsTag: {
      alignSelf: "flex-end",
      backgroundColor: colors.surface,
      padding: 6,
      borderRadius: 12,
      marginTop: 4,
      fontSize: 12,
      fontWeight: "500",
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 12,
    },
    progressItem: {
      alignItems: "center",
    },
    progressPercent: {
      fontWeight: "bold",
      fontSize: 14,
      color: colors.primary,
    },
    progressDate: {
      fontSize: 10,
      color: colors.textMuted,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: colors.text,
    },
    learnMore: {
      position: "absolute",
      right: 16,
      top: 16,
      fontSize: 12,
      color: colors.primary,
    },
    levelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    levelText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    badgeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
    },
    badge: {
      alignItems: "center",
      gap: 4,
      padding: 8,
      borderRadius: 8,
    },
    pieChartPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    peerRankLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
    },
    peerRank: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 4,
      color: colors.primary,
    },
    groupItem: {
      marginTop: 12,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
    },
    groupName: {
      fontWeight: "bold",
      fontSize: 14,
      color: colors.text,
    },
    groupMembers: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    drawerScroll: {
      flex: 1,
    },
    drawerScrollContent: {
      paddingBottom: 28,
      flexGrow: 1,
    },
    navSection: {
      marginBottom: 20,
    },
    navSectionLabel: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: isDark ? "#64748B" : "#475569",
      marginBottom: 10,
      marginLeft: 4,
    },
    navLinkRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.22)"
        : "rgba(148, 163, 184, 0.35)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.72)"
        : "rgba(255, 255, 255, 0.85)",
    },
    navLinkIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.12)"
        : `${colors.primary}14`,
    },
    navLinkLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    roleCaption: {
      marginTop: 8,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: colors.primary,
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : `${colors.primary}18`,
    },
  });
}

function ProfileDrawer({ navigation }: DrawerContentComponentProps) {
  const { user } = useAppContext();
  const { colors, isDark } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const dynamicStyles = createStyles(colors, isDark);

  return (
    <>
      <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
        {/* Header */}
        <ScreenGradientBackground isDark={isDark} />
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Main", params: { screen: "Login" } }],
              });
            }}
          >
            <Text style={dynamicStyles.logoutButton}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={dynamicStyles.drawerScroll}
          contentContainerStyle={dynamicStyles.drawerScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={dynamicStyles.profileSection}>
            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require("../../../../assets/images/profileDefault.png")
              }
              style={dynamicStyles.profileImage}
            />
            <View style={dynamicStyles.profileTextBlock}>
              <Text style={dynamicStyles.name} numberOfLines={2}>
                {user?.name || "User"}
              </Text>
              {user?.email ? (
                <Text style={dynamicStyles.subtext} numberOfLines={2}>
                  {user.email}
                </Text>
              ) : null}
              <Text style={dynamicStyles.roleCaption}>
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </Text>
            </View>
          </View>

          <View style={dynamicStyles.navSection}>
            <TouchableOpacity
              style={dynamicStyles.navLinkRow}
              activeOpacity={0.82}
              onPress={() => {
                navigation.closeDrawer();
                (navigation as any).navigate("Main", {
                  screen: "Profile",
                });
              }}
            >
              <View style={dynamicStyles.navLinkIconWrap}>
                <MaterialIcons name="person" size={22} color={colors.primary} />
              </View>
              <Text style={dynamicStyles.navLinkLabel}>Profile</Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={
                  isDark
                    ? "rgba(148, 163, 184, 0.75)"
                    : "rgba(100, 116, 139, 0.85)"
                }
              />
            </TouchableOpacity>
            {/* Temporarily hidden: Assignments
            {user?.role === "student" ? (
              <TouchableOpacity
                style={dynamicStyles.navLinkRow}
                activeOpacity={0.82}
                onPress={() => {
                  navigation.closeDrawer();
                  (navigation as any).navigate("Main", {
                    screen: "StudentAssignments",
                  });
                }}
              >
                <View style={dynamicStyles.navLinkIconWrap}>
                  <MaterialIcons
                    name="assignment"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text style={dynamicStyles.navLinkLabel}>Assignments</Text>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    isDark
                      ? "rgba(148, 163, 184, 0.75)"
                      : "rgba(100, 116, 139, 0.85)"
                  }
                />
              </TouchableOpacity>
            ) : null}
            */}
          </View>
        </ScrollView>

        {/* <View style={dynamicStyles.statsRow}>
          {user?.role === "teacher" ? (
            <>
              <StatItem
                number="5"
                label="Classes"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <StatItem
                number="24"
                label="Students"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <StatItem
                number="4.8"
                label="Rating"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
            </>
          ) : (
            <>
              <StatItem
                number="14/20"
                label="Classes"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <StatItem
                number="5"
                label="Assignment Submitted"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <StatItem
                number="9.5"
                label="Score"
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
            </>
          )}
        </View> */}

        {/* Weekly Practice Card */}
        {/* <View style={dynamicStyles.card}> */}
        {/* <Text style={dynamicStyles.cardTitle}>18 May - 24 May</Text> */}
        {/*<Text style={styles.cardSub}>Completed 0% of your weekly goal</Text>*/}
        {/*<Text style={styles.minsTag}>0/300 MIN</Text>*/}
        {/* Weekly Progress */}
        {/* <View style={dynamicStyles.progressRow}>
          {["20%", "60%", "30%", "0%"].map((item, i) => (
            <View key={i} style={dynamicStyles.progressItem}>
              <Text style={dynamicStyles.progressPercent}>{item}</Text>
              <Text style={dynamicStyles.progressDate}>
                {["JUN", "JUL", "AUG", "SEPT"][i]}
              </Text>
            </View>
          ))}
        </View> */}
        {/* </View> */}
        {/* Active Level */}
        {/*<View style={styles.card}>
                <Text style={styles.sectionTitle}>Active Level</Text>
                <Text style={styles.learnMore}>Learn More</Text>
                <View style={styles.levelRow}>
                    {['Warming Up', 'Active', 'Super Active', 'On Fire'].map((level, index) => (
                        <Text key={index} style={styles.levelText}>{level}</Text>
                    ))}
                </View>
            </View>*/}
        {/* Badges */}
        {/* <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>
          {user?.role === "teacher" ? "Teaching Badges" : "Appreciation Badges"}
        </Text>
        <View style={dynamicStyles.badgeRow}>
          {user?.role === "teacher" ? (
            <>
              <Badge
                title="Expert Teacher"
                count={"5+ years"}
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <Badge
                title="Student Favorite"
                count={24}
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
            </>
          ) : (
            <>
              <Badge
                title="Punctual"
                count={"90 %"}
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
              <Badge
                title="Best Student"
                count={13}
                colors={colors}
                dynamicStyles={dynamicStyles}
              />
            </>
          )}
        </View>
      </View> */}
        {/* Leaderboard */}
        {/* Music Stats Overview */}
        {/* <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.sectionTitle}>
          {user?.role === "teacher" ? "Teaching Overview" : "Leaderboard"}
        </Text>
        <Text style={dynamicStyles.learnMore}>
          {user?.role === "teacher" ? "View Analytics" : "View Leaderboard"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 12,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View style={dynamicStyles.pieChartPlaceholder}>
              <Text style={[dynamicStyles.legendText, { fontWeight: "bold" }]}>
                {user?.role === "teacher" ? "Classes" : "Pie Chart"}
              </Text>
            </View>
            <View style={{ marginTop: 8 }}>
              {user?.role === "teacher" ? (
                <>
                  <Text style={dynamicStyles.legendText}>
                    🎹 Piano Classes - 15
                  </Text>
                  <Text style={dynamicStyles.legendText}>
                    🎸 Guitar Classes - 8
                  </Text>
                  <Text style={dynamicStyles.legendText}>
                    🥁 Other Classes - 5
                  </Text>
                </>
              ) : (
                <>
                  <Text style={dynamicStyles.legendText}>🎹 Piano - 93</Text>
                  <Text style={dynamicStyles.legendText}>🎸 Guitar - 24</Text>
                  <Text style={dynamicStyles.legendText}>🥁 Other - 28</Text>
                </>
              )}
            </View>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={dynamicStyles.peerRankLabel}>
              {user?.role === "teacher" ? "Teacher Rank" : "Peer Rank"}
            </Text>
            <Text style={dynamicStyles.peerRank}>
              {user?.role === "teacher" ? "#3" : "#21"}
            </Text>
          </View>
        </View>
      </View> */}
        {/* Groups */}
        {/*<View style={styles.card}>
                <Text style={styles.sectionTitle}>Groups</Text>
                <View style={styles.groupItem}>
                    <Text style={styles.groupName}>🎼 Bangalore Piano Circle</Text>
                    <Text style={styles.groupMembers}>249 Members</Text>
                </View>
            </View>*/}
      </SafeAreaView>
      {/* Complete Profile Modal */}
      <CompleteProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={() => {
          setShowProfileModal(false);
        }}
      />
    </>
  );
}

export default ProfileDrawer;
