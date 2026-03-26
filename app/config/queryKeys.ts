/**
 * Centralized query keys for React Query cache management.
 * Use these for consistency and easier invalidation.
 */
export const queryKeys = {
  teacherClasses: (teacherId: string | null) =>
    ["teacherClasses", teacherId] as const,
  studentClasses: (studentId: string | null) =>
    ["studentClasses", studentId] as const,
  studentProgress: (studentId: string | null, classId: string | null) =>
    ["studentProgress", studentId, classId] as const,
  moduleProgress: (progressId: string | null) =>
    ["moduleProgress", progressId] as const,
  assignmentsByClass: (classId: string | null) =>
    ["assignmentsByClass", classId] as const,
};
