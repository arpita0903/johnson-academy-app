import api from "./axiosInstance";

/**
 * Get student attendance by student ID and class ID
 * @param {string} studentId - The ID of the student
 * @param {string} classId - The ID of the class
 * @returns {Promise<Object>} Student attendance data for the specific class
 */
export const getStudentAttendance = async (studentId, classId) => {
  try {
    const response = await api.get(
      `/student-attendance?studentId=${studentId}&classId=${classId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching student attendance by student and class:",
      error
    );
    throw (
      error.response?.data || {
        message: "Failed to fetch student attendance for this class",
      }
    );
  }
};

/**
 * Mark student as present for a specific date
 * @param {string} attendanceId - The attendance record ID
 * @param {Object} payload - Request body payload
 * @param {string} payload.studentId - The ID of the student
 * @param {string} payload.classId - The ID of the class
 * @param {string} payload.date - The date in YYYY-MM-DD format
 * @returns {Promise<Object>} Response from marking student as present
 */
export const markStudentPresent = async (attendanceId, payload) => {
  try {
    const response = await api.post(
      `/student-attendance/${attendanceId}/present`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error marking student as present:", error);
    throw (
      error.response?.data || {
        message: "Failed to mark student as present",
      }
    );
  }
};

/**
 * Mark student as absent for a specific date
 * @param {string} attendanceId - The attendance record ID
 * @param {Object} payload - Request body payload
 * @param {string} payload.studentId - The ID of the student
 * @param {string} payload.classId - The ID of the class
 * @param {string} payload.date - The date in YYYY-MM-DD format
 * @returns {Promise<Object>} Response from marking student as absent
 */
export const markStudentAbsent = async (attendanceId, payload) => {
  try {
    const response = await api.post(
      `/student-attendance/${attendanceId}/absent`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error marking student as absent:", error);
    throw (
      error.response?.data || {
        message: "Failed to mark student as absent",
      }
    );
  }
};
