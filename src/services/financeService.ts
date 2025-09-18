const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  student?: {
    _id: string;
    fullName: string;
    studentId: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  branch: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  updatedBy?: {
    _id: string;
    fullName: string;
    username: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  category: string;
  allocated: number;
  spent: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'exceeded';
  branch: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  updatedBy?: {
    _id: string;
    fullName: string;
    username: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  remaining?: number;
  utilizationPercentage?: number;
  budgetStatus?: 'good' | 'moderate' | 'warning' | 'exceeded';
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

export interface CreateTransactionData {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  student?: string;
  course?: string;
  branch?: string;
}

export interface UpdateTransactionData {
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  student?: string;
  course?: string;
}

export interface CreateBudgetData {
  category: string;
  allocated: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'exceeded';
  branch?: string;
}

export interface UpdateBudgetData {
  category?: string;
  allocated?: number;
  period?: 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'exceeded';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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

// Helper function to handle response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Transaction Services

/**
 * Get all transactions with filtering and pagination
 */
export const getTransactions = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'income' | 'expense';
  category?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  branchId?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/transactions?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return {
      transactions: data.transactions as Transaction[],
      pagination: data.pagination
    };
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get transaction statistics
 */
export const getTransactionStatistics = async (filters: {
  branchId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<TransactionStatistics> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/api/transactions/statistics?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get single transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Create new transaction
 */
export const createTransaction = async (data: CreateTransactionData): Promise<{ message: string; transaction: Transaction }> => {
  const response = await fetch(`${API_URL}/api/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Update transaction
 */
export const updateTransaction = async (id: string, data: UpdateTransactionData): Promise<{ message: string; transaction: Transaction }> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// Budget Services

/**
 * Get all budgets with filtering and pagination
 */
export const getBudgets = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
  status?: 'active' | 'inactive' | 'completed' | 'exceeded';
  branchId?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_URL}/api/budgets?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return {
      budgets: data.budgets as Budget[],
      pagination: data.pagination
    };
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Get budget statistics
 */
export const getBudgetStatistics = async (filters: {
  branchId?: string;
  period?: 'monthly' | 'quarterly' | 'yearly';
} = {}): Promise<BudgetStatistics> => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/api/budgets/statistics?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Get single budget by ID
 */
export const getBudget = async (id: string): Promise<Budget> => {
  const response = await fetch(`${API_URL}/api/budgets/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Create new budget
 */
export const createBudget = async (data: CreateBudgetData): Promise<{ message: string; budget: Budget }> => {
  const response = await fetch(`${API_URL}/api/budgets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Update budget
 */
export const updateBudget = async (id: string, data: UpdateBudgetData): Promise<{ message: string; budget: Budget }> => {
  const response = await fetch(`${API_URL}/api/budgets/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Delete budget
 */
export const deleteBudget = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/budgets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * Refresh budget spent amount
 */
export const refreshBudget = async (id: string): Promise<{ message: string; budget: Budget }> => {
  const response = await fetch(`${API_URL}/api/budgets/${id}/refresh`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};
