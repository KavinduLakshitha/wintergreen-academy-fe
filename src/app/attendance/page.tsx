"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  X, 
  Clock, 
  Users, 
  Search, 
  Download,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { 
  getCourseStudents, 
  markAttendance, 
  bulkMarkAttendance, 
  getAttendanceRecords, 
  getAttendanceStats,
  exportAttendanceRecords,
  updateAttendance,
  type StudentWithAttendance,
  type AttendanceRecord,
  type AttendanceStats
} from '@/services/attendanceService';
import { getCourses, type Course } from '@/services/courseService';
import { getBranches, type Branch } from '@/services/branchService';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'moderator' | 'staff';
  branch: {
    id: string;
    name: string;
  } | null;
}

const AttendanceManagement = () => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("mark");
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User not found. Please login again.');
        return;
      }
      
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Load initial data
      await Promise.all([
        loadCourses(userData),
        loadBranches(userData)
      ]);
      
    } catch (error) {
      console.error('Error initializing component:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize component');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (userData: User) => {
    try {
      const result = await getCourses({
        limit: 100,
        branchId: userData.role === 'superAdmin' ? undefined : userData.branch?.id
      });
      
      if (result?.courses) {
        setCourses(result.courses);
        // Auto-select first course if available
        if (result.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(result.courses[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    }
  };

  const loadBranches = async (userData: User) => {
    try {
      if (userData.role === 'superAdmin') {
        const result = await getBranches({ limit: 100 });
        if (result?.branches) {
          setBranches(result.branches);
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error);
      setError('Failed to load branches');
    }
  };

  // Load students when course or date changes
  useEffect(() => {
    if (selectedCourse && user) {
      loadStudents();
    }
  }, [selectedCourse, selectedDate, user]);

  const loadStudents = async () => {
    if (!selectedCourse) return;
    
    try {
      setStudentsLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      const result = await getCourseStudents(selectedCourse, dateStr);
      
      if (result) {
        setStudents(result.students);
        // Load attendance stats
        await loadAttendanceStats();
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError(error instanceof Error ? error.message : 'Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadAttendanceStats = async () => {
    if (!selectedCourse || !user) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const branchId = user.role === 'superAdmin' ? (selectedBranch === 'all' ? undefined : selectedBranch) : user.branch?.id;

      const result = await getAttendanceStats(selectedCourse, dateStr, branchId);
      if (result) {
        setAttendanceStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle attendance marking
  const handleMarkAttendance = async (
    studentId: string, 
    status: 'Present' | 'Absent' | 'Late' | 'Excused', 
    timeIn?: string
  ) => {
    if (!selectedCourse || !user) return;
    
    try {
      setSavingAttendance(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      await markAttendance({
        student: studentId,
        course: selectedCourse,
        date: dateStr,
        status,
        timeIn,
      });

      // Update local state
      setStudents(prev => prev.map(student => 
        student._id === studentId 
          ? { 
              ...student, 
              attendance: { 
                status, 
                timeIn: status === 'Present' || status === 'Late' ? timeIn || new Date().toTimeString().slice(0, 5) : undefined 
              } 
            }
          : student
      ));

      // Reload stats
      await loadAttendanceStats();
      setSuccess('Attendance marked successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error instanceof Error ? error.message : 'Failed to mark attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Handle bulk save attendance
  const handleBulkSaveAttendance = async () => {
    if (!selectedCourse || !user) return;
    
    try {
      setSavingAttendance(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceData = students
        .filter(student => student.attendance)
        .map(student => ({
          student: student._id,
          course: selectedCourse,
          date: dateStr,
          status: student.attendance!.status,
          timeIn: student.attendance!.timeIn,
          notes: student.attendance!.notes
        }));

      if (attendanceData.length === 0) {
        setError('No attendance records to save');
        return;
      }

      await bulkMarkAttendance(attendanceData);
      await loadAttendanceStats();
      setSuccess(`Saved attendance for ${attendanceData.length} students`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
      setError(error instanceof Error ? error.message : 'Failed to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!selectedCourse || !user) return;

    try {
      setExportingData(true);
      setError(null);

      const filters = {
        courseId: selectedCourse,
        branchId: user.role === 'superAdmin' ? (selectedBranch === 'all' ? undefined : selectedBranch) : user.branch?.id,
        dateFrom: selectedDate.toISOString().split('T')[0],
        dateTo: selectedDate.toISOString().split('T')[0]
      };

      await exportAttendanceRecords(filters);
      setSuccess('Attendance records exported successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error('Error exporting attendance:', error);
      setError(error instanceof Error ? error.message : 'Failed to export attendance records');
    } finally {
      setExportingData(false);
    }
  };

  // Utility functions
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Late': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Excused': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check user permissions
  const canMarkAttendance = () => {
    return user?.role && ['superAdmin', 'admin', 'moderator'].includes(user.role);
  };

  const canEditAttendance = () => {
    return user?.role && ['superAdmin', 'admin'].includes(user.role);
  };

  const canViewOnly = () => {
    return user?.role === 'staff';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading attendance management...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            User not found. Please login again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and manage student attendance for courses
          </p>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>

            {/* Branch Filter (SuperAdmin only) */}
            {user.role === 'superAdmin' && (
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Course Filter */}
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={!selectedCourse || exportingData}
                className="w-full"
              >
                {exportingData ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Statistics */}
      {attendanceStats && selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance Statistics - {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{attendanceStats.totalEnrolled}</div>
                <div className="text-sm text-muted-foreground">Total Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{attendanceStats.Present}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{attendanceStats.Absent}</div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{attendanceStats.Late}</div>
                <div className="text-sm text-muted-foreground">Late</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{attendanceStats.Excused}</div>
                <div className="text-sm text-muted-foreground">Excused</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{attendanceStats.notMarked}</div>
                <div className="text-sm text-muted-foreground">Not Marked</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="view">View Records</TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="space-y-4">
          {!selectedCourse ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Please select a course to mark attendance</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>
                      {courses.find(c => c._id === selectedCourse)?.title} - {selectedDate.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    {canMarkAttendance() && (
                      <Button
                        onClick={handleBulkSaveAttendance}
                        disabled={savingAttendance || students.filter(s => s.attendance).length === 0}
                      >
                        {savingAttendance ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save All
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Loading students...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No students found for this course</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.map(student => (
                      <div key={student._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {student.studentId} • {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {student.attendance && (
                            <div className="flex items-center space-x-2 mr-4">
                              {getStatusIcon(student.attendance.status)}
                              <Badge className={getStatusColor(student.attendance.status)}>
                                {student.attendance.status}
                              </Badge>
                              {student.attendance.timeIn && (
                                <span className="text-sm text-gray-500">{student.attendance.timeIn}</span>
                              )}
                            </div>
                          )}

                          {canMarkAttendance() && (
                            <React.Fragment key={`attendance-buttons-${student._id}`}>
                              <Button
                                key={`present-${student._id}`}
                                size="sm"
                                variant={student.attendance?.status === 'Present' ? 'default' : 'outline'}
                                onClick={() => handleMarkAttendance(student._id, 'Present')}
                                disabled={savingAttendance}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                key={`late-${student._id}`}
                                size="sm"
                                variant={student.attendance?.status === 'Late' ? 'default' : 'outline'}
                                onClick={() => handleMarkAttendance(student._id, 'Late')}
                                disabled={savingAttendance}
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Late
                              </Button>
                              <Button
                                key={`absent-${student._id}`}
                                size="sm"
                                variant={student.attendance?.status === 'Absent' ? 'destructive' : 'outline'}
                                onClick={() => handleMarkAttendance(student._id, 'Absent')}
                                disabled={savingAttendance}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Absent
                              </Button>
                              <Button
                                key={`excused-${student._id}`}
                                size="sm"
                                variant={student.attendance?.status === 'Excused' ? 'default' : 'outline'}
                                onClick={() => handleMarkAttendance(student._id, 'Excused')}
                                disabled={savingAttendance}
                              >
                                Excused
                              </Button>
                            </React.Fragment>
                          )}

                          {canViewOnly() && (
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">View Only</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* View Records Tab */}
        <TabsContent value="view" className="space-y-4">
          <AttendanceRecordsView
            user={user}
            selectedCourse={selectedCourse}
            selectedBranch={selectedBranch}
            selectedDate={selectedDate}
            courses={courses}
            branches={branches}
            canEdit={canEditAttendance()}
            onRecordUpdate={loadAttendanceStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Attendance Records View Component
interface AttendanceRecordsViewProps {
  user: User;
  selectedCourse: string;
  selectedBranch: string;
  selectedDate: Date;
  courses: Course[];
  branches: Branch[];
  canEdit: boolean;
  onRecordUpdate: () => void;
}

const AttendanceRecordsView: React.FC<AttendanceRecordsViewProps> = ({
  user,
  selectedCourse,
  selectedBranch,
  selectedDate,
  courses,
  branches,
  canEdit,
  onRecordUpdate
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load attendance records
  useEffect(() => {
    if (selectedCourse) {
      loadRecords();
    }
  }, [selectedCourse, selectedBranch, selectedDate]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        courseId: selectedCourse,
        branchId: user.role === 'superAdmin' ? (selectedBranch === 'all' ? undefined : selectedBranch) : user.branch?.id,
        date: selectedDate.toISOString().split('T')[0],
        limit: 100
      };

      const result = await getAttendanceRecords(filters);
      if (result) {
        setRecords(result.attendanceRecords);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
      setError(error instanceof Error ? error.message : 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (recordId: string, updateData: any) => {
    try {
      await updateAttendance(recordId, updateData);
      await loadRecords();
      onRecordUpdate();
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance record:', error);
      setError(error instanceof Error ? error.message : 'Failed to update attendance record');
    }
  };

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedCourse) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Please select a course to view attendance records</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>
          {courses.find(c => c._id === selectedCourse)?.title} - {selectedDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading attendance records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No attendance records found for this date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map(record => (
              <div key={record._id} className="border rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(record._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{record.student.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {record.student.studentId} • {record.course.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    {record.timeIn && (
                      <span className="text-sm text-gray-500">{record.timeIn}</span>
                    )}
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRecord(record._id);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {expandedRecords.has(record._id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {expandedRecords.has(record._id) && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="text-sm font-medium">Branch</Label>
                        <p className="text-sm">{record.branch.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date</Label>
                        <p className="text-sm">{record.formattedDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Marked By</Label>
                        <p className="text-sm">{record.markedBy.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Time In</Label>
                        <p className="text-sm">{record.formattedTime}</p>
                      </div>
                      {record.notes && (
                        <div className="col-span-2">
                          <Label className="text-sm font-medium">Notes</Label>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;
