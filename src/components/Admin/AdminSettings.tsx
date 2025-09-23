import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  loadSettings,
  updateCompanySettings,
  updateUserManagementSettings,
  updateSystemSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateBackupSettings,
  exportData,
  generateReport,
  resetSettings
} from '../../actions/settingsActions';
import { clearError } from '../../store/slices/settingsSlice';
import { 
  Building2, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Key, 
  Globe, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  UserCog,
  FileText,
  Download,
  Upload
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.settings);
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load settings on component mount - only for admin users
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // Only proceed if user exists and is admin
    if (user && user.role === 'admin') {
      try {
        dispatch(loadSettings());
      } catch (error) {
        console.error('Error loading settings:', error);
        // Don't let settings loading errors cause logout
      }
    }
  }, [dispatch, user, authLoading]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setCompanySettings({
        name: settings.company?.name || 'Worley Ventures',
        domain: settings.company?.domain || 'worleyventures.com',
        address: settings.company?.address || '123 Business Street, City, State 12345',
        phone: settings.company?.phone || '+1 (555) 123-4567',
        email: settings.company?.email || 'hr@worleyventures.com',
        website: settings.company?.website || 'https://www.worleyventures.com',
        timezone: settings.company?.timezone || 'America/New_York',
        currency: settings.company?.currency || 'USD',
        dateFormat: settings.company?.dateFormat || 'MM/DD/YYYY'
      });
      
      setUserSettings({
        allowSelfRegistration: settings.userManagement?.allowSelfRegistration || false,
        requireEmailVerification: settings.userManagement?.requireEmailVerification || true,
        passwordMinLength: settings.userManagement?.passwordMinLength || 8,
        passwordRequireSpecial: settings.userManagement?.passwordRequireSpecial || true,
        sessionTimeout: settings.userManagement?.sessionTimeout || 30,
        maxLoginAttempts: settings.userManagement?.maxLoginAttempts || 5
      });
      
      setSystemSettings({
        maintenanceMode: settings.system?.maintenanceMode || false,
        debugMode: settings.system?.debugMode || false,
        logLevel: settings.system?.logLevel || 'info',
        backupFrequency: settings.system?.backupFrequency || 'daily',
        dataRetention: settings.system?.dataRetention || 365,
        maxFileSize: settings.system?.maxFileSize || 10
      });
      
      setNotificationSettings({
        emailNotifications: settings.notifications?.emailNotifications || true,
        smsNotifications: settings.notifications?.smsNotifications || false,
        pushNotifications: settings.notifications?.pushNotifications || true,
        newEmployeeAlert: settings.notifications?.newEmployeeAlert || true,
        leaveRequestAlert: settings.notifications?.leaveRequestAlert || true,
        documentExpiryAlert: settings.notifications?.documentExpiryAlert || true,
        systemMaintenanceAlert: settings.notifications?.systemMaintenanceAlert || true
      });
      
      setSecuritySettings({
        twoFactorAuth: settings.security?.twoFactorAuth || false,
        ipWhitelist: settings.security?.ipWhitelist || '',
        sessionEncryption: settings.security?.sessionEncryption || true,
        auditLogging: settings.security?.auditLogging || true,
        passwordExpiry: settings.security?.passwordExpiry || 90,
        lockoutDuration: settings.security?.lockoutDuration || 30
      });
      
      setBackupSettings({
        autoBackup: settings.backup?.autoBackup || true,
        backupRetention: settings.backup?.backupRetention || 30,
        cloudBackup: settings.backup?.cloudBackup || false,
        backupEncryption: settings.backup?.backupEncryption || true,
        backupSchedule: settings.backup?.backupSchedule || 'daily'
      });
    }
  }, [settings]);

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    name: 'Worley Ventures',
    domain: 'worleyventures.com',
    address: '123 Business Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'hr@worleyventures.com',
    website: 'https://www.worleyventures.com',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });

  // User Management State
  const [userSettings, setUserSettings] = useState({
    allowSelfRegistration: false,
    requireEmailVerification: true,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    dataRetention: 365,
    maxFileSize: 10
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newEmployeeAlert: true,
    leaveRequestAlert: true,
    documentExpiryAlert: true,
    systemMaintenanceAlert: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    ipWhitelist: '',
    sessionEncryption: true,
    auditLogging: true,
    passwordExpiry: 90,
    lockoutDuration: 30
  });

  // Backup Settings State
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupRetention: 30,
    cloudBackup: false,
    backupEncryption: true,
    backupSchedule: 'daily'
  });

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup & Data', icon: Database },
    { id: 'monitoring', label: 'System Monitoring', icon: Globe }
  ];

  // Validation functions
  const validateCompanySettings = (settings: typeof companySettings) => {
    const errors: Record<string, string> = {};
    
    if (!settings.name.trim()) {
      errors.name = 'Company name is required';
    }
    
    if (!settings.domain.trim()) {
      errors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}$/.test(settings.domain)) {
      errors.domain = 'Please enter a valid domain';
    }
    
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (settings.website && !/^https?:\/\/.+/.test(settings.website)) {
      errors.website = 'Please enter a valid website URL (starting with http:// or https://)';
    }
    
    return errors;
  };

  const validateUserManagementSettings = (settings: typeof userSettings) => {
    const errors: Record<string, string> = {};
    
    if (settings.passwordMinLength < 6 || settings.passwordMinLength > 20) {
      errors.passwordMinLength = 'Password minimum length must be between 6 and 20 characters';
    }
    
    if (settings.sessionTimeout < 5 || settings.sessionTimeout > 480) {
      errors.sessionTimeout = 'Session timeout must be between 5 and 480 minutes';
    }
    
    if (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10) {
      errors.maxLoginAttempts = 'Max login attempts must be between 3 and 10';
    }
    
    return errors;
  };

  const validateSystemSettings = (settings: typeof systemSettings) => {
    const errors: Record<string, string> = {};
    
    if (settings.dataRetention < 30 || settings.dataRetention > 2555) {
      errors.dataRetention = 'Data retention must be between 30 and 2555 days';
    }
    
    if (settings.maxFileSize < 1 || settings.maxFileSize > 100) {
      errors.maxFileSize = 'Max file size must be between 1 and 100 MB';
    }
    
    return errors;
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const handleSave = async (section: string) => {
    clearValidationErrors();
    setIsSaving(true);
    
    try {
      let errors: Record<string, string> = {};
      let result;
      
      // Validate settings before saving
      switch (section) {
        case 'company':
          errors = validateCompanySettings(companySettings);
          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSaving(false);
            return;
          }
          result = await dispatch(updateCompanySettings(companySettings));
          break;
        case 'users':
          errors = validateUserManagementSettings(userSettings);
          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSaving(false);
            return;
          }
          result = await dispatch(updateUserManagementSettings(userSettings));
          break;
        case 'system':
          errors = validateSystemSettings(systemSettings);
          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSaving(false);
            return;
          }
          result = await dispatch(updateSystemSettings(systemSettings));
          break;
        case 'notifications':
          result = await dispatch(updateNotificationSettings(notificationSettings));
          break;
        case 'security':
          result = await dispatch(updateSecuritySettings(securitySettings));
          break;
        case 'backup':
          result = await dispatch(updateBackupSettings(backupSettings));
          break;
        default:
          throw new Error('Unknown section');
      }
      
      if (result.success) {
        setToastMessage(result.message || `${section} settings saved successfully!`);
      setToastType('success');
      setShowToast(true);
      } else {
        throw new Error(result.message || `Failed to save ${section} settings`);
      }
    } catch (error: any) {
      setToastMessage(error.message || `Failed to save ${section} settings`);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async (dataType: 'employees' | 'settings' | 'all') => {
    setIsSaving(true);
    try {
      const result = await dispatch(exportData(dataType));
      if (result.success) {
        // Create and download the file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export-${dataType}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        setToastMessage('Data exported successfully!');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error(result.message || 'Failed to export data');
      }
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to export data');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsSaving(true);
    try {
      const result = await dispatch(generateReport());
      if (result.success) {
        // Create and download the report
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `system-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        setToastMessage('Report generated successfully!');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error(result.message || 'Failed to generate report');
      }
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to generate report');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await dispatch(resetSettings(true));
      if (result.success) {
        setToastMessage('Settings reset to defaults successfully!');
        setToastType('success');
        setShowToast(true);
        // Reload settings
        dispatch(loadSettings());
      } else {
        throw new Error(result.message || 'Failed to reset settings');
      }
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to reset settings');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Building2 className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900">Company Information</h3>
        </div>
        <p className="text-sm text-blue-700 mt-1">Configure your company details and branding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
          <input
            type="text"
            value={companySettings.name}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Domain *</label>
          <input
            type="text"
            value={companySettings.domain}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, domain: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.domain ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.domain && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.domain}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={companySettings.phone}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={companySettings.email}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={companySettings.address}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, address: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={companySettings.website}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, website: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.website ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.website && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={companySettings.timezone}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={companySettings.currency}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={companySettings.dateFormat}
            onChange={(e) => setCompanySettings(prev => ({ ...prev, dateFormat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (EU Alt)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-900">User Management</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">Configure user registration and access policies</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Allow Self Registration</h4>
            <p className="text-sm text-gray-500">Allow new users to register themselves</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.allowSelfRegistration}
              onChange={(e) => setUserSettings(prev => ({ ...prev, allowSelfRegistration: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Require Email Verification</h4>
            <p className="text-sm text-gray-500">Users must verify their email before accessing the system</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.requireEmailVerification}
              onChange={(e) => setUserSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
            <input
              type="number"
              value={userSettings.passwordMinLength}
              onChange={(e) => setUserSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.passwordMinLength ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="6"
              max="20"
            />
            {validationErrors.passwordMinLength && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.passwordMinLength}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={userSettings.sessionTimeout}
              onChange={(e) => setUserSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.sessionTimeout ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="5"
              max="480"
            />
            {validationErrors.sessionTimeout && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.sessionTimeout}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <SettingsIcon className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-orange-900">System Configuration</h3>
        </div>
        <p className="text-sm text-orange-700 mt-1">Configure system behavior and maintenance settings</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-500">Temporarily disable system access for maintenance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.maintenanceMode}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
            <select
              value={systemSettings.logLevel}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
            <select
              value={systemSettings.backupFrequency}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-900">Security Settings</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">Configure security policies and access controls</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
            <input
              type="number"
              value={userSettings.maxLoginAttempts}
              onChange={(e) => setUserSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="3"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
            <input
              type="number"
              value={systemSettings.dataRetention}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.dataRetention ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="30"
              max="2555"
            />
            {validationErrors.dataRetention && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dataRetention}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Require Special Characters in Passwords</h4>
            <p className="text-sm text-gray-500">Enforce special character requirements for passwords</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.passwordRequireSpecial}
              onChange={(e) => setUserSettings(prev => ({ ...prev, passwordRequireSpecial: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-purple-900">Notification Settings</h3>
        </div>
        <p className="text-sm text-purple-700 mt-1">Configure notification preferences and delivery methods</p>
      </div>

      <div className="space-y-4">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500">
                {key === 'emailNotifications' && 'Send notifications via email'}
                {key === 'smsNotifications' && 'Send notifications via SMS'}
                {key === 'pushNotifications' && 'Send push notifications to devices'}
                {key === 'newEmployeeAlert' && 'Alert when new employees are added'}
                {key === 'leaveRequestAlert' && 'Alert when leave requests are submitted'}
                {key === 'documentExpiryAlert' && 'Alert when documents are about to expire'}
                {key === 'systemMaintenanceAlert' && 'Alert about system maintenance'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-indigo-900">Backup & Data Management</h3>
        </div>
        <p className="text-sm text-indigo-700 mt-1">Manage data backups and system maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Data Export</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">Export all employee data and system settings</p>
          <div className="space-y-2">
            <button 
              onClick={() => handleExportData('all')}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Exporting...' : 'Export All Data'}
            </button>
            <button 
              onClick={() => handleExportData('employees')}
              disabled={isSaving}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Employees Only
            </button>
            <button 
              onClick={() => handleExportData('settings')}
              disabled={isSaving}
              className="w-full bg-blue-400 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Settings Only
          </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-green-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Data Import</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">Import employee data from external sources</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (JSON, CSV, Excel)
              </label>
              <input
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setToastMessage(`File selected: ${file.name}`);
                    setToastType('success');
                    setShowToast(true);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button 
              disabled={isSaving}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Processing...' : 'Import Data'}
          </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <RefreshCw className="w-6 h-6 text-orange-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">System Reset</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">Reset system to default settings</p>
          <button 
            onClick={handleResetSettings}
            disabled={isSaving}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Resetting...' : 'Reset System'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-purple-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Generate Report</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">Generate system usage and performance report</p>
          <button 
            onClick={handleGenerateReport}
            disabled={isSaving}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemMonitoring = () => (
    <div className="space-y-6">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-center">
          <Globe className="w-5 h-5 text-cyan-600 mr-2" />
          <h3 className="text-lg font-semibold text-cyan-900">System Monitoring</h3>
        </div>
        <p className="text-sm text-cyan-700 mt-1">Monitor system performance and health metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">System Status</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">2h 15m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Database</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type</span>
              <span className="text-sm font-medium">MongoDB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">~5ms</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Memory Usage</h4>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Used</span>
              <span className="text-sm font-medium">45.2 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-sm font-medium">128.0 MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Active Users</h4>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Online Now</span>
              <span className="text-sm font-medium">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-medium">12</span>
            </div>
          </div>
        </div>

        {/* API Requests */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">API Requests</h4>
            <Database className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Hour</span>
              <span className="text-sm font-medium">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-medium">234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-green-600">99.2%</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">System Health</h4>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium">23%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Disk Space</span>
              <span className="text-sm font-medium">67%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Health Score</span>
              <span className="text-sm font-medium text-green-600">Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">System started successfully</span>
            <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Settings updated</span>
            <span className="text-xs text-gray-400 ml-auto">5 minutes ago</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Backup completed</span>
            <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySettings();
      case 'users':
        return renderUserManagement();
      case 'system':
        return renderSystemSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'backup':
        return renderBackupSettings();
      case 'monitoring':
        return renderSystemMonitoring();
      default:
        return renderCompanySettings();
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading user information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin privileges
  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need administrator privileges to access settings.</p>
            <p className="text-sm text-gray-500">Contact your system administrator for access.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while settings are being loaded
  if (loading && !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worley Ventures Admin Settings</h1>
          <p className="text-gray-600">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave(activeTab)}
            disabled={isSaving || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isSaving || loading) ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{(isSaving || loading) ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Settings Summary */}
      {settings && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{settings.company.name}</p>
                  <p className="text-xs text-gray-500">{settings.company.domain}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {settings.userManagement.allowSelfRegistration ? 'Open' : 'Closed'} Registration
                  </p>
                  <p className="text-xs text-gray-500">
                    {settings.userManagement.sessionTimeout}min timeout
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <SettingsIcon className="w-5 h-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {settings.system.maintenanceMode ? 'Maintenance' : 'Active'} Mode
                  </p>
                  <p className="text-xs text-gray-500">
                    {settings.system.logLevel} logging
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {settings.notifications.emailNotifications ? 'Email' : 'No Email'} Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    {Object.values(settings.notifications).filter(Boolean).length} enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {renderTabContent()}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
            toastType === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setShowToast(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
