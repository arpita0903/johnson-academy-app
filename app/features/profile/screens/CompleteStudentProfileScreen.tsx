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
  Modal,
  Pressable,
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
  completeStudentProfile,
  fetchOwnProfile,
  fetchUser,
  logout,
  type User,
} from "../../../services/auth";
import {
  GENDERS,
  REFERRAL_SOURCES,
  formatProfileDate,
  isStudentProfileComplete,
  needsProfileCardUpdate,
  referralLabel,
  toDateKey,
  type Gender,
  type ReferralSource,
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

type DobStep = "year" | "month" | "day";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function dobYears(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, index) => current - index);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dateKey(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${month}-${dayText}`;
}

type Option = { value: string; label: string };

const CompleteStudentProfileScreen = ({ navigation }: { navigation: any }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { showError, showSuccess } = useToast();
  const { login, logout: clearSession } = useAppContext();

  const [userId, setUserId] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [occupation, setOccupation] = useState("");
  const [referralSource, setReferralSource] = useState<ReferralSource | "">("");
  const [referralSourceOther, setReferralSourceOther] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [savedPicture, setSavedPicture] = useState<string | null>(null);
  const [pickedImage, setPickedImage] = useState<ProfileImageUpload | null>(null);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const [dobStep, setDobStep] = useState<DobStep>("year");
  const [dobYear, setDobYear] = useState<number | null>(null);
  const [dobMonth, setDobMonth] = useState<number | null>(null);
  const [optionPicker, setOptionPicker] = useState<{
    title: string;
    options: readonly Option[];
    onSelect: (value: string) => void;
  } | null>(null);

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
      setDateOfBirth(toDateKey(user.dateOfBirth));
      setGender(
        GENDERS.some((option) => option.value === user.gender)
          ? (user.gender as Gender)
          : "",
      );
      setOccupation(user.occupation ?? "");
      setReferralSource(
        REFERRAL_SOURCES.some((option) => option.value === user.referralSource)
          ? (user.referralSource as ReferralSource)
          : "",
      );
      setReferralSourceOther(user.referralSourceOther ?? "");
      setAddress(user.address ?? "");
      setEmergencyPhone(user.emergencyContact?.phone ?? "");
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
          title: "Profile photo",
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

  const handleSubmit = async () => {
    const phoneDigits = emergencyPhone.replace(/\D/g, "");
    if (!dateOfBirth) return showError("Date of birth is required");
    if (!gender) return showError("Gender is required");
    if (!occupation.trim()) return showError("Occupation is required");
    if (!referralSource) return showError("Tell us how you heard about us");
    if (referralSource === "other" && !referralSourceOther.trim()) {
      return showError("Please specify how you heard about us");
    }
    if (!address.trim()) return showError("Address is required");
    if (phoneDigits.length < 8) {
      return showError("Enter a valid emergency contact number");
    }
    if (!userId) return showError("Please log in again");

    setSaving(true);
    try {
      let pictureUrl = savedPicture;
      if (pickedImage) {
        const withPhoto = await updateUserProfilePicture(userId, pickedImage);
        pictureUrl =
          typeof withPhoto.profilePicture === "string" &&
          withPhoto.profilePicture.length > 0
            ? withPhoto.profilePicture
            : pickedImage.uri;
      }

      const updated = await completeStudentProfile(userId, {
        dateOfBirth,
        gender,
        occupation: occupation.trim(),
        referralSource,
        referralSourceOther:
          referralSource === "other" ? referralSourceOther.trim() : "",
        address: address.trim(),
        emergencyContact: { phone: emergencyPhone.trim() },
      });
      if (!isStudentProfileComplete(updated)) {
        showError("Profile is still missing required details");
        return;
      }
      const nextUser = pictureUrl
        ? { ...updated, profilePicture: pictureUrl }
        : updated;
      await AsyncStorage.setItem("user", JSON.stringify(nextUser));
      login(nextUser);
      showSuccess("Admission details saved");
      navigation.replace(
        needsProfileCardUpdate(nextUser) ? "ProfileCard" : "Homepage",
      );
    } catch (error: any) {
      showError(error?.message || "Could not save your profile");
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
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>
            These details are required before you can use the app.
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
                  accessibilityLabel="Upload profile photo"
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
                <Text style={styles.photoLabel}>Profile photo</Text>
                <Text style={styles.photoHint}>Optional. Tap to take or choose a photo.</Text>
              </View>

              <FieldLabel label="Date of birth" />
              <SelectRow
                styles={styles}
                colors={colors}
                value={formatProfileDate(dateOfBirth)}
                placeholder="Select date of birth"
                icon="cake"
                onPress={() => {
                  const key = toDateKey(dateOfBirth);
                  if (key) {
                    const [year, month] = key.split("-").map(Number);
                    setDobYear(year || null);
                    setDobMonth(month ? month - 1 : null);
                  } else {
                    setDobYear(null);
                    setDobMonth(null);
                  }
                  setDobStep("year");
                  setDobOpen(true);
                }}
              />

              <FieldLabel label="Gender" />
              <View style={styles.chipRow}>
                {GENDERS.map((option) => {
                  const selected = gender === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setGender(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <FieldLabel label="Occupation" />
              <TextInput
                style={styles.input}
                value={occupation}
                onChangeText={setOccupation}
                placeholder="e.g. Student, Engineer"
                placeholderTextColor={colors.placeholderText}
                autoCapitalize="words"
              />

              <FieldLabel label="How did you hear about us" />
              <SelectRow
                styles={styles}
                colors={colors}
                value={referralLabel(referralSource)}
                placeholder="Select an option"
                icon="campaign"
                onPress={() =>
                  setOptionPicker({
                    title: "How did you hear about us",
                    options: REFERRAL_SOURCES,
                    onSelect: (value) => {
                      setReferralSource(value as ReferralSource);
                      if (value !== "other") setReferralSourceOther("");
                    },
                  })
                }
              />
              {referralSource === "other" ? (
                <TextInput
                  style={styles.input}
                  value={referralSourceOther}
                  onChangeText={setReferralSourceOther}
                  placeholder="Please specify"
                  placeholderTextColor={colors.placeholderText}
                />
              ) : null}

              <FieldLabel label="Address" />
              <TextInput
                style={[styles.input, styles.address]}
                value={address}
                onChangeText={setAddress}
                placeholder="House, street, city"
                placeholderTextColor={colors.placeholderText}
                multiline
                textAlignVertical="top"
              />

              <FieldLabel label="Emergency contact number" />
              <TextInput
                style={styles.input}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="Enter emergency number"
                placeholderTextColor={colors.placeholderText}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[styles.submit, saving && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={styles.submitText}>Save and continue</Text>
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

      <Modal
        visible={dobOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDobOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDobOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Date of birth</Text>
            <DobPicker
              styles={styles}
              step={dobStep}
              year={dobYear}
              month={dobMonth}
              selectedDate={dateOfBirth}
              onStep={setDobStep}
              onYear={(year) => {
                setDobYear(year);
                setDobMonth(null);
                setDobStep("month");
              }}
              onMonth={(month) => {
                setDobMonth(month);
                setDobStep("day");
              }}
              onDay={(day) => {
                if (dobYear == null || dobMonth == null) return;
                setDateOfBirth(dateKey(dobYear, dobMonth, day));
                setDobOpen(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={optionPicker != null}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionPicker(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOptionPicker(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{optionPicker?.title}</Text>
            {optionPicker?.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionRow}
                onPress={() => {
                  optionPicker.onSelect(option.value);
                  setOptionPicker(null);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {referralSource === option.value ? (
                  <Icon name="check" size={18} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

function DobPicker({
  styles,
  step,
  year,
  month,
  selectedDate,
  onStep,
  onYear,
  onMonth,
  onDay,
}: {
  styles: ReturnType<typeof createStyles>;
  step: DobStep;
  year: number | null;
  month: number | null;
  selectedDate: string;
  onStep: (step: DobStep) => void;
  onYear: (year: number) => void;
  onMonth: (month: number) => void;
  onDay: (day: number) => void;
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const selected = toDateKey(selectedDate);
  const years = dobYears();

  return (
    <View>
      <View style={styles.stepRow}>
        <TouchableOpacity onPress={() => onStep("year")}>
          <Text style={[styles.stepText, step === "year" && styles.stepTextActive]}>
            {year ?? "Year"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.stepDivider}>/</Text>
        <TouchableOpacity
          disabled={year == null}
          onPress={() => year != null && onStep("month")}
        >
          <Text
            style={[
              styles.stepText,
              step === "month" && styles.stepTextActive,
              year == null && styles.stepTextDisabled,
            ]}
          >
            {month == null ? "Month" : MONTHS[month]}
          </Text>
        </TouchableOpacity>
        <Text style={styles.stepDivider}>/</Text>
        <Text style={[styles.stepText, step === "day" && styles.stepTextActive]}>
          {selected ? Number(selected.slice(8, 10)) : "Day"}
        </Text>
      </View>

      {step === "year" ? (
        <ScrollView style={styles.yearList} contentContainerStyle={styles.yearGrid}>
          {years.map((item) => {
            const selectedYear = item === year;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.yearCell, selectedYear && styles.yearCellSelected]}
                onPress={() => onYear(item)}
              >
                <Text style={[styles.yearText, selectedYear && styles.yearTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {step === "month" && year != null ? (
        <View style={styles.yearGrid}>
          {MONTHS.map((label, index) => {
            const disabled = year === currentYear && index > currentMonth;
            const selectedMonth = index === month;
            return (
              <TouchableOpacity
                key={label}
                disabled={disabled}
                style={[
                  styles.yearCell,
                  selectedMonth && styles.yearCellSelected,
                  disabled && styles.yearCellDisabled,
                ]}
                onPress={() => onMonth(index)}
              >
                <Text
                  style={[
                    styles.yearText,
                    selectedMonth && styles.yearTextSelected,
                    disabled && styles.stepTextDisabled,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {step === "day" && year != null && month != null ? (
        <View style={styles.yearGrid}>
          {Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1).map(
            (day) => {
              const disabled =
                year === currentYear && month === currentMonth && day > currentDay;
              const key = dateKey(year, month, day);
              const selectedDay = key === selected;
              return (
                <TouchableOpacity
                  key={day}
                  disabled={disabled}
                  style={[
                    styles.yearCell,
                    selectedDay && styles.yearCellSelected,
                    disabled && styles.yearCellDisabled,
                  ]}
                  onPress={() => onDay(day)}
                >
                  <Text
                    style={[
                      styles.yearText,
                      selectedDay && styles.yearTextSelected,
                      disabled && styles.stepTextDisabled,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>
      ) : null}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 14 }}>
      {label}
    </Text>
  );
}

function SelectRow({
  styles,
  colors,
  value,
  placeholder,
  icon,
  onPress,
}: {
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  value: string;
  placeholder: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.select} onPress={onPress}>
      <Icon name={icon} size={18} color={colors.textMuted} />
      <Text style={value ? styles.selectValue : styles.selectPlaceholder}>
        {value || placeholder}
      </Text>
      <Icon name="expand-more" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 32 },
    title: {
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
    address: { minHeight: 88 },
    select: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    selectValue: { flex: 1, fontSize: 16, color: colors.text },
    selectPlaceholder: { flex: 1, fontSize: 16, color: colors.placeholderText },
    chipRow: { flexDirection: "row", gap: 8 },
    chip: {
      flex: 1,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingVertical: 12,
      backgroundColor: colors.inputBackground,
    },
    chipSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? "rgba(255,107,53,0.16)" : "#FFF1EA",
    },
    chipText: { color: colors.textSecondary, fontWeight: "600" },
    chipTextSelected: { color: colors.primary },
    submit: {
      marginTop: 22,
      backgroundColor: colors.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
    },
    submitDisabled: { opacity: 0.7 },
    submitText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
    logout: { alignItems: "center", marginTop: 20, padding: 8 },
    logoutText: { color: colors.textSecondary, fontSize: 15, fontWeight: "600" },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    optionText: { fontSize: 16, color: colors.text },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 12,
    },
    stepText: { fontSize: 16, fontWeight: "600", color: colors.textSecondary },
    stepTextActive: { color: colors.primary },
    stepTextDisabled: { color: colors.textMuted },
    stepDivider: { color: colors.textMuted, fontSize: 16 },
    yearList: { maxHeight: 280 },
    yearGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    yearCell: {
      width: "23%",
      marginBottom: 8,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    yearCellSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    yearCellDisabled: { opacity: 0.35 },
    yearText: { color: colors.text, fontWeight: "600" },
    yearTextSelected: { color: colors.primaryText },
  });
}

export default CompleteStudentProfileScreen;
