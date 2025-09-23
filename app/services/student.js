import api from "./axiosInstance";

export const getStudentClasses = async (studentId) => {
  try {
    const response = await api.get(`/classes/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student classes:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student classes" }
    );
  }
};

export const getStudentProfile = async (studentId) => {
  try {
    const response = await api.get(`/users/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student profile" }
    );
  }
};

export const getStudentProgress = async (progressId) => {
  try {
    const response = await api.get(`/student-progress/${progressId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student progress:", error);
    throw (
      error.response?.data || { message: "Failed to fetch student progress" }
    );
  }
};

/**
 * Get student progress by student ID and class ID
 * @param {string} studentId - The ID of the student
 * @param {string} classId - The ID of the class
 * @returns {Promise<Object>} Student progress data for the specific class
 */
export const getProgressFromStudentIdClassId = async (studentId, classId) => {
  try {
    const response = await api.get(
      `/student-progress/student/${studentId}/class/${classId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching student progress by student and class:",
      error
    );
    throw (
      error.response?.data || {
        message: "Failed to fetch student progress for this class",
      }
    );
  }
};
