import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Monitor,
  Smartphone,
  MapPin,
  Activity,
  Settings,
  Save,
  RefreshCw,
  Download,
  Filter,
  Search,
  MoreVertical,
  Ban,
  Unlock,
  Key,
  Wifi,
  Globe,
  Calendar,
  User,
  LogOut,
  AlertCircle
} from 'lucide-react';

const SecuritySettings = () => {
  const { user } = useAuth();
  const { get, post, put } = useApi();

  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Active Sessions Data
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSearch, setSessionSearch] = useState('');

  // Failed Login Attempts
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);

  // Password Policy
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    preventCommonPasswords: true,
    preventReuse: 5,
    expiryDays: 90,
    warningDays: 7,
    maxAttempts: 5,
    lockoutDuration: 30
  });

  // Session Security
  const [sessionSecurity, setSessionSecurity] = useState({
    timeout: 30,
    maxSessions: 3,
    deviceTracking: true,
    ipWhitelist: [],
    requireReauth: false,
    logoutOnClose: false
  });

  // Two-Factor Authentication
  const [twoFactorAuth, setTwoFactorAuth] = useState({
    enabled: false,
    method: 'email', // email, sms, app
    backupCodes: [],
    trustedDevices: []
  });

  // Audit Trail
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState({
    dateFrom: '',
    dateTo: '',
    action: 'all',
    user: 'all',
    module: 'all'
  });

  const sessionTypes = [
    { value: 'all', label: 'جميع الجلسات', count: 0 },
    { value: 'active', label: 'نشطة', count: 0 },
    { value: 'expired', label: 'منتهية الصلاحية', count: 0 },
    { value: 'suspicious', label: 'مشبوهة', count: 0 }
  ];

  const auditActions = [
    { value: 'all', label: 'جميع الأنشطة' },
    { value: 'login', label: 'تسجيل الدخول' },
    { value: 'logout', label: 'تسجيل الخروج' },
    { value: 'create', label: 'إنشاء' },
    { value: 'update', label: 'تحديث' },
    { value: 'delete', label: 'حذف' },
    { value: 'export', label: 'تصدير' },
    { value: 'import', label: 'استيراد' }
  ];

  const modules = [
    { value: 'all', label: 'جميع الوحدات' },
    { value: 'users', label: 'إدارة المستخدمين' },
    { value: 'inventory', label: 'المخزون' },
    { value: 'production', label: 'الإنتاج' },
    { value: 'quality', label: 'الجودة' },
    { value: 'sales', label: 'المبيعات' },
    { value: 'safety', label: 'السلامة' },
    { value: 'settings', label: 'الإعدادات' }
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      setActiveSessions([
        {
          id: '1',
          userId: user?.id,
          userName: user?.name || 'أحمد محمد',
          device: 'Windows PC',
          browser: 'Chrome 120.0',
          ip: '192.168.1.100',
          location: 'الرياض، السعودية',
          loginTime: '2024-01-15T08:30:00Z',
          lastActivity: '2024-01-15T14:25:00Z',
          status: 'active',
          isCurrent: true
        },
        {
          id: '2',
          userId: user?.id,
          userName: user?.name || 'أحمد محمد',
          device: 'iPhone 15',
          browser: 'Safari Mobile',
          ip: '192.168.1.101',
          location: 'الرياض، السعودية',
          loginTime: '2024-01-15T07:15:00Z',
          lastActivity: '2024-01-15T13:45:00Z',
          status: 'active',
          isCurrent: false
        },
        {
          id: '3',
          userId: '2',
          userName: 'سارة أحمد',
          device: 'MacBook Pro',
          browser: 'Safari 17.0',
          ip: '192.168.1.102',
          location: 'جدة، السعودية',
          loginTime: '2024-01-15T09:00:00Z',
          lastActivity: '2024-01-15T14:20:00Z',
          status: 'active',
          isCurrent: false
        }
      ]);

      setFailedAttempts([
        {
          id: '1',
          ip: '203.0.113.1',
          username: 'admin',
          attempts: 8,
          lastAttempt: '2024-01-15T14:30:00Z',
          location: 'غير معروف',
          status: 'blocked'
        },
        {
          id: '2',
          ip: '198.51.100.1',
          username: 'user123',
          attempts: 3,
          lastAttempt: '2024-01-15T13:15:00Z',
          location: 'الدمام، السعودية',
          status: 'monitoring'
        }
      ]);

      setBlockedIPs([
        {
          id: '1',
          ip: '203.0.113.1',
          reason: 'محاولات دخول متكررة',
          blockedAt: '2024-01-15T14:30:00Z',
          expiresAt: '2024-01-16T14:30:00Z',
          attempts: 8
        }
      ]);

      setAuditLogs([
        {
          id: '1',
          userId: user?.id,
          userName: user?.name || 'أحمد محمد',
          action: 'login',
          module: 'authentication',
          details: 'تسجيل دخول ناجح',
          ip: '192.168.1.100',
          timestamp: '2024-01-15T08:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          userId: user?.id,
          userName: user?.name || 'أحمد محمد',
          action: 'update',
          module: 'users',
          details: 'تحديث بيانات المستخدم: سارة أحمد',
          ip: '192.168.1.100',
          timestamp: '2024-01-15T10:15:00Z',
          status: 'success'
        },
        {
          id: '3',
          userId: '2',
          userName: 'سارة أحمد',
          action: 'export',
          module: 'inventory',
          details: 'تصدير تقرير المخزون',
          ip: '192.168.1.102',
          timestamp: '2024-01-15T11:30:00Z',
          status: 'success'
        }
      ]);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async section => {
    try {
      setSaving(true);
      setErrors({});

      let dataToSave;
      switch (section) {
        case 'password':
          dataToSave = passwordPolicy;
          break;
        case 'session':
          dataToSave = sessionSecurity;
          break;
        case '2fa':
          dataToSave = twoFactorAuth;
          break;
        default:
          return;
      }

      // await put(`/api/security/${section}`, dataToSave);
      console.log(`Saving ${section} settings:`, dataToSave);

      setSuccessMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      setErrors({ general: 'حدث خطأ أثناء حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  const terminateSession = async sessionId => {
    try {
      // await post(`/api/security/sessions/${sessionId}/terminate`);
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      setSuccessMessage('تم إنهاء الجلسة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const unblockIP = async ip => {
    try {
      // await post(`/api/security/unblock-ip`, { ip });
      setBlockedIPs(prev => prev.filter(blocked => blocked.ip !== ip));
      setSuccessMessage('تم إلغاء حظر العنوان بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error unblocking IP:', error);
    }
  };

  const exportAuditLog = () => {
    // Mock export functionality
    const csvContent = auditLogs
      .map(log => `${log.timestamp},${log.userName},${log.action},${log.module},${log.details},${log.ip}`)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = date => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getDeviceIcon = device => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className='w-4 h-4' />;
    }
    return <Monitor className='w-4 h-4' />;
  };

  const getStatusBadge = status => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      suspicious: 'bg-red-100 text-red-800',
      blocked: 'bg-red-100 text-red-800',
      monitoring: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'نشط',
      expired: 'منتهي',
      suspicious: 'مشبوه',
      blocked: 'محظور',
      monitoring: 'مراقبة',
      success: 'نجح',
      failed: 'فشل'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges.active}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredSessions = activeSessions.filter(session => {
    const matchesFilter = sessionFilter === 'all' || session.status === sessionFilter;
    const matchesSearch =
      session.userName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      session.device.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      session.ip.includes(sessionSearch);
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'sessions', name: 'الجلسات النشطة', icon: Monitor },
    { id: 'attempts', name: 'محاولات الدخول', icon: AlertTriangle },
    { id: 'password', name: 'سياسة كلمات المرور', icon: Lock },
    { id: '2fa', name: 'المصادقة الثنائية', icon: Shield },
    { id: 'audit', name: 'سجل المراجعة', icon: Activity }
  ];

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>الأمان والحماية</h1>
          <p className='text-gray-600 mt-1'>إدارة إعدادات الأمان ومراقبة النشاطات</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2'>
          <CheckCircle className='w-5 h-5 text-green-600' />
          <span className='text-green-800'>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2'>
          <AlertCircle className='w-5 h-5 text-red-600' />
          <span className='text-red-800'>{errors.general}</span>
        </div>
      )}

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4' />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>الجلسات النشطة</h2>
              <div className='flex gap-3'>
                <div className='relative'>
                  <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    placeholder='البحث في الجلسات...'
                    value={sessionSearch}
                    onChange={e => setSessionSearch(e.target.value)}
                    className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <select
                  value={sessionFilter}
                  onChange={e => setSessionFilter(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {sessionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      المستخدم
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الجهاز والمتصفح
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الموقع
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      وقت الدخول
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      آخر نشاط
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الحالة
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredSessions.map(session => (
                    <tr key={session.id} className={session.isCurrent ? 'bg-blue-50' : ''}>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-8 w-8'>
                            <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                              <User className='w-4 h-4 text-gray-600' />
                            </div>
                          </div>
                          <div className='mr-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {session.userName}
                              {session.isCurrent && (
                                <span className='mr-2 text-xs text-blue-600'>(الجلسة الحالية)</span>
                              )}
                            </div>
                            <div className='text-sm text-gray-500'>{session.ip}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          {getDeviceIcon(session.device)}
                          <div className='mr-2'>
                            <div className='text-sm text-gray-900'>{session.device}</div>
                            <div className='text-sm text-gray-500'>{session.browser}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <MapPin className='w-4 h-4 text-gray-400 ml-1' />
                          <span className='text-sm text-gray-900'>{session.location}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatDate(session.loginTime)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {formatDate(session.lastActivity)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(session.status)}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {!session.isCurrent && (
                          <button
                            onClick={() => terminateSession(session.id)}
                            className='text-red-600 hover:text-red-900 flex items-center gap-1'
                          >
                            <LogOut className='w-4 h-4' />
                            إنهاء
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Failed Login Attempts Tab */}
        {activeTab === 'attempts' && (
          <div className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>محاولات الدخول الفاشلة</h2>

            {/* Failed Attempts Table */}
            <div className='mb-8'>
              <h3 className='text-md font-medium text-gray-900 mb-4'>المحاولات المشبوهة</h3>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        عنوان IP
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        اسم المستخدم
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        عدد المحاولات
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        آخر محاولة
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        الموقع
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        الحالة
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {failedAttempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900'>{attempt.ip}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{attempt.username}</td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`text-sm font-medium ${
                              attempt.attempts >= 5 ? 'text-red-600' : 'text-yellow-600'
                            }`}
                          >
                            {attempt.attempts}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(attempt.lastAttempt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{attempt.location}</td>
                        <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(attempt.status)}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <button className='text-red-600 hover:text-red-900 flex items-center gap-1'>
                            <Ban className='w-4 h-4' />
                            حظر
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blocked IPs */}
            <div>
              <h3 className='text-md font-medium text-gray-900 mb-4'>العناوين المحظورة</h3>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        عنوان IP
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        سبب الحظر
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        وقت الحظر
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        انتهاء الحظر
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {blockedIPs.map(blocked => (
                      <tr key={blocked.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900'>{blocked.ip}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{blocked.reason}</td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(blocked.blockedAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(blocked.expiresAt)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <button
                            onClick={() => unblockIP(blocked.ip)}
                            className='text-green-600 hover:text-green-900 flex items-center gap-1'
                          >
                            <Unlock className='w-4 h-4' />
                            إلغاء الحظر
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Password Policy Tab */}
        {activeTab === 'password' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>سياسة كلمات المرور</h2>
              <button
                onClick={() => handleSave('password')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Password Requirements */}
              <div className='space-y-4'>
                <h3 className='text-md font-semibold text-gray-900'>متطلبات كلمة المرور</h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الحد الأدنى لطول كلمة المرور</label>
                  <input
                    type='number'
                    min='6'
                    max='32'
                    value={passwordPolicy.minLength}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, minLength: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='requireUppercase'
                      checked={passwordPolicy.requireUppercase}
                      onChange={e => setPasswordPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='requireUppercase' className='mr-2 text-sm text-gray-700'>
                      يجب أن تحتوي على أحرف كبيرة (A-Z)
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='requireLowercase'
                      checked={passwordPolicy.requireLowercase}
                      onChange={e => setPasswordPolicy(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='requireLowercase' className='mr-2 text-sm text-gray-700'>
                      يجب أن تحتوي على أحرف صغيرة (a-z)
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='requireNumbers'
                      checked={passwordPolicy.requireNumbers}
                      onChange={e => setPasswordPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='requireNumbers' className='mr-2 text-sm text-gray-700'>
                      يجب أن تحتوي على أرقام (0-9)
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='requireSymbols'
                      checked={passwordPolicy.requireSymbols}
                      onChange={e => setPasswordPolicy(prev => ({ ...prev, requireSymbols: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='requireSymbols' className='mr-2 text-sm text-gray-700'>
                      يجب أن تحتوي على رموز (!@#$%)
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='preventCommonPasswords'
                      checked={passwordPolicy.preventCommonPasswords}
                      onChange={e => setPasswordPolicy(prev => ({ ...prev, preventCommonPasswords: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='preventCommonPasswords' className='mr-2 text-sm text-gray-700'>
                      منع كلمات المرور الشائعة
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Expiry and Security */}
              <div className='space-y-4'>
                <h3 className='text-md font-semibold text-gray-900'>إعدادات الأمان</h3>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    انتهاء صلاحية كلمة المرور (أيام)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='365'
                    value={passwordPolicy.expiryDays}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                  <p className='text-xs text-gray-500 mt-1'>0 = لا تنتهي الصلاحية</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    تحذير قبل انتهاء الصلاحية (أيام)
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='30'
                    value={passwordPolicy.warningDays}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, warningDays: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    منع إعادة استخدام آخر (كلمات مرور)
                  </label>
                  <input
                    type='number'
                    min='0'
                    max='24'
                    value={passwordPolicy.preventReuse}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, preventReuse: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    الحد الأقصى لمحاولات الدخول الخاطئة
                  </label>
                  <input
                    type='number'
                    min='3'
                    max='10'
                    value={passwordPolicy.maxAttempts}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>مدة قفل الحساب (دقائق)</label>
                  <input
                    type='number'
                    min='5'
                    max='1440'
                    value={passwordPolicy.lockoutDuration}
                    onChange={e => setPasswordPolicy(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication Tab */}
        {activeTab === '2fa' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>المصادقة الثنائية</h2>
              <button
                onClick={() => handleSave('2fa')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <Shield className='w-5 h-5 text-blue-600 ml-2' />
                <div>
                  <h3 className='text-sm font-medium text-blue-800'>تعزيز الأمان</h3>
                  <p className='text-sm text-blue-700 mt-1'>المصادقة الثنائية تضيف طبقة حماية إضافية لحسابك</p>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {/* Enable 2FA */}
              <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                <div>
                  <h3 className='text-md font-semibold text-gray-900'>تفعيل المصادقة الثنائية</h3>
                  <p className='text-sm text-gray-500 mt-1'>يتطلب رمز تحقق إضافي عند تسجيل الدخول</p>
                </div>
                <input
                  type='checkbox'
                  checked={twoFactorAuth.enabled}
                  onChange={e => setTwoFactorAuth(prev => ({ ...prev, enabled: e.target.checked }))}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5'
                />
              </div>

              {/* 2FA Method Selection */}
              {twoFactorAuth.enabled && (
                <div>
                  <h3 className='text-md font-semibold text-gray-900 mb-4'>طريقة المصادقة</h3>
                  <div className='space-y-3'>
                    <div className='flex items-center'>
                      <input
                        type='radio'
                        id='2fa-email'
                        name='2fa-method'
                        value='email'
                        checked={twoFactorAuth.method === 'email'}
                        onChange={e => setTwoFactorAuth(prev => ({ ...prev, method: e.target.value }))}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label htmlFor='2fa-email' className='mr-3 flex items-center'>
                        <Mail className='w-4 h-4 ml-2' />
                        البريد الإلكتروني
                      </label>
                    </div>

                    <div className='flex items-center'>
                      <input
                        type='radio'
                        id='2fa-sms'
                        name='2fa-method'
                        value='sms'
                        checked={twoFactorAuth.method === 'sms'}
                        onChange={e => setTwoFactorAuth(prev => ({ ...prev, method: e.target.value }))}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label htmlFor='2fa-sms' className='mr-3 flex items-center'>
                        <Smartphone className='w-4 h-4 ml-2' />
                        رسالة نصية (SMS)
                      </label>
                    </div>

                    <div className='flex items-center'>
                      <input
                        type='radio'
                        id='2fa-app'
                        name='2fa-method'
                        value='app'
                        checked={twoFactorAuth.method === 'app'}
                        onChange={e => setTwoFactorAuth(prev => ({ ...prev, method: e.target.value }))}
                        className='border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <label htmlFor='2fa-app' className='mr-3 flex items-center'>
                        <Key className='w-4 h-4 ml-2' />
                        تطبيق المصادقة (Google Authenticator)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup Codes */}
              {twoFactorAuth.enabled && (
                <div>
                  <h3 className='text-md font-semibold text-gray-900 mb-4'>رموز النسخ الاحتياطي</h3>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                    <p className='text-sm text-gray-600 mb-3'>
                      احتفظ بهذه الرموز في مكان آمن. يمكن استخدام كل رمز مرة واحدة فقط.
                    </p>
                    <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                      {['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678'].map((code, index) => (
                        <div key={index} className='bg-white p-2 rounded border text-center'>
                          {code}
                        </div>
                      ))}
                    </div>
                    <button className='mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1'>
                      <RefreshCw className='w-4 h-4' />
                      إنشاء رموز جديدة
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-lg font-semibold text-gray-900'>سجل المراجعة</h2>
              <button
                onClick={exportAuditLog}
                className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2'
              >
                <Download className='w-4 h-4' />
                تصدير السجل
              </button>
            </div>

            {/* Filters */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>من تاريخ</label>
                <input
                  type='date'
                  value={auditFilter.dateFrom}
                  onChange={e => setAuditFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>إلى تاريخ</label>
                <input
                  type='date'
                  value={auditFilter.dateTo}
                  onChange={e => setAuditFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>النشاط</label>
                <select
                  value={auditFilter.action}
                  onChange={e => setAuditFilter(prev => ({ ...prev, action: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {auditActions.map(action => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>الوحدة</label>
                <select
                  value={auditFilter.module}
                  onChange={e => setAuditFilter(prev => ({ ...prev, module: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {modules.map(module => (
                    <option key={module.value} value={module.value}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      التاريخ والوقت
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      المستخدم
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      النشاط
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الوحدة
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      التفاصيل
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      عنوان IP
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{formatDate(log.timestamp)}</td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-6 w-6'>
                            <div className='h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center'>
                              <User className='w-3 h-3 text-gray-600' />
                            </div>
                          </div>
                          <div className='mr-2'>
                            <div className='text-sm font-medium text-gray-900'>{log.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {auditActions.find(a => a.value === log.action)?.label || log.action}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {modules.find(m => m.value === log.module)?.label || log.module}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900 max-w-xs truncate'>{log.details}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900'>{log.ip}</td>
                      <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(log.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;
