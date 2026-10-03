import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import {
  ThemeColors,
  loginButtonGradientColors,
} from "../../theme/colors";
import { formatDate } from "../../utils/dateUtils";
import { useStudentProgress } from "../hooks/useStudentProgress";
import type {
  ModuleProgress,
  ModuleStatus,
  ModuleType,
  StudentProgressRecord,
} from "../../types/studentProgress";
import { GlassCard } from "./GlassCard";

export interface StudentProgressSummarySectionProps {
  studentId: string | null;
  classId: string | null;
  courseId: string | null;
  courseName?: string;
}

type ModuleListItem = ModuleProgress & {
  listKey: string;
};

const MODULE_TYPE_LABEL: Record<ModuleType, string> = {
  theory: "Theory",
  technical: "Technical",
  learning: "Repertoire",
  others: "Others",
};

const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  completed: "Completed",
  inprogress: "In progress",
  upcoming: "Upcoming",
};

function flattenModules(
  progress: StudentProgressRecord | undefined,
): ModuleListItem[] {
  if (!progress?.syllabusProgress) return [];

  return progress.syllabusProgress.flatMap((syllabus) =>
    syllabus.modules
      .filter((module) => module?.moduleId)
      .map((module, index) => ({
        ...module,
        listKey: `${syllabus.syllabusId?.id ?? "syllabus"}-${module.moduleId.id}-${index}`,
      })),
  );
}

function formatOptionalDate(value?: string): string {
  if (!value) return "—";
  return formatDate(value);
}

function formatDays(value?: number): string {
  if (value == null) return "—";
  return value === 1 ? "1 day" : `${value} days`;
}

function formatScore(value?: number): string {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatModuleType(type: ModuleType | string): string {
  if (type in MODULE_TYPE_LABEL) {
    return MODULE_TYPE_LABEL[type as ModuleType];
  }
  return type;
}

export function StudentProgressSummarySection({
  studentId,
  classId,
  courseId,
  courseName = "",
}: StudentProgressSummarySectionProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [listOpen, setListOpen] = useState(false);

  const progressQuery = useStudentProgress(studentId, classId, courseId);
  const progress = progressQuery.data;
  const modules = useMemo(() => flattenModules(progress), [progress]);
  const isDisabled = !studentId || !classId || !courseId;

  const subtitle = isDisabled
    ? "Open this screen from a course to view module progress."
    : progress
      ? `${progress.completedModules} of ${progress.totalModules} modules completed · ${progress.progress}%`
      : "See every module status, dates, and scores in one list.";

  return (
    <>
      <GlassCard
        title="Progress summary"
        subtitle={subtitle}
        spacing="default"
      >
        {progressQuery.isLoading && !isDisabled ? (
          <View style={s.loaderRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={s.bodyMuted}>Loading progress…</Text>
          </View>
        ) : null}

            {progressQuery.isError && !isDisabled ? (
          <Text style={s.errorText}>
            {progressQuery.error?.message || "Failed to load progress."}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setListOpen(true)}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel="View all module progress"
          style={[s.ctaShell, isDisabled && s.ctaDisabled]}
        >
          <LinearGradient
            colors={[...loginButtonGradientColors]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.ctaGradient}
          >
            <Icon name="format-list-bulleted" size={20} color="#FFFFFF" />
            <Text style={s.ctaText}>View all modules</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      <ModuleProgressListModal
        visible={listOpen}
        onClose={() => setListOpen(false)}
        courseName={courseName}
        modules={modules}
        progress={progress}
        isLoading={progressQuery.isLoading}
        isError={progressQuery.isError}
        errorMessage={progressQuery.error?.message}
        isRefreshing={progressQuery.isRefetching}
        onRetry={() => {
          void progressQuery.refetch();
        }}
      />
    </>
  );
}

interface ModuleProgressListModalProps {
  visible: boolean;
  onClose: () => void;
  courseName: string;
  modules: ModuleListItem[];
  progress: StudentProgressRecord | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isRefreshing: boolean;
  onRetry: () => void;
}

function ModuleProgressListModal({
  visible,
  onClose,
  courseName,
  modules,
  progress,
  isLoading,
  isError,
  errorMessage,
  isRefreshing,
  onRetry,
}: ModuleProgressListModalProps) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const renderItem = useCallback(
    ({ item }: { item: ModuleListItem }) => (
      <ModuleProgressRow item={item} styles={s} isDark={isDark} />
    ),
    [s, isDark],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.modalRoot}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <SafeAreaView style={s.sheetSafe} edges={["bottom"]}>
            <View style={s.sheetHeader}>
              <View style={s.sheetHeaderText}>
                <Text style={s.sheetTitle}>Module progress</Text>
                <Text style={s.sheetSubtitle} numberOfLines={1}>
                  {courseName
                    ? `${courseName} · ${modules.length} modules`
                    : `${modules.length} modules`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close module progress"
                style={s.closeButton}
                hitSlop={8}
              >
                <Icon
                  name="close"
                  size={22}
                  color={isDark ? "#E2E8F0" : "#334155"}
                />
              </TouchableOpacity>
            </View>

            {progress ? (
              <View style={s.statRow}>
                <ProgressChip
                  label="Done"
                  value={progress.completedModules}
                  tone="success"
                  styles={s}
                />
                <ProgressChip
                  label="In progress"
                  value={progress.inProgressModules}
                  tone="primary"
                  styles={s}
                />
                <ProgressChip
                  label="Upcoming"
                  value={progress.upcomingModules}
                  tone="muted"
                  styles={s}
                />
              </View>
            ) : null}

            {isLoading ? (
              <View style={s.centeredState}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={s.bodyMuted}>Loading modules…</Text>
              </View>
            ) : isError ? (
              <View style={s.centeredState}>
                <Icon name="error-outline" size={36} color={colors.error} />
                <Text style={s.errorText}>
                  {errorMessage || "Failed to load module progress."}
                </Text>
                <TouchableOpacity
                  style={s.retryButton}
                  activeOpacity={0.85}
                  onPress={onRetry}
                >
                  <Text style={s.retryButtonText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                style={s.list}
                data={modules}
                keyExtractor={(item) => item.listKey}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                  modules.length === 0 ? s.listEmptyContent : s.listContent
                }
                ListEmptyComponent={
                  <View style={s.centeredState}>
                    <Icon
                      name="inbox"
                      size={36}
                      color={
                        isDark
                          ? "rgba(148, 163, 184, 0.65)"
                          : "rgba(100, 116, 139, 0.55)"
                      }
                    />
                    <Text style={s.bodyMuted}>No modules in this course.</Text>
                  </View>
                }
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing && !isLoading}
                    onRefresh={onRetry}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                    progressBackgroundColor={colors.card}
                  />
                }
              />
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function ProgressChip({
  label,
  value,
  tone,
  styles: s,
}: {
  label: string;
  value: number;
  tone: "success" | "primary" | "muted";
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View
      style={[
        s.chip,
        tone === "success" && s.chipSuccess,
        tone === "primary" && s.chipPrimary,
        tone === "muted" && s.chipMuted,
      ]}
    >
      <Text style={s.chipValue}>{value}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  );
}

function ModuleProgressRow({
  item,
  styles: s,
  isDark,
}: {
  item: ModuleListItem;
  styles: ReturnType<typeof createStyles>;
  isDark: boolean;
}) {
  const status = item.status;
  const typeLabel = formatModuleType(item.moduleId.type);

  return (
    <View style={s.moduleCard}>
      <View style={s.moduleHeader}>
        <View style={s.moduleTitleBlock}>
          <Text style={s.moduleTitle} numberOfLines={2}>
            {item.moduleId.title}
          </Text>
          <Text style={s.moduleMeta}>
            Session {item.moduleId.session} · {typeLabel}
          </Text>
        </View>
        <View
          style={[
            s.statusPill,
            status === "completed" && s.statusPillCompleted,
            status === "inprogress" && s.statusPillInProgress,
            status === "upcoming" && s.statusPillUpcoming,
          ]}
        >
          <Text
            style={[
              s.statusPillText,
              status === "completed" && s.statusTextCompleted,
              status === "inprogress" && s.statusTextInProgress,
              status === "upcoming" && {
                color: isDark ? "#CBD5E1" : "#475569",
              },
            ]}
          >
            {MODULE_STATUS_LABEL[status] ?? status}
          </Text>
        </View>
      </View>

      <View style={s.detailGrid}>
        <DetailCell styles={s} label="Start" value={formatOptionalDate(item.startDate)} />
        <DetailCell styles={s} label="End" value={formatOptionalDate(item.endDate)} />
        <DetailCell
          styles={s}
          label="Time taken"
          value={formatDays(item.dateTakenToComplete)}
        />
        <DetailCell styles={s} label="Score" value={formatScore(item.score)} />
      </View>
    </View>
  );
}

function DetailCell({
  label,
  value,
  styles: s,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={s.detailCell}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
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
      marginBottom: 4,
    },
    bodyMuted: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
      lineHeight: 19,
      textAlign: "center",
    },
    errorText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.error,
      lineHeight: 19,
      marginTop: 6,
      textAlign: "center",
    },
    ctaShell: {
      marginTop: 10,
      borderRadius: 14,
      overflow: "hidden",
    },
    ctaDisabled: {
      opacity: 0.45,
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
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
    },
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    sheet: {
      height: "88%",
      zIndex: 1,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.98)"
        : "rgba(255, 255, 255, 0.99)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.28)"
        : "rgba(167, 139, 250, 0.22)",
      overflow: "hidden",
    },
    sheetSafe: {
      flex: 1,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 10,
      gap: 12,
    },
    sheetHeaderText: {
      flex: 1,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    sheetSubtitle: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.16)",
    },
    statRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    chip: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 8,
      alignItems: "center",
    },
    chipSuccess: {
      backgroundColor: isDark
        ? "rgba(34, 197, 94, 0.18)"
        : "rgba(34, 197, 94, 0.14)",
    },
    chipPrimary: {
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.18)"
        : "rgba(255, 122, 46, 0.12)",
    },
    chipMuted: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.14)"
        : "rgba(148, 163, 184, 0.16)",
    },
    chipValue: {
      fontSize: 16,
      fontWeight: "900",
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    chipLabel: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "700",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === "ios" ? 8 : 16,
    },
    listEmptyContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
    },
    centeredState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 24,
    },
    retryButton: {
      marginTop: 6,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    moduleCard: {
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      backgroundColor: isDark
        ? "rgba(15, 23, 42, 0.55)"
        : "rgba(248, 250, 252, 0.95)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(148, 163, 184, 0.18)"
        : "rgba(148, 163, 184, 0.28)",
    },
    moduleHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 12,
    },
    moduleTitleBlock: {
      flex: 1,
    },
    moduleTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    moduleMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#94A3B8" : "#64748B",
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    statusPillCompleted: {
      backgroundColor: isDark
        ? "rgba(34, 197, 94, 0.2)"
        : "rgba(34, 197, 94, 0.16)",
    },
    statusPillInProgress: {
      backgroundColor: isDark
        ? "rgba(255, 107, 53, 0.22)"
        : "rgba(255, 122, 46, 0.16)",
    },
    statusPillUpcoming: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.16)"
        : "rgba(148, 163, 184, 0.18)",
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: "800",
    },
    statusTextCompleted: {
      color: isDark ? "#4ADE80" : "#15803D",
    },
    statusTextInProgress: {
      color: isDark ? "#FDBA74" : "#C2410C",
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 10,
    },
    detailCell: {
      width: "50%",
    },
    detailLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: isDark ? "#94A3B8" : "#64748B",
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: "800",
      color: isDark ? "#E2E8F0" : "#334155",
    },
  });
}
