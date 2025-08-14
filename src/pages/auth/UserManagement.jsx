import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Select,
  Modal,
  Card,
  Badge,
  DataTable,
  Loading,
  Empty,
  Tabs,
  Notification
} from '../../components/common';
import { useLocalStorage, useForm, useAuth, useNotifications } from '../../hooks';
import { STORAGE_KEYS, ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../../constants';
import { validators, formatters, exporters } from '../../utils';
import { permissionManager, permissionHelpers, ROLE_PERMISSIONS as rolePermissions } from '../../utils/permissions';
import { passwordUtils } from '../../utils/passwordUtils';
import {
  UserPlus,
  Trash2,
  Save,
  ShieldCheck,
  Pencil,
  Eye,
  EyeOff,
  Users,
  Shield,
  Search,
  Filter,
  Download,
  Upload,
  Key,
  Mail,
  Phone,
  Building
} from 'lucide-react';

import initialUsers from '../../data/users.json';

const UserManagement = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const { success, error, warning } = useNotifications();

  const [users, setUsers] = useLocalStorage(STORAGE_KEYS.USERS, initialUsers);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const formHook = useForm({
    id: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    roles: [],
    customPermissions: [],
    status: 'نشط',
    notes: '',
    avatar: null,
    lastLogin: null,
    createdAt: null,
    updatedAt: null
  });

  // فلترة وبحث المستخدمين
  useEffect(() => {
    let filtered = [...users];

    // البحث
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب الدور
    if (filterRole) {
      filtered = filtered.filter(user => {
        if (Array.isArray(user.roles)) {
          return user.roles.includes(filterRole);
        }
        return user.role === filterRole;
      });
    }

    // فلترة حسب الحالة
    if (filterStatus) {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  // التحقق من الصلاحيات
  const canCreateUser = hasPermission('CREATE_USER');
  const canEditUser = hasPermission('EDIT_USER');
  const canDeleteUser = hasPermission('DELETE_USER');
  const canManageRoles = hasPermission('MANAGE_ROLES');

  // إضافة أو تحديث مستخدم
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const { values: formData } = formHook;

      // التحقق من البيانات
      if (!formData.username.trim() || !formData.name.trim()) {
        error('بيانات ناقصة', 'يرجى إدخال اسم المستخدم والاسم الكامل');
        return;
      }

      // التحقق من كلمة المرور للمستخدم الجديد
      if (!editingUser && !formData.password) {
        error('كلمة المرور مطلوبة', 'يرجى إدخال كلمة مرور للمستخدم الجديد');
        return;
      }

      // التحقق من تطابق كلمة المرور
      if (formData.password && formData.password !== formData.confirmPassword) {
        error('كلمات المرور غير متطابقة', 'يرجى التأكد من تطابق كلمة المرور');
        return;
      }

      // التحقق من قوة كلمة المرور
      if (formData.password) {
        const passwordStrength = passwordUtils.evaluatePasswordStrength(formData.password);
        if (passwordStrength.score < 3) {
          warning('كلمة مرور ضعيفة', 'يرجى استخدام كلمة مرور أقوى');
          return;
        }
      }

      // التحقق من عدم تكرار اسم المستخدم
      const existingUser = users.find(u => u.username === formData.username && u.id !== formData.id);
      if (existingUser) {
        error('اسم المستخدم موجود', 'هذا اسم المستخدم مستخدم بالفعل');
        return;
      }

      // التحقق من عدم تكرار البريد الإلكتروني
      if (formData.email) {
        const existingEmail = users.find(u => u.email === formData.email && u.id !== formData.id);
        if (existingEmail) {
          error('البريد الإلكتروني موجود', 'هذا البريد الإلكتروني مستخدم بالفعل');
          return;
        }
      }

      const userData = {
        ...formData,
        id: editingUser ? formData.id : Date.now().toString(),
        createdAt: editingUser ? formData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: editingUser ? formData.lastLogin : null
      };

      // إزالة كلمة المرور من البيانات المحفوظة (في التطبيق الحقيقي يجب تشفيرها)
      if (formData.password) {
        userData.hashedPassword = passwordUtils.hashPassword(formData.password);
      }
      delete userData.password;
      delete userData.confirmPassword;

      if (editingUser) {
        // تحديث مستخدم موجود
        setUsers(prev => prev.map(u => (u.id === userData.id ? userData : u)));
        success('تم التحديث بنجاح', `تم تحديث بيانات ${userData.name}`);
      } else {
        // إضافة مستخدم جديد
        setUsers(prev => [...prev, userData]);
        success('تم الإضافة بنجاح', `تم إضافة المستخدم ${userData.name}`);
      }

      // إعادة تعيين النموذج
      resetForm();
      setShowModal(false);
    } catch (err) {
      error('خطأ في العملية', err.message);
    } finally {
      setLoading(false);
    }
  };

  // حذف مستخدم
  const handleDeleteUser = user => {
    if (!canDeleteUser) {
      error('غير مسموح', 'ليس لديك صلاحية حذف المستخدمين');
      return;
    }

    if (!user || !user.id) {
      error('خطأ في البيانات', 'بيانات المستخدم غير صحيحة');
      return;
    }

    if (user.id === currentUser?.id) {
      error('لا يمكن حذف نفسك', 'لا يمكنك حذف حسابك الخاص');
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      success('تم الحذف بنجاح', `تم حذف المستخدم ${user.name}`);
    }
  };

  // تحديد/إلغاء تحديد مستخدم
  const handleSelectUser = userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  };

  // تحديد/إلغاء تحديد جميع المستخدمين
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.filter(u => u && u.id).map(u => u.id));
    }
  };

  // حذف مستخدمين متعددين
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف ${selectedUsers.length} مستخدم؟`)) {
      setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      success('تم الحذف بنجاح', `تم حذف ${selectedUsers.length} مستخدم`);
    }
  };

  // تصدير البيانات
  const handleExport = () => {
    const exportData = users.map(user => ({
      اسم_المستخدم: user.username,
      الاسم: user.name,
      البريد_الإلكتروني: user.email,
      الهاتف: user.phone,
      القسم: user.department,
      الأدوار: Array.isArray(user.roles) ? user.roles.join(', ') : user.role || 'غير محدد',
      الحالة: user.status,
      تاريخ_الإنشاء: formatters.date(user.createdAt),
      آخر_تسجيل_دخول: user.lastLogin ? formatters.date(user.lastLogin) : 'لم يسجل بعد'
    }));

    exporters.exportToExcel(exportData, 'users_list');
    success('تم التصدير بنجاح', 'تم تصدير قائمة المستخدمين');
  };

  // فتح نموذج إضافة مستخدم جديد
  const openAddModal = () => {
    if (!canCreateUser) {
      error('غير مسموح', 'ليس لديك صلاحية إضافة مستخدمين');
      return;
    }
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  // فتح نموذج تحديث مستخدم
  const openEditModal = user => {
    if (!canEditUser) {
      error('غير مسموح', 'ليس لديك صلاحية تعديل المستخدمين');
      return;
    }

    formHook.setFieldValues({
      ...user,
      password: '',
      confirmPassword: ''
    });
    setEditingUser(user);
    setShowModal(true);
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    formHook.reset();
    setShowPassword(false);
  };

  // الحصول على صلاحيات المستخدم
  const getUserPermissions = user => {
    return permissionManager.getUserPermissions(user);
  };

  // إحصائيات المستخدمين
  const userStats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'نشط').length;
    const inactive = total - active;
    const byRole = users.reduce((acc, user) => {
      if (Array.isArray(user.roles)) {
        user.roles.forEach(role => {
          acc[role] = (acc[role] || 0) + 1;
        });
      } else if (user.role) {
        acc[user.role] = (acc[user.role] || 0) + 1;
      }
      return acc;
    }, {});

    return { total, active, inactive, byRole };
  }, [users]);

  // أعمدة الجدول
  const columns = [
    {
      key: 'select',
      title: (
        <input
          type='checkbox'
          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
          onChange={handleSelectAll}
          className='rounded border-gray-300'
        />
      ),
      width: '50px',
      render: user => (
        <input
          type='checkbox'
          checked={user && user.id ? selectedUsers.includes(user.id) : false}
          onChange={() => user && user.id && handleSelectUser(user.id)}
          className='rounded border-gray-300'
        />
      )
    },
    {
      key: 'name',
      title: 'المستخدم',
      width: '200px',
      render: user => (
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
            <span className='text-blue-600 font-medium text-sm'>{user && user.name ? user.name.charAt(0) : '?'}</span>
          </div>
          <div>
            <div className='font-medium text-gray-900'>{user?.name || 'غير محدد'}</div>
            <div className='text-sm text-gray-500'>@{user?.username || 'غير محدد'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'معلومات الاتصال',
      width: '200px',
      render: user => (
        <div>
          {user?.email && (
            <div className='flex items-center gap-1 text-sm text-gray-600 mb-1'>
              <Mail size={12} />
              {user.email}
            </div>
          )}
          {user?.phone && (
            <div className='flex items-center gap-1 text-sm text-gray-600'>
              <Phone size={12} />
              {user.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'department',
      title: 'القسم',
      width: '120px',
      render: user => (
        <div className='flex items-center gap-1'>
          <Building size={14} className='text-gray-400' />
          <span className='text-sm'>{user?.department || 'غير محدد'}</span>
        </div>
      )
    },
    {
      key: 'roles',
      title: 'الأدوار',
      width: '150px',
      render: user => (
        <div className='flex flex-wrap gap-1'>
          {Array.isArray(user.roles) ? (
            user.roles.map(role => (
              <Badge key={role} color='primary' size='sm'>
                {permissionHelpers.getRoleDisplayName(role)}
              </Badge>
            ))
          ) : (
            <Badge color='primary' size='sm'>
              {permissionHelpers.getRoleDisplayName(user.role || 'غير محدد')}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      width: '100px',
      render: user => (
        <Badge color={user?.status === 'نشط' ? 'success' : 'secondary'}>{user?.status || 'غير محدد'}</Badge>
      )
    },
    {
      key: 'lastLogin',
      title: 'آخر تسجيل دخول',
      width: '150px',
      render: user => (
        <div className='text-sm text-gray-600'>{user?.lastLogin ? formatters.date(user.lastLogin) : 'لم يسجل بعد'}</div>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      width: '120px',
      render: user => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            color='primary'
            onClick={() => openEditModal(user)}
            disabled={!canEditUser || !user || !user.id}
            icon={Pencil}
          />
          <Button
            variant='ghost'
            size='sm'
            color='danger'
            onClick={() => handleDeleteUser(user)}
            disabled={!canDeleteUser || !user || !user.id || user.id === currentUser?.id}
            icon={Trash2}
          />
        </div>
      )
    }
  ];

  // علامات التبويب
  const tabs = [
    {
      label: 'قائمة المستخدمين',
      icon: <Users size={16} />,
      content: (
        <div className='space-y-4'>
          {/* أدوات البحث والفلترة */}
          <div className='flex gap-4 items-center'>
            <div className='flex-1'>
              <Input
                placeholder='ابحث عن مستخدم...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={filterRole}
              onChange={setFilterRole}
              options={[{ label: 'جميع الأدوار', value: '' }, ...permissionHelpers.getRoleOptions()]}
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'جميع الحالات', value: '' },
                { label: 'نشط', value: 'نشط' },
                { label: 'غير نشط', value: 'غير نشط' }
              ]}
            />
          </div>

          {/* إحصائيات سريعة */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>{userStats.total}</div>
              <div className='text-sm text-gray-600'>إجمالي المستخدمين</div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>{userStats.active}</div>
              <div className='text-sm text-gray-600'>مستخدمين نشطين</div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-gray-600'>{userStats.inactive}</div>
              <div className='text-sm text-gray-600'>مستخدمين غير نشطين</div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-2xl font-bold text-purple-600'>{selectedUsers.length}</div>
              <div className='text-sm text-gray-600'>محدد</div>
            </Card>
          </div>

          {/* جدول المستخدمين */}
          {loading ? (
            <Loading message='جاري تحميل المستخدمين...' />
          ) : filteredUsers.length === 0 ? (
            <Empty message='لا توجد مستخدمين' />
          ) : (
            <DataTable
              columns={columns}
              data={filteredUsers}
              className='min-w-max'
              pagination={true}
              searchable={false}
              filterable={false}
              sortable={true}
            />
          )}
        </div>
      )
    },
    {
      label: 'الأدوار والصلاحيات',
      icon: <Shield size={16} />,
      content: (
        <div className='space-y-6'>
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>الأدوار المتاحة</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Object.entries(permissionHelpers.groupPermissionsByCategory()).map(([category, permissions]) => (
                <Card key={category} className='p-4'>
                  <h4 className='font-medium text-gray-800 mb-2'>{category}</h4>
                  <div className='space-y-1'>
                    {permissions.slice(0, 3).map(permission => (
                      <div key={permission} className='text-sm text-gray-600'>
                        • {permissionHelpers.getPermissionDescription(permission)}
                      </div>
                    ))}
                    {permissions.length > 3 && (
                      <div className='text-xs text-gray-500'>+{permissions.length - 3} صلاحية أخرى</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )
    }
  ];

  // التحقق من صلاحية الوصول - المدير العام فقط
  const isGeneralManager =
    currentUser && (currentUser.roles?.includes('super_admin') || currentUser.username === 'admin');

  if (!isGeneralManager) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='p-8 text-center'>
          <Shield className='w-16 h-16 mx-auto mb-4 text-red-500' />
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>غير مصرح</h2>
          <p className='text-gray-600 mb-4'>هذه الصفحة مخصصة للمدير العام فقط</p>
          <p className='text-sm text-gray-500'>ليس لديك صلاحية للوصول إلى إدارة المستخدمين</p>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <ShieldCheck className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>إدارة المستخدمين</h1>
            </div>
            <div className='flex gap-2'>
              {selectedUsers.length > 0 && (
                <Button
                  color='danger'
                  variant='outline'
                  onClick={handleBulkDelete}
                  disabled={!canDeleteUser}
                  icon={Trash2}
                >
                  حذف المحدد ({selectedUsers.length})
                </Button>
              )}
              <Button color='success' variant='outline' onClick={handleExport} icon={Download}>
                تصدير
              </Button>
              <Button color='primary' onClick={openAddModal} disabled={!canCreateUser} icon={UserPlus}>
                إضافة مستخدم
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <Card className='p-6'>
          <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />
        </Card>

        {/* نموذج إضافة/تعديل مستخدم */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
          size='lg'
        >
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Input
                label='اسم المستخدم'
                value={formHook.values.username}
                onChange={e => formHook.setValue('username', e.target.value)}
                placeholder='اسم المستخدم'
                required
                disabled={!!editingUser}
              />
              <Input
                label='الاسم الكامل'
                value={formHook.values.name}
                onChange={e => formHook.setValue('name', e.target.value)}
                placeholder='الاسم الكامل'
                required
              />
              <Input
                label='البريد الإلكتروني'
                type='email'
                value={formHook.values.email}
                onChange={e => formHook.setValue('email', e.target.value)}
                placeholder='email@company.com'
                icon={Mail}
              />
              <Input
                label='رقم الهاتف'
                value={formHook.values.phone}
                onChange={e => formHook.setValue('phone', e.target.value)}
                placeholder='05xxxxxxxx'
                icon={Phone}
              />
              <Input
                label='القسم'
                value={formHook.values.department}
                onChange={e => formHook.setValue('department', e.target.value)}
                placeholder='اسم القسم'
                icon={Building}
              />
              <Select
                label='الحالة'
                value={formHook.values.status}
                onChange={value => formHook.setValue('status', value)}
                options={[
                  { label: 'نشط', value: 'نشط' },
                  { label: 'غير نشط', value: 'غير نشط' },
                  { label: 'محظور', value: 'محظور' }
                ]}
              />
            </div>

            {/* كلمة المرور */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='relative'>
                <Input
                  label={editingUser ? 'كلمة مرور جديدة (اختيارية)' : 'كلمة المرور'}
                  type={showPassword ? 'text' : 'password'}
                  value={formHook.values.password}
                  onChange={e => formHook.setValue('password', e.target.value)}
                  placeholder='كلمة المرور'
                  required={!editingUser}
                  icon={Key}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute left-10 top-9 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                label='تأكيد كلمة المرور'
                type={showPassword ? 'text' : 'password'}
                value={formHook.values.confirmPassword}
                onChange={e => formHook.setValue('confirmPassword', e.target.value)}
                placeholder='تأكيد كلمة المرور'
                required={!!formHook.values.password}
              />
            </div>

            {/* الأدوار */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>الأدوار</label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                {permissionHelpers.getRoleOptions().map(option => (
                  <label
                    key={option.value}
                    className='flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50'
                  >
                    <input
                      type='checkbox'
                      checked={formHook.values.roles.includes(option.value)}
                      onChange={e => {
                        if (e.target.checked) {
                          formHook.setValue('roles', [...formHook.values.roles, option.value]);
                        } else {
                          formHook.setValue(
                            'roles',
                            formHook.values.roles.filter(r => r !== option.value)
                          );
                        }
                      }}
                      className='rounded border-gray-300'
                      disabled={!canManageRoles}
                    />
                    <span className='text-sm'>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ملاحظات */}
            <Input
              label='ملاحظات'
              type='textarea'
              rows={3}
              value={formHook.values.notes}
              onChange={e => formHook.setValue('notes', e.target.value)}
              placeholder='ملاحظات إضافية...'
            />

            {/* أزرار الإجراءات */}
            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button type='submit' color='primary' loading={loading} icon={Save}>
                {editingUser ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;
