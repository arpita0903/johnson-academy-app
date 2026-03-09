import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { useTeacherContext } from "../context/TeacherContext";
import {
  getClassesByPrefix,
  groupClassesByLastSegment,
} from "../utils/folderUtils";
import Icon from "react-native-vector-icons/Ionicons";
import type { ClassByTeacher } from "../types/classes";

interface FolderItemsScreenProps {
  route: { params: { prefix: string; classes: ClassByTeacher[] } };
  navigation: any;
}

const FolderItemsScreen = ({ route, navigation }: FolderItemsScreenProps) => {
  const { prefix, classes } = route.params;
  const { selectClass } = useTeacherContext();
  const { colors } = useTheme();
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  const filteredClasses = useMemo(
    () => getClassesByPrefix(classes, prefix),
    [classes, prefix],
  );

  const groups = useMemo(
    () => groupClassesByLastSegment(filteredClasses),
    [filteredClasses],
  );

  const handleClassPress = (classItem: ClassByTeacher) => {
    navigation.navigate("StudentList", {
      batch: {
        id: classItem.id,
        name: classItem.name,
        students: classItem.students,
      },
    });
    selectClass(classItem);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroupKey((prev) =>
      prev === groupKey ? null : groupKey,
    );
  };

  const dynamicStyles = createStyles(colors);

  const renderClassCard = (item: ClassByTeacher) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        dynamicStyles.classCard,
        pressed && dynamicStyles.classCardPressed,
      ]}
      onPress={() => handleClassPress(item)}
    >
      <View style={dynamicStyles.cardHeader}>
        <View style={dynamicStyles.imageContainer}>
          {item.courseId?.image ? (
            <Image
              source={{ uri: item.courseId.image }}
              style={dynamicStyles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={dynamicStyles.imagePlaceholder}>
              <Text style={dynamicStyles.imagePlaceholderText}>📚</Text>
            </View>
          )}
        </View>
        <View style={dynamicStyles.classInfo}>
          <Text style={dynamicStyles.className}>{item.name}</Text>
          <Text style={dynamicStyles.courseName} numberOfLines={2}>
            {item.courseId?.name}
          </Text>
        </View>
      </View>
      <View style={dynamicStyles.cardFooter}>
        <Text style={dynamicStyles.studentCount}>
          {item.students.length} student
          {item.students.length !== 1 ? "s" : ""}
        </Text>
        <View style={dynamicStyles.ctaButton}>
          <Text style={dynamicStyles.ctaText}>View Students</Text>
          <Text style={dynamicStyles.ctaArrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["bottom"]}>
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.sectionTitle}>
          {groups.length} group{groups.length !== 1 ? "s" : ""} in {prefix}
        </Text>

        {groups.length === 0 ? (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>
              No classes in this batch
            </Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.groupKey}
            contentContainerStyle={dynamicStyles.listContent}
            renderItem={({ item: group }) => {
              const isExpanded = expandedGroupKey === group.groupKey;
              const count = group.classes.length;
              return (
                <View style={dynamicStyles.groupContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      dynamicStyles.groupHeader,
                      pressed && dynamicStyles.groupHeaderPressed,
                    ]}
                    onPress={() => toggleGroup(group.groupKey)}
                  >
                    <View style={dynamicStyles.groupIconContainer}>
                      <Icon
                        name="layers"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={dynamicStyles.groupContentHeader}>
                      <Text
                        style={dynamicStyles.groupKey}
                        numberOfLines={1}
                      >
                        {group.groupKey}
                      </Text>
                      <View style={dynamicStyles.groupMetaRow}>
                        <View style={dynamicStyles.groupBadge}>
                          <Text style={dynamicStyles.groupBadgeText}>
                            {count} {count === 1 ? "class" : "classes"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={dynamicStyles.groupChevronContainer}>
                      <Icon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={22}
                        color={colors.primary}
                      />
                    </View>
                  </Pressable>
                  {isExpanded && (
                    <View style={dynamicStyles.groupContent}>
                      {group.classes.map(renderClassCard)}
                    </View>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
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
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 16,
    },
    listContent: {
      paddingBottom: 24,
    },
    groupContainer: {
      marginBottom: 12,
    },
    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
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
    groupHeaderPressed: {
      opacity: 0.88,
      backgroundColor: "#2a2a2a",
    },
    groupIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${colors.primary}22`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    groupContentHeader: {
      flex: 1,
      minWidth: 0,
    },
    groupKey: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: 0.3,
      marginBottom: 6,
    },
    groupMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    groupBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    groupBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.75)",
      letterSpacing: 0.2,
    },
    groupChevronContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    groupContent: {
      marginTop: 8,
      marginLeft: 12,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: colors.cardBorder,
    },
    classCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 4,
    },
    classCardPressed: {
      opacity: 0.92,
    },
    cardHeader: {
      flexDirection: "row",
      padding: 16,
      paddingBottom: 12,
      alignItems: "center",
    },
    imageContainer: {
      marginRight: 14,
    },
    courseImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
    },
    imagePlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePlaceholderText: {
      fontSize: 32,
    },
    classInfo: {
      flex: 1,
      justifyContent: "center",
    },
    className: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    courseName: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    studentCount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primaryText,
    },
    ctaArrow: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primaryText,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

export default FolderItemsScreen;
