import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelModule } from "../../services/student-progress";
import { queryKeys } from "../../config/queryKeys";
import type { StudentProgressResponse } from "../../types/studentProgress";

export interface CancelModuleParams {
  studentProgressId: string;
  moduleId: string;
  syllabusId: string;
}

function syncStudentProgressCache(
  queryClient: ReturnType<typeof useQueryClient>,
  data: StudentProgressResponse,
) {
  queryClient.setQueryData(queryKeys.moduleProgress(data.id), data);
  queryClient.invalidateQueries({
    queryKey: queryKeys.moduleProgress(data.id),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.studentProgress(
      data.studentId?.id ?? null,
      data.classId?.id ?? null,
    ),
  });
}

export function useCancelModule() {
  const queryClient = useQueryClient();

  return useMutation<StudentProgressResponse, unknown, CancelModuleParams>({
    mutationFn: ({ studentProgressId, moduleId, syllabusId }) =>
      cancelModule(studentProgressId, moduleId, syllabusId),
    onSuccess: (data) => {
      syncStudentProgressCache(queryClient, data);
    },
  });
}
