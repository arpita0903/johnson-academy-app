import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";

const TeacherCourseDetail = ({ route }: { route: any }) => {
  const { item } = route.params;
  const { colors } = useTheme();

  const [hasStarted, setHasStarted] = useState(false);
  const [totalDays, setTotalDays] = useState("");
  const [remark, setRemark] = useState("");

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleEnd = () => {
    //course ended
  };

  const dynamicStyles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={dynamicStyles.container}>
      {/* Detail Section */}
      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.title}>{item.title}</Text>

        {item.description ? (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.labelRow}>
              <Text style={dynamicStyles.label}>Description</Text>
              <View style={dynamicStyles.pillContainer}>
                <Text style={dynamicStyles.pillText}>{item.session}</Text>
              </View>
            </View>
            <Text style={dynamicStyles.text}>{item.description}</Text>
          </View>
        ) : (
          <View style={dynamicStyles.pillPostion}>
            <View style={[dynamicStyles.pillContainer]}>
              <Text style={dynamicStyles.pillText}>{item.session}</Text>
            </View>
          </View>
        )}

        <View style={[dynamicStyles.section, dynamicStyles.dateContainer]}>
          <MaterialIcons name="event" size={20} color={colors.primary} />
          <Text style={dynamicStyles.dateLabel}>Date of Issue:</Text>
          <View style={dynamicStyles.dateBadge}>
            <Text style={dynamicStyles.dateText}>
              {item.date_of_issue || "N/A"}
            </Text>
          </View>
        </View>

        <View style={[dynamicStyles.section, dynamicStyles.dateContainer]}>
          <MaterialIcons
            name="event-available"
            size={20}
            color={colors.success}
          />
          <Text style={dynamicStyles.dateLabel}>Date of Completion:</Text>
          <View
            style={[dynamicStyles.dateBadge, dynamicStyles.completionBadge]}
          >
            <Text
              style={[dynamicStyles.dateText, dynamicStyles.completionText]}
            >
              {item.date_of_completion || "N/A"}
            </Text>
          </View>
        </View>

        <View style={[dynamicStyles.section, dynamicStyles.sectionBgAlt]}>
          <Text style={dynamicStyles.label}>Remark</Text>
          <Text style={dynamicStyles.text}>{item.remark || "N/A"}</Text>
        </View>
      </View>

      <View style={dynamicStyles.formContainer}>
        <View style={dynamicStyles.row}>
          {/*<View style={dynamicStyles.halfInputWrapper}>
            <Text style={dynamicStyles.formLabel}>Start Date</Text>
            <TextInput
              style={dynamicStyles.input}
              value={item.date_of_issue}
              editable={false}
            />
          </View>

          <View style={dynamicStyles.halfInputWrapper}>
            <Text style={dynamicStyles.formLabel}>End Date</Text>
            <TextInput
              style={dynamicStyles.input}
              value={item.date_of_completion}
              editable={false}
            />
          </View>*/}
        </View>

        <Text style={dynamicStyles.formLabel}>Total Days</Text>
        <TextInput
          style={dynamicStyles.input}
          keyboardType="numeric"
          value={totalDays}
          onChangeText={setTotalDays}
          placeholder="Enter total days"
          placeholderTextColor={colors.placeholderText}
        />

        <Text style={dynamicStyles.formLabel}>Remark</Text>
        <TextInput
          style={[dynamicStyles.input, dynamicStyles.textArea]}
          value={remark}
          onChangeText={setRemark}
          multiline
          numberOfLines={3}
          placeholder="Enter remark"
          placeholderTextColor={colors.placeholderText}
        />

        <View style={dynamicStyles.buttonRow}>
          <TouchableOpacity
            style={[dynamicStyles.button, dynamicStyles.startButton]}
            onPress={handleStart}
          >
            <Text style={dynamicStyles.buttonText}>Start Course</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.button,
              dynamicStyles.endButton,
              !hasStarted && dynamicStyles.disabledButton,
            ]}
            onPress={handleEnd}
            disabled={!hasStarted}
          >
            <Text style={dynamicStyles.buttonText}>End Course</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 28,
      textAlign: "center",
    },
    section: {
      marginBottom: 18,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    text: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    pillContainer: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    pillPostion: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 18,
    },
    pillText: {
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    sectionBgAlt: {
      backgroundColor: colors.surface,
      padding: 16,
      marginTop: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    dateLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    dateBadge: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    dateText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
    },
    completionBadge: {
      backgroundColor: colors.surface,
      borderColor: colors.success,
    },
    completionText: {
      color: colors.success,
    },
    formSection: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    formLabel: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: colors.text,
      marginBottom: 20,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
    },
    textBox: {
      height: 100,
      textAlignVertical: "top",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    startButton: {
      backgroundColor: colors.success,
    },
    endButton: {
      backgroundColor: colors.error,
    },
    disabledButton: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
    },
    buttonText: {
      color: colors.primaryText,
      fontWeight: "600",
      fontSize: 16,
    },
    formContainer: {
      backgroundColor: colors.card,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    halfInputWrapper: {
      flex: 1,
      marginHorizontal: 5,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top", // for Android multiline text input alignment
    },
  });

export default TeacherCourseDetail;
