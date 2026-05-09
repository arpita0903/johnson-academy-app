import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Icon } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "../../../../services/upload";
import { fetchUser, updateUserProfile } from "../../../../services/auth";
import { useAppContext } from "../../../../context/AppContext";
import { useToast } from "../../../../context/ToastContext";

interface CompleteProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (profileData: ProfileData) => void;
}

interface ProfileData {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture: string | null;
}

const CompleteProfileModal = ({
  visible,
  onClose,
  onSubmit,
}: CompleteProfileModalProps) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    name: "",
    phoneNumber: "",
    profilePicture: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { setUser } = useAppContext();
  const { showError, showSuccess, showInfo } = useToast();
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser();
      if (userData) {
        setProfileData({
          id: userData.id || "",
          name: userData.name || "",
          phoneNumber: userData.phoneNumber || "",
          profilePicture: userData.profilePicture || null,
        });
      }
    };
    loadUser();
  }, []);

  const handleprofilePictureSelect = async () => {
    try {
      // Ask for media library permission (for picking images)
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showInfo("Sorry, we need photo library permissions to make this work!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setProfileData((prev) => ({
          ...prev,
          profilePicture: selectedImage.uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showError("Failed to select image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    if (!profileData.name.trim() || !profileData.phoneNumber.trim()) {
      showError("Please fill in all required fields");
      setIsUploading(false);
      return;
    }

    if (!profileData.profilePicture) {
      showError("Please select a profile image");
      setIsUploading(false);
      return;
    }

    try {
      // Convert image URI to Blob for upload (React Native compatible)

      const uploadResult = await uploadProfilePicture(
        profileData.profilePicture, // Pass blob directly instead of File
        "student",
        "profile",
      );

      // Update profile data with the uploaded image URL
      const updatedProfileData = {
        ...profileData,
        profilePicture: uploadResult.data.url,
        isCompleteProfile: true,
      };

      const user = await updateUserProfile(updatedProfileData);

      setUser((prev: any) =>
        prev ? { ...prev, profilePicture: user.profilePicture } : null,
      );

      // Show success message
      showSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      showError(
        error.message || "Failed to upload profile picture. Please try again.",
      );
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isUploading}
            >
              <Icon source="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <Text style={styles.modalSubtitle}>
              Please provide the following information to continue
            </Text>
          </View>

          {/* Profile Image Section */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={handleprofilePictureSelect}
              disabled={isUploading}
            >
              {profileData.profilePicture ? (
                <Image
                  source={
                    profileData.profilePicture
                      ? { uri: profileData.profilePicture }
                      : require("../../../../../assets/images/profileDefault.png")
                  }
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Icon source="camera" size={40} color="#999" />
                  <Text style={styles.profilePictureSubtext}>
                    Tap to select image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.name}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!isUploading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phoneNumber}
                onChangeText={(text) =>
                  setProfileData((prev) => ({ ...prev, phoneNumber: text }))
                }
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={!isUploading}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isUploading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  profilePictureSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePicture: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    alignItems: "center",
  },
  profilePictureSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  formFields: {
    width: "100%",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#333",
  },
  modalActions: {
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#FF7043",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

export default CompleteProfileModal;
export type { ProfileData };
