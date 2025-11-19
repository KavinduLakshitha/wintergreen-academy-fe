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
  newStudents: number;
  totalStudents: number;
}

const EnrollmentChart: React.FC = () => {
  const { state } = useDashboard();
  const { enrollmentTrends, stats, isLoadingCharts, chartsError } = state;

  // Generate comprehensive enrollment data
  const enrollmentData: EnrollmentDataPoint[] = useMemo(() => {
    if (enrollmentTrends.length > 0) {
      // Use actual backend data and calculate cumulative totals
      let runningTotal = stats?.studentStats?.totalStudents || 0;

      return enrollmentTrends.map((trend, index) => {
        // For the last entry, use current total; for others, calculate backwards
        if (index === enrollmentTrends.length - 1) {
          return {
            month: trend.month,
            year: trend.year,
            newStudents: trend.newStudents,
            totalStudents: runningTotal
          };
        } else {
          runningTotal -= enrollmentTrends.slice(index + 1).reduce((sum, t) => sum + t.newStudents, 0);
          return {
            month: trend.month,
            year: trend.year,
            newStudents: trend.newStudents,
            totalStudents: runningTotal
          };
        }
      });
    }

    // Fallback mock data if no backend data
    const currentTotal = stats?.studentStats?.totalStudents || 150;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const newStudents = Math.floor(Math.random() * 15) + 8; // 8-23 new students
      const totalStudents = Math.round(currentTotal * (0.7 + (index * 0.05))); // Progressive growth

      return {
        month,
        year: currentYear,
        newStudents,
        totalStudents
      };
    });
  }, [enrollmentTrends, stats]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'New Students') {
      return [`${value} new students`, name];
    }
    return [`${value} total students`, name];
  };

  if (chartsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollment Trends</CardTitle>
          <CardDescription>New student enrollments and total student count</CardDescription>
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
        <CardDescription>New student enrollments and total student count</CardDescription>
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
            
            {/* New Students Bar */}
            <Bar
              yAxisId="left"
              dataKey="newStudents"
              fill="#3B82F6"
              name="New Students"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            
            {/* Total Students Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalStudents"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              name="Total Students"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 2xl:grid-cols-3 gap-4 sm:gap-6 pt-4 border-t">
          <div className="text-center px-2">
            <p className="text-sm text-gray-600 mb-1">Total Students</p>
            <p className="text-lg sm:text-xl font-semibold text-blue-600 whitespace-nowrap">
              {stats?.studentStats?.totalStudents || 0}
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-sm text-gray-600 mb-1">Active Students</p>
            <p className="text-lg sm:text-xl font-semibold text-green-600 whitespace-nowrap">
              {stats?.studentStats?.activeStudents || 0}
            </p>
          </div>
          <div className="text-center px-2">
            <p className="text-sm text-gray-600 mb-1">Graduated Students</p>
            <p className="text-lg sm:text-xl font-semibold text-purple-600 whitespace-nowrap">
              {stats?.studentStats?.graduatedStudents || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentChart;
