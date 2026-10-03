import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";

export interface ProfilePhotoSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
}

export function ProfilePhotoSourceSheet({
  visible,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
}: ProfilePhotoSourceSheetProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable
          style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={s.handle} />
          <Text style={s.title}>Update profile photo</Text>
          <Text style={s.subtitle}>Take a new photo or choose one you already have.</Text>

          <TouchableOpacity
            style={s.option}
            activeOpacity={0.85}
            onPress={onTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={s.optionIcon}>
              <Icon name="photo-camera" size={22} color={colors.primary} />
            </View>
            <Text style={s.optionLabel}>Take photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.option}
            activeOpacity={0.85}
            onPress={onChooseFromGallery}
            accessibilityRole="button"
            accessibilityLabel="Choose from gallery"
          >
            <View style={s.optionIcon}>
              <Icon name="photo-library" size={22} color={colors.primary} />
            </View>
            <Text style={s.optionLabel}>Choose from gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.cancelButton}
            activeOpacity={0.85}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={s.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 10,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.28)"
        : "rgba(167, 139, 250, 0.22)",
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 999,
      marginBottom: 14,
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.45)"
        : "rgba(148, 163, 184, 0.55)",
    },
    title: {
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    subtitle: {
      marginTop: 6,
      marginBottom: 16,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 52,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.65)"
        : "rgba(248, 250, 252, 0.95)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.22)"
        : "rgba(148, 163, 184, 0.28)",
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.14)"
        : `${colors.primary}18`,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#0f172a",
    },
    cancelButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      marginTop: 4,
      borderRadius: 14,
    },
    cancelLabel: {
      fontSize: 15,
      fontWeight: "800",
      color: isDark ? "#94A3B8" : "#64748B",
    },
  });
}
