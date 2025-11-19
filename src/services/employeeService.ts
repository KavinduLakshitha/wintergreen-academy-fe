// Service to interact with fe-wintergreen API for employee management

export interface CreateEmployeeData {
  name: string;
  position: string;
  department?: string;
  staffType: 'office-staff' | 'medical-staff';
  email?: string;
  phone: string;
  joinDate: string;
  supervisorId?: string;
  status?: 'Active' | 'Inactive';
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  salary?: number;
  hourlyRate?: number;
  employmentType?: 'full-time' | 'part-time' | 'contract';
  employeeId?: string;
  epfEtfEnrolled?: boolean;
  rate12Hour?: number;
  rate24Hour?: number;
  nurseGrade?: 'A' | 'B' | 'C';
  district?: string;
  gender?: string;
  civilStatus?: string;
  nicNumber?: string;
  callingName?: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  position: string;
  department?: string | null;
  staff_type: 'office-staff' | 'medical-staff';
  email?: string | null;
  phone: string;
  join_date: string;
  status: string;
  address?: string;
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_WINTERGREEN_API_URL || 'http://localhost:5000';
  }
  return 'http://localhost:5000';
};

class EmployeeService {
  static async create(employeeData: CreateEmployeeData): Promise<Employee> {
    const apiUrl = getApiBaseUrl();
    // Use API key for cross-system communication
    const apiKey = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_WINTERGREEN_API_KEY || 'wintergreen-academy-integration-key')
      : 'wintergreen-academy-integration-key';

    const response = await fetch(`${apiUrl}/api/employees/convert-from-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create employee: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  static async checkEmployeeExists(email?: string, phone?: string): Promise<boolean> {
    if (!email && !phone) return false;

    try {
      const apiUrl = getApiBaseUrl();
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);

      const response = await fetch(`${apiUrl}/api/employees/check?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking employee existence:', error);
      return false;
    }
  }
}

export default EmployeeService;

