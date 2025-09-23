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

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.personal.firstName || !formData.personal.lastName || !formData.personal.employeeId || !formData.personal.accessCardNumber || !formData.contact.email) {
        setToastMessage('Please fill in all required fields (First Name, Last Name, Employee ID, Access Card Number, Email)');
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Document validation
      if (!formData.documents.driveLink) {
        setToastMessage('Please provide the Google Drive link with all required documents');
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Employment validation
      if (!formData.employment.department || !formData.employment.designation || !formData.employment.joiningDate) {
        setToastMessage('Please fill in all required employment fields (Department, Designation, Joining Date)');
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Contact validation
      if (!formData.contact.phone) {
        setToastMessage('Please provide a phone number');
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
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
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
                Google Drive Link *
                {formData.documents.driveLink && (
                  <span className="ml-2 text-green-600 text-xs">✓ Uploaded</span>
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
                placeholder="https://drive.google.com/drive/folders/..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Share the Google Drive folder link with "Anyone with the link can view" permission
              </p>
              {formData.documents.driveLink && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700 font-medium">📁 Document Folder ✓ Ready</p>
                    <a 
                      href={formData.documents.driveLink.startsWith('http') ? formData.documents.driveLink : `https://${formData.documents.driveLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Open Drive Folder →
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
      <div className="p-4 sm:p-6 border-b border-gray-200">
        {/* Desktop Stepper */}
        <div className="hidden lg:block">
          <div className="relative overflow-x-auto pb-4">
            <div className="flex items-center justify-start space-x-2 min-w-max">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      {/* Step Circle */}
                      <div 
                        onClick={() => goToStep(index)}
                        title={`${step.title}: ${step.description}`}
                        className={`
                          relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 group
                          ${isCompleted 
                            ? 'bg-green-500 border-green-500 text-white shadow-lg cursor-pointer hover:bg-green-600 hover:shadow-xl' 
                            : isCurrent 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-100 cursor-pointer' 
                            : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        
                        {/* Step Number Badge */}
                        <div className={`
                          absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center
                          ${isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isCurrent 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-gray-400 text-white'
                          }
                        `}>
                          {index + 1}
                        </div>
              </div>
              
                      {/* Step Info */}
                      <div className="mt-2 text-center max-w-20">
                        <p className={`text-xs font-medium transition-colors ${
                          isCompleted 
                            ? 'text-green-600' 
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

                    {/* Connector Line - Only show between steps */}
              {index < steps.length - 1 && (
                      <div className={`
                        w-8 h-0.5 mx-2 transition-colors duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
              )}
            </div>
                );
              })}
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Step {currentStep + 1} of {steps.length}</h3>
            <div className="flex items-center space-x-1 overflow-x-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                    title={step.title}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Current Step Info */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {(() => {
                  const Icon = steps[currentStep].icon;
                  return <Icon className="w-5 h-5 text-white" />;
                })()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-blue-900">
                {steps[currentStep].title}
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span className="font-medium">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center justify-center space-x-2 order-1 sm:order-2">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        <div className="flex items-center justify-center space-x-3 order-3">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Save Employee'}</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
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