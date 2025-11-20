"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  getComprehensiveReport,
  getDashboardStats,
  exportReportToExcel,
  getErrorMessage,
  type ComprehensiveReport,
  type DashboardStats,
  type ReportsFilters
} from '@/services/reportsService';
import { getActiveBranches } from '@/services/branchService';
import { getCourses } from '@/services/courseService';

// Interface for user context
interface User {
  role: string;
  branch: {
    _id: string;
    name: string;
  };
}

// Interface for branch data
interface Branch {
  _id: string;
  name: string;
}

// Interface for course data
interface Course {
  _id: string;
  title: string;
  code: string;
}

const ReportsManagement = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [, setCourses] = useState<Course[]>([]);
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveReport | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Filters state
  const [reportFilters, setReportFilters] = useState<ReportsFilters>({
    startDate: '',
    endDate: '',
    branchId: '',
    period: 'monthly'
  });

  // Get user info from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Set default branch filter for non-superAdmin users
      if (parsedUser.role !== 'superAdmin') {
        setReportFilters(prev => ({
          ...prev,
          branchId: parsedUser.branch._id
        }));
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches and courses in parallel
        const [branchesData, coursesData] = await Promise.all([
          getActiveBranches(),
          getCourses()
        ]);

        setBranches(branchesData || []);
        setCourses(coursesData.courses || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch report data when filters change
  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [reportFilters, user]);

  // Fetch comprehensive report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [comprehensiveData, dashboardData] = await Promise.all([
        getComprehensiveReport(reportFilters),
        getDashboardStats(reportFilters)
      ]);

      setComprehensiveReport(comprehensiveData);
      setDashboardStats(dashboardData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ReportsFilters, value: string) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle export functionality
  const handleExport = async (reportType: 'comprehensive' | 'students' | 'courses' | 'financial' | 'attendance') => {
    try {
      setLoading(true);
      await exportReportToExcel(reportType, reportFilters);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get report stats from comprehensive report
  const getReportStats = () => {
    if (!comprehensiveReport) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        monthlyIncome: 0,
        attendanceRate: '0',
        totalCourses: 0
      };
    }

    return {
      totalStudents: comprehensiveReport.studentStats.totalStudents,
      activeStudents: comprehensiveReport.studentStats.activeStudents,
      monthlyIncome: comprehensiveReport.transactionStats.totalIncome,
      attendanceRate: dashboardStats?.attendanceStats.monthlyAverage.toFixed(1) || '0',
      totalCourses: comprehensiveReport.courseStats.totalCourses
    };
  };

  const stats = getReportStats();

  // Show loading state
  if (loading && !comprehensiveReport) {
    return (
      <div className="w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#2E8B57]" />
            <p className="text-gray-600">Loading reports data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="mx-auto max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-sm sm:text-base text-gray-600">Generate comprehensive reports and export data for analysis</p>
              {comprehensiveReport?.branchInfo && (
                <p className="text-sm text-gray-500 mt-1">
                  Branch: {comprehensiveReport.branchInfo.name}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={fetchReportData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                  <p className="text-lg sm:text-xl font-bold whitespace-nowrap">{stats.totalStudents}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.activeStudents} active</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Income</p>
                  <p className="text-lg sm:text-xl font-bold text-[#2E8B57] whitespace-nowrap">{formatCurrency(stats.monthlyIncome)}</p>
                  <p className="text-sm text-gray-500 mt-1">All time</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-lg sm:text-xl font-bold text-[#2E8B57] whitespace-nowrap">{stats.attendanceRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">Monthly average</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
                  <p className="text-lg sm:text-xl font-bold whitespace-nowrap">{stats.totalCourses}</p>
                  <p className="text-sm text-gray-500 mt-1">Active courses</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Report Filters
            </CardTitle>
            <CardDescription>Set date range and filters for your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                />
              </div>
              {user?.role === 'superAdmin' && (
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={reportFilters.branchId || 'all'}
                    onValueChange={(value) => handleFilterChange('branchId', value === 'all' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.filter(branch => branch._id).map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="period">Period</Label>
                <Select
                  value={reportFilters.period || 'monthly'}
                  onValueChange={(value) => handleFilterChange('period', value as 'monthly' | 'quarterly' | 'yearly')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="student" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="student">Student Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Student Reports Tab */}
          <TabsContent value="student" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Detailed Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Students Detailed Report
                  </CardTitle>
                  <CardDescription>Complete student details including personal information, documents, and requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Students:</p>
                        <p className="font-semibold">{stats.totalStudents}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Students:</p>
                        <p className="font-semibold">{stats.activeStudents}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Graduated:</p>
                        <p className="font-semibold">{comprehensiveReport?.studentStats?.graduatedStudents || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Branch Filter:</p>
                        <p className="font-semibold">{reportFilters.branchId ? comprehensiveReport?.branchInfo?.name || 'Specific Branch' : 'All Branches'}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">📋 Report includes:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Complete student information (ID, name, contact details)</li>
                        <li>• Course and branch details</li>
                        <li>• Care services (Child/Baby care, Elder care)</li>
                        <li>• Document upload status and personal documents checklist</li>
                        <li>• Hostel and meal requirements</li>
                        <li>• Enrollment and creation dates</li>
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleExport('students')}
                        disabled={loading}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Detailed Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Statistics Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Course Statistics Report
                  </CardTitle>
                  <CardDescription>Course enrollment and performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Courses:</p>
                        <p className="font-semibold">{stats.totalCourses}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Active Courses:</p>
                        <p className="font-semibold">{comprehensiveReport?.courseStats?.activeCourses || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Enrolled:</p>
                        <p className="font-semibold">{comprehensiveReport?.courseStats?.totalEnrolled || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Revenue:</p>
                        <p className="font-semibold">{formatCurrency(comprehensiveReport?.courseStats?.totalRevenue || 0)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleExport('courses')}
                        disabled={loading}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Reports Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Detailed Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Attendance Detailed Report
                  </CardTitle>
                  <CardDescription>Date-wise attendance records with complete student and course information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Today&apos;s Attendance:</p>
                        <p className="font-semibold">{dashboardStats?.attendanceStats.todayAttendance.toFixed(1) || '0.0'}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monthly Average:</p>
                        <p className="font-semibold">{dashboardStats?.attendanceStats.monthlyAverage.toFixed(1) || '0.0'}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date Range:</p>
                        <p className="font-semibold">{reportFilters.startDate && reportFilters.endDate ? 'Custom Range' : 'All Records'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Branch Filter:</p>
                        <p className="font-semibold">{reportFilters.branchId ? comprehensiveReport?.branchInfo?.name || 'Specific Branch' : 'All Branches'}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">📅 Report includes:</p>
                      <ul className="text-xs text-green-700 mt-1 space-y-1">
                        <li>• Date-wise attendance records</li>
                        <li>• Student details (ID, name, contact information)</li>
                        <li>• Course and branch information</li>
                        <li>• Attendance status (Present, Absent, Late, Excused)</li>
                        <li>• Time in records and notes</li>
                        <li>• Marked by information and timestamps</li>
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleExport('attendance')}
                        disabled={loading}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Detailed Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Attendance Trends
                  </CardTitle>
                  <CardDescription>Attendance performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#2E8B57] mb-2">
                        {stats.attendanceRate}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Attendance Rate</p>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#2E8B57] h-2 rounded-full"
                            style={{ width: `${stats.attendanceRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Detailed Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Budget Detailed Report
                  </CardTitle>
                  <CardDescription>Complete budget records with allocation, spending, and utilization details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Budgets:</p>
                        <p className="font-semibold">{comprehensiveReport?.budgetStats?.totalBudgets || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Allocated:</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(comprehensiveReport?.budgetStats?.totalAllocated || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Spent:</p>
                        <p className="font-semibold text-red-600">{formatCurrency(comprehensiveReport?.budgetStats?.totalSpent || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Overall Utilization:</p>
                        <p className="font-semibold text-[#2E8B57]">{comprehensiveReport?.budgetStats?.overallUtilization?.toFixed(1) || '0.0'}%</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium">💰 Report includes:</p>
                      <ul className="text-xs text-purple-700 mt-1 space-y-1">
                        <li>• Budget categories and allocated amounts</li>
                        <li>• Spent amounts and remaining balances</li>
                        <li>• Budget periods (monthly, quarterly, yearly)</li>
                        <li>• Start and end dates for each budget</li>
                        <li>• Utilization percentages and status</li>
                        <li>• Branch-wise budget allocation</li>
                        <li>• Created and updated by information</li>
                      </ul>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleExport('financial')}
                        disabled={loading}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download Detailed Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Budget Overview
                  </CardTitle>
                  <CardDescription>Budget allocation and utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Budgets:</p>
                        <p className="font-semibold">{comprehensiveReport?.budgetStats?.totalBudgets || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Allocated:</p>
                        <p className="font-semibold">{formatCurrency(comprehensiveReport?.budgetStats?.totalAllocated || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Spent:</p>
                        <p className="font-semibold">{formatCurrency(comprehensiveReport?.budgetStats?.totalSpent || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Utilization:</p>
                        <p className="font-semibold">{comprehensiveReport?.budgetStats?.overallUtilization?.toFixed(1) || '0.0'}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Visual analytics and key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* User Distribution */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">User Distribution</h3>
                    <div className="space-y-2">
                      {comprehensiveReport?.userStats?.byRole && Object.entries(comprehensiveReport.userStats.byRole).map(([role, count]) => (
                        <div key={role} className="flex justify-between text-sm">
                          <span className="capitalize">{role}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                      {!comprehensiveReport?.userStats?.byRole && (
                        <div className="text-sm text-gray-500">No user data available</div>
                      )}
                    </div>
                  </div>

                  {/* Financial Overview */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Financial Overview</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Income:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(comprehensiveReport?.transactionStats?.totalIncome || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expenses:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(comprehensiveReport?.transactionStats?.totalExpenses || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Net Profit:</span>
                        <span className="font-medium text-[#2E8B57]">
                          {formatCurrency(comprehensiveReport?.transactionStats?.netProfit || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Performance Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Student Retention:</span>
                        <span className="font-medium">
                          {comprehensiveReport?.studentStats?.totalStudents > 0
                            ? ((comprehensiveReport.studentStats.activeStudents / comprehensiveReport.studentStats.totalStudents) * 100).toFixed(1)
                            : '0.0'
                          }%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Course Utilization:</span>
                        <span className="font-medium">
                          {comprehensiveReport?.courseStats?.totalCapacity > 0
                            ? ((comprehensiveReport.courseStats.totalEnrolled / comprehensiveReport.courseStats.totalCapacity) * 100).toFixed(1)
                            : '0.0'
                          }%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget Utilization:</span>
                        <span className="font-medium">
                          {comprehensiveReport?.budgetStats?.overallUtilization?.toFixed(1) || '0.0'}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Analytics */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Export Analytics Data</h3>
                      <p className="text-sm text-gray-600">Download comprehensive analytics report</p>
                    </div>

                    <Button
                      onClick={() => handleExport('comprehensive')}
                      disabled={loading}
                      className="bg-[#2E8B57] hover:bg-[#236446] text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Download Comprehensive Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsManagement;