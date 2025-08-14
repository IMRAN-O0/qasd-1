import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import socketService, { useSocket } from './services/socket';
import systemIntegrationService from './services/systemIntegrationService';
import ProtectedRoute from './pages/core/ProtectedRoute';

// Import LoadingScreen (using local definition below)

// Import Components
import LoginSetup from './pages/auth/LoginSetup.jsx';
import Dashboard from './pages/core/Dashboard.jsx';
import LoginPage from './pages/core/LoginPage.jsx';
import UserManagement from './pages/auth/UserManagement.jsx';

// Production Components
import BatchProductionRecord from './pages/production/BatchProductionRecord.jsx';
import EquipmentCalibration from './pages/production/EquipmentCalibration.jsx';
import EquipmentMaintenance from './pages/production/EquipmentMaintenance.jsx';
import ProductionLineCleaning from './pages/production/ProductionLineCleaning.jsx';

// Inventory Components
import AddMaterial from './pages/inventory/AddMaterial.jsx';
import MaterialReceipt from './pages/inventory/MaterialReceipt.jsx';
import MaterialIssue from './pages/inventory/MaterialIssue.jsx';
import InventoryCount from './pages/inventory/InventoryCount.jsx';
import ViewMaterials from './pages/inventory/ViewMaterials.jsx';
import ExpiryReports from './pages/inventory/ExpiryReports.jsx';

// Quality Components
import RawMaterialsInspection from './pages/quality/RawMaterialsInspection.jsx';
import FinalProductInspection from './pages/quality/FinalProductInspection.jsx';
import NonConformanceRecord from './pages/quality/NonConformanceRecord.jsx';
import CorrectiveActionReport from './pages/quality/CorrectiveActionReport.jsx';
import COAReport from './pages/quality/COAReport.jsx';

// Safety Components
import IncidentReport from './pages/safety/IncidentReport.jsx';
import SafetyEquipmentInspection from './pages/safety/SafetyEquipmentInspection.jsx';
import TrainingRecord from './pages/safety/TrainingRecord.jsx';

// Sales Components
import Customers from './pages/sales/customers.jsx';
import Products from './pages/sales/products.jsx';
import Quotation from './pages/sales/quotation.jsx';
import Invoices from './pages/sales/invoices.jsx';

// Settings Components
import { SettingsPage } from './pages/settings';
import UserManagementPage from './pages/settings/UserManagement';
import RoleManagement from './pages/settings/RoleManagement';
import CompanySettings from './pages/settings/CompanySettings';
import SecuritySettings from './pages/settings/SecuritySettings';

// Phase 2 Components
import DocumentManager from './components/documents/DocumentManager';
import ReportBuilder from './components/reports/ReportBuilder';
import MobileAnalytics from './components/analytics/MobileAnalytics';
import PWAManager from './components/pwa/PWAManager';
import ISOComplianceReports from './components/compliance/ISOComplianceReports';
import ReportsCenter from './pages/reports/ReportsCenter';

// Application state management (non-auth related)
const useAppStore = {
  // Tenant configuration - Provide proper defaults
  tenantConfig: {
    companyName: 'نظام إدارة المصانع المتكامل',
    logo: '',
    theme: 'default'
  },
  isConfigured: true,

  // Application settings
  currentModule: 'dashboard',
  sidebarOpen: true
};

// App state hook
const useAppState = () => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tenantConfig, setTenantConfig] = useState({
    companyName: 'نظام إدارة المصانع المتكامل',
    logo: '',
    theme: 'default'
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const updateTenantConfig = config => {
    const updatedConfig = { ...tenantConfig, ...config };
    setTenantConfig(updatedConfig);
    localStorage.setItem('tenantConfig', JSON.stringify(updatedConfig));
  };

  // Initialize tenant config from localStorage
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem('tenantConfig');
      if (storedConfig) {
        const configData = JSON.parse(storedConfig);
        if (configData) {
          setTenantConfig(prev => ({ ...prev, ...configData }));
        }
      }
    } catch (error) {
      console.error('Error loading tenant config:', error);
      localStorage.removeItem('tenantConfig');
    }
  }, []);

  return {
    currentModule,
    setCurrentModule,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    tenantConfig,
    setTenantConfig: updateTenantConfig,
    isConfigured: true
  };
};

// Legacy Protected Route Component for role-based access
const LegacyProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));

    if (!hasRequiredRole) {
      return <Navigate to='/unauthorized' replace />;
    }
  }

  return children;
};

// Setup Required Component
const SetupRequired = ({ children }) => {
  const { isConfigured } = useAppStore();

  if (!isConfigured) {
    return <LoginSetup />;
  }

  return children;
};

// Loading Component
const LoadingScreen = () => (
  <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
      <h2 className='text-xl font-semibold text-gray-700 mb-2'>جاري التحميل...</h2>
      <p className='text-gray-500'>نظام إدارة المصانع المتكامل</p>
    </div>
  </div>
);

// Import Layout
import Layout from './components/layout/Layout';

// Socket Integration Component
const SocketIntegration = () => {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect socket when authenticated
      socketService.connect();

      // Join user-specific room
      socketService.joinRoom(`user_${user.id}`);

      // Subscribe to notifications
      socketService.subscribeToNotifications(notification => {
        console.log('Received notification:', notification);
        // Handle notifications (you can add toast notifications here)
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return null;
};

// System Status Component
const SystemStatus = ({ status, onRetry }) => {
  const clearCacheAndReload = async () => {
    try {
      // مسح Service Worker cache
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      
      // مسح جميع أنواع التخزين المؤقت
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // مسح localStorage و sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // إعادة تحميل قسري
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
      window.location.reload();
    }
  };

  if (status === 'initializing') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <h2 className='text-xl font-semibold text-gray-700 mb-2'>جاري تهيئة النظام...</h2>
          <p className='text-gray-500'>إعداد الخدمات والتحسينات</p>
          <div className='mt-4'>
            <button 
              onClick={clearCacheAndReload}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm'
            >
              مسح الكاش وإعادة التحميل
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='min-h-screen bg-red-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-bold text-red-800 mb-2'>فشل في تهيئة النظام</h1>
          <p className='text-red-600 mb-4'>يرجى إعادة تحميل الصفحة أو الاتصال بالدعم الفني</p>
          <div className='space-x-2 space-x-reverse'>
            <button onClick={onRetry} className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
              إعادة المحاولة
            </button>
            <button 
              onClick={clearCacheAndReload}
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
            >
              مسح الكاش وإعادة التحميل
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Mobile Detection Hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Main App Content Component
const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(((import.meta && import.meta.env && import.meta.env.MODE) !== 'production') ? 'operational' : 'initializing');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const appState = useAppState();
  const { isConfigured } = appState;
  const isMobile = useMobileDetection();

  useEffect(() => {
    // In development, don't block UI on system integration; proceed immediately
    const mode = (import.meta && import.meta.env && import.meta.env.MODE) || 'development';
    if (mode !== 'production') {
      setSystemStatus('operational');
      return;
    }

    // Initialize system integration with timeout
    const initializeSystem = async () => {
      try {
        // إضافة timeout للتهيئة (10 ثوانٍ)
        const initPromise = systemIntegrationService.init();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('System initialization timeout')), 10000);
        });

        await Promise.race([initPromise, timeoutPromise]);
        setSystemStatus('operational');
      } catch (error) {
        console.error('Failed to initialize system:', error);
        setSystemStatus('error');
      }
    };

    // معالجة الأخطاء العامة
    const handleGlobalError = (event) => {
      console.error('Global error:', event.error);
      if (systemStatus === 'initializing') {
        setSystemStatus('error');
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (systemStatus === 'initializing') {
        setSystemStatus('error');
      }
    };

    // Listen for system events
    const handleSystemEvent = event => {
      console.log('System event:', event.type, event.detail);
    };

    // إضافة مستمعي الأحداث
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('system:initialized', handleSystemEvent);
    window.addEventListener('system:error', handleSystemEvent);
    window.addEventListener('system:health_check', handleSystemEvent);

    initializeSystem();

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('system:initialized', handleSystemEvent);
      window.removeEventListener('system:error', handleSystemEvent);
      window.removeEventListener('system:health_check', handleSystemEvent);
    };
  }, [systemStatus]);

  useEffect(() => {
    // Wait for auth to initialize, then show app
    if (!authLoading && systemStatus === 'operational') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [authLoading, systemStatus]);

  // Show system status if not operational
  if (systemStatus !== 'operational') {
    return <SystemStatus status={systemStatus} onRetry={() => window.location.reload()} />;
  }

  if (authLoading) {
    return null; // show nothing until auth initializes
  }

  return (
    <div className='min-h-screen bg-gray-50' dir='rtl'>
      {((import.meta && import.meta.env && import.meta.env.MODE) === 'production') && <PWAManager />}
      <SocketIntegration />
      <Routes>
        {/* Setup Route - Always accessible if not configured */}
        {!isConfigured && <Route path='/*' element={<LoginSetup />} />}

        {/* Authentication Routes */}
        {isConfigured && (
          <>
            <Route path='/login' element={<LoginPage />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute />}>
              <Route
                path='/'
                element={<Layout />}
              >
              <Route index element={<Navigate to='/dashboard' replace />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route
                path='users'
                element={
                  <LegacyProtectedRoute requiredRoles={['admin']}>
                    <UserManagement />
                  </LegacyProtectedRoute>
                }
              />

              {/* Phase 2 Routes */}
              <Route path='documents' element={<DocumentManager />} />
              <Route path='reports' element={<ReportsCenter />} />
              <Route path='reports/builder' element={<ReportBuilder />} />
              <Route
                path='compliance'
                element={
                  <LegacyProtectedRoute requiredRoles={['admin', 'quality']}>
                    <ISOComplianceReports />
                  </LegacyProtectedRoute>
                }
              />
              <Route path='analytics/mobile' element={<MobileAnalytics />} />

              {/* Production Routes */}
              <Route
                path='production/batch-record'
                element={
                  <LegacyProtectedRoute requiredRoles={['admin', 'production', 'supervisor']}>
                    <BatchProductionRecord />
                  </LegacyProtectedRoute>
                }
              />
              <Route
                path='production/equipment-calibration'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'production', 'maintenance']}>
                    <EquipmentCalibration />
                  </ProtectedRoute>
                }
              />
              <Route
                path='production/equipment-maintenance'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'production', 'maintenance']}>
                    <EquipmentMaintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path='production/line-cleaning'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'production']}>
                    <ProductionLineCleaning />
                  </ProtectedRoute>
                }
              />

              {/* Inventory Routes */}
              <Route
                path='inventory/add'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory']}>
                    <AddMaterial />
                  </ProtectedRoute>
                }
              />
              <Route
                path='inventory/receipt'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory']}>
                    <MaterialReceipt />
                  </ProtectedRoute>
                }
              />
              <Route
                path='inventory/issue'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory']}>
                    <MaterialIssue />
                  </ProtectedRoute>
                }
              />
              <Route
                path='inventory/count'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory']}>
                    <InventoryCount />
                  </ProtectedRoute>
                }
              />
              <Route
                path='inventory/view'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory', 'viewer']}>
                    <ViewMaterials />
                  </ProtectedRoute>
                }
              />
              <Route
                path='inventory/expiry'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'inventory', 'quality']}>
                    <ExpiryReports />
                  </ProtectedRoute>
                }
              />

              {/* Quality Routes */}
              <Route
                path='quality/raw-materials'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'quality']}>
                    <RawMaterialsInspection />
                  </ProtectedRoute>
                }
              />
              <Route
                path='quality/final-product'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'quality']}>
                    <FinalProductInspection />
                  </ProtectedRoute>
                }
              />
              <Route
                path='quality/non-conformance'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'quality']}>
                    <NonConformanceRecord />
                  </ProtectedRoute>
                }
              />
              <Route
                path='quality/corrective-action'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'quality']}>
                    <CorrectiveActionReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path='quality/coa'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'quality']}>
                    <COAReport />
                  </ProtectedRoute>
                }
              />

              {/* Safety Routes */}
              <Route
                path='safety/incident'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'safety', 'supervisor']}>
                    <IncidentReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path='safety/equipment'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'safety']}>
                    <SafetyEquipmentInspection />
                  </ProtectedRoute>
                }
              />
              <Route
                path='safety/training'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'hr', 'supervisor']}>
                    <TrainingRecord />
                  </ProtectedRoute>
                }
              />

              {/* Sales Routes */}
              <Route
                path='sales/customers'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'sales']}>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path='sales/products'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'sales', 'production']}>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path='sales/quotation'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'sales']}>
                    <Quotation />
                  </ProtectedRoute>
                }
              />
              <Route
                path='sales/invoices'
                element={
                  <ProtectedRoute requiredRoles={['admin', 'sales']}>
                    <Invoices />
                  </ProtectedRoute>
                }
              />

              {/* Settings Routes */}
              <Route
                path='settings'
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='settings/users'
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path='settings/roles'
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <RoleManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path='settings/company'
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <CompanySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path='settings/security'
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <SecuritySettings />
                  </ProtectedRoute>
                }
              />
            </Route>
            </Route>

            {/* Unauthorized Route */}
            <Route
              path='/unauthorized'
              element={
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                  <div className='bg-white p-8 rounded-lg shadow-lg text-center'>
                    <h2 className='text-2xl font-bold text-red-600 mb-4'>غير مصرح</h2>
                    <p className='text-gray-600 mb-4'>ليس لديك صلاحية للوصول لهذه الصفحة</p>
                    <button
                      onClick={() => window.history.back()}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                    >
                      العودة
                    </button>
                  </div>
                </div>
              }
            />

            {/* 404 Route */}
            <Route
              path='*'
              element={
                <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                  <div className='text-center'>
                    <h1 className='text-6xl font-bold text-gray-400 mb-4'>404</h1>
                    <h2 className='text-2xl font-semibold text-gray-600 mb-4'>الصفحة غير موجودة</h2>
                    <p className='text-gray-500 mb-8'>الصفحة التي تبحث عنها غير متاحة</p>
                    <button
                      onClick={() => window.history.back()}
                      className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      العودة للخلف
                    </button>
                  </div>
                </div>
              }
            />
          </>
        )}
      </Routes>
    </div>
  );
};

// Mobile App Content for smaller screens
const MobileAppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <MobileAnalytics />;
      case 'production':
        return <BatchProductionRecord />;
      case 'quality':
        return <RawMaterialsInspection />;
      case 'reports':
        return <ReportsCenter />;
      case 'documents':
        return <DocumentManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      {/* Mobile Header */}
      <div className='bg-white shadow-sm border-b px-4 py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg font-semibold text-gray-900'>QASD</h1>
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-gray-600'>{user?.name}</span>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium'>
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className='flex-1 overflow-y-auto'>{renderMobileContent()}</div>

      {/* Mobile Bottom Navigation */}
      <div className='bg-white border-t px-2 py-1'>
        <div className='flex justify-around'>
          {[
            { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
            { id: 'analytics', icon: '📈', label: 'التحليلات' },
            { id: 'production', icon: '🏭', label: 'الإنتاج' },
            { id: 'quality', icon: '✅', label: 'الجودة' },
            { id: 'reports', icon: '📋', label: 'التقارير' },
            { id: 'documents', icon: '📄', label: 'المستندات' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className='text-lg mb-1'>{tab.icon}</span>
              <span className='text-xs font-medium'>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component with Providers
const App = () => {
  const isMobile = useMobileDetection();

  return (
    <AuthProvider>
      <Router>
        {isMobile ? (
          <div className='min-h-screen bg-gray-50'>
            <PWAManager />
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route
                path='/*'
                element={
                  <ProtectedRoute>
                    <MobileAppContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        ) : (
          <AppContent />
        )}
      </Router>
    </AuthProvider>
  );
};

export default App;

// Export the store for use in other components
export { useAppStore };
