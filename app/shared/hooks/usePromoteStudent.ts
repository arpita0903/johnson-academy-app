import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promoteStudent } from "../../services/student";
import { queryKeys } from "../../config/queryKeys";
import type {
  PromoteStudentParams,
  PromoteStudentResponse,
} from "../../types/classes";

export function usePromoteStudent() {
  const queryClient = useQueryClient();

  return useMutation<PromoteStudentResponse, unknown, PromoteStudentParams>({
    mutationKey: queryKeys.promoteStudent(),
    mutationFn: promoteStudent,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentClasses(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentProgress(
          variables.studentId,
          variables.classId,
          variables.courseId,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.studentProgress(
          variables.studentId,
          variables.classId,
        ),
      });
      queryClient.invalidateQueries({ queryKey: ["teacherClasses"] });
    },
  });
}
