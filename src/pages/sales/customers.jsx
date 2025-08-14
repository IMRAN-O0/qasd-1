import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  Download,
  Upload,
  Users,
  Phone,
  MapPin,
  Eye,
  Copy,
  Star,
  AlertCircle
} from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Empty, Loading } from '../../components/common';
import { formatters, storage, exporters, validators } from '../../utils';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import UniversalForm from '../../components/ui/UniversalForm';
import UniversalInput from '../../components/ui/UniversalInput';
import { CUSTOMER_TYPES, PAYMENT_METHODS, SAUDI_REGIONS, STORAGE_KEYS, STATUS_OPTIONS } from '../../constants';

const CustomerDatabaseSystem = () => {
  // استخدام المتجر الموحد
  const {
    customers,
    loading: storeLoading,
    error,
    loadData,
    addCustomer,
    updateCustomer,
    removeCustomer,
    searchData,
    showNotification
  } = useUnifiedDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // تصفية العملاء
  const filteredCustomers = (() => {
    if (!searchTerm && !selectedType && !selectedCategory && !selectedRegion) {
      return customers;
    }

    let filtered = customers;

    // تصفية حسب البحث
    if (searchTerm) {
      const searchFields = ['name', 'customerCode', 'contactPerson', 'phone', 'email'];
      filtered = searchData(filtered, searchTerm, searchFields);
    }

    // تصفية حسب النوع
    if (selectedType) {
      filtered = filtered.filter(customer => customer.customerType === selectedType);
    }

    // تصفية حسب الفئة
    if (selectedCategory) {
      filtered = filtered.filter(customer => customer.category === selectedCategory);
    }

    // تصفية حسب المنطقة
    if (selectedRegion) {
      filtered = filtered.filter(customer => customer.region === selectedRegion);
    }

    return filtered;
  })();

  // تعريف البيانات المطلوبة
  const categories = ['VIP', 'عادي', 'جديد', 'غير نشط'];
  const salesReps = ['محمد العلي', 'سارة محمد', 'عبدالله الشمري', 'ناصر القحطاني', 'أمل الزهراني', 'فهد الدوسري'];

  // تعريف حقول النموذج
  const formFields = [
    {
      name: 'name',
      type: 'text',
      label: 'اسم العميل',
      placeholder: 'أدخل اسم العميل أو الشركة',
      required: true,
      validation: value => {
        if (!value) {
          return 'اسم العميل مطلوب';
        }
        if (value.length < 3) {
          return 'اسم العميل يجب أن يكون 3 أحرف على الأقل';
        }
        return null;
      }
    },
    {
      name: 'contactPerson',
      type: 'text',
      label: 'الشخص المسؤول',
      placeholder: 'أدخل اسم الشخص المسؤول',
      required: false
    },
    {
      name: 'customerType',
      type: 'select',
      label: 'نوع العميل',
      placeholder: 'اختر نوع العميل',
      required: true,
      options: CUSTOMER_TYPES.map(type => ({ value: type.value, label: type.label })),
      validation: value => (!value ? 'نوع العميل مطلوب' : null)
    },
    {
      name: 'category',
      type: 'select',
      label: 'فئة العميل',
      placeholder: 'اختر فئة العميل',
      required: true,
      options: categories.map(cat => ({ value: cat, label: cat })),
      validation: value => (!value ? 'فئة العميل مطلوبة' : null)
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'رقم الهاتف',
      placeholder: '+966501234567',
      required: true,
      validation: value => {
        if (!value) {
          return 'رقم الهاتف مطلوب';
        }
        const phoneRegex = /^(\+966|0)?[5][0-9]{8}$/;
        if (!phoneRegex.test(value)) {
          return 'رقم الهاتف غير صحيح';
        }
        return null;
      }
    },
    {
      name: 'email',
      type: 'email',
      label: 'البريد الإلكتروني',
      placeholder: 'example@domain.com',
      required: false,
      validation: value => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'البريد الإلكتروني غير صحيح';
        }
        return null;
      }
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'العنوان',
      placeholder: 'أدخل العنوان الكامل',
      required: false,
      rows: 2
    },
    {
      name: 'city',
      type: 'text',
      label: 'المدينة',
      placeholder: 'أدخل المدينة',
      required: false
    },
    {
      name: 'region',
      type: 'text',
      label: 'المنطقة',
      placeholder: 'أدخل المنطقة',
      required: false
    },
    {
      name: 'postalCode',
      type: 'text',
      label: 'الرمز البريدي',
      placeholder: '12345',
      required: false
    },
    {
      name: 'taxNumber',
      type: 'text',
      label: 'الرقم الضريبي',
      placeholder: '300123456700003',
      required: false,
      validation: value => {
        if (value && !/^3[0-9]{14}$/.test(value)) {
          return 'الرقم الضريبي غير صحيح (يجب أن يبدأ بـ 3 ويحتوي على 15 رقم)';
        }
        return null;
      }
    },
    {
      name: 'creditLimit',
      type: 'number',
      label: 'حد الائتمان',
      placeholder: '0',
      required: false,
      min: 0,
      validation: value => {
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          return 'حد الائتمان يجب أن يكون رقماً موجباً';
        }
        return null;
      }
    },
    {
      name: 'paymentTerms',
      type: 'select',
      label: 'شروط الدفع',
      placeholder: 'اختر شروط الدفع',
      required: true,
      options: PAYMENT_METHODS.map(term => ({ value: term.value, label: term.label })),
      validation: value => (!value ? 'شروط الدفع مطلوبة' : null)
    },
    {
      name: 'discount',
      type: 'number',
      label: 'نسبة الخصم (%)',
      placeholder: '0',
      required: false,
      min: 0,
      max: 100,
      validation: value => {
        if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
          return 'نسبة الخصم يجب أن تكون بين 0 و 100';
        }
        return null;
      }
    },
    {
      name: 'salesRep',
      type: 'text',
      label: 'مندوب المبيعات',
      placeholder: 'أدخل اسم مندوب المبيعات',
      required: false
    },
    {
      name: 'status',
      type: 'select',
      label: 'الحالة',
      placeholder: 'اختر حالة العميل',
      required: true,
      options: STATUS_OPTIONS.map(status => ({ value: status.value, label: status.label })),
      validation: value => (!value ? 'حالة العميل مطلوبة' : null)
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'ملاحظات',
      placeholder: 'أدخل أي ملاحظات إضافية',
      required: false,
      rows: 3
    }
  ];

  // البيانات الأولية للنموذج
  const getInitialFormData = () => ({
    customerCode: '',
    name: '',
    contactPerson: '',
    customerType: 'individual',
    category: 'عادي',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    taxNumber: '',
    creditLimit: '',
    paymentTerms: 'cash',
    discount: '',
    salesRep: '',
    status: 'active',
    notes: ''
  });

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadData('customers', async () => mockCustomers); // Replace with actual API call
  }, [loadData]);

  const generateCustomerCode = () => {
    const number = String(customers.length + 1).padStart(3, '0');
    return `CUST-${number}`;
  };

  const handleAddCustomer = async formData => {
    setLoading(true);
    try {
      const customer = {
        ...formData,
        id: Date.now(),
        customerCode: formData.customerCode || generateCustomerCode(),
        creditLimit: parseFloat(formData.creditLimit) || 0,
        discount: parseFloat(formData.discount) || 0,
        registrationDate: new Date().toISOString().split('T')[0],
        lastOrderDate: '',
        totalOrders: 0,
        totalValue: 0
      };

      await addCustomer(customer);
      setShowAddModal(false);
      showNotification('تم إضافة العميل بنجاح!', 'success');
    } catch (error) {
      showNotification('حدث خطأ في الحفظ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async formData => {
    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        discount: parseFloat(formData.discount) || 0
      };

      await updateCustomer(editingCustomer.id, updatedData);
      setShowEditModal(false);
      setEditingCustomer(null);
      showNotification('تم تحديث العميل بنجاح!', 'success');
    } catch (error) {
      showNotification('حدث خطأ في التحديث', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await removeCustomer(id);
        showNotification('تم حذف العميل بنجاح', 'success');
      } catch (error) {
        showNotification('حدث خطأ أثناء حذف العميل', 'error');
      }
    }
  };

  const handleEdit = customer => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleExport = () => {
    exporters.downloadJSON(customers, 'customers_database');
  };

  const handleImport = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedCustomers = JSON.parse(e.target.result);
          setCustomers(importedCustomers);
          alert('تم استيراد البيانات بنجاح!');
        } catch (error) {
          alert('خطأ في قراءة الملف');
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusBadge = status => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge
        variant={
          statusConfig?.color === 'green'
            ? 'success'
            : statusConfig?.color === 'red'
              ? 'danger'
              : statusConfig?.color === 'yellow'
                ? 'warning'
                : 'default'
        }
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getCategoryIcon = category => {
    switch (category) {
      case 'VIP':
        return <Star className='w-4 h-4 text-yellow-500' />;
      case 'جديد':
        return <Plus className='w-4 h-4 text-blue-500' />;
      case 'غير نشط':
        return <AlertCircle className='w-4 h-4 text-gray-500' />;
      default:
        return <Users className='w-4 h-4 text-gray-500' />;
    }
  };

  const calculateStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const vipCustomers = customers.filter(c => c.category === 'VIP').length;
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
    const totalSalesValue = customers.reduce((sum, c) => sum + c.totalValue, 0);

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      totalCreditLimit,
      totalSalesValue
    };
  };

  const stats = calculateStats();

  // مكون النموذج
  const CustomerForm = ({ onSubmit, submitText = 'حفظ', isLoading = false, initialData = null }) => (
    <UniversalForm
      fields={formFields}
      initialData={initialData || getInitialFormData()}
      onSubmit={onSubmit}
      submitLabel={submitText}
      loading={isLoading}
      onCancel={() => {
        setShowAddModal(false);
        setShowEditModal(false);
      }}
    />
  );

  if (loading && customers.length === 0) {
    return <Loading text='جاري تحميل العملاء...' />;
  }

  return (
    <div className='max-w-7xl mx-auto p-6 bg-gray-50' dir='rtl'>
      {/* Header */}
      <Card className='mb-6'>
        <div className='flex items-center gap-3 mb-4'>
          <Users className='w-8 h-8 text-blue-600' />
          <div>
            <h1 className='text-3xl font-bold text-blue-800'>قاعدة بيانات العملاء الذكية</h1>
            <p className='text-gray-600'>إدارة شاملة ومتقدمة لجميع العملاء والزبائن</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <Card padding={false} className='p-4 text-center bg-blue-50'>
            <Users className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{stats.totalCustomers}</div>
            <div className='text-sm text-gray-600'>إجمالي العملاء</div>
          </Card>
          <Card padding={false} className='p-4 text-center bg-green-50'>
            <div className='text-2xl font-bold text-green-600'>{stats.activeCustomers}</div>
            <div className='text-sm text-gray-600'>عملاء نشطين</div>
          </Card>
          <Card padding={false} className='p-4 text-center bg-yellow-50'>
            <Star className='text-yellow-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-yellow-600'>{stats.vipCustomers}</div>
            <div className='text-sm text-gray-600'>عملاء VIP</div>
          </Card>
          <Card padding={false} className='p-4 text-center bg-purple-50'>
            <div className='text-lg font-bold text-purple-600'>
              {formatters.currency(stats.totalCreditLimit, '', false)}
            </div>
            <div className='text-sm text-gray-600'>حد ائتماني</div>
          </Card>
          <Card padding={false} className='p-4 text-center bg-gray-50'>
            <div className='text-lg font-bold text-gray-600'>
              {formatters.currency(stats.totalSalesValue, '', false)}
            </div>
            <div className='text-sm text-gray-600'>إجمالي المبيعات</div>
          </Card>
        </div>
      </Card>

      {/* Controls */}
      <Card className='mb-6'>
        <div className='flex flex-wrap items-center gap-4 mb-4'>
          <div className='flex-1 min-w-64'>
            <UniversalInput
              searchable
              dataType='customers'
              searchFields={['name', 'phone', 'city']}
              placeholder='بحث بالاسم، الرقم، أو المدينة...'
              onSearchResultSelect={customer => {
                // Handle selected customer
              }}
              className='w-full md:w-72'
            />
          </div>

          <Select
            placeholder='جميع الأنواع'
            options={CUSTOMER_TYPES.map(type => ({ value: type.value, label: type.label }))}
            value={selectedType}
            onChange={setSelectedType}
            className='min-w-32'
          />

          <Select
            placeholder='جميع التصنيفات'
            options={categories.map(cat => ({ value: cat, label: cat }))}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className='min-w-32'
          />

          <Select
            placeholder='جميع المناطق'
            options={SAUDI_REGIONS.map(region => ({ value: region, label: region }))}
            value={selectedRegion}
            onChange={setSelectedRegion}
            className='min-w-32'
          />
        </div>

        <div className='flex flex-wrap gap-3'>
          <Button
            variant='success'
            icon={Plus}
            onClick={() => {
              setShowAddModal(true);
            }}
          >
            إضافة عميل جديد
          </Button>

          <Button variant='primary' icon={Download} onClick={handleExport}>
            تصدير البيانات
          </Button>

          <label>
            <Button variant='secondary' icon={Upload} className='cursor-pointer'>
              استيراد البيانات
            </Button>
            <input type='file' accept='.json' onChange={handleImport} className='hidden' />
          </label>
        </div>

        <div className='mt-4 text-sm text-gray-600'>
          عرض {filteredCustomers.length} من {customers.length} عميل
        </div>
      </Card>

      {/* Customers Table */}
      <Card padding={false}>
        {customers.length === 0 ? (
          <Empty
            title='لا توجد عملاء'
            description='لم يتم العثور على عملاء مطابقين للبحث'
            action={
              <Button variant='primary' onClick={() => setShowAddModal(true)}>
                إضافة عميل جديد
              </Button>
            }
          />
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>الكود</Table.Header>
                <Table.Header>اسم العميل</Table.Header>
                <Table.Header>النوع</Table.Header>
                <Table.Header>التصنيف</Table.Header>
                <Table.Header>التواصل</Table.Header>
                <Table.Header>المنطقة</Table.Header>
                <Table.Header>الائتمان</Table.Header>
                <Table.Header>الحالة</Table.Header>
                <Table.Header>الإجراءات</Table.Header>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {customers.map(customer => (
                <Table.Row key={customer.id}>
                  <Table.Cell>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-blue-600'>{customer.customerCode}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(customer.customerCode);
                          alert('تم نسخ الكود');
                        }}
                        className='text-gray-400 hover:text-gray-600'
                        title='نسخ الكود'
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{customer.name}</div>
                      <div className='text-xs text-gray-500'>{customer.contactPerson}</div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    {CUSTOMER_TYPES.find(t => t.value === customer.customerType)?.label || customer.customerType}
                  </Table.Cell>

                  <Table.Cell>
                    <div className='flex items-center gap-1'>
                      {getCategoryIcon(customer.category)}
                      <span className='text-sm text-gray-900'>{customer.category}</span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className='text-sm text-gray-900 flex items-center gap-1'>
                      <Phone size={12} />
                      {formatters.phone(customer.phone)}
                    </div>
                    <div className='text-xs text-gray-500'>{customer.email}</div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className='text-sm text-gray-900 flex items-center gap-1'>
                      <MapPin size={12} />
                      {customer.city}
                    </div>
                    <div className='text-xs text-gray-500'>{customer.region}</div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className='text-sm text-gray-900'>{formatters.currency(customer.creditLimit)}</div>
                    <div className='text-xs text-gray-500'>
                      {PAYMENT_METHODS.find(p => p.value === customer.paymentTerms)?.label}
                    </div>
                  </Table.Cell>

                  <Table.Cell>{getStatusBadge(customer.status)}</Table.Cell>

                  <Table.Cell>
                    <div className='flex items-center gap-2'>
                      <Button variant='ghost' size='sm' onClick={() => handleEdit(customer)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => handleDelete(customer.id)}>
                        <Trash2 size={16} className='text-red-500' />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title='إضافة عميل جديد' size='lg'>
        <CustomerForm onSubmit={handleAddCustomer} submitText='إضافة العميل' isLoading={loading} />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title='تعديل بيانات العميل' size='lg'>
        <CustomerForm
          onSubmit={handleEditCustomer}
          submitText='تحديث العميل'
          isLoading={loading}
          initialData={editingCustomer}
        />
      </Modal>
    </div>
  );
};

export default CustomerDatabaseSystem;
