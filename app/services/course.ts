import api from "./axiosInstance";
import type { GetCoursesParams, GetCoursesResponse } from "../types/course";

export const getCourses = async (
  params: GetCoursesParams = {},
): Promise<GetCoursesResponse> => {
  try {
    const response = await api.get<GetCoursesResponse>("/courses", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    throw error.response?.data || { message: "Failed to fetch courses" };
  }
};
