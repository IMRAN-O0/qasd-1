import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Key,
  Settings,
  Save,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { get, post, put } = useApi();

  const isEditing = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    avatar: null,

    // Account Details
    username: '',
    role: '',
    permissions: [],

    // Security Settings
    password: '',
    confirmPassword: '',
    requirePasswordChange: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,

    // Preferences
    language: 'ar',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      inventory: true,
      production: true,
      quality: true,
      safety: true
    }
  });

  const steps = [
    {
      id: 1,
      title: 'المعلومات الشخصية',
      description: 'البيانات الأساسية للمستخدم',
      icon: User
    },
    {
      id: 2,
      title: 'تفاصيل الحساب',
      description: 'الدور والصلاحيات',
      icon: Shield
    },
    {
      id: 3,
      title: 'إعدادات الأمان',
      description: 'كلمة المرور والحماية',
      icon: Key
    },
    {
      id: 4,
      title: 'التفضيلات',
      description: 'اللغة والإشعارات',
      icon: Settings
    }
  ];

  const roles = [
    { value: 'admin', label: 'مدير النظام', description: 'صلاحية كاملة على النظام' },
    { value: 'manager', label: 'مدير عام', description: 'إدارة الأقسام والعمليات' },
    { value: 'production_manager', label: 'مدير الإنتاج', description: 'إدارة عمليات الإنتاج والجودة' },
    { value: 'inventory_manager', label: 'مدير المخزون', description: 'إدارة المخزون والمشتريات' },
    { value: 'sales_manager', label: 'مدير المبيعات', description: 'إدارة العملاء والمبيعات' },
    { value: 'hr_manager', label: 'مدير الموارد البشرية', description: 'إدارة الموظفين والتدريب' },
    { value: 'safety_officer', label: 'مسؤول السلامة', description: 'مراقبة السلامة والامتثال' },
    { value: 'quality_assurance', label: 'ضمان الجودة', description: 'مراقبة الجودة والامتثال' },
    { value: 'employee', label: 'موظف', description: 'صلاحيات محدودة للعمليات' },
    { value: 'viewer', label: 'مراقب', description: 'عرض البيانات فقط' }
  ];

  const departments = [
    'الإدارة العامة',
    'الإنتاج',
    'المخزون',
    'الجودة',
    'المبيعات',
    'السلامة',
    'الموارد البشرية',
    'المحاسبة',
    'تقنية المعلومات'
  ];

  const permissions = [
    { id: 'sales_view', label: 'عرض المبيعات', module: 'sales' },
    { id: 'sales_create', label: 'إنشاء المبيعات', module: 'sales' },
    { id: 'sales_edit', label: 'تعديل المبيعات', module: 'sales' },
    { id: 'sales_delete', label: 'حذف المبيعات', module: 'sales' },
    { id: 'inventory_view', label: 'عرض المخزون', module: 'inventory' },
    { id: 'inventory_create', label: 'إنشاء المخزون', module: 'inventory' },
    { id: 'inventory_edit', label: 'تعديل المخزون', module: 'inventory' },
    { id: 'inventory_delete', label: 'حذف المخزون', module: 'inventory' },
    { id: 'production_view', label: 'عرض الإنتاج', module: 'production' },
    { id: 'production_create', label: 'إنشاء الإنتاج', module: 'production' },
    { id: 'production_edit', label: 'تعديل الإنتاج', module: 'production' },
    { id: 'production_delete', label: 'حذف الإنتاج', module: 'production' },
    { id: 'quality_view', label: 'عرض الجودة', module: 'quality' },
    { id: 'quality_create', label: 'إنشاء الجودة', module: 'quality' },
    { id: 'quality_edit', label: 'تعديل الجودة', module: 'quality' },
    { id: 'quality_delete', label: 'حذف الجودة', module: 'quality' },
    { id: 'safety_view', label: 'عرض السلامة', module: 'safety' },
    { id: 'safety_create', label: 'إنشاء السلامة', module: 'safety' },
    { id: 'safety_edit', label: 'تعديل السلامة', module: 'safety' },
    { id: 'safety_delete', label: 'حذف السلامة', module: 'safety' },
    { id: 'reports_view', label: 'عرض التقارير', module: 'reports' },
    { id: 'reports_create', label: 'إنشاء التقارير', module: 'reports' },
    { id: 'settings_view', label: 'عرض الإعدادات', module: 'settings' },
    { id: 'settings_edit', label: 'تعديل الإعدادات', module: 'settings' },
    { id: 'users_manage', label: 'إدارة المستخدمين', module: 'users' }
  ];

  useEffect(() => {
    if (isEditing) {
      loadUser();
    }
  }, [id, isEditing]);

  const loadUser = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await get(`/api/users/${id}`);
      // setFormData(response.data);

      // Mock data for editing
      const mockUser = {
        name: 'أحمد محمد علي',
        email: 'ahmed.ali@company.com',
        phone: '+966501234567',
        department: 'الإدارة العامة',
        employeeId: 'EMP001',
        username: 'ahmed.ali',
        role: 'admin',
        permissions: ['sales_view', 'sales_create', 'inventory_view', 'production_view'],
        requirePasswordChange: false,
        twoFactorEnabled: true,
        sessionTimeout: 30,
        language: 'ar',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true,
          inventory: true,
          production: true,
          quality: true,
          safety: true
        }
      };
      setFormData(prev => ({ ...prev, ...mockUser }));
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = step => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'الاسم مطلوب';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'البريد الإلكتروني غير صحيح';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'رقم الهاتف مطلوب';
        }
        if (!formData.department) {
          newErrors.department = 'القسم مطلوب';
        }
        if (!formData.employeeId.trim()) {
          newErrors.employeeId = 'رقم الموظف مطلوب';
        }
        break;

      case 2:
        if (!formData.username.trim()) {
          newErrors.username = 'اسم المستخدم مطلوب';
        }
        if (!formData.role) {
          newErrors.role = 'الدور مطلوب';
        }
        break;

      case 3:
        if (!isEditing) {
          if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة';
          } else if (formData.password.length < 8) {
            newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
          }
          if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
          } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permissionId] : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleRoleChange = role => {
    setFormData(prev => ({ ...prev, role }));

    // Auto-assign permissions based on role
    const rolePermissions = {
      admin: permissions.map(p => p.id),
      manager: permissions.filter(p => !p.id.includes('delete') && p.id !== 'users_manage').map(p => p.id),
      production_manager: permissions.filter(p => p.module === 'production' || p.module === 'quality').map(p => p.id),
      inventory_manager: permissions.filter(p => p.module === 'inventory').map(p => p.id),
      sales_manager: permissions.filter(p => p.module === 'sales').map(p => p.id),
      hr_manager: permissions.filter(p => p.module === 'users' && p.id !== 'users_manage').map(p => p.id),
      safety_officer: permissions.filter(p => p.module === 'safety').map(p => p.id),
      quality_assurance: permissions.filter(p => p.module === 'quality').map(p => p.id),
      employee: permissions.filter(p => p.id.includes('view') || p.id.includes('create')).map(p => p.id),
      viewer: permissions.filter(p => p.id.includes('view')).map(p => p.id)
    };

    setFormData(prev => ({
      ...prev,
      permissions: rolePermissions[role] || []
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        // await put(`/api/users/${id}`, formData);
        console.log('Updating user:', formData);
      } else {
        // await post('/api/users', formData);
        console.log('Creating user:', formData);
      }

      navigate('/settings/users');
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setFormData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            {/* Avatar Upload */}
            <div className='flex justify-center'>
              <div className='relative'>
                <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                  {formData.avatar ? (
                    <img src={formData.avatar} alt='Avatar' className='w-full h-full object-cover' />
                  ) : (
                    <User className='w-12 h-12 text-gray-400' />
                  )}
                </div>
                <label className='absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700'>
                  <Upload className='w-4 h-4' />
                  <input type='file' accept='image/*' onChange={handleAvatarUpload} className='hidden' />
                </label>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>الاسم الكامل *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='أدخل الاسم الكامل'
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>البريد الإلكتروني *</label>
                <input
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='أدخل البريد الإلكتروني'
                />
                {errors.email && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>رقم الهاتف *</label>
                <input
                  type='tel'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='+966xxxxxxxxx'
                />
                {errors.phone && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>القسم *</label>
                <select
                  value={formData.department}
                  onChange={e => handleInputChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value=''>اختر القسم</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.department}
                  </p>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>رقم الموظف *</label>
                <input
                  type='text'
                  value={formData.employeeId}
                  onChange={e => handleInputChange('employeeId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='EMP001'
                />
                {errors.employeeId && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.employeeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>اسم المستخدم *</label>
                <input
                  type='text'
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='أدخل اسم المستخدم'
                />
                {errors.username && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>الدور الأساسي *</label>
                <select
                  value={formData.role}
                  onChange={e => handleRoleChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value=''>اختر الدور</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                    <AlertCircle className='w-4 h-4' />
                    {errors.role}
                  </p>
                )}
                {formData.role && (
                  <p className='mt-1 text-sm text-gray-600'>
                    {roles.find(r => r.value === formData.role)?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-4'>الصلاحيات الإضافية</label>
              <div className='bg-gray-50 rounded-lg p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {['sales', 'inventory', 'production', 'quality', 'safety', 'reports', 'settings', 'users'].map(
                    module => {
                      const modulePermissions = permissions.filter(p => p.module === module);
                      if (modulePermissions.length === 0) {
                        return null;
                      }

                      return (
                        <div key={module} className='bg-white rounded-lg p-3 border'>
                          <h4 className='font-medium text-gray-900 mb-2 capitalize'>
                            {module === 'sales' && 'المبيعات'}
                            {module === 'inventory' && 'المخزون'}
                            {module === 'production' && 'الإنتاج'}
                            {module === 'quality' && 'الجودة'}
                            {module === 'safety' && 'السلامة'}
                            {module === 'reports' && 'التقارير'}
                            {module === 'settings' && 'الإعدادات'}
                            {module === 'users' && 'المستخدمون'}
                          </h4>
                          <div className='space-y-2'>
                            {modulePermissions.map(permission => (
                              <label key={permission.id} className='flex items-center'>
                                <input
                                  type='checkbox'
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={e => handlePermissionChange(permission.id, e.target.checked)}
                                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                                />
                                <span className='text-sm text-gray-700'>{permission.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            {!isEditing && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>كلمة المرور *</label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='أدخل كلمة المرور'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>تأكيد كلمة المرور *</label>
                  <div className='relative'>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='أعد إدخال كلمة المرور'
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='requirePasswordChange'
                  checked={formData.requirePasswordChange}
                  onChange={e => handleInputChange('requirePasswordChange', e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                />
                <label htmlFor='requirePasswordChange' className='text-sm text-gray-700'>
                  يتطلب تغيير كلمة المرور في أول تسجيل دخول
                </label>
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='twoFactorEnabled'
                  checked={formData.twoFactorEnabled}
                  onChange={e => handleInputChange('twoFactorEnabled', e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                />
                <label htmlFor='twoFactorEnabled' className='text-sm text-gray-700'>
                  تفعيل المصادقة الثنائية
                </label>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>مهلة انتهاء الجلسة (بالدقائق)</label>
                <select
                  value={formData.sessionTimeout}
                  onChange={e => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={60}>60 دقيقة</option>
                  <option value={120}>120 دقيقة</option>
                  <option value={0}>بدون انتهاء</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>اللغة</label>
                <select
                  value={formData.language}
                  onChange={e => handleInputChange('language', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='ar'>العربية</option>
                  <option value='en'>English</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>المظهر</label>
                <select
                  value={formData.theme}
                  onChange={e => handleInputChange('theme', e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='light'>فاتح</option>
                  <option value='dark'>داكن</option>
                  <option value='auto'>تلقائي</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-4'>إعدادات الإشعارات</label>
              <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='emailNotifications'
                      checked={formData.notifications.email}
                      onChange={e => handleNestedInputChange('notifications', 'email', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='emailNotifications' className='text-sm text-gray-700'>
                      إشعارات البريد الإلكتروني
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='smsNotifications'
                      checked={formData.notifications.sms}
                      onChange={e => handleNestedInputChange('notifications', 'sms', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='smsNotifications' className='text-sm text-gray-700'>
                      إشعارات الرسائل النصية
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='pushNotifications'
                      checked={formData.notifications.push}
                      onChange={e => handleNestedInputChange('notifications', 'push', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='pushNotifications' className='text-sm text-gray-700'>
                      الإشعارات الفورية
                    </label>
                  </div>
                </div>

                <hr className='border-gray-200' />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='inventoryNotifications'
                      checked={formData.notifications.inventory}
                      onChange={e => handleNestedInputChange('notifications', 'inventory', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='inventoryNotifications' className='text-sm text-gray-700'>
                      إشعارات المخزون
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='productionNotifications'
                      checked={formData.notifications.production}
                      onChange={e => handleNestedInputChange('notifications', 'production', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='productionNotifications' className='text-sm text-gray-700'>
                      إشعارات الإنتاج
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='qualityNotifications'
                      checked={formData.notifications.quality}
                      onChange={e => handleNestedInputChange('notifications', 'quality', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='qualityNotifications' className='text-sm text-gray-700'>
                      إشعارات الجودة
                    </label>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id='safetyNotifications'
                      checked={formData.notifications.safety}
                      onChange={e => handleNestedInputChange('notifications', 'safety', e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                    />
                    <label htmlFor='safetyNotifications' className='text-sm text-gray-700'>
                      إشعارات السلامة
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>{isEditing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h1>
          <p className='text-gray-600 mt-1'>
            {isEditing ? 'تعديل بيانات المستخدم والصلاحيات' : 'إنشاء حساب مستخدم جديد'}
          </p>
        </div>
        <button onClick={() => navigate('/settings/users')} className='text-gray-600 hover:text-gray-800'>
          <ArrowLeft className='w-6 h-6' />
        </button>
      </div>

      {/* Progress Steps */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className='flex items-center'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className='w-5 h-5' /> : <Icon className='w-5 h-5' />}
                  </div>
                  <div className='mt-2 text-center'>
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className='text-xs text-gray-400 mt-1'>{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className='flex justify-between items-center pt-6'>
          <button
            type='button'
            onClick={prevStep}
            disabled={currentStep === 1}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ArrowRight className='w-4 h-4' />
            السابق
          </button>

          <div className='flex items-center gap-3'>
            {currentStep < steps.length ? (
              <button
                type='button'
                onClick={nextStep}
                className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                التالي
                <ArrowLeft className='w-4 h-4' />
              </button>
            ) : (
              <button
                type='submit'
                disabled={saving}
                className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
              >
                {saving ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                ) : (
                  <Save className='w-4 h-4' />
                )}
                {isEditing ? 'حفظ التغييرات' : 'إنشاء المستخدم'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
