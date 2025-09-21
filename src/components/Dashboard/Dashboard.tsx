import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadDashboardData } from '../../actions/dashboardActions';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import { UserPlus, FileText, Upload, Settings, BarChart3, Users, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onViewChange?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  // Load dashboard data on component mount
  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  const handleQuickAction = (action: string) => {
    if (onViewChange) {
      switch (action) {
        case 'add-employee':
          onViewChange('add-employee');
          break;
        case 'employees':
          onViewChange('employees');
          break;
        case 'settings':
          onViewChange('settings');
          break;
        case 'reports':
          onViewChange('reports');
          break;
        default:
          break;
      }
    }
  };

  const handleRefresh = () => {
    dispatch(loadDashboardData());
  };

  const quickActions = [
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Register new employee',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'employees',
      title: 'View Employees',
      description: 'Browse all employees',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'reports',
      title: 'Generate Report',
      description: 'Create employee report',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Here's an overview of your Worley Ventures employee management system.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <RecentActivity />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-all duration-200 hover:shadow-sm hover:border-gray-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Dashboard Sections */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Departments</h3>
            <div className="space-y-3">
              {data.employeesByDepartment?.slice(0, 5).map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{dept.department || 'Unassigned'}</span>
                  <span className="text-sm font-medium text-gray-900">{dept.employeeCount}</span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No department data available</p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {data ? new Date().toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admins</span>
                <span className="text-sm font-medium text-gray-900">{data.overview.totalAdmins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Managers</span>
                <span className="text-sm font-medium text-gray-900">{data.overview.totalManagers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employees</span>
                <span className="text-sm font-medium text-gray-900">{data.overview.totalRegularEmployees}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;