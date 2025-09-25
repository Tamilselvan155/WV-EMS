import { Employee, EmployeeFilters } from '../types';
import apiInstance from '../api';

// Employee API endpoints
const EMPLOYEES_ENDPOINT = '/employees';

export const employeeAPI = {
  // Get all employees with pagination and filters
  getEmployees: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  } = {}) => {
    const response = await apiInstance.get(`${EMPLOYEES_ENDPOINT}/`, { params });
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id: string) => {
    const response = await apiInstance.get(`${EMPLOYEES_ENDPOINT}/${id}`);
    return response.data;
  },

  // Create new employee
  createEmployee: async (employeeData: Partial<Employee>) => {
    console.log('Sending employee data to backend:', employeeData);
    const response = await apiInstance.post(`${EMPLOYEES_ENDPOINT}/`, employeeData);
    console.log('Backend response:', response.data);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    console.log('API: Updating employee with ID:', id, 'Data:', employeeData);
    const response = await apiInstance.put(`${EMPLOYEES_ENDPOINT}/${id}`, employeeData);
    console.log('API: Update response:', response.data);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id: string) => {
    const response = await apiInstance.delete(`${EMPLOYEES_ENDPOINT}/${id}`);
    return response.data;
  },

  // Search employees
  searchEmployees: async (filters: EmployeeFilters) => {
    const response = await apiInstance.get(`${EMPLOYEES_ENDPOINT}/search`, { params: filters });
    return response.data;
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await apiInstance.get(`${EMPLOYEES_ENDPOINT}/stats`);
    return response.data;
  },

  // Bulk import employees
  bulkImportEmployees: async (employees: Partial<Employee>[]) => {
    console.log('Sending bulk employee data to backend:', employees);
    const response = await apiInstance.post(`${EMPLOYEES_ENDPOINT}/bulk`, { employees });
    console.log('Backend bulk import response:', response.data);
    return response.data;
  },
};

export default employeeAPI;
