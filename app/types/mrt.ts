/**
 * TypeScript interfaces for MRT (Monthly Review Test) data
 */

export interface MRTSubmissionData {
  month: string; // Format: "MM-YYYY" (e.g., "08-2025")
  classId: string;
  studentId: string;
  courseId: string;
  regularity: number; // Score range: 2-5
  learningSpeed: number; // Score range: 2-5
  theory: number; // Score range: 2-5
  technicalExercises: number; // Score range: 2-5
  repertoireRhythmSense: number; // Score range: 2-5
  repertoireDynamics: number; // Score range: 2-5
  remarks?: string; // Optional remarks
}

export interface MRTData extends MRTSubmissionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalScore?: number; // Calculated total score (max 30)
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
