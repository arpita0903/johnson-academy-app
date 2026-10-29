import { AxiosError } from "axios";
import api from "./axiosInstance";
import {
  MRTSubmissionData,
  MRTResponse,
  MRTListResponse,
  GetMrtByStudentClassMonthSuccess,
  GetMrtByStudentClassMonthError,
} from "../types/mrt";

/**
 * Submit Monthly Review Test (MRT) data for a student.
 * Scored submissions include all six scores. Absent submissions send
 * `isAbsent: true` and omit every score field.
 */
export const submitMRT = async (
  mrtData: MRTSubmissionData,
): Promise<MRTResponse> => {
  try {
    const response = await api.post("/mrt", mrtData);
    return response.data;
  } catch (error: any) {
    console.error("Error submitting MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to submit MRT data",
      }
    );
  }
};

/**
 * Get MRT data for a student, class, and month
 * @param studentId - The ID of the student
 * @param classId - The ID of the class
 * @param month - Month in MM-YYYY format (e.g. "09-2026")
 * @param courseId - The ID of the course
 */
export const getMrtByStudentClassMonth = async (
  studentId: string,
  classId: string,
  month: string,
  courseId: string,
): Promise<GetMrtByStudentClassMonthSuccess> => {
  try {
    const response = await api.get<GetMrtByStudentClassMonthSuccess>(
      `/mrt/student/${studentId}/class/${classId}/month/${month}`,
      { params: { courseId } },
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data as
        | Partial<GetMrtByStudentClassMonthError>
        | undefined;
      const normalized: GetMrtByStudentClassMonthError = {
        code: data?.code ?? status,
        message:
          data?.message ?? "Failed to fetch MRT data for this student",
        stack: data?.stack,
      };
      if (status !== 404) {
        console.error(
          "Error fetching MRT by student, class, and month:",
          error,
        );
      }
      throw normalized;
    }
    console.error("Error fetching MRT by student, class, and month:", error);
    throw {
      code: 500,
      message: "Failed to fetch MRT data for this student",
    } satisfies GetMrtByStudentClassMonthError;
  }
};

/**
 * Get MRT data for a specific student and class
 * @param studentId - The ID of the student
 * @param classId - The ID of the class
 * @param month - Month in MM-YYYY format (optional)
 * @returns MRT data for the student
 */
export const getStudentMRT = async (
  studentId: string,
  classId: string,
  month?: string,
): Promise<MRTListResponse> => {
  try {
    let url = `/mrt/student/${studentId}/class/${classId}`;
    if (month) {
      url += `?month=${month}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching student MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch MRT data for this student",
      }
    );
  }
};

/**
 * Get MRT data for a specific month and class
 * @param classId - The ID of the class
 * @param month - Month in MM-YYYY format
 * @returns MRT data for all students in the class for the specified month
 */
export const getClassMRT = async (
  classId: string,
  month: string,
): Promise<MRTListResponse> => {
  try {
    const response = await api.get(`/mrt/class/${classId}?month=${month}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching class MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch MRT data for this class",
      }
    );
  }
};

/**
 * Update existing MRT data
 * @param mrtId - The ID of the MRT record to update
 * @param updateData - Updated MRT data
 * @returns Response from MRT update
 */
export const updateMRT = async (
  mrtId: string,
  updateData: Partial<MRTSubmissionData>,
): Promise<MRTResponse> => {
  try {
    const response = await api.put(`/mrt/${mrtId}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error("Error updating MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to update MRT data",
      }
    );
  }
};

/**
 * Delete MRT data
 * @param mrtId - The ID of the MRT record to delete
 * @returns Response from MRT deletion
 */
export const deleteMRT = async (mrtId: string): Promise<MRTResponse> => {
  try {
    const response = await api.delete(`/mrt/${mrtId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to delete MRT data",
      }
    );
  }
};
