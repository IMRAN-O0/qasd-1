import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  UserCheck,
  UserX,
  Key,
  Activity,
  Calendar,
  Mail,
  Phone,
  Building,
  Shield
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data - replace with API calls
  const mockUsers = [
    {
      id: 1,
      name: 'أحمد محمد علي',
      email: 'ahmed.ali@company.com',
      phone: '+966501234567',
      role: 'admin',
      department: 'الإدارة العامة',
      status: 'active',
      lastLogin: new Date('2024-01-15T10:30:00'),
      createdAt: new Date('2023-06-01'),
      avatar: null,
      employeeId: 'EMP001'
    },
    {
      id: 2,
      name: 'فاطمة سعد الدين',
      email: 'fatima.saad@company.com',
      phone: '+966502345678',
      role: 'manager',
      department: 'الإنتاج',
      status: 'active',
      lastLogin: new Date('2024-01-15T09:15:00'),
      createdAt: new Date('2023-07-15'),
      avatar: null,
      employeeId: 'EMP002'
    },
    {
      id: 3,
      name: 'محمد عبدالله الأحمد',
      email: 'mohammed.ahmed@company.com',
      phone: '+966503456789',
      role: 'employee',
      department: 'المخزون',
      status: 'active',
      lastLogin: new Date('2024-01-14T16:45:00'),
      createdAt: new Date('2023-08-20'),
      avatar: null,
      employeeId: 'EMP003'
    },
    {
      id: 4,
      name: 'سارة خالد المطيري',
      email: 'sara.almutairi@company.com',
      phone: '+966504567890',
      role: 'employee',
      department: 'الجودة',
      status: 'inactive',
      lastLogin: new Date('2024-01-10T14:20:00'),
      createdAt: new Date('2023-09-10'),
      avatar: null,
      employeeId: 'EMP004'
    },
    {
      id: 5,
      name: 'عبدالرحمن يوسف النجار',
      email: 'abdulrahman.najjar@company.com',
      phone: '+966505678901',
      role: 'viewer',
      department: 'المبيعات',
      status: 'active',
      lastLogin: new Date('2024-01-15T11:00:00'),
      createdAt: new Date('2023-10-05'),
      avatar: null,
      employeeId: 'EMP005'
    }
  ];

  const roles = [
    { value: 'admin', label: 'مدير النظام', color: 'bg-red-100 text-red-800' },
    { value: 'manager', label: 'مدير عام', color: 'bg-blue-100 text-blue-800' },
    { value: 'employee', label: 'موظف', color: 'bg-green-100 text-green-800' },
    { value: 'viewer', label: 'مراقب', color: 'bg-gray-100 text-gray-800' }
  ];

  const departments = ['الإدارة العامة', 'الإنتاج', 'المخزون', 'الجودة', 'المبيعات', 'السلامة', 'الموارد البشرية'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      // const response = await get('/api/users');
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    const matchesStatus = !selectedStatus || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSelectUser = userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async action => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      switch (action) {
        case 'activate':
          // await post('/api/users/bulk-activate', { userIds: selectedUsers });
          console.log('Activating users:', selectedUsers);
          break;
        case 'deactivate':
          // await post('/api/users/bulk-deactivate', { userIds: selectedUsers });
          console.log('Deactivating users:', selectedUsers);
          break;
        case 'delete':
          if (window.confirm('هل أنت متأكد من حذف المستخدمين المحددين؟')) {
            // await del('/api/users/bulk-delete', { userIds: selectedUsers });
            console.log('Deleting users:', selectedUsers);
          }
          break;
        case 'export':
          exportSelectedUsers();
          break;
      }
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const exportSelectedUsers = () => {
    const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'الاسم,البريد الإلكتروني,الهاتف,الدور,القسم,الحالة,آخر تسجيل دخول\n' +
      selectedUserData
        .map(
          user =>
            `${user.name},${user.email},${user.phone},${getRoleLabel(user.role)},${user.department},${user.status === 'active' ? 'نشط' : 'غير نشط'},${formatDate(user.lastLogin)}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleLabel = role => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleColor = role => {
    return roles.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
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

  const getStatusColor = status => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getAvatarInitials = name => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
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
          <h1 className='text-2xl font-bold text-gray-900'>إدارة المستخدمين</h1>
          <p className='text-gray-600 mt-1'>إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div className='flex items-center space-x-3 space-x-reverse'>
          <button
            onClick={() => navigate('/settings/users/new')}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            إضافة مستخدم
          </button>
          <button className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2'>
            <Upload className='w-4 h-4' />
            استيراد
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='البحث بالاسم، البريد الإلكتروني، أو رقم الموظف...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            <Filter className='w-4 h-4' />
            فلترة
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>الدور</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>جميع الأدوار</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>القسم</label>
                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>جميع الأقسام</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>جميع الحالات</option>
                  <option value='active'>نشط</option>
                  <option value='inactive'>غير نشط</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <span className='text-blue-800'>تم تحديد {selectedUsers.length} مستخدم</span>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <button
                onClick={() => handleBulkAction('activate')}
                className='text-green-600 hover:text-green-700 px-3 py-1 rounded'
              >
                تفعيل
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className='text-yellow-600 hover:text-yellow-700 px-3 py-1 rounded'
              >
                إلغاء تفعيل
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className='text-blue-600 hover:text-blue-700 px-3 py-1 rounded'
              >
                تصدير
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className='text-red-600 hover:text-red-700 px-3 py-1 rounded'
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  <input
                    type='checkbox'
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleSelectAll}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  المستخدم
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  الدور
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  القسم
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  الحالة
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  آخر تسجيل دخول
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedUsers.map(user => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <input
                      type='checkbox'
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        {user.avatar ? (
                          <img className='h-10 w-10 rounded-full' src={user.avatar} alt='' />
                        ) : (
                          <div className='h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium'>
                            {getAvatarInitials(user.name)}
                          </div>
                        )}
                      </div>
                      <div className='mr-4'>
                        <div className='text-sm font-medium text-gray-900'>{user.name}</div>
                        <div className='text-sm text-gray-500'>{user.email}</div>
                        <div className='text-xs text-gray-400'>{user.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{user.department}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                    >
                      {user.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{formatDate(user.lastLogin)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex items-center space-x-2 space-x-reverse'>
                      <button
                        onClick={() => navigate(`/settings/users/${user.id}`)}
                        className='text-blue-600 hover:text-blue-900'
                        title='عرض التفاصيل'
                      >
                        <Eye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => navigate(`/settings/users/${user.id}/edit`)}
                        className='text-green-600 hover:text-green-900'
                        title='تعديل'
                      >
                        <Edit className='w-4 h-4' />
                      </button>
                      <button className='text-yellow-600 hover:text-yellow-900' title='إعادة تعيين كلمة المرور'>
                        <Key className='w-4 h-4' />
                      </button>
                      <button className='text-red-600 hover:text-red-900' title='حذف'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
            <div className='flex-1 flex justify-between sm:hidden'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
              >
                التالي
              </button>
            </div>
            <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  عرض <span className='font-medium'>{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                  <span className='font-medium'>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> من{' '}
                  <span className='font-medium'>{filteredUsers.length}</span> نتيجة
                </p>
              </div>
              <div>
                <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px' aria-label='Pagination'>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    السابق
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                  >
                    التالي
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Users className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>إجمالي المستخدمين</dt>
                <dd className='text-lg font-medium text-gray-900'>{users.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <UserCheck className='h-8 w-8 text-green-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>المستخدمون النشطون</dt>
                <dd className='text-lg font-medium text-gray-900'>{users.filter(u => u.status === 'active').length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <UserX className='h-8 w-8 text-red-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>المستخدمون غير النشطون</dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {users.filter(u => u.status === 'inactive').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Shield className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mr-5 w-0 flex-1'>
              <dl>
                <dt className='text-sm font-medium text-gray-500 truncate'>المديرون</dt>
                <dd className='text-lg font-medium text-gray-900'>
                  {users.filter(u => u.role === 'admin' || u.role === 'manager').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
