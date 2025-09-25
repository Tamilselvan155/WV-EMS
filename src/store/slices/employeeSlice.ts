import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee, EmployeeFilters } from '../../types';
import { employeeAPI } from '../../actions/employeeActions';

interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEmployees: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: EmployeeFilters;
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalEmployees: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {},
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
    const response = await employeeAPI.getEmployees(params);
    return response.data;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string) => {
    const response = await employeeAPI.getEmployeeById(id);
    return response.data.employee;
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: Partial<Employee>, { rejectWithValue }) => {
    try {
      console.log('Redux: Creating employee with data:', employeeData);
      const response = await employeeAPI.createEmployee(employeeData);
      console.log('Redux: Employee created successfully:', response);
      return response.data.employee;
    } catch (error: any) {
      console.error('Redux: Error creating employee:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }: { id: string; employeeData: Partial<Employee> }, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating employee with ID:', id, 'Data:', employeeData);
      const response = await employeeAPI.updateEmployee(id, employeeData);
      console.log('Redux: Employee updated successfully:', response);
      return response.data.employee;
    } catch (error: any) {
      console.error('Redux: Error updating employee:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string) => {
    await employeeAPI.deleteEmployee(id);
    return id;
  }
);

export const bulkImportEmployees = createAsyncThunk(
  'employees/bulkImportEmployees',
  async (employees: Partial<Employee>[], { rejectWithValue }) => {
    try {
      console.log('Redux: Bulk importing employees:', employees);
      const response = await employeeAPI.bulkImportEmployees(employees);
      console.log('Redux: Bulk import response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Redux: Error in bulk import:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk import employees');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EmployeeFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee';
      })
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload);
        state.pagination.totalEmployees += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create employee';
      })
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Redux: updateEmployee.fulfilled - updating employee:', action.payload);
        const index = state.employees.findIndex(emp => emp._id === action.payload._id);
        console.log('Redux: Found employee at index:', index);
        if (index !== -1) {
          state.employees[index] = action.payload;
          console.log('Redux: Updated employee in array:', state.employees[index]);
        }
        if (state.currentEmployee?._id === action.payload._id) {
          state.currentEmployee = action.payload;
          console.log('Redux: Updated current employee:', state.currentEmployee);
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update employee';
      })
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(emp => emp._id !== action.payload);
        state.pagination.totalEmployees -= 1;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete employee';
      })
      // Bulk import employees
      .addCase(bulkImportEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportEmployees.fulfilled, (state, action) => {
        state.loading = false;
        // Add successfully imported employees to the list
        if (action.payload.successfulEmployees) {
          state.employees.unshift(...action.payload.successfulEmployees);
          state.pagination.totalEmployees += action.payload.results.success;
        }
      })
      .addCase(bulkImportEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to bulk import employees';
      });
  },
});

export const { setFilters, clearError, clearCurrentEmployee, setCurrentPage } = employeeSlice.actions;
export default employeeSlice.reducer;
