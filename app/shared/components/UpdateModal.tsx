import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { ScreenGradientBackground } from "./ScreenGradientBackground";

export type UpdateModalVariant = "soft" | "hard" | "maintenance";

export interface UpdateModalProps {
  visible: boolean;
  variant: UpdateModalVariant;
  title: string;
  message: string;
  onUpdate?: () => void;
  onLater?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function UpdateModal({
  visible,
  variant,
  title,
  message,
  onUpdate,
  onLater,
  onRetry,
  isRetrying = false,
}: UpdateModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const isSoft = variant === "soft";
  const isMaintenance = variant === "maintenance";

  const handleRequestClose = () => {
    if (isSoft && onLater) {
      onLater();
    }
  };

  if (isSoft) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleRequestClose}
      >
        <Pressable style={s.softBackdrop} onPress={onLater}>
          <Pressable style={s.softCard} onPress={(e) => e.stopPropagation()}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.message}>{message}</Text>

            <View style={s.actions}>
              <TouchableOpacity
                style={[s.button, s.secondaryButton]}
                activeOpacity={0.85}
                onPress={onLater}
              >
                <Text style={s.secondaryButtonText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.button, s.primaryButton]}
                activeOpacity={0.85}
                onPress={onUpdate}
              >
                <Text style={s.primaryButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={() => undefined}
    >
      <View style={s.fullScreen}>
        <ScreenGradientBackground isDark={isDark} />
        <View
          style={[
            s.fullScreenContent,
            {
              paddingTop: insets.top + 32,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <View style={s.branding}>
            <Image
              source={require("../../../assets/images/square-logo.png")}
              style={s.logo}
            />
            <Text style={s.brandName}>Johnson's Academy</Text>
          </View>

          <View style={s.fullScreenBody}>
            <Text style={s.fullScreenTitle}>{title}</Text>
            <Text style={s.fullScreenMessage}>{message}</Text>
          </View>

          <View style={s.fullScreenActions}>
            {isMaintenance ? (
              <TouchableOpacity
                style={[s.button, s.primaryButton, s.fullWidthButton]}
                activeOpacity={0.85}
                onPress={onRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={s.primaryButtonText}>Retry</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.button, s.primaryButton, s.fullWidthButton]}
                activeOpacity={0.85}
                onPress={onUpdate}
              >
                <Text style={s.primaryButtonText}>Update Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    softBackdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    softCard: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 20,
      paddingVertical: 22,
      paddingHorizontal: 20,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.28)"
        : "rgba(167, 139, 250, 0.22)",
    },
    title: {
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.35,
      textAlign: "center",
      marginBottom: 10,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    message: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 21,
      textAlign: "center",
      marginBottom: 22,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    actions: {
      flexDirection: "row",
      gap: 10,
    },
    button: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 14,
      minHeight: 48,
    },
    secondaryButton: {
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButtonText: {
      fontSize: 15,
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    primaryButtonText: {
      fontSize: 15,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    fullScreen: {
      flex: 1,
      backgroundColor: isDark ? "#0c1224" : "#faf5ff",
    },
    fullScreenContent: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "space-between",
    },
    branding: {
      alignItems: "center",
      gap: 12,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 18,
    },
    brandName: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#E2E8F0" : "#334155",
      letterSpacing: -0.2,
    },
    fullScreenBody: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    fullScreenTitle: {
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: -0.5,
      textAlign: "center",
      marginBottom: 14,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    fullScreenMessage: {
      fontSize: 15,
      fontWeight: "600",
      lineHeight: 24,
      textAlign: "center",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    fullScreenActions: {
      width: "100%",
    },
    fullWidthButton: {
      flex: 0,
      width: "100%",
    },
  });
}
