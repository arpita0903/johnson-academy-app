import api from "./axiosInstance";

/**
 * Start a module for a student
 * @param {string} studentProgressId - The student progress ID
 * @param {string} moduleId - The module ID to start
 * @param {string} syllabusId - The syllabus ID
 * @returns {Promise} - API response
 */
export const startModule = async (studentProgressId, moduleId, syllabusId) => {
  try {
    const response = await api.post(
      `/student-progress/${studentProgressId}/start-module`,
      {
        moduleId,
        syllabusId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting module:", error);
    throw error;
  }
};

/**
 * End a module for a student
 * @param {string} studentProgressId - The student progress ID
 * @param {string} moduleId - The module ID to end
 * @param {string} syllabusId - The syllabus ID
 * @param {string} remark - The remark/feedback for the module
 * @param {string} score - The score achieved in the module
 * @returns {Promise} - API response
 */
export const endModule = async (
  studentProgressId,
  moduleId,
  syllabusId,
  remark,
  score
) => {
  try {
    const response = await api.post(
      `/student-progress/${studentProgressId}/end-module`,
      {
        moduleId,
        syllabusId,
        remark,
        score,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error ending module:", error);
    throw error;
  }
};
