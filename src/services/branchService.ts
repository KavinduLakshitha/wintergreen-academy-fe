const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager: {
    _id: string;
    fullName: string;
    username: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

// Get all branches
export const getBranches = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/branches?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to fetch branches (${response.status})`;
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      branches: data.branches as Branch[],
      pagination: data.pagination
    };
  } catch (error) {
    handleApiError(error);
  }
};

// Get active branches (simplified for dropdowns)
export const getActiveBranches = async () => {
  try {
    const response = await fetch(`${API_URL}/api/branches/active`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch active branches');
    }

    const data = await response.json();
    return data as Branch[];
  } catch (error) {
    handleApiError(error);
  }
};

// Get single branch
export const getBranch = async (branchId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/branches/${branchId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch branch');
    }

    const data = await response.json();
    return data as Branch;
  } catch (error) {
    handleApiError(error);
  }
};
