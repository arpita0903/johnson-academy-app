import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./axiosInstance";

export const PUSH_TOKEN_STORAGE_KEY = "expoPushToken";

export type PushPlatform = "ios" | "android";

export const getStoredPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storePushToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
};

export const clearStoredPushToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
};

export const registerPushToken = async (
  token: string,
  platform: PushPlatform,
): Promise<void> => {
  await api.post("/push/register", { token, platform });
};

export const unregisterPushToken = async (token: string): Promise<void> => {
  await api.delete("/push/register", { data: { token } });
};

export const unregisterCurrentPushToken = async (): Promise<void> => {
  const token = await getStoredPushToken();
  if (!token) {
    return;
  }

  try {
    await unregisterPushToken(token);
  } finally {
    await clearStoredPushToken();
  }
};
