import { useQuery } from "@tanstack/react-query";
import { getAssignmentsByClass } from "../../services/assignment";
import { queryKeys } from "../../config/queryKeys";

export function useAssignmentsByClass(classId: string | null) {
  return useQuery({
    queryKey: queryKeys.assignmentsByClass(classId),
    queryFn: () => getAssignmentsByClass(classId!),
    enabled: !!classId && typeof classId === "string",
  });
}
