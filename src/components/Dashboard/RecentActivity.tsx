import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadDashboardData } from '../../actions/dashboardActions';
import { Calendar, FileText, Users, Award, UserPlus, Clock } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  // Load dashboard data on component mount
  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  // Format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'employee': return 'Employee';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  // Create activities from live data
  const activities = data?.recentActivity?.slice(0, 6).map((activity, index) => ({
    icon: UserPlus,
    title: 'New Employee Added',
    description: `${activity.name} joined as ${getRoleDisplayName(activity.role)}`,
    time: getTimeAgo(activity.createdAt),
    color: 'bg-blue-100 text-blue-600',
  })) || [
    {
      icon: Users,
      title: 'No Recent Activity',
      description: 'No new employees added recently',
      time: 'N/A',
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-1">Error Loading Activity</h4>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            
            return (
              <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;