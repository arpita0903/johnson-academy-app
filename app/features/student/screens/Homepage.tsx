import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InstrumentSection from "../components/InstrumentSection";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";

interface HomepageProps {
  navigation: any;
}

const Homepage = ({ navigation }: HomepageProps) => {
  const { user } = useAppContext();
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  const handleSubmit = (classData: any) => {
    navigation.navigate("Course", { studentClass: classData });
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScrollView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.username}>
            Hello,{" "}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>
              {user?.name}
            </Text>
          </Text>
        </View>

        {/* Instruments Section */}
        <InstrumentSection onInstrumentPress={handleSubmit} />
      </ScrollView>
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
