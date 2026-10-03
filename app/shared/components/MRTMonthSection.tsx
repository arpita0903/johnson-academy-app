import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import {
  ThemeColors,
  loginButtonGradientColors,
} from "../../theme/colors";
import {
  convertMonthFormat,
  convertMonthToYearMonth,
  MonthOption,
} from "../../utils/dateUtils";
import type { GetMrtByStudentClassMonthSuccess } from "../../types/mrt";
import { useMrtByStudentClassMonth } from "../hooks/useMrtByStudentClassMonth";
import { useDownloadAttendancePdf } from "../hooks/useDownloadAttendancePdf";
import { useToast } from "../hooks/useToast";
import { GlassCard } from "./GlassCard";
import { StatInfoRow } from "./StatInfoRow";
import {
  MRTEvaluationForm,
  MRTFormData,
  MRTFormField,
} from "./MRTEvaluationForm";

type MrtScoreKey =
  | "regularity"
  | "learningSpeed"
  | "theory"
  | "technicalExercises"
  | "repertoireRhythmSense"
  | "repertoireDynamics";

const MRT_SCORE_ROWS: { key: MrtScoreKey; label: string }[] = [
  { key: "regularity", label: "Regularity" },
  { key: "learningSpeed", label: "Learning Speed" },
  { key: "theory", label: "Theory" },
  { key: "technicalExercises", label: "Technical Exercises" },
  { key: "repertoireRhythmSense", label: "Repertoire (Rhythm Sense)" },
  { key: "repertoireDynamics", label: "Repertoire (Dynamics)" },
];

function formatMrtScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function toApiMonth(selectedMonth: string | null): string | null {
  if (!selectedMonth) return null;
  const formatted = convertMonthFormat(selectedMonth);
  return formatted.includes("NaN") ? null : formatted;
}

function toPdfMonth(selectedMonth: string | null): string | null {
  if (!selectedMonth) return null;
  const formatted = convertMonthToYearMonth(selectedMonth);
  return /^\d{4}-\d{2}$/.test(formatted) ? formatted : null;
}

export interface MRTMonthSectionProps {
  loading: boolean;
  filteredMonths: MonthOption[];
  selectedMonth: string | null;
  selectedMonthLabel?: string | null;
  onOpenPicker: () => void;
  studentId: string | null;
  classId: string | null;
  courseId: string | null;
  formData: MRTFormData;
  onChange: (key: MRTFormField, value: string) => void;
  onSubmit: () => void | Promise<boolean>;
  allowFill?: boolean;
}

export function MRTMonthSection({
  loading,
  filteredMonths,
  selectedMonth,
  selectedMonthLabel,
  onOpenPicker,
  studentId,
  classId,
  courseId,
  formData,
  onChange,
  onSubmit,
  allowFill = true,
}: MRTMonthSectionProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { showError } = useToast();
  const [isFilling, setIsFilling] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const apiMonth = toApiMonth(selectedMonth);
  const pdfMonth = toPdfMonth(selectedMonth);
  const mrtQuery = useMrtByStudentClassMonth(
    studentId,
    classId,
    apiMonth,
    courseId,
  );
  const mrt = mrtQuery.data ?? null;
  const downloadPdf = useDownloadAttendancePdf();

  const canDownload =
    !!studentId && !!classId && !!courseId && !!pdfMonth;

  const handleDownloadReport = () => {
    if (!studentId || !classId || !courseId || !pdfMonth) return;

    downloadPdf.mutate(
      {
        studentId,
        classId,
        courseId,
        month: pdfMonth,
      },
      {
        onError: (error) => {
          showError(error.message || "Failed to download report.");
        },
      },
    );
  };

  useEffect(() => {
    setIsFilling(false);
    setJustSubmitted(false);
  }, [selectedMonth]);

  useEffect(() => {
    if (mrt) {
      setIsFilling(false);
      setJustSubmitted(false);
    }
  }, [mrt]);

  const handleFormSubmit = async () => {
    const result = await onSubmit();
    if (result) {
      setIsFilling(false);
      setJustSubmitted(true);
    }
  };

  const showMrtLoader =
    !!selectedMonth &&
    !!courseId &&
    (justSubmitted || (mrtQuery.isFetching && !mrt));

  const subtitle = mrt
    ? "MRT already submitted for this month."
    : allowFill
      ? "Select a month to view a submitted review or fill a new one."
      : "Select a month to view a submitted review.";

  return (
    <>
      <GlassCard
        title="Monthly review (MRT)"
        subtitle={subtitle}
        spacing="default"
      >
        {loading ? (
          <View style={s.loaderRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.bodyMuted}>Loading months…</Text>
          </View>
        ) : filteredMonths.length > 0 ? (
          <>
            <Text style={s.fieldLabel}>Month</Text>
            <TouchableOpacity
              style={s.monthPickerTrigger}
              activeOpacity={0.85}
              onPress={onOpenPicker}
            >
              <Text style={s.monthPickerTriggerText} numberOfLines={1}>
                {selectedMonthLabel ?? "Choose a month"}
              </Text>
              <Icon
                name="keyboard-arrow-down"
                size={24}
                color={
                  isDark
                    ? "rgba(148, 163, 184, 0.9)"
                    : "rgba(71, 85, 105, 0.95)"
                }
              />
            </TouchableOpacity>

            {selectedMonth ? (
              <>
                <MrtMonthContent
                  colors={colors}
                  s={s}
                  courseId={courseId}
                  isFilling={isFilling}
                  showMrtLoader={showMrtLoader}
                  mrt={mrt}
                  isError={mrtQuery.isError}
                  errorMessage={mrtQuery.error?.message}
                  allowFill={allowFill}
                  onFill={() => setIsFilling(true)}
                  onCancelFill={() => setIsFilling(false)}
                />
                {canDownload ? (
                  <DownloadReportCta
                    s={s}
                    colors={colors}
                    isDownloading={downloadPdf.isPending}
                    onPress={handleDownloadReport}
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <View style={s.emptyMonths}>
            <Icon
              name="event-busy"
              size={32}
              color={
                isDark
                  ? "rgba(248, 113, 113, 0.85)"
                  : "rgba(220, 38, 38, 0.85)"
              }
            />
            <Text style={s.emptyMonthsText}>
              No months available for this student.
            </Text>
          </View>
        )}
      </GlassCard>

      {allowFill && isFilling && !mrt ? (
        <MRTEvaluationForm
          formData={formData}
          onChange={onChange}
          onSubmit={() => {
            void handleFormSubmit();
          }}
        />
      ) : null}
    </>
  );
}

interface MrtMonthContentProps {
  colors: ThemeColors;
  s: ReturnType<typeof createStyles>;
  courseId: string | null;
  isFilling: boolean;
  showMrtLoader: boolean;
  mrt: GetMrtByStudentClassMonthSuccess | null;
  isError: boolean;
  errorMessage?: string;
  allowFill: boolean;
  onFill: () => void;
  onCancelFill: () => void;
}

function MrtMonthContent({
  colors,
  s,
  courseId,
  isFilling,
  showMrtLoader,
  mrt,
  isError,
  errorMessage,
  allowFill,
  onFill,
  onCancelFill,
}: MrtMonthContentProps) {
  if (!courseId) {
    return (
      <Text style={s.helperText}>
        Course information is missing. Open this screen from a course to view
        {allowFill ? " or fill" : ""} MRT.
      </Text>
    );
  }

  if (showMrtLoader) {
    return (
      <View style={s.loaderRow}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={s.bodyMuted}>Loading MRT…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <Text style={s.errorText}>
        {errorMessage ?? "Failed to load MRT for this month."}
      </Text>
    );
  }

  if (mrt) {
    return <SubmittedMrtDetails mrt={mrt} s={s} />;
  }

  if (isFilling) {
    return (
      <View style={s.fillHeader}>
        <Text style={s.helperText}>
          Complete the evaluation form below, then submit.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCancelFill}
          style={s.cancelButton}
        >
          <Text style={s.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.emptyMrt}>
      <Text style={s.helperText}>No MRT submitted for this month yet.</Text>
      {allowFill ? (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={onFill}
          style={s.ctaShell}
        >
          <LinearGradient
            colors={[...loginButtonGradientColors]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.ctaGradient}
          >
            <Icon name="edit" size={20} color="#FFFFFF" />
            <Text style={s.ctaText}>Fill MRT</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function DownloadReportCta({
  s,
  colors,
  isDownloading,
  onPress,
}: {
  s: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  isDownloading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDownloading}
      accessibilityRole="button"
      accessibilityLabel="Download monthly report"
      style={[s.downloadCta, isDownloading && s.downloadCtaDisabled]}
    >
      {isDownloading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Icon name="picture-as-pdf" size={20} color={colors.primary} />
      )}
      <Text style={s.downloadCtaText}>
        {isDownloading ? "Preparing report…" : "Download report"}
      </Text>
    </TouchableOpacity>
  );
}

function SubmittedMrtDetails({
  mrt,
  s,
}: {
  mrt: GetMrtByStudentClassMonthSuccess;
  s: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={s.submittedWrap}>
      {MRT_SCORE_ROWS.map((row) => (
        <StatInfoRow
          key={row.key}
          icon="star-border"
          label={row.label}
          value={formatMrtScore(mrt[row.key])}
        />
      ))}
      <StatInfoRow
        icon="calculate"
        label="Total score"
        value={formatMrtScore(mrt.totalScore)}
        variant="success"
      />
      <StatInfoRow
        icon="insights"
        label="Average score"
        value={formatMrtScore(mrt.averageScore)}
        variant="success"
      />
      {mrt.remarks ? (
        <View style={s.remarksBlock}>
          <Text style={s.remarksLabel}>Remarks</Text>
          <Text style={s.remarksText}>{mrt.remarks}</Text>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    loaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 8,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 8,
      marginTop: 4,
      letterSpacing: 0.15,
      color: isDark ? "#E2E8F0" : "#334155",
    },
    monthPickerTrigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.35)"
        : "rgba(148, 163, 184, 0.45)",
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.5)"
        : "rgba(248, 250, 252, 0.95)",
    },
    monthPickerTriggerText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "700",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    emptyMonths: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 12,
    },
    emptyMonthsText: {
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
      color: colors.error,
      paddingHorizontal: 12,
    },
    helperText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      marginTop: 14,
    },
    errorText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.error,
      lineHeight: 19,
      marginTop: 14,
    },
    emptyMrt: {
      marginTop: 4,
    },
    fillHeader: {
      marginTop: 4,
    },
    ctaShell: {
      marginTop: 12,
      borderRadius: 14,
      overflow: "hidden",
    },
    ctaGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    ctaText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },
    downloadCta: {
      marginTop: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    downloadCtaDisabled: {
      opacity: 0.55,
    },
    downloadCtaText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "900",
    },
    cancelButton: {
      alignSelf: "flex-start",
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.primary,
    },
    submittedWrap: {
      marginTop: 8,
    },
    remarksBlock: {
      marginTop: 8,
      paddingVertical: 10,
    },
    remarksLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#475569",
      marginBottom: 6,
    },
    remarksText: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
      color: isDark ? "#E2E8F0" : "#334155",
    },
  });
}
