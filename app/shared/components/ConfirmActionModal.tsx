import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";

export interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={s.backdrop} onPress={isLoading ? undefined : onCancel}>
        <Pressable style={s.card} onPress={(e) => e.stopPropagation()}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.button, s.cancelButton]}
              activeOpacity={0.85}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={s.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.button, s.confirmButton]}
              activeOpacity={0.85}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={s.confirmButtonText}>{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    card: {
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
    cancelButton: {
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    confirmButtonText: {
      fontSize: 15,
      fontWeight: "800",
      color: "#FFFFFF",
    },
  });
}
