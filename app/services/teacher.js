import api from "./axiosInstance";

/**
 * Teacher service for managing teacher-related API calls
 */

/**
 * Get classes by teacher ID
 * @param {string} teacherId - The ID of the teacher
 * @returns {Promise<import("../types/classes").GetClassesByTeacherResponse>} Array of classes taught by the teacher
 */
export const getClassesByTeacher = async (teacherId) => {
  try {
    const response = await api.get(`/classes/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classes by teacher:", error);
    throw error;
  }
};

/**
 * Get all teachers
 * @returns {Promise<Array>} Array of all teachers
 */
export const getAllTeachers = async () => {
  try {
    const response = await api.get("/teachers");
    return response.data;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

/**
 * Get teacher by ID
 * @param {string} teacherId - The ID of the teacher
 * @returns {Promise<Object>} Teacher object
 */
export const getTeacherById = async (teacherId) => {
  try {
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    throw error;
  }
};

/**
 * Update teacher profile
 * @param {string} teacherId - The ID of the teacher
 * @param {Object} teacherData - Updated teacher data
 * @returns {Promise<Object>} Updated teacher object
 */
export const updateTeacher = async (teacherId, teacherData) => {
  try {
    const response = await api.put(`/teachers/${teacherId}`, teacherData);
    return response.data;
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};
