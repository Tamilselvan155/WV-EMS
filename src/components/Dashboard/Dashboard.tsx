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

      {/* Recently Added Employees - Detailed View */}
      {data && data.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recently Added Employees</h3>
            <span className="text-sm text-gray-500">Last {data.recentActivity.length} additions</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentActivity.slice(0, 5).map((employee, index) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-xs text-gray-500">ID: {employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm text-gray-900">{employee.designation}</div>
                      <div className="text-xs text-gray-500">{employee.department}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-xs text-gray-500">{employee.phone}</div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm text-gray-900">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm text-gray-500">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(() => {
                          const date = new Date(employee.createdAt);
                          const now = new Date();
                          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                          if (diffInSeconds < 60) return 'Just now';
                          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                          return `${Math.floor(diffInSeconds / 86400)}d ago`;
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;