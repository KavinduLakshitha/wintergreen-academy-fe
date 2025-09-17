const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types for Reports and Analytics
export interface DashboardStats {
  branchInfo: {
    id: string;
    name: string;
  } | null;
  userStats: {
    total: number;
    recent: number;
    byRole: Record<string, number>;
  };
  courseStats: {
    totalCourses: number;
    activeCourses: number;
    totalEnrolled: number;
    totalRevenue: number;
    averagePrice: number;
    totalCapacity: number;
  };
  financialStats: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    netProfit: number;
    pendingPayments: number;
    growthRate: number;
  };
  attendanceStats: {
    todayAttendance: number;
    weeklyAverage: number;
    monthlyAverage: number;
    totalStudents: number;
  };
  branchStats?: {
    totalBranches: number;
    totalSystemUsers: number;
    averageUsersPerBranch: number;
  };
  lastUpdated: string;
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  averageGPA: number;
}

export interface CourseStatistics {
  totalCourses: number;
  activeCourses: number;
  totalEnrolled: number;
  totalRevenue: number;
  averagePrice: number;
  totalCapacity: number;
}

export interface TransactionStatistics {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  pendingIncome: number;
  pendingExpenses: number;
  pendingTransactions: number;
  netProfit: number;
}

export interface BudgetStatistics {
  totalBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  activeBudgets: number;
  exceededBudgets: number;
  totalRemaining: number;
  overallUtilization: number;
}

export interface AttendanceStatistics {
  Present: number;
  Absent: number;
  Late: number;
  Excused: number;
  total: number;
  totalEnrolled: number;
  notMarked: number;
}

export interface EnrollmentTrendData {
  month: string;
  enrollments: number;
  graduations: number;
  dropouts: number;
}

export interface UserRoleDistribution {
  _id: string;
  count: number;
}

export interface ReportsFilters {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
  courseId?: string;
  studentId?: string;
}

export interface ComprehensiveReport {
  branchInfo: {
    id: string;
    name: string;
  } | null;
  userStats: {
    total: number;
    byRole: Record<string, number>;
  };
  studentStats: StudentStatistics;
  courseStats: CourseStatistics;
  transactionStats: TransactionStatistics;
  budgetStats: BudgetStatistics;
  generatedAt: string;
  filters: ReportsFilters;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to build query parameters
const buildQueryParams = (filters: ReportsFilters): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  return queryParams.toString();
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (filters: ReportsFilters = {}): Promise<DashboardStats> => {
  const queryParams = buildQueryParams(filters);
  
  const response = await fetch(`${API_URL}/api/dashboard/stats?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get student statistics
 */
export const getStudentStatistics = async (filters: ReportsFilters = {}): Promise<StudentStatistics> => {
  const queryParams = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/api/reports/student-performance?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.studentStats || {};
};

/**
 * Get course statistics
 */
export const getCourseStatistics = async (filters: ReportsFilters = {}): Promise<CourseStatistics> => {
  const queryParams = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/api/reports/comprehensive?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.courseStats || {};
};

/**
 * Get transaction statistics
 */
export const getTransactionStatistics = async (filters: ReportsFilters = {}): Promise<TransactionStatistics> => {
  const queryParams = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/api/reports/financial-summary?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.transactionStats || {};
};

/**
 * Get budget statistics
 */
export const getBudgetStatistics = async (filters: ReportsFilters = {}): Promise<BudgetStatistics> => {
  const queryParams = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/api/reports/comprehensive?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.budgetStats || {};
};

/**
 * Get enrollment trend data
 */
export const getEnrollmentTrends = async (filters: ReportsFilters = {}): Promise<EnrollmentTrendData[]> => {
  const queryParams = buildQueryParams(filters);
  
  const response = await fetch(`${API_URL}/api/dashboard/charts/enrollment?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get user role distribution
 */
export const getUserRoleDistribution = async (filters: ReportsFilters = {}): Promise<UserRoleDistribution[]> => {
  const queryParams = buildQueryParams(filters);
  
  const response = await fetch(`${API_URL}/api/dashboard/charts/users-by-role?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get comprehensive report data
 */
export const getComprehensiveReport = async (filters: ReportsFilters = {}): Promise<ComprehensiveReport> => {
  try {
    const queryParams = buildQueryParams(filters);

    const response = await fetch(`${API_URL}/api/reports/comprehensive?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    return {
      branchInfo: data.branchInfo || null,
      userStats: data.userStats || { total: 0, byRole: {} },
      studentStats: data.studentStats || {},
      courseStats: data.courseStats || {},
      transactionStats: data.transactionStats || {},
      budgetStats: data.budgetStats || {},
      generatedAt: data.generatedAt || new Date().toISOString(),
      filters: data.filters || filters
    };
  } catch (error) {
    console.error('Error fetching comprehensive report:', error);
    throw error;
  }
};

/**
 * Export report data to Excel
 */
export const exportReportToExcel = async (
  reportType: 'comprehensive' | 'students' | 'courses' | 'financial' | 'attendance',
  filters: ReportsFilters = {}
): Promise<void> => {
  const exportParams = { ...filters };
  const queryParams = buildQueryParams(exportParams);
  const fullUrl = `${API_URL}/api/reports/export?${queryParams}&format=excel&type=${reportType}`;

  const response = await fetch(fullUrl, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to export report');
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
    : `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get recent activity data
 */
export const getRecentActivity = async (filters: ReportsFilters = {}) => {
  const queryParams = buildQueryParams(filters);

  const response = await fetch(`${API_URL}/api/dashboard/recent-activity?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get attendance statistics for a specific course and date
 */
export const getAttendanceStats = async (courseId: string, date: string, branchId?: string): Promise<AttendanceStatistics> => {
  const queryParams = new URLSearchParams({ date });
  if (branchId) {
    queryParams.append('branchId', branchId);
  }

  const response = await fetch(`${API_URL}/api/attendance/stats/${courseId}?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.stats;
};

/**
 * Generate student performance report data
 */
export const generateStudentPerformanceReport = async (filters: ReportsFilters = {}) => {
  try {
    const [studentStats, courseStats] = await Promise.all([
      getStudentStatistics(filters),
      getCourseStatistics(filters)
    ]);

    return {
      totalStudents: studentStats.totalStudents,
      activeStudents: studentStats.activeStudents,
      graduatedStudents: studentStats.graduatedStudents,
      averageGPA: studentStats.averageGPA,
      totalCourses: courseStats.totalCourses,
      activeCourses: courseStats.activeCourses,
      totalEnrolled: courseStats.totalEnrolled,
      averageEnrollmentPerCourse: courseStats.totalCourses > 0 ? Math.round(courseStats.totalEnrolled / courseStats.totalCourses) : 0,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating student performance report:', error);
    throw error;
  }
};

/**
 * Generate financial summary report data
 */
export const generateFinancialSummaryReport = async (filters: ReportsFilters = {}) => {
  try {
    const [transactionStats, budgetStats, dashboardStats] = await Promise.all([
      getTransactionStatistics(filters),
      getBudgetStatistics(filters),
      getDashboardStats(filters)
    ]);

    return {
      totalIncome: transactionStats.totalIncome,
      totalExpenses: transactionStats.totalExpenses,
      netProfit: transactionStats.netProfit,
      pendingIncome: transactionStats.pendingIncome,
      pendingExpenses: transactionStats.pendingExpenses,
      totalBudgets: budgetStats.totalBudgets,
      totalAllocated: budgetStats.totalAllocated,
      totalSpent: budgetStats.totalSpent,
      budgetUtilization: budgetStats.overallUtilization,
      monthlyRevenue: dashboardStats.financialStats.monthlyRevenue,
      monthlyExpenses: dashboardStats.financialStats.monthlyExpenses,
      growthRate: dashboardStats.financialStats.growthRate,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating financial summary report:', error);
    throw error;
  }
};

/**
 * Generate attendance summary report data
 */
export const generateAttendanceSummaryReport = async (filters: ReportsFilters = {}) => {
  try {
    const dashboardStats = await getDashboardStats(filters);

    return {
      todayAttendance: dashboardStats.attendanceStats.todayAttendance,
      weeklyAverage: dashboardStats.attendanceStats.weeklyAverage,
      monthlyAverage: dashboardStats.attendanceStats.monthlyAverage,
      totalStudents: dashboardStats.attendanceStats.totalStudents,
      attendanceTrend: dashboardStats.attendanceStats.weeklyAverage > dashboardStats.attendanceStats.monthlyAverage ? 'improving' : 'declining',
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating attendance summary report:', error);
    throw error;
  }
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
  return 'An unexpected error occurred while fetching report data';
};
