import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Download, Users, Phone, Mail, MapPin, AlertTriangle, X, Upload, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployees, deleteEmployee, updateEmployee, bulkImportEmployees } from '../../store/slices/employeeSlice';
import { Employee } from '../../types';
import { exportToExcel, importFromExcel, downloadTemplate } from '../../utils/excelUtils';
import { formatEmployeeDocumentUrls } from '../../utils/urlUtils';

interface EmployeeListProps {
  onAddEmployee?: () => void;
}


export const EmployeeList: React.FC<EmployeeListProps> = ({ onAddEmployee }) => {
  const dispatch = useAppDispatch();
  const { employees, loading, error, pagination } = useAppSelector((state) => state.employees);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    employee: Employee | null;
  }>({
    isOpen: false,
    employee: null,
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
  }>({
    isOpen: false,
    employee: null,
  });
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
  }>({
    isOpen: false,
    employee: null,
  });

  // Excel import/export states
  const [importModal, setImportModal] = useState<{
    isOpen: boolean;
    file: File | null;
    preview: Employee[] | null;
  }>({
    isOpen: false,
    file: null,
    preview: null,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    success: number;
    failed: number;
    errors: Array<{ index: number; employee: string; error: string }>;
  }>({
    current: 0,
    total: 0,
    success: 0,
    failed: 0,
    errors: []
  });

  // Fetch employees on component mount
  useEffect(() => {
    dispatch(fetchEmployees({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle search and filter changes
  useEffect(() => {
    const searchParams = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      department: selectedDepartment || undefined,
      status: selectedStatus || undefined,
    };
    dispatch(fetchEmployees(searchParams));
  }, [dispatch, searchTerm, selectedDepartment, selectedStatus, currentPage, itemsPerPage]);

  const departments = Array.from(new Set(employees.map(emp => emp.employment?.department || 'Unknown')));
  const statuses = Array.from(new Set(employees.map(emp => emp.employment?.status || 'Unknown')));

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Calculate pagination info
  const totalPages = pagination.totalPages || 1;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, pagination.totalEmployees || 0);
  const totalItems = pagination.totalEmployees || 0;

  // Delete employee handler
  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteConfirm({
      isOpen: true,
      employee: employee,
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.employee) {
      try {
        await dispatch(deleteEmployee(deleteConfirm.employee._id!)).unwrap();
        setDeleteConfirm({ isOpen: false, employee: null });
        // No need to refresh - Redux state is already updated by deleteEmployee.fulfilled
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, employee: null });
  };

  // Edit employee handlers
  const handleEditEmployee = (employee: Employee) => {
    console.log('EmployeeList: Loading employee for edit:', employee);
    setEditModal({
      isOpen: true,
      employee: employee,
    });
    
    // Map the employee data to the expected form structure
    const mappedData = {
      ...employee,
      personal: {
        ...employee.personal,
        firstName: employee.firstName || employee.personal?.firstName || '',
        lastName: employee.lastName || employee.personal?.lastName || '',
        employeeId: employee.personal?.employeeId || '',
        dob: employee.personal?.dob ? (typeof employee.personal.dob === 'string' ? employee.personal.dob.split('T')[0] : new Date(employee.personal.dob).toISOString().split('T')[0]) : '',
        gender: employee.personal?.gender || 'male',
        bloodGroup: employee.personal?.bloodGroup || '',
        maritalStatus: employee.personal?.maritalStatus || 'single',
      },
      contact: {
        ...employee.contact,
        email: employee.email || employee.contact?.email || '',
        phone: employee.contact?.phone || '',
        alternatePhone: employee.contact?.alternatePhone || '',
        address: {
          current: employee.contact?.address?.current || '',
          permanent: employee.contact?.address?.permanent || '',
        },
        emergencyContact: {
          name: employee.contact?.emergencyContact?.name || '',
          relation: employee.contact?.emergencyContact?.relation || '',
          phone: employee.contact?.emergencyContact?.phone || '',
        }
      },
      employment: {
        ...employee.employment,
        department: employee.employment?.department || '',
        designation: employee.employment?.designation || '',
        joiningDate: employee.employment?.joiningDate ? (typeof employee.employment.joiningDate === 'string' ? employee.employment.joiningDate.split('T')[0] : new Date(employee.employment.joiningDate).toISOString().split('T')[0]) : '',
        employmentType: employee.employment?.employmentType || 'fulltime',
        status: employee.employment?.status || 'active',
      },
      statutory: {
        ...employee.statutory,
        pan: employee.statutory?.pan || '',
        aadhaar: employee.statutory?.aadhaar || '',
        uan: employee.statutory?.uan || '',
        esic: employee.statutory?.esic || '',
      },
      bank: {
        ...employee.bank,
        accountNumber: employee.bank?.accountNumber || '',
        ifsc: employee.bank?.ifsc || '',
        bankName: employee.bank?.bankName || '',
        branch: employee.bank?.branch || '',
        accountType: employee.bank?.accountType || 'savings',
      },
      education: employee.education || [],
      experience: employee.experience || [],
      documents: {
        driveLink: employee.documents?.driveLink || '',
      },
    };
    
    console.log('EmployeeList: Mapped edit form data:', mappedData);
    setEditFormData(mappedData);
  };

  const handleNestedEditFormChange = (section: string, field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof Employee] as any || {}),
        [field]: value
      }
    }));
  };

  const handleDeepNestedEditFormChange = (section: string, nestedSection: string, field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof Employee] as any || {}),
        [nestedSection]: {
          ...(prev[section as keyof Employee] as any)?.[nestedSection] || {},
          [field]: value
        }
      }
    }));
  };

  // Comprehensive validation function for edit form
  const validateEditFormData = () => {
    const errors: string[] = [];

    // Personal Information Validation
    if (!editFormData.personal?.firstName?.trim()) {
      errors.push('First Name is required');
    } else if (editFormData.personal.firstName.trim().length < 2) {
      errors.push('First Name must be at least 2 characters long');
    } else if (editFormData.personal.firstName.trim().length > 50) {
      errors.push('First Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(editFormData.personal.firstName.trim())) {
      errors.push('First Name can only contain letters and spaces');
    }

    if (!editFormData.personal?.lastName?.trim()) {
      errors.push('Last Name is required');
    } else if (editFormData.personal.lastName.trim().length < 1) {
      errors.push('Last Name cannot be empty');
    } else if (editFormData.personal.lastName.trim().length > 50) {
      errors.push('Last Name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(editFormData.personal.lastName.trim())) {
      errors.push('Last Name can only contain letters and spaces');
    }

    if (!editFormData.personal?.employeeId?.trim()) {
      errors.push('Employee ID is required');
    } else if (editFormData.personal.employeeId.trim().length < 3) {
      errors.push('Employee ID must be at least 3 characters long');
    } else if (editFormData.personal.employeeId.trim().length > 20) {
      errors.push('Employee ID cannot exceed 20 characters');
    } else if (!/^[A-Z0-9]+$/.test(editFormData.personal.employeeId.trim())) {
      errors.push('Employee ID can only contain uppercase letters and numbers');
    }

    if (!editFormData.personal?.accessCardNumber?.trim()) {
      errors.push('Access Card Number is required');
    } else if (editFormData.personal.accessCardNumber.trim().length < 3) {
      errors.push('Access Card Number must be at least 3 characters long');
    } else if (editFormData.personal.accessCardNumber.trim().length > 20) {
      errors.push('Access Card Number cannot exceed 20 characters');
    } else if (!/^[A-Z0-9]+$/.test(editFormData.personal.accessCardNumber.trim())) {
      errors.push('Access Card Number can only contain uppercase letters and numbers');
    }

    if (editFormData.personal?.dob) {
      const dob = new Date(editFormData.personal.dob);
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

    if (!editFormData.personal?.maritalStatus?.trim()) {
      errors.push('Marital Status is required');
    } else if (!['single', 'married', 'divorced', 'widowed', 'separated'].includes(editFormData.personal.maritalStatus)) {
      errors.push('Please select a valid Marital Status');
    }

    // Contact Information Validation
    if (!editFormData.contact?.email?.trim()) {
      errors.push('Email Address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.contact.email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (editFormData.contact.email.trim().length > 100) {
      errors.push('Email address cannot exceed 100 characters');
    }

    if (!editFormData.contact?.phone?.trim()) {
      errors.push('Phone Number is required');
    } else if (!/^[0-9+\-\s()]+$/.test(editFormData.contact.phone.trim())) {
      errors.push('Phone Number can only contain numbers, spaces, +, -, and parentheses');
    } else if (editFormData.contact.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.push('Phone Number must have at least 10 digits');
    } else if (editFormData.contact.phone.replace(/[^0-9]/g, '').length > 15) {
      errors.push('Phone Number cannot exceed 15 digits');
    }

    if (editFormData.contact?.alternatePhone?.trim()) {
      if (!/^[0-9+\-\s()]+$/.test(editFormData.contact.alternatePhone.trim())) {
        errors.push('Alternate Phone Number can only contain numbers, spaces, +, -, and parentheses');
      } else if (editFormData.contact.alternatePhone.replace(/[^0-9]/g, '').length < 10) {
        errors.push('Alternate Phone Number must have at least 10 digits');
      } else if (editFormData.contact.alternatePhone.replace(/[^0-9]/g, '').length > 15) {
        errors.push('Alternate Phone Number cannot exceed 15 digits');
      }
    }

    if (!editFormData.contact?.address?.current?.trim()) {
      errors.push('Current Address is required');
    } else if (editFormData.contact.address.current.trim().length < 10) {
      errors.push('Current Address must be at least 10 characters long');
    } else if (editFormData.contact.address.current.trim().length > 500) {
      errors.push('Current Address cannot exceed 500 characters');
    }

    if (editFormData.contact?.address?.permanent?.trim()) {
      if (editFormData.contact.address.permanent.trim().length < 10) {
        errors.push('Permanent Address must be at least 10 characters long');
      } else if (editFormData.contact.address.permanent.trim().length > 500) {
        errors.push('Permanent Address cannot exceed 500 characters');
      }
    }

    // Emergency Contact Validation
    if (!editFormData.contact?.emergencyContact?.name?.trim()) {
      errors.push('Emergency Contact Name is required');
    } else if (editFormData.contact.emergencyContact.name.trim().length < 2) {
      errors.push('Emergency Contact Name must be at least 2 characters long');
    } else if (editFormData.contact.emergencyContact.name.trim().length > 100) {
      errors.push('Emergency Contact Name cannot exceed 100 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(editFormData.contact.emergencyContact.name.trim())) {
      errors.push('Emergency Contact Name can only contain letters and spaces');
    }

    if (!editFormData.contact?.emergencyContact?.relation?.trim()) {
      errors.push('Emergency Contact Relation is required');
    } else if (editFormData.contact.emergencyContact.relation.trim().length < 2) {
      errors.push('Emergency Contact Relation must be at least 2 characters long');
    } else if (editFormData.contact.emergencyContact.relation.trim().length > 50) {
      errors.push('Emergency Contact Relation cannot exceed 50 characters');
    }

    if (!editFormData.contact?.emergencyContact?.phone?.trim()) {
      errors.push('Emergency Contact Phone Number is required');
    } else if (!/^[0-9+\-\s()]+$/.test(editFormData.contact.emergencyContact.phone.trim())) {
      errors.push('Emergency Contact Phone Number can only contain numbers, spaces, +, -, and parentheses');
    } else if (editFormData.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.push('Emergency Contact Phone Number must have at least 10 digits');
    } else if (editFormData.contact.emergencyContact.phone.replace(/[^0-9]/g, '').length > 15) {
      errors.push('Emergency Contact Phone Number cannot exceed 15 digits');
    }

    // Employment Information Validation
    if (!editFormData.employment?.department?.trim()) {
      errors.push('Department is required');
    } else if (editFormData.employment.department.trim().length < 2) {
      errors.push('Department must be at least 2 characters long');
    } else if (editFormData.employment.department.trim().length > 100) {
      errors.push('Department cannot exceed 100 characters');
    }

    if (!editFormData.employment?.designation?.trim()) {
      errors.push('Designation is required');
    } else if (editFormData.employment.designation.trim().length < 2) {
      errors.push('Designation must be at least 2 characters long');
    } else if (editFormData.employment.designation.trim().length > 100) {
      errors.push('Designation cannot exceed 100 characters');
    }

    if (!editFormData.employment?.joiningDate) {
      errors.push('Joining Date is required');
    } else {
      const joiningDate = new Date(editFormData.employment.joiningDate);
      const today = new Date();
      
      if (joiningDate > today) {
        errors.push('Joining Date cannot be in the future');
      } else if (joiningDate < new Date('1900-01-01')) {
        errors.push('Please enter a valid Joining Date');
      }
    }

    // Statutory Information Validation
    if (!editFormData.statutory?.pan?.trim()) {
      errors.push('PAN Number is required');
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(editFormData.statutory.pan.trim())) {
      errors.push('PAN Number must be in format: AAAAA9999A (5 letters, 4 numbers, 1 letter)');
    }

    if (!editFormData.statutory?.aadhaar?.trim()) {
      errors.push('Aadhaar Number is required');
    } else if (!/^[0-9]{12}$/.test(editFormData.statutory.aadhaar.trim())) {
      errors.push('Aadhaar Number must be exactly 12 digits');
    }

    if (editFormData.statutory?.uan?.trim()) {
      if (!/^[0-9]{12}$/.test(editFormData.statutory.uan.trim())) {
        errors.push('UAN Number must be exactly 12 digits');
      }
    }

    if (editFormData.statutory?.esic?.trim()) {
      if (!/^[0-9]{10}$/.test(editFormData.statutory.esic.trim())) {
        errors.push('ESIC Number must be exactly 10 digits');
      }
    }

    if (editFormData.statutory?.pfNumber?.trim()) {
      if (!/^[A-Za-z0-9\/-]{6,25}$/.test(editFormData.statutory.pfNumber.trim())) {
        errors.push('PF Number must be 6-25 characters, letters/numbers/"/"/"-"');
      }
    }

    // Banking Details Validation
    if (!editFormData.bank?.accountHolderName?.trim()) {
      errors.push('Account Holder Name is required');
    }
    if (!editFormData.bank?.accountNumber?.trim()) {
      errors.push('Account Number is required');
    } else if (!/^[0-9]{9,18}$/.test(editFormData.bank.accountNumber.trim())) {
      errors.push('Account Number must be between 9 and 18 digits');
    }

    if (!editFormData.bank?.ifsc?.trim()) {
      errors.push('IFSC Code is required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(editFormData.bank.ifsc.trim())) {
      errors.push('IFSC Code must be in format: AAAA0XXXXXX (4 letters, 0, 6 alphanumeric)');
    }

    if (!editFormData.bank?.bankName?.trim()) {
      errors.push('Bank Name is required');
    } else if (editFormData.bank.bankName.trim().length < 2) {
      errors.push('Bank Name must be at least 2 characters long');
    } else if (editFormData.bank.bankName.trim().length > 100) {
      errors.push('Bank Name cannot exceed 100 characters');
    }

    if (!editFormData.bank?.branch?.trim()) {
      errors.push('Branch is required');
    } else if (editFormData.bank.branch.trim().length < 2) {
      errors.push('Branch must be at least 2 characters long');
    } else if (editFormData.bank.branch.trim().length > 100) {
      errors.push('Branch cannot exceed 100 characters');
    }

    // Education Validation
    if (editFormData.education && editFormData.education.length > 0) {
      editFormData.education.forEach((edu, index) => {
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
    if (editFormData.experience && editFormData.experience.length > 0) {
      editFormData.experience.forEach((exp, index) => {
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

    // Document Validation - Document Link is optional
    if (editFormData.documents?.driveLink?.trim() && !/^https?:\/\/.+/.test(editFormData.documents.driveLink.trim())) {
      errors.push('Please enter a valid URL');
    }

    return errors;
  };

  const confirmEdit = async () => {
    if (editModal.employee && editFormData) {
      try {
        // Comprehensive validation
        const validationErrors = validateEditFormData();
        if (validationErrors.length > 0) {
          alert(`Validation Error: ${validationErrors.join(', ')}`);
          return;
        }

        const currentEmployeeId = editModal.employee._id;
        // Check for duplicate Employee ID and Access Card Number (excluding current employee)
        const existingEmployees = await dispatch(fetchEmployees({ page: 1, limit: 1000 })).unwrap();
        const duplicateEmployeeId = existingEmployees.employees.find((emp: Employee) => 
          emp.personal?.employeeId === editFormData.personal?.employeeId && 
          emp._id !== currentEmployeeId
        );
        const duplicateAccessCard = existingEmployees.employees.find((emp: Employee) => 
          emp.personal?.accessCardNumber === editFormData.personal?.accessCardNumber && 
          emp._id !== currentEmployeeId
        );

        if (duplicateEmployeeId) {
          alert('Employee ID already exists. Please use a different Employee ID.');
          return;
        }

        if (duplicateAccessCard) {
          alert('Access Card Number already exists. Please use a different Access Card Number.');
          return;
        }

        // Format document URLs before updating
        const formattedData = formatEmployeeDocumentUrls(editFormData);
        console.log('EmployeeList: Updating employee with data:', formattedData);
        await dispatch(updateEmployee({ 
          id: editModal.employee._id!, 
          employeeData: formattedData 
        })).unwrap();
        console.log('EmployeeList: Employee updated successfully');
        setEditModal({ isOpen: false, employee: null });
        setEditFormData({});
        // No need to refresh - Redux state is already updated by updateEmployee.fulfilled
      } catch (error: any) {
        console.error('Failed to update employee:', error);
        
        // Handle different types of errors
        let errorMessage = 'Failed to update employee. Please try again.';
        
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
        
        // You could add a toast notification here if you have one
        alert(errorMessage);
      }
    }
  };

  const cancelEdit = () => {
    setEditModal({ isOpen: false, employee: null });
    setEditFormData({});
  };

  // View employee handlers
  const handleViewEmployee = (employee: Employee) => {
    setViewModal({
      isOpen: true,
      employee: employee,
    });
  };

  const closeView = () => {
    setViewModal({ isOpen: false, employee: null });
  };

  // Excel Export Functions
  const handleExportToExcel = () => {
    const filename = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(employees, filename);
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  // Export single employee to Excel
  const handleExportSingleEmployee = (employee: Employee) => {
    const filename = `${employee.personal?.employeeId || 'employee'}_${employee.firstName || employee.personal?.firstName || 'unknown'}_${employee.lastName || employee.personal?.lastName || 'unknown'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel([employee], filename);
  };

  // Excel Import Functions
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportModal(prev => ({ ...prev, file }));

    try {
      const preview = await importFromExcel(file);
      setImportModal(prev => ({ ...prev, preview }));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse Excel file');
    }
  };

  const handleImportConfirm = async () => {
    if (!importModal.preview) return;

    setIsImporting(true);
    setImportError(null);
    
    // Initialize progress tracking
    setImportProgress({
      current: 0,
      total: importModal.preview.length,
      success: 0,
      failed: 0,
      errors: []
    });

    try {
      // Use bulk import for better performance
      const result = await dispatch(bulkImportEmployees(importModal.preview)).unwrap();
      
      // Update progress with results
      setImportProgress({
        current: result.results.total,
        total: result.results.total,
        success: result.results.success,
        failed: result.results.failed,
        errors: result.results.errors || []
      });

      // Refresh the employee list
      await dispatch(fetchEmployees({ page: 1, limit: 10 })).unwrap();

      // Show results
      if (result.results.failed > 0) {
        setImportError(`Import completed with errors. ${result.results.success} employees imported successfully, ${result.results.failed} failed. Check the error details below.`);
      } else {
        setImportError(null);
        // Close modal and reset state only if all successful
        setImportModal({ isOpen: false, file: null, preview: null });
        setImportProgress({
          current: 0,
          total: 0,
          success: 0,
          failed: 0,
          errors: []
        });
      }
    } catch (error: any) {
      console.error('Bulk import error:', error);
      setImportError(error?.message || 'Failed to import employees');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportCancel = () => {
    setImportModal({ isOpen: false, file: null, preview: null });
    setImportError(null);
    setImportProgress({
      current: 0,
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    });
  };

  // Education and Experience helper functions
  const addEducation = () => {
    setEditFormData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
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
    setEditFormData(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      education: (prev.education || []).map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setEditFormData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
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
    setEditFormData(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      experience: (prev.experience || []).map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Worley Ventures Employees</h1>
            <p className="text-gray-600">Manage and view all Worley Ventures employee information</p>
          </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={onAddEmployee}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
          
          <button
            onClick={handleExportToExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
          
          <button
            onClick={() => setImportModal({ isOpen: true, file: null, preview: null })}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </button>
          
          {/* <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Download Excel template with instructions and examples"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button> */}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Clear Filters
            </button>

            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count and Pagination Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} employees
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading employees...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Employee List */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ESI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.firstName || employee.personal?.firstName} {employee.lastName || employee.personal?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.personal?.employeeId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email || employee.contact?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{employee.contact?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.employment?.department || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{employee.employment?.designation || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.personal?.accessCardNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.statutory?.esic || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.employment?.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.employment?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleExportSingleEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Export Employee"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {employees.map((employee) => (
              <div key={employee._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {employee.firstName || employee.personal?.firstName} {employee.lastName || employee.personal?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.personal?.employeeId || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.employment?.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.employment?.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {employee.email || employee.contact?.email || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {employee.contact?.phone || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {employee.employment?.department || 'N/A'} - {employee.employment?.designation || 'N/A'}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleViewEmployee(employee)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleExportSingleEmployee(employee)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {employee.firstName || employee.personal?.firstName} {employee.lastName || employee.personal?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{employee.personal?.employeeId || 'N/A'}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  employee.employment?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.employment?.status || 'Unknown'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="truncate">{employee.email || employee.contact?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  {employee.contact?.phone || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="truncate">{employee.employment?.department || 'N/A'} - {employee.employment?.designation || 'N/A'}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewEmployee(employee)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button 
                  onClick={() => handleEditEmployee(employee)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => handleExportSingleEmployee(employee)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                <button 
                  onClick={() => handleDeleteEmployee(employee)}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && employees.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                  </>
                )}

                {/* Page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'text-white bg-blue-600 border border-blue-600'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedDepartment || selectedStatus 
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by adding your first employee.'}
          </p>
          <button 
            onClick={onAddEmployee}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Employee
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-900">
                    {deleteConfirm.employee?.firstName || deleteConfirm.employee?.personal?.firstName} {deleteConfirm.employee?.lastName || deleteConfirm.employee?.personal?.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModal.isOpen && editModal.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Employee
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.personal?.firstName || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.personal?.lastName || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        value={editFormData.personal?.employeeId || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'employeeId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Card Number *
                      </label>
                      <input
                        type="text"
                        value={editFormData.personal?.accessCardNumber || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'accessCardNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., AC123456"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={editFormData.personal?.dob || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'dob', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        value={editFormData.personal?.gender || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={editFormData.personal?.bloodGroup || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'bloodGroup', e.target.value)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status *
                      </label>
                      <select
                        value={editFormData.personal?.maritalStatus || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'maritalStatus', e.target.value)}
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

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={editFormData.contact?.email || ''}
                        onChange={(e) => handleNestedEditFormChange('contact', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={editFormData.contact?.phone || ''}
                        onChange={(e) => handleNestedEditFormChange('contact', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={editFormData.contact?.alternatePhone || ''}
                        onChange={(e) => handleNestedEditFormChange('contact', 'alternatePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Address *
                    </label>
                    <textarea
                      value={editFormData.contact?.address?.current || ''}
                      onChange={(e) => handleDeepNestedEditFormChange('contact', 'address', 'current', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      value={editFormData.contact?.address?.permanent || ''}
                      onChange={(e) => handleDeepNestedEditFormChange('contact', 'address', 'permanent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h5 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          value={editFormData.contact?.emergencyContact?.name || ''}
                          onChange={(e) => handleDeepNestedEditFormChange('contact', 'emergencyContact', 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relation *
                        </label>
                        <input
                          type="text"
                          value={editFormData.contact?.emergencyContact?.relation || ''}
                          onChange={(e) => handleDeepNestedEditFormChange('contact', 'emergencyContact', 'relation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={editFormData.contact?.emergencyContact?.phone || ''}
                          onChange={(e) => handleDeepNestedEditFormChange('contact', 'emergencyContact', 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department *
                      </label>
                      <input
                        type="text"
                        value={editFormData.employment?.department || ''}
                        onChange={(e) => handleNestedEditFormChange('employment', 'department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        value={editFormData.employment?.designation || ''}
                        onChange={(e) => handleNestedEditFormChange('employment', 'designation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Joining Date *
                      </label>
                      <input
                        type="date"
                        value={editFormData.employment?.joiningDate || ''}
                        onChange={(e) => handleNestedEditFormChange('employment', 'joiningDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type *
                      </label>
                      <select
                        value={editFormData.employment?.employmentType || ''}
                        onChange={(e) => handleNestedEditFormChange('employment', 'employmentType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="fulltime">Full Time</option>
                        <option value="parttime">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={editFormData.employment?.status || ''}
                        onChange={(e) => handleNestedEditFormChange('employment', 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Statutory Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statutory Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        value={editFormData.statutory?.pan || ''}
                        onChange={(e) => handleNestedEditFormChange('statutory', 'pan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Number *
                      </label>
                      <input
                        type="text"
                        value={editFormData.statutory?.aadhaar || ''}
                        onChange={(e) => handleNestedEditFormChange('statutory', 'aadhaar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UAN Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.statutory?.uan || ''}
                        onChange={(e) => handleNestedEditFormChange('statutory', 'uan', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ESIC Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.statutory?.esic || ''}
                        onChange={(e) => handleNestedEditFormChange('statutory', 'esic', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PF Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.statutory?.pfNumber || ''}
                        onChange={(e) => handleNestedEditFormChange('statutory', 'pfNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., TN/ABC/1234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.bank?.accountHolderName || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'accountHolderName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={editFormData.bank?.accountNumber || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        value={editFormData.bank?.ifsc || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'ifsc', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData.bank?.bankName || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'bankName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch *
                      </label>
                      <input
                        type="text"
                        value={editFormData.bank?.branch || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'branch', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type *
                      </label>
                      <select
                        value={editFormData.bank?.accountType || ''}
                        onChange={(e) => handleNestedEditFormChange('bank', 'accountType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="salary">Salary</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Education Details</h4>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Education</span>
                    </button>
                  </div>
                  
                  {(!editFormData.education || editFormData.education.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No education details added yet.</p>
                      <p className="text-sm">Click "Add Education" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editFormData.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Education {index + 1}</h5>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                              <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                              <input
                                type="number"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage *</label>
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

                {/* Experience Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Work Experience</h4>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>
                  
                  {(!editFormData.experience || editFormData.experience.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No work experience added yet.</p>
                      <p className="text-sm">Click "Add Experience" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {editFormData.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Experience {index + 1}</h5>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                              <input
                                type="text"
                                value={exp.designation}
                                onChange={(e) => updateExperience(index, 'designation', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                              <input
                                type="text"
                                value={exp.department}
                                onChange={(e) => updateExperience(index, 'department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">From Date *</label>
                              <input
                                type="date"
                                value={exp.from ? (typeof exp.from === 'string' ? exp.from.split('T')[0] : new Date(exp.from).toISOString().split('T')[0]) : ''}
                                onChange={(e) => updateExperience(index, 'from', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                              <input
                                type="date"
                                value={exp.to ? (typeof exp.to === 'string' ? exp.to.split('T')[0] : new Date(exp.to).toISOString().split('T')[0]) : ''}
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

                {/* Documents Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Document Links</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">📁 Required Documents to Upload</h5>
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
                        {editFormData.documents?.driveLink && (
                          <span className="ml-2 text-green-600 text-xs">✓ Added</span>
                        )}
                      </label>
                      <input
                        type="url"
                        value={editFormData.documents?.driveLink || ''}
                        onChange={(e) => handleNestedEditFormChange('documents', 'driveLink', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          editFormData.documents?.driveLink 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="https://drive.google.com/drive/folders/... or any document link"
                      />
                    <p className="text-xs text-gray-500 mt-1">
                      Add any document link (Google Drive, Dropbox, OneDrive, etc.) or leave empty
                    </p>
                    {editFormData.documents?.driveLink && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-green-700 font-medium">📁 Document Link ✓ Added</p>
                          <a 
                            href={editFormData.documents.driveLink.startsWith('http') ? editFormData.documents.driveLink : `https://${editFormData.documents.driveLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Open Link →
                          </a>
                        </div>
                        <p className="text-xs text-gray-600 break-all mt-1">{editFormData.documents.driveLink}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEdit}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {viewModal.isOpen && viewModal.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Employee Details
                </h3>
                <button
                  onClick={closeView}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.firstName || viewModal.employee.personal?.firstName || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.lastName || viewModal.employee.personal?.lastName || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.personal?.employeeId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Card Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.personal?.accessCardNumber || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.personal?.dob ? new Date(viewModal.employee.personal.dob).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                        {viewModal.employee.personal?.gender || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.personal?.bloodGroup || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                        {viewModal.employee.personal?.maritalStatus || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.email || viewModal.employee.contact?.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.contact?.phone || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternate Phone
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.contact?.alternatePhone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Address
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[80px]">
                      {viewModal.employee.contact?.address?.current || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permanent Address
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[80px]">
                      {viewModal.employee.contact?.address?.permanent || 'N/A'}
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4">
                    <h5 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Name
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {viewModal.employee.contact?.emergencyContact?.name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relation
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {viewModal.employee.contact?.emergencyContact?.relation || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {viewModal.employee.contact?.emergencyContact?.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.employment?.department || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.employment?.designation || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Joining Date
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.employment?.joiningDate ? new Date(viewModal.employee.employment.joiningDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employment Type
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                        {viewModal.employee.employment?.employmentType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          viewModal.employee.employment?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : viewModal.employee.employment?.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {viewModal.employee.employment?.status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statutory Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.statutory?.pan || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.statutory?.aadhaar || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UAN Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.statutory?.uan || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ESIC Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.statutory?.esic || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.bank?.accountNumber || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.bank?.ifsc || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.bank?.bankName || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {viewModal.employee.bank?.branch || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                        {viewModal.employee.bank?.accountType || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Education Details</h4>
                  {(!viewModal.employee.education || viewModal.employee.education.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No education details available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {viewModal.employee.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-4">Education {index + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                                {edu.level || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {edu.institution || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {edu.year || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {edu.percentage ? `${edu.percentage}%` : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Work Experience</h4>
                  {(!viewModal.employee.experience || viewModal.employee.experience.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No work experience available.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {viewModal.employee.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-4">Experience {index + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {exp.company || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {exp.designation || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {exp.department || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {exp.from ? new Date(exp.from).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {exp.current ? 'Present' : (exp.to ? new Date(exp.to).toLocaleDateString() : 'N/A')}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  exp.current 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {exp.current ? 'CURRENT' : 'PREVIOUS'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Document Links</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">📁 Required Documents</h5>
                    <p className="text-xs text-blue-800 mb-3">All documents should be uploaded in a single Google Drive folder:</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Link
                      {viewModal.employee.documents?.driveLink && (
                        <span className="ml-2 text-green-600 text-xs">✓ Added</span>
                      )}
                    </label>
                    <div className={`px-3 py-2 border rounded-lg text-gray-900 ${
                      viewModal.employee.documents?.driveLink 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      {viewModal.employee.documents?.driveLink ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700 font-medium">📁 Document Link ✓ Added</span>
                            <a 
                              href={viewModal.employee.documents.driveLink.startsWith('http') ? viewModal.employee.documents.driveLink : `https://${viewModal.employee.documents.driveLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Open Link →
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 break-all mt-1">{viewModal.employee.documents.driveLink}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">No link provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={closeView}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Close
                </button>
                  <button
                    onClick={() => {
                      closeView();
                      handleEditEmployee(viewModal.employee!);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Edit Employee
                  </button>
                  <button
                    onClick={() => {
                      if (viewModal.employee) {
                        handleExportSingleEmployee(viewModal.employee);
                      }
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Employee
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {importModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Import Employees from Excel</h3>
                <button
                  onClick={handleImportCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!importModal.file ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Select Excel File</h4>
                    <p className="text-gray-600 mb-4">
                      Choose an Excel file to import employee data. Make sure the file follows the correct format.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Important:</strong> If you downloaded our template, make sure to delete the instruction row (Row 1) before importing your data.
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="excel-file-input"
                    />
                    <label
                      htmlFor="excel-file-input"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">📋 Need a template?</h5>
                    <p className="text-blue-700 text-sm mb-3">
                      Download our comprehensive Excel template with detailed instructions and examples to ensure your data is in the correct format.
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-blue-600 text-xs font-medium">Template includes:</p>
                      <ul className="text-blue-600 text-xs space-y-1 ml-4">
                        <li>• Detailed field specifications and validation rules</li>
                        <li>• Two complete example employees with education & experience</li>
                        <li>• Empty rows ready for your data</li>
                        <li>• Separate instructions sheet with troubleshooting guide</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">File Selected</h4>
                      <p className="text-sm text-gray-600">{importModal.file.name}</p>
                    </div>
                    <button
                      onClick={() => setImportModal({ isOpen: true, file: null, preview: null })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {importError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                        <p className="text-red-700">{importError}</p>
                      </div>
                    </div>
                  )}

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-700 font-medium">Importing employees...</span>
                        <span className="text-blue-600 text-sm">
                          {importProgress.current} / {importProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Success: {importProgress.success}</span>
                        <span>Failed: {importProgress.failed}</span>
                      </div>
                    </div>
                  )}

                  {/* Detailed Error List */}
                  {importProgress.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-900 mb-3">Import Errors:</h5>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {importProgress.errors.map((error, index) => (
                          <div key={index} className="bg-red-100 border border-red-200 rounded p-2">
                            <div className="flex items-start">
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-red-800 font-medium text-sm">
                                  Row {error.index}: {error.employee}
                                </p>
                                <p className="text-red-700 text-xs mt-1">{error.error}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {importModal.preview && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Check className="w-5 h-5 text-green-400 mr-2" />
                          <p className="text-green-700">
                            Successfully parsed {importModal.preview.length} employee(s) from the Excel file.
                          </p>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        <h5 className="font-medium text-gray-900 mb-3">Preview Data:</h5>
                        <div className="space-y-2">
                          {importModal.preview.slice(0, 5).map((employee, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {employee.firstName || employee.personal?.firstName} {employee.lastName || employee.personal?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {employee.email || employee.contact?.email} • {employee.employment?.department}
                                  </p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Row {index + 1}
                                </span>
                              </div>
                            </div>
                          ))}
                          {importModal.preview.length > 5 && (
                            <p className="text-sm text-gray-500 text-center py-2">
                              ... and {importModal.preview.length - 5} more employees
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        {importProgress.errors.length > 0 ? (
                          <button
                            onClick={handleImportCancel}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Close
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleImportCancel}
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleImportConfirm}
                              disabled={isImporting}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isImporting ? 'Importing...' : `Import ${importModal.preview.length} Employee(s)`}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList