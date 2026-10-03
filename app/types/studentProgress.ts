export type ModuleStatus = "completed" | "inprogress" | "upcoming";
export type ModuleType = "theory" | "technical" | "learning" | "others";

export type StudentProgressStudent = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type StudentProgressClass = {
  id: string;
  name: string;
};

export type StudentProgressCourse = {
  id: string;
  name: string;
  description: string;
};

export type StudentProgressSyllabus = {
  id: string;
  title: string;
  description: string;
};

export type Resource = {
  file?: string;
  key?: string;
};

export type StudentProgressModule = {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  session: number;
  seq?: number;
  resources: Resource[];
};

export type ModuleProgress = {
  moduleId: StudentProgressModule;
  seq?: number;
  status: ModuleStatus;
  score?: number;
  startDate?: string;
  endDate?: string;
  dateTakenToComplete?: number;
  remark?: string;
};

export type SyllabusProgress = {
  syllabusId: StudentProgressSyllabus;
  modules: ModuleProgress[];
};

export type StudentProgressRecord = {
  id: string;
  studentId: StudentProgressStudent;
  classId: StudentProgressClass;
  courseId: StudentProgressCourse;
  progress: number;
  syllabusProgress: SyllabusProgress[];
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  upcomingModules: number;
};

/** GET /student-progress/student/:studentId/class/:classId */
export type GetStudentProgressByStudentAndClassSuccess =
  StudentProgressRecord[];

/** GET /student-progress/student/:studentId/class/:classId?courseId= */
export type GetStudentProgressByStudentClassAndCourseSuccess =
  StudentProgressRecord;

export type GetStudentProgressError = {
  code: number;
  message: string;
  stack?: string;
};

/** GET /student-progress/:progressId */
export type GetStudentProgressByIdSuccess = StudentProgressRecord;

/** Aliases used by existing screens and mutations */
export type StudentProgressResponse = StudentProgressRecord;
export type Module = ModuleProgress;
export type StudentId = StudentProgressStudent;
export type ClassId = StudentProgressClass;
export type CourseId = StudentProgressCourse;
export type SyllabusId = StudentProgressSyllabus;
export type ModuleId = StudentProgressModule;
