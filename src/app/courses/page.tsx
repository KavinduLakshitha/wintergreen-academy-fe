"use client"

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Calendar, DollarSign, Clock, BookOpen, Eye, Settings } from 'lucide-react';

const NursingAcademyAdmin = () => {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Certified Nursing Assistant (CNA) Program",
      duration: "4-6 weeks",
      price: 1200,
      maxStudents: 16,
      currentEnrolled: 12,
      schedule: "Monday-Friday, 9 AM - 3 PM",
      status: "Active",
      nextStart: "2025-03-15",
      instructor: "Priyanka Wickramasinghe, RN",
      description: "Comprehensive training program to become a Certified Nursing Assistant.",
      modules: ["Basic Patient Care", "Vital Signs Monitoring", "Infection Control", "Communication Skills"]
    },
    {
      id: 2,
      title: "Home Health Aide Training",
      duration: "2-3 weeks",
      price: 800,
      maxStudents: 12,
      currentEnrolled: 8,
      schedule: "Evenings & Weekends Available",
      status: "Active",
      nextStart: "2025-02-28",
      instructor: "Nimal Jayasuriya, LPN",
      description: "Specialized training for providing care in patients' homes.",
      modules: ["Personal Care Assistance", "Medication Reminders", "Light Housekeeping"]
    },
    {
      id: 3,
      title: "Medical Assistant Fundamentals",
      duration: "8-10 weeks",
      price: 2500,
      maxStudents: 14,
      currentEnrolled: 6,
      schedule: "Part-time: Tue/Thu 6-9 PM + Saturdays",
      status: "Draft",
      nextStart: "2025-04-01",
      instructor: "Dr. Sanduni Perera",
      description: "Introduction to medical assisting with focus on clinical and administrative skills.",
      modules: ["Medical Office Procedures", "Patient Intake & Scheduling", "Basic Clinical Skills"]
    }
  ]);

  const [showFormDialog, setShowFormDialog] = useState(false);
  type Course = typeof courses[number];
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
    status: 'Draft'
  });

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
      status: 'Draft'
    });
    setEditingCourse(null);
    setShowFormDialog(false);
  };

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      duration: course.duration,
      price: course.price.toString(),
      maxStudents: course.maxStudents.toString(),
      schedule: course.schedule,
      instructor: course.instructor,
      description: course.description,
      nextStart: course.nextStart,
      status: course.status
    });
    setEditingCourse(course);
    setShowFormDialog(true);
  };

  const handleDelete = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId));
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

  return (
      <div className="w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Manage academy courses and programs</p>
          </div>
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
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="1200"
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={resetForm}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      if (editingCourse) {
                        setCourses(courses.map(course => 
                          course.id === editingCourse.id 
                            ? { ...course, ...formData, price: parseFloat(formData.price) || 0, maxStudents: parseInt(formData.maxStudents) || 0 }
                            : course
                        ));
                      } else {
                        const newCourse = {
                          id: Math.max(...courses.map(c => c.id)) + 1,
                          ...formData,
                          price: parseFloat(formData.price) || 0,
                          maxStudents: parseInt(formData.maxStudents) || 0,
                          currentEnrolled: 0,
                          modules: []
                        };
                        setCourses([...courses, newCourse]);
                      }
                      resetForm();
                    }}
                    className="bg-[#2E8B57] hover:bg-[#236446] text-white"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
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
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>${course.price.toLocaleString()}</span>
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
                                onClick={() => handleDelete(course.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                      <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
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
                        {courses.filter(c => c.status === 'Active').length}
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
                        {courses.reduce((sum, course) => sum + course.currentEnrolled, 0)}
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
                        ${courses.reduce((sum, course) => sum + (course.price * course.currentEnrolled), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#2E8B57]/20 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-[#2E8B57]" />
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

export default NursingAcademyAdmin;