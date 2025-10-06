import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, User, Mail, Briefcase, GraduationCap, Clock, FileText, Upload as UploadIcon, Check } from 'lucide-react';
import { Employee } from '../../types';
import { createEmployee, fetchEmployees } from '../../store/slices/employeeSlice';
import { RootState, AppDispatch } from '../../store';
import Toast from '../UI/Toast';
import { formatEmployeeDocumentUrls } from '../../utils/urlUtils';

interface AddEmployeeFormProps {
  onBack?: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.employees);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState<Employee>({
    personal: {
      firstName: '',
      lastName: '',
      employeeId: '',
      accessCardNumber: '',
      dob: '',
      gender: 'male',
      bloodGroup: '',
      maritalStatus: 'single',
    },
    contact: {
      email: '',
      phone: '',
      alternatePhone: '',
      address: {
        current: '',
        permanent: '',
      },
      emergencyContact: {
        name: '',
        relation: '',
        phone: '',
      },
    },
    statutory: {
      pan: '',
      aadhaar: '',
      pfNumber: '',
      uan: '',
      esic: '',
    },
    bank: {
      accountHolderName: '',
      accountNumber: '',
      ifsc: '',
      bankName: '',
      branch: '',
      accountType: 'savings',
    },
    education: [],
    experience: [],
    employment: {
      department: '',
      designation: '',
      joiningDate: '',
      employmentType: 'fulltime',
      status: 'active',
    },
    documents: {
      driveLink: '',
    },
  });

  const steps = [
    { 
      id: 'personal', 
      title: 'Personal Info', 
      description: 'Basic personal information',
      icon: User,
      shortTitle: 'Personal'
    },
    { 
      id: 'contact', 
      title: 'Contact & Address', 
      description: 'Contact details and addresses',
      icon: Mail,
      shortTitle: 'Contact'
    },
    { 
      id: 'employment', 
      title: 'Employment', 
      description: 'Job details and employment info',
      icon: Briefcase,
      shortTitle: 'Job'
    },
    { 
      id: 'education', 
      title: 'Education', 
      description: 'Educational background',
      icon: GraduationCap,
      shortTitle: 'Education'
    },
    { 
      id: 'experience', 
      title: 'Experience', 
      description: 'Work experience history',
      icon: Clock,
      shortTitle: 'Experience'
    },
    { 
      id: 'statutory', 
      title: 'Statutory & Bank', 
      description: 'Legal and banking details',
      icon: FileText,
      shortTitle: 'Legal'
    },
    { 
      id: 'documents', 
      title: 'Documents', 
      description: 'Upload required documents',
      icon: UploadIcon,
      shortTitle: 'Documents'
    },
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof Employee] as any),
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section: string, nestedSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof Employee] as any),
        [nestedSection]: {
          ...((prev[section as keyof Employee] as any)[nestedSection] || {}),
          [field]: value,
        },
      },
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          level: 'undergraduate',
          institution: '',
          year: new Date().getFullYear(),
          percentage: 0,
        },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          designation: '',
          department: '',
          from: '',
          to: '',
          current: false,
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Comprehensive validation function
  const validateFormData = () => {
    const errors: string[] = [];

    // Personal Information Validation
    if (!formData.personal.firstName?.trim()) {
      errors.push('First Name is required');
    } else if (formData.personal.firstName.trim().length < 2) {
      errors.push('First Name must be at least 2 characters long');
    } else if (formData.personal.firstName.trim().length > 50) {
      errors.push('First Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(formData.personal.firstName.trim())) {
      errors.push('First Name can only contain letters and spaces');
    }

    if (!formData.personal.lastName?.trim()) {
      errors.push('Last Name is required');
    } else if (formData.personal.lastName.trim().length < 1) {
      errors.push('Last Name cannot be empty');
    } else if (formData.personal.lastName.trim().length > 50) {
      errors.push('Last Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(formData.personal.lastName.trim())) {
      errors.push('Last Name can only contain letters and spaces');
    }

    if (!formData.personal.employeeId?.trim()) {
      errors.push('Employee ID is required');
    } else if (formData.personal.employeeId.trim().length < 3) {
      errors.push('Employee ID must be at least 3 characters long');
    } else if (formData.personal.employeeId.trim().length > 20) {
      errors.push('Employee ID cannot exceed 20 characters');
    } else if (!/^[A-Z0-9]+$/.test(formData.personal.employeeId.trim())) {
      errors.push('Employee ID can only contain uppercase letters and numbers');
    }

    if (!formData.personal.accessCardNumber?.trim()) {
      errors.push('Access Card Number is required');
    } else if (formData.personal.accessCardNumber.trim().length < 3) {
      errors.push('Access Card Number must be at least 3 characters long');
    } else if (formData.personal.accessCardNumber.trim().length > 20) {
      errors.push('Access Card Number cannot exceed 20 characters');
    } else if (!/^[A-Z0-9]+$/.test(formData.personal.accessCardNumber.trim())) {
      errors.push('Access Card Number can only contain uppercase letters and numbers');
    }

    if (formData.personal.dob) {
      const dob = new Date(formData.personal.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (dob > today) {
        errors.push('Date of Birth cannot be in the future');
      } else if (age < 18) {
        errors.push('Employee must be at least 18 years old');
      } else if (age > 100) {
        errors.push('Please enter a valid Date of Birth');
      }
    }

    if (!formData.personal.maritalStatus?.trim()) {
      errors.push('Marital Status is required');
    } else if (!['single', 'married', 'divorced', 'widowed', 'separated'].includes(formData.personal.maritalStatus)) {
      errors.push('Please select a valid Marital Status');
    }

    // Contact Information Validation
    if (!formData.contact.email?.trim()) {
      errors.push('Email Address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (formData.contact.email.trim().length > 100) {
      errors.push('Email address cannot exceed 100 characters');
    }

    if (!formData.contact.phone?.trim()) {
      errors.push('Phone Number is required');
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contact.phone.trim())) {
      errors.push('Phone Number can only contain numbers, spaces, +, -, and parentheses');
    } else if (formData.contact.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.push('Phone Number must have at least 10 digits');
    } else if (formData.contact.phone.replace(/[^0-9]/g, '').length > 15) {
      errors.push('Phone Number cannot exceed 15 digits');
    }

    if (formData.contact.alternatePhone?.trim()) {
      if (!/^[0-9+\-\s()]+$/.test(formData.contact.alternatePhone.trim())) {
        errors.push('Alternate Phone Number can only contain numbers, spaces, +, -, and parentheses');
      } else if (formData.contact.alternatePhone.replace(/[^0-9]/g, '').length < 10) {
        errors.push('Alternate Phone Number must have at least 10 digits');
      } else if (formData.contact.alternatePhone.replace(/[^0-9]/g, '').length > 15) {
        errors.push('Alternate Phone Number cannot exceed 15 digits');
      }
    }

    if (!formData.contact.address?.current?.trim()) {
      errors.push('Current Address is required');
    } else if (formData.contact.address.current.trim().length < 10) {
      errors.push('Current Address must be at least 10 characters long');
    } else if (formData.contact.address.current.trim().length > 500) {
      errors.push('Current Address cannot exceed 500 characters');
    }

    if (formData.contact.address?.permanent?.trim()) {
      if (formData.contact.address.permanent.trim().length < 10) {
        errors.push('Permanent Address must be at least 10 characters long');
      } else if (formData.contact.address.permanent.trim().length > 500) {
        errors.push('Permanent Address cannot exceed 500 characters');
      }
    }

    // Emergency Contact Validation
    if (!formData.contact.emergencyContact?.name?.trim()) {
      errors.push('Emergency Contact Name is required');
    } else if (formData.contact.emergencyContact.name.trim().length < 2) {
      errors.push('Emergency Contact Name must be at least 2 characters long');
    } else if (formData.contact.emergencyContact.name.trim().length > 100) {
      errors.push('Emergency Contact Name cannot exceed 100 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(formData.contact.emergencyContact.name.trim())) {
      errors.push('Emergency Contact Name can only contain letters and spaces');
    }

    if (!formData.contact.emergencyContact?.relation?.trim()) {
      errors.push('Emergency Contact Relation is required');
    } else if (formData.contact.emergencyContact.relation.trim().length < 2) {
      errors.push('Emergency Contact Relation must be at least 2 characters long');
    } else if (formData.contact.emergencyContact.relation.trim().length > 50) {
      errors.push('Emergency Contact Relation cannot exceed 50 characters');
    }

    if (!formData.contact.emergencyContact?.phone?.trim()) {
      errors.push('Emergency Contact Phone Number is required');
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contact.emergencyContact.phone.trim())) {
      errors.push('Emergency Contact Phone Number can only contain numbers, spaces, +, -, and parentheses');
    } else if (formData.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.push('Emergency Contact Phone Number must have at least 10 digits');
    } else if (formData.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length > 15) {
      errors.push('Emergency Contact Phone Number cannot exceed 15 digits');
    }

    // Employment Information Validation
    if (!formData.employment.department?.trim()) {
      errors.push('Department is required');
    } else if (formData.employment.department.trim().length < 2) {
      errors.push('Department must be at least 2 characters long');
    } else if (formData.employment.department.trim().length > 100) {
      errors.push('Department cannot exceed 100 characters');
    }

    if (!formData.employment.designation?.trim()) {
      errors.push('Designation is required');
    } else if (formData.employment.designation.trim().length < 2) {
      errors.push('Designation must be at least 2 characters long');
    } else if (formData.employment.designation.trim().length > 100) {
      errors.push('Designation cannot exceed 100 characters');
    }

    if (!formData.employment.joiningDate) {
      errors.push('Joining Date is required');
    } else {
      const joiningDate = new Date(formData.employment.joiningDate);
      const today = new Date();
      
      if (joiningDate > today) {
        errors.push('Joining Date cannot be in the future');
      } else if (joiningDate < new Date('1900-01-01')) {
        errors.push('Please enter a valid Joining Date');
      }
    }

    // Statutory Information Validation
    if (!formData.statutory.pan?.trim()) {
      errors.push('PAN Number is required');
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.statutory.pan.trim())) {
      errors.push('PAN Number must be in format: AAAAA9999A (5 letters, 4 numbers, 1 letter)');
    }

    if (!formData.statutory.aadhaar?.trim()) {
      errors.push('Aadhaar Number is required');
    } else if (!/^[0-9]{12}$/.test(formData.statutory.aadhaar.trim())) {
      errors.push('Aadhaar Number must be exactly 12 digits');
    }

    if (formData.statutory.uan?.trim()) {
      if (!/^[0-9]{12}$/.test(formData.statutory.uan.trim())) {
        errors.push('UAN Number must be exactly 12 digits');
      }
    }

    if (formData.statutory.pfNumber?.trim()) {
      if (!/^[A-Za-z0-9\/-]{6,25}$/.test(formData.statutory.pfNumber.trim())) {
        errors.push('PF Number must be 6-25 characters, letters/numbers/"/"/"-"');
      }
    }

    if (formData.statutory.esic?.trim()) {
      if (!/^[0-9]{10}$/.test(formData.statutory.esic.trim())) {
        errors.push('ESIC Number must be exactly 10 digits');
      }
    }

    // Banking Details Validation
    if (!formData.bank.accountHolderName?.trim()) {
      errors.push('Account Holder Name is required');
    } else if (!/^[a-zA-Z\s.]{2,100}$/.test(formData.bank.accountHolderName.trim())) {
      errors.push('Account Holder Name must be 2-100 letters/spaces');
    }

    if (!formData.bank.accountNumber?.trim()) {
      errors.push('Account Number is required');
    } else if (!/^[0-9]{9,18}$/.test(formData.bank.accountNumber.trim())) {
      errors.push('Account Number must be between 9 and 18 digits');
    }

    if (!formData.bank.ifsc?.trim()) {
      errors.push('IFSC Code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bank.ifsc.trim())) {
      errors.push('IFSC Code must be in format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)');
    }

    if (!formData.bank.bankName?.trim()) {
      errors.push('Bank Name is required');
    } else if (formData.bank.bankName.trim().length < 2) {
      errors.push('Bank Name must be at least 2 characters long');
    } else if (formData.bank.bankName.trim().length > 100) {
      errors.push('Bank Name cannot exceed 100 characters');
    }

    if (!formData.bank.branch?.trim()) {
      errors.push('Branch is required');
    } else if (formData.bank.branch.trim().length < 2) {
      errors.push('Branch must be at least 2 characters long');
    } else if (formData.bank.branch.trim().length > 100) {
      errors.push('Branch cannot exceed 100 characters');
    }

    // Education Validation
    if (formData.education && formData.education.length > 0) {
      formData.education.forEach((edu, index) => {
        if (!edu.institution?.trim()) {
          errors.push(`Education ${index + 1}: Institution is required`);
        } else if (edu.institution.trim().length < 2) {
          errors.push(`Education ${index + 1}: Institution must be at least 2 characters long`);
        }

        if (!edu.year || edu.year < 1950 || edu.year > new Date().getFullYear()) {
          errors.push(`Education ${index + 1}: Please enter a valid year`);
        }

        if (edu.percentage < 0 || edu.percentage > 100) {
          errors.push(`Education ${index + 1}: Percentage must be between 0 and 100`);
        }
      });
    }

    // Experience Validation
    if (formData.experience && formData.experience.length > 0) {
      formData.experience.forEach((exp, index) => {
        if (!exp.company?.trim()) {
          errors.push(`Experience ${index + 1}: Company is required`);
        } else if (exp.company.trim().length < 2) {
          errors.push(`Experience ${index + 1}: Company must be at least 2 characters long`);
        }

        if (!exp.designation?.trim()) {
          errors.push(`Experience ${index + 1}: Designation is required`);
        } else if (exp.designation.trim().length < 2) {
          errors.push(`Experience ${index + 1}: Designation must be at least 2 characters long`);
        }

        if (!exp.department?.trim()) {
          errors.push(`Experience ${index + 1}: Department is required`);
        } else if (exp.department.trim().length < 2) {
          errors.push(`Experience ${index + 1}: Department must be at least 2 characters long`);
        }

        if (!exp.from) {
          errors.push(`Experience ${index + 1}: From Date is required`);
        } else {
          const fromDate = new Date(exp.from);
          const today = new Date();
          
          if (fromDate > today) {
            errors.push(`Experience ${index + 1}: From Date cannot be in the future`);
          }
        }

        if (!exp.current && exp.to) {
          const fromDate = new Date(exp.from);
          const toDate = new Date(exp.to);
          
          if (toDate <= fromDate) {
            errors.push(`Experience ${index + 1}: To Date must be after From Date`);
          }
          if (toDate > new Date()) {
            errors.push(`Experience ${index + 1}: To Date cannot be in the future`);
          }
        }
      });
    }

    // Document Validation - Google Drive Link is optional
    if (formData.documents.driveLink?.trim() && !/^https?:\/\/.+/.test(formData.documents.driveLink.trim())) {
      errors.push('Please enter a valid URL');
    }

    return errors;
  };

  const handleSubmit = async () => {
    try {
      // Comprehensive validation
      const validationErrors = validateFormData();
      if (validationErrors.length > 0) {
        setToastMessage(`Validation Error: ${validationErrors.join(', ')}`);
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Check for duplicate Employee ID and Access Card Number
      const existingEmployees = await dispatch(fetchEmployees({ page: 1, limit: 1000 })).unwrap();
      const duplicateEmployeeId = existingEmployees.employees.find((emp: Employee) => 
        emp.personal?.employeeId === formData.personal.employeeId
      );
      const duplicateAccessCard = existingEmployees.employees.find((emp: Employee) => 
        emp.personal?.accessCardNumber === formData.personal.accessCardNumber
      );

      if (duplicateEmployeeId) {
        setToastMessage('Employee ID already exists. Please use a different Employee ID.');
        setToastType('error');
        setShowToast(true);
        return;
      }

      if (duplicateAccessCard) {
        setToastMessage('Access Card Number already exists. Please use a different Access Card Number.');
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Convert string dates to Date objects and format URLs
      const processedData = formatEmployeeDocumentUrls({
        ...formData,
        personal: {
          ...formData.personal,
          dob: formData.personal.dob ? new Date(formData.personal.dob) : undefined,
        },
        employment: {
          ...formData.employment,
          joiningDate: new Date(formData.employment.joiningDate),
        },
        experience: formData.experience.map(exp => ({
          ...exp,
          from: exp.from ? new Date(exp.from) : undefined,
          to: exp.to ? new Date(exp.to) : undefined,
        })),
      });

      console.log('AddEmployeeForm: Submitting employee data:', processedData);
      const result = await dispatch(createEmployee(processedData)).unwrap();
      console.log('AddEmployeeForm: Employee created successfully:', result);
      setToastMessage('Employee created successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Refresh employee list
      dispatch(fetchEmployees({ page: 1, limit: 10 }));
      
      // Reset form
      setFormData({
        personal: {
          firstName: '',
          lastName: '',
          employeeId: '',
          accessCardNumber: '',
          dob: '',
          gender: 'male',
          bloodGroup: '',
          maritalStatus: 'single',
        },
        contact: {
          email: '',
          phone: '',
          alternatePhone: '',
          address: {
            current: '',
            permanent: '',
          },
          emergencyContact: {
            name: '',
            relation: '',
            phone: '',
          },
        },
        statutory: {
          pan: '',
          aadhaar: '',
          uan: '',
          esic: '',
        },
        bank: {
          accountNumber: '',
          ifsc: '',
          bankName: '',
          branch: '',
          accountType: 'savings',
        },
        education: [],
        experience: [],
        employment: {
          department: '',
          designation: '',
          joiningDate: '',
          employmentType: 'fulltime',
          status: 'active',
        },
        documents: {
          driveLink: '',
        },
      });
      setCurrentStep(0);
      
      // Navigate back to employee list after a short delay
      setTimeout(() => {
        if (onBack) {
          onBack();
        }
      }, 2000);
    } catch (error: any) {
      console.error('AddEmployeeForm: Error creating employee:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create employee. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const validationErrors = Array.isArray(error.response.data.errors) 
          ? error.response.data.errors.join(', ')
          : error.response.data.errors;
        errorMessage = `Validation Error: ${validationErrors}`;
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label>
                <input
                  type="text"
                  value={formData.personal.firstName}
                  onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name*</label>
                <input
                  type="text"
                  value={formData.personal.lastName}
                  onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID*</label>
                <input
                  type="text"
                  value={formData.personal.employeeId}
                  onChange={(e) => handleInputChange('personal', 'employeeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Card Number*</label>
                <input
                  type="text"
                  value={formData.personal.accessCardNumber}
                  onChange={(e) => handleInputChange('personal', 'accessCardNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., AC123456"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth*</label>
                <input
                  type="date"
                  value={formData.personal.dob}
                  onChange={(e) => handleInputChange('personal', 'dob', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender*</label>
                <select
                  value={formData.personal.gender}
                  onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.personal.bloodGroup}
                  onChange={(e) => handleInputChange('personal', 'bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="A1+">A1+</option>
                  <option value="A1-">A1-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="A1B+">A1B+</option>
                  <option value="A1B-">A1B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status*</label>
                <select
                  value={formData.personal.maritalStatus}
                  onChange={(e) => handleInputChange('personal', 'maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Contact & Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address*</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.contact.alternatePhone}
                  onChange={(e) => handleInputChange('contact', 'alternatePhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address*</label>
                <textarea
                  value={formData.contact.address.current}
                  onChange={(e) => handleNestedInputChange('contact', 'address', 'current', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                <textarea
                  value={formData.contact.address.permanent}
                  onChange={(e) => handleNestedInputChange('contact', 'address', 'permanent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name*</label>
                  <input
                    type="text"
                    value={formData.contact.emergencyContact.name}
                    onChange={(e) => handleNestedInputChange('contact', 'emergencyContact', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation*</label>
                  <input
                    type="text"
                    value={formData.contact.emergencyContact.relation}
                    onChange={(e) => handleNestedInputChange('contact', 'emergencyContact', 'relation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
                  <input
                    type="tel"
                    value={formData.contact.emergencyContact.phone}
                    onChange={(e) => handleNestedInputChange('contact', 'emergencyContact', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department*</label>
                <input
                  type="text"
                  value={formData.employment.department}
                  onChange={(e) => handleInputChange('employment', 'department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation*</label>
                <input
                  type="text"
                  value={formData.employment.designation}
                  onChange={(e) => handleInputChange('employment', 'designation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date*</label>
                <input
                  type="date"
                  value={formData.employment.joiningDate}
                  onChange={(e) => handleInputChange('employment', 'joiningDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type*</label>
                <select
                  value={formData.employment.employmentType}
                  onChange={(e) => handleInputChange('employment', 'employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Education Details</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>
            
            {formData.education.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No education details added yet.</p>
                <p className="text-sm">Click "Add Education" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level*</label>
                        <select
                          value={edu.level}
                          onChange={(e) => updateEducation(index, 'level', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="10th">10th</option>
                          <option value="12th">12th</option>
                          <option value="diploma">Diploma</option>
                          <option value="undergraduate">Undergraduate</option>
                          <option value="postgraduate">Postgraduate</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Institution*</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year*</label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Percentage*</label>
                        <input
                          type="number"
                          value={edu.percentage}
                          onChange={(e) => updateEducation(index, 'percentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Experience</span>
              </button>
            </div>
            
            {formData.experience.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No work experience added yet.</p>
                <p className="text-sm">Click "Add Experience" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company*</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation*</label>
                        <input
                          type="text"
                          value={exp.designation}
                          onChange={(e) => updateExperience(index, 'designation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department*</label>
                        <input
                          type="text"
                          value={exp.department}
                          onChange={(e) => updateExperience(index, 'department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Date*</label>
                        <input
                          type="date"
                          value={exp.from}
                          onChange={(e) => updateExperience(index, 'from', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                        <input
                          type="date"
                          value={exp.to}
                          onChange={(e) => updateExperience(index, 'to', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={exp.current}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`current-${index}`} className="ml-2 block text-sm text-gray-900">
                          Currently working here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Statutory & Banking Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number*</label>
                <input
                  type="text"
                  value={formData.statutory.pan}
                  onChange={(e) => handleInputChange('statutory', 'pan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PF Number</label>
                <input
                  type="text"
                  value={formData.statutory.pfNumber || ''}
                  onChange={(e) => handleInputChange('statutory', 'pfNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TN/ABC/1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number*</label>
                <input
                  type="text"
                  value={formData.statutory.aadhaar}
                  onChange={(e) => handleInputChange('statutory', 'aadhaar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PF Number</label>
                <input
                  type="text"
                  value={formData.statutory.pfNumber || ''}
                  onChange={(e) => handleInputChange('statutory', 'pfNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TN/ABC/1234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UAN Number</label>
                <input
                  type="text"
                  value={formData.statutory.uan || ''}
                  onChange={(e) => handleInputChange('statutory', 'uan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ESI Number</label>
                <input
                  type="text"
                  value={formData.statutory.esic || ''}
                  onChange={(e) => handleInputChange('statutory', 'esic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 12345678901234567890"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Banking Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name*</label>
                  <input
                    type="text"
                    value={formData.bank.accountHolderName || ''}
                    onChange={(e) => handleInputChange('bank', 'accountHolderName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number*</label>
                  <input
                    type="text"
                    value={formData.bank.accountNumber}
                    onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code*</label>
                  <input
                    type="text"
                    value={formData.bank.ifsc}
                    onChange={(e) => handleInputChange('bank', 'ifsc', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name*</label>
                  <input
                    type="text"
                    value={formData.bank.bankName}
                    onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch*</label>
                  <input
                    type="text"
                    value={formData.bank.branch}
                    onChange={(e) => handleInputChange('bank', 'branch', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type*</label>
                  <select
                    value={formData.bank.accountType}
                    onChange={(e) => handleInputChange('bank', 'accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="salary">Salary</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Document Links</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📁 Required Documents to Upload</h4>
              <p className="text-xs text-blue-800 mb-3">Please upload all the following documents in a single Google Drive folder and share the link:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                <div className="space-y-1">
                  <div>• PAN Card</div>
                  <div>• Aadhaar Card</div>
                  <div>• Bank Proof</div>
                  <div>• 10th Mark Sheet</div>
                  <div>• 12th Mark Sheet</div>
                  <div>• UG Degree & Convocation Mark Sheet</div>
                  <div>• PG Degree & Convocation Mark Sheet</div>
                </div>
                <div className="space-y-1">
                  <div>• Diploma Degree & Convocation Mark Sheet</div>
                  <div>• Experience Letter</div>
                  <div>• Relieving Letter</div>
                  <div>• 3 Month Payslip</div>
                  <div>• Worley Offer Letter</div>
                  <div>• Passport Size Image</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Link (Optional)
                {formData.documents.driveLink && (
                  <span className="ml-2 text-green-600 text-xs">✓ Added</span>
                )}
              </label>
              <input
                type="url"
                value={formData.documents.driveLink || ''}
                onChange={(e) => handleInputChange('documents', 'driveLink', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formData.documents.driveLink 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                placeholder="https://drive.google.com/drive/folders/... or any document link"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add any document link (Google Drive, Dropbox, OneDrive, etc.) or leave empty
              </p>
              {formData.documents.driveLink && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700 font-medium">📁 Document Link ✓ Added</p>
                    <a 
                      href={formData.documents.driveLink.startsWith('http') ? formData.documents.driveLink : `https://${formData.documents.driveLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Open Link →
                    </a>
                  </div>
                  <p className="text-xs text-gray-600 break-all mt-1">{formData.documents.driveLink}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Step content not implemented yet</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Worley Ventures Employee</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the employee details across multiple steps</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to List</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        {/* Desktop Stepper */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Main Stepper Container */}
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    {/* Step Circle Container */}
                    <div className="flex flex-col items-center relative z-10">
                      {/* Step Circle */}
                      <div 
                        onClick={() => goToStep(index)}
                        title={`${step.title}: ${step.description}`}
                        className={`
                          relative flex items-center justify-center w-14 h-14 rounded-full border-3 transition-all duration-500 group cursor-pointer
                          ${isCompleted 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transform' 
                            : isCurrent 
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-600 text-white shadow-xl ring-4 ring-blue-100 hover:scale-105 transform' 
                            : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500'
                          }
                        `}
                      >
                        {/* Step Icon/Check */}
                        <div className="relative z-10">
                        {isCompleted ? (
                            <Check className="w-6 h-6" />
                        ) : (
                            <Icon className="w-6 h-6" />
                        )}
                        </div>
                        
                        {/* Step Number Badge */}
                        <div className={`
                          absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-md
                          ${isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : isCurrent 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-gray-400 text-white'
                          }
                        `}>
                          {index + 1}
                        </div>

                        {/* Pulse Animation for Current Step */}
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                        )}

                        {/* Hover Effect */}
                        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              
                      {/* Step Info */}
                      <div className="mt-4 text-center max-w-24">
                        <p className={`text-sm font-semibold transition-colors ${
                          isCompleted 
                            ? 'text-emerald-600' 
                            : isCurrent 
                            ? 'text-blue-600' 
                            : 'text-gray-500'
                        }`}>
                          {step.shortTitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-tight hidden xl:block">
                          {step.description}
                        </p>
                      </div>
              </div>

                    {/* Connector Line */}
              {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 relative">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                                : 'bg-gray-300'
                            }`}
                            style={{ 
                              width: isCompleted ? '100%' : '0%',
                              transitionDelay: `${index * 200}ms`
                            }}
                          />
                        </div>
                        
                        {/* Animated Progress Dot */}
                        {isCompleted && (
                          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-lg animate-pulse"></div>
                        )}
                      </div>
              )}
            </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden">
          {/* Step Progress Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
            <h3 className="text-lg font-semibold text-gray-900">Step {currentStep + 1} of {steps.length}</h3>
              <p className="text-sm text-gray-600 mt-1">Complete all steps to add employee</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>

          {/* Mobile Step Indicators */}
          <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                <div key={index} className="flex flex-col items-center relative">
                  {/* Step Circle */}
                  <div
                    onClick={() => goToStep(index)}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-500 cursor-pointer group
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white shadow-lg' 
                        : isCurrent 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-600 text-white shadow-xl ring-4 ring-blue-100' 
                        : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                    title={step.title}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    
                    {/* Step Number */}
                    <div className={`
                      absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-400 text-white'
                      }
                    `}>
                      {index + 1}
                    </div>

                    {/* Pulse for current step */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      isCompleted 
                        ? 'text-emerald-600' 
                        : isCurrent 
                        ? 'text-blue-600' 
                        : 'text-gray-500'
                    }`}>
                      {step.shortTitle}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                            : 'bg-gray-300'
                        }`}
                        style={{ 
                          width: isCompleted ? '100%' : '0%',
                          transitionDelay: `${index * 200}ms`
                        }}
                      />
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          
          {/* Current Step Info Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
            <div className="relative flex items-center space-x-4">
            <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {(() => {
                  const Icon = steps[currentStep].icon;
                    return <Icon className="w-7 h-7 text-white" />;
                })()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white mb-1">
                {steps[currentStep].title}
              </h4>
                <p className="text-blue-100 text-sm">
                {steps[currentStep].description}
              </p>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: steps.length }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i <= currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-100">
                    {currentStep + 1} of {steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="absolute top-1/2 left-0 w-full flex justify-between transform -translate-y-1/2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index <= currentStep 
                      ? 'bg-blue-600 shadow-lg' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
          </div>
          </div>
          
          {/* Step Status */}
          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Completed: {currentStep}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Current: {currentStep + 1}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              Remaining: {steps.length - currentStep - 1}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {renderStepContent()}
      </div>

      {/* Enhanced Navigation Buttons */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Previous Button */}
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
            className="group flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 order-2 sm:order-1"
        >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Previous</span>
        </button>

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4 order-1 sm:order-2">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
            </div>
        </div>

          {/* Next/Submit Button */}
        <div className="flex items-center justify-center space-x-3 order-3">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
                className="group flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">Creating Employee...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-semibold">Save Employee</span>
                  </>
                )}
            </button>
          ) : (
            <button
              onClick={nextStep}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
            >
                <span className="font-semibold">Next Step</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          )}
          </div>
        </div>

        {/* Additional Progress Info */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AddEmployeeForm;