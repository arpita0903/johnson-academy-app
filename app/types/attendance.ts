export interface AttendanceData {
  studentId: string;
  classId: string;
  presentDates: string[];
  absentDates: string[];
  joiningDate: string;
  classesInOneWeek: string[];
  lastDate: string;
  id: string;
}

export interface AttendanceResponse {
  results: AttendanceData[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface AttendanceCalendarProps {
  studentId: string;
  classId: string;
}

export interface MarkAttendancePayload {
  studentId: string;
  classId: string;
  date: string;
}

export interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  data?: any;
}
