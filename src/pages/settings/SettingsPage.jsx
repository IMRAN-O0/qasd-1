import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Cog,
  Users,
  Shield,
  Save,
  Upload,
  Download,
  RefreshCw,
  Bell,
  Globe,
  Palette,
  Database,
  Lock,
  Key,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { Button, Input, Card, Modal, Badge, Loading } from '../../components/common';
import EnhancedSelect from '../../components/common/EnhancedSelect';
import { useLocalStorage, useForm } from '../../hooks';
import { STORAGE_KEYS } from '../../constants';
import { validators, formatters } from '../../utils';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // إعدادات الشركة
  const [companySettings, setCompanySettings] = useLocalStorage(STORAGE_KEYS.COMPANY_SETTINGS, {
    name: 'شركة QASD للصناعات الدوائية',
    nameEn: 'QASD Pharmaceutical Industries',
    logo: '',
    address: 'الرياض، المملكة العربية السعودية',
    phone: '+966 11 123 4567',
    email: 'info@qasd.com',
    website: 'www.qasd.com',
    taxNumber: '123456789',
    commercialRegister: 'CR-123456789',
    establishedDate: '2020-01-01',
    industry: 'الصناعات الدوائية',
    description: 'شركة رائدة في مجال الصناعات الدوائية والمكملات الغذائية'
  });

  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useLocalStorage(STORAGE_KEYS.SYSTEM_SETTINGS, {
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  // إعدادات المستخدمين
  const [userSettings, setUserSettings] = useLocalStorage(STORAGE_KEYS.USER_SETTINGS, {
    defaultRole: 'user',
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    passwordExpiry: 90,
    twoFactorAuth: false,
    allowMultipleSessions: false,
    userRegistration: false,
    emailVerification: true
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useLocalStorage(STORAGE_KEYS.SECURITY_SETTINGS, {
    encryptionEnabled: true,
    auditLogging: true,
    ipWhitelist: '',
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png',
    maxFileSize: 10,
    dataRetentionPeriod: 365,
    backupEncryption: true,
    apiRateLimit: 1000,
    bruteForceProtection: true
  });

  const companyForm = useForm(companySettings, {
    name: [validators.required],
    email: [validators.required, validators.email],
    phone: [validators.required],
    taxNumber: [validators.required]
  });

  const systemForm = useForm(systemSettings, {});
  const userForm = useForm(userSettings, {});
  const securityForm = useForm(securitySettings, {});

  const tabs = [
    {
      id: 'company',
      label: 'معلومات الشركة',
      icon: Building2,
      description: 'إعدادات الشركة والمعلومات الأساسية'
    },
    {
      id: 'system',
      label: 'إعدادات النظام',
      icon: Settings,
      description: 'إعدادات عامة للنظام واللغة والعملة'
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: Users,
      description: 'إعدادات المستخدمين وكلمات المرور'
    },
    {
      id: 'security',
      label: 'الأمان والحماية',
      icon: Shield,
      description: 'إعدادات الأمان والتشفير والنسخ الاحتياطي'
    }
  ];

  const handleSave = async formType => {
    setLoading(true);
    try {
      switch (formType) {
        case 'company':
          await companyForm.handleSubmit(() => {
            setCompanySettings(companyForm.values);
          })();
          break;
        case 'system':
          await systemForm.handleSubmit(() => {
            setSystemSettings(systemForm.values);
          })();
          break;
        case 'users':
          await userForm.handleSubmit(() => {
            setUserSettings(userForm.values);
          })();
          break;
        case 'security':
          await securityForm.handleSubmit(() => {
            setSecuritySettings(securityForm.values);
          })();
          break;
      }
      setSaveMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = () => {
    const allSettings = {
      company: companySettings,
      system: systemSettings,
      users: userSettings,
      security: securitySettings,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qasd-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importSettings = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const settings = JSON.parse(e.target.result);
          if (settings.company) {
            setCompanySettings(settings.company);
          }
          if (settings.system) {
            setSystemSettings(settings.system);
          }
          if (settings.users) {
            setUserSettings(settings.users);
          }
          if (settings.security) {
            setSecuritySettings(settings.security);
          }
          setSaveMessage('تم استيراد الإعدادات بنجاح');
          setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
          alert('خطأ في قراءة ملف الإعدادات');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderCompanySettings = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Building2 className='text-blue-600' size={20} />
            المعلومات الأساسية
          </h3>

          <Input
            label='اسم الشركة (عربي)'
            name='name'
            value={companyForm.values.name}
            onChange={companyForm.handleChange}
            error={companyForm.errors.name}
            required
            icon={Building2}
          />

          <Input
            label='اسم الشركة (إنجليزي)'
            name='nameEn'
            value={companyForm.values.nameEn}
            onChange={companyForm.handleChange}
            error={companyForm.errors.nameEn}
          />

          <Input
            label='العنوان'
            name='address'
            value={companyForm.values.address}
            onChange={companyForm.handleChange}
            error={companyForm.errors.address}
            icon={MapPin}
            type='textarea'
            rows={3}
          />

          <Input
            label='وصف الشركة'
            name='description'
            value={companyForm.values.description}
            onChange={companyForm.handleChange}
            error={companyForm.errors.description}
            type='textarea'
            rows={3}
          />
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Phone className='text-green-600' size={20} />
            معلومات الاتصال
          </h3>

          <Input
            label='رقم الهاتف'
            name='phone'
            value={companyForm.values.phone}
            onChange={companyForm.handleChange}
            error={companyForm.errors.phone}
            required
            icon={Phone}
          />

          <Input
            label='البريد الإلكتروني'
            name='email'
            type='email'
            value={companyForm.values.email}
            onChange={companyForm.handleChange}
            error={companyForm.errors.email}
            required
            icon={Mail}
          />

          <Input
            label='الموقع الإلكتروني'
            name='website'
            value={companyForm.values.website}
            onChange={companyForm.handleChange}
            error={companyForm.errors.website}
            icon={Globe}
          />

          <Input
            label='الرقم الضريبي'
            name='taxNumber'
            value={companyForm.values.taxNumber}
            onChange={companyForm.handleChange}
            error={companyForm.errors.taxNumber}
            required
          />

          <Input
            label='رقم السجل التجاري'
            name='commercialRegister'
            value={companyForm.values.commercialRegister}
            onChange={companyForm.handleChange}
            error={companyForm.errors.commercialRegister}
          />

          <Input
            label='تاريخ التأسيس'
            name='establishedDate'
            type='date'
            value={companyForm.values.establishedDate}
            onChange={companyForm.handleChange}
            error={companyForm.errors.establishedDate}
            icon={Calendar}
          />
        </div>
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t'>
        <Button onClick={() => handleSave('company')} loading={loading} icon={Save}>
          حفظ معلومات الشركة
        </Button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Globe className='text-blue-600' size={20} />
            اللغة والمنطقة
          </h3>

          <EnhancedSelect
            label='اللغة الافتراضية'
            name='language'
            value={systemForm.values.language}
            onChange={systemForm.handleChange}
          >
            <option value='ar'>العربية</option>
            <option value='en'>English</option>
          </EnhancedSelect>

          <EnhancedSelect
            label='المنطقة الزمنية'
            name='timezone'
            value={systemForm.values.timezone}
            onChange={systemForm.handleChange}
          >
            <option value='Asia/Riyadh'>الرياض (GMT+3)</option>
            <option value='Asia/Dubai'>دبي (GMT+4)</option>
            <option value='Asia/Kuwait'>الكويت (GMT+3)</option>
          </EnhancedSelect>

          <EnhancedSelect
            label='تنسيق التاريخ'
            name='dateFormat'
            value={systemForm.values.dateFormat}
            onChange={systemForm.handleChange}
          >
            <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
            <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
            <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
          </EnhancedSelect>

          <EnhancedSelect
            label='تنسيق الوقت'
            name='timeFormat'
            value={systemForm.values.timeFormat}
            onChange={systemForm.handleChange}
          >
            <option value='24h'>24 ساعة</option>
            <option value='12h'>12 ساعة</option>
          </EnhancedSelect>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Palette className='text-purple-600' size={20} />
            المظهر والعملة
          </h3>

          <EnhancedSelect
            label='العملة'
            name='currency'
            value={systemForm.values.currency}
            onChange={systemForm.handleChange}
          >
            <option value='SAR'>ريال سعودي (SAR)</option>
            <option value='USD'>دولار أمريكي (USD)</option>
            <option value='EUR'>يورو (EUR)</option>
          </EnhancedSelect>

          <Input
            label='رمز العملة'
            name='currencySymbol'
            value={systemForm.values.currencySymbol}
            onChange={systemForm.handleChange}
          />

          <EnhancedSelect
            label='المظهر'
            name='theme'
            value={systemForm.values.theme}
            onChange={systemForm.handleChange}
          >
            <option value='light'>فاتح</option>
            <option value='dark'>داكن</option>
            <option value='auto'>تلقائي</option>
          </EnhancedSelect>

          <Input
            label='مهلة انتهاء الجلسة (دقيقة)'
            name='sessionTimeout'
            type='number'
            value={systemForm.values.sessionTimeout}
            onChange={systemForm.handleChange}
            icon={Clock}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
          <Bell className='text-yellow-600' size={20} />
          الإشعارات والنسخ الاحتياطي
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-center space-x-2 space-x-reverse'>
            <input
              type='checkbox'
              id='notifications'
              checked={systemForm.values.notifications}
              onChange={e => systemForm.handleChange('notifications', e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label htmlFor='notifications' className='text-sm font-medium text-gray-700'>
              تفعيل الإشعارات
            </label>
          </div>

          <div className='flex items-center space-x-2 space-x-reverse'>
            <input
              type='checkbox'
              id='emailNotifications'
              checked={systemForm.values.emailNotifications}
              onChange={e => systemForm.handleChange('emailNotifications', e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label htmlFor='emailNotifications' className='text-sm font-medium text-gray-700'>
              إشعارات البريد الإلكتروني
            </label>
          </div>

          <div className='flex items-center space-x-2 space-x-reverse'>
            <input
              type='checkbox'
              id='autoBackup'
              checked={systemForm.values.autoBackup}
              onChange={e => systemForm.handleChange('autoBackup', e.target.checked)}
              className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            <label htmlFor='autoBackup' className='text-sm font-medium text-gray-700'>
              النسخ الاحتياطي التلقائي
            </label>
          </div>
        </div>

        <EnhancedSelect
          label='تكرار النسخ الاحتياطي'
          name='backupFrequency'
          value={systemForm.values.backupFrequency}
          onChange={systemForm.handleChange}
          disabled={!systemForm.values.autoBackup}
        >
          <option value='hourly'>كل ساعة</option>
          <option value='daily'>يومياً</option>
          <option value='weekly'>أسبوعياً</option>
          <option value='monthly'>شهرياً</option>
        </EnhancedSelect>
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t'>
        <Button onClick={() => handleSave('system')} loading={loading} icon={Save}>
          حفظ إعدادات النظام
        </Button>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <UserCheck className='text-green-600' size={20} />
            إعدادات المستخدمين
          </h3>

          <EnhancedSelect
            label='الدور الافتراضي للمستخدمين الجدد'
            name='defaultRole'
            value={userForm.values.defaultRole}
            onChange={userForm.handleChange}
          >
            <option value='user'>مستخدم عادي</option>
            <option value='manager'>مدير</option>
            <option value='admin'>مدير النظام</option>
          </EnhancedSelect>

          <div className='space-y-3'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='userRegistration'
                checked={userForm.values.userRegistration}
                onChange={e => userForm.handleChange('userRegistration', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='userRegistration' className='text-sm font-medium text-gray-700'>
                السماح بتسجيل المستخدمين الجدد
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='emailVerification'
                checked={userForm.values.emailVerification}
                onChange={e => userForm.handleChange('emailVerification', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='emailVerification' className='text-sm font-medium text-gray-700'>
                تفعيل التحقق من البريد الإلكتروني
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='allowMultipleSessions'
                checked={userForm.values.allowMultipleSessions}
                onChange={e => userForm.handleChange('allowMultipleSessions', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='allowMultipleSessions' className='text-sm font-medium text-gray-700'>
                السماح بجلسات متعددة للمستخدم الواحد
              </label>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Lock className='text-red-600' size={20} />
            سياسة كلمات المرور
          </h3>

          <Input
            label='الحد الأدنى لطول كلمة المرور'
            name='passwordMinLength'
            type='number'
            min='6'
            max='20'
            value={userForm.values.passwordMinLength}
            onChange={userForm.handleChange}
            icon={Key}
          />

          <Input
            label='انتهاء صلاحية كلمة المرور (يوم)'
            name='passwordExpiry'
            type='number'
            min='30'
            max='365'
            value={userForm.values.passwordExpiry}
            onChange={userForm.handleChange}
          />

          <div className='space-y-3'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='passwordRequireSpecialChars'
                checked={userForm.values.passwordRequireSpecialChars}
                onChange={e => userForm.handleChange('passwordRequireSpecialChars', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='passwordRequireSpecialChars' className='text-sm font-medium text-gray-700'>
                يجب أن تحتوي على رموز خاصة
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='passwordRequireNumbers'
                checked={userForm.values.passwordRequireNumbers}
                onChange={e => userForm.handleChange('passwordRequireNumbers', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='passwordRequireNumbers' className='text-sm font-medium text-gray-700'>
                يجب أن تحتوي على أرقام
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='passwordRequireUppercase'
                checked={userForm.values.passwordRequireUppercase}
                onChange={e => userForm.handleChange('passwordRequireUppercase', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='passwordRequireUppercase' className='text-sm font-medium text-gray-700'>
                يجب أن تحتوي على أحرف كبيرة
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='twoFactorAuth'
                checked={userForm.values.twoFactorAuth}
                onChange={e => userForm.handleChange('twoFactorAuth', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='twoFactorAuth' className='text-sm font-medium text-gray-700'>
                تفعيل المصادقة الثنائية
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t'>
        <Button onClick={() => handleSave('users')} loading={loading} icon={Save}>
          حفظ إعدادات المستخدمين
        </Button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Shield className='text-blue-600' size={20} />
            الأمان العام
          </h3>

          <div className='space-y-3'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='encryptionEnabled'
                checked={securityForm.values.encryptionEnabled}
                onChange={e => securityForm.handleChange('encryptionEnabled', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='encryptionEnabled' className='text-sm font-medium text-gray-700'>
                تفعيل التشفير
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='auditLogging'
                checked={securityForm.values.auditLogging}
                onChange={e => securityForm.handleChange('auditLogging', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='auditLogging' className='text-sm font-medium text-gray-700'>
                تسجيل عمليات المراجعة
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='bruteForceProtection'
                checked={securityForm.values.bruteForceProtection}
                onChange={e => securityForm.handleChange('bruteForceProtection', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='bruteForceProtection' className='text-sm font-medium text-gray-700'>
                الحماية من الهجمات المتكررة
              </label>
            </div>

            <div className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                id='backupEncryption'
                checked={securityForm.values.backupEncryption}
                onChange={e => securityForm.handleChange('backupEncryption', e.target.checked)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label htmlFor='backupEncryption' className='text-sm font-medium text-gray-700'>
                تشفير النسخ الاحتياطية
              </label>
            </div>
          </div>

          <Input
            label='عناوين IP المسموحة (مفصولة بفاصلة)'
            name='ipWhitelist'
            value={securityForm.values.ipWhitelist}
            onChange={securityForm.handleChange}
            placeholder='192.168.1.1, 10.0.0.1'
            type='textarea'
            rows={3}
          />
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Database className='text-green-600' size={20} />
            إدارة البيانات
          </h3>

          <Input
            label='أنواع الملفات المسموحة'
            name='allowedFileTypes'
            value={securityForm.values.allowedFileTypes}
            onChange={securityForm.handleChange}
            placeholder='pdf,doc,docx,xls,xlsx'
          />

          <Input
            label='الحد الأقصى لحجم الملف (MB)'
            name='maxFileSize'
            type='number'
            min='1'
            max='100'
            value={securityForm.values.maxFileSize}
            onChange={securityForm.handleChange}
          />

          <Input
            label='فترة الاحتفاظ بالبيانات (يوم)'
            name='dataRetentionPeriod'
            type='number'
            min='30'
            max='3650'
            value={securityForm.values.dataRetentionPeriod}
            onChange={securityForm.handleChange}
          />

          <Input
            label='حد معدل استخدام API (طلب/ساعة)'
            name='apiRateLimit'
            type='number'
            min='100'
            max='10000'
            value={securityForm.values.apiRateLimit}
            onChange={securityForm.handleChange}
          />
        </div>
      </div>

      <div className='flex justify-end gap-4 pt-4 border-t'>
        <Button onClick={() => handleSave('security')} loading={loading} icon={Save}>
          حفظ إعدادات الأمان
        </Button>
      </div>
    </div>
  );

  return (
    <div className='p-6 space-y-6' dir='rtl'>
      {/* رأس الصفحة */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Settings className='text-blue-600' size={32} />
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>إعدادات النظام</h1>
            <p className='text-gray-600'>إدارة شاملة لجميع إعدادات النظام والشركة</p>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button onClick={exportSettings} variant='secondary' icon={Download}>
            تصدير الإعدادات
          </Button>
          <label>
            <Button variant='secondary' icon={Upload}>
              استيراد الإعدادات
            </Button>
            <input type='file' accept='.json' onChange={importSettings} className='hidden' />
          </label>
        </div>
      </div>

      {/* رسالة النجاح */}
      {saveMessage && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-green-800 font-medium'>{saveMessage}</span>
          </div>
        </div>
      )}

      {/* التبويبات */}
      <Card>
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8 space-x-reverse' aria-label='Tabs'>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                  `}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* وصف التبويب النشط */}
        <div className='p-4 bg-gray-50 border-b'>
          <p className='text-sm text-gray-600'>{tabs.find(tab => tab.id === activeTab)?.description}</p>
        </div>

        {/* محتوى التبويب */}
        <div className='p-6'>
          {activeTab === 'company' && renderCompanySettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'users' && renderUserSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
