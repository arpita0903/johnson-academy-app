import { useQuery } from "@tanstack/react-query";
import { getProgressFromStudentIdClassId } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";

export function useStudentProgress(
  studentId: string | null,
  classId: string | null,
  courseId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.studentProgress(studentId, classId, courseId),
    queryFn: () =>
      getProgressFromStudentIdClassId(studentId!, classId!, courseId!),
    enabled:
      !!studentId &&
      !!classId &&
      typeof studentId === "string" &&
      typeof classId === "string" &&
      typeof courseId === "string",
  });
}
