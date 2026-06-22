import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getCourses } from "../../services/course";
import { queryKeys } from "../../config/queryKeys";
import type { GetCoursesParams, GetCoursesResponse } from "../../types/course";

const DEFAULT_PARAMS: GetCoursesParams = { limit: 100 };

type UseCoursesOptions = Pick<UseQueryOptions<GetCoursesResponse>, "enabled">;

export function useCourses(
  params: GetCoursesParams = DEFAULT_PARAMS,
  options?: UseCoursesOptions,
) {
  return useQuery({
    queryKey: queryKeys.courses(params),
    queryFn: () => getCourses(params),
    enabled: options?.enabled ?? true,
  });
}
