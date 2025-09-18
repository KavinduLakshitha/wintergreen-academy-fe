'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';

interface RoleData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const UserRoleChart: React.FC = () => {
  const { state } = useDashboard();
  const { userRoleDistribution, stats, isLoadingCharts, chartsError } = state;

  // Process role distribution data
  const roleData: RoleData[] = useMemo(() => {
    if (userRoleDistribution.length > 0) {
      const total = userRoleDistribution.reduce((sum, role) => sum + role.value, 0);
      return userRoleDistribution.map(role => ({
        name: role.name,
        value: role.value,
        color: role.color,
        percentage: total > 0 ? Math.round((role.value / total) * 100) : 0
      }));
    }

    // Fallback data from stats if chart data not available
    if (stats?.userStats.byRole) {
      const roleColors: Record<string, string> = {
        admin: '#3B82F6',
        moderator: '#10B981',
        staff: '#F59E0B',
        superAdmin: '#EF4444'
      };

      const total = Object.values(stats.userStats.byRole).reduce((sum, count) => sum + count, 0);
      
      return Object.entries(stats.userStats.byRole).map(([role, count]) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: count,
        color: roleColors[role] || '#8B5CF6',
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
    }

    return [];
  }, [userRoleDistribution, stats]);

  const formatTooltipValue = (value: number, name: string) => {
    const roleItem = roleData.find(item => item.name === name);
    return [`${value} users (${roleItem?.percentage || 0}%)`, name];
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Distribution of users across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-600">
            <div className="text-center">
              <p className="font-medium">Error loading role distribution</p>
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
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Distribution of users across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (roleData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Distribution of users across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="font-medium">No role data available</p>
              <p className="text-sm mt-1">User role distribution will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by Role</CardTitle>
        <CardDescription>Distribution of users across different roles</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={formatTooltipValue}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Role Legend */}
        <div className="mt-4 space-y-2">
          {roleData.map((role, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: role.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{role.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">{role.value}</span>
                <span className="text-xs text-gray-500 ml-1">({role.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {roleData.reduce((sum, role) => sum + role.value, 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleChart;
