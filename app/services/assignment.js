import api from "./axiosInstance";

/**
 * Assignment service for managing assignment-related API calls
 */

/**
 * Create a new assignment
 * @param {Object} assignmentData - The assignment data
 * @param {string} assignmentData.title - The title of the assignment
 * @param {string} assignmentData.description - The description of the assignment
 * @param {string} assignmentData.classId - The ID of the class
 * @param {string} assignmentData.teacherId - The ID of the teacher
 * @param {string} assignmentData.dueDate - The due date of the assignment (YYYY-MM-DD format)
 * @param {string} assignmentData.createdBy - The ID of the user creating the assignment
 * @returns {Promise<Object>} Created assignment object
 */
export const createAssignment = async (assignmentData) => {
  try {
    const response = await api.post("/assignments", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error.response?.data || { message: "Failed to create assignment" };
  }
};

/**
 * Get all assignments
 * @returns {Promise<Array>} Array of all assignments
 */
export const getAllAssignments = async () => {
  try {
    const response = await api.get("/assignments");
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error.response?.data || { message: "Failed to fetch assignments" };
  }
};

/**
 * Get assignment by ID
 * @param {string} assignmentId - The ID of the assignment
 * @returns {Promise<Object>} Assignment object
 */
export const getAssignmentById = async (assignmentId) => {
  try {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw error.response?.data || { message: "Failed to fetch assignment" };
  }
};

/**
 * Get assignments by class ID
 * @param {string} classId - The ID of the class
 * @returns {Promise<Array>} Array of assignments for the class
 */
export const getAssignmentsByClass = async (classId) => {
  try {
    const response = await api.get(`/assignments/class/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments by class:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch assignments for this class",
      }
    );
  }
};

/**
 * Get assignments by teacher ID
 * @param {string} teacherId - The ID of the teacher
 * @returns {Promise<Array>} Array of assignments created by the teacher
 */
export const getAssignmentsByTeacher = async (teacherId) => {
  try {
    const response = await api.get(`/assignments/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments by teacher:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch assignments for this teacher",
      }
    );
  }
};

/**
 * Update assignment
 * @param {string} assignmentId - The ID of the assignment
 * @param {Object} assignmentData - Updated assignment data
 * @returns {Promise<Object>} Updated assignment object
 */
export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const response = await api.put(
      `/assignments/${assignmentId}`,
      assignmentData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw error.response?.data || { message: "Failed to update assignment" };
  }
};

/**
 * Get assignments by student ID
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Array>} Array of assignments for the student
 */
export const getAssignmentsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/assignments/student/${studentId}`);
    console.log("getAssignmentsByStudent", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments by student:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch assignments for this student",
      }
    );
  }
};

/**
 * Submit assignment
 * @param {string} assignmentId - The ID of the assignment
 * @param {string} fileUrl - The URL of the submitted file
 * @returns {Promise<Object>} Submission object
 */
export const submitAssignment = async (assignmentId, fileUrl) => {
  try {
    const response = await api.post(`/assignments/${assignmentId}/submit`, {
      fileUrl: fileUrl,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error.response?.data || { message: "Failed to submit assignment" };
  }
};

/**
 * Get assignment submissions
 * @param {string} assignmentId - The ID of the assignment
 * @returns {Promise<Array>} Array of submissions for the assignment
 */
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment submissions:", error);
    throw error.response?.data || { message: "Failed to fetch submissions" };
  }
};

/**
 * Grade assignment submission
 * @param {string} assignmentId - The ID of the assignment
 * @param {Object} gradeData - The grading data
 * @param {string} gradeData.studentId - The ID of the student
 * @param {number} gradeData.grade - The grade given
 * @param {string} gradeData.feedback - Optional feedback
 * @returns {Promise<Object>} Updated submission object
 */
export const gradeSubmission = async (assignmentId, gradeData) => {
  try {
    const response = await api.post(
      `/assignments/${assignmentId}/grade`,
      gradeData,
    );
    return response.data;
  } catch (error) {
    console.error("Error grading submission:", error);
    throw error.response?.data || { message: "Failed to grade submission" };
  }
};

/**
 * Delete assignment
 * @param {string} assignmentId - The ID of the assignment
 * @returns {Promise<Object>} Success message
 */
export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await api.delete(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error.response?.data || { message: "Failed to delete assignment" };
  }
};
