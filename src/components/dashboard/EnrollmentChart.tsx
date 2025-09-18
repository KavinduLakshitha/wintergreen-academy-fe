'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ComposedChart,
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';

interface EnrollmentDataPoint {
  month: string;
  year: number;
  newUsers: number;
  totalUsers: number;
}

const EnrollmentChart: React.FC = () => {
  const { state } = useDashboard();
  const { enrollmentTrends, stats, isLoadingCharts, chartsError } = state;

  // Generate comprehensive enrollment data
  const enrollmentData: EnrollmentDataPoint[] = useMemo(() => {
    if (enrollmentTrends.length > 0) {
      // Use actual backend data and calculate cumulative totals
      let runningTotal = stats?.userStats.total || 0;
      
      return enrollmentTrends.map((trend, index) => {
        // For the last entry, use current total; for others, calculate backwards
        if (index === enrollmentTrends.length - 1) {
          return {
            month: trend.month,
            year: trend.year,
            newUsers: trend.newUsers,
            totalUsers: runningTotal
          };
        } else {
          runningTotal -= enrollmentTrends.slice(index + 1).reduce((sum, t) => sum + t.newUsers, 0);
          return {
            month: trend.month,
            year: trend.year,
            newUsers: trend.newUsers,
            totalUsers: runningTotal
          };
        }
      });
    }

    // Fallback mock data if no backend data
    const currentTotal = stats?.userStats.total || 233;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const newUsers = Math.floor(Math.random() * 20) + 15; // 15-35 new users
      const totalUsers = Math.round(currentTotal * (0.7 + (index * 0.05))); // Progressive growth
      
      return {
        month,
        year: currentYear,
        newUsers,
        totalUsers
      };
    });
  }, [enrollmentTrends, stats]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'New Users') {
      return [`${value} new users`, name];
    }
    return [`${value} total users`, name];
  };

  if (chartsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollment Trends</CardTitle>
          <CardDescription>New user registrations and total enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-600">
            <div className="text-center">
              <p className="font-medium">Error loading enrollment data</p>
              <p className="text-sm text-gray-500 mt-1">{chartsError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingCharts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollment Trends</CardTitle>
          <CardDescription>New user registrations and total enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-3/5"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Enrollment Trends</CardTitle>
        <CardDescription>New user registrations and total enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={enrollmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
            />
            
            {/* New Users Bar */}
            <Bar 
              yAxisId="left"
              dataKey="newUsers" 
              fill="#3B82F6" 
              name="New Users"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {/* Total Users Line */}
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalUsers" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              name="Total Users"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-lg font-semibold text-blue-600">
              {stats?.userStats.total || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Recent Users (30 days)</p>
            <p className="text-lg font-semibold text-green-600">
              {stats?.userStats.recent || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Growth Rate</p>
            <p className="text-lg font-semibold text-purple-600">
              {stats ? `${stats.financialStats.growthRate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
