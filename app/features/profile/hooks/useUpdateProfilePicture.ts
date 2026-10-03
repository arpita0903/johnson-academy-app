import { useCallback, useState } from "react";
import { ActionSheetIOS, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../../../context/AppContext";
import { useTheme } from "../../../context/ThemeContext";
import { useToast } from "../../../context/ToastContext";
import { type User } from "../../../services/auth";
import {
  updateUserProfilePicture,
  type ProfileImageUpload,
} from "../../../services/upload";
import {
  pickProfileImageFromCamera,
  pickProfileImageFromLibrary,
} from "../utils/profileImagePicker";

type AppUserContext = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export function useUpdateProfilePicture() {
  const { user, setUser } = useAppContext() as AppUserContext;
  const { isDark } = useTheme();
  const { showError, showSuccess } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSourceSheetVisible, setIsSourceSheetVisible] = useState(false);

  const persistUpdatedUser = useCallback(
    async (profilePicture: string) => {
      if (!user) {
        return;
      }
      const nextUser = { ...user, profilePicture };
      setUser(nextUser);
      await AsyncStorage.setItem("user", JSON.stringify(nextUser));
    },
    [setUser, user],
  );

  const uploadPickedImage = useCallback(
    async (image: ProfileImageUpload) => {
      if (!user?.id) {
        showError("Please sign in again to update your profile photo.");
        return;
      }

      setIsUpdating(true);
      try {
        const updatedUser = await updateUserProfilePicture(user.id, image);
        const nextPicture =
          typeof updatedUser.profilePicture === "string" &&
          updatedUser.profilePicture.length > 0
            ? updatedUser.profilePicture
            : image.uri;
        await persistUpdatedUser(nextPicture);
        showSuccess("Profile photo updated");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update profile photo. Please try again.";
        showError(message);
      } finally {
        setIsUpdating(false);
      }
    },
    [persistUpdatedUser, showError, showSuccess, user?.id],
  );

  const runPicker = useCallback(
    async (source: "camera" | "library") => {
      try {
        const image =
          source === "camera"
            ? await pickProfileImageFromCamera()
            : await pickProfileImageFromLibrary();
        if (!image) {
          return;
        }
        await uploadPickedImage(image);
      } catch (error) {
        const fallback =
          source === "camera"
            ? "Camera is not available on this device."
            : "Could not open your photo library.";
        const message = error instanceof Error ? error.message : fallback;
        showError(message);
      }
    },
    [showError, uploadPickedImage],
  );

  const startPicker = useCallback(
    (source: "camera" | "library", waitForSheet = false) => {
      if (waitForSheet) {
        setIsSourceSheetVisible(false);
      }

      // Let the iOS action sheet / Android sheet finish dismissing before
      // presenting the camera or photo picker.
      const delay = waitForSheet ? 180 : Platform.OS === "ios" ? 320 : 0;
      if (delay === 0) {
        void runPicker(source);
        return;
      }

      setTimeout(() => {
        void runPicker(source);
      }, delay);
    },
    [runPicker],
  );

  const closeSourceSheet = useCallback(() => {
    setIsSourceSheetVisible(false);
  }, []);

  const openSourceMenu = useCallback(() => {
    if (isUpdating || !user?.id) {
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Update profile photo",
          options: ["Cancel", "Take photo", "Choose from gallery"],
          cancelButtonIndex: 0,
          userInterfaceStyle: isDark ? "dark" : "light",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            startPicker("camera");
          }
          if (buttonIndex === 2) {
            startPicker("library");
          }
        },
      );
      return;
    }

    setIsSourceSheetVisible(true);
  }, [isDark, isUpdating, startPicker, user?.id]);

  return {
    isUpdating,
    isSourceSheetVisible,
    openSourceMenu,
    closeSourceSheet,
    onTakePhoto: () => startPicker("camera", true),
    onChooseFromGallery: () => startPicker("library", true),
  };
}
