/**
 * Types for class-related API responses (e.g. getClassesByTeacher).
 */

import type { StudentProgressResponse } from "./studentProgress";

export interface TeacherRef {
  id: string;
  name: string;
  email: string;
  role: string;
  isCompleteProfile?: boolean;
  profilePicture?: string | null;
  classes?: string[];
  courses?: string[];
  progress?: string[];
  subjects?: string[];
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface CourseRef {
  id: string;
  name: string;
  description?: string;
  image?: string;
  instrument?: string;
  syllabus?: unknown[];
}

export interface StudentRef {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  isEmailVerified?: boolean;
  subjects?: string[];
  isActive?: boolean;
  isCompleteProfile?: boolean;
  profilePicture?: string | null;
  phoneNumber?: string;
  classes?: string[];
  courses?: string[];
  progress?: string[];
}

export interface StudentInClassEntry {
  _id: string;
  user: StudentRef;
  course: CourseRef;
}

export interface ClassByTeacher {
  id: string;
  name: string;
  teacherId: TeacherRef[];
  courseId: CourseRef;
  students: StudentRef[];
  studentsInClass?: StudentInClassEntry[];
}

export interface StudentClassCourse {
  _id: string;
  name: string;
  description: string;
  image: string;
  instrument: string;
  syllabus: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface StudentClassUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  rollNumber?: string;
  isEmailVerified: boolean;
  subjects: string[];
  isActive: boolean;
  isCompleteProfile: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  classes: string[];
  courses: string[];
  progress: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentClass {
  _id: string;
  id: string;
  name: string;
  teacherId: string;
  students: StudentClassUser;
  createdAt: string;
  updatedAt: string;
  classMaxCapacity: number;
  classesInOneWeek: string[];
  endTime: string;
  startTime: string;
  teachers: StudentClassUser[];
  courses: StudentClassCourse[];
  courseId: StudentClassCourse;
}

/** Response type for getStudentClasses(studentId) */
export type GetStudentClassesResponse = StudentClass[];

/** Response type for getClassesByTeacher(teacherId) */
export type GetClassesByTeacherResponse = ClassByTeacher[];

/** Request body for POST /classes/:classId/promote-student */
export interface PromoteStudentRequest {
  studentId: string;
  courseId: string;
}

/** Variables for promoteStudent (classId from URL path) */
export interface PromoteStudentParams extends PromoteStudentRequest {
  classId: string;
}

/** Response type for POST /classes/:classId/promote-student */
export interface PromoteStudentResponse {
  promotion: Record<string, unknown>;
  progress: StudentProgressResponse;
  previousProgress: StudentProgressResponse[];
  alreadyPromoted: boolean;
}
