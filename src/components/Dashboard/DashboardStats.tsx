import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadDashboardData } from '../../actions/dashboardActions';
import { Users, UserCheck, UserX, TrendingUp, Shield, UserPlus } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.dashboard);

  // Load dashboard data on component mount
  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  // Calculate percentage changes (mock data for now)
  const calculateChange = (current: number, previous: number = 0) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };

  const getChangeType = (change: string) => {
    if (change.startsWith('+')) return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  };

  // Create stats array with live data
  const stats = data ? [
    {
      title: 'Total Employees',
      value: data.overview.totalEmployees.toLocaleString(),
      change: calculateChange(data.overview.totalEmployees, data.overview.totalEmployees - 5),
      changeType: getChangeType(calculateChange(data.overview.totalEmployees, data.overview.totalEmployees - 5)),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Employees',
      value: (data.overview.totalEmployees - data.overview.totalInactiveEmployees).toLocaleString(),
      change: calculateChange(data.overview.totalEmployees - data.overview.totalInactiveEmployees, (data.overview.totalEmployees - data.overview.totalInactiveEmployees) - 3),
      changeType: getChangeType(calculateChange(data.overview.totalEmployees - data.overview.totalInactiveEmployees, (data.overview.totalEmployees - data.overview.totalInactiveEmployees) - 3)),
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Inactive Employees',
      value: data.overview.totalInactiveEmployees.toLocaleString(),
      change: calculateChange(data.overview.totalInactiveEmployees, data.overview.totalInactiveEmployees - 1),
      changeType: getChangeType(calculateChange(data.overview.totalInactiveEmployees, data.overview.totalInactiveEmployees - 1)),
      icon: UserX,
      color: 'bg-red-500',
    },
    {
      title: 'New Hires (30 Days)',
      value: data.overview.recentEmployees.toLocaleString(),
      change: calculateChange(data.overview.recentEmployees, data.overview.recentEmployees - 2),
      changeType: getChangeType(calculateChange(data.overview.recentEmployees, data.overview.recentEmployees - 2)),
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ] : [
    {
      title: 'Total Employees',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Employees',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Inactive Employees',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: UserX,
      color: 'bg-red-500',
    },
    {
      title: 'New Hires (30 Days)',
      value: '0',
      change: '+0%',
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 sm:mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard Data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                stat.changeType === 'positive' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : stat.changeType === 'negative'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;