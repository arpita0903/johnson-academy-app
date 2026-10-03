import type { NotificationResponse } from "expo-notifications";
import * as Notifications from "expo-notifications";
import { getStudentProgress } from "../../services/student";
import type { Module } from "../../types/studentProgress";

export type NotificationAuthState = {
  isAuthenticated: boolean;
  role: string | null;
};

export type ModuleStartedNotificationData = {
  type: "module_started";
  progressId: string;
  moduleId: string;
  syllabusId: string;
  courseId: string;
  classId: string;
};

type DrawerNavigation = {
  navigate: (name: string, params?: Record<string, unknown>) => void;
};

let drawerNavigation: DrawerNavigation | null = null;
let pendingNotificationData: Record<string, unknown> | null = null;
let lastHandledNotificationId: string | null = null;

export const setDrawerNavigation = (
  navigation: DrawerNavigation | null,
): void => {
  drawerNavigation = navigation;
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

export const parseModuleStartedData = (
  data: Record<string, unknown> | undefined,
): ModuleStartedNotificationData | null => {
  if (!data || data["type"] !== "module_started") {
    return null;
  }

  const progressId = asString(data["progressId"]);
  const moduleId = asString(data["moduleId"]);
  const syllabusId = asString(data["syllabusId"]);
  const courseId = asString(data["courseId"]);
  const classId = asString(data["classId"]);

  if (!progressId || !moduleId || !syllabusId || !courseId || !classId) {
    return null;
  }

  return {
    type: "module_started",
    progressId,
    moduleId,
    syllabusId,
    courseId,
    classId,
  };
};

const findModuleInProgress = (
  modules: Module[] | undefined,
  moduleId: string,
): Module | undefined =>
  modules?.find((module) => module.moduleId?.id === moduleId);

export const navigateFromModuleStarted = async (
  data: ModuleStartedNotificationData,
  auth: NotificationAuthState,
): Promise<void> => {
  if (!auth.isAuthenticated || auth.role !== "student") {
    return;
  }

  if (!drawerNavigation) {
    pendingNotificationData = data;
    return;
  }

  try {
    const progress = await getStudentProgress(data.progressId);
    const selectedModule = progress.syllabusProgress
      ?.flatMap((syllabus) => syllabus.modules)
      .find((module) => module.moduleId?.id === data.moduleId);

    const moduleToOpen: Module | undefined =
      selectedModule ??
      findModuleInProgress(
        progress.syllabusProgress?.[0]?.modules,
        data.moduleId,
      );

    if (!moduleToOpen) {
      return;
    }

    drawerNavigation.navigate("Main", {
      screen: "ModuleDetail",
      params: {
        progressId: data.progressId,
        selectedModule: moduleToOpen,
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.error("Failed to open module from notification:", error);
    }
  }
};

export const stashNotificationData = (
  data: Record<string, unknown> | null,
): void => {
  pendingNotificationData = data;
};

export const consumePendingNotificationData = (): Record<
  string,
  unknown
> | null => {
  const pending = pendingNotificationData;
  pendingNotificationData = null;
  return pending;
};

export const handleNotificationResponse = async (
  response: NotificationResponse,
  auth: NotificationAuthState,
): Promise<void> => {
  const identifier = response.notification.request.identifier;
  if (identifier === lastHandledNotificationId) {
    return;
  }

  const data = response.notification.request.content.data;
  lastHandledNotificationId = identifier;

  if (!auth.isAuthenticated) {
    stashNotificationData(data);
    return;
  }

  const moduleStarted = parseModuleStartedData(data);
  if (!moduleStarted) {
    return;
  }

  await navigateFromModuleStarted(moduleStarted, auth);
};

export const processPendingNotification = async (
  auth: NotificationAuthState,
): Promise<void> => {
  const pending = consumePendingNotificationData();
  if (pending) {
    const moduleStarted = parseModuleStartedData(pending);
    if (moduleStarted) {
      await navigateFromModuleStarted(moduleStarted, auth);
    }
    return;
  }

  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (!lastResponse) {
    return;
  }

  await handleNotificationResponse(lastResponse, auth);
};
