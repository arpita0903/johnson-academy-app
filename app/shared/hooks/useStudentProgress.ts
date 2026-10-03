import { useQuery } from "@tanstack/react-query";
import { getProgressFromStudentIdClassId } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";
import type {
  GetStudentProgressByStudentClassAndCourseSuccess,
  GetStudentProgressError,
} from "../../types/studentProgress";

export function useStudentProgress(
  studentId: string | null,
  classId: string | null,
  courseId: string | null,
) {
  return useQuery<
    GetStudentProgressByStudentClassAndCourseSuccess,
    GetStudentProgressError
  >({
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
