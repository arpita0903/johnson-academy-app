import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUser, User } from "../services/auth";
//import { moduleData } from "../services/module";
import { courseData } from "../services/course";
import InstrumentSection from "../components/InstrumentSection";
import AssignmentSection from "../components/AssignmentSection";
import CompleteProfileModal, {
  ProfileData,
} from "../components/modals/completeProfile";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";

interface HomepageProps {
  navigation: any;
}

const Homepage = ({ navigation }: HomepageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const handleSubmit = (classData: any) => {
    // You can now use the progressId to fetch progress data or navigate with it

    navigation.navigate("Course", { studentClass: classData });
  };

  const handleProfileSubmit = (data: ProfileData) => {
    // Here you would typically update the user profile in your backend

    // Close modal and update user state
    setShowProfileModal(false);
    setUser((prev) => (prev ? { ...prev, isCompleteProfile: true } : null));

    // Alert.alert("Success", "Profile completed successfully!");
  };

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      if (userData) {
        setUser(userData);
        // Show modal if profile is incomplete
        if (!userData.isCompleteProfile) {
          setShowProfileModal(true);
        }
      }
    };

    loadUser();
  }, []);

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScrollView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.welcome}>Welcome,</Text>
          <Text style={dynamicStyles.username}>
            Hello,{" "}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>
              {user?.name}
            </Text>
          </Text>
        </View>

        {/* Offer Banner */}
        {/* <TouchableOpacity style={dynamicStyles.banner}>
          <View>
            <Text style={dynamicStyles.bannerTitle}>
              Musical Instruments Offer
            </Text>
            <Text style={dynamicStyles.bannerTitle}>Click to Grab now!!</Text>
          </View>
          <Image
            source={require("../../assets/images/instruments.png")}
            style={{ width: 150, height: 120 }}
          />
        </TouchableOpacity> */}

        {/* Instruments Section */}
        <InstrumentSection onInstrumentPress={handleSubmit} />

        {/* Assignment Section */}
        <AssignmentSection navigation={navigation} studentId={user?.id} />
      </ScrollView>

      {/* Profile Completion Modal */}
      <CompleteProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    header: {
      marginBottom: 20,
    },
    welcome: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    username: {
      fontSize: 20,
      color: colors.text,
      marginTop: 4,
    },
    banner: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      position: "relative",
      overflow: "hidden",
      flex: 1,
      justifyContent: "space-between",
      flexDirection: "row",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    bannerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primaryText,
      marginBottom: 4,
    },
    bannerCTA: {
      color: colors.error,
      marginTop: 4,
      fontWeight: "bold",
      fontSize: 14,
    },
    bannerImage: {
      position: "absolute",
      width: 100,
      height: 100,
      right: 0,
      top: 0,
      resizeMode: "contain",
    },
    seeAll: {
      color: colors.primary,
      fontWeight: "600",
    },
    eventRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

export default Homepage;
