import { useMutation } from "@tanstack/react-query";
import { downloadAttendancePdf } from "../../services/pdf";
import type { AttendancePdfError, AttendancePdfParams } from "../../types/pdf";

export function useDownloadAttendancePdf() {
  return useMutation<string, AttendancePdfError, AttendancePdfParams>({
    mutationFn: downloadAttendancePdf,
  });
}
