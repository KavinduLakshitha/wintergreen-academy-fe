"use client"

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Plus,
  RefreshCw,
  Users,
  Calendar,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { DashboardErrorBoundary } from '@/components/dashboard/LoadingStates';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import FinancialChart from '@/components/dashboard/FinancialChart';
import EnrollmentChart from '@/components/dashboard/EnrollmentChart';
import UserRoleChart from '@/components/dashboard/UserRoleChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import BranchSelector from '@/components/dashboard/BranchSelector';

// Dashboard content component
const DashboardContent: React.FC = () => {
  const { state, actions } = useDashboard();
  const { userRole, userBranch } = state;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await actions.refreshAllData();
    };

    loadInitialData();
  }, [actions.refreshAllData]);

  // Refresh all data
  const handleRefreshAll = async () => {
    await actions.refreshAllData();
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back! Here&apos;s what&apos;s happening at the academy today.
                {userBranch && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({userBranch.name})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRefreshAll}
                disabled={state.isLoadingStats || state.isLoadingActivity || state.isLoadingCharts}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${
                  (state.isLoadingStats || state.isLoadingActivity || state.isLoadingCharts) ? 'animate-spin' : ''
                }`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Quick Action
              </Button>
            </div>
          </div>
        </div>

        {/* Branch Selector (SuperAdmin only) */}
        <BranchSelector />

        {/* Key Metrics Cards */}
        <StatisticsCards />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FinancialChart />
          <EnrollmentChart />
        </div>

        {/* Secondary Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <UserRoleChart />
        </div>
      </div>
    </div>
  );
};

// Main Dashboard component with provider
const AdminDashboard = () => {
  return (
    <DashboardErrorBoundary>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </DashboardErrorBoundary>
  );
};

export default AdminDashboard;