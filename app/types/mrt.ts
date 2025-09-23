/**
 * TypeScript interfaces for MRT (Monthly Review Test) data
 */

export interface MRTSubmissionData {
  month: string; // Format: "MM-YYYY" (e.g., "08-2025")
  classId: string;
  studentId: string;
  sptAndFileSubmission: number; // Max score: 5
  regularity: number; // Max score: 5
  learningSpeed: number; // Max score: 5
  songLearning: number; // Max score: 5
  assignment: number; // Max score: 5
  theoryAndTechnicals: number; // Max score: 5
  remarks?: string; // Optional remarks
}

export interface MRTData extends MRTSubmissionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalScore?: number; // Calculated total score
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
  sptAndFileSubmission: number;
  regularity: number;
  learningSpeed: number;
  songLearning: number;
  assignment: number;
  theoryAndTechnicals: number;
  total: number;
  maxPossible: number;
  percentage: number;
}
