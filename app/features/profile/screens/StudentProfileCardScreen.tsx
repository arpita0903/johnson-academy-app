import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
  Image,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../context/ThemeContext";
import { useToast } from "../../../context/ToastContext";
import { useAppContext } from "../../../context/AppContext";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import type { ThemeColors } from "../../../theme/colors";
import {
  completeProfileCard,
  fetchOwnProfile,
  fetchUser,
  logout,
  type User,
} from "../../../services/auth";
import {
  ageFromDateOfBirth,
  requiresParentDetails,
} from "../utils/studentProfile";
import { ProfilePhotoSourceSheet } from "../components/ProfilePhotoSourceSheet";
import {
  pickProfileImageFromCamera,
  pickProfileImageFromLibrary,
} from "../utils/profileImagePicker";
import {
  updateUserProfilePicture,
  type ProfileImageUpload,
} from "../../../services/upload";

const MAX_GUARDIANS = 3;

type GuardianDraft = {
  key: string;
  name: string;
  relation: string;
};

function draftKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const StudentProfileCardScreen = ({ navigation }: { navigation: any }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { showError, showSuccess } = useToast();
  const { login, logout: clearSession } = useAppContext();

  const [userId, setUserId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedPicture, setSavedPicture] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<ProfileImageUpload | null>(null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [guardians, setGuardians] = useState<GuardianDraft[]>([]);

  const parentsRequired = requiresParentDetails(dateOfBirth);
  const age = ageFromDateOfBirth(dateOfBirth);
  const hasPicture = Boolean(pickedImage?.uri || savedPicture);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    const parent = navigation.getParent?.();
    parent?.setOptions?.({ swipeEnabled: false });
    return () => {
      subscription.remove();
      parent?.setOptions?.({ swipeEnabled: true });
    };
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;

    const applyUser = (user: User) => {
      setUserId(user.id);
      setDateOfBirth(user.dateOfBirth ?? "");
      setMotherName(user.motherName ?? "");
      setFatherName(user.fatherName ?? "");
      setGuardians(
        (user.guardians ?? []).slice(0, MAX_GUARDIANS).map((guardian) => ({
          key: draftKey(),
          name: guardian.name ?? "",
          relation: guardian.relation ?? "",
        })),
      );
      setSavedPicture(
        typeof user.profilePicture === "string" && user.profilePicture.length > 0
          ? user.profilePicture
          : null,
      );
    };

    const load = async () => {
      const stored = await fetchUser();
      if (!stored?.id) {
        if (!cancelled) setLoadingProfile(false);
        return;
      }
      if (!cancelled) applyUser(stored);
      try {
        const fresh = await fetchOwnProfile(stored.id);
        if (!cancelled) applyUser(fresh);
      } catch {
        // Stored login details are enough to show the form.
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const choosePhoto = async (source: "camera" | "library") => {
    try {
      const image =
        source === "camera"
          ? await pickProfileImageFromCamera()
          : await pickProfileImageFromLibrary();
      if (image) setPickedImage(image);
    } catch (error) {
      const fallback =
        source === "camera"
          ? "Camera is not available on this device."
          : "Could not open your photo library.";
      showError(error instanceof Error ? error.message : fallback);
    }
  };

  const openPhotoMenu = () => {
    if (saving) return;
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Profile picture",
          options: ["Cancel", "Take photo", "Choose from gallery"],
          cancelButtonIndex: 0,
          userInterfaceStyle: isDark ? "dark" : "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) void choosePhoto("camera");
          if (buttonIndex === 2) void choosePhoto("library");
        },
      );
      return;
    }
    setPhotoSheetOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    clearSession();
    navigation.replace("Login");
  };

  const updateGuardian = (key: string, field: "name" | "relation", value: string) => {
    setGuardians((current) =>
      current.map((guardian) =>
        guardian.key === key ? { ...guardian, [field]: value } : guardian,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!hasPicture) return showError("Profile picture is required");
    if (!userId) return showError("Please log in again");
    if (!dateOfBirth) {
      return showError("Submit admission details before updating the profile card");
    }

    const filledGuardians = guardians
      .map((guardian) => ({
        name: guardian.name.trim(),
        relation: guardian.relation.trim(),
      }))
      .filter((guardian) => guardian.name || guardian.relation);

    if (parentsRequired) {
      if (!motherName.trim()) return showError("Mother's name is required");
      if (!fatherName.trim()) return showError("Father's name is required");
      if (filledGuardians.some((guardian) => !guardian.name || !guardian.relation)) {
        return showError("Guardian name and relation are required");
      }
    }

    setSaving(true);
    try {
      let pictureUrl = savedPicture;
      if (pickedImage) {
        const withPhoto = await updateUserProfilePicture(userId, pickedImage);
        pictureUrl =
          typeof withPhoto.profilePicture === "string" && withPhoto.profilePicture.length > 0
            ? withPhoto.profilePicture
            : pickedImage.uri;
        setSavedPicture(pictureUrl);
        setPickedImage(null);
      }

      const updated = await completeProfileCard(
        userId,
        parentsRequired
          ? {
              motherName: motherName.trim(),
              fatherName: fatherName.trim(),
              guardians: filledGuardians,
            }
          : {},
      );
      const nextUser = pictureUrl ? { ...updated, profilePicture: pictureUrl } : updated;
      await AsyncStorage.setItem("user", JSON.stringify(nextUser));
      login(nextUser);
      showSuccess("Profile card completed");
      navigation.replace("Homepage");
    } catch (error: any) {
      showError(error?.message || "Could not save your profile card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScreenGradientBackground isDark={isDark} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>Admission details saved</Text>
          <Text style={styles.title}>Student Profile Card</Text>
          <Text style={styles.subtitle}>
            {parentsRequired
              ? `You are ${age} years old, so a profile picture, mother's name, and father's name are required.`
              : "Add your profile picture to finish this step."}
          </Text>

          {loadingProfile ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.card}>
              <View style={styles.photoBlock}>
                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={openPhotoMenu}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityLabel="Upload profile picture"
                >
                  {pickedImage?.uri || savedPicture ? (
                    <Image
                      source={{ uri: pickedImage?.uri || savedPicture || undefined }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="photo-camera" size={28} color={colors.primary} />
                    </View>
                  )}
                  <View style={styles.avatarBadge}>
                    <Icon name="edit" size={14} color={colors.primaryText} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.photoLabel}>Profile picture *</Text>
                <Text style={styles.photoHint}>
                  Required. Tap to take a photo or choose one from your gallery.
                </Text>
              </View>

              {parentsRequired ? (
                <>
                  <FieldLabel label="Mother's name *" />
                  <TextInput
                    style={styles.input}
                    value={motherName}
                    onChangeText={setMotherName}
                    placeholder="Enter mother's name"
                    placeholderTextColor={colors.placeholderText}
                    autoCapitalize="words"
                    editable={!saving}
                    accessibilityLabel="Mother's name"
                  />

                  <FieldLabel label="Father's name *" />
                  <TextInput
                    style={styles.input}
                    value={fatherName}
                    onChangeText={setFatherName}
                    placeholder="Enter father's name"
                    placeholderTextColor={colors.placeholderText}
                    autoCapitalize="words"
                    editable={!saving}
                    accessibilityLabel="Father's name"
                  />

                  <View style={styles.guardianHeader}>
                    <Text style={styles.guardianTitle}>Guardians</Text>
                    <Text style={styles.guardianHint}>Optional. Up to 3.</Text>
                  </View>
                  {guardians.map((guardian, index) => (
                    <View key={guardian.key} style={styles.guardianCard}>
                      <View style={styles.guardianCardHeader}>
                        <Text style={styles.guardianIndex}>Guardian {index + 1}</Text>
                        <TouchableOpacity
                          onPress={() =>
                            setGuardians((current) =>
                              current.filter((item) => item.key !== guardian.key),
                            )
                          }
                          disabled={saving}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove guardian ${index + 1}`}
                        >
                          <Icon name="close" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={styles.input}
                        value={guardian.name}
                        onChangeText={(value) => updateGuardian(guardian.key, "name", value)}
                        placeholder="Guardian name"
                        placeholderTextColor={colors.placeholderText}
                        autoCapitalize="words"
                        editable={!saving}
                        accessibilityLabel={`Guardian ${index + 1} name`}
                      />
                      <TextInput
                        style={[styles.input, styles.guardianRelation]}
                        value={guardian.relation}
                        onChangeText={(value) => updateGuardian(guardian.key, "relation", value)}
                        placeholder="Relation, e.g. Uncle"
                        placeholderTextColor={colors.placeholderText}
                        autoCapitalize="words"
                        editable={!saving}
                        accessibilityLabel={`Guardian ${index + 1} relation`}
                      />
                    </View>
                  ))}
                  {guardians.length < MAX_GUARDIANS ? (
                    <TouchableOpacity
                      style={styles.addGuardian}
                      onPress={() =>
                        setGuardians((current) => [
                          ...current,
                          { key: draftKey(), name: "", relation: "" },
                        ])
                      }
                      disabled={saving}
                      accessibilityRole="button"
                      accessibilityLabel="Add guardian"
                    >
                      <Icon name="person-add" size={18} color={colors.primary} />
                      <Text style={styles.addGuardianText}>Add guardian</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.guardianHint}>You can add up to 3 guardians.</Text>
                  )}
                </>
              ) : null}

              {!hasPicture ? (
                <Text style={styles.requiredNote}>Add a profile picture to continue.</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.submit, (saving || !hasPicture) && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={saving || !hasPicture}
                accessibilityRole="button"
                accessibilityState={{ disabled: saving || !hasPicture }}
              >
                {saving ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={styles.submitText}>Submit profile card</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={handleLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProfilePhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onTakePhoto={() => {
          setPhotoSheetOpen(false);
          setTimeout(() => {
            void choosePhoto("camera");
          }, 180);
        }}
        onChooseFromGallery={() => {
          setPhotoSheetOpen(false);
          setTimeout(() => {
            void choosePhoto("library");
          }, 180);
        }}
      />
    </SafeAreaView>
  );
};

function FieldLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.text,
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 14,
      }}
    >
      {label}
    </Text>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 32 },
    kicker: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color: colors.primary,
    },
    title: {
      marginTop: 6,
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 16,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    loader: { marginTop: 32 },
    card: {
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 16,
    },
    photoBlock: { alignItems: "center", marginBottom: 4 },
    avatarButton: { width: 96, height: 96 },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.inputBackground,
    },
    avatarPlaceholder: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,107,53,0.16)" : "#FFF1EA",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    avatarBadge: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    photoLabel: {
      marginTop: 10,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    photoHint: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
      color: colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    guardianHeader: { marginTop: 18, marginBottom: 8 },
    guardianTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    guardianHint: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    guardianCard: {
      marginTop: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: colors.inputBackground,
    },
    guardianCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    guardianIndex: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
    guardianRelation: { marginTop: 8 },
    addGuardian: {
      marginTop: 12,
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    addGuardianText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
    requiredNote: {
      marginTop: 16,
      fontSize: 13,
      color: colors.primary,
      textAlign: "center",
    },
    submit: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    submitDisabled: { opacity: 0.55 },
    submitText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
    logout: { alignItems: "center", marginTop: 20, padding: 8 },
    logoutText: { color: colors.textSecondary, fontSize: 15, fontWeight: "600" },
  });
}

export default StudentProfileCardScreen;
