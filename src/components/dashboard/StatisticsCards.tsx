'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs flex items-center mt-1 ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {change.isPositive ? '+' : ''}{change.value}% {change.label}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatisticsCards: React.FC = () => {
  const { state } = useDashboard();
  const { stats, isLoadingStats, statsError } = state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (statsError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading statistics</p>
              <p className="text-sm text-gray-500 mt-1">{statsError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Users */}
      <StatCard
        title="Total Users"
        value={stats?.userStats.total || 0}
        change={{
          value: 12,
          isPositive: true,
          label: 'from last month'
        }}
        icon={<Users className="w-6 h-6" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        isLoading={isLoadingStats}
      />

      {/* Monthly Revenue */}
      <StatCard
        title="Monthly Revenue"
        value={stats ? formatCurrency(stats.financialStats.monthlyRevenue) : formatCurrency(0)}
        change={{
          value: stats?.financialStats.growthRate || 0,
          isPositive: (stats?.financialStats.growthRate || 0) >= 0,
          label: 'from last month'
        }}
        icon={<DollarSign className="w-6 h-6" />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        isLoading={isLoadingStats}
      />

      {/* Today's Attendance */}
      <StatCard
        title="Today's Attendance"
        value={stats ? formatPercentage(stats.attendanceStats.todayAttendance) : '0%'}
        change={{
          value: 2.5,
          isPositive: true,
          label: 'from yesterday'
        }}
        icon={<Calendar className="w-6 h-6" />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        isLoading={isLoadingStats}
      />

      {/* Net Profit */}
      <StatCard
        title="Net Profit"
        value={stats ? formatCurrency(stats.financialStats.netProfit) : formatCurrency(0)}
        change={{
          value: 15.3,
          isPositive: (stats?.financialStats.netProfit || 0) >= 0,
          label: 'from last month'
        }}
        icon={<TrendingUp className="w-6 h-6" />}
        iconBgColor={(stats?.financialStats.netProfit || 0) >= 0 ? "bg-green-100" : "bg-red-100"}
        iconColor={(stats?.financialStats.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}
        isLoading={isLoadingStats}
      />

      {/* Additional cards for SuperAdmin */}
      {state.userRole === 'superAdmin' && stats?.branchStats && (
        <>
          <StatCard
            title="Total Branches"
            value={stats.branchStats.totalBranches}
            change={{
              value: 0,
              isPositive: true,
              label: 'active branches'
            }}
            icon={<Building2 className="w-6 h-6" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isLoading={isLoadingStats}
          />

          <StatCard
            title="System Users"
            value={stats.branchStats.totalSystemUsers}
            change={{
              value: stats.branchStats.averageUsersPerBranch,
              isPositive: true,
              label: 'avg per branch'
            }}
            icon={<Users className="w-6 h-6" />}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            isLoading={isLoadingStats}
          />

          <StatCard
            title="Active Courses"
            value={stats.courseStats.activeCourses}
            change={{
              value: Math.round((stats.courseStats.activeCourses / stats.courseStats.totalCourses) * 100),
              isPositive: true,
              label: 'of total courses'
            }}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            isLoading={isLoadingStats}
          />

          <StatCard
            title="Total Students"
            value={stats.attendanceStats.totalStudents}
            change={{
              value: Math.round((stats.courseStats.totalEnrolled / stats.courseStats.totalCapacity) * 100),
              isPositive: true,
              label: 'capacity utilization'
            }}
            icon={<Users className="w-6 h-6" />}
            iconBgColor="bg-cyan-100"
            iconColor="text-cyan-600"
            isLoading={isLoadingStats}
          />
        </>
      )}
    </div>
  );
};

export default StatisticsCards;
