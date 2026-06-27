import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "./axiosInstance";
import type { VersionCheckResponse } from "../types/appVersion";

export const VERSION_CHECK_TIMEOUT_MS = 5000;

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

function getPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}

export async function checkAppVersion(): Promise<VersionCheckResponse> {
  const response = await api.get<VersionCheckResponse>("/app-version/check", {
    params: {
      platform: getPlatform(),
      version: getAppVersion(),
    },
    timeout: VERSION_CHECK_TIMEOUT_MS,
  });

  return response.data;
}
