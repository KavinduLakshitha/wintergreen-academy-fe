"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Sample data interfaces
interface Student {
  id: number;
  name: string;
  studentId: string;
  email: string;
  program: string;
  level: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrollmentDate: string;
  gpa: number;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  course: string;
  timeIn?: string;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  studentId?: number;
  reference?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  schedule: string;
}

const ReportsManagement = () => {
  // Sample data
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Kasun Perera",
      studentId: "CNA001",
      email: "kasun.perera@email.com",
      program: "Certified Nursing Assistant",
      level: "Basic",
      status: "Active",
      enrollmentDate: "2025-01-15",
      gpa: 3.8
    },
    {
      id: 2,
      name: "Nimali Fernando",
      studentId: "HHA002",
      email: "nimali.fernando@email.com",
      program: "Home Health Aide",
      level: "Intermediate",
      status: "Active",
      enrollmentDate: "2025-02-01",
      gpa: 3.6
    },
    {
      id: 3,
      name: "Tharushi Jayasinghe",
      studentId: "MA003",
      email: "tharushi.jayasinghe@email.com",
      program: "Medical Assistant",
      level: "Advanced",
      status: "Active",
      enrollmentDate: "2024-12-10",
      gpa: 3.9
    }
  ]);

  const [attendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, studentId: 1, date: "2025-06-08", status: "Present", course: "BPC101", timeIn: "09:05" },
    { id: 2, studentId: 2, date: "2025-06-08", status: "Present", course: "BPC101", timeIn: "09:00" },
    { id: 3, studentId: 3, date: "2025-06-08", status: "Absent", course: "BPC101" },
    { id: 4, studentId: 1, date: "2025-06-07", status: "Late", course: "VSM102", timeIn: "14:15" },
    { id: 5, studentId: 2, date: "2025-06-07", status: "Present", course: "VSM102", timeIn: "14:00" }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'income',
      category: 'Tuition Fees',
      amount: 75000,
      description: 'CNA Program tuition - Kasun Perera',
      date: '2025-06-01',
      status: 'completed',
      studentId: 1,
      reference: 'TF-2025-001'
    },
    {
      id: 2,
      type: 'income',
      category: 'Registration Fees',
      amount: 15000,
      description: 'HHA Program registration - Nimali Fernando',
      date: '2025-06-02',
      status: 'completed',
      studentId: 2,
      reference: 'RF-2025-002'
    },
    {
      id: 3,
      type: 'expense',
      category: 'Salaries',
      amount: 250000,
      description: 'Nursing instructor salaries for May 2025',
      date: '2025-06-01',
      status: 'completed',
      reference: 'SAL-2025-05'
    }
  ]);

  const [courses] = useState<Course[]>([
    { id: "BPC101", name: "Basic Patient Care", code: "BPC101", schedule: "Mon, Wed 9:00 AM" },
    { id: "VSM102", name: "Vital Signs Monitoring", code: "VSM102", schedule: "Tue, Thu 2:00 PM" },
    { id: "IC103", name: "Infection Control", code: "IC103", schedule: "Mon, Fri 11:00 AM" },
    { id: "CS104", name: "Communication Skills", code: "CS104", schedule: "Wed, Fri 1:00 PM" },
    { id: "PCA105", name: "Personal Care Assistance", code: "PCA105", schedule: "Tue, Thu 10:00 AM" }
  ]);

  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    course: 'all',
    status: 'all',
    level: 'all'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Student Reports
  const generateStudentReport = () => {
    let filteredStudents = students;
    
    if (reportFilters.status !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.status === reportFilters.status);
    }
    
    if (reportFilters.level !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.level === reportFilters.level);
    }

    return filteredStudents.map(student => ({
      'Student ID': student.studentId,
      'Name': student.name,
      'Email': student.email,
      'Program': student.program,
      'Level': student.level,
      'Status': student.status,
      'Enrollment Date': student.enrollmentDate,
      'GPA': student.gpa
    }));
  };

  // Attendance Reports
  const generateAttendanceReport = () => {
    let filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = new Date(reportFilters.startDate);
      const endDate = new Date(reportFilters.endDate);
      
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (reportFilters.course !== 'all') {
      filteredRecords = filteredRecords.filter(r => r.course === reportFilters.course);
    }

    return filteredRecords.map(record => {
      const student = students.find(s => s.id === record.studentId);
      return {
        'Date': record.date,
        'Student ID': student?.studentId || 'Unknown',
        'Student Name': student?.name || 'Unknown',
        'Course': record.course,
        'Status': record.status,
        'Time In': record.timeIn || 'N/A'
      };
    });
  };

  // Attendance Summary Report
  const generateAttendanceSummaryReport = () => {
    const summary = students.map(student => {
      const studentRecords = attendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        const startDate = new Date(reportFilters.startDate);
        const endDate = new Date(reportFilters.endDate);
        return r.studentId === student.id && recordDate >= startDate && recordDate <= endDate;
      });

      const totalClasses = studentRecords.length;
      const presentCount = studentRecords.filter(r => r.status === 'Present').length;
      const lateCount = studentRecords.filter(r => r.status === 'Late').length;
      const absentCount = studentRecords.filter(r => r.status === 'Absent').length;
      const excusedCount = studentRecords.filter(r => r.status === 'Excused').length;
      const attendanceRate = totalClasses > 0 ? ((presentCount + lateCount) / totalClasses * 100).toFixed(2) : '0.00';

      return {
        'Student ID': student.studentId,
        'Student Name': student.name,
        'Total Classes': totalClasses,
        'Present': presentCount,
        'Late': lateCount,
        'Absent': absentCount,
        'Excused': excusedCount,
        'Attendance Rate (%)': attendanceRate
      };
    });

    return summary;
  };

  // Financial Reports
  const generateFinancialReport = () => {
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(reportFilters.startDate);
      const endDate = new Date(reportFilters.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    return filteredTransactions.map(transaction => {
      const student = transaction.studentId ? students.find(s => s.id === transaction.studentId) : null;
      return {
        'Date': transaction.date,
        'Type': transaction.type,
        'Category': transaction.category,
        'Amount (LKR)': transaction.amount,
        'Description': transaction.description,
        'Status': transaction.status,
        'Reference': transaction.reference || 'N/A',
        'Student': student ? `${student.name} (${student.studentId})` : 'N/A'
      };
    });
  };

  // Financial Summary Report
  const generateFinancialSummaryReport = () => {
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(reportFilters.startDate);
      const endDate = new Date(reportFilters.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate && transaction.status === 'completed';
    });

    const summary: { [key: string]: { income: number; expense: number; net: number } } = {};

    filteredTransactions.forEach(transaction => {
      if (!summary[transaction.category]) {
        summary[transaction.category] = { income: 0, expense: 0, net: 0 };
      }
      
      if (transaction.type === 'income') {
        summary[transaction.category].income += transaction.amount;
      } else {
        summary[transaction.category].expense += transaction.amount;
      }
      
      summary[transaction.category].net = summary[transaction.category].income - summary[transaction.category].expense;
    });

    return Object.entries(summary).map(([category, data]) => ({
      'Category': category,
      'Income (LKR)': data.income,
      'Expense (LKR)': data.expense,
      'Net Amount (LKR)': data.net
    }));
  };

  // Student Payment Report
  const generateStudentPaymentReport = () => {
    const paymentSummary = students.map(student => {
      const studentTransactions = transactions.filter(t => 
        t.studentId === student.id && t.type === 'income'
      );
      
      const totalPaid = studentTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const pendingAmount = studentTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastPayment = studentTransactions
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      return {
        'Student ID': student.studentId,
        'Student Name': student.name,
        'Program': student.program,
        'Level': student.level,
        'Total Paid (LKR)': totalPaid,
        'Pending Amount (LKR)': pendingAmount,
        'Last Payment Date': lastPayment ? lastPayment.date : 'No payments',
        'Total Transactions': studentTransactions.length
      };
    });

    return paymentSummary;
  };

  // Export to Excel function
  const exportToExcel = (data: Record<string, unknown>[], filename: string, sheetName: string) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getReportStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses * 100).toFixed(1) : '0';

    return { totalStudents, activeStudents, monthlyIncome, attendanceRate };
  };

  const stats = getReportStats();

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and export data for analysis</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500">{stats.activeStudents} active</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                  <Users className="w-6 h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-[#2E8B57]">{formatCurrency(stats.monthlyIncome)}</p>
                  <p className="text-xs text-gray-500">Current month</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-[#2E8B57]">{stats.attendanceRate}%</p>
                  <p className="text-xs text-gray-500">Overall average</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-[#2E8B57]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-xs text-gray-500">Active courses</p>
                </div>
                <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-[#2E8B57]" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                  className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                  className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Select value={reportFilters.course} onValueChange={(value) => setReportFilters({...reportFilters, course: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Student Status</Label>
                <Select value={reportFilters.status} onValueChange={(value) => setReportFilters({...reportFilters, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Training Level</Label>
                <Select value={reportFilters.level} onValueChange={(value) => setReportFilters({...reportFilters, level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="student" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="student">Student Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student List Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Student List Report
                  </CardTitle>
                  <CardDescription>Complete student information with enrollment details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• Student personal information</p>
                      <p>• Program details and GPA</p>
                      <p>• Enrollment status and dates</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateStudentReport(), 'Student_List_Report', 'Students')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Payment Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Student Payment Report
                  </CardTitle>
                  <CardDescription>Payment history and outstanding amounts by student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• Total payments by student</p>
                      <p>• Pending payment amounts</p>
                      <p>• Payment transaction history</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateStudentPaymentReport(), 'Student_Payment_Report', 'Payments')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detailed Attendance Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Detailed Attendance Report
                  </CardTitle>
                  <CardDescription>Daily attendance records with timestamps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• Daily attendance by student and course</p>
                      <p>• Time-in records for present students</p>
                      <p>• Attendance status tracking</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateAttendanceReport(), 'Detailed_Attendance_Report', 'Attendance')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Summary Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Attendance Summary Report
                  </CardTitle>
                  <CardDescription>Attendance statistics and rates by student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• Attendance rates by student</p>
                      <p>• Present, absent, and late counts</p>
                      <p>• Overall attendance statistics</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateAttendanceSummaryReport(), 'Attendance_Summary_Report', 'Summary')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Transactions Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Financial Transactions Report
                  </CardTitle>
                  <CardDescription>Detailed transaction history with categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• All income and expense transactions</p>
                      <p>• Transaction categories and references</p>
                      <p>• Student-linked payment records</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateFinancialReport(), 'Financial_Transactions_Report', 'Transactions')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Financial Summary Report
                  </CardTitle>
                  <CardDescription>Income, expense, and profit summary by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>• Income and expense by category</p>
                      <p>• Net profit/loss calculations</p>
                      <p>• Financial performance overview</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => exportToExcel(generateFinancialSummaryReport(), 'Financial_Summary_Report', 'Summary')}
                        className="flex-1 bg-[#2E8B57] hover:bg-[#236446] text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Visual analytics and key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Enrollment by Level */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Enrollment by Training Level</h3>
                    <div className="space-y-2">
                      {['Basic', 'Intermediate', 'Advanced', 'Certification'].map(level => {
                        const count = students.filter(s => s.level === level).length;
                        const percentage = students.length > 0 ? (count / students.length * 100).toFixed(1) : '0';
                        return (
                          <div key={level} className="flex justify-between text-sm">
                            <span>{level}:</span>
                            <span className="text-[#2E8B57] font-medium">{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Program Distribution */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Students by Program</h3>
                    <div className="space-y-2">
                      {Array.from(new Set(students.map(s => s.program))).map(program => {
                        const count = students.filter(s => s.program === program).length;
                        const percentage = students.length > 0 ? (count / students.length * 100).toFixed(1) : '0';
                        return (
                          <div key={program} className="flex justify-between text-sm">
                            <span className="text-xs">{program}:</span>
                            <span className="text-[#2E8B57] font-medium">{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attendance Analytics */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Attendance Overview</h3>
                    <div className="space-y-2">
                      {['Present', 'Absent', 'Late', 'Excused'].map(status => {
                        const count = attendanceRecords.filter(r => r.status === status).length;
                        const percentage = attendanceRecords.length > 0 ? (count / attendanceRecords.length * 100).toFixed(1) : '0';
                        const statusColor = status === 'Present' ? 'text-[#2E8B57]' : status === 'Absent' ? 'text-red-600' : status === 'Late' ? 'text-yellow-600' : 'text-blue-600';
                        return (
                          <div key={status} className="flex justify-between text-sm">
                            <span>{status}:</span>
                            <span className={`font-medium ${statusColor}`}>{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Analytics */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Financial Overview</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Income:</span>
                        <span className="text-[#2E8B57] font-medium">
                          {formatCurrency(transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="text-red-600 font-medium">
                          {formatCurrency(transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Net Profit:</span>
                        <span className={transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0) >= 0 ? 'text-[#2E8B57]' : 'text-red-600'}>
                          {formatCurrency(transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Analytics */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Course Attendance</h3>
                    <div className="space-y-2">
                      {courses.map(course => {
                        const courseRecords = attendanceRecords.filter(r => r.course === course.id);
                        const presentCount = courseRecords.filter(r => r.status === 'Present').length;
                        const attendanceRate = courseRecords.length > 0 ? (presentCount / courseRecords.length * 100).toFixed(1) : '0';
                        return (
                          <div key={course.id} className="flex justify-between text-sm">
                            <span className="text-xs">{course.code}:</span>
                            <span className="text-[#2E8B57] font-medium">{attendanceRate}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Student Status Analytics */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Student Status</h3>
                    <div className="space-y-2">
                      {['Active', 'Inactive', 'Suspended'].map(status => {
                        const count = students.filter(s => s.status === status).length;
                        const percentage = students.length > 0 ? (count / students.length * 100).toFixed(1) : '0';
                        const statusColor = status === 'Active' ? 'text-[#2E8B57]' : status === 'Inactive' ? 'text-gray-600' : 'text-red-600';
                        return (
                          <div key={status} className="flex justify-between text-sm">
                            <span>{status}:</span>
                            <span className={`font-medium ${statusColor}`}>{count} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Export All Analytics */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Export All Analytics Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => {
                        const workbook = XLSX.utils.book_new();
                        
                        // Add multiple sheets
                        const studentsSheet = XLSX.utils.json_to_sheet(generateStudentReport());
                        const attendanceSheet = XLSX.utils.json_to_sheet(generateAttendanceReport());
                        const financialSheet = XLSX.utils.json_to_sheet(generateFinancialReport());
                        const paymentsSheet = XLSX.utils.json_to_sheet(generateStudentPaymentReport());
                        
                        XLSX.utils.book_append_sheet(workbook, studentsSheet, 'Students');
                        XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
                        XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial');
                        XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');
                        
                        XLSX.writeFile(workbook, `Complete_Nursing_Academy_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
                      }}
                      className="w-full bg-[#2E8B57] hover:bg-[#236446] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Complete Report (All Data)
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        const analyticsData = [
                          {
                            'Report Type': 'Total Students',
                            'Value': stats.totalStudents,
                            'Details': `${stats.activeStudents} active students`
                          },
                          {
                            'Report Type': 'Monthly Income',
                            'Value': stats.monthlyIncome,
                            'Details': 'Current month completed transactions'
                          },
                          {
                            'Report Type': 'Overall Attendance Rate',
                            'Value': `${stats.attendanceRate}%`,
                            'Details': 'Based on all recorded attendance'
                          },
                          {
                            'Report Type': 'Total Courses',
                            'Value': courses.length,
                            'Details': 'Active nursing courses offered'
                          }
                        ];
                        
                        exportToExcel(analyticsData, 'Analytics_Summary', 'Analytics');
                      }}
                      variant="outline"
                      className="w-full border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Export Analytics Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Report Actions</CardTitle>
            <CardDescription>Generate commonly requested reports with one click</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  const today = new Date();
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  const monthlyAttendance = attendanceRecords.filter(r => {
                    const recordDate = new Date(r.date);
                    return recordDate >= monthStart && recordDate <= today;
                  }).map(record => {
                    const student = students.find(s => s.id === record.studentId);
                    return {
                      'Date': record.date,
                      'Student': student?.name || 'Unknown',
                      'Course': record.course,
                      'Status': record.status,
                      'Time In': record.timeIn || 'N/A'
                    };
                  });
                  exportToExcel(monthlyAttendance, 'Current_Month_Attendance', 'Monthly_Attendance');
                }}
                className="h-auto p-4 flex flex-col items-start border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span className="font-medium">Current Month Attendance</span>
                <span className="text-xs text-gray-500">This month&apos;s attendance records</span>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  const activeStudents = students.filter(s => s.status === 'Active');
                  const activeStudentReport = activeStudents.map(student => ({
                    'Student ID': student.studentId,
                    'Name': student.name,
                    'Email': student.email,
                    'Program': student.program,
                    'Level': student.level,
                    'GPA': student.gpa,
                    'Enrollment Date': student.enrollmentDate
                  }));
                  exportToExcel(activeStudentReport, 'Active_Students_Report', 'Active_Students');
                }}
                className="h-auto p-4 flex flex-col items-start border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="font-medium">Active Students</span>
                <span className="text-xs text-gray-500">Currently enrolled students</span>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  const today = new Date();
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                  const monthlyFinancials = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= monthStart && transactionDate <= today && t.status === 'completed';
                  }).map(transaction => {
                    const student = transaction.studentId ? students.find(s => s.id === transaction.studentId) : null;
                    return {
                      'Date': transaction.date,
                      'Type': transaction.type,
                      'Category': transaction.category,
                      'Amount (LKR)': transaction.amount,
                      'Description': transaction.description,
                      'Student': student ? student.name : 'N/A'
                    };
                  });
                  exportToExcel(monthlyFinancials, 'Current_Month_Financials', 'Monthly_Financials');
                }}
                className="h-auto p-4 flex flex-col items-start border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
              >
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="font-medium">Monthly Financials</span>
                <span className="text-xs text-gray-500">This month&apos;s transactions</span>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => {
                  const pendingPayments = transactions.filter(t => 
                    t.type === 'income' && t.status === 'pending'
                  ).map(transaction => {
                    const student = transaction.studentId ? students.find(s => s.id === transaction.studentId) : null;
                    return {
                      'Date': transaction.date,
                      'Student': student ? student.name : 'N/A',
                      'Student ID': student ? student.studentId : 'N/A',
                      'Category': transaction.category,
                      'Amount (LKR)': transaction.amount,
                      'Description': transaction.description,
                      'Reference': transaction.reference || 'N/A'
                    };
                  });
                  exportToExcel(pendingPayments, 'Pending_Payments_Report', 'Pending_Payments');
                }}
                className="h-auto p-4 flex flex-col items-start border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10"
              >
                <Clock className="w-6 h-6 mb-2" />
                <span className="font-medium">Pending Payments</span>
                <span className="text-xs text-gray-500">Outstanding payment records</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsManagement;