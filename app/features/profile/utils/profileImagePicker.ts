import { Alert, Linking, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { ProfileImageUpload } from "../../../services/upload";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
  exif: false,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

function androidApiLevel(): number | null {
  if (Platform.OS !== "android") {
    return null;
  }
  const version = Platform.Version;
  if (typeof version === "number") {
    return version;
  }
  const parsed = Number.parseInt(String(version), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Android 12 and below need storage permission; 13+ uses the system photo picker. */
function needsLegacyLibraryPermission(): boolean {
  const api = androidApiLevel();
  return api != null && api < 33;
}

function promptOpenSettings(title: string, message: string): void {
  Alert.alert(title, message, [
    { text: "Not now", style: "cancel" },
    {
      text: "Open Settings",
      onPress: () => {
        void Linking.openSettings();
      },
    },
  ]);
}

async function ensureCameraPermission(): Promise<boolean> {
  const existing = await ImagePicker.getCameraPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  if (existing.status === "denied" && !existing.canAskAgain) {
    promptOpenSettings(
      "Camera access needed",
      "Enable camera access in Settings to take a profile photo.",
    );
    return false;
  }

  const requested = await ImagePicker.requestCameraPermissionsAsync();
  if (requested.granted) {
    return true;
  }

  if (!requested.canAskAgain) {
    promptOpenSettings(
      "Camera access needed",
      "Enable camera access in Settings to take a profile photo.",
    );
  }

  return false;
}

async function ensureLibraryPermission(): Promise<boolean> {
  if (!needsLegacyLibraryPermission()) {
    return true;
  }

  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted || existing.accessPrivileges === "limited") {
    return true;
  }

  if (existing.status === "denied" && !existing.canAskAgain) {
    promptOpenSettings(
      "Photo access needed",
      "Enable photo access in Settings to choose a profile photo.",
    );
    return false;
  }

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted || requested.accessPrivileges === "limited") {
    return true;
  }

  if (!requested.canAskAgain) {
    promptOpenSettings(
      "Photo access needed",
      "Enable photo access in Settings to choose a profile photo.",
    );
  }

  return false;
}

function toPickedImage(
  asset: ImagePicker.ImagePickerAsset,
): ProfileImageUpload {
  let mimeType = (asset.mimeType || "image/jpeg").toLowerCase();
  if (
    mimeType === "image/jpg" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  ) {
    mimeType = "image/jpeg";
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    mimeType = "image/jpeg";
  }

  const extension = EXTENSION_BY_MIME[mimeType] ?? "jpg";
  const originalName = asset.fileName?.trim();
  const fileName = originalName
    ? originalName.replace(/\.[^.]+$/, `.${extension}`)
    : `profile-${Date.now()}.${extension}`;

  return {
    uri: asset.uri,
    mimeType,
    fileName,
  };
}

function firstAsset(
  result: ImagePicker.ImagePickerResult,
): ImagePicker.ImagePickerAsset | null {
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return result.assets[0];
}

export async function pickProfileImageFromCamera(): Promise<ProfileImageUpload | null> {
  const allowed = await ensureCameraPermission();
  if (!allowed) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    ...PICKER_OPTIONS,
    cameraType: ImagePicker.CameraType.front,
  });

  const asset = firstAsset(result);
  return asset ? toPickedImage(asset) : null;
}

export async function pickProfileImageFromLibrary(): Promise<ProfileImageUpload | null> {
  const allowed = await ensureLibraryPermission();
  if (!allowed) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  const asset = firstAsset(result);
  return asset ? toPickedImage(asset) : null;
}
