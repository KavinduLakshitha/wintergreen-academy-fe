const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface StudentDocument {
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  uploadedAt: string;
}

export interface PersonalDocuments {
  birthCertificate: boolean;
  gramaNiladhariCertificate: boolean;
  guardianSpouseLetter: boolean;
  originalCertificate: {
    hasDocument: boolean;
    title: string;
  };
}

export interface Student {
  _id: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  course: {
    _id: string;
    title: string;
    modules?: string[];
  };
  modules: string[];
  branch: {
    _id: string;
    name: string;
  };
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated' | 'Dropped';
  enrollmentDate: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  certifications: string[];
  childBabyCare: boolean;
  elderCare: boolean;
  documents?: StudentDocument[];
  personalDocuments?: PersonalDocuments;
  hostelRequirement: boolean;
  mealRequirement: boolean;
  createdBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  course: string;
  modules: string[];
  branch?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated' | 'Dropped';
  enrollmentDate: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  certifications: string[];
  childBabyCare: boolean;
  elderCare: boolean;
  documents: StudentDocument[];
  personalDocuments: PersonalDocuments;
  hostelRequirement: boolean;
  mealRequirement: boolean;
}

export interface StudentsResponse {
  students: Student[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
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
 * Get all students with optional filters
 */
export const getStudents = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  branchId?: string;
  courseId?: string;
}): Promise<StudentsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.branchId) queryParams.append('branchId', params.branchId);
  if (params?.courseId) queryParams.append('courseId', params.courseId);

  const response = await fetch(`${API_URL}/api/students?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get student statistics
 */
export const getStudentStatistics = async (branchId?: string): Promise<StudentStatistics> => {
  const queryParams = new URLSearchParams();
  if (branchId) queryParams.append('branchId', branchId);

  const response = await fetch(`${API_URL}/api/students/statistics?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get single student by ID
 */
export const getStudent = async (id: string): Promise<Student> => {
  const response = await fetch(`${API_URL}/api/students/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Create new student
 */
export const createStudent = async (studentData: StudentFormData): Promise<{ message: string; student: Student }> => {
  const response = await fetch(`${API_URL}/api/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });

  return handleResponse(response);
};

/**
 * Update student
 */
export const updateStudent = async (id: string, studentData: Partial<StudentFormData>): Promise<{ message: string; student: Student }> => {
  const response = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData),
  });

  return handleResponse(response);
};

/**
 * Delete student (soft delete)
 */
export const deleteStudent = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get error message from API error response
 */
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.map((err: any) => err.msg || err.message).join(', ');
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Format student data for form submission
 */
export const formatStudentForSubmission = (formData: any): StudentFormData => {
  return {
    fullName: formData.fullName?.trim() || '',
    email: formData.email?.trim().toLowerCase() || '',
    phone: formData.phone?.trim() || '',
    address: formData.address?.trim() || '',
    dateOfBirth: formData.dateOfBirth || '',
    course: formData.course || '',
    modules: Array.isArray(formData.modules) ? formData.modules :
             (typeof formData.modules === 'string' ?
              formData.modules.split(',').map((m: string) => m.trim()).filter((m: string) => m) : []),
    branch: formData.branch || undefined,
    status: formData.status || 'Active',
    enrollmentDate: formData.enrollmentDate || new Date().toISOString().split('T')[0],
    level: formData.level || 'Beginner',
    certifications: Array.isArray(formData.certifications) ? formData.certifications :
                    (typeof formData.certifications === 'string' ?
                     formData.certifications.split(',').map((c: string) => c.trim()).filter((c: string) => c) : []),
    childBabyCare: formData.childBabyCare || false,
    elderCare: formData.elderCare || false,
    documents: formData.documents || [],
    personalDocuments: formData.personalDocuments || {
      birthCertificate: false,
      gramaNiladhariCertificate: false,
      guardianSpouseLetter: false,
      originalCertificate: {
        hasDocument: false,
        title: ''
      }
    },
    hostelRequirement: formData.hostelRequirement || false,
    mealRequirement: formData.mealRequirement || false
  };
};

/**
 * Format student data for form display
 */
export const formatStudentForForm = (student: Student) => {
  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    address: student.address,
    dateOfBirth: student.dateOfBirth.split('T')[0], // Convert to YYYY-MM-DD format
    course: student.course._id,
    modules: student.modules.join(', '),
    status: student.status,
    enrollmentDate: student.enrollmentDate.split('T')[0],
    level: student.level,
    certifications: student.certifications.join(', '),
    childBabyCare: student.childBabyCare,
    elderCare: student.elderCare,
    documents: student.documents,
    personalDocuments: student.personalDocuments,
    hostelRequirement: student.hostelRequirement,
    mealRequirement: student.mealRequirement
  };
};
