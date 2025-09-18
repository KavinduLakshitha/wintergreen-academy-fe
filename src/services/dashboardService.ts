const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types for Dashboard
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
  studentStats: {
    totalStudents: number;
    activeStudents: number;
    graduatedStudents: number;
    averageGPA: number;
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

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface EnrollmentChartData {
  month: string;
  year: number;
  newStudents: number;
}

export interface UserRoleChartData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardFilters {
  branchId?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Retry function for failed requests
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (lastError.message.includes('401') || lastError.message.includes('403')) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Helper function to build query parameters
const buildQueryParams = (filters: DashboardFilters) => {
  const params = new URLSearchParams();
  
  if (filters.branchId && filters.branchId !== 'all') {
    params.append('branchId', filters.branchId);
  }
  
  return params.toString();
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (filters: DashboardFilters = {}): Promise<DashboardStats> => {
  return retryRequest(async () => {
    const queryParams = buildQueryParams(filters);

    const response = await fetch(`${API_URL}/api/dashboard/stats?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  });
};

/**
 * Get recent activity data
 */
export const getRecentActivity = async (filters: DashboardFilters = {}): Promise<RecentActivity[]> => {
  return retryRequest(async () => {
    const queryParams = buildQueryParams(filters);

    const response = await fetch(`${API_URL}/api/dashboard/recent-activity?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  });
};

/**
 * Get enrollment trend data for charts
 */
export const getEnrollmentTrends = async (filters: DashboardFilters = {}): Promise<EnrollmentChartData[]> => {
  return retryRequest(async () => {
    const queryParams = buildQueryParams(filters);

    const response = await fetch(`${API_URL}/api/dashboard/charts/enrollment?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  });
};

/**
 * Get users by role chart data
 */
export const getUsersByRoleChartData = async (filters: DashboardFilters = {}): Promise<UserRoleChartData[]> => {
  return retryRequest(async () => {
    const queryParams = buildQueryParams(filters);

    const response = await fetch(`${API_URL}/api/dashboard/charts/users-by-role?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  });
};

/**
 * Get error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
