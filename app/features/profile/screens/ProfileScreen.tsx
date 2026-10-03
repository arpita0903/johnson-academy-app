import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import MyCourses from "../components/MyCourses";
import TeachingOverviewSection from "../components/TeachingOverviewSection";
import { ProfilePhotoSourceSheet } from "../components/ProfilePhotoSourceSheet";
import { useUpdateProfilePicture } from "../hooks/useUpdateProfilePicture";

interface ProfileScreenProps {
  navigation?: unknown;
}

const ProfileScreen = (_props: ProfileScreenProps) => {
  const { user } = useAppContext();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const {
    isUpdating,
    isSourceSheetVisible,
    openSourceMenu,
    closeSourceSheet,
    onTakePhoto,
    onChooseFromGallery,
  } = useUpdateProfilePicture();

  const profilePictureUri =
    typeof user?.profilePicture === "string" && user.profilePicture.length > 0
      ? user.profilePicture
      : null;

  return (
    <SafeAreaView style={s.safeArea} edges={["top"]}>
      <ScreenGradientBackground isDark={isDark} />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroCard}>
          <TouchableOpacity
            style={s.avatarButton}
            onPress={openSourceMenu}
            disabled={isUpdating}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            accessibilityHint="Opens options to take a photo or choose from gallery"
          >
            <Image
              source={
                profilePictureUri
                  ? { uri: profilePictureUri }
                  : require("../../../../assets/images/profileDefault.png")
              }
              style={s.heroAvatar}
              accessibilityLabel="Profile photo"
            />
            {isUpdating ? (
              <View style={s.avatarOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={s.cameraBadge}>
                <Icon name="photo-camera" size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
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

      <ProfilePhotoSourceSheet
        visible={isSourceSheetVisible}
        onClose={closeSourceSheet}
        onTakePhoto={onTakePhoto}
        onChooseFromGallery={onChooseFromGallery}
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
    avatarButton: {
      position: "relative",
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
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(15, 23, 42, 0.45)",
    },
    cameraBadge: {
      position: "absolute",
      right: -4,
      bottom: -4,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: isDark ? "#0B1020" : "#FFFFFF",
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
