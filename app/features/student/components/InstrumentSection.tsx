import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { useStudentClasses } from "../../../shared/hooks/useStudentClasses";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { NoteAccentDivider } from "../../../shared/components/NoteAccentDivider";

interface InstrumentSectionProps {
  onInstrumentPress: (item: any) => void;
}

const InstrumentSection = ({ onInstrumentPress }: InstrumentSectionProps) => {
  const { user } = useAppContext();
  const { colors, isDark } = useTheme();
  const studentId = user?.id ?? null;

  const {
    data: studentClasses = [],
    isLoading,
    isError,
    error,
  } = useStudentClasses(studentId);
  useRefreshOnFocus();

  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const spinnerColor = isDark ? "#A78BFA" : "#7C3AED";

  const sectionTitleRow = (
    <>
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>My Classes</Text>
      </View>
      <NoteAccentDivider />
    </>
  );

  if (isLoading) {
    return (
      <View style={s.sectionWrap}>
        {sectionTitleRow}
        <View style={s.statePanel}>
          <ActivityIndicator size="large" color={spinnerColor} />
          <Text style={s.loadingText}>Loading your classes...</Text>
        </View>
      </View>
    );
  }

  if (isError) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : "Failed to fetch classes";
    return (
      <View style={s.sectionWrap}>
        {sectionTitleRow}
        <View style={s.statePanel}>
          <Icon name="error-outline" size={36} color={colors.error} />
          <Text style={s.errorText}>{errorMessage}</Text>
        </View>
      </View>
    );
  }

  if (studentClasses.length === 0) {
    return (
      <View style={s.sectionWrap}>
        {sectionTitleRow}
        <View style={s.emptyPanel}>
          <Icon
            name="library-music"
            size={40}
            color={
              isDark ? "rgba(167, 139, 250, 0.55)" : "rgba(109, 40, 217, 0.45)"
            }
          />
          <Text style={s.emptyTitle}>No classes yet</Text>
          <Text style={s.emptySubtext}>
            Check back later — new lessons may appear here soon.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.sectionWrap}>
      {sectionTitleRow}

      <View style={s.listContent}>
        {studentClasses.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onInstrumentPress(item)}
            activeOpacity={0.82}
            style={s.cardTouchable}
          >
            <View style={s.instrumentCard}>
              {/* <View style={s.cardAccentBar} /> */}
              <Image
                source={
                  typeof item?.courseId?.image === "string" &&
                  item.courseId.image.length > 0
                    ? { uri: item.courseId.image }
                    : require("../../../../assets/images/round-logo.png")
                }
                style={s.instrumentIcon}
              />
              <View style={s.cardTextContent}>
                <Text style={s.instrumentName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={s.courseMetaRow}>
                  <View style={s.courseMetaPill}>
                    <Icon
                      name="school"
                      size={17}
                      color={
                        isDark
                          ? "rgba(94, 234, 212, 0.95)"
                          : "rgba(13, 148, 136, 0.95)"
                      }
                      style={s.courseMetaIcon}
                    />
                    <Text style={s.courseName} numberOfLines={1}>
                      {item.courseId?.name ?? "Course"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.chevronWrap}>
                <Icon
                  name="chevron-right"
                  size={26}
                  color={
                    isDark
                      ? "rgba(148, 163, 184, 0.75)"
                      : "rgba(100, 116, 139, 0.85)"
                  }
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    sectionWrap: {
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#E2E8F0" : "#0f172a",
      ...Platform.select({
        ios: { fontFamily: "Snell Roundhand" },
        android: { fontFamily: "serif" },
        default: {},
      }),
    },
    listContent: {
      paddingBottom: 8,
    },
    cardTouchable: {
      marginBottom: 14,
    },
    instrumentCard: {
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderRadius: 20,
      paddingVertical: 16,
      paddingRight: 12,
      paddingLeft: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.22)"
        : "rgba(167, 139, 250, 0.24)",
      shadowColor: isDark ? "#A78BFA" : "#64748B",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.14 : 0.09,
      shadowRadius: 14,
      elevation: 5,
    },
    cardAccentBar: {
      width: 5,
      alignSelf: "stretch",
      marginRight: 12,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.85)"
        : "rgba(109, 40, 217, 0.75)",
    },
    instrumentIcon: {
      width: 68,
      height: 68,
      marginRight: 16,
      resizeMode: "cover",
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
    },
    cardTextContent: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
      paddingVertical: 2,
    },
    instrumentName: {
      fontWeight: "800",
      fontSize: 20,
      color: isDark ? "#F8FAFC" : "#0f172a",
      letterSpacing: -0.35,
      lineHeight: 26,
      backgroundColor: "transparent",
    },
    courseMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    courseMetaPill: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: isDark
        ? "rgba(94, 234, 212, 0.1)"
        : "rgba(13, 148, 136, 0.1)",
    },
    courseMetaIcon: {
      marginRight: 8,
    },
    courseName: {
      flex: 1,
      fontSize: 10,
      fontWeight: "700",
      color: isDark ? "#CBD5E1" : "#334155",
      minWidth: 0,
    },
    chevronWrap: {
      justifyContent: "center",
      paddingLeft: 4,
    },
    statePanel: {
      alignItems: "center",
      paddingVertical: 36,
      paddingHorizontal: 20,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.55)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.15)"
        : "rgba(167, 139, 250, 0.2)",
    },
    loadingText: {
      marginTop: 14,
      fontSize: 15,
      color: isDark ? "#94A3B8" : "#64748B",
      fontWeight: "500",
    },
    errorText: {
      marginTop: 12,
      fontSize: 15,
      color: colors.error,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "500",
    },
    emptyPanel: {
      alignItems: "center",
      paddingVertical: 36,
      paddingHorizontal: 22,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.55)"
        : "rgba(255, 255, 255, 0.65)",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.15)"
        : "rgba(167, 139, 250, 0.2)",
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: isDark ? "#E2E8F0" : "#0f172a",
      marginTop: 14,
      textAlign: "center",
    },
    emptySubtext: {
      marginTop: 8,
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#64748B",
      textAlign: "center",
      lineHeight: 20,
    },
  });

export default InstrumentSection;
