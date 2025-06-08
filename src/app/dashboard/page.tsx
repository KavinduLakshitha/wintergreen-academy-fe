"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Award,
  GraduationCap,
  Building,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Plus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data interfaces
interface Student {
  id: number;
  name: string;
  studentId: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  avatar: string;
  lastActivity: string;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  studentId?: number;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  course: string;
}

const AdminDashboard = () => {
  // Sample data
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Kasun Perera",
      studentId: "STU001",
      major: "Computer Science",
      year: "Senior",
      status: "Active",
      avatar: "",
      lastActivity: "2025-06-08"
    },
    {
      id: 2,
      name: "Nimali Fernando",
      studentId: "STU002",
      major: "Business Administration",
      year: "Junior",
      status: "Active",
      avatar: "",
      lastActivity: "2025-06-08"
    },
    {
      id: 3,
      name: "Tharushi Jayasinghe",
      studentId: "STU003",
      major: "Psychology",
      year: "Graduate",
      status: "Active",
      avatar: "",
      lastActivity: "2025-06-07"
    },
    {
      id: 4,
      name: "Ruwan Silva",
      studentId: "STU004",
      major: "Computer Science",
      year: "Junior",
      status: "Inactive",
      avatar: "",
      lastActivity: "2025-06-05"
    },
    {
      id: 5,
      name: "Dilani Wickramasinghe",
      studentId: "STU005",
      major: "Engineering",
      year: "Senior",
      status: "Active",
      avatar: "",
      lastActivity: "2025-06-08"
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: 1, type: 'income', category: 'Tuition Fees', amount: 75000, date: '2025-06-01', status: 'completed', studentId: 1 },
    { id: 2, type: 'income', category: 'Registration Fees', amount: 15000, date: '2025-06-02', status: 'completed', studentId: 2 },
    { id: 3, type: 'expense', category: 'Salaries', amount: 250000, date: '2025-06-01', status: 'completed' },
    { id: 4, type: 'expense', category: 'Utilities', amount: 35000, date: '2025-06-03', status: 'completed' },
    { id: 5, type: 'income', category: 'Course Fees', amount: 45000, date: '2025-06-05', status: 'pending', studentId: 3 },
    { id: 6, type: 'expense', category: 'Equipment', amount: 120000, date: '2025-06-04', status: 'pending' }
  ]);

  const [attendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, studentId: 1, date: "2025-06-08", status: "Present", course: "CS101" },
    { id: 2, studentId: 2, date: "2025-06-08", status: "Present", course: "CS101" },
    { id: 3, studentId: 3, date: "2025-06-08", status: "Absent", course: "CS101" },
    { id: 4, studentId: 4, date: "2025-06-08", status: "Late", course: "CS102" },
    { id: 5, studentId: 5, date: "2025-06-08", status: "Present", course: "CS102" }
  ]);

  // Chart data preparation
  const monthlyRevenueData = [
    { month: 'Jan', income: 450000, expenses: 380000, profit: 70000 },
    { month: 'Feb', income: 520000, expenses: 420000, profit: 100000 },
    { month: 'Mar', income: 480000, expenses: 390000, profit: 90000 },
    { month: 'Apr', income: 610000, expenses: 450000, profit: 160000 },
    { month: 'May', income: 580000, expenses: 410000, profit: 170000 },
    { month: 'Jun', income: 720000, expenses: 480000, profit: 240000 }
  ];

  const enrollmentTrendsData = [
    { month: 'Jan', newStudents: 15, totalStudents: 120 },
    { month: 'Feb', newStudents: 22, totalStudents: 142 },
    { month: 'Mar', newStudents: 18, totalStudents: 160 },
    { month: 'Apr', newStudents: 25, totalStudents: 185 },
    { month: 'May', newStudents: 20, totalStudents: 205 },
    { month: 'Jun', newStudents: 28, totalStudents: 233 }
  ];

  const attendanceData = [
    { day: 'Mon', present: 85, absent: 15, late: 5 },
    { day: 'Tue', present: 90, absent: 8, late: 7 },
    { day: 'Wed', present: 88, absent: 10, late: 6 },
    { day: 'Thu', present: 92, absent: 5, late: 8 },
    { day: 'Fri', present: 87, absent: 12, late: 4 }
  ];

  const majorDistributionData = [
    { name: 'Computer Science', value: 45, color: '#3B82F6' },
    { name: 'Business Admin', value: 30, color: '#10B981' },
    { name: 'Psychology', value: 15, color: '#F59E0B' },
    { name: 'Engineering', value: 25, color: '#EF4444' },
    { name: 'Others', value: 10, color: '#8B5CF6' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate metrics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const monthlyIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = monthlyIncome - monthlyExpenses;
  const pendingPayments = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  
  const todayAttendance = attendanceRecords.filter(r => r.date === '2025-06-08');
  const presentToday = todayAttendance.filter(r => r.status === 'Present').length;
  const attendanceRate = todayAttendance.length > 0 ? (presentToday / todayAttendance.length * 100).toFixed(1) : '0';

  const recentActivities = [
    { type: 'enrollment', message: 'New student enrolled: Arjuna Ratnayake', time: '2 hours ago', icon: Users },
    { type: 'payment', message: 'Payment received: LKR 75,000 from Kasun Perera', time: '3 hours ago', icon: DollarSign },
    { type: 'attendance', message: 'Attendance marked for CS101 class', time: '4 hours ago', icon: CheckCircle2 },
    { type: 'alert', message: 'Low attendance alert for Ruwan Silva', time: '5 hours ago', icon: AlertTriangle }
  ];

  const upcomingTasks = [
    { task: 'Monthly financial report due', date: '2025-06-10', priority: 'high' },
    { task: 'Staff meeting scheduled', date: '2025-06-09', priority: 'medium' },
    { task: 'Course evaluation deadline', date: '2025-06-12', priority: 'medium' },
    { task: 'Student feedback collection', date: '2025-06-15', priority: 'low' }
  ];

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening at the academy today.</p>
            </div>
            <div className="flex items-center space-x-4">
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {presentToday} students present
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netProfit)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pending: {formatCurrency(pendingPayments)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TrendingUp className={`w-6 h-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Monthly income, expenses, and profit trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Income"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enrollment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment Trends</CardTitle>
              <CardDescription>New student registrations and total enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newStudents" fill="#3B82F6" name="New Students" />
                  <Line 
                    type="monotone" 
                    dataKey="totalStudents" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Total Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Overview</CardTitle>
              <CardDescription>Daily attendance patterns this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10B981" name="Present" />
                  <Bar dataKey="late" fill="#F59E0B" name="Late" />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Major Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Students by Major</CardTitle>
              <CardDescription>Distribution of students across different programs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={majorDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {majorDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'enrollment' ? 'bg-blue-100' :
                      activity.type === 'payment' ? 'bg-green-100' :
                      activity.type === 'attendance' ? 'bg-purple-100' : 'bg-yellow-100'
                    }`}>
                      <activity.icon className={`w-4 h-4 ${
                        activity.type === 'enrollment' ? 'text-blue-600' :
                        activity.type === 'payment' ? 'text-green-600' :
                        activity.type === 'attendance' ? 'text-purple-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Students */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Students with highest attendance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.filter(s => s.status === 'Active').slice(0, 4).map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.major}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">95%</p>
                      <p className="text-xs text-gray-500">Attendance</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tasks */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Important deadlines and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.task}</p>
                      <p className="text-xs text-gray-500">{task.date}</p>
                    </div>
                    <Badge 
                      className={
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used actions and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Users className="w-6 h-6 mb-2" />
                <span className="text-xs">Add Student</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-xs">Mark Attendance</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="text-xs">Add Transaction</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <BookOpen className="w-6 h-6 mb-2" />
                <span className="text-xs">Manage Courses</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="text-xs">View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Bell className="w-6 h-6 mb-2" />
                <span className="text-xs">Send Notice</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;