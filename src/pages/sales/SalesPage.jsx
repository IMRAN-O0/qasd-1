import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  DataTable,
  StatCard,
  StatGrid,
  Form,
  Modal,
  Alert,
  SearchFilter,
  Tabs
} from '../../components/common';
import { useSalesStore } from '../../services';
import { formatters } from '../../utils';
import {
  Users,
  FileText,
  Receipt,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { CUSTOMER_TYPES, CUSTOMER_STATUS, PAYMENT_METHODS, STATUS_OPTIONS } from '../../constants';

/**
 * صفحة المبيعات الرئيسية
 */
const SalesPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // customer, quotation, invoice, payment
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const {
    customers,
    quotations,
    invoices,
    payments,
    loading,
    loadCustomers,
    loadQuotations,
    loadInvoices,
    loadPayments,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addQuotation,
    updateQuotation,
    removeQuotation,
    addInvoice,
    updateInvoice,
    removeInvoice,
    addPayment
  } = useSalesStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadCustomers();
    loadQuotations();
    loadInvoices();
    loadPayments();
  }, []);

  // إضافة تنبيه
  const addAlert = alert => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { ...alert, id }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  // حساب الإحصائيات
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === 'pending').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    monthlyRevenue: invoices
      .filter(inv => {
        const invDate = new Date(inv.date);
        const now = new Date();
        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0)
  };

  // معالجات الأحداث
  const handleAdd = type => {
    setModalType(type);
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (type, item) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      return;
    }

    try {
      let success = false;
      switch (type) {
        case 'customer':
          success = removeCustomer(item.id);
          break;
        case 'quotation':
          success = removeQuotation(item.id);
          break;
        case 'invoice':
          success = removeInvoice(item.id);
          break;
      }

      if (success) {
        addAlert({
          type: 'success',
          title: 'تم الحذف بنجاح',
          message: 'تم حذف العنصر بنجاح'
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في الحذف',
        message: error.message
      });
    }
  };

  const handleSubmit = async formData => {
    try {
      let success = false;
      let message = '';

      switch (modalType) {
        case 'customer':
          if (selectedItem) {
            success = updateCustomer(selectedItem.id, formData);
            message = 'تم تحديث العميل بنجاح';
          } else {
            success = addCustomer(formData);
            message = 'تم إضافة العميل بنجاح';
          }
          break;
        case 'quotation':
          if (selectedItem) {
            success = updateQuotation(selectedItem.id, formData);
            message = 'تم تحديث عرض السعر بنجاح';
          } else {
            success = addQuotation(formData);
            message = 'تم إضافة عرض السعر بنجاح';
          }
          break;
        case 'invoice':
          if (selectedItem) {
            success = updateInvoice(selectedItem.id, formData);
            message = 'تم تحديث الفاتورة بنجاح';
          } else {
            success = addInvoice(formData);
            message = 'تم إضافة الفاتورة بنجاح';
          }
          break;
        case 'payment':
          success = addPayment(formData);
          message = 'تم تسجيل الدفعة بنجاح';
          break;
      }

      if (success) {
        setShowModal(false);
        addAlert({
          type: 'success',
          title: 'تمت العملية بنجاح',
          message
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في العملية',
        message: error.message
      });
    }
  };

  // تكوين الأعمدة للجداول
  const customerColumns = [
    {
      key: 'code',
      title: 'رقم العميل',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'اسم العميل',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'النوع',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: CUSTOMER_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'phone',
      title: 'الهاتف',
      searchable: true,
      format: 'phone'
    },
    {
      key: 'email',
      title: 'البريد الإلكتروني',
      searchable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => (value === 'active' ? 'success' : 'warning'),
      filterable: true,
      filterType: 'select',
      filterOptions: CUSTOMER_STATUS.map(status => ({ value: status.value, label: status.label }))
    },
    {
      key: 'createdAt',
      title: 'تاريخ الإضافة',
      format: 'date',
      sortable: true
    }
  ];

  const quotationColumns = [
    {
      key: 'number',
      title: 'رقم العرض',
      sortable: true,
      searchable: true
    },
    {
      key: 'customerName',
      title: 'العميل',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'التاريخ',
      format: 'date',
      sortable: true
    },
    {
      key: 'validUntil',
      title: 'صالح حتى',
      format: 'date',
      sortable: true
    },
    {
      key: 'total',
      title: 'المبلغ الإجمالي',
      format: 'currency',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'approved':
            return 'success';
          case 'rejected':
            return 'danger';
          case 'pending':
            return 'warning';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: STATUS_OPTIONS.quotation.map(status => ({ value: status.value, label: status.label }))
    }
  ];

  const invoiceColumns = [
    {
      key: 'number',
      title: 'رقم الفاتورة',
      sortable: true,
      searchable: true
    },
    {
      key: 'customerName',
      title: 'العميل',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'التاريخ',
      format: 'date',
      sortable: true
    },
    {
      key: 'dueDate',
      title: 'تاريخ الاستحقاق',
      format: 'date',
      sortable: true
    },
    {
      key: 'total',
      title: 'المبلغ الإجمالي',
      format: 'currency',
      sortable: true
    },
    {
      key: 'paid',
      title: 'المدفوع',
      format: 'currency',
      sortable: true
    },
    {
      key: 'remaining',
      title: 'المتبقي',
      format: 'currency',
      render: (value, row) => formatters.currency((row.total || 0) - (row.paid || 0))
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'paid':
            return 'success';
          case 'overdue':
            return 'danger';
          case 'pending':
            return 'warning';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: STATUS_OPTIONS.invoice.map(status => ({ value: status.value, label: status.label }))
    }
  ];

  const paymentColumns = [
    {
      key: 'number',
      title: 'رقم الدفعة',
      sortable: true,
      searchable: true
    },
    {
      key: 'invoiceNumber',
      title: 'رقم الفاتورة',
      sortable: true,
      searchable: true
    },
    {
      key: 'customerName',
      title: 'العميل',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'تاريخ الدفع',
      format: 'date',
      sortable: true
    },
    {
      key: 'amount',
      title: 'المبلغ',
      format: 'currency',
      sortable: true
    },
    {
      key: 'method',
      title: 'طريقة الدفع',
      filterable: true,
      filterType: 'select',
      filterOptions: PAYMENT_METHODS.map(method => ({ value: method.value, label: method.label }))
    },
    {
      key: 'reference',
      title: 'المرجع',
      searchable: true
    }
  ];

  // إجراءات الجداول
  const customerActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: customer => handleEdit('customer', customer)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: customer => handleEdit('customer', customer)
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: customer => handleDelete('customer', customer)
    }
  ];

  const quotationActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: quotation => handleEdit('quotation', quotation)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: quotation => handleEdit('quotation', quotation)
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: quotation => handleDelete('quotation', quotation)
    }
  ];

  const invoiceActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: invoice => handleEdit('invoice', invoice)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: invoice => handleEdit('invoice', invoice)
    },
    {
      icon: CreditCard,
      label: 'دفعة',
      variant: 'ghost',
      onClick: invoice => handleAdd('payment')
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: invoice => handleDelete('invoice', invoice)
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'customer':
        return [
          {
            name: 'code',
            label: 'رقم العميل',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم العميل'
          },
          {
            name: 'name',
            label: 'اسم العميل',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم العميل'
          },
          {
            name: 'type',
            label: 'نوع العميل',
            type: 'select',
            required: true,
            options: CUSTOMER_TYPES
          },
          {
            name: 'phone',
            label: 'رقم الهاتف',
            type: 'tel',
            placeholder: 'أدخل رقم الهاتف'
          },
          {
            name: 'email',
            label: 'البريد الإلكتروني',
            type: 'email',
            placeholder: 'أدخل البريد الإلكتروني'
          },
          {
            name: 'address',
            label: 'العنوان',
            type: 'textarea',
            placeholder: 'أدخل العنوان'
          },
          {
            name: 'status',
            label: 'الحالة',
            type: 'select',
            required: true,
            options: CUSTOMER_STATUS
          }
        ];

      case 'quotation':
        return [
          {
            name: 'number',
            label: 'رقم العرض',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم العرض'
          },
          {
            name: 'customerId',
            label: 'العميل',
            type: 'select',
            required: true,
            options: customers.map(c => ({ value: c.id, label: c.name }))
          },
          {
            name: 'date',
            label: 'التاريخ',
            type: 'date',
            required: true
          },
          {
            name: 'validUntil',
            label: 'صالح حتى',
            type: 'date',
            required: true
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل الملاحظات'
          }
        ];

      case 'invoice':
        return [
          {
            name: 'number',
            label: 'رقم الفاتورة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الفاتورة'
          },
          {
            name: 'customerId',
            label: 'العميل',
            type: 'select',
            required: true,
            options: customers.map(c => ({ value: c.id, label: c.name }))
          },
          {
            name: 'date',
            label: 'التاريخ',
            type: 'date',
            required: true
          },
          {
            name: 'dueDate',
            label: 'تاريخ الاستحقاق',
            type: 'date',
            required: true
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل الملاحظات'
          }
        ];

      case 'payment':
        return [
          {
            name: 'number',
            label: 'رقم الدفعة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الدفعة'
          },
          {
            name: 'invoiceId',
            label: 'الفاتورة',
            type: 'select',
            required: true,
            options: invoices.map(i => ({ value: i.id, label: i.number }))
          },
          {
            name: 'date',
            label: 'تاريخ الدفع',
            type: 'date',
            required: true
          },
          {
            name: 'amount',
            label: 'المبلغ',
            type: 'number',
            required: true,
            placeholder: 'أدخل المبلغ'
          },
          {
            name: 'method',
            label: 'طريقة الدفع',
            type: 'select',
            required: true,
            options: PAYMENT_METHODS
          },
          {
            name: 'reference',
            label: 'المرجع',
            type: 'text',
            placeholder: 'أدخل المرجع'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'customer':
        return `${action} عميل`;
      case 'quotation':
        return `${action} عرض سعر`;
      case 'invoice':
        return `${action} فاتورة`;
      case 'payment':
        return 'تسجيل دفعة';
      default:
        return '';
    }
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: TrendingUp
    },
    {
      id: 'customers',
      label: 'العملاء',
      icon: Users
    },
    {
      id: 'quotations',
      label: 'عروض الأسعار',
      icon: FileText
    },
    {
      id: 'invoices',
      label: 'الفواتير',
      icon: Receipt
    },
    {
      id: 'payments',
      label: 'المدفوعات',
      icon: CreditCard
    }
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* التنبيهات */}
      <div className='fixed top-4 left-4 z-50 space-y-2'>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            dismissible
            onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          />
        ))}
      </div>

      {/* العنوان */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>إدارة المبيعات</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي العملاء' value={stats.totalCustomers} icon={Users} color='blue' />
            <StatCard title='العملاء النشطون' value={stats.activeCustomers} icon={Users} color='green' />
            <StatCard title='عروض الأسعار' value={stats.totalQuotations} icon={FileText} color='yellow' />
            <StatCard title='الفواتير المدفوعة' value={stats.paidInvoices} icon={Receipt} color='green' />
            <StatCard
              title='إجمالي الإيرادات'
              value={stats.totalRevenue}
              format='currency'
              icon={DollarSign}
              color='green'
            />
            <StatCard
              title='إيرادات الشهر'
              value={stats.monthlyRevenue}
              format='currency'
              icon={Calendar}
              color='blue'
            />
          </StatGrid>

          {/* الرسوم البيانية والتقارير */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <Card.Header>
                <Card.Title>أحدث الفواتير</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={invoices.slice(0, 5)}
                  columns={invoiceColumns.slice(0, 4)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>أحدث المدفوعات</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={payments.slice(0, 5)}
                  columns={paymentColumns.slice(0, 4)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة العملاء</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('customer')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة عميل
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={customers}
              columns={customerColumns}
              loading={loading.customers}
              actions={customerActions}
              onRefresh={loadCustomers}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'quotations' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة عروض الأسعار</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('quotation')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة عرض سعر
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={quotations}
              columns={quotationColumns}
              loading={loading.quotations}
              actions={quotationActions}
              onRefresh={loadQuotations}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة الفواتير</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('invoice')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة فاتورة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={invoices}
              columns={invoiceColumns}
              loading={loading.invoices}
              actions={invoiceActions}
              onRefresh={loadInvoices}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة المدفوعات</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('payment')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                تسجيل دفعة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable data={payments} columns={paymentColumns} loading={loading.payments} onRefresh={loadPayments} />
          </Card.Content>
        </Card>
      )}

      {/* نافذة النموذج */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={getModalTitle()} size='lg'>
        <Form
          fields={getFormFields()}
          initialData={selectedItem || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitText={selectedItem ? 'تحديث' : 'إضافة'}
        />
      </Modal>
    </div>
  );
};

export default SalesPage;
