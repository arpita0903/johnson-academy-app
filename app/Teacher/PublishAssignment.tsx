import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const PublishAssignment = ({ route, navigation }) => {
  const { batchId } = route.params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleFileUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (result.type === "success") {
      setFile(result);
    }
  };

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publish Assignment</Text>

      <TextInput
        style={styles.input}
        placeholder="Assignment Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity onPress={handleFileUpload} style={styles.uploadButton}>
        <Text style={styles.uploadText}>{file ? file.name : "Upload PDF"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Publish</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PublishAssignment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#6200ee",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  uploadButton: {
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadText: {
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#6200ee",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
