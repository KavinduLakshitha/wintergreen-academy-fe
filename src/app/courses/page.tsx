"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Calendar, Clock, BookOpen, Eye, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Course,
  CourseStatistics,
  CreateCourseData,
  getCourses,
  getCourseStatistics,
  createCourse,
  updateCourse,
  deleteCourse,
  getBranches
} from '@/services/courseService';
import { getErrorMessage } from '@/utils/errorHandling';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  branch?: {
    id: string;
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

const CourseManagement = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [statistics, setStatistics] = useState<CourseStatistics>({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrolled: 0,
    totalRevenue: 0,
    averagePrice: 0,
    totalCapacity: 0
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    price: '',
    maxStudents: '',
    schedule: '',
    instructor: '',
    description: '',
    nextStart: '',
    status: 'Draft',
    modules: [] as string[],
    branch: ''
  });

  // Check authentication and get user info
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
  }, []);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCourses(),
        fetchStatistics(),
        fetchBranches()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.courses);
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth');
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await getCourseStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch branches (for superAdmin)
  const fetchBranches = async () => {
    try {
      const branchList = await getBranches();
      setBranches(branchList);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  // Check if user can manage courses (superAdmin only)
  const canManageCourses = () => {
    return currentUser?.role === 'superAdmin';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      price: '',
      maxStudents: '',
      schedule: '',
      instructor: '',
      description: '',
      nextStart: '',
      status: 'Draft',
      modules: [],
      branch: currentUser?.branch?.id || ''
    });
    setEditingCourse(null);
    setShowFormDialog(false);
  };

  const handleEdit = (course: Course) => {
    if (!canManageCourses()) {
      toast.error('You do not have permission to edit courses');
      return;
    }

    setFormData({
      title: course.title,
      duration: course.duration,
      price: course.price.toString(),
      maxStudents: course.maxStudents.toString(),
      schedule: course.schedule,
      instructor: course.instructor,
      description: course.description,
      nextStart: course.nextStart.split('T')[0], // Format date for input
      status: course.status,
      modules: course.modules || [],
      branch: course.branch._id
    });
    setEditingCourse(course);
    setShowFormDialog(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!canManageCourses()) {
      toast.error('You do not have permission to delete courses');
      return;
    }

    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses(); // Refresh the list
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmit = async () => {
    if (!canManageCourses()) {
      toast.error('You do not have permission to manage courses');
      return;
    }

    try {
      setSubmitting(true);

      const courseData: CreateCourseData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        price: parseFloat(formData.price),
        maxStudents: parseInt(formData.maxStudents),
        schedule: formData.schedule,
        instructor: formData.instructor,
        nextStart: formData.nextStart,
        status: formData.status,
        modules: formData.modules,
        branch: formData.branch || currentUser?.branch?.id || ''
      };

      if (editingCourse) {
        await updateCourse(editingCourse._id, courseData);
        toast.success('Course updated successfully');
      } else {
        await createCourse(courseData);
        toast.success('Course created successfully');
      }

      resetForm();
      fetchCourses();
      fetchStatistics();
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'Active': 'bg-[#2E8B57]/20 text-[#2E8B57] border-[#2E8B57]/30',
      'Draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Inactive': 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEnrollmentStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-[#2E8B57]';
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading courses...</span>
      </div>
    );
  }

  return (
      <div className="w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Manage academy courses and programs</p>
          </div>
          {canManageCourses() && (
            <AlertDialog open={showFormDialog} onOpenChange={setShowFormDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => setShowFormDialog(true)}
                  className="bg-[#2E8B57] hover:bg-[#236446] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Course
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {editingCourse ? 'Update course information' : 'Create a new course program'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Certified Nursing Assistant Program"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 4-6 weeks"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (LKR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="120000"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                      placeholder="16"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      placeholder="Kamala Dissanayake, RN"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextStart">Next Start Date</Label>
                    <Input
                      id="nextStart"
                      type="date"
                      value={formData.nextStart}
                      onChange={(e) => setFormData({...formData, nextStart: e.target.value})}
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input
                      id="schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                      placeholder="Monday-Friday, 9 AM - 3 PM"
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Course description..."
                      className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {currentUser?.role === 'superAdmin' && (
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={formData.branch} onValueChange={(value) => setFormData({...formData, branch: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={resetForm} disabled={submitting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#2E8B57] hover:bg-[#236446] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingCourse ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingCourse ? 'Update Course' : 'Create Course'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {/* Courses List */}
            <div className="grid gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow hover:bg-[#2E8B57]/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                          <Badge className={`${getStatusBadge(course.status)} border`}>
                            {course.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">LKR</span>
                            <span>{course.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className={`h-4 w-4 ${getEnrollmentStatus(course.currentEnrolled, course.maxStudents)}`} />
                            <span className={getEnrollmentStatus(course.currentEnrolled, course.maxStudents)}>
                              {course.currentEnrolled}/{course.maxStudents} enrolled
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{new Date(course.nextStart).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Instructor:</strong> {course.instructor}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>Schedule:</strong> {course.schedule}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" className="border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageCourses() && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(course)} className="border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{course.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(course._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Courses</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.totalCourses}</p>
                    </div>
                    <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-[#2E8B57]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Courses</p>
                      <p className="text-2xl font-bold text-[#2E8B57]">
                        {statistics.activeCourses}
                      </p>
                    </div>
                    <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                      <Settings className="h-6 w-6 text-[#2E8B57]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                      <p className="text-2xl font-bold text-[#2E8B57]">
                        {statistics.totalEnrolled}
                      </p>
                    </div>
                    <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                      <Users className="h-6 w-6 text-[#2E8B57]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-[#2E8B57]">
                        {formatCurrency(statistics.totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                      <span className="text-[#2E8B57] font-bold text-lg">LKR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Status Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#2E8B57] h-2 rounded-full"
                            style={{ width: `${statistics.totalCourses > 0 ? (statistics.activeCourses / statistics.totalCourses) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{statistics.activeCourses}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Draft</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${statistics.totalCourses > 0 ? ((statistics.totalCourses - statistics.activeCourses) / statistics.totalCourses) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{statistics.totalCourses - statistics.activeCourses}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Capacity</span>
                      <span className="text-sm font-medium">{statistics.totalCapacity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Enrolled</span>
                      <span className="text-sm font-medium">{statistics.totalEnrolled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available Spots</span>
                      <span className="text-sm font-medium">{statistics.totalCapacity - statistics.totalEnrolled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Utilization Rate</span>
                      <span className="text-sm font-medium">
                        {statistics.totalCapacity > 0 ? Math.round((statistics.totalEnrolled / statistics.totalCapacity) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-[#2E8B57] h-2 rounded-full"
                        style={{ width: `${statistics.totalCapacity > 0 ? (statistics.totalEnrolled / statistics.totalCapacity) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
  );
};

export default CourseManagement;