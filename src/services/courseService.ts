/**
 * Course API service for handling course-related operations
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  maxStudents: number;
  currentEnrolled: number;
  schedule: string;
  instructor: string;
  nextStart: string;
  status: 'Draft' | 'Active' | 'Inactive' | 'Completed';
  modules: string[];
  branch: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollmentPercentage?: number;
  revenue?: number;
}

export interface CourseStatistics {
  totalCourses: number;
  activeCourses: number;
  totalEnrolled: number;
  totalRevenue: number;
  averagePrice: number;
  totalCapacity: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  schedule: string;
  instructor: string;
  nextStart: string;
  status?: string;
  modules?: string[];
  branch: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

/**
 * Get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Handle API response
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }
  return response.json();
};

/**
 * Get all courses with optional filters
 */
export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  branchId?: string;
}): Promise<CoursesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.branchId) queryParams.append('branchId', params.branchId);

  const response = await fetch(`${API_URL}/api/courses?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get course statistics
 */
export const getCourseStatistics = async (branchId?: string): Promise<CourseStatistics> => {
  const queryParams = new URLSearchParams();
  if (branchId) queryParams.append('branchId', branchId);

  const response = await fetch(`${API_URL}/api/courses/statistics?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get a single course by ID
 */
export const getCourse = async (id: string): Promise<Course> => {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Create a new course
 */
export const createCourse = async (courseData: CreateCourseData): Promise<{ message: string; course: Course }> => {
  const response = await fetch(`${API_URL}/api/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });

  return handleResponse(response);
};

/**
 * Update an existing course
 */
export const updateCourse = async (id: string, courseData: UpdateCourseData): Promise<{ message: string; course: Course }> => {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });

  return handleResponse(response);
};

/**
 * Delete a course (soft delete)
 */
export const deleteCourse = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Restore a deleted course
 */
export const restoreCourse = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/courses/${id}/restore`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get available branches for course creation
 */
export const getBranches = async (): Promise<{ id: string; name: string }[]> => {
  const response = await fetch(`${API_URL}/api/branches`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.branches || [];
};
