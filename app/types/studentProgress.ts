export interface StudentProgressResponse {
  studentId: StudentId;
  classId: ClassId;
  courseId: CourseId;
  progress: number;
  syllabusProgress: SyllabusProgress[];
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  upcomingModules: number;
  id: string;
}

export interface StudentId {
  name: string;
  email: string;
  role: string;
  id: string;
}

export interface ClassId {
  name: string;
  id: string;
}

export interface CourseId {
  name: string;
  description: string;
  id: string;
}

export interface SyllabusProgress {
  syllabusId: SyllabusId;
  modules: Module[];
}

export interface SyllabusId {
  title: string;
  description: string;
  id: string;
}

export interface Module {
  moduleId: ModuleId;
  status: string;
  startDate?: string;
  endDate?: string;
  dateTakenToComplete?: number;
  remark?: string;
  score?: number;
}

export interface Resource {
  file: string;
  key: string;
}

export interface ModuleId {
  type: string;
  title: string;
  description: string;
  session: number;
  id: string;
  resources?: Resource[];
}
