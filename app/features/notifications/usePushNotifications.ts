import { useEffect } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useAppContext } from "../../context/AppContext";
import {
  registerPushToken,
  storePushToken,
  type PushPlatform,
} from "../../services/push";
import {
  handleNotificationResponse,
  processPendingNotification,
} from "./notificationNavigation";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type EasExtra = {
  eas?: {
    projectId?: string;
  };
};

const getExpoProjectId = (): string | undefined => {
  const extra = Constants.expoConfig?.extra as EasExtra | undefined;
  const easConfig = (Constants as { easConfig?: { projectId?: string } })
    .easConfig;
  return extra?.eas?.projectId ?? easConfig?.projectId;
};

const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#0c1224",
  });
};

export const registerForPushNotifications = async (): Promise<
  string | null
> => {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return null;
  }

  if (!Device.isDevice) {
    if (__DEV__) {
      console.warn("Push notifications require a physical device.");
    }
    return null;
  }

  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    return null;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn("Missing EAS projectId for Expo push token.");
    }
    return null;
  }

  try {
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = pushToken.data;
    const platform: PushPlatform = Platform.OS;

    await registerPushToken(token, platform);
    await storePushToken(token);
    return token;
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to register for push notifications:", error);
    }
    return null;
  }
};

export function usePushNotifications(): void {
  const { isAuthenticated, user } = useAppContext();
  const role = typeof user?.role === "string" ? user.role : null;

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleNotificationResponse(response, {
          isAuthenticated: Boolean(isAuthenticated),
          role,
        });
      },
    );

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    const run = async () => {
      await registerForPushNotifications();
      if (cancelled) {
        return;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 800);
      });

      if (cancelled) {
        return;
      }

      await processPendingNotification({
        isAuthenticated: true,
        role,
      });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, role]);
}
