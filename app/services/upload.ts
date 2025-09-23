import { getToken } from "./auth";

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

export { uploadProfilePicture };
