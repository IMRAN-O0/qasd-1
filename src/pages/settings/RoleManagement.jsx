import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Database,
  FileText,
  ShoppingCart,
  Package,
  Factory,
  Award,
  HardHat,
  UserCheck
} from 'lucide-react';

const RoleManagement = () => {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true
  });
  const [errors, setErrors] = useState({});

  // Mock data - replace with API calls
  const mockRoles = [
    {
      id: 1,
      name: 'مدير النظام',
      key: 'admin',
      description: 'صلاحية كاملة على جميع أجزاء النظام',
      permissions: ['all'],
      userCount: 2,
      isActive: true,
      isSystem: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'مدير عام',
      key: 'manager',
      description: 'إدارة الأقسام والعمليات الأساسية',
      permissions: [
        'sales_view',
        'sales_create',
        'sales_edit',
        'inventory_view',
        'inventory_create',
        'inventory_edit',
        'production_view',
        'production_create',
        'production_edit',
        'quality_view',
        'quality_create',
        'quality_edit',
        'safety_view',
        'safety_create',
        'safety_edit',
        'reports_view',
        'reports_create'
      ],
      userCount: 5,
      isActive: true,
      isSystem: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      name: 'مدير الإنتاج',
      key: 'production_manager',
      description: 'إدارة عمليات الإنتاج والجودة',
      permissions: [
        'production_view',
        'production_create',
        'production_edit',
        'production_delete',
        'quality_view',
        'quality_create',
        'quality_edit',
        'quality_delete',
        'inventory_view',
        'reports_view'
      ],
      userCount: 3,
      isActive: true,
      isSystem: false,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 4,
      name: 'مدير المخزون',
      key: 'inventory_manager',
      description: 'إدارة المخزون والمشتريات',
      permissions: [
        'inventory_view',
        'inventory_create',
        'inventory_edit',
        'inventory_delete',
        'production_view',
        'reports_view'
      ],
      userCount: 2,
      isActive: true,
      isSystem: false,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 5,
      name: 'مدير المبيعات',
      key: 'sales_manager',
      description: 'إدارة العملاء والمبيعات',
      permissions: ['sales_view', 'sales_create', 'sales_edit', 'sales_delete', 'inventory_view', 'reports_view'],
      userCount: 4,
      isActive: true,
      isSystem: false,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 6,
      name: 'موظف',
      key: 'employee',
      description: 'صلاحيات محدودة للعمليات اليومية',
      permissions: ['sales_view', 'sales_create', 'inventory_view', 'production_view', 'quality_view', 'safety_view'],
      userCount: 15,
      isActive: true,
      isSystem: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 7,
      name: 'مراقب',
      key: 'viewer',
      description: 'عرض البيانات فقط بدون تعديل',
      permissions: ['sales_view', 'inventory_view', 'production_view', 'quality_view', 'safety_view', 'reports_view'],
      userCount: 8,
      isActive: true,
      isSystem: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const mockPermissions = [
    // Sales Module
    { id: 'sales_view', name: 'عرض المبيعات', module: 'sales', description: 'عرض بيانات المبيعات والعملاء' },
    { id: 'sales_create', name: 'إنشاء المبيعات', module: 'sales', description: 'إنشاء طلبات وفواتير جديدة' },
    { id: 'sales_edit', name: 'تعديل المبيعات', module: 'sales', description: 'تعديل الطلبات والفواتير' },
    { id: 'sales_delete', name: 'حذف المبيعات', module: 'sales', description: 'حذف الطلبات والفواتير' },
    { id: 'sales_approve', name: 'اعتماد المبيعات', module: 'sales', description: 'اعتماد الطلبات والخصومات' },

    // Inventory Module
    { id: 'inventory_view', name: 'عرض المخزون', module: 'inventory', description: 'عرض بيانات المخزون والمواد' },
    { id: 'inventory_create', name: 'إنشاء المخزون', module: 'inventory', description: 'إضافة مواد ومنتجات جديدة' },
    { id: 'inventory_edit', name: 'تعديل المخزون', module: 'inventory', description: 'تعديل بيانات المواد والكميات' },
    { id: 'inventory_delete', name: 'حذف المخزون', module: 'inventory', description: 'حذف المواد والمنتجات' },
    { id: 'inventory_transfer', name: 'نقل المخزون', module: 'inventory', description: 'نقل المواد بين المخازن' },

    // Production Module
    { id: 'production_view', name: 'عرض الإنتاج', module: 'production', description: 'عرض خطط وعمليات الإنتاج' },
    { id: 'production_create', name: 'إنشاء الإنتاج', module: 'production', description: 'إنشاء أوامر إنتاج جديدة' },
    { id: 'production_edit', name: 'تعديل الإنتاج', module: 'production', description: 'تعديل أوامر الإنتاج' },
    { id: 'production_delete', name: 'حذف الإنتاج', module: 'production', description: 'حذف أوامر الإنتاج' },
    { id: 'production_approve', name: 'اعتماد الإنتاج', module: 'production', description: 'اعتماد خطط الإنتاج' },

    // Quality Module
    { id: 'quality_view', name: 'عرض الجودة', module: 'quality', description: 'عرض تقارير ومعايير الجودة' },
    { id: 'quality_create', name: 'إنشاء الجودة', module: 'quality', description: 'إنشاء فحوصات جودة جديدة' },
    { id: 'quality_edit', name: 'تعديل الجودة', module: 'quality', description: 'تعديل معايير الجودة' },
    { id: 'quality_delete', name: 'حذف الجودة', module: 'quality', description: 'حذف تقارير الجودة' },
    { id: 'quality_approve', name: 'اعتماد الجودة', module: 'quality', description: 'اعتماد معايير الجودة' },

    // Safety Module
    { id: 'safety_view', name: 'عرض السلامة', module: 'safety', description: 'عرض تقارير السلامة' },
    { id: 'safety_create', name: 'إنشاء السلامة', module: 'safety', description: 'إنشاء تقارير حوادث' },
    { id: 'safety_edit', name: 'تعديل السلامة', module: 'safety', description: 'تعديل إجراءات السلامة' },
    { id: 'safety_delete', name: 'حذف السلامة', module: 'safety', description: 'حذف تقارير السلامة' },
    { id: 'safety_approve', name: 'اعتماد السلامة', module: 'safety', description: 'اعتماد إجراءات السلامة' },

    // Reports Module
    { id: 'reports_view', name: 'عرض التقارير', module: 'reports', description: 'عرض جميع التقارير' },
    { id: 'reports_create', name: 'إنشاء التقارير', module: 'reports', description: 'إنشاء تقارير مخصصة' },
    { id: 'reports_export', name: 'تصدير التقارير', module: 'reports', description: 'تصدير التقارير بصيغ مختلفة' },

    // Settings Module
    { id: 'settings_view', name: 'عرض الإعدادات', module: 'settings', description: 'عرض إعدادات النظام' },
    { id: 'settings_edit', name: 'تعديل الإعدادات', module: 'settings', description: 'تعديل إعدادات النظام' },
    {
      id: 'settings_backup',
      name: 'النسخ الاحتياطي',
      module: 'settings',
      description: 'إنشاء واستعادة النسخ الاحتياطية'
    },

    // Users Module
    { id: 'users_view', name: 'عرض المستخدمين', module: 'users', description: 'عرض قائمة المستخدمين' },
    { id: 'users_create', name: 'إنشاء المستخدمين', module: 'users', description: 'إنشاء حسابات مستخدمين جديدة' },
    { id: 'users_edit', name: 'تعديل المستخدمين', module: 'users', description: 'تعديل بيانات المستخدمين' },
    { id: 'users_delete', name: 'حذف المستخدمين', module: 'users', description: 'حذف حسابات المستخدمين' },
    { id: 'users_roles', name: 'إدارة الأدوار', module: 'users', description: 'إدارة أدوار وصلاحيات المستخدمين' }
  ];

  const modules = [
    { key: 'sales', name: 'المبيعات', icon: ShoppingCart, color: 'text-green-600' },
    { key: 'inventory', name: 'المخزون', icon: Package, color: 'text-blue-600' },
    { key: 'production', name: 'الإنتاج', icon: Factory, color: 'text-purple-600' },
    { key: 'quality', name: 'الجودة', icon: Award, color: 'text-yellow-600' },
    { key: 'safety', name: 'السلامة', icon: HardHat, color: 'text-red-600' },
    { key: 'reports', name: 'التقارير', icon: FileText, color: 'text-indigo-600' },
    { key: 'settings', name: 'الإعدادات', icon: Settings, color: 'text-gray-600' },
    { key: 'users', name: 'المستخدمون', icon: Users, color: 'text-pink-600' }
  ];

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await get('/api/roles');
      setRoles(mockRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      // Replace with actual API call
      // const response = await get('/api/permissions');
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleCreateRole = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      isActive: true
    });
    setEditingRole(null);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleEditRole = role => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive
    });
    setEditingRole(role);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleDeleteRole = async roleId => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      alert('لا يمكن حذف الأدوار الأساسية للنظام');
      return;
    }

    if (role?.userCount > 0) {
      alert('لا يمكن حذف دور يحتوي على مستخدمين. يرجى نقل المستخدمين إلى دور آخر أولاً.');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      try {
        // await del(`/api/roles/${roleId}`);
        console.log('Deleting role:', roleId);
        loadRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleToggleRoleStatus = async roleId => {
    try {
      // await put(`/api/roles/${roleId}/toggle-status`);
      console.log('Toggling role status:', roleId);
      loadRoles();
    } catch (error) {
      console.error('Error toggling role status:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم الدور مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الدور مطلوب';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'يجب تحديد صلاحية واحدة على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingRole) {
        // await put(`/api/roles/${editingRole.id}`, formData);
        console.log('Updating role:', formData);
      } else {
        // await post('/api/roles', formData);
        console.log('Creating role:', formData);
      }

      setShowCreateModal(false);
      loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permissionId] : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleModulePermissionToggle = (moduleKey, checked) => {
    const modulePermissions = permissions.filter(p => p.module === moduleKey).map(p => p.id);

    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...modulePermissions])]
        : prev.permissions.filter(p => !modulePermissions.includes(p))
    }));
  };

  const getModulePermissionStatus = moduleKey => {
    const modulePermissions = permissions.filter(p => p.module === moduleKey).map(p => p.id);

    const selectedCount = modulePermissions.filter(p => formData.permissions.includes(p)).length;

    if (selectedCount === 0) {
      return 'none';
    }
    if (selectedCount === modulePermissions.length) {
      return 'all';
    }
    return 'partial';
  };

  const formatDate = date => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

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
          <h1 className='text-2xl font-bold text-gray-900'>إدارة الأدوار والصلاحيات</h1>
          <p className='text-gray-600 mt-1'>إدارة أدوار المستخدمين والصلاحيات المخصصة</p>
        </div>
        <button
          onClick={handleCreateRole}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'
        >
          <Plus className='w-4 h-4' />
          إضافة دور جديد
        </button>
      </div>

      {/* Roles Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {roles.map(role => (
          <div key={role.id} className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div
                  className={`p-2 rounded-lg ${
                    role.isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Shield className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>{role.name}</h3>
                  <div className='flex items-center gap-2 mt-1'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {role.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                    {role.isSystem && (
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800'>
                        نظام
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                  className='text-gray-400 hover:text-gray-600'
                  title='عرض التفاصيل'
                >
                  {selectedRole === role.id ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
                <button
                  onClick={() => handleEditRole(role)}
                  className='text-blue-600 hover:text-blue-700'
                  title='تعديل'
                >
                  <Edit className='w-4 h-4' />
                </button>
                <button
                  onClick={() => handleToggleRoleStatus(role.id)}
                  className={role.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  title={role.isActive ? 'إلغاء تفعيل' : 'تفعيل'}
                >
                  {role.isActive ? <Lock className='w-4 h-4' /> : <Unlock className='w-4 h-4' />}
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className='text-red-600 hover:text-red-700'
                    title='حذف'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            </div>

            <p className='text-gray-600 text-sm mb-4'>{role.description}</p>

            <div className='flex items-center justify-between text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <UserCheck className='w-4 h-4' />
                <span>{role.userCount} مستخدم</span>
              </div>
              <div className='flex items-center gap-1'>
                <Shield className='w-4 h-4' />
                <span>{role.permissions.includes('all') ? 'جميع الصلاحيات' : `${role.permissions.length} صلاحية`}</span>
              </div>
            </div>

            {/* Role Details */}
            {selectedRole === role.id && (
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <div className='space-y-3'>
                  <div>
                    <span className='text-xs font-medium text-gray-500'>تاريخ الإنشاء:</span>
                    <span className='text-xs text-gray-700 mr-2'>{formatDate(role.createdAt)}</span>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-500'>آخر تحديث:</span>
                    <span className='text-xs text-gray-700 mr-2'>{formatDate(role.updatedAt)}</span>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-500 block mb-2'>الصلاحيات:</span>
                    <div className='flex flex-wrap gap-1'>
                      {role.permissions.includes('all') ? (
                        <span className='inline-flex px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800'>
                          جميع الصلاحيات
                        </span>
                      ) : (
                        role.permissions.slice(0, 3).map(permissionId => {
                          const permission = permissions.find(p => p.id === permissionId);
                          return permission ? (
                            <span
                              key={permissionId}
                              className='inline-flex px-2 py-1 text-xs rounded bg-blue-100 text-blue-800'
                            >
                              {permission.name}
                            </span>
                          ) : null;
                        })
                      )}
                      {role.permissions.length > 3 && !role.permissions.includes('all') && (
                        <span className='inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-600'>
                          +{role.permissions.length - 3} أخرى
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <form onSubmit={handleSubmit}>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {editingRole ? 'تعديل الدور' : 'إضافة دور جديد'}
                  </h2>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <X className='w-6 h-6' />
                  </button>
                </div>
              </div>

              <div className='p-6 space-y-6'>
                {/* Basic Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>اسم الدور *</label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder='أدخل اسم الدور'
                    />
                    {errors.name && (
                      <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                        <AlertCircle className='w-4 h-4' />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>الحالة</label>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='isActive'
                        checked={formData.isActive}
                        onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3'
                      />
                      <label htmlFor='isActive' className='text-sm text-gray-700'>
                        دور نشط
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>وصف الدور *</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder='أدخل وصف الدور ومسؤولياته'
                  />
                  {errors.description && (
                    <p className='mt-1 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Permissions */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-4'>الصلاحيات *</label>
                  {errors.permissions && (
                    <p className='mb-4 text-sm text-red-600 flex items-center gap-1'>
                      <AlertCircle className='w-4 h-4' />
                      {errors.permissions}
                    </p>
                  )}

                  <div className='space-y-6'>
                    {modules.map(module => {
                      const Icon = module.icon;
                      const modulePermissions = permissions.filter(p => p.module === module.key);
                      const status = getModulePermissionStatus(module.key);

                      return (
                        <div key={module.key} className='border border-gray-200 rounded-lg p-4'>
                          <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center gap-3'>
                              <Icon className={`w-5 h-5 ${module.color}`} />
                              <h4 className='font-medium text-gray-900'>{module.name}</h4>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm text-gray-500'>
                                {modulePermissions.filter(p => formData.permissions.includes(p.id)).length} /{' '}
                                {modulePermissions.length}
                              </span>
                              <input
                                type='checkbox'
                                checked={status === 'all'}
                                ref={input => {
                                  if (input) {
                                    input.indeterminate = status === 'partial';
                                  }
                                }}
                                onChange={e => handleModulePermissionToggle(module.key, e.target.checked)}
                                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                              />
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                            {modulePermissions.map(permission => (
                              <label
                                key={permission.id}
                                className='flex items-start gap-2 p-2 rounded hover:bg-gray-50'
                              >
                                <input
                                  type='checkbox'
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={e => handlePermissionChange(permission.id, e.target.checked)}
                                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1'
                                />
                                <div>
                                  <div className='text-sm font-medium text-gray-900'>{permission.name}</div>
                                  <div className='text-xs text-gray-500'>{permission.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className='p-6 border-t border-gray-200 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => setShowCreateModal(false)}
                  className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                >
                  إلغاء
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2'
                >
                  <Save className='w-4 h-4' />
                  {editingRole ? 'حفظ التغييرات' : 'إنشاء الدور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Shield className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>إجمالي الأدوار</dt>
                <dd className='text-lg font-medium text-gray-900'>{roles.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Check className='h-8 w-8 text-green-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>الأدوار النشطة</dt>
                <dd className='text-lg font-medium text-gray-900'>{roles.filter(r => r.isActive).length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Lock className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>أدوار النظام</dt>
                <dd className='text-lg font-medium text-gray-900'>{roles.filter(r => r.isSystem).length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Database className='h-8 w-8 text-orange-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>إجمالي الصلاحيات</dt>
                <dd className='text-lg font-medium text-gray-900'>{permissions.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
