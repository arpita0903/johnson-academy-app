import { useQuery } from "@tanstack/react-query";
import { getStudentClasses } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";

export function useStudentClasses(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.studentClasses(studentId),
    queryFn: () => getStudentClasses(studentId!),
    enabled: !!studentId && typeof studentId === "string",
  });
}
