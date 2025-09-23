export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Employee {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  personal: {
    firstName: string;
    lastName: string;
    employeeId: string;
    accessCardNumber: string;
    dob: string;
    gender: 'male' | 'female' | 'other';
    bloodGroup: string;
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
    profilePhoto?: string;
  };
  contact: {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
      current: string;
      permanent: string;
    };
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
  };
  statutory: {
    pan: string;
    aadhaar: string;
    uan?: string;
    esic?: string;
  };
  bank: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    branch: string;
    accountType: string;
  };
  education: Array<{
    level: '10th' | '12th' | 'diploma' | 'undergraduate' | 'postgraduate' | 'other';
    institution: string;
    year: number;
    percentage: number;
    documentUrl?: string;
  }>;
  experience: Array<{
    company: string;
    designation: string;
    department: string;
    from: string;
    to: string;
    salary?: number;
    reference?: string;
    current: boolean;
  }>;
  employment: {
    department: string;
    designation: string;
    joiningDate: string;
    employmentType: 'fulltime' | 'parttime' | 'contract' | 'intern';
    status: 'active' | 'inactive';
  };
  documents: {
    driveLink?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  bloodGroup?: string;
  joiningDateFrom?: string;
  joiningDateTo?: string;
}