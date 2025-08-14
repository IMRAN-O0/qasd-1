import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Upload,
  Save,
  Edit,
  X,
  Check,
  AlertCircle,
  Camera,
  FileText,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Palette,
  Settings,
  Shield,
  Database,
  Download,
  RefreshCw
} from 'lucide-react';

const CompanySettings = () => {
  const { user } = useAuth();
  const { get, post, put } = useApi();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Company Profile Data
  const [profileData, setProfileData] = useState({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    taxNumber: '',
    establishedDate: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Saudi Arabia'
    },
    contact: {
      phone: '',
      fax: '',
      email: '',
      website: ''
    }
  });

  // Branding Data
  const [brandingData, setBrandingData] = useState({
    logo: null,
    logoUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    letterheadTemplate: 'default',
    emailSignature: ''
  });

  // Compliance Data
  const [complianceData, setComplianceData] = useState({
    certifications: [],
    licenses: [],
    permits: []
  });

  // System Configuration Data
  const [systemData, setSystemData] = useState({
    localization: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'SAR',
      currencySymbol: 'ر.س'
    },
    businessRules: {
      fiscalYearStart: '01-01',
      workingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      overtimeRate: 1.5,
      weekendOvertimeRate: 2.0
    },
    automation: {
      backupSchedule: 'daily',
      backupTime: '02:00',
      reportGeneration: 'weekly',
      maintenanceWindow: 'saturday_02:00'
    },
    performance: {
      cacheEnabled: true,
      sessionTimeout: 30,
      maxFileSize: 10,
      databaseOptimization: true
    }
  });

  const businessTypes = ['شركة مساهمة', 'شركة ذات مسؤولية محدودة', 'مؤسسة فردية', 'شراكة', 'فرع شركة أجنبية', 'أخرى'];

  const letterheadTemplates = [
    { id: 'default', name: 'القالب الافتراضي', preview: '/templates/default.png' },
    { id: 'modern', name: 'قالب عصري', preview: '/templates/modern.png' },
    { id: 'classic', name: 'قالب كلاسيكي', preview: '/templates/classic.png' },
    { id: 'minimal', name: 'قالب بسيط', preview: '/templates/minimal.png' }
  ];

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const timezones = [
    { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
    { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
    { value: 'Asia/Kuwait', label: 'الكويت (GMT+3)' },
    { value: 'Asia/Qatar', label: 'قطر (GMT+3)' }
  ];

  const currencies = [
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
    { code: 'EUR', name: 'يورو', symbol: '€' }
  ];

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      // const [profile, branding, compliance, system] = await Promise.all([
      //   get('/api/company/profile'),
      //   get('/api/company/branding'),
      //   get('/api/company/compliance'),
      //   get('/api/company/system')
      // ]);

      // Mock data
      setProfileData({
        companyName: 'شركة قاصد للصناعات الغذائية',
        businessType: 'شركة ذات مسؤولية محدودة',
        registrationNumber: '1010123456',
        taxNumber: '300123456789003',
        establishedDate: '2020-01-15',
        description: 'شركة رائدة في مجال الصناعات الغذائية وتقديم الحلول المتكاملة لإدارة الجودة والسلامة',
        address: {
          street: 'شارع الملك فهد، حي الصناعية',
          city: 'الرياض',
          state: 'منطقة الرياض',
          postalCode: '12345',
          country: 'المملكة العربية السعودية'
        },
        contact: {
          phone: '+966 11 123 4567',
          fax: '+966 11 123 4568',
          email: 'info@qasd.com.sa',
          website: 'https://www.qasd.com.sa'
        }
      });

      setBrandingData({
        logo: null,
        logoUrl: '/logo.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#059669',
        accentColor: '#D97706',
        letterheadTemplate: 'modern',
        emailSignature:
          'مع أطيب التحيات،\nفريق شركة قاصد للصناعات الغذائية\nهاتف: +966 11 123 4567\nالموقع: www.qasd.com.sa'
      });

      setComplianceData({
        certifications: [
          {
            id: 1,
            name: 'ISO 9001:2015',
            type: 'جودة',
            issueDate: '2023-01-15',
            expiryDate: '2026-01-15',
            issuingBody: 'هيئة المواصفات السعودية',
            status: 'نشط'
          },
          {
            id: 2,
            name: 'HACCP',
            type: 'سلامة غذائية',
            issueDate: '2023-03-20',
            expiryDate: '2025-03-20',
            issuingBody: 'هيئة الغذاء والدواء',
            status: 'نشط'
          }
        ],
        licenses: [
          {
            id: 1,
            name: 'رخصة تجارية',
            number: 'CR-1010123456',
            issueDate: '2020-01-15',
            expiryDate: '2025-01-15',
            issuingAuthority: 'وزارة التجارة',
            status: 'نشط'
          }
        ],
        permits: [
          {
            id: 1,
            name: 'تصريح بيئي',
            number: 'ENV-2023-001',
            issueDate: '2023-01-01',
            expiryDate: '2024-12-31',
            issuingAuthority: 'الهيئة العامة للأرصاد وحماية البيئة',
            status: 'نشط'
          }
        ]
      });
    } catch (error) {
      console.error('Error loading company data:', error);
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
        case 'profile':
          dataToSave = profileData;
          break;
        case 'branding':
          dataToSave = brandingData;
          break;
        case 'compliance':
          dataToSave = complianceData;
          break;
        case 'system':
          dataToSave = systemData;
          break;
        default:
          return;
      }

      // await put(`/api/company/${section}`, dataToSave);
      console.log(`Saving ${section} data:`, dataToSave);

      setSuccessMessage('تم حفظ البيانات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(`Error saving ${section} data:`, error);
      setErrors({ general: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = event => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ logo: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت' });
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        setBrandingData(prev => ({
          ...prev,
          logo: file,
          logoUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, logo: undefined });
    }
  };

  const addCertification = () => {
    const newCert = {
      id: Date.now(),
      name: '',
      type: '',
      issueDate: '',
      expiryDate: '',
      issuingBody: '',
      status: 'نشط'
    };
    setComplianceData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const removeCertification = id => {
    setComplianceData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const updateCertification = (id, field, value) => {
    setComplianceData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => (cert.id === id ? { ...cert, [field]: value } : cert))
    }));
  };

  const formatDate = date => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const tabs = [
    { id: 'profile', name: 'الملف الشخصي', icon: Building2 },
    { id: 'branding', name: 'الهوية البصرية', icon: Palette },
    { id: 'compliance', name: 'الامتثال والشهادات', icon: Award },
    { id: 'system', name: 'إعدادات النظام', icon: Settings }
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
          <h1 className='text-2xl font-bold text-gray-900'>إعدادات الشركة</h1>
          <p className='text-gray-600 mt-1'>إدارة معلومات الشركة والإعدادات العامة</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-600' />
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
        {/* Company Profile Tab */}
        {activeTab === 'profile' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>معلومات الشركة الأساسية</h2>
              <button
                onClick={() => handleSave('profile')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>اسم الشركة *</label>
                <input
                  type='text'
                  value={profileData.companyName}
                  onChange={e => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>نوع النشاط التجاري *</label>
                <select
                  value={profileData.businessType}
                  onChange={e => setProfileData(prev => ({ ...prev, businessType: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>اختر نوع النشاط</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>رقم السجل التجاري *</label>
                <input
                  type='text'
                  value={profileData.registrationNumber}
                  onChange={e => setProfileData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>الرقم الضريبي</label>
                <input
                  type='text'
                  value={profileData.taxNumber}
                  onChange={e => setProfileData(prev => ({ ...prev, taxNumber: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>تاريخ التأسيس</label>
                <input
                  type='date'
                  value={profileData.establishedDate}
                  onChange={e => setProfileData(prev => ({ ...prev, establishedDate: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>وصف الشركة</label>
              <textarea
                value={profileData.description}
                onChange={e => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='أدخل وصف مختصر عن الشركة وأنشطتها'
              />
            </div>

            {/* Address Section */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <MapPin className='w-5 h-5' />
                العنوان
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الشارع والحي</label>
                  <input
                    type='text'
                    value={profileData.address.street}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>المدينة</label>
                  <input
                    type='text'
                    value={profileData.address.city}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>المنطقة</label>
                  <input
                    type='text'
                    value={profileData.address.state}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الرمز البريدي</label>
                  <input
                    type='text'
                    value={profileData.address.postalCode}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, postalCode: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الدولة</label>
                  <input
                    type='text'
                    value={profileData.address.country}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Phone className='w-5 h-5' />
                معلومات الاتصال
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الهاتف</label>
                  <input
                    type='tel'
                    value={profileData.contact.phone}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الفاكس</label>
                  <input
                    type='tel'
                    value={profileData.contact.fax}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, fax: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>البريد الإلكتروني</label>
                  <input
                    type='email'
                    value={profileData.contact.email}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>الموقع الإلكتروني</label>
                  <input
                    type='url'
                    value={profileData.contact.website}
                    onChange={e =>
                      setProfileData(prev => ({
                        ...prev,
                        contact: { ...prev.contact, website: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>الهوية البصرية والعلامة التجارية</h2>
              <button
                onClick={() => handleSave('branding')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            {/* Logo Upload */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>شعار الشركة</h3>
              <div className='flex items-center gap-6'>
                <div className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50'>
                  {brandingData.logoUrl ? (
                    <img
                      src={brandingData.logoUrl}
                      alt='Company Logo'
                      className='w-full h-full object-contain rounded-lg'
                    />
                  ) : (
                    <div className='text-center'>
                      <Camera className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                      <span className='text-sm text-gray-500'>لا يوجد شعار</span>
                    </div>
                  )}
                </div>
                <div>
                  <input type='file' id='logo-upload' accept='image/*' onChange={handleLogoUpload} className='hidden' />
                  <label
                    htmlFor='logo-upload'
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 inline-flex'
                  >
                    <Upload className='w-4 h-4' />
                    رفع شعار جديد
                  </label>
                  <p className='text-sm text-gray-500 mt-2'>
                    الحد الأقصى: 2 ميجابايت
                    <br />
                    الصيغ المدعومة: PNG, JPG, SVG
                  </p>
                  {errors.logo && <p className='text-sm text-red-600 mt-1'>{errors.logo}</p>}
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>نظام الألوان</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>اللون الأساسي</label>
                  <div className='flex items-center gap-3'>
                    <input
                      type='color'
                      value={brandingData.primaryColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className='w-12 h-10 border border-gray-300 rounded cursor-pointer'
                    />
                    <input
                      type='text'
                      value={brandingData.primaryColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>اللون الثانوي</label>
                  <div className='flex items-center gap-3'>
                    <input
                      type='color'
                      value={brandingData.secondaryColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className='w-12 h-10 border border-gray-300 rounded cursor-pointer'
                    />
                    <input
                      type='text'
                      value={brandingData.secondaryColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>لون التمييز</label>
                  <div className='flex items-center gap-3'>
                    <input
                      type='color'
                      value={brandingData.accentColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className='w-12 h-10 border border-gray-300 rounded cursor-pointer'
                    />
                    <input
                      type='text'
                      value={brandingData.accentColor}
                      onChange={e => setBrandingData(prev => ({ ...prev, accentColor: e.target.value }))}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Letterhead Templates */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>قوالب الخطابات الرسمية</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {letterheadTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      brandingData.letterheadTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setBrandingData(prev => ({ ...prev, letterheadTemplate: template.id }))}
                  >
                    <div className='aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center'>
                      <FileText className='w-8 h-8 text-gray-400' />
                    </div>
                    <h4 className='font-medium text-sm text-center'>{template.name}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Signature */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4'>توقيع البريد الإلكتروني</h3>
              <textarea
                value={brandingData.emailSignature}
                onChange={e => setBrandingData(prev => ({ ...prev, emailSignature: e.target.value }))}
                rows={6}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='أدخل توقيع البريد الإلكتروني الافتراضي'
              />
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>الامتثال والشهادات</h2>
              <button
                onClick={() => handleSave('compliance')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            {/* Certifications */}
            <div>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-md font-semibold text-gray-900 flex items-center gap-2'>
                  <Award className='w-5 h-5' />
                  الشهادات
                </h3>
                <button
                  onClick={addCertification}
                  className='bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1'
                >
                  <Plus className='w-4 h-4' />
                  إضافة شهادة
                </button>
              </div>

              <div className='space-y-4'>
                {complianceData.certifications.map(cert => (
                  <div key={cert.id} className='border border-gray-200 rounded-lg p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>اسم الشهادة</label>
                        <input
                          type='text'
                          value={cert.name}
                          onChange={e => updateCertification(cert.id, 'name', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>النوع</label>
                        <input
                          type='text'
                          value={cert.type}
                          onChange={e => updateCertification(cert.id, 'type', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>الجهة المانحة</label>
                        <input
                          type='text'
                          value={cert.issuingBody}
                          onChange={e => updateCertification(cert.id, 'issuingBody', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الإصدار</label>
                        <input
                          type='date'
                          value={cert.issueDate}
                          onChange={e => updateCertification(cert.id, 'issueDate', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الانتهاء</label>
                        <input
                          type='date'
                          value={cert.expiryDate}
                          onChange={e => updateCertification(cert.id, 'expiryDate', e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                      <div className='flex items-end'>
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className='text-red-600 hover:text-red-700 p-2'
                          title='حذف الشهادة'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Configuration Tab */}
        {activeTab === 'system' && (
          <div className='p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-lg font-semibold text-gray-900'>إعدادات النظام</h2>
              <button
                onClick={() => handleSave('system')}
                disabled={saving}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {saving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                حفظ التغييرات
              </button>
            </div>

            {/* Localization */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Globe className='w-5 h-5' />
                الإعدادات الإقليمية
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>اللغة</label>
                  <select
                    value={systemData.localization.language}
                    onChange={e =>
                      setSystemData(prev => ({
                        ...prev,
                        localization: { ...prev.localization, language: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>المنطقة الزمنية</label>
                  <select
                    value={systemData.localization.timezone}
                    onChange={e =>
                      setSystemData(prev => ({
                        ...prev,
                        localization: { ...prev.localization, timezone: e.target.value }
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>العملة</label>
                  <select
                    value={systemData.localization.currency}
                    onChange={e => {
                      const currency = currencies.find(c => c.code === e.target.value);
                      setSystemData(prev => ({
                        ...prev,
                        localization: {
                          ...prev.localization,
                          currency: e.target.value,
                          currencySymbol: currency?.symbol || ''
                        }
                      }));
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Business Rules */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                القواعد التجارية
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>بداية السنة المالية</label>
                  <input
                    type='text'
                    value={systemData.businessRules.fiscalYearStart}
                    onChange={e =>
                      setSystemData(prev => ({
                        ...prev,
                        businessRules: { ...prev.businessRules, fiscalYearStart: e.target.value }
                      }))
                    }
                    placeholder='MM-DD'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>ساعات العمل</label>
                  <div className='flex gap-2'>
                    <input
                      type='time'
                      value={systemData.businessRules.workingHours.start}
                      onChange={e =>
                        setSystemData(prev => ({
                          ...prev,
                          businessRules: {
                            ...prev.businessRules,
                            workingHours: { ...prev.businessRules.workingHours, start: e.target.value }
                          }
                        }))
                      }
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <span className='flex items-center px-2 text-gray-500'>إلى</span>
                    <input
                      type='time'
                      value={systemData.businessRules.workingHours.end}
                      onChange={e =>
                        setSystemData(prev => ({
                          ...prev,
                          businessRules: {
                            ...prev.businessRules,
                            workingHours: { ...prev.businessRules.workingHours, end: e.target.value }
                          }
                        }))
                      }
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div>
              <h3 className='text-md font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Database className='w-5 h-5' />
                إعدادات الأداء
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div>
                    <h4 className='font-medium text-gray-900'>تفعيل التخزين المؤقت</h4>
                    <p className='text-sm text-gray-500'>تحسين سرعة تحميل الصفحات</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={systemData.performance.cacheEnabled}
                    onChange={e =>
                      setSystemData(prev => ({
                        ...prev,
                        performance: { ...prev.performance, cacheEnabled: e.target.checked }
                      }))
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </div>
                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div>
                    <h4 className='font-medium text-gray-900'>تحسين قاعدة البيانات</h4>
                    <p className='text-sm text-gray-500'>تحسين أداء الاستعلامات</p>
                  </div>
                  <input
                    type='checkbox'
                    checked={systemData.performance.databaseOptimization}
                    onChange={e =>
                      setSystemData(prev => ({
                        ...prev,
                        performance: { ...prev.performance, databaseOptimization: e.target.checked }
                      }))
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>مهلة انتهاء الجلسة (دقيقة)</label>
                    <input
                      type='number'
                      value={systemData.performance.sessionTimeout}
                      onChange={e =>
                        setSystemData(prev => ({
                          ...prev,
                          performance: { ...prev.performance, sessionTimeout: parseInt(e.target.value) }
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      الحد الأقصى لحجم الملف (ميجابايت)
                    </label>
                    <input
                      type='number'
                      value={systemData.performance.maxFileSize}
                      onChange={e =>
                        setSystemData(prev => ({
                          ...prev,
                          performance: { ...prev.performance, maxFileSize: parseInt(e.target.value) }
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySettings;
