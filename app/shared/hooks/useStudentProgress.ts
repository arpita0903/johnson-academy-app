import { useQuery } from "@tanstack/react-query";
import { getProgressFromStudentIdClassId } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";

export function useStudentProgress(
  studentId: string | null,
  classId: string | null
) {
  return useQuery({
    queryKey: queryKeys.studentProgress(studentId, classId),
    queryFn: () =>
      getProgressFromStudentIdClassId(studentId!, classId!),
    enabled:
      !!studentId &&
      !!classId &&
      typeof studentId === "string" &&
      typeof classId === "string",
  });
}
