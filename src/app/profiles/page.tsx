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
  program: string;
  level: string;
  gpa: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrollmentDate: string;
  avatar: string;
  courses: string[];
  certifications: string[];
}

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  program: string;
  level: string;
  gpa: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  enrollmentDate: string;
  courses: string;
  certifications: string;
}

const StudentProfileManagement = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Kasun Perera",
      email: "kasun.perera@email.com",
      phone: "+94 77 123 4567",
      address: "No. 45, Galle Road, Colombo 03",
      dateOfBirth: "1995-05-15",
      studentId: "CNA001",
      program: "Certified Nursing Assistant",
      level: "Basic",
      gpa: 3.8,
      status: "Active",
      enrollmentDate: "2025-01-15",
      avatar: "",
      courses: ["Basic Patient Care", "Vital Signs Monitoring", "Infection Control"],
      certifications: ["CPR Certified", "First Aid Certified"]
    },
    {
      id: 2,
      name: "Nimali Fernando",
      email: "nimali.fernando@email.com",
      phone: "+94 71 987 6543",
      address: "12/A, Kandy Road, Maharagama",
      dateOfBirth: "1996-03-22",
      studentId: "HHA002",
      program: "Home Health Aide",
      level: "Intermediate",
      gpa: 3.6,
      status: "Active",
      enrollmentDate: "2025-02-01",
      avatar: "",
      courses: ["Personal Care Assistance", "Medication Reminders", "Communication Skills"],
      certifications: ["Background Check Completed"]
    },
    {
      id: 3,
      name: "Tharushi Jayasinghe",
      email: "tharushi.jayasinghe@email.com",
      phone: "+94 76 456 7890",
      address: "78, Temple Road, Nugegoda",
      dateOfBirth: "1994-11-08",
      studentId: "MA003",
      program: "Medical Assistant",
      level: "Advanced",
      gpa: 3.9,
      status: "Active",
      enrollmentDate: "2024-12-10",
      avatar: "",
      courses: ["Medical Office Procedures", "Clinical Skills", "Patient Intake"],
      certifications: ["Medical Assistant Certification", "HIPAA Training"]
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
    const programPrefixes: { [key: string]: string } = {
      'Certified Nursing Assistant': 'CNA',
      'Home Health Aide': 'HHA',
      'Medical Assistant': 'MA',
      'Phlebotomy Technician': 'PHT'
    };
    
    const prefix = programPrefixes[newStudentData.program] || 'STU';
    const existingNumbers = students
      .filter(s => s.studentId.startsWith(prefix))
      .map(s => parseInt(s.studentId.slice(3)))
      .filter(n => !isNaN(n));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    const student: Student = {
      ...newStudentData,
      id: Math.max(...students.map(s => s.id)) + 1,
      studentId: `${prefix}${String(nextNumber).padStart(3, '0')}`
    };
    setStudents(prevStudents => [...prevStudents, student]);
    setIsAddingNew(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[#2E8B57]/20 text-[#2E8B57] border-[#2E8B57]/30';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
                      <Button size="sm" className="bg-[#2E8B57] hover:bg-[#236446] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                          Enter the student&apos;s information to create a new profile.
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
                      className="pl-10 focus:ring-[#2E8B57] focus:border-[#2E8B57]"
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
                      className={`p-4 border-b cursor-pointer hover:bg-[#2E8B57]/5 transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-[#2E8B57]/10 border-l-4 border-l-[#2E8B57]' : ''
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
                          <Badge className={`text-xs border ${getStatusColor(student.status)}`}>
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
                Update the student&apos;s information below.
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
              <CardDescription>{student.studentId} • {student.program}</CardDescription>
              <Badge className={`mt-2 border ${getStatusColor(student.status)}`}>
                {student.status}
              </Badge>
            </div>
          </div>
          <Button onClick={onEdit} variant="outline" className="border-[#2E8B57] text-[#2E8B57] hover:bg-[#2E8B57]/10">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Program Info</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
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
                <Label className="text-sm font-medium">Program</Label>
                <p className="text-sm text-gray-600">{student.program}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Training Level</Label>
                <p className="text-sm text-gray-600">{student.level}</p>
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
                  <Badge key={index} variant="secondary" className="bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Certifications & Credentials</Label>
              <div className="space-y-2">
                {student.certifications.map((certification, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#2E8B57]" />
                    <span className="text-sm">{certification}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  function getStatusColor(status: string) {
    switch(status) {
      case 'Active': return 'bg-[#2E8B57]/20 text-[#2E8B57] border-[#2E8B57]/30';
      case 'Inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
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
    program: student?.program || '',
    level: student?.level || '',
    gpa: student?.gpa?.toString() || '',
    status: student?.status || 'Active',
    enrollmentDate: student?.enrollmentDate || '',
    courses: student?.courses?.join(', ') || '',
    certifications: student?.certifications?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      courses: formData.courses.split(',').map(c => c.trim()).filter(c => c),
      certifications: formData.certifications.split(',').map(a => a.trim()).filter(a => a),
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
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        <div>
          <Label htmlFor="program">Program</Label>
          <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Certified Nursing Assistant">Certified Nursing Assistant</SelectItem>
              <SelectItem value="Home Health Aide">Home Health Aide</SelectItem>
              <SelectItem value="Medical Assistant">Medical Assistant</SelectItem>
              <SelectItem value="Phlebotomy Technician">Phlebotomy Technician</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="level">Training Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Certification">Certification</SelectItem>
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
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            className="focus:ring-[#2E8B57] focus:border-[#2E8B57]"
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive' | 'Suspended') => setFormData({ ...formData, status: value })}>
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
        <Label htmlFor="courses">Courses (comma-separated)</Label>
        <Textarea
          id="courses"
          value={formData.courses}
          onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
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