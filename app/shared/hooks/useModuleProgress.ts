import { useQuery } from "@tanstack/react-query";
import { getStudentProgress } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";
import type {
  GetStudentProgressByIdSuccess,
  GetStudentProgressError,
} from "../../types/studentProgress";

export function useModuleProgress(progressId: string | null) {
  return useQuery<GetStudentProgressByIdSuccess, GetStudentProgressError>({
    queryKey: queryKeys.moduleProgress(progressId),
    queryFn: () => getStudentProgress(progressId!),
    enabled: !!progressId && typeof progressId === "string",
  });
}
