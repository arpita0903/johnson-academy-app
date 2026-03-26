import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { getTopLevelPrefixes } from "../../../utils/folderUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useTeacherClasses } from "../../../shared/hooks/useTeacherClasses";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";

interface TeacherDashboardProps {
  navigation: any;
}

const TeacherDashboard = ({ navigation }: TeacherDashboardProps) => {
  const { user } = useAppContext();
  const { colors } = useTheme();
  const userId = user?.id ?? null;

  const { data: classes = [], isLoading, isError } = useTeacherClasses(userId);
  useRefreshOnFocus();

  const classNames = useMemo(() => classes.map((c) => c.name), [classes]);
  const prefixes = useMemo(() => getTopLevelPrefixes(classNames), [classNames]);

  const getClassCountByPrefix = (prefix: string) =>
    classes.filter((c) => c.name === prefix || c.name.startsWith(`${prefix}/`))
      .length;

  const handlePrefixPress = (prefix: string) => {
    navigation.navigate("FolderItems", {
      prefix,
      classes,
    });
  };

  const dynamicStyles = createStyles(colors);

  if (isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.header}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.header}>
            Failed to load classes. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <ScrollView style={dynamicStyles.container}>
        {/* <Text style={dynamicStyles.header}>
          Welcome, {user?.name || "Teacher"} 👋
        </Text> */}

        {prefixes.length === 0 ? (
          <View style={dynamicStyles.noClassesContainer}>
            <Text style={dynamicStyles.noClassesText}>No classes found</Text>
            <Text style={dynamicStyles.noClassesSubtext}>
              You haven't been assigned to any classes yet.
            </Text>
          </View>
        ) : (
          <View style={dynamicStyles.classesContainer}>
            <FlatList
              data={prefixes}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item: prefix }) => {
                const count = getClassCountByPrefix(prefix);
                return (
                  <Pressable
                    style={({ pressed }) => [
                      dynamicStyles.prefixRow,
                      pressed && dynamicStyles.prefixRowPressed,
                    ]}
                    onPress={() => handlePrefixPress(prefix)}
                  >
                    <View style={dynamicStyles.prefixIconContainer}>
                      <Icon
                        name="folder-open"
                        size={26}
                        color={colors.primary}
                      />
                    </View>
                    <View style={dynamicStyles.prefixContent}>
                      <Text style={dynamicStyles.prefixLabel} numberOfLines={1}>
                        {prefix}
                      </Text>
                      <View style={dynamicStyles.prefixMetaRow}>
                        <View style={dynamicStyles.prefixBadge}>
                          <Text style={dynamicStyles.prefixBadgeText}>
                            {count} {count === 1 ? "class" : "classes"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={dynamicStyles.chevronContainer}>
                      <Icon
                        name="chevron-forward"
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 24,
      color: "#ffffff",
      textAlign: "center",
    },
    noClassesContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      backgroundColor: "#2a2a2a",
      borderRadius: 15,
      margin: 16,
      borderWidth: 1,
      borderColor: "#404040",
    },
    noClassesText: {
      fontSize: 20,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 8,
    },
    noClassesSubtext: {
      fontSize: 16,
      color: "#ffffff",
      textAlign: "center",
      opacity: 0.9,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: 12,
    },
    classesContainer: {
      marginTop: 8,
    },
    prefixRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      marginBottom: 12,
      backgroundColor: "#252525",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.06)",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    prefixRowPressed: {
      opacity: 0.88,
      backgroundColor: "#2a2a2a",
    },
    prefixIconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: `${colors.primary}22`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    prefixContent: {
      flex: 1,
      minWidth: 0,
    },
    prefixLabel: {
      fontSize: 17,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    prefixMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    prefixBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    prefixBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.75)",
      letterSpacing: 0.2,
    },
    chevronContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
  });

export default TeacherDashboard;
