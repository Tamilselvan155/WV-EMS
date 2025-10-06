import React from 'react';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  X,
  User,
  Shield
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import wvLogo from '../../assets/wvlogo.png';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  logoutModalOpen?: boolean;
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isOpen, 
  onToggle,
  logoutModalOpen = false,
  isCollapsed = false,
  onCollapseToggle
}) => {
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'user-management', label: 'User Management', icon: Shield },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
    // Only show settings for admin users
    ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const handleMenuClick = (viewId: string) => {
    onViewChange(viewId);
    onToggle(false);
  };


  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 flex flex-col
        lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${logoutModalOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => onToggle(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Logo/Brand - Clickable Toggle */}
        <div 
          className="hidden lg:flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group"
          onClick={onCollapseToggle}
          title={isCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <img src={wvLogo} alt="Worley Ventures Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 truncate">Worley Ventures</h1>
              <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">Employee Management System</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-blue-600' : 'text-gray-500'} flex-shrink-0`} />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center mb-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Employee'}
                </p>
              </div>
            )}
          </div>
          
          {/* <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-3" />
                <span>Sign Out</span>
              </>
            )}
          </button> */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;