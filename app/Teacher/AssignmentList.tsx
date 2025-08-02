import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { assignments } from "../components/JsonData";
import { useAppContext } from "../context/AppContext";

const AssignmentList = React.memo(() => {
  const { user } = useAppContext();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>All Assignments</Text>
      {assignments.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity style={styles.viewPdfButton}>
              <Text style={styles.viewPdfText}>View PDF</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          {user.role === "student" ? (
            <>
              <Text style={styles.label}>Submit Assignment Link</Text>
              <TextInput
                placeholder="Paste your assignment link"
                style={styles.input}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit Now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text
              style={{ color: "blue", textDecorationLine: "underline" }}
              onPress={() =>
                Linking.openURL(
                  "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view"
                )
              }
            >
              View Document
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6a1b9a",
  },
  card: {
    backgroundColor: "#f8f6ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  viewPdfButton: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewPdfText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#03dac6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default AssignmentList;
