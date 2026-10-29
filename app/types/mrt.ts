/**
 * TypeScript interfaces for MRT (Monthly Review Test) data
 */

type MrtIdentity = {
  month: string; // Format: "MM-YYYY" (e.g., "08-2025")
  classId: string;
  studentId: string;
  courseId: string;
};

export type MrtScoreFields = {
  regularity: number; // Score range: 0-5
  learningSpeed: number; // Score range: 0-5
  theory: number; // Score range: 0-5
  technicalExercises: number; // Score range: 0-5
  repertoireRhythmSense: number; // Score range: 0-5
  repertoireDynamics: number; // Score range: 0-5
};

/** Scored MRT. All six scores are required. */
export type MRTScoredSubmission = MrtIdentity &
  MrtScoreFields & {
    isAbsent?: false;
    remarks?: string;
  };

/**
 * Absent MRT. Score fields must be omitted — a 0 is a real mark, not absence.
 * Remarks are an optional reason.
 */
export type MRTAbsentSubmission = MrtIdentity & {
  isAbsent: true;
  remarks?: string;
};

export type MRTSubmissionData = MRTScoredSubmission | MRTAbsentSubmission;

export type MrtRecordStatus = "missing" | "absent" | "submitted";

export const MRT_STATUS_COPY: Record<MrtRecordStatus, string> = {
  missing: "No MRT record",
  absent: "Teacher marked unavailable",
  submitted: "Scored MRT exists",
};

export const MRT_ABSENT_DETAIL = "Absent / not available, no marks given.";

export function getMrtRecordStatus(
  mrt: { isAbsent?: boolean } | null | undefined,
): MrtRecordStatus {
  if (!mrt) return "missing";
  if (mrt.isAbsent === true) return "absent";
  return "submitted";
}

export interface MRTData extends MrtIdentity {
  id: string;
  isAbsent?: boolean;
  regularity?: number | null;
  learningSpeed?: number | null;
  theory?: number | null;
  technicalExercises?: number | null;
  repertoireRhythmSense?: number | null;
  repertoireDynamics?: number | null;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  totalScore?: number | null; // Calculated total score (max 30). Omitted when absent.
}

export interface MRTResponse {
  success: boolean;
  message: string;
  data?: MRTData;
}

export interface MRTListResponse {
  success: boolean;
  message: string;
  data: MRTData[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface MRTScoreBreakdown {
  regularity: number;
  learningSpeed: number;
  theory: number;
  technicalExercises: number;
  repertoireRhythmSense: number;
  repertoireDynamics: number;
  total: number;
  maxPossible: number;
  percentage: number;
}

export type MrtPopulatedUser = {
  id: string;
  name: string;
  email: string;
  studentId?: string;
};

export type MrtPopulatedClass = {
  id: string;
  name: string;
};

export type MrtPopulatedCourse = {
  id: string;
  name: string;
  description: string;
  instrument: string;
  level?: number;
};

export type MrtAuditUser = {
  id: string;
  name: string;
  email: string;
};

export type GetMrtByStudentClassMonthSuccess = {
  id: string;
  month: string;
  studentId: MrtPopulatedUser;
  classId: MrtPopulatedClass;
  courseId: MrtPopulatedCourse;
  isAbsent?: boolean;
  regularity?: number | null;
  learningSpeed?: number | null;
  theory?: number | null;
  technicalExercises?: number | null;
  repertoireRhythmSense?: number | null;
  repertoireDynamics?: number | null;
  totalScore?: number | null;
  averageScore?: number | null;
  remarks?: string;
  createdBy?: MrtAuditUser;
  updatedBy?: MrtAuditUser;
};

export type ApiErrorResponse = {
  code: number;
  message: string;
  stack?: string;
};

export type GetMrtByStudentClassMonthError = ApiErrorResponse;
