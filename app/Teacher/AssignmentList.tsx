import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { assignments } from "../components/JsonData";

const AssignmentList = ({ route }) => {
  //  const { assignments } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <TouchableOpacity
              onPress={() => Linking.openURL(item.file.uri)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>View PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default AssignmentList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6200ee",
  },
  card: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    marginTop: 4,
    color: "#666",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
});
