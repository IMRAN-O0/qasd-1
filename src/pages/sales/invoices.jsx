// pages/sales/invoices.jsx
import React, { useState } from 'react';
import { FileText, AlertTriangle, CreditCard, DollarSign } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import UniversalForm from '../../components/ui/UniversalForm';
import { PAYMENT_TERMS } from '../../constants';
import { formatters, exporters } from '../../utils';

const InvoicesPage = () => {
  // استخدام المتجر الموحد
  const {
    invoices,
    customers,
    products,
    loading: storeLoading,
    error,
    loadData,
    addInvoice,
    updateInvoice,
    removeInvoice,
    searchData,
    showNotification
  } = useUnifiedDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // تحميل البيانات عند بدء التشغيل
  React.useEffect(() => {
    loadData('invoices', async () => mockInvoices); // Replace with actual API call
    loadData('customers', async () => mockCustomers);
    loadData('products', async () => mockProducts);
  }, [loadData]);

  // حالات الفواتير
  const invoiceStatuses = [
    { value: 'draft', label: 'مسودة', color: 'gray' },
    { value: 'confirmed', label: 'مؤكدة', color: 'green' },
    { value: 'sent', label: 'مرسلة', color: 'blue' },
    { value: 'cancelled', label: 'ملغية', color: 'red' }
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'معلقة', color: 'yellow' },
    { value: 'partial', label: 'مدفوعة جزئياً', color: 'orange' },
    { value: 'paid', label: 'مدفوعة بالكامل', color: 'green' },
    { value: 'overdue', label: 'متأخرة', color: 'red' }
  ];

  // تعريف حقول النموذج
  const formFields = [
    {
      name: 'invoiceNumber',
      type: 'text',
      label: 'رقم الفاتورة',
      placeholder: 'سيتم إنشاؤه تلقائياً',
      required: false
    },
    {
      name: 'date',
      type: 'date',
      label: 'التاريخ',
      required: true,
      validation: value => (!value ? 'التاريخ مطلوب' : null)
    },
    {
      name: 'dueDate',
      type: 'date',
      label: 'تاريخ الاستحقاق',
      required: true,
      validation: value => (!value ? 'تاريخ الاستحقاق مطلوب' : null)
    },
    {
      name: 'customerId',
      type: 'select',
      label: 'العميل',
      placeholder: 'اختر العميل',
      required: true,
      searchable: true,
      searchDataType: 'customers',
      searchFields: ['name', 'customerCode', 'contactPerson'],
      options: customers.map(customer => ({
        value: customer.id,
        label: `${customer.name} - ${customer.customerCode || ''}`
      })),
      validation: value => (!value ? 'العميل مطلوب' : null)
    },
    {
      name: 'paymentTerms',
      type: 'select',
      label: 'شروط الدفع',
      placeholder: 'اختر شروط الدفع',
      required: false,
      options: PAYMENT_TERMS.map(term => ({ value: term, label: term }))
    },
    {
      name: 'status',
      type: 'select',
      label: 'حالة الفاتورة',
      placeholder: 'اختر الحالة',
      required: true,
      options: invoiceStatuses.map(status => ({ value: status.value, label: status.label })),
      validation: value => (!value ? 'الحالة مطلوبة' : null)
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'حالة الدفع',
      placeholder: 'اختر حالة الدفع',
      required: true,
      options: paymentStatuses.map(status => ({ value: status.value, label: status.label })),
      validation: value => (!value ? 'حالة الدفع مطلوبة' : null)
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'ملاحظات',
      placeholder: 'أي ملاحظات أو شروط خاصة...',
      required: false,
      rows: 3
    }
  ];

  // البيانات الأولية للنموذج
  const getInitialFormData = () => ({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: calculateDueDate(new Date().toISOString().split('T')[0], '30 يوم'),
    customerId: '',
    paymentTerms: '',
    notes: '',
    status: 'draft',
    paymentStatus: 'pending',
    items: [
      {
        id: Date.now(),
        productId: '',
        quantity: '',
        unitPrice: '',
        discount: 0,
        total: 0
      }
    ]
  });

  // تصفية الفواتير
  const filteredInvoices = (() => {
    if (!searchTerm && statusFilter === 'all' && paymentStatusFilter === 'all') {
      return invoices;
    }

    const searchFields = ['invoiceNumber', 'notes'];
    let filtered = searchTerm ? searchData(invoices, searchTerm, searchFields) : invoices;

    // البحث في بيانات العملاء المرتبطة
    if (searchTerm) {
      const customerMatches = invoices.filter(invoice => {
        const customer = customers.find(c => c.id === invoice.customerId);
        return (
          customer &&
          (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });

      // دمج النتائج وإزالة المكررات
      const allMatches = [...filtered, ...customerMatches];
      filtered = allMatches.filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.paymentStatus === paymentStatusFilter);
    }

    return filtered;
  })();

  // إنشاء رقم فاتورة جديد
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const number = String(invoices.length + 1).padStart(3, '0');
    return `INV-${year}-${number}`;
  };

  // حساب تاريخ الاستحقاق
  const calculateDueDate = (fromDate, paymentTerms) => {
    const date = new Date(fromDate);
    const days = parseInt(paymentTerms?.match(/\d+/)?.[0]) || 30;
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // معالج تغيير التاريخ
  const handleDateChange = (field, value) => {
    handleChange(field, value);
    if (field === 'date' && values.paymentTerms) {
      handleChange('dueDate', calculateDueDate(value, values.paymentTerms));
    }
  };

  // معالج تغيير العميل
  const handleCustomerChange = customerId => {
    const customer = customers.find(c => c.id === customerId);
    handleChange('customerId', customerId);
    if (customer) {
      handleChange('paymentTerms', customer.paymentTerms || '');
      if (customer.paymentTerms && values.date) {
        handleChange('dueDate', calculateDueDate(values.date, customer.paymentTerms));
      }
    }
  };

  // معالج تغيير بنود الفاتورة
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...values.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // حساب الإجمالي للبند
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = updatedItems[index];
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      const subtotal = qty * price;
      const discountAmount = subtotal * (discount / 100);
      item.total = subtotal - discountAmount;
    }

    handleChange('items', updatedItems);
  };

  // معالج تغيير المنتج
  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    handleItemChange(index, 'productId', productId);
    if (product) {
      handleItemChange(index, 'unitPrice', product.sellingPrice);

      // تطبيق خصم العميل إذا وجد
      const customer = customers.find(c => c.id === values.customerId);
      if (customer?.discount) {
        handleItemChange(index, 'discount', customer.discount);
      }
    }
  };

  // إضافة بند جديد
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      productId: '',
      quantity: '',
      unitPrice: '',
      discount: 0,
      total: 0
    };
    handleChange('items', [...values.items, newItem]);
  };

  // حذف بند
  const removeItem = index => {
    if (values.items.length > 1) {
      const updatedItems = values.items.filter((_, i) => i !== index);
      handleChange('items', updatedItems);
    }
  };

  // حساب المجاميع
  const calculateTotals = items => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (qty * price * discount) / 100;
    }, 0);
    const taxAmount = subtotal * 0.15; // ضريبة القيمة المضافة 15%
    const grandTotal = subtotal + taxAmount;

    return { subtotal, totalDiscount, taxAmount, grandTotal };
  };

  // فحص حد الائتمان
  const checkCreditLimit = (customer, amount) => {
    if (!customer || !customer.creditLimit) {
      return true;
    }
    return customer.currentBalance + amount <= customer.creditLimit;
  };

  // فحص المخزون
  const checkStock = items => {
    return items.filter(item => {
      const product = products.find(p => p.id === item.productId);
      return product && item.quantity && parseFloat(item.quantity) > product.currentStock;
    });
  };

  // حفظ الفاتورة
  const handleSave = async formData => {
    setLocalLoading(true);
    try {
      const totals = calculateTotals(formData.items);
      const customer = customers.find(c => c.id === formData.customerId);

      // فحص حد الائتمان
      if (!checkCreditLimit(customer, totals.grandTotal)) {
        const confirmMsg = 'تحذير: ستتجاوز هذه الفاتورة حد الائتمان!\nهل تريد المتابعة؟';
        if (!window.confirm(confirmMsg)) {
          setLocalLoading(false);
          return;
        }
      }

      // فحص المخزون
      const stockIssues = checkStock(formData.items);
      if (stockIssues.length > 0) {
        const confirmMsg = 'تحذير: نقص في المخزون لبعض المنتجات!\nهل تريد المتابعة؟';
        if (!window.confirm(confirmMsg)) {
          setLocalLoading(false);
          return;
        }
      }

      if (editingInvoice) {
        // تحديث فاتورة موجودة
        const updatedInvoice = {
          ...formData,
          id: editingInvoice.id,
          invoiceNumber: editingInvoice.invoiceNumber,
          ...totals,
          createdDate: editingInvoice.createdDate,
          lastModified: new Date().toISOString()
        };
        await updateInvoice(editingInvoice.id, updatedInvoice);
      } else {
        // إضافة فاتورة جديدة
        const newInvoice = {
          ...formData,
          id: Date.now().toString(),
          invoiceNumber: formData.invoiceNumber || generateInvoiceNumber(),
          ...totals,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        await addInvoice(newInvoice);
      }

      setIsModalOpen(false);
      setEditingInvoice(null);
      showNotification(editingInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم إضافة الفاتورة بنجاح', 'success');
    } catch (error) {
      console.error('خطأ في حفظ الفاتورة:', error);
      showNotification('حدث خطأ أثناء حفظ الفاتورة', 'error');
    } finally {
      setLocalLoading(false);
    }
  };

  // حذف الفاتورة
  const handleDelete = async invoiceId => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await removeInvoice(invoiceId);
        showNotification('تم حذف الفاتورة بنجاح', 'success');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification('حدث خطأ أثناء حذف الفاتورة', 'error');
      }
    }
  };

  // فتح نموذج التعديل
  const openEditModal = invoice => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  // فتح نموذج إضافة جديد
  const openAddModal = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  // فتح معاينة الطباعة
  const openPrintPreview = invoice => {
    setPreviewInvoice(invoice);
    setShowPrintPreview(true);
  };

  // تصدير البيانات
  const handleExport = () => {
    exporters.downloadJSON(invoices, 'invoices');
  };

  // إحصائيات سريعة
  const getStats = () => {
    const total = invoices.length;
    const confirmed = invoices.filter(i => i.status === 'confirmed').length;
    const pending = invoices.filter(i => i.paymentStatus === 'pending').length;
    const overdue = invoices.filter(i => i.paymentStatus === 'overdue').length;
    const totalRevenue = invoices
      .filter(i => i.status === 'confirmed')
      .reduce((sum, i) => sum + (i.grandTotal || 0), 0);

    return { total, confirmed, pending, overdue, totalRevenue };
  };

  const stats = getStats();

  // أعمدة الجدول
  const columns = [
    {
      key: 'invoiceNumber',
      title: 'رقم الفاتورة',
      render: invoice => (
        <div className='flex items-center gap-2'>
          <span className='font-medium text-blue-600'>{invoice.invoiceNumber}</span>
          <Button size='sm' variant='ghost' onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}>
            📋
          </Button>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'العميل',
      render: invoice => {
        const customer = customers.find(c => c.id === invoice.customerId);
        return (
          <div>
            <div className='font-medium'>{customer?.name || 'غير محدد'}</div>
            <div className='text-sm text-gray-500'>{customer?.contactPerson}</div>
          </div>
        );
      }
    },
    {
      key: 'date',
      title: 'التاريخ',
      render: invoice => formatters.date(invoice.date)
    },
    {
      key: 'dueDate',
      title: 'تاريخ الاستحقاق',
      render: invoice => formatters.date(invoice.dueDate)
    },
    {
      key: 'grandTotal',
      title: 'القيمة الإجمالية',
      render: invoice => formatters.currency(invoice.grandTotal)
    },
    {
      key: 'status',
      title: 'حالة الفاتورة',
      render: invoice => {
        const status = invoiceStatuses.find(s => s.value === invoice.status);
        return <Badge variant={status?.color || 'gray'}>{status?.label || invoice.status}</Badge>;
      }
    },
    {
      key: 'paymentStatus',
      title: 'حالة الدفع',
      render: invoice => {
        const status = paymentStatuses.find(s => s.value === invoice.paymentStatus);
        return <Badge variant={status?.color || 'gray'}>{status?.label || invoice.paymentStatus}</Badge>;
      }
    }
  ];

  // إجراءات الجدول
  const actions = [
    {
      label: 'معاينة',
      onClick: openPrintPreview,
      variant: 'secondary'
    },
    {
      label: 'تعديل',
      onClick: openEditModal,
      variant: 'primary'
    },
    {
      label: 'حذف',
      onClick: handleDelete,
      variant: 'danger',
      confirm: true
    }
  ];

  // منتقي العملاء
  const CustomerSelector = ({ value, onChange, error }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const selectedCustomer = customers.find(c => c.id === value);
    const filteredCustomers = customers
      .filter(
        customer =>
          localSearch.length > 1 &&
          (customer.name.toLowerCase().includes(localSearch.toLowerCase()) ||
            customer.customerCode.toLowerCase().includes(localSearch.toLowerCase()) ||
            customer.phone.includes(localSearch))
      )
      .slice(0, 5);

    return (
      <div className='relative'>
        <Input
          label='العميل'
          placeholder='ابحث عن عميل...'
          value={selectedCustomer ? selectedCustomer.name : localSearch}
          onChange={e => {
            setLocalSearch(e.target.value);
            if (e.target.value.length > 1) {
              setShowDropdown(true);
            } else {
              setShowDropdown(false);
              onChange('');
            }
          }}
          onFocus={() => {
            if (localSearch.length > 1) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          error={error}
          required
        />

        {showDropdown && filteredCustomers.length > 0 && (
          <div className='absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto'>
            {filteredCustomers.map(customer => (
              <button
                key={customer.id}
                type='button'
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(customer.id);
                  setLocalSearch(customer.name);
                  setShowDropdown(false);
                }}
                className='w-full text-right p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0'
              >
                <div className='font-medium'>{customer.name}</div>
                <div className='text-sm text-gray-500'>
                  {customer.customerCode} • {customer.contactPerson}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // منتقي المنتجات
  const ProductSelector = ({ value, onChange, index }) => {
    const [localSearch, setLocalSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    const selectedProduct = products.find(p => p.id === value);
    const filteredProducts = products
      .filter(
        product =>
          localSearch.length > 1 &&
          (product.nameAr?.toLowerCase().includes(localSearch.toLowerCase()) ||
            product.code?.toLowerCase().includes(localSearch.toLowerCase()))
      )
      .slice(0, 5);

    // Update display value when selected product changes
    React.useEffect(() => {
      if (selectedProduct && !localSearch) {
        setDisplayValue(selectedProduct.nameAr);
      } else {
        setDisplayValue(localSearch);
      }
    }, [selectedProduct, localSearch]);

    return (
      <div className='relative'>
        <Input
          placeholder='ابحث عن منتج...'
          value={displayValue}
          onChange={e => {
            const newValue = e.target.value;
            setLocalSearch(newValue);
            setDisplayValue(newValue);
            if (newValue.length > 1) {
              setShowDropdown(true);
            } else {
              setShowDropdown(false);
              onChange('');
            }
          }}
          onFocus={() => {
            if (localSearch.length > 1) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 150);
          }}
          size='sm'
        />

        {showDropdown && filteredProducts.length > 0 && (
          <div className='absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto'>
            {filteredProducts.map(product => (
              <button
                key={product.id}
                type='button'
                onMouseDown={e => {
                  e.preventDefault();
                  handleProductChange(index, product.id);
                  setLocalSearch('');
                  setDisplayValue(product.nameAr);
                  setShowDropdown(false);
                }}
                className='w-full text-right p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0'
              >
                <div className='font-medium'>{product.nameAr}</div>
                <div className='text-sm text-gray-500'>
                  {product.code} • {formatters.currency(product.sellingPrice)} • متوفر: {product.currentStock}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // مكون معاينة الطباعة
  const PrintPreview = ({ invoice }) => {
    const customer = customers.find(c => c.id === invoice.customerId);

    return (
      <div className='max-w-4xl mx-auto bg-white p-8 shadow-lg' dir='rtl'>
        {/* رأس الصفحة */}
        <div className='border-b-2 border-blue-600 pb-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-blue-800 mb-2'>فاتورة مبيعات</h1>
              <p className='text-sm text-gray-600'>Sales Invoice</p>
            </div>
            <div className='text-left'>
              <div className='text-lg font-bold text-blue-600'>رقم الفاتورة: {invoice.invoiceNumber}</div>
              <div className='text-sm text-gray-600'>التاريخ: {formatters.date(invoice.date)}</div>
              <div className='text-sm text-gray-600'>الاستحقاق: {formatters.date(invoice.dueDate)}</div>
            </div>
          </div>
        </div>

        {/* معلومات العميل */}
        <div className='grid grid-cols-2 gap-6 mb-6'>
          <div>
            <h3 className='font-bold text-gray-800 mb-2'>معلومات العميل:</h3>
            <div className='text-sm space-y-1'>
              <div>
                <strong>العميل:</strong> {customer?.name}
              </div>
              <div>
                <strong>المسؤول:</strong> {customer?.contactPerson}
              </div>
              <div>
                <strong>الهاتف:</strong> {customer?.phone}
              </div>
              <div>
                <strong>العنوان:</strong> {customer?.address}
              </div>
              <div>
                <strong>الرقم الضريبي:</strong> {customer?.taxNumber}
              </div>
            </div>
          </div>
          <div>
            <h3 className='font-bold text-gray-800 mb-2'>تفاصيل الفاتورة:</h3>
            <div className='text-sm space-y-1'>
              <div>
                <strong>حالة الفاتورة:</strong> {invoiceStatuses.find(s => s.value === invoice.status)?.label}
              </div>
              <div>
                <strong>حالة الدفع:</strong> {paymentStatuses.find(s => s.value === invoice.paymentStatus)?.label}
              </div>
              <div>
                <strong>شروط الدفع:</strong> {invoice.paymentTerms}
              </div>
            </div>
          </div>
        </div>

        {/* جدول الأصناف */}
        <table className='w-full border-collapse border border-gray-800 mb-6 text-sm'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border border-gray-800 p-2'>#</th>
              <th className='border border-gray-800 p-2'>الصنف</th>
              <th className='border border-gray-800 p-2'>الكمية</th>
              <th className='border border-gray-800 p-2'>الوحدة</th>
              <th className='border border-gray-800 p-2'>السعر</th>
              <th className='border border-gray-800 p-2'>الخصم</th>
              <th className='border border-gray-800 p-2'>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <tr key={index}>
                  <td className='border border-gray-800 p-2 text-center'>{index + 1}</td>
                  <td className='border border-gray-800 p-2'>
                    <div>{product?.nameAr}</div>
                    <div className='text-xs text-gray-600'>{product?.code}</div>
                  </td>
                  <td className='border border-gray-800 p-2 text-center'>{item.quantity}</td>
                  <td className='border border-gray-800 p-2 text-center'>{product?.unit}</td>
                  <td className='border border-gray-800 p-2 text-center'>{formatters.currency(item.unitPrice)}</td>
                  <td className='border border-gray-800 p-2 text-center'>{item.discount}%</td>
                  <td className='border border-gray-800 p-2 text-center'>{formatters.currency(item.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* المجاميع */}
        <div className='flex justify-end mb-6'>
          <div className='w-64 space-y-2'>
            <div className='flex justify-between'>
              <span>المجموع الفرعي:</span>
              <span>{formatters.currency(invoice.subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>إجمالي الخصم:</span>
              <span>-{formatters.currency(invoice.totalDiscount)}</span>
            </div>
            <div className='flex justify-between'>
              <span>ضريبة القيمة المضافة:</span>
              <span>{formatters.currency(invoice.taxAmount)}</span>
            </div>
            <div className='flex justify-between border-t pt-2 font-bold'>
              <span>المجموع الإجمالي:</span>
              <span>{formatters.currency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className='mb-6'>
            <h3 className='font-bold text-gray-800 mb-2'>ملاحظات:</h3>
            <p className='text-sm'>{invoice.notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (showPrintPreview && previewInvoice) {
    return (
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='max-w-4xl mx-auto mb-6'>
          <Button onClick={() => setShowPrintPreview(false)}>← العودة</Button>
        </div>
        <PrintPreview invoice={previewInvoice} />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* رأس الصفحة */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <FileText className='text-blue-600' size={32} />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>نظام فواتير المبيعات الذكي</h1>
              <p className='text-gray-600'>فواتير مبيعات متكاملة مع إدارة المخزون وحدود الائتمان</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleExport} variant='secondary' icon={FileText}>
              تصدير
            </Button>
            <Button onClick={openAddModal} icon={FileText}>
              فاتورة جديدة
            </Button>
          </div>
        </div>

        {/* شريط البحث والتصفية */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <Input placeholder='البحث في الفواتير...' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value='all'>جميع حالات الفاتورة</option>
            {invoiceStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
          <Select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value)}>
            <option value='all'>جميع حالات الدفع</option>
            {paymentStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        {/* الإحصائيات */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='bg-blue-50 p-4 rounded-lg text-center'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-2xl font-bold text-blue-600'>{stats.total}</div>
                <div className='text-sm text-gray-600'>إجمالي الفواتير</div>
              </div>
              <FileText className='text-blue-600' size={24} />
            </div>
          </div>
          <div className='bg-green-50 p-4 rounded-lg text-center'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-2xl font-bold text-green-600'>{stats.confirmed}</div>
                <div className='text-sm text-gray-600'>مؤكدة</div>
              </div>
              <CreditCard className='text-green-600' size={24} />
            </div>
          </div>
          <div className='bg-yellow-50 p-4 rounded-lg text-center'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-2xl font-bold text-yellow-600'>{stats.pending}</div>
                <div className='text-sm text-gray-600'>معلقة الدفع</div>
              </div>
              <AlertTriangle className='text-yellow-600' size={24} />
            </div>
          </div>
          <div className='bg-purple-50 p-4 rounded-lg text-center'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-lg font-bold text-purple-600'>
                  {formatters.currency(stats.totalRevenue, false)}
                </div>
                <div className='text-sm text-gray-600'>إجمالي المبيعات</div>
              </div>
              <DollarSign className='text-purple-600' size={24} />
            </div>
          </div>
          <div className='bg-red-50 p-4 rounded-lg text-center'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-2xl font-bold text-red-600'>{stats.overdue}</div>
                <div className='text-sm text-gray-600'>متأخرة الدفع</div>
              </div>
              <AlertTriangle className='text-red-600' size={24} />
            </div>
          </div>
        </div>
      </Card>

      {/* جدول الفواتير */}
      <Card>
        {loading ? (
          <Loading />
        ) : filteredInvoices.length === 0 ? (
          <Empty
            icon={FileText}
            title='لا توجد فواتير'
            description='ابدأ بإنشاء فاتورة جديدة'
            action={<Button onClick={openAddModal}>فاتورة جديدة</Button>}
          />
        ) : (
          <Table data={filteredInvoices} columns={columns} actions={actions} keyExtractor={item => item.id} />
        )}
      </Card>

      {/* نموذج إضافة/تعديل الفاتورة */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        title={editingInvoice ? 'تعديل الفاتورة' : 'فاتورة مبيعات جديدة'}
        size='large'
      >
        <UniversalForm
          fields={formFields}
          initialData={
            editingInvoice || {
              invoiceNumber: generateInvoiceNumber(),
              date: new Date().toISOString().split('T')[0],
              dueDate: calculateDueDate(new Date().toISOString().split('T')[0], 'نقداً'),
              customerId: '',
              paymentTerms: 'نقداً',
              notes: '',
              status: 'draft',
              paymentStatus: 'pending',
              items: []
            }
          }
          onSubmit={handleSave}
          submitLabel={editingInvoice ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}
          loading={localLoading}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingInvoice(null);
          }}
        />
      </Modal>

      {/* مربع الميزات */}
      <Card className='bg-green-50 border-green-200'>
        <h3 className='text-lg font-bold text-green-800 mb-3'>الميزات المتكاملة</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700'>
          <div>
            <h4 className='font-semibold mb-2'>إدارة المخزون:</h4>
            <ul className='space-y-1'>
              <li>• عرض المخزون المتاح لكل منتج</li>
              <li>• تنبيهات نقص المخزون</li>
              <li>• تحديث تلقائي عند التأكيد</li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold mb-2'>إدارة الائتمان:</h4>
            <ul className='space-y-1'>
              <li>• فحص حدود الائتمان</li>
              <li>• عرض الرصيد الحالي</li>
              <li>• تنبيهات تجاوز الحد</li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold mb-2'>حسابات تلقائية:</h4>
            <ul className='space-y-1'>
              <li>• حساب الخصومات والضرائب</li>
              <li>• إجماليات فورية</li>
              <li>• تقارير مالية دقيقة</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoicesPage;
