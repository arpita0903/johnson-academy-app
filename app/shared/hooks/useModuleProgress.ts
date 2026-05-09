import { useQuery } from "@tanstack/react-query";
import { getStudentProgress } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";

export function useModuleProgress(progressId: string | null) {
  return useQuery({
    queryKey: queryKeys.moduleProgress(progressId),
    queryFn: () => getStudentProgress(progressId!),
    enabled: !!progressId && typeof progressId === "string",
  });
}
