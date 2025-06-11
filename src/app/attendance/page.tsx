"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertCircle
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  major: string;
  year: string;
  avatar: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  course: string;
  timeIn?: string;
  notes?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  schedule: string;
}

const AttendanceManagement = () => {
  // Sample data
  const [students] = useState<Student[]>([
    {
      id: 1,
      name: "Kasun Perera",
      email: "kasun.perera@email.com",
      studentId: "STU001",
      major: "Computer Science",
      year: "Senior",
      avatar: "",
      status: "Active"
    },
    {
      id: 2,
      name: "Nimali Fernando",
      email: "nimali.fernando@email.com",
      studentId: "STU002",
      major: "Business Administration",
      year: "Junior",
      avatar: "",
      status: "Active"
    },
    {
      id: 3,
      name: "Tharushi Jayasinghe",
      email: "tharushi.jayasinghe@email.com",
      studentId: "STU003",
      major: "Psychology",
      year: "Graduate",
      avatar: "",
      status: "Active"
    },
    {
      id: 4,
      name: "Ruwan Silva",
      email: "ruwan.silva@email.com",
      studentId: "STU004",
      major: "Computer Science",
      year: "Junior",
      avatar: "",
      status: "Active"
    },
    {
      id: 5,
      name: "Dilani Wickramasinghe",
      email: "dilani.wickramasinghe@email.com",
      studentId: "STU005",
      major: "Engineering",
      year: "Senior",
      avatar: "",
      status: "Active"
    }
  ]);

  const [courses] = useState<Course[]>([
    { id: "CS101", name: "Data Structures", code: "CS101", schedule: "Mon, Wed 9:00 AM" },
    { id: "CS102", name: "Machine Learning", code: "CS102", schedule: "Tue, Thu 2:00 PM" },
    { id: "BUS201", name: "Marketing", code: "BUS201", schedule: "Mon, Fri 11:00 AM" },
    { id: "PSY301", name: "Cognitive Psychology", code: "PSY301", schedule: "Wed, Fri 1:00 PM" },
    { id: "ENG401", name: "Software Engineering", code: "ENG401", schedule: "Tue, Thu 10:00 AM" }
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, studentId: 1, date: "2025-06-08", status: "Present", course: "CS101", timeIn: "09:05" },
    { id: 2, studentId: 2, date: "2025-06-08", status: "Present", course: "CS101", timeIn: "09:00" },
    { id: 3, studentId: 3, date: "2025-06-08", status: "Absent", course: "CS101" },
    { id: 4, studentId: 1, date: "2025-06-07", status: "Late", course: "CS102", timeIn: "14:15" },
    { id: 5, studentId: 4, date: "2025-06-08", status: "Present", course: "CS101", timeIn: "08:58" }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourse, setSelectedCourse] = useState<string>("CS101");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("mark");

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

//   const getTodayRecords = () => {
//     const dateStr = formatDate(selectedDate);
//     return attendanceRecords.filter(record => 
//       record.date === dateStr && record.course === selectedCourse
//     );
//   };

  const getStudentAttendance = (studentId: number) => {
    const dateStr = formatDate(selectedDate);
    return attendanceRecords.find(record => 
      record.studentId === studentId && 
      record.date === dateStr && 
      record.course === selectedCourse
    );
  };

  const markAttendance = (studentId: number, status: 'Present' | 'Absent' | 'Late' | 'Excused', timeIn?: string) => {
    const dateStr = formatDate(selectedDate);
    const existingRecord = attendanceRecords.find(record => 
      record.studentId === studentId && 
      record.date === dateStr && 
      record.course === selectedCourse
    );

    if (existingRecord) {
      setAttendanceRecords(prev => prev.map(record => 
        record.id === existingRecord.id 
          ? { ...record, status, timeIn: timeIn || record.timeIn }
          : record
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: Math.max(...attendanceRecords.map(r => r.id), 0) + 1,
        studentId,
        date: dateStr,
        status,
        course: selectedCourse,
        timeIn: status === 'Present' || status === 'Late' ? timeIn || new Date().toTimeString().slice(0, 5) : undefined
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Late': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Excused': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStats = () => {
    const today = formatDate(selectedDate);
    const todayRecords = attendanceRecords.filter(r => r.date === today && r.course === selectedCourse);
    const totalStudents = students.length;
    const present = todayRecords.filter(r => r.status === 'Present').length;
    const absent = todayRecords.filter(r => r.status === 'Absent').length;
    const late = todayRecords.filter(r => r.status === 'Late').length;
    const excused = todayRecords.filter(r => r.status === 'Excused').length;
    const notMarked = totalStudents - todayRecords.length;

    return { totalStudents, present, absent, late, excused, notMarked };
  };

  const stats = getAttendanceStats();

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance for all courses</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Excused</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Marked</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.notMarked}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center space-x-2">
                  <Label>Date:</Label>
                  <Input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="w-40"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label>Course:</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view">View Records</TabsTrigger>
          </TabsList>

          <TabsContent value="mark" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>
                      {courses.find(c => c.id === selectedCourse)?.name} - {selectedDate.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map(student => {
                    const attendance = getStudentAttendance(student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.studentId} • {student.major}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {attendance && (
                            <div className="flex items-center space-x-2 mr-4">
                              {getStatusIcon(attendance.status)}
                              <Badge className={getStatusColor(attendance.status)}>
                                {attendance.status}
                              </Badge>
                              {attendance.timeIn && (
                                <span className="text-sm text-gray-500">{attendance.timeIn}</span>
                              )}
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            variant={attendance?.status === 'Present' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'Present')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance?.status === 'Late' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'Late')}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance?.status === 'Absent' ? 'destructive' : 'outline'}
                            onClick={() => markAttendance(student.id, 'Absent')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={attendance?.status === 'Excused' ? 'default' : 'outline'}
                            onClick={() => markAttendance(student.id, 'Excused')}
                          >
                            Excused
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="space-y-4">
            <AttendanceRecordsView 
              students={students}
              attendanceRecords={attendanceRecords}
              courses={courses}
              selectedDate={selectedDate}
              selectedCourse={selectedCourse}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Attendance Records View Component
interface AttendanceRecordsViewProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  courses: Course[];
  selectedDate: Date;
  selectedCourse: string;
}

const AttendanceRecordsView: React.FC<AttendanceRecordsViewProps> = ({
  students,
  attendanceRecords,
  courses,
  selectedDate,
  selectedCourse
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const todayRecords = attendanceRecords.filter(record => 
    record.date === formatDate(selectedDate) && record.course === selectedCourse
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>
          {courses.find(c => c.id === selectedCourse)?.name} - {selectedDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for this date and course.
            </div>
          ) : (
            todayRecords.map(record => {
              const student = students.find(s => s.id === record.studentId);
              if (!student) return null;
              
              return (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                    {record.timeIn && (
                      <span className="text-sm text-gray-500">
                        Time In: {record.timeIn}
                      </span>
                    )}
                    {record.notes && (
                      <span className="text-sm text-gray-500">
                        Notes: {record.notes}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;