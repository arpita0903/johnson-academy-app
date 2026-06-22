export type ModuleStatus = "completed" | "inprogress" | "upcoming";

export interface StudentProfileModuleProgress {
  moduleId: string;
  seq?: number;
  status: ModuleStatus | string;
  startDate?: string;
  dateTakenToComplete?: number;
  endDate?: string;
  score?: number;
}

export interface StudentProfileSyllabusProgress {
  syllabusId: string;
  modules: StudentProfileModuleProgress[];
}

export interface StudentProfileProgress {
  studentId: string;
  classId: string;
  courseId: string;
  progress: number;
  syllabusProgress: StudentProfileSyllabusProgress[];
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  upcomingModules: number;
  id: string;
}

export interface StudentProfileCourse {
  name: string;
  description: string;
  image: string;
  instrument: string;
  syllabus: string[];
  id: string;
}

export interface StudentInClassRef {
  _id: string;
  user: string;
  course: string;
}

export interface StudentProfileClass {
  name: string;
  teacherId: string;
  students: string[];
  studentsInClass: StudentInClassRef[];
  classMaxCapacity: number;
  classesInOneWeek: string[];
  endTime: string;
  startTime: string;
  teachers: string[];
  id: string;
}

/** Response type for GET /users/student/:studentId */
export interface StudentProfileResponse {
  name: string;
  email: string;
  role: string;
  rollNumber: string;
  isEmailVerified: boolean;
  subjects: string[];
  isActive: boolean;
  isCompleteProfile: boolean;
  profilePicture: string;
  phoneNumber: string;
  classes: StudentProfileClass[];
  courses: StudentProfileCourse[];
  progress: StudentProfileProgress[];
  id: string;
}
