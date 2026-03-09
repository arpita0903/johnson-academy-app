/**
 * Types for class-related API responses (e.g. getClassesByTeacher).
 */

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
  teacherId: TeacherRef;
  courseId: CourseRef;
  students: StudentRef[];
  studentsInClass?: StudentInClassEntry[];
}

/** Response type for getClassesByTeacher(teacherId) */
export type GetClassesByTeacherResponse = ClassByTeacher[];
