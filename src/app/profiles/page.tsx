"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit, Plus, Search, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Student,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStatistics,
  getErrorMessage,
  formatStudentForSubmission
} from '@/services/studentService';
import { getCourses } from '@/services/courseService';

interface Branch {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  branch: string | { _id: string; name: string };
  modules: string[];
}

interface CurrentUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'superAdmin' | 'admin' | 'moderator' | 'staff';
  branch?: {
    id: string;
    name: string;
  };
}

const StudentProfileManagement = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    graduatedStudents: 0,
    averageGPA: 0
  });
  // Check authentication and get user info
  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (courseFilter && courseFilter !== 'all') params.courseId = courseFilter;

      const response = await getStudents(params);
      setStudents(response.students);
    } catch (error: unknown) {
      const errorObj = error as { status?: number };
      if (errorObj.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth');
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  }, [searchTerm, statusFilter, courseFilter, router]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchBranches(),
        fetchCourses(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setCurrentUser(user);
    }

    fetchData();
  }, [fetchData, router]);



  // Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.courses);
      setFilteredCourses(response.courses);
    } catch (error: unknown) {
      console.error('Error fetching courses:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await getStudentStatistics();
      setStatistics(stats);
    } catch (error: unknown) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Filter courses based on selected branch
  useEffect(() => {
    if (!selectedBranch || selectedBranch === 'all') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => {
        if (typeof course.branch === 'string') {
          return course.branch === 'all' || course.branch === selectedBranch;
        } else {
          return course.branch._id === selectedBranch;
        }
      });
      setFilteredCourses(filtered);
    }
  }, [selectedBranch, courses]);

  // Handle search and filters
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, courseFilter, fetchStudents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  // Handle add student
  const handleAddStudent = async (formData: Record<string, unknown>) => {
    try {
      const studentData = formatStudentForSubmission(formData);
      if (selectedBranch && selectedBranch !== 'all' && currentUser?.role !== 'superAdmin') {
        studentData.branch = selectedBranch;
      }

      await createStudent(studentData);
      toast.success('Student added successfully');
      setIsAddDialogOpen(false);
      fetchStudents();
      fetchStatistics();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  // Handle edit student
  const handleEditStudent = async (formData: Record<string, unknown>) => {
    if (!selectedStudent) return;

    try {
      const studentData = formatStudentForSubmission(formData);
      await updateStudent(selectedStudent._id, studentData);
      toast.success('Student updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchStatistics();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await deleteStudent(studentId);
      toast.success('Student deleted successfully');
      setSelectedStudent(null);
      fetchStudents();
      fetchStatistics();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  // Check if user can add/edit students
  const canAddEdit = currentUser?.role === 'superAdmin' ||
                     currentUser?.role === 'admin' ||
                     currentUser?.role === 'moderator';



  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[#2E8B57]/20 text-[#2E8B57] border-[#2E8B57]/30';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Graduated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dropped': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile Management</h1>
          <p className="text-gray-600 mt-1">Manage student profiles and enrollment</p>
        </div>
        {canAddEdit && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#2E8B57] hover:bg-[#236446] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}</p>
              </div>
              <User className="w-8 h-8 text-[#2E8B57]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeStudents}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graduated</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.graduatedStudents}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average GPA</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.averageGPA.toFixed(2)}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Selection for SuperAdmin */}
      {currentUser?.role === 'superAdmin' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="branch-select" className="text-sm font-medium">Select Branch:</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.filter(branch => branch._id && branch.name).map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {filteredCourses.filter(course => course._id && course.title).map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Student List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No students found</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStudent?._id === student._id
                            ? 'bg-[#2E8B57]/10 border border-[#2E8B57]/30'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#2E8B57]/10 text-[#2E8B57]">
                              {getInitials(student.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.studentId} • {student.course.title}
                            </p>
                            <Badge className={`text-xs mt-1 ${getStatusColor(student.status)}`}>
                              {student.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <StudentDetails
              student={selectedStudent}
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={() => handleDeleteStudent(selectedStudent._id)}
              canEdit={canAddEdit}
              canDelete={canAddEdit}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
                  <p className="text-gray-500">Select a student from the list to view their profile</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the student&apos;s information to create a new profile.
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            onSubmit={handleAddStudent}
            onCancel={() => setIsAddDialogOpen(false)}
            branches={branches}
            courses={filteredCourses}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            currentUser={currentUser}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Update the student&apos;s information below.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm
              student={selectedStudent}
              onSubmit={handleEditStudent}
              onCancel={() => setIsEditDialogOpen(false)}
              branches={branches}
              courses={filteredCourses}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              currentUser={currentUser}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
// Student Details Component
interface StudentDetailsProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onEdit, onDelete, canEdit, canDelete }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg bg-[#2E8B57]/10 text-[#2E8B57]">
                {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{student.fullName}</CardTitle>
              <CardDescription>{student.studentId} • {student.course.title}</CardDescription>
              <Badge className={`mt-2 ${getStatusColor(student.status)}`}>
                {student.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <Button onClick={onEdit} variant="outline" className="border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button onClick={onDelete} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{student.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm text-gray-600">{student.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm text-gray-600">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Course</Label>
                <p className="text-sm text-gray-600">{student.course.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Branch</Label>
                <p className="text-sm text-gray-600">{student.branch.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Level</Label>
                <p className="text-sm text-gray-600">{student.level}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">GPA</Label>
                <p className="text-sm text-gray-600">{student.gpa.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Enrollment Date</Label>
                <p className="text-sm text-gray-600">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={`${getStatusColor(student.status)}`}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Enrolled Modules</Label>
              {student.modules.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.modules.map((module, index) => (
                    <Badge key={`module-${index}-${module}`} variant="secondary" className="bg-[#2E8B57]/10 text-[#2E8B57]">
                      {module}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No modules assigned</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Certifications</Label>
              {student.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.certifications.map((cert, index) => (
                    <Badge key={`cert-${index}-${cert}`} variant="secondary" className="bg-blue-100 text-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No certifications</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
// Student Form Component
interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  branches: Branch[];
  courses: Course[];
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  currentUser: CurrentUser | null;
  isEditing?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  branches,
  courses,
  selectedBranch,
  setSelectedBranch,
  currentUser,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    fullName: student?.fullName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    address: student?.address || '',
    dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
    course: student?.course._id || '',
    modules: student?.modules.join(', ') || '',
    status: student?.status || 'Active',
    enrollmentDate: student?.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
    gpa: student?.gpa?.toString() || '0',
    level: student?.level || 'Beginner',
    certifications: student?.certifications.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>

        {/* Branch Selection (SuperAdmin only) */}
        {currentUser?.role === 'superAdmin' && (
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.filter(branch => branch._id && branch.name).map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="course">Course</Label>
          <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.filter(course => course._id && course.title).map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.1"
            min="0"
            max="4"
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Graduated">Graduated</SelectItem>
              <SelectItem value="Dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="enrollmentDate">Enrollment Date</Label>
          <Input
            id="enrollmentDate"
            type="date"
            value={formData.enrollmentDate}
            onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
          className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
          required
        />
      </div>

      <div>
        <Label htmlFor="modules">Modules (comma-separated)</Label>
        <Textarea
          id="modules"
          value={formData.modules}
          onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
          rows={2}
          className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
          placeholder="e.g., Basic Patient Care, Vital Signs Monitoring, Infection Control"
        />
      </div>

      <div>
        <Label htmlFor="certifications">Certifications (comma-separated)</Label>
        <Textarea
          id="certifications"
          value={formData.certifications}
          onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
          rows={2}
          className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
          placeholder="e.g., CPR Certified, First Aid Certified, HIPAA Training"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#2E8B57] hover:bg-[#236446] text-white">
          {isEditing ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentProfileManagement;