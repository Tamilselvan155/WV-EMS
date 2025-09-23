import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employee/EmployeeList';
import AddEmployeeForm from './components/Employee/AddEmployeeForm';
import AdminSettings from './components/Admin/AdminSettings';
import Toast from './components/UI/Toast';

const MainApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  useEffect(() => {
    // Check authentication status only once on app load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        // If we have stored auth data, verify it's still valid
        try {
          await dispatch(checkAuth()).unwrap();
        } catch (error) {
          // If check fails, user will be logged out
          console.log('Auth check failed, user will be logged out');
        }
      }
      setAuthChecked(true);
    };
    
    checkAuthStatus();
  }, [dispatch]);

  // Show success toast when user logs in
  useEffect(() => {
    if (isAuthenticated && user && authChecked) {
      setToast({
        message: `Welcome back, ${user.firstName}!`,
        type: 'success',
        isVisible: true
      });
    }
  }, [isAuthenticated, user, authChecked]);

  // Show loading while checking auth status
  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'employees':
        return <EmployeeList onAddEmployee={() => setCurrentView('add-employee')} />;
      case 'add-employee':
        return <AddEmployeeForm onBack={() => setCurrentView('employees')} />;
      case 'search':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Advanced Search & Filters</h2>
            <p className="text-gray-500">Advanced search and filtering functionality will be implemented here.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h2>
            <p className="text-gray-500">Reporting and analytics dashboard will be implemented here.</p>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Document Management</h2>
            <p className="text-gray-500">Document management system will be implemented here.</p>
          </div>
        );
      case 'settings':
        return <AdminSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        logoutModalOpen={logoutModalOpen}
        isCollapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          onViewChange={setCurrentView}
          onLogoutModalChange={setLogoutModalOpen}
        />
        
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {renderCurrentView()}
        </main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

export default App;