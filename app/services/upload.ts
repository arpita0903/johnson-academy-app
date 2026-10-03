import { getToken, type User } from "./auth";
import config from "../config/environment";

// response type
export type UploadResponse = {
  data: {
    fileId: string;
    fileName: string;
    filePath: string;
    fileType: string;
    height: number;
    size: number;
    thumbnailUrl: string;
    url: string;
    width: number;
  };
};

//export the function
const uploadProfilePicture = async (
  uri: string,
  folder: string,
  tags: string
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    const fileName = `profile-image-${Date.now()}.jpg`;
    const fileType = "image/jpeg";

    // Append the file to FormData
    formData.append("file", {
      uri: uri, // make sure to pass URI
      name: fileName,
      type: fileType,
    } as any);
    formData.append("folder", folder);
    formData.append("tags", tags);

    const token = await getToken();

    // Use native fetch instead of axios for better FormData support in React Native

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result as UploadResponse;
    } catch (fetchError: any) {
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error uploading profile picture:", JSON.stringify(error));
    throw (
      error.response?.data || { message: "Failed to upload profile picture" }
    );
  }
};

export type ProfileImageUpload = {
  uri: string;
  mimeType: string;
  fileName: string;
};

const readErrorMessage = async (response: Response): Promise<string> => {
  const errorData = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;
  return errorData?.message || `HTTP error! status: ${response.status}`;
};

const updateUserProfilePicture = async (
  userId: string,
  image: ProfileImageUpload,
): Promise<User> => {
  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    name: image.fileName,
    type: image.mimeType,
  } as unknown as Blob);

  const token = await getToken();
  if (!token) {
    throw new Error("Please sign in again to update your profile photo.");
  }

  const response = await fetch(
    `${config.API_BASE_URL}/users/${userId}/profile-picture`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as User;
};

export { uploadProfilePicture, updateUserProfilePicture };
