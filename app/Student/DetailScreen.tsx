import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // if using Expo

const DetailScreen = ({ route }) => {
  const { item } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        {item.description && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.pillContainer}>
                <Text style={styles.pillText}>{item.session}</Text>
              </View>
            </View>
            <Text style={styles.text}>{item.description}</Text>
          </View>
        )}
        {!item.description && (
          <View style={styles.pillPostion}>
            <View style={[styles.pillContainer]}>
              <Text style={styles.pillText}>{item.session}</Text>
            </View>
          </View>
        )}

        {/* Date of Issue */}
        <View style={[styles.section, styles.dateContainer]}>
          <MaterialIcons name="event" size={20} color="#3498db" />
          <Text style={styles.dateLabel}>Date of Issue:</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{item.date_of_issue || "N/A"}</Text>
          </View>
        </View>

        {/* Date of Completion */}
        <View style={[styles.section, styles.dateContainer]}>
          <MaterialIcons name="event-available" size={20} color="#27ae60" />
          <Text style={styles.dateLabel}>Date of Completion:</Text>
          <View style={[styles.dateBadge, { backgroundColor: "#d4f4dd" }]}>
            <Text style={[styles.dateText, { color: "#2d8659" }]}>
              {item.date_of_completion || "N/A"}
            </Text>
          </View>
        </View>

        {/* Remark */}
        <View style={[styles.section, styles.sectionBgAlt]}>
          <Text style={styles.label}>Remark</Text>
          <Text style={styles.text}>{item.remark || "N/A"}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f6fc",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 28,
    textAlign: "center",
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
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
    color: "#7f8c8d",
    lineHeight: 22,
  },
  pillContainer: {
    backgroundColor: "#ead1ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pillPostion: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 18,
  },

  pillText: {
    color: "#8d05ff",
    fontWeight: "600",
    fontSize: 14,
  },
  sectionBgAlt: {
    backgroundColor: "#fef6e4",
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  dateBadge: {
    backgroundColor: "#e1f0ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  dateText: {
    color: "#0077cc",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DetailScreen;
