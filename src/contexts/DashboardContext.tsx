'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  DashboardStats,
  RecentActivity,
  EnrollmentChartData,
  UserRoleChartData,
  DashboardFilters,
  getDashboardStats,
  getRecentActivity,
  getEnrollmentTrends,
  getUsersByRoleChartData,
  getErrorMessage
} from '@/services/dashboardService';
import { isUnauthorizedError } from '@/utils/auth';

// Dashboard State Interface
interface DashboardState {
  // Data
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  enrollmentTrends: EnrollmentChartData[];
  userRoleDistribution: UserRoleChartData[];
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingActivity: boolean;
  isLoadingCharts: boolean;
  
  // Error states
  statsError: string | null;
  activityError: string | null;
  chartsError: string | null;
  
  // Filters
  filters: DashboardFilters;
  
  // User info
  userRole: string | null;
  userBranch: { id: string; name: string } | null;
}

// Dashboard Actions
type DashboardAction =
  | { type: 'SET_LOADING_STATS'; payload: boolean }
  | { type: 'SET_LOADING_ACTIVITY'; payload: boolean }
  | { type: 'SET_LOADING_CHARTS'; payload: boolean }
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'SET_STATS_ERROR'; payload: string }
  | { type: 'SET_RECENT_ACTIVITY'; payload: RecentActivity[] }
  | { type: 'SET_ACTIVITY_ERROR'; payload: string }
  | { type: 'SET_ENROLLMENT_TRENDS'; payload: EnrollmentChartData[] }
  | { type: 'SET_USER_ROLE_DISTRIBUTION'; payload: UserRoleChartData[] }
  | { type: 'SET_CHARTS_ERROR'; payload: string }
  | { type: 'SET_FILTERS'; payload: DashboardFilters }
  | { type: 'SET_USER_INFO'; payload: { role: string; branch: { id: string; name: string } | null } }
  | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  enrollmentTrends: [],
  userRoleDistribution: [],
  isLoadingStats: false,
  isLoadingActivity: false,
  isLoadingCharts: false,
  statsError: null,
  activityError: null,
  chartsError: null,
  filters: {},
  userRole: null,
  userBranch: null,
};

// Reducer function
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING_STATS':
      return { ...state, isLoadingStats: action.payload };
    case 'SET_LOADING_ACTIVITY':
      return { ...state, isLoadingActivity: action.payload };
    case 'SET_LOADING_CHARTS':
      return { ...state, isLoadingCharts: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload, statsError: null };
    case 'SET_STATS_ERROR':
      return { ...state, statsError: action.payload, stats: null };
    case 'SET_RECENT_ACTIVITY':
      return { ...state, recentActivity: action.payload, activityError: null };
    case 'SET_ACTIVITY_ERROR':
      return { ...state, activityError: action.payload, recentActivity: [] };
    case 'SET_ENROLLMENT_TRENDS':
      return { ...state, enrollmentTrends: action.payload };
    case 'SET_USER_ROLE_DISTRIBUTION':
      return { ...state, userRoleDistribution: action.payload };
    case 'SET_CHARTS_ERROR':
      return { ...state, chartsError: action.payload, enrollmentTrends: [], userRoleDistribution: [] };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_USER_INFO':
      return { ...state, userRole: action.payload.role, userBranch: action.payload.branch };
    case 'CLEAR_ERRORS':
      return { ...state, statsError: null, activityError: null, chartsError: null };
    default:
      return state;
  }
};

// Context interface
interface DashboardContextType {
  state: DashboardState;
  actions: {
    loadDashboardStats: () => Promise<void>;
    loadRecentActivity: () => Promise<void>;
    loadChartData: () => Promise<void>;
    updateFilters: (filters: DashboardFilters) => void;
    refreshAllData: () => Promise<void>;
    clearErrors: () => void;
  };
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Initialize user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'SET_USER_INFO',
          payload: {
            role: user.role,
            branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null
          }
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_STATS', payload: true });
    try {
      const stats = await getDashboardStats(state.filters);
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        dispatch({ type: 'SET_STATS_ERROR', payload: getErrorMessage(error) });
      }
    } finally {
      dispatch({ type: 'SET_LOADING_STATS', payload: false });
    }
  }, [state.filters]);

  // Load recent activity
  const loadRecentActivity = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_ACTIVITY', payload: true });
    try {
      const activity = await getRecentActivity(state.filters);
      dispatch({ type: 'SET_RECENT_ACTIVITY', payload: activity });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        dispatch({ type: 'SET_ACTIVITY_ERROR', payload: getErrorMessage(error) });
      }
    } finally {
      dispatch({ type: 'SET_LOADING_ACTIVITY', payload: false });
    }
  }, [state.filters]);

  // Load chart data
  const loadChartData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_CHARTS', payload: true });
    try {
      const [enrollmentTrends, userRoleDistribution] = await Promise.all([
        getEnrollmentTrends(state.filters),
        getUsersByRoleChartData(state.filters)
      ]);

      dispatch({ type: 'SET_ENROLLMENT_TRENDS', payload: enrollmentTrends });
      dispatch({ type: 'SET_USER_ROLE_DISTRIBUTION', payload: userRoleDistribution });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        dispatch({ type: 'SET_CHARTS_ERROR', payload: getErrorMessage(error) });
      }
    } finally {
      dispatch({ type: 'SET_LOADING_CHARTS', payload: false });
    }
  }, [state.filters]);

  // Update filters
  const updateFilters = useCallback((filters: DashboardFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadDashboardStats(),
      loadRecentActivity(),
      loadChartData()
    ]);
  }, [loadDashboardStats, loadRecentActivity, loadChartData]);

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const contextValue: DashboardContextType = useMemo(() => ({
    state,
    actions: {
      loadDashboardStats,
      loadRecentActivity,
      loadChartData,
      updateFilters,
      refreshAllData,
      clearErrors,
    },
  }), [state, loadDashboardStats, loadRecentActivity, loadChartData, updateFilters, refreshAllData, clearErrors]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
