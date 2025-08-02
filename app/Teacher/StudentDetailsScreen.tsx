import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // or any icon lib you use

import RNPickerSelect from "react-native-picker-select"; // install this if not already
import { TextInput } from "react-native";

const StudentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedStudent } = route.params;

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [formData, setFormData] = useState({
    fileSubmission: "",
    regularity: "",
    learningSpeed: "",
    songLearning: "",
    Assignment: "",
  });

  // Months with year
  const months = [
    { label: "January 2024", value: "Jan-2024" },
    { label: "February 2024", value: "Feb-2024" },
    { label: "March 2024", value: "Mar-2024" },
    { label: "April 2024", value: "Apr-2024" },
    { label: "May 2024", value: "May-2024" },
    { label: "June 2024", value: "Jun-2024" },
    { label: "July 2024", value: "Jul-2024" },
    { label: "August 2024", value: "Aug-2024" },
    { label: "September 2024", value: "Sep-2024" },
    { label: "October 2024", value: "Oct-2024" },
    { label: "November 2024", value: "Nov-2024" },
    { label: "December 2024", value: "Dec-2024" },
  ];

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Clear or send to backend here
  };

  if (!selectedStudent) {
    return (
      <View style={styles.container}>
        <Text>No Data Available...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/*<TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>*/}

      <View style={styles.detailsBox}>
        <Text style={styles.sheetTitle}>{selectedStudent.name}'s Details</Text>

        <Text style={styles.detailText}>
          <Text style={styles.boldLabel}>Roll number: </Text>
          {selectedStudent.id}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldLabel}>Instrument: </Text>
          {selectedStudent.instrument}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldLabel}>Date of Joining: </Text>
          {selectedStudent.date_of_joining}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldLabel}>Current Level: </Text>
          {selectedStudent.level}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.boldLabel}>Last level promoted: </Text>
          {selectedStudent.promoted}
        </Text>
        {/*
        <TouchableOpacity style={styles.mrtButton} onPress={() => {}}>
          <Text style={styles.mrtButtonText}>Show MRT</Text>
        </TouchableOpacity>*/}
      </View>
      <View style={styles.mrtSection}>
        <Text style={styles.mrtHeading}>Monthly Review Test (30 Marks)</Text>

        <RNPickerSelect
          onValueChange={(value) => setSelectedMonth(value)}
          items={months}
          placeholder={{ label: "Select Month", value: null }}
          style={{
            inputIOS: styles.dropdown,
            inputAndroid: styles.dropdown,
          }}
        />
      </View>

      {selectedMonth && (
        <View style={styles.formContainer}>
          {[
            "SPT & File Submission",
            "Regularity",
            "Learning Speed",
            "Song Learning",
            "Assignment",
          ].map((field, idx) => (
            <View key={field} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {field === "remarks" ? "Remarks" : field}
              </Text>
              <TextInput
                style={styles.input}
                value={formData[field]}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={`Max marks: 5`}
                keyboardType={field === "remarks" ? "default" : "numeric"}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit MRT</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default StudentDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    color: "#333",
  },
  detailsBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
  },
  boldLabel: {
    fontWeight: "bold",
  },
  mrtButton: {
    marginTop: 20,
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  mrtButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  mrtSection: {
    marginTop: 30,
    marginBottom: 10,
  },
  mrtHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  dropdown: {
    fontSize: 16,
    //paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#333",
    backgroundColor: "#fff",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
