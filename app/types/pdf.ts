export type AttendancePdfParams = {
  studentId: string;
  classId: string;
  courseId: string;
  /** Month in YYYY-MM format (e.g. "2026-07") */
  month: string;
};

export type AttendancePdfError = {
  message: string;
};
