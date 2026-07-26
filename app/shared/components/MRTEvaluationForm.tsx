import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
    if (num < 2 || num > 5) {
      return;
    }
    setFormData((prev) => ({ ...prev, [key]: numericValue }));
  } else {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }
}

export interface MRTEvaluationFormProps {
  formData: MRTFormData;
  onChange: (key: MRTFormField, value: string) => void;
  onSubmit: () => void;
}

export function MRTEvaluationForm({
  formData,
  onChange,
  onSubmit,
}: MRTEvaluationFormProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <GlassCard title="Evaluation form" spacing="bottom">
      {MRT_FORM_FIELDS.map((field) => (
        <View key={field} style={s.inputGroup}>
          <Text style={s.fieldLabel}>
            {field === "remarks" ? "Remarks *" : `${field} *`}
          </Text>
          <TextInput
            style={field === "remarks" ? [s.input, s.inputMultiline] : s.input}
            value={formData[field]}
            onChangeText={(text) => onChange(field, text)}
            placeholder={field === "remarks" ? "Enter remarks" : "Range: 2–5"}
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
      >
        <LinearGradient
          colors={[...loginButtonGradientColors]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={s.submitGradient}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
          <Text style={s.submitGradientText}>Submit MRT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
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
