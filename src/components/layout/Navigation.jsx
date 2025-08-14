import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  Shield,
  Activity,
  Bookmark,
  Clock,
  Filter,
  SortAsc,
  MoreHorizontal,
  Zap,
  Command
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';

const Navigation = ({ onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: notifications } = useApi('/notifications', { enabled: !!user });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ar');

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'الرئيسية', path: '/', icon: Home }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Map path segments to Arabic labels
      const segmentLabels = {
        dashboard: 'لوحة التحكم',
        production: 'الإنتاج',
        inventory: 'المخزون',
        sales: 'المبيعات',
        customers: 'العملاء',
        suppliers: 'الموردين',
        quality: 'الجودة',
        safety: 'السلامة',
        hr: 'الموارد البشرية',
        reports: 'التقارير',
        settings: 'الإعدادات',
        users: 'المستخدمين',
        roles: 'الأدوار',
        company: 'الشركة',
        security: 'الأمان',
        profile: 'الملف الشخصي',
        notifications: 'الإشعارات'
      };

      breadcrumbs.push({
        label: segmentLabels[segment] || segment,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  // Search functionality
  const handleSearch = async query => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Mock search results - replace with actual API call
    const mockResults = [
      { id: 1, title: 'إدارة المستخدمين', path: '/settings/users', type: 'page', icon: User },
      { id: 2, title: 'تقرير المبيعات', path: '/reports/sales', type: 'report', icon: Activity },
      { id: 3, title: 'إعدادات الشركة', path: '/settings/company', type: 'settings', icon: Settings },
      { id: 4, title: 'مراقبة الإنتاج', path: '/production/monitoring', type: 'page', icon: Activity },
      { id: 5, title: 'إدارة المخزون', path: '/inventory', type: 'page', icon: Bookmark }
    ].filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) || item.path.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
    setShowSearchResults(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = event => {
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }

      // Escape to close dropdowns
      if (event.key === 'Escape') {
        setShowSearchResults(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const breadcrumbs = generateBreadcrumbs();
  const unreadNotifications = notifications?.filter(n => !n.read)?.length || 0;

  return (
    <nav className='bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Left Section */}
          <div className='flex items-center gap-4'>
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className='lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
            >
              {isSidebarOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>

            {/* Logo */}
            <Link to='/' className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>Q</span>
              </div>
              <span className='hidden sm:block font-semibold text-gray-900'>QASD</span>
            </Link>

            {/* Breadcrumbs */}
            <div className='hidden md:flex items-center gap-2 text-sm'>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && <ChevronRight className='w-4 h-4 text-gray-400' />}
                  {crumb.isLast ? (
                    <span className='text-gray-900 font-medium flex items-center gap-1'>
                      {crumb.icon && <crumb.icon className='w-4 h-4' />}
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className='text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1'
                    >
                      {crumb.icon && <crumb.icon className='w-4 h-4' />}
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className='flex-1 max-w-lg mx-4' ref={searchRef}>
            <div className='relative'>
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                <Search className='w-4 h-4 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder='البحث... (Ctrl+K)'
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
              />
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <kbd className='hidden sm:inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs font-mono text-gray-500'>
                  <Command className='w-3 h-3 mr-1' />K
                </kbd>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
                  <div className='p-2'>
                    <div className='text-xs text-gray-500 px-2 py-1 border-b border-gray-100 mb-2'>
                      نتائج البحث ({searchResults.length})
                    </div>
                    {searchResults.map(result => (
                      <Link
                        key={result.id}
                        to={result.path}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className='flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <result.icon className='w-4 h-4 text-gray-400' />
                        <div>
                          <div className='text-sm font-medium text-gray-900'>{result.title}</div>
                          <div className='text-xs text-gray-500'>{result.path}</div>
                        </div>
                        <div className='mr-auto'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              result.type === 'page'
                                ? 'bg-blue-100 text-blue-700'
                                : result.type === 'report'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {result.type === 'page' ? 'صفحة' : result.type === 'report' ? 'تقرير' : 'إعدادات'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-2'>
            {/* Quick Actions */}
            <div className='hidden lg:flex items-center gap-1'>
              <button
                onClick={toggleTheme}
                className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
                title='تبديل المظهر'
              >
                {theme === 'light' ? <Moon className='w-4 h-4' /> : <Sun className='w-4 h-4' />}
              </button>

              <button className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors' title='المساعدة'>
                <HelpCircle className='w-4 h-4' />
              </button>
            </div>

            {/* Notifications */}
            <div className='relative' ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className='relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
              >
                <Bell className='w-5 h-5' />
                {unreadNotifications > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className='absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='p-4 border-b border-gray-100'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-medium text-gray-900'>الإشعارات</h3>
                      {unreadNotifications > 0 && (
                        <span className='text-xs text-blue-600'>{unreadNotifications} جديد</span>
                      )}
                    </div>
                  </div>

                  <div className='max-h-96 overflow-y-auto'>
                    {notifications?.length > 0 ? (
                      notifications.slice(0, 5).map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                            ></div>
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-gray-900'>{notification.title}</p>
                              <p className='text-xs text-gray-600 mt-1'>{notification.message}</p>
                              <p className='text-xs text-gray-500 mt-2 flex items-center gap-1'>
                                <Clock className='w-3 h-3' />
                                {new Date(notification.createdAt).toLocaleString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='p-8 text-center text-gray-500'>
                        <Bell className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                        <p className='text-sm'>لا توجد إشعارات</p>
                      </div>
                    )}
                  </div>

                  {notifications?.length > 5 && (
                    <div className='p-3 border-t border-gray-100'>
                      <Link
                        to='/notifications'
                        className='block text-center text-sm text-blue-600 hover:text-blue-700'
                        onClick={() => setShowNotifications(false)}
                      >
                        عرض جميع الإشعارات
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className='relative' ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-sm font-medium'>
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className='hidden sm:block text-right'>
                  <div className='text-sm font-medium text-gray-900'>{user?.name || user?.email}</div>
                  <div className='text-xs text-gray-500'>{user?.role}</div>
                </div>
                <ChevronDown className='w-4 h-4 text-gray-400' />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className='absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='p-3 border-b border-gray-100'>
                    <div className='font-medium text-gray-900'>{user?.name || user?.email}</div>
                    <div className='text-sm text-gray-500'>{user?.email}</div>
                    <div className='text-xs text-blue-600 mt-1'>{user?.role}</div>
                  </div>

                  <div className='p-1'>
                    <Link
                      to='/profile'
                      className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50'
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className='w-4 h-4' />
                      الملف الشخصي
                    </Link>

                    <Link
                      to='/settings'
                      className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50'
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className='w-4 h-4' />
                      الإعدادات
                    </Link>

                    <Link
                      to='/security'
                      className='flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50'
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className='w-4 h-4' />
                      الأمان
                    </Link>

                    <div className='border-t border-gray-100 my-1'></div>

                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 rounded-lg hover:bg-red-50'
                    >
                      <LogOut className='w-4 h-4' />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
