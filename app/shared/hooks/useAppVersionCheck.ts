import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { checkAppVersion } from "../../services/appVersion";
import type { VersionCheckResponse } from "../../types/appVersion";

const DISMISSED_SOFT_UPDATE_KEY = "dismissedSoftUpdateFor";

export function useAppVersionCheck() {
  const [isChecking, setIsChecking] = useState(true);
  const [versionData, setVersionData] = useState<VersionCheckResponse | null>(
    null,
  );
  const [showSoftUpdate, setShowSoftUpdate] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const applyVersionResponse = useCallback(
    async (result: VersionCheckResponse) => {
      setVersionData(result);
      setShowSoftUpdate(false);
      setIsBlocked(false);

      if (result.updateType === "soft") {
        const dismissed = await AsyncStorage.getItem(DISMISSED_SOFT_UPDATE_KEY);
        if (dismissed !== result.latestVersion) {
          setShowSoftUpdate(true);
        }
        return;
      }

      if (result.updateType === "hard" || result.updateType === "maintenance") {
        setIsBlocked(true);
      }
    },
    [],
  );

  const runCheck = useCallback(async () => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      setIsChecking(false);
      await SplashScreen.hideAsync().catch(() => undefined);
      return;
    }

    setIsChecking(true);

    try {
      const result = await checkAppVersion();
      await applyVersionResponse(result);
    } catch (error) {
      if (__DEV__) {
        console.error("App version check failed:", error);
      }
    } finally {
      setIsChecking(false);
      setIsRetrying(false);
      await SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [applyVersionResponse]);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => undefined);
    runCheck();
  }, [runCheck]);

  const dismissSoftUpdate = useCallback(async () => {
    if (versionData?.latestVersion) {
      await AsyncStorage.setItem(
        DISMISSED_SOFT_UPDATE_KEY,
        versionData.latestVersion,
      );
    }
    setShowSoftUpdate(false);
  }, [versionData]);

  const openStore = useCallback(() => {
    if (versionData?.storeUrl) {
      Linking.openURL(versionData.storeUrl).catch((error) => {
        if (__DEV__) {
          console.error("Failed to open store URL:", error);
        }
      });
    }
  }, [versionData]);

  const retry = useCallback(async () => {
    setIsRetrying(true);
    await runCheck();
  }, [runCheck]);

  return {
    isChecking,
    isBlocked,
    versionData,
    showSoftUpdate,
    isRetrying,
    dismissSoftUpdate,
    openStore,
    retry,
  };
}
