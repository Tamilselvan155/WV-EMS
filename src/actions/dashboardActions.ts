import apiInstance from '../api';

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  totalAdmins: number;
  totalManagers: number;
  totalRegularEmployees: number;
  totalInactiveEmployees: number;
  recentEmployees: number;
}

export interface DepartmentStats {
  department: string;
  employeeCount: number;
  roles: string[];
}

export interface RecentActivity {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  joiningDate: string;
  createdAt: string;
}

export interface DashboardData {
  overview: DashboardStats;
  employeesByDepartment: DepartmentStats[];
  recentActivity: RecentActivity[];
}

// Action Types
export const DASHBOARD_LOADING = 'DASHBOARD_LOADING';
export const DASHBOARD_LOADED = 'DASHBOARD_LOADED';
export const DASHBOARD_ERROR = 'DASHBOARD_ERROR';

// Action Creators
export const loadDashboardData = () => async (dispatch: any) => {
  try {
    dispatch({ type: DASHBOARD_LOADING });
    const response = await apiInstance.get('/dashboard/stats');
    
    if (response.data.success) {
      dispatch({
        type: DASHBOARD_LOADED,
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message || 'Failed to load dashboard data');
    }
  } catch (error: any) {
    dispatch({
      type: DASHBOARD_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to load dashboard data'
    });
  }
};

export const loadDepartmentStats = () => async (dispatch: any) => {
  try {
    const response = await apiInstance.get('/dashboard/departments');
    
    if (response.data.success) {
      return { success: true, data: response.data.data.departments };
    } else {
      throw new Error(response.data.message || 'Failed to load department stats');
    }
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
