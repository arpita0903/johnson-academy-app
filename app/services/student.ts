import api from "./axiosInstance";
import type {
  GetStudentClassesResponse,
  PromoteStudentParams,
  PromoteStudentResponse,
} from "../types/classes";
import type { StudentProfileResponse } from "../types/student";

export const getStudentClasses = async (
  studentId: string,
): Promise<GetStudentClassesResponse> => {
  try {
    const response = await api.get<GetStudentClassesResponse>(
      `/classes/student/${studentId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student classes:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student classes" }
    );
  }
};

export const getStudentProfile = async (
  studentId: string,
): Promise<StudentProfileResponse> => {
  try {
    const response = await api.get<StudentProfileResponse>(
      `/users/student/${studentId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student profile:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student profile" }
    );
  }
};

export const getStudentProgress = async (progressId: string) => {
  try {
    const response = await api.get(`/student-progress/${progressId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student progress:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student progress" }
    );
  }
};

export const getProgressFromStudentIdClassId = async (
  studentId: string,
  classId: string,
  courseId: string,
) => {
  try {
    const response = await api.get(
      `/student-progress/student/${studentId}/class/${classId}?courseId=${courseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching student progress by student and class:",
      error,
    );
    throw (
      error.response?.data || {
        message: "Failed to fetch student progress for this class",
      }
    );
  }
};

export const promoteStudent = async ({
  classId,
  studentId,
  courseId,
}: PromoteStudentParams): Promise<PromoteStudentResponse> => {
  try {
    const response = await api.post<PromoteStudentResponse>(
      `/classes/${classId}/promote-student`,
      { studentId, courseId },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error promoting student:", error);
    throw error.response?.data || { message: "Failed to promote student" };
  }
};
