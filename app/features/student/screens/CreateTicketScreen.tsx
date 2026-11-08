import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../config/queryKeys";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import { useToast } from "../../../shared/hooks/useToast";
import { createTicket, getTicketErrorMessage } from "../../../services/tickets";

interface CreateTicketScreenProps {
  navigation: {
    replace: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 4000;

const CreateTicketScreen = ({ navigation }: CreateTicketScreenProps) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const { showError } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subjectTrimmed = subject.trim();
  const descriptionTrimmed = description.trim();
  const subjectError =
    subjectTrimmed.length < SUBJECT_MIN
      ? `Subject must be at least ${SUBJECT_MIN} characters.`
      : subjectTrimmed.length > SUBJECT_MAX
        ? `Subject must be ${SUBJECT_MAX} characters or fewer.`
        : "";
  const descriptionError =
    descriptionTrimmed.length < DESCRIPTION_MIN
      ? `Description must be at least ${DESCRIPTION_MIN} characters.`
      : descriptionTrimmed.length > DESCRIPTION_MAX
        ? `Description must be ${DESCRIPTION_MAX} characters or fewer.`
        : "";

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets() });
      navigation.replace("TicketDetail", { ticketId: ticket.id });
    },
    onError: (error) => {
      showError(getTicketErrorMessage(error, "Couldn’t raise this concern."));
    },
  });

  const onSubmit = () => {
    setSubmitted(true);
    if (subjectError || descriptionError || mutation.isPending) {
      return;
    }
    mutation.mutate({
      subject: subjectTrimmed,
      description: descriptionTrimmed,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenGradientBackground isDark={isDark} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.intro}>
            Tell us what happened. The academy team will track it until it is
            resolved.
          </Text>

          <Text style={styles.label}>Subject</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Short title"
            placeholderTextColor={colors.placeholderText}
            maxLength={SUBJECT_MAX}
            style={styles.input}
            accessibilityLabel="Subject"
          />
          {submitted && subjectError ? (
            <Text style={styles.error}>{subjectError}</Text>
          ) : (
            <Text style={styles.hint}>{subjectTrimmed.length}/{SUBJECT_MAX}</Text>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What happened, and what do you need?"
            placeholderTextColor={colors.placeholderText}
            multiline
            textAlignVertical="top"
            maxLength={DESCRIPTION_MAX}
            style={[styles.input, styles.multiline]}
            accessibilityLabel="Description"
          />
          {submitted && descriptionError ? (
            <Text style={styles.error}>{descriptionError}</Text>
          ) : (
            <Text style={styles.hint}>
              {descriptionTrimmed.length}/{DESCRIPTION_MAX}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submit, mutation.isPending && styles.submitDisabled]}
            accessibilityRole="button"
            disabled={mutation.isPending}
            onPress={onSubmit}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.submitLabel}>Submit concern</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "transparent",
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    intro: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
    },
    label: {
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 8,
    },
    input: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.88)" : colors.inputBackground,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148, 163, 184, 0.28)" : colors.inputBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 16,
    },
    multiline: {
      minHeight: 160,
    },
    hint: {
      marginTop: 6,
      marginBottom: 16,
      color: colors.textMuted,
      fontSize: 12,
      textAlign: "right",
    },
    error: {
      marginTop: 6,
      marginBottom: 16,
      color: colors.error,
      fontSize: 13,
    },
    submit: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    submitDisabled: {
      opacity: 0.7,
    },
    submitLabel: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "700",
    },
  });

export default CreateTicketScreen;
