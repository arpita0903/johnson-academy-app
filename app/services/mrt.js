import api from "./axiosInstance";

/**
 * Submit Monthly Review Test (MRT) data for a student
 * @param {Object} mrtData - MRT submission data
 * @param {string} mrtData.month - Month in MM-YYYY format (e.g., "08-2025")
 * @param {string} mrtData.classId - The ID of the class
 * @param {string} mrtData.studentId - The ID of the student
 * @param {string} mrtData.courseId - The ID of the course
 * @param {number} mrtData.sptAndFileSubmission - Score for SPT & File Submission (max 5)
 * @param {number} mrtData.regularity - Score for Regularity (max 5)
 * @param {number} mrtData.learningSpeed - Score for Learning Speed (max 5)
 * @param {number} mrtData.songLearning - Score for Song Learning (max 5)
 * @param {number} mrtData.assignment - Score for Assignment (max 5)
 * @param {number} mrtData.theoryAndTechnicals - Score for Theory and Technicals (max 5)
 * @param {string} mrtData.remarks - Additional remarks/comments
 * @returns {Promise<Object>} Response from MRT submission
 */
export const submitMRT = async (mrtData) => {
  try {
    const response = await api.post("/mrt", mrtData);
    return response.data;
  } catch (error) {
    console.error("Error submitting MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to submit MRT data",
      }
    );
  }
};

/**
 * Get MRT data for a specific student and class
 * @param {string} studentId - The ID of the student
 * @param {string} classId - The ID of the class
 * @param {string} month - Month in MM-YYYY format (optional)
 * @returns {Promise<Object>} MRT data for the student
 */
export const getStudentMRT = async (studentId, classId, month = null) => {
  try {
    let url = `/mrt/student/${studentId}/class/${classId}`;
    if (month) {
      url += `?month=${month}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
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
 * @param {string} classId - The ID of the class
 * @param {string} month - Month in MM-YYYY format
 * @returns {Promise<Object>} MRT data for all students in the class for the specified month
 */
export const getClassMRT = async (classId, month) => {
  try {
    const response = await api.get(`/mrt/class/${classId}?month=${month}`);
    return response.data;
  } catch (error) {
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
 * @param {string} mrtId - The ID of the MRT record to update
 * @param {Object} updateData - Updated MRT data
 * @returns {Promise<Object>} Response from MRT update
 */
export const updateMRT = async (mrtId, updateData) => {
  try {
    const response = await api.put(`/mrt/${mrtId}`, updateData);
    return response.data;
  } catch (error) {
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
 * @param {string} mrtId - The ID of the MRT record to delete
 * @returns {Promise<Object>} Response from MRT deletion
 */
export const deleteMRT = async (mrtId) => {
  try {
    const response = await api.delete(`/mrt/${mrtId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting MRT:", error);
    throw (
      error.response?.data || {
        message: "Failed to delete MRT data",
      }
    );
  }
};
