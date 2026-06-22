import { useQuery } from "@tanstack/react-query";
import { getStudentProfile } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";

export function useStudentProfile(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.studentProfile(studentId),
    queryFn: () => getStudentProfile(studentId!),
    enabled: !!studentId && typeof studentId === "string",
  });
}
