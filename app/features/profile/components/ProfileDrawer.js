import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { logout } from "../../../services/auth";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { useTeacherClasses } from "../../../shared/hooks/useTeacherClasses";
import MyCourses from "./MyCourses";
import CompleteProfileModal from "./modals/completeProfile";

const MusicProfile = ({ navigation }) => {
  const { user } = useAppContext();
  const { colors } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const { data: classes = [] } = useTeacherClasses(
    user?.role === "teacher" ? (user?.id ?? null) : null,
  );

  // use image from user.profilePicture
  const dynamicStyles = createStyles(colors);

  return (
    <>
      <ScrollView style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => navigation.closeDrawer()}>
            <Icon name="chevron-back" size={24} color={colors.text} />
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
        {/* Profile Section */}
        <View style={dynamicStyles.profileSection}>
          <Image
            source={
              user?.profilePicture
                ? { uri: user?.profilePicture }
                : require("../../../../assets/images/profileDefault.png")
            }
            style={dynamicStyles.profileImage}
          />
          <Text style={dynamicStyles.name}>{user?.name || "User"}</Text>
          <Text style={dynamicStyles.subtext}>{user?.email}</Text>
          <Text style={dynamicStyles.subtext}>
            {user?.role === "teacher" ? "Teacher" : "Student"}
          </Text>
          {/* <TouchableOpacity
            style={dynamicStyles.editProfileButton}
            onPress={() => setShowProfileModal(true)}
          >
            <Icon name="create-outline" size={16} color={colors.primaryText} />
            <Text style={dynamicStyles.editProfileButtonText}>
              Edit Profile
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Dashboard Summary - Teacher only */}
        {user?.role === "teacher" && (
          <View style={dynamicStyles.summaryContainer}>
            <Text style={dynamicStyles.summaryTitle}>Dashboard Summary</Text>
            <View style={dynamicStyles.summaryStats}>
              <View style={dynamicStyles.statItem}>
                <Text style={dynamicStyles.summaryStatNumber}>
                  {classes.length}
                </Text>
                <Text style={dynamicStyles.summaryStatLabel}>
                  Total Classes
                </Text>
              </View>
              <View style={dynamicStyles.statItem}>
                <Text style={dynamicStyles.summaryStatNumber}>
                  {classes.reduce(
                    (total, cls) => total + (cls.students?.length || 0),
                    0,
                  )}
                </Text>
                <Text style={dynamicStyles.summaryStatLabel}>
                  Total Students
                </Text>
              </View>
            </View>
          </View>
        )}

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

        {/* My courses Section */}
        {user?.role === "student" && <MyCourses userId={user?.id} />}

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
      </ScrollView>
      {/* Complete Profile Modal */}
      <CompleteProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={() => {
          // Modal handles profile update internally
          setShowProfileModal(false);
        }}
      />
    </>
  );
};

const StatItem = ({ number, label, colors, dynamicStyles }) => (
  <View style={{ alignItems: "center" }}>
    <Text style={[dynamicStyles.statNumber, { color: colors.primary }]}>
      {number}
    </Text>
    <Text style={[dynamicStyles.statLabel, { color: colors.textSecondary }]}>
      {label}
    </Text>
  </View>
);

const Badge = ({ title, count, colors, dynamicStyles }) => (
  <View style={[dynamicStyles.badge, { backgroundColor: colors.surface }]}>
    <Icon name="ribbon-outline" size={24} color={colors.primary} />
    <Text style={{ color: colors.text }}>
      {title} - {count}
    </Text>
  </View>
);

export default MusicProfile;

const createStyles = (colors) =>
  StyleSheet.create({
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
      alignItems: "center",
      marginVertical: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 10,
      color: colors.text,
    },
    subtext: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
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
    summaryContainer: {
      backgroundColor: "#2a2a2a",
      padding: 20,
      borderRadius: 15,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#404040",
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 20,
      textAlign: "center",
    },
    summaryStats: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
      backgroundColor: "#1e1e1e",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      minWidth: 120,
    },
    summaryStatNumber: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 6,
    },
    summaryStatLabel: {
      fontSize: 14,
      color: "#ffffff",
      textAlign: "center",
      fontWeight: "500",
      opacity: 0.9,
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
  });
