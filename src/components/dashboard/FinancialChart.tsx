'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';

interface FinancialDataPoint {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

const FinancialChart: React.FC = () => {
  const { state } = useDashboard();
  const { stats, isLoadingStats, statsError } = state;

  // Generate mock financial trend data based on current stats
  const financialData: FinancialDataPoint[] = useMemo(() => {
    if (!stats) return [];

    const currentRevenue = stats.financialStats.monthlyRevenue;
    const currentExpenses = stats.financialStats.monthlyExpenses;
    const growthRate = stats.financialStats.growthRate / 100;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => {
      // Calculate progressive growth/decline over 6 months
      const monthlyGrowthFactor = Math.pow(1 + growthRate / 6, index - 5); // Last month is current
      const income = Math.round(currentRevenue * monthlyGrowthFactor);
      const expenses = Math.round(currentExpenses * Math.pow(1.02, index - 5)); // Slower expense growth
      const profit = income - expenses;

      return {
        month,
        income,
        expenses,
        profit
      };
    });
  }, [stats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (statsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Performance</CardTitle>
          <CardDescription>Monthly income, expenses, and profit trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-red-600">
            <div className="text-center">
              <p className="font-medium">Error loading financial data</p>
              <p className="text-sm text-gray-500 mt-1">{statsError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Performance</CardTitle>
          <CardDescription>Monthly income, expenses, and profit trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
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
        <CardTitle>Financial Performance</CardTitle>
        <CardDescription>Monthly income, expenses, and profit trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              tickFormatter={formatYAxisValue}
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
            
            {/* Income Area */}
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              fill="url(#incomeGradient)"
              strokeWidth={2}
              name="Income"
            />
            
            {/* Expenses Area */}
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              fill="url(#expensesGradient)"
              strokeWidth={2}
              name="Expenses"
            />
            
            {/* Profit Line */}
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Revenue</p>
            <p className="text-lg font-semibold text-green-600">
              {stats ? formatCurrency(stats.financialStats.monthlyRevenue) : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Expenses</p>
            <p className="text-lg font-semibold text-red-600">
              {stats ? formatCurrency(stats.financialStats.monthlyExpenses) : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className={`text-lg font-semibold ${
              (stats?.financialStats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats ? formatCurrency(stats.financialStats.netProfit) : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialChart;
