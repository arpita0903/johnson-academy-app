import React, { useMemo } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors } from "../../theme/colors";
import { MonthOption } from "../../utils/dateUtils";

export interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  months: MonthOption[];
  selectedMonth: string | null;
  onSelectMonth: (value: string) => void;
  title?: string;
}

export function MonthPickerModal({
  visible,
  onClose,
  months,
  selectedMonth,
  onSelectMonth,
  title = "Select month",
}: MonthPickerModalProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable style={s.monthModalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={s.monthModalTitle}>{title}</Text>
          <ScrollView
            style={s.monthModalList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {months.map((month) => {
              const selected = month.value === selectedMonth;
              return (
                <TouchableOpacity
                  key={month.value}
                  style={[s.monthRow, selected && s.monthRowSelected]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelectMonth(month.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[s.monthRowText, selected && s.monthRowTextSelected]}
                  >
                    {month.label}
                  </Text>
                  {selected ? (
                    <Icon name="check" size={22} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    monthModalCard: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingTop: 18,
      paddingBottom: Platform.OS === "ios" ? 28 : 20,
      paddingHorizontal: 20,
      maxHeight: "55%",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.28)"
        : "rgba(167, 139, 250, 0.22)",
    },
    monthModalTitle: {
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.35,
      marginBottom: 12,
      textAlign: "center",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    monthModalList: {
      flexGrow: 0,
    },
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? "rgba(148, 163, 184, 0.25)"
        : "rgba(148, 163, 184, 0.35)",
    },
    monthRowSelected: {
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.12)"
        : "rgba(255, 122, 46, 0.1)",
    },
    monthRowText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#E2E8F0" : "#334155",
    },
    monthRowTextSelected: {
      fontWeight: "800",
      color: colors.primary,
    },
  });
}
