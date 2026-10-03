import { useQuery } from "@tanstack/react-query";
import { getMrtByStudentClassMonth } from "../../services/mrt";
import { queryKeys } from "../../config/queryKeys";
import type {
  GetMrtByStudentClassMonthError,
  GetMrtByStudentClassMonthSuccess,
} from "../../types/mrt";

function isMrtNotFound(error: unknown): error is GetMrtByStudentClassMonthError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as GetMrtByStudentClassMonthError).code === 404
  );
}

export function useMrtByStudentClassMonth(
  studentId: string | null,
  classId: string | null,
  month: string | null,
  courseId: string | null,
) {
  return useQuery<
    GetMrtByStudentClassMonthSuccess | null,
    GetMrtByStudentClassMonthError
  >({
    queryKey: queryKeys.mrtByStudentClassMonth(
      studentId,
      classId,
      month,
      courseId,
    ),
    queryFn: async () => {
      try {
        return await getMrtByStudentClassMonth(
          studentId!,
          classId!,
          month!,
          courseId!,
        );
      } catch (error) {
        if (isMrtNotFound(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled:
      !!studentId &&
      !!classId &&
      !!month &&
      !!courseId &&
      typeof studentId === "string" &&
      typeof classId === "string" &&
      typeof month === "string" &&
      typeof courseId === "string",
    retry: (failureCount, error) => {
      if (isMrtNotFound(error)) return false;
      return failureCount < 2;
    },
  });
}
