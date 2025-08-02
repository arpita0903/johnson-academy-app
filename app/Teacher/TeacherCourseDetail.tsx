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

const TeacherCourseDetail = ({ route }) => {
  const { item } = route.params;

  const [hasStarted, setHasStarted] = useState(false);
  const [totalDays, setTotalDays] = useState("");
  const [remark, setRemark] = useState("");

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleEnd = () => {
    //course ended
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Detail Section */}
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        {item.description ? (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.pillContainer}>
                <Text style={styles.pillText}>{item.session}</Text>
              </View>
            </View>
            <Text style={styles.text}>{item.description}</Text>
          </View>
        ) : (
          <View style={styles.pillPostion}>
            <View style={[styles.pillContainer]}>
              <Text style={styles.pillText}>{item.session}</Text>
            </View>
          </View>
        )}

        <View style={[styles.section, styles.dateContainer]}>
          <MaterialIcons name="event" size={20} color="#3498db" />
          <Text style={styles.dateLabel}>Date of Issue:</Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{item.date_of_issue || "N/A"}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.dateContainer]}>
          <MaterialIcons name="event-available" size={20} color="#27ae60" />
          <Text style={styles.dateLabel}>Date of Completion:</Text>
          <View style={[styles.dateBadge, { backgroundColor: "#d4f4dd" }]}>
            <Text style={[styles.dateText, { color: "#2d8659" }]}>
              {item.date_of_completion || "N/A"}
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.sectionBgAlt]}>
          <Text style={styles.label}>Remark</Text>
          <Text style={styles.text}>{item.remark || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.row}>
          {/*<View style={styles.halfInputWrapper}>
            <Text style={styles.formLabel}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={item.date_of_issue}
              editable={false}
            />
          </View>

          <View style={styles.halfInputWrapper}>
            <Text style={styles.formLabel}>End Date</Text>
            <TextInput
              style={styles.input}
              value={item.date_of_completion}
              editable={false}
            />
          </View>*/}
        </View>

        <Text style={styles.formLabel}>Total Days</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={totalDays}
          onChangeText={setTotalDays}
          placeholder="Enter total days"
        />

        <Text style={styles.formLabel}>Remark</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={remark}
          onChangeText={setRemark}
          multiline
          numberOfLines={3}
          placeholder="Enter remark"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Start Course</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.endButton,
              !hasStarted && styles.disabledButton,
            ]}
            onPress={handleEnd}
            disabled={!hasStarted}
          >
            <Text style={styles.buttonText}>End Course</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
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
    marginBottom: 10,
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
  formSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#34495e",
  },
  input: {
    backgroundColor: "#f0f4f8",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#333",
    marginBottom: 20,
  },
  textBox: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  endButton: {
    backgroundColor: "#E74C3C",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  formContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 8,
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
    height: 80,
    textAlignVertical: "top", // for Android multiline text input alignment
  },
});

export default TeacherCourseDetail;
