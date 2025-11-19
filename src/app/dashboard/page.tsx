"use client"

import React, { useEffect } from 'react';
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
  const { userBranch } = state;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await actions.refreshAllData();
    };

    loadInitialData();
  }, [actions.refreshAllData]);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="mx-auto max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening at the academy today.
            {userBranch && (
              <span className="ml-2 text-blue-600 font-medium">
                ({userBranch.name})
              </span>
            )}
          </p>
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