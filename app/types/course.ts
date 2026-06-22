export interface Course {
  _id: string;
  name: string;
  description: string;
  image: string;
  instrument: string;
  syllabus: unknown[];
  __v?: number;
  studentCount?: number;
}

export interface GetCoursesParams {
  page?: number;
  limit?: number;
}

export interface GetCoursesResponse {
  results: Course[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
