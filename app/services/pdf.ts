import { Linking, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import config from "../config/environment";
import type { AttendancePdfError, AttendancePdfParams } from "../types/pdf";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;
const PDF_MIME_TYPE = "application/pdf";

export function isYearMonth(month: string): boolean {
  return YEAR_MONTH_PATTERN.test(month);
}

export function buildAttendancePdfFileName(month: string): string {
  return `mrt-report-${month}.pdf`;
}

/**
 * Public GET /pdf/attendance — no auth header is required.
 * Month must be YYYY-MM.
 */
export function buildAttendancePdfUrl({
  studentId,
  classId,
  courseId,
  month,
}: AttendancePdfParams): string {
  const params = new URLSearchParams({
    studentId,
    classId,
    courseId,
    month,
  });
  const base = String(config.API_BASE_URL).replace(/\/$/, "");
  return `${base}/pdf/attendance?${params.toString()}`;
}

function toPdfError(error: unknown, fallback: string): AttendancePdfError {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return { message: (error as { message: string }).message };
  }
  return { message: fallback };
}

function triggerWebDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function shareDownloadedFile(fileUri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: PDF_MIME_TYPE,
      dialogTitle: "Save MRT report",
      UTI: "com.adobe.pdf",
    });
    return;
  }

  await Linking.openURL(fileUri);
}

/**
 * Downloads the attendance/MRT PDF onto the device, then opens the system
 * share sheet so the user can save it to Files, Downloads, or Drive.
 */
export async function downloadAttendancePdf(
  params: AttendancePdfParams,
): Promise<string> {
  if (!isYearMonth(params.month)) {
    throw { message: "Month must be YYYY-MM" } satisfies AttendancePdfError;
  }

  const url = buildAttendancePdfUrl(params);
  const fileName = buildAttendancePdfFileName(params.month);

  if (Platform.OS === "web") {
    triggerWebDownload(url, fileName);
    return url;
  }

  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!directory) {
    throw {
      message: "Unable to access device storage",
    } satisfies AttendancePdfError;
  }

  const fileUri = `${directory}${fileName}`;

  try {
    const result = await FileSystem.downloadAsync(url, fileUri);

    if (result.status < 200 || result.status >= 300) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      throw {
        message: "Failed to download attendance report",
      } satisfies AttendancePdfError;
    }

    try {
      await shareDownloadedFile(result.uri);
    } catch (shareError) {
      // File is already on-device; dismissing the share sheet is not a failure.
      console.warn("Share sheet dismissed or unavailable:", shareError);
    }

    return result.uri;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      (error as AttendancePdfError).message ===
        "Failed to download attendance report"
    ) {
      throw error;
    }

    console.error("Error downloading attendance PDF:", error);
    throw toPdfError(error, "Failed to download attendance report");
  }
}
