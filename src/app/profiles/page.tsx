"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit, Plus, Search, Filter } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  studentId: string;
  major: string;
  year: string;
  gpa: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrollmentDate: string;
  avatar: string;
  courses: string[];
  achievements: string[];
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  major: string;
  year: string;
  gpa: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrollmentDate: string;
  courses: string;
  achievements: string;
}

const StudentProfileManagement = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Kasun Perera",
      email: "kasun.perera@email.com",
      phone: "+94 77 123 4567",
      address: "No. 45, Galle Road, Colombo 03",
      dateOfBirth: "1998-05-15",
      studentId: "STU001",
      major: "Computer Science",
      year: "Senior",
      gpa: 3.8,
      status: "Active",
      enrollmentDate: "2021-09-01",
      avatar: "",
      courses: ["Data Structures", "Machine Learning", "Web Development"],
      achievements: ["Dean's List", "Hackathon Winner"]
    },
    {
      id: 2,
      name: "Nimali Fernando",
      email: "nimali.fernando@email.com",
      phone: "+94 71 987 6543",
      address: "12/A, Kandy Road, Maharagama",
      dateOfBirth: "1999-03-22",
      studentId: "STU002",
      major: "Business Administration",
      year: "Junior",
      gpa: 3.6,
      status: "Active",
      enrollmentDate: "2022-01-15",
      avatar: "",
      courses: ["Marketing", "Finance", "Operations Management"],
      achievements: ["Student Council Member"]
    },
    {
      id: 3,
      name: "Tharushi Jayasinghe",
      email: "tharushi.jayasinghe@email.com",
      phone: "+94 76 456 7890",
      address: "78, Temple Road, Nugegoda",
      dateOfBirth: "1997-11-08",
      studentId: "STU003",
      major: "Psychology",
      year: "Graduate",
      gpa: 3.9,
      status: "Active",
      enrollmentDate: "2020-08-30",
      avatar: "",
      courses: ["Cognitive Psychology", "Research Methods", "Statistics"],
      achievements: ["Research Assistant", "Magna Cum Laude"]
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleEditStudent = (updatedStudent: Student | Omit<Student, 'id' | 'studentId'>) => {
    if ('id' in updatedStudent && 'studentId' in updatedStudent) {
      setStudents(prevStudents => 
        prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent as Student : s)
      );
      setIsEditing(false);
      setSelectedStudent(updatedStudent as Student);
    }
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id' | 'studentId'>) => {
    const student: Student = {
      ...newStudentData,
      id: Math.max(...students.map(s => s.id)) + 1,
      studentId: `STU${String(Math.max(...students.map(s => parseInt(s.studentId.slice(3)))) + 1).padStart(3, '0')}`
    };
    setStudents(prevStudents => [...prevStudents, student]);
    setIsAddingNew(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile Management</h1>
          <p className="text-gray-600">Manage and view student profiles, academic information, and records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Student List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Students</CardTitle>
                  <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                          Enter the student's information to create a new profile.
                        </DialogDescription>
                      </DialogHeader>
                      <StudentForm onSubmit={handleAddStudent} onCancel={() => setIsAddingNew(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Search and Filter */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={(value: 'All' | 'Active' | 'Inactive' | 'Suspended') => setFilterStatus(value)}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{student.name}</p>
                          <p className="text-sm text-gray-500 truncate">{student.studentId}</p>
                          <Badge className={`text-xs ${getStatusColor(student.status)}`}>
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <StudentDetails 
                student={selectedStudent} 
                onEdit={() => setIsEditing(true)}
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

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student Profile</DialogTitle>
              <DialogDescription>
                Update the student's information below.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <StudentForm 
                student={selectedStudent}
                onSubmit={handleEditStudent}
                onCancel={() => setIsEditing(false)}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Student Details Component
interface StudentDetailsProps {
  student: Student;
  onEdit: () => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ student, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <CardDescription>{student.studentId} • {student.major}</CardDescription>
              <Badge className={`mt-2 ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {student.status}
              </Badge>
            </div>
          </div>
          <Button onClick={onEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
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
                <Label className="text-sm font-medium">Major</Label>
                <p className="text-sm text-gray-600">{student.major}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Year</Label>
                <p className="text-sm text-gray-600">{student.year}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">GPA</Label>
                <p className="text-sm text-gray-600">{student.gpa}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Enrollment Date</Label>
                <p className="text-sm text-gray-600">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Current Courses</Label>
              <div className="flex flex-wrap gap-2">
                {student.courses.map((course, index) => (
                  <Badge key={index} variant="secondary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Awards & Achievements</Label>
              <div className="space-y-2">
                {student.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
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
  onSubmit: (student: Student | Omit<Student, 'id' | 'studentId'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    address: student?.address || '',
    dateOfBirth: student?.dateOfBirth || '',
    major: student?.major || '',
    year: student?.year || '',
    gpa: student?.gpa?.toString() || '',
    status: student?.status || 'Active',
    enrollmentDate: student?.enrollmentDate || '',
    courses: student?.courses?.join(', ') || '',
    achievements: student?.achievements?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      courses: formData.courses.split(',').map(c => c.trim()).filter(c => c),
      achievements: formData.achievements.split(',').map(a => a.trim()).filter(a => a),
      gpa: parseFloat(formData.gpa) || 0
    };

    if (isEditing && student) {
      const updatedStudent: Student = {
        ...submissionData,
        id: student.id,
        studentId: student.studentId,
        avatar: student.avatar
      };
      onSubmit(updatedStudent);
    } else {
      const newStudentData: Omit<Student, 'id' | 'studentId'> = {
        ...submissionData,
        avatar: ''
      };
      onSubmit(newStudentData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="major">Major</Label>
          <Input
            id="major"
            value={formData.major}
            onChange={(e) => setFormData({...formData, major: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Freshman">Freshman</SelectItem>
              <SelectItem value="Sophomore">Sophomore</SelectItem>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={formData.gpa}
            onChange={(e) => setFormData({...formData, gpa: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive' | 'Suspended') => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="enrollmentDate">Enrollment Date</Label>
          <Input
            id="enrollmentDate"
            type="date"
            value={formData.enrollmentDate}
            onChange={(e) => setFormData({...formData, enrollmentDate: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={2}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="courses">Courses (comma-separated)</Label>
        <Textarea
          id="courses"
          value={formData.courses}
          onChange={(e) => setFormData({...formData, courses: e.target.value})}
          rows={2}
          placeholder="e.g., Data Structures, Machine Learning, Web Development"
        />
      </div>
      
      <div>
        <Label htmlFor="achievements">Achievements (comma-separated)</Label>
        <Textarea
          id="achievements"
          value={formData.achievements}
          onChange={(e) => setFormData({...formData, achievements: e.target.value})}
          rows={2}
          placeholder="e.g., Dean's List, Hackathon Winner"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentProfileManagement;