"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Student } from "@/services/studentService";
import EmployeeService, { CreateEmployeeData } from "@/services/employeeService";
import { toast } from "sonner";

interface ConvertToNurseAideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess?: () => void;
}

export default function ConvertToNurseAideDialog({
  open,
  onOpenChange,
  student,
  onSuccess
}: ConvertToNurseAideDialogProps) {
  const [loading, setLoading] = useState(false);
  const [joinDate, setJoinDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [formData, setFormData] = useState<Partial<CreateEmployeeData>>({
    staffType: 'medical-staff',
    position: 'Nurse Aide',
    status: 'Active',
    employmentType: 'full-time',
    epfEtfEnrolled: true
  });

  // Populate form with student data when dialog opens
  useEffect(() => {
    if (open && student) {
      const today = new Date();
      setFormData({
        name: student.fullName,
        email: student.email,
        phone: student.phone,
        address: student.address,
        position: 'Nurse Aide',
        staffType: 'medical-staff',
        status: 'Active',
        employmentType: 'full-time',
        epfEtfEnrolled: true,
        joinDate: today.toISOString().split('T')[0],
        // Set default values for required Nurse Aide fields
        rate12Hour: 0,
        rate24Hour: 0,
        nurseGrade: 'C',
      });
      setJoinDate(today.toISOString().split('T')[0]);
    }
  }, [open, student]);

  const handleInputChange = (field: keyof CreateEmployeeData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!student) return;

    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.phone || !joinDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.position === 'Nurse Aide') {
        if (!formData.rate12Hour || !formData.rate24Hour || !formData.nurseGrade) {
          toast.error('Please fill in all required Nurse Aide fields (12-Hour Rate, 24-Hour Rate, and Grade)');
          return;
        }
      }

      const employeeData: CreateEmployeeData = {
        name: formData.name || '',
        email: formData.email,
        phone: formData.phone || '',
        position: formData.position || 'Nurse Aide',
        staffType: 'medical-staff',
        joinDate: joinDate,
        address: formData.address,
        employmentType: formData.employmentType || 'full-time',
        status: 'Active',
        epfEtfEnrolled: formData.epfEtfEnrolled ?? true,
        rate12Hour: formData.rate12Hour,
        rate24Hour: formData.rate24Hour,
        nurseGrade: formData.nurseGrade,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        callingName: formData.callingName,
        district: formData.district,
        nicNumber: formData.nicNumber,
      };

      await EmployeeService.create(employeeData);
      toast.success('Student converted to Nurse Aide successfully');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to convert student to nurse aide:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert student to nurse aide';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isValid = Boolean(
    formData.name &&
    formData.phone &&
    joinDate &&
    formData.position === 'Nurse Aide' &&
    formData.rate12Hour &&
    formData.rate24Hour &&
    formData.nurseGrade
  );

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Student to Nurse Aide</DialogTitle>
          <DialogDescription>
            Review and complete the employee information below. Required fields are marked with *
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="employee@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+94 XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter district"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nicNumber">NIC Number</Label>
                <Input
                  id="nicNumber"
                  value={formData.nicNumber || ''}
                  onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                  placeholder="Enter NIC number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender ?? undefined}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="civilStatus">Civil Status</Label>
                <Select
                  value={formData.civilStatus ?? undefined}
                  onValueChange={(value) => handleInputChange('civilStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select civil status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Separated">Separated</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="callingName">Calling Name</Label>
                <Input
                  id="callingName"
                  value={formData.callingName || ''}
                  onChange={(e) => handleInputChange('callingName', e.target.value)}
                  placeholder="Enter calling name"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value="Nurse Aide"
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType || 'full-time'}
                  onValueChange={(value) => handleInputChange('employmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate12Hour">12-Hour Rate (LKR) *</Label>
                <Input
                  id="rate12Hour"
                  type="number"
                  value={formData.rate12Hour || ''}
                  onChange={(e) => handleInputChange('rate12Hour', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate24Hour">24-Hour Rate (LKR) *</Label>
                <Input
                  id="rate24Hour"
                  type="number"
                  value={formData.rate24Hour || ''}
                  onChange={(e) => handleInputChange('rate24Hour', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nurseGrade">Grade *</Label>
                <Select
                  value={formData.nurseGrade || ''}
                  onValueChange={(value) => handleInputChange('nurseGrade', value as 'A' | 'B' | 'C')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Nurse Aide'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

