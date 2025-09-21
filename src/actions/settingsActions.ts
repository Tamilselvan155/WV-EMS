import apiInstance from '../api';

// Settings Types
export interface CompanySettings {
  name: string;
  domain: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

export interface UserManagementSettings {
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  dataRetention: number;
  maxFileSize: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  newEmployeeAlert: boolean;
  leaveRequestAlert: boolean;
  documentExpiryAlert: boolean;
  systemMaintenanceAlert: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  ipWhitelist: string[];
  sessionTimeout: number;
  passwordExpiry: number;
  accountLockoutDuration: number;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupLocation: string;
  cloudBackup: boolean;
  backupRetention: number;
  lastBackup?: string;
  nextBackup?: string;
}

export interface Settings {
  _id?: string;
  company: CompanySettings;
  userManagement: UserManagementSettings;
  system: SystemSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  backup: BackupSettings;
  lastModified?: string;
  modifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Action Types
export const SETTINGS_LOADING = 'SETTINGS_LOADING';
export const SETTINGS_LOADED = 'SETTINGS_LOADED';
export const SETTINGS_ERROR = 'SETTINGS_ERROR';
export const SETTINGS_UPDATED = 'SETTINGS_UPDATED';
export const SETTINGS_RESET = 'SETTINGS_RESET';

// Action Creators
export const loadSettings = () => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.get('/settings');
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_LOADED,
        payload: response.data.data
      });
    } else {
      throw new Error(response.data.message || 'Failed to load settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to load settings'
    });
  }
};

export const updateCompanySettings = (companySettings: Partial<CompanySettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/company', { company: companySettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'company', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update company settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update company settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateUserManagementSettings = (userSettings: Partial<UserManagementSettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/user-management', { userManagement: userSettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'userManagement', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update user management settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update user management settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateSystemSettings = (systemSettings: Partial<SystemSettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/system', { system: systemSettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'system', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update system settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update system settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateNotificationSettings = (notificationSettings: Partial<NotificationSettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/notifications', { notifications: notificationSettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'notifications', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update notification settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update notification settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateSecuritySettings = (securitySettings: Partial<SecuritySettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/security', { security: securitySettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'security', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update security settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update security settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const updateBackupSettings = (backupSettings: Partial<BackupSettings>) => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.put('/settings/backup', { backup: backupSettings });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_UPDATED,
        payload: { section: 'backup', data: response.data.data }
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to update backup settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to update backup settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const exportData = (dataType: 'employees' | 'settings' | 'all') => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.post('/settings/export', { dataType });
    
    if (response.data.success) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to export data');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to export data'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const generateReport = () => async (dispatch: any) => {
  try {
    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.get('/settings/report');
    
    if (response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      throw new Error(response.data.message || 'Failed to generate report');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to generate report'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const resetSettings = (confirmReset: boolean) => async (dispatch: any) => {
  try {
    if (!confirmReset) {
      return { success: false, message: 'Please confirm the reset operation' };
    }

    dispatch({ type: SETTINGS_LOADING });
    const response = await apiInstance.post('/settings/reset', { confirmReset });
    
    if (response.data.success) {
      dispatch({
        type: SETTINGS_RESET,
        payload: response.data.data
      });
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Failed to reset settings');
    }
  } catch (error: any) {
    dispatch({
      type: SETTINGS_ERROR,
      payload: error.response?.data?.message || error.message || 'Failed to reset settings'
    });
    return { success: false, message: error.response?.data?.message || error.message };
  }
};
