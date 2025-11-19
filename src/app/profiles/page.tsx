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
import { Checkbox } from '@/components/ui/checkbox';
import FileUpload from '@/components/FileUpload';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit, Plus, Search, Loader2, Trash2, UserPlus } from 'lucide-react';
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
import ConvertToNurseAideDialog from '@/components/ConvertToNurseAideDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Utility function for status colors
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

interface Branch {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  branch: 'all' | { _id: string; name: string } | null;
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [studentToConvert, setStudentToConvert] = useState<Student | null>(null);

  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    graduatedStudents: 0
  });
  // Check authentication and get user info
  // Create a stable search function that doesn't cause re-renders
  const performSearch = useCallback(async (searchValue: string, statusValue: string, courseValue: string, branchValue: string) => {
    try {
      const params: Record<string, string> = {};

      if (searchValue) params.search = searchValue;
      if (statusValue && statusValue !== 'all') params.status = statusValue;
      if (courseValue && courseValue !== 'all') params.courseId = courseValue;
      // Add branch filtering for SuperAdmin
      if (currentUser?.role === 'superAdmin' && branchValue && branchValue !== 'all') {
        params.branchId = branchValue;
      }

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
  }, [currentUser?.role, router]);

  // Fetch students - wrapper function for initial load
  const fetchStudents = useCallback(async () => {
    await performSearch('', statusFilter, courseFilter, selectedBranch);
  }, [performSearch, statusFilter, courseFilter, selectedBranch]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(), // Initial load without search parameters
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branches/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // The branches/active endpoint returns an array directly
        const branchesArray = Array.isArray(data) ? data.map(branch => ({ _id: branch.id, name: branch.name })) : [];
        setBranches(branchesArray);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch branches:', response.status, response.statusText, errorText);
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
        // Check for 'all' branch courses (should always be included)
        if (course.branch && typeof course.branch === 'object' && course.branch._id === 'all') {
          return true;
        }
        // Check for branch-specific courses
        if (course.branch && typeof course.branch === 'object') {
          return course.branch._id === selectedBranch;
        }
        // Fallback for string-based branch (legacy support)
        if (typeof course.branch === 'string') {
          return course.branch === 'all' || course.branch === selectedBranch;
        }
        return false;
      });
      setFilteredCourses(filtered);
    }
  }, [selectedBranch, courses]);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search and filters when debounced search term or filters change
  useEffect(() => {
    performSearch(debouncedSearchTerm, statusFilter, courseFilter, selectedBranch);
  }, [debouncedSearchTerm, statusFilter, courseFilter, selectedBranch, performSearch]);

  // Remove client-side filtering since server-side filtering is already implemented
  // This prevents double filtering and potential conflicts
  const filteredStudents = students;

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  // Handle add student
  const handleAddStudent = async (formData: Record<string, unknown>) => {
    try {
      const studentData = formatStudentForSubmission(formData);

      // Ensure branch is set correctly
      if (!studentData.branch) {
        if (currentUser?.role === 'superAdmin') {
          if (selectedBranch && selectedBranch !== 'all') {
            studentData.branch = selectedBranch;
          } else {
            toast.error('Please select a branch for the student');
            return;
          }
        } else {
          // For non-SuperAdmin users, use their assigned branch
          if (currentUser?.branch?.id) {
            studentData.branch = currentUser.branch.id;
          } else {
            toast.error('No branch assigned to your account');
            return;
          }
        }
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
                     currentUser?.role === 'moderator' ||
                     currentUser?.role === 'staff';

  // Handle convert to nurse aide
  const handleConvertToNurseAide = (student: Student) => {
    setStudentToConvert(student);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmConversion = () => {
    setIsConfirmDialogOpen(false);
    setIsConvertDialogOpen(true);
  };

  const handleConversionSuccess = () => {
    setIsConvertDialogOpen(false);
    setStudentToConvert(null);
    toast.success('Student converted to Nurse Aide successfully');
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Profile Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage student profiles and enrollment</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">{statistics.totalStudents}</p>
              </div>
              <User className="w-8 h-8 text-[#2E8B57] flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Students</p>
                <p className="text-lg sm:text-xl font-bold text-green-600 whitespace-nowrap">{statistics.activeStudents}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Graduated</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600 whitespace-nowrap">{statistics.graduatedStudents}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Branch Selection for SuperAdmin */}
      {currentUser?.role === 'superAdmin' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Label htmlFor="branch-select" className="text-sm font-medium">Select Branch:</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full sm:w-64">
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
                  key="student-search-input"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
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
              onConvertToNurseAide={() => handleConvertToNurseAide(selectedStudent)}
              canEdit={canAddEdit}
              canDelete={canAddEdit}
              canConvert={canAddEdit}
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
            courses={courses}
            filteredCourses={filteredCourses}
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
              courses={courses}
              filteredCourses={filteredCourses}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              currentUser={currentUser}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Convert to Nurse Aide Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert Student to Nurse Aide?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to convert <strong>{studentToConvert?.fullName}</strong> to a Nurse Aide? 
              This will create a new employee record in the HR system. You will be able to review and complete 
              the employee information in the next step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConversion}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to Nurse Aide Dialog */}
      <ConvertToNurseAideDialog
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        student={studentToConvert}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
};
// Student Details Component
interface StudentDetailsProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onConvertToNurseAide: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canConvert: boolean;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onEdit, onDelete, onConvertToNurseAide, canEdit, canDelete, canConvert }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarFallback className="text-lg bg-[#2E8B57]/10 text-[#2E8B57]">
                {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl break-words">{student.fullName}</CardTitle>
              <CardDescription className="break-words">{student.studentId} • {student.course.title}</CardDescription>
              <Badge className={`mt-2 ${getStatusColor(student.status)}`}>
                {student.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canConvert && (
              <Button 
                onClick={onConvertToNurseAide} 
                className="bg-[#2E8B57] hover:bg-[#236446] text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Convert to Nurse Aide
              </Button>
            )}
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Care Services</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${student.childBabyCare ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Child/Baby Care</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${student.elderCare ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Elder Care</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Additional Requirements</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${student.hostelRequirement ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Hostel Requirement</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${student.mealRequirement ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Meal Requirement</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Personal Documents Checklist</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${student.personalDocuments?.birthCertificate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Birth Certificate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${student.personalDocuments?.gramaNiladhariCertificate ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Grama Niladhari Certificate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${student.personalDocuments?.guardianSpouseLetter ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Guardian/Spouse Letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${student.personalDocuments?.originalCertificate?.hasDocument ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">
                    Original Certificate
                    {student.personalDocuments?.originalCertificate?.title &&
                      ` (${student.personalDocuments.originalCertificate.title})`
                    }
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Uploaded Documents</Label>
              {student.documents && student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {doc.type === 'image' && <span className="text-2xl">🖼️</span>}
                          {doc.type === 'pdf' && <span className="text-2xl">📄</span>}
                          {doc.type === 'document' && <span className="text-2xl">📝</span>}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.type.toUpperCase()} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded</p>
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
  filteredCourses: Course[];
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
  filteredCourses,
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
    branch: student?.branch?._id || (currentUser?.role === 'superAdmin' ? selectedBranch : currentUser?.branch?.id) || '',
    status: student?.status || 'Active',
    enrollmentDate: student?.enrollmentDate ? student.enrollmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
    level: student?.level || 'Beginner',
    certifications: student?.certifications.join(', ') || '',
    childBabyCare: student?.childBabyCare || false,
    elderCare: student?.elderCare || false,
    documents: student?.documents || [],
    personalDocuments: student?.personalDocuments || {
      birthCertificate: false,
      gramaNiladhariCertificate: false,
      guardianSpouseLetter: false,
      originalCertificate: {
        hasDocument: false,
        title: ''
      }
    },
    hostelRequirement: student?.hostelRequirement || false,
    mealRequirement: student?.mealRequirement || false
  });

  // State for form validation errors
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  // Update form data when branch changes for SuperAdmin
  useEffect(() => {
    if (currentUser?.role === 'superAdmin' && !isEditing) {
      setFormData(prev => ({
        ...prev,
        course: '', // Clear course selection
        branch: selectedBranch && selectedBranch !== 'all' ? selectedBranch : '' // Update branch
      }));
    }
  }, [selectedBranch, currentUser?.role, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const errors: {[key: string]: boolean} = {};
    const requiredFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'course', 'address'];

    // Add branch validation for SuperAdmin
    if (currentUser?.role === 'superAdmin') {
      if (!selectedBranch || selectedBranch === 'all') {
        errors.branch = true;
      }
    }

    requiredFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (!value || value === '') {
        errors[field] = true;
      }
    });

    setValidationErrors(errors);

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Branch and Course Selection - Top Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
        {/* Branch Selection (SuperAdmin only) */}
        {currentUser?.role === 'superAdmin' && (
          <div>
            <Label htmlFor="branch" className="text-red-500">Branch <span className="text-red-500">*</span></Label>
            <Select
              value={selectedBranch}
              onValueChange={(value) => {
                setSelectedBranch(value);
                if (validationErrors.branch) {
                  setValidationErrors({ ...validationErrors, branch: false });
                }
              }}
            >
              <SelectTrigger className={validationErrors.branch ? 'border-red-500' : ''}>
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
            {validationErrors.branch && (
              <p className="text-red-500 text-sm mt-1">Branch is required</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="course" className="text-red-500">Course <span className="text-red-500">*</span></Label>
          <Select
            value={formData.course}
            onValueChange={(value) => {
              setFormData({ ...formData, course: value });
              if (validationErrors.course) {
                setValidationErrors({ ...validationErrors, course: false });
              }
            }}
            disabled={currentUser?.role === 'superAdmin' && (!selectedBranch || selectedBranch === 'all')}
          >
            <SelectTrigger className={validationErrors.course ? 'border-red-500' : ''}>
              <SelectValue placeholder={currentUser?.role === 'superAdmin' && (!selectedBranch || selectedBranch === 'all') ? "Select branch first" : "Select course"} />
            </SelectTrigger>
            <SelectContent>
              {(currentUser?.role === 'superAdmin' ? filteredCourses : courses)
                .filter((course: Course) => course._id && course.title)
                .map((course: Course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {validationErrors.course && (
            <p className="text-red-500 text-sm mt-1">Course is required</p>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName" className="text-red-500">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value });
              // Clear validation error when user starts typing
              if (validationErrors.fullName) {
                setValidationErrors({ ...validationErrors, fullName: false });
              }
            }}
            className={`focus:ring-[#2E8B57] focus:border-[#2E8B57] ${
              validationErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">Full Name is required</p>
          )}
        </div>
        <div>
          <Label htmlFor="email" className="text-red-500">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (validationErrors.email) {
                setValidationErrors({ ...validationErrors, email: false });
              }
            }}
            className={`focus:ring-[#2E8B57] focus:border-[#2E8B57] ${
              validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">Email is required</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone" className="text-red-500">Phone <span className="text-red-500">*</span></Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (validationErrors.phone) {
                setValidationErrors({ ...validationErrors, phone: false });
              }
            }}
            className={`focus:ring-[#2E8B57] focus:border-[#2E8B57] ${
              validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1">Phone is required</p>
          )}
        </div>
        <div>
          <Label htmlFor="dateOfBirth" className="text-red-500">Date of Birth <span className="text-red-500">*</span></Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => {
              setFormData({ ...formData, dateOfBirth: e.target.value });
              if (validationErrors.dateOfBirth) {
                setValidationErrors({ ...validationErrors, dateOfBirth: false });
              }
            }}
            className={`focus:ring-[#2E8B57] focus:border-[#2E8B57] ${
              validationErrors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">Date of Birth is required</p>
          )}
        </div>



        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value as 'Beginner' | 'Intermediate' | 'Advanced' })}>
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

        {/* Care Services */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Care Services</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="childBabyCare"
              checked={formData.childBabyCare}
              onCheckedChange={(checked) => setFormData({ ...formData, childBabyCare: checked as boolean })}
            />
            <Label htmlFor="childBabyCare" className="text-sm font-normal">Child/Baby Care</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="elderCare"
              checked={formData.elderCare}
              onCheckedChange={(checked) => setFormData({ ...formData, elderCare: checked as boolean })}
            />
            <Label htmlFor="elderCare" className="text-sm font-normal">Elder Care</Label>
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'Active' | 'Inactive' | 'Suspended' | 'Graduated' | 'Dropped' })}>
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
        <Label htmlFor="address" className="text-red-500">Address <span className="text-red-500">*</span></Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => {
            setFormData({ ...formData, address: e.target.value });
            if (validationErrors.address) {
              setValidationErrors({ ...validationErrors, address: false });
            }
          }}
          rows={2}
          className={`focus:ring-[#2E8B57] focus:border-[#2E8B57] ${
            validationErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          required
        />
        {validationErrors.address && (
          <p className="text-red-500 text-sm mt-1">Address is required</p>
        )}
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

      {/* Document Upload Section */}
      <div>
        <FileUpload
          label="Upload Documents (Images/PDFs/Documents)"
          multiple={true}
          maxFiles={5}
          onFilesChange={(files) => {
            // Convert UploadedFile to StudentDocument format
            const studentDocuments = files.map(file => ({
              name: file.name,
              url: file.url,
              type: file.type,
              uploadedAt: new Date().toISOString()
            }));
            setFormData({ ...formData, documents: studentDocuments });
          }}
          initialFiles={formData.documents.map(doc => ({
            name: doc.name,
            url: doc.url,
            type: doc.type,
            publicId: '', // We'll need to store this if we want to delete files
            size: 0,
            format: doc.type
          }))}
        />
      </div>

      {/* Personal Documents Checklist */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Personal Documents Checklist</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="birthCertificate"
              checked={formData.personalDocuments.birthCertificate}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                personalDocuments: {
                  ...formData.personalDocuments,
                  birthCertificate: checked as boolean
                }
              })}
            />
            <Label htmlFor="birthCertificate" className="text-sm font-normal">Birth Certificate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gramaNiladhariCertificate"
              checked={formData.personalDocuments.gramaNiladhariCertificate}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                personalDocuments: {
                  ...formData.personalDocuments,
                  gramaNiladhariCertificate: checked as boolean
                }
              })}
            />
            <Label htmlFor="gramaNiladhariCertificate" className="text-sm font-normal">Grama Niladhari Certificate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="guardianSpouseLetter"
              checked={formData.personalDocuments.guardianSpouseLetter}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                personalDocuments: {
                  ...formData.personalDocuments,
                  guardianSpouseLetter: checked as boolean
                }
              })}
            />
            <Label htmlFor="guardianSpouseLetter" className="text-sm font-normal">Letter from Guardian/Spouse</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="originalCertificate"
                checked={formData.personalDocuments.originalCertificate.hasDocument}
                onCheckedChange={(checked) => setFormData({
                  ...formData,
                  personalDocuments: {
                    ...formData.personalDocuments,
                    originalCertificate: {
                      ...formData.personalDocuments.originalCertificate,
                      hasDocument: checked as boolean
                    }
                  }
                })}
              />
              <Label htmlFor="originalCertificate" className="text-sm font-normal">Original Certificate</Label>
            </div>
            {formData.personalDocuments.originalCertificate.hasDocument && (
              <Input
                placeholder="Enter certificate title"
                value={formData.personalDocuments.originalCertificate.title}
                onChange={(e) => setFormData({
                  ...formData,
                  personalDocuments: {
                    ...formData.personalDocuments,
                    originalCertificate: {
                      ...formData.personalDocuments.originalCertificate,
                      title: e.target.value
                    }
                  }
                })}
                className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Additional Requirements</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hostelRequirement"
              checked={formData.hostelRequirement}
              onCheckedChange={(checked) => setFormData({ ...formData, hostelRequirement: checked as boolean })}
            />
            <Label htmlFor="hostelRequirement" className="text-sm font-normal">Hostel Requirement</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mealRequirement"
              checked={formData.mealRequirement}
              onCheckedChange={(checked) => setFormData({ ...formData, mealRequirement: checked as boolean })}
            />
            <Label htmlFor="mealRequirement" className="text-sm font-normal">Meal Requirement</Label>
          </div>
        </div>
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