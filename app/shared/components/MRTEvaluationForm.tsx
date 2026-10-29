import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { ThemeColors, loginButtonGradientColors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";

export const MRT_FORM_FIELDS = [
  "Regularity (5M)",
  "Learning Speed (5M)",
  "Theory (5M)",
  "Technical Exercises (5M)",
  "Repertoire (Rhythm Sense) (5M)",
  "Repertoire (Dynamics) (5M)",
  "remarks",
] as const;

export type MRTFormField = (typeof MRT_FORM_FIELDS)[number];
export type MRTFormData = Record<MRTFormField, string>;

export const EMPTY_MRT_FORM: MRTFormData = {
  "Regularity (5M)": "",
  "Learning Speed (5M)": "",
  "Theory (5M)": "",
  "Technical Exercises (5M)": "",
  "Repertoire (Rhythm Sense) (5M)": "",
  "Repertoire (Dynamics) (5M)": "",
  remarks: "",
};

export const MRT_SCORE_FIELDS = MRT_FORM_FIELDS.filter(
  (field) => field !== "remarks",
);

export function handleMRTFieldChange(
  key: MRTFormField,
  value: string,
  setFormData: React.Dispatch<React.SetStateAction<MRTFormData>>,
) {
  if (key !== "remarks") {
    if (value === "") {
      setFormData((prev) => ({ ...prev, [key]: value }));
      return;
    }
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue === "") {
      setFormData((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    const num = parseInt(numericValue, 10);
    if (num < 0 || num > 5) {
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: numericValue }));
  } else {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }
}

export interface MRTEvaluationFormProps {
  formData: MRTFormData;
  isAbsent: boolean;
  onAbsentChange: (isAbsent: boolean) => void;
  onChange: (key: MRTFormField, value: string) => void;
  onSubmit: () => void;
}

export function MRTEvaluationForm({
  formData,
  isAbsent,
  onAbsentChange,
  onChange,
  onSubmit,
}: MRTEvaluationFormProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const fields = isAbsent
    ? MRT_FORM_FIELDS.filter((field) => field === "remarks")
    : MRT_FORM_FIELDS;

  return (
    <GlassCard title="Evaluation form" spacing="bottom">
      <View style={s.absentRow}>
        <View style={s.absentCopy}>
          <Text style={s.absentLabel}>Mark as Absent</Text>
          <Text style={s.absentHint}>
            Student was not available. Scores are not recorded.
          </Text>
        </View>
        <Switch
          value={isAbsent}
          onValueChange={onAbsentChange}
          trackColor={{
            false: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(148, 163, 184, 0.55)",
            true: colors.primary,
          }}
          thumbColor="#FFFFFF"
          accessibilityRole="switch"
          accessibilityLabel="Mark as Absent"
          accessibilityState={{ checked: isAbsent }}
        />
      </View>

      {fields.map((field) => (
        <View key={field} style={s.inputGroup}>
          <Text style={s.fieldLabel}>
            {field === "remarks"
              ? isAbsent
                ? "Remarks"
                : "Remarks *"
              : `${field} *`}
          </Text>
          <TextInput
            style={field === "remarks" ? [s.input, s.inputMultiline] : s.input}
            value={formData[field]}
            onChangeText={(text) => onChange(field, text)}
            placeholder={
              field === "remarks"
                ? isAbsent
                  ? "Reason (optional)"
                  : "Enter remarks"
                : "Range: 0–5"
            }
            placeholderTextColor={
              isDark ? "rgba(148, 163, 184, 0.5)" : colors.placeholderText
            }
            keyboardType={field === "remarks" ? "default" : "number-pad"}
            multiline={field === "remarks"}
            numberOfLines={field === "remarks" ? 4 : 1}
          />
        </View>
      ))}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onSubmit}
        style={s.submitShell}
        accessibilityRole="button"
        accessibilityLabel={isAbsent ? "Mark absent" : "Submit MRT"}
      >
        <LinearGradient
          colors={[...loginButtonGradientColors]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={s.submitGradient}
        >
          <Icon name={isAbsent ? "event-busy" : "send"} size={20} color="#FFFFFF" />
          <Text style={s.submitGradientText}>
            {isAbsent ? "Mark absent" : "Submit MRT"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    absentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.55)"
        : "rgba(248, 250, 252, 0.98)",
    },
    absentCopy: {
      flex: 1,
    },
    absentLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 4,
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    absentHint: {
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    inputGroup: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 8,
      marginTop: 4,
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    input: {
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: "600",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.55)"
        : "rgba(248, 250, 252, 0.98)",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: "top",
      paddingTop: 12,
    },
    submitShell: {
      marginTop: 8,
      borderRadius: 14,
      overflow: "hidden",
    },
    submitGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    submitGradientText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },
  });
}
