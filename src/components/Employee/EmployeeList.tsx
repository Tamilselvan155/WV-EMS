import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Download, Users, Phone, Mail, MapPin, AlertTriangle, X, Upload, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEmployees, deleteEmployee, updateEmployee, createEmployee } from '../../store/slices/employeeSlice';
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

  // Fetch employees on component mount
  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Handle search and filter changes
  useEffect(() => {
    const searchParams = {
      page: 1,
      limit: 10,
      search: searchTerm || undefined,
      department: selectedDepartment || undefined,
      status: selectedStatus || undefined,
    };
    dispatch(fetchEmployees(searchParams));
  }, [dispatch, searchTerm, selectedDepartment, selectedStatus]);

  const departments = Array.from(new Set(employees.map(emp => emp.employment?.department || 'Unknown')));
  const statuses = Array.from(new Set(employees.map(emp => emp.employment?.status || 'Unknown')));

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

  const confirmEdit = async () => {
    if (editModal.employee && editFormData) {
      try {
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
      } catch (error) {
        console.error('Failed to update employee:', error);
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

    try {
      // Import employees one by one
      for (const employee of importModal.preview) {
        await dispatch(createEmployee(employee)).unwrap();
      }

      // Refresh the employee list
      await dispatch(fetchEmployees({ page: 1, limit: 10 })).unwrap();

      // Close modal and reset state
      setImportModal({ isOpen: false, file: null, preview: null });
      setImportError(null);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import employees');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportCancel = () => {
    setImportModal({ isOpen: false, file: null, preview: null });
    setImportError(null);
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
          
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Template
          </button>
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

      {/* Results Count */}
      {/* <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {employees.length} of {pagination.totalEmployees} employees
        </p>
        <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4 mr-1" />
          Export
        </button>
      </div> */}

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
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marital Status
                      </label>
                      <select
                        value={editFormData.personal?.maritalStatus || ''}
                        onChange={(e) => handleNestedEditFormChange('personal', 'maritalStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
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
                  </div>
                </div>

                {/* Banking Details */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      Google Drive Link *
                      {editFormData.documents?.driveLink && (
                        <span className="ml-2 text-green-600 text-xs">✓ Uploaded</span>
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
                      placeholder="https://drive.google.com/drive/folders/..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Share the Google Drive folder link with "Anyone with the link can view" permission
                    </p>
                    {editFormData.documents?.driveLink && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-green-700 font-medium">📁 Document Folder ✓ Ready</p>
                          <a 
                            href={editFormData.documents.driveLink.startsWith('http') ? editFormData.documents.driveLink : `https://${editFormData.documents.driveLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            Open Drive Folder →
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
                      Google Drive Link
                      {viewModal.employee.documents?.driveLink && (
                        <span className="ml-2 text-green-600 text-xs">✓ Uploaded</span>
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
                            <span className="text-sm text-green-700 font-medium">📁 Document Folder ✓ Ready</span>
                            <a 
                              href={viewModal.employee.documents.driveLink.startsWith('http') ? viewModal.employee.documents.driveLink : `https://${viewModal.employee.documents.driveLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              Open Drive Folder →
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 break-all mt-1">{viewModal.employee.documents.driveLink}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not uploaded</span>
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
                    <h5 className="font-medium text-blue-900 mb-2">Need a template?</h5>
                    <p className="text-blue-700 text-sm mb-3">
                      Download our Excel template to ensure your data is in the correct format.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
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