import { useQuery } from "@tanstack/react-query";
import { getClassesByTeacher } from "../../services/teacher";
import { queryKeys } from "../../config/queryKeys";

export function useTeacherClasses(teacherId: string | null) {
  return useQuery({
    queryKey: queryKeys.teacherClasses(teacherId),
    queryFn: () => getClassesByTeacher(teacherId!),
    enabled: !!teacherId && typeof teacherId === "string",
  });
}
