const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    studentId: string;
    fullName: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  branch: {
    _id: string;
    name: string;
  };
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeIn?: string;
  notes?: string;
  markedBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  lastModifiedBy?: {
    _id: string;
    fullName: string;
    username: string;
  };
  formattedDate: string;
  formattedTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWithAttendance {
  _id: string;
  studentId: string;
  fullName: string;
  email: string;
  course: {
    _id: string;
    title: string;
  };
  branch: {
    _id: string;
    name: string;
  };
  attendance: {
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    timeIn?: string;
    notes?: string;
  } | null;
}

export interface AttendanceStats {
  Present: number;
  Absent: number;
  Late: number;
  Excused: number;
  total: number;
  totalEnrolled: number;
  notMarked: number;
}

export interface AttendanceFilters {
  courseId?: string;
  branchId?: string;
  studentId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(error.message || 'An unexpected error occurred');
};

// Get attendance records with filtering and pagination
export const getAttendanceRecords = async (filters: AttendanceFilters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/attendance?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch attendance records');
    }

    const data = await response.json();
    return {
      attendanceRecords: data.attendanceRecords as AttendanceRecord[],
      pagination: data.pagination as PaginationInfo
    };
  } catch (error) {
    handleApiError(error);
  }
};

// Get students enrolled in a course for attendance marking
export const getCourseStudents = async (courseId: string, date?: string, branchId?: string) => {
  try {
    const queryParams = new URLSearchParams();
    if (date) {
      queryParams.append('date', date);
    }
    if (branchId) {
      queryParams.append('branchId', branchId);
    }

    const response = await fetch(`${API_URL}/api/attendance/students/${courseId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch course students');
    }

    const data = await response.json();
    return {
      course: data.course,
      students: data.students as StudentWithAttendance[],
      totalStudents: data.totalStudents
    };
  } catch (error) {
    handleApiError(error);
  }
};

// Mark attendance for a single student
export const markAttendance = async (attendanceData: {
  student: string;
  course: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeIn?: string;
  notes?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/attendance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark attendance');
    }

    const data = await response.json();
    return data.attendance as AttendanceRecord;
  } catch (error) {
    handleApiError(error);
  }
};

// Bulk mark attendance for multiple students
export const bulkMarkAttendance = async (attendanceRecords: Array<{
  student: string;
  course: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeIn?: string;
  notes?: string;
}>) => {
  try {
    const response = await fetch(`${API_URL}/api/attendance/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attendanceRecords }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to bulk mark attendance');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update attendance record
export const updateAttendance = async (attendanceId: string, updateData: {
  status?: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeIn?: string;
  notes?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update attendance');
    }

    const data = await response.json();
    return data.attendance as AttendanceRecord;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete attendance record
export const deleteAttendance = async (attendanceId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/attendance/${attendanceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete attendance');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    handleApiError(error);
  }
};

// Get attendance statistics for a course
export const getAttendanceStats = async (courseId: string, date: string, branchId?: string) => {
  try {
    const queryParams = new URLSearchParams({ date });
    if (branchId) {
      queryParams.append('branchId', branchId);
    }

    const response = await fetch(`${API_URL}/api/attendance/stats/${courseId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch attendance statistics');
    }

    const data = await response.json();
    return {
      course: data.course,
      date: data.date,
      stats: data.stats as AttendanceStats
    };
  } catch (error) {
    handleApiError(error);
  }
};

// Export attendance records to Excel
export const exportAttendanceRecords = async (filters: {
  courseId: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  format?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/attendance/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export attendance records');
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Attendance records exported successfully' };
  } catch (error) {
    handleApiError(error);
  }
};
