import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { useStudentClasses } from "../../../shared/hooks/useStudentClasses";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";

interface InstrumentSectionProps {
  onInstrumentPress: (item: any) => void;
}

const InstrumentSection = ({ onInstrumentPress }: InstrumentSectionProps) => {
  const { user } = useAppContext();
  const { colors } = useTheme();
  const studentId = user?.id ?? null;

  const {
    data: studentClasses = [],
    isLoading,
    isError,
    error,
  } = useStudentClasses(studentId);
  useRefreshOnFocus();

  const dynamicStyles = useMemo(() => createStyles(colors), [colors]);

  if (isLoading) {
    return (
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.primaryText}>My Classes</Text>
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={dynamicStyles.loadingText}>Loading your classes...</Text>
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
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.primaryText}>My Classes</Text>
        </View>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.errorText}>Error: {errorMessage}</Text>
        </View>
      </View>
    );
  }

  if (studentClasses.length === 0) {
    return (
      <View style={dynamicStyles.emptyContainer}>
        <Text style={dynamicStyles.emptyText}>🎉 No classes found!</Text>
        <Text style={dynamicStyles.emptySubtext}>
          No classes found. Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.header}>
      <View style={dynamicStyles.sectionHeader}>
        <Text style={dynamicStyles.primaryText}>My Classes</Text>
      </View>

      <View style={dynamicStyles.listContent}>
        {studentClasses.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onInstrumentPress(item)}
            activeOpacity={0.7}
          >
            <View style={dynamicStyles.instrumentCard}>
              <Image
                source={{ uri: item?.courseId?.image }}
                style={dynamicStyles.instrumentIcon}
              />
              <View style={dynamicStyles.cardTextContent}>
                <Text style={dynamicStyles.instrumentName}>{item.name}</Text>
                <Text style={dynamicStyles.courseName} numberOfLines={1}>
                  {item.courseId?.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
    },
    primaryText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "600" as const,
    },
    listContent: {
      paddingVertical: 8,
      paddingBottom: 24,
    },
    instrumentCard: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    instrumentIcon: {
      width: 64,
      height: 64,
      marginRight: 12,
      resizeMode: "cover" as const,
      borderRadius: 12,
    },
    cardTextContent: {
      flex: 1,
      justifyContent: "center" as const,
      minWidth: 0,
    },
    instrumentName: {
      fontWeight: "bold" as const,
      fontSize: 18,
      color: colors.text,
    },
    courseName: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    loadingContainer: {
      alignItems: "center" as const,
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    errorContainer: {
      alignItems: "center" as const,
      paddingVertical: 40,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: "center" as const,
    },
    emptyContainer: {
      marginVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

export default InstrumentSection;
