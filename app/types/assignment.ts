export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  subjects: string[];
  isActive: boolean;
  classes: string[];
  courses: string[];
  progress: string[];
  isCompleteProfile: boolean;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  courseId: string;
  students: string[];
}

export interface Submission {
  _id: string;
  student: User;
  submittedAt: string;
  fileUrl: string;
  grade?: number; // 1-5 star rating
  feedback?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  attachments: string[]; // Array of URLs
  status: "assigned" | "submitted" | "graded" | "overdue";
  students: User[];
  classId: Class;
  teacherId: User;
  dueDate: string;
  createdBy: User;
  submissions: Submission[];
}

export interface AssignmentCardProps {
  assignment: Assignment;
  onPress: (assignment: Assignment) => void;
}
