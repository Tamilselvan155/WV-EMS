import React from 'react';
import { LogOut, User, Settings, Menu, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

interface HeaderProps {
  onMenuToggle: () => void;
  onViewChange?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onViewChange }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSettingsClick = () => {
    if (onViewChange) {
      onViewChange('settings');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Manage Employees with Ease</h1>
            <p className="text-sm text-gray-500 hidden md:block">Streamlined Employee Management</p>
          </div>
          
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">WV HR</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          {/* <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button> */}

          {/* User info - hidden on mobile */}
          {/* <div className="hidden md:flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div> */}

          <div className="flex items-center space-x-1 sm:space-x-2">
            {user?.role === 'admin' && (
              <button 
                onClick={handleSettingsClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;