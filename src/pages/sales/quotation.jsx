// pages/sales/quotation.jsx
import React, { useState } from 'react';
import { Calculator, Search, FileText, Send, Copy } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import UniversalForm from '../../components/ui/UniversalForm';
import { PAYMENT_TERMS, DELIVERY_TERMS } from '../../constants';
import { formatters, exporters } from '../../utils';

const QuotationPage = () => {
  // حساب تاريخ انتهاء الصلاحية (30 يوم من التاريخ المحدد)
  const calculateValidUntil = dateStr => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  // تهيئة بيانات النموذج الأولية
  function getInitialFormData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      customer: '',
      customerId: '',
      quotationNumber: '',
      date: today,
      validUntil: calculateValidUntil(today),
      status: 'draft',
      items: [],
      notes: '',
      terms: 'Standard terms and conditions apply',
      subtotal: 0,
      taxRate: 15,
      taxAmount: 0,
      discount: 0,
      total: 0
    };
  }

  // استخدام المتجر الموحد
  const {
    quotations,
    customers,
    products,
    loading: storeLoading,
    error,
    loadData,
    searchData,
    showNotification,
    addQuotation: add,
    updateQuotation: update,
    removeQuotation: remove
  } = useUnifiedDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [values, setValues] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  // تحميل البيانات عند بدء التشغيل
  React.useEffect(() => {
    loadData(['quotations', 'customers', 'products']);
  }, [loadData]);

  // حالات عروض الأسعار
  const statuses = [
    { value: 'draft', label: 'مسودة', color: 'gray' },
    { value: 'sent', label: 'مرسل', color: 'blue' },
    { value: 'accepted', label: 'مقبول', color: 'green' },
    { value: 'rejected', label: 'مرفوض', color: 'red' },
    { value: 'expired', label: 'منتهي', color: 'yellow' },
    { value: 'converted', label: 'محول لفاتورة', color: 'purple' }
  ];

  // تعريف حقول النموذج
  const formFields = [
    {
      name: 'quotationNumber',
      type: 'text',
      label: 'رقم العرض',
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
      name: 'validUntil',
      type: 'date',
      label: 'صالح حتى',
      required: true,
      validation: value => (!value ? 'تاريخ انتهاء الصلاحية مطلوب' : null)
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
      name: 'salesRep',
      type: 'text',
      label: 'مندوب المبيعات',
      placeholder: 'اسم مندوب المبيعات',
      required: false
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
      name: 'deliveryTerms',
      type: 'select',
      label: 'شروط التسليم',
      placeholder: 'اختر شروط التسليم',
      required: false,
      options: DELIVERY_TERMS.map(term => ({ value: term, label: term }))
    },
    {
      name: 'status',
      type: 'select',
      label: 'الحالة',
      placeholder: 'اختر الحالة',
      required: true,
      options: statuses.map(status => ({ value: status.value, label: status.label })),
      validation: value => (!value ? 'الحالة مطلوبة' : null)
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

  // تصفية عروض الأسعار
  const filteredQuotations = (() => {
    if (!searchTerm && statusFilter === 'all') {
      return quotations;
    }

    const searchFields = ['quotationNumber', 'salesRep', 'notes'];
    let filtered = searchTerm ? searchData(quotations, searchTerm, searchFields) : quotations;

    // البحث في بيانات العملاء المرتبطة
    if (searchTerm) {
      const customerMatches = quotations.filter(quotation => {
        const customer = customers.find(c => c.id === quotation.customerId);
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
      filtered = filtered.filter(quotation => quotation.status === statusFilter);
    }

    return filtered;
  })();

  // إنشاء رقم عرض سعر جديد
  const generateQuotationNumber = () => {
    const year = new Date().getFullYear();
    const number = String(quotations.length + 1).padStart(3, '0');
    return `QT-${year}-${number}`;
  };

  // معالج تغيير بنود العرض
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

  // حفظ عرض السعر
  const handleSave = async formData => {
    setLocalLoading(true);
    try {
      const totals = calculateTotals(formData.items);

      if (editingQuotation) {
        // تحديث عرض موجود
        const updatedQuotation = {
          ...formData,
          id: editingQuotation.id,
          quotationNumber: editingQuotation.quotationNumber,
          ...totals,
          createdDate: editingQuotation.createdDate,
          lastModified: new Date().toISOString()
        };
        await update('quotations', editingQuotation.id, updatedQuotation);
      } else {
        // إضافة عرض جديد
        const newQuotation = {
          ...formData,
          id: Date.now().toString(),
          quotationNumber: formData.quotationNumber || generateQuotationNumber(),
          ...totals,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        await add('quotations', newQuotation);
      }

      setIsModalOpen(false);
      setEditingQuotation(null);
      showNotification(editingQuotation ? 'تم تحديث عرض السعر بنجاح' : 'تم إضافة عرض السعر بنجاح', 'success');
    } catch (error) {
      console.error('خطأ في حفظ عرض السعر:', error);
      showNotification('حدث خطأ أثناء حفظ عرض السعر', 'error');
    } finally {
      setLocalLoading(false);
    }
  };

  // حذف عرض السعر
  const handleDelete = async quotationId => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      try {
        await remove('quotations', quotationId);
        showNotification('تم حذف عرض السعر بنجاح', 'success');
      } catch (error) {
        console.error('Error deleting quotation:', error);
        showNotification('حدث خطأ أثناء حذف عرض السعر', 'error');
      }
    }
  };

  // فتح نموذج التعديل
  const openEditModal = quotation => {
    setEditingQuotation(quotation);
    setValues(quotation);
    setIsModalOpen(true);
  };

  // فتح نموذج إضافة جديد
  const openAddModal = () => {
    setEditingQuotation(null);
    setValues(getInitialFormData());
    setIsModalOpen(true);
  };

  // إعادة تعيين النموذج
  const reset = () => {
    setValues(getInitialFormData());
    setErrors({});
  };

  // معالج تغيير الحقول
  const handleChange = (field, value) => {
    if (typeof field === 'object' && field.target) {
      // Handle event object
      const { name, value: fieldValue } = field.target;
      setValues(prev => ({ ...prev, [name]: fieldValue }));
    } else {
      // Handle direct name/value
      setValues(prev => ({ ...prev, [field]: value }));
    }
  };

  // معالج تغيير التاريخ
  const handleDateChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (field === 'date') {
      setValues(prev => ({ ...prev, validUntil: calculateValidUntil(value) }));
    }
  };

  // معالج تغيير العميل
  const handleCustomerChange = customerId => {
    const customer = customers.find(c => c.id === customerId);
    setValues(prev => ({
      ...prev,
      customerId,
      salesRep: customer ? customer.salesRep || '' : '',
      paymentTerms: customer ? customer.paymentTerms || '' : ''
    }));
  };

  // تم تعريف handleProductChange سابقاً

  // معالج تغيير عناصر الفاتورة
  // تم تعريف handleItemChange سابقاً

  // حساب الإجماليات
  // تم تعريف calculateTotals سابقاً

  // إضافة عنصر جديد
  // تم تعريف addItem سابقاً

  // حذف عنصر
  // removeItem function is already defined above

  // فتح معاينة الطباعة
  const openPrintPreview = quotation => {
    setPreviewQuotation(quotation);
    setShowPrintPreview(true);
  };

  // التحقق من صحة النموذج
  const validateForm = data => {
    const newErrors = {};

    if (!data.customerId) {
      newErrors.customerId = 'يرجى اختيار العميل';
    }

    if (!data.items || data.items.length === 0) {
      newErrors.items = 'يرجى إضافة صنف واحد على الأقل';
    } else {
      const invalidItems = data.items.filter(item => !item.productId || !item.quantity || !item.unitPrice);
      if (invalidItems.length > 0) {
        newErrors.items = 'يرجى إكمال بيانات جميع الأصناف';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // حفظ عرض السعر
  // handleSave function is already defined above

  // تصدير البيانات
  const handleExport = () => {
    exporters.downloadJSON(quotations, 'quotations');
  };

  // إحصائيات سريعة
  const getStats = () => {
    const total = quotations.length;
    const draft = quotations.filter(q => q.status === 'draft').length;
    const sent = quotations.filter(q => q.status === 'sent').length;
    const accepted = quotations.filter(q => q.status === 'accepted').length;
    const totalValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    return { total, draft, sent, accepted, totalValue };
  };

  const stats = getStats();

  // أعمدة الجدول
  const columns = [
    {
      key: 'quotationNumber',
      title: 'رقم العرض',
      render: quotation => (
        <div className='flex items-center gap-2'>
          <span className='font-medium text-blue-600'>{quotation.quotationNumber}</span>
          <Button size='sm' variant='ghost' onClick={() => navigator.clipboard.writeText(quotation.quotationNumber)}>
            <Copy size={14} />
          </Button>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'العميل',
      render: quotation => {
        const customer = customers.find(c => c.id === quotation.customerId);
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
      render: quotation => formatters.date(quotation.date)
    },
    {
      key: 'validUntil',
      title: 'صالح حتى',
      render: quotation => formatters.date(quotation.validUntil)
    },
    {
      key: 'grandTotal',
      title: 'القيمة الإجمالية',
      render: quotation => formatters.currency(quotation.grandTotal)
    },
    {
      key: 'status',
      title: 'الحالة',
      render: quotation => {
        const status = statuses.find(s => s.value === quotation.status);
        return <Badge variant={status?.color || 'gray'}>{status?.label || quotation.status}</Badge>;
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
          (product.nameAr.toLowerCase().includes(localSearch.toLowerCase()) ||
            product.code.toLowerCase().includes(localSearch.toLowerCase()))
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
  const PrintPreview = ({ quotation }) => {
    const customer = customers.find(c => c.id === quotation.customerId);

    return (
      <div className='max-w-4xl mx-auto bg-white p-8 shadow-lg' dir='rtl'>
        {/* رأس الصفحة */}
        <div className='border-b-2 border-blue-600 pb-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-blue-800 mb-2'>عرض سعر</h1>
              <p className='text-sm text-gray-600'>Quotation</p>
            </div>
            <div className='text-left'>
              <div className='text-lg font-bold text-blue-600'>رقم العرض: {quotation.quotationNumber}</div>
              <div className='text-sm text-gray-600'>التاريخ: {formatters.date(quotation.date)}</div>
              <div className='text-sm text-gray-600'>صالح حتى: {formatters.date(quotation.validUntil)}</div>
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
            </div>
          </div>
          <div>
            <h3 className='font-bold text-gray-800 mb-2'>تفاصيل العرض:</h3>
            <div className='text-sm space-y-1'>
              <div>
                <strong>مندوب المبيعات:</strong> {quotation.salesRep}
              </div>
              <div>
                <strong>شروط الدفع:</strong> {quotation.paymentTerms}
              </div>
              <div>
                <strong>شروط التسليم:</strong> {quotation.deliveryTerms}
              </div>
              <div>
                <strong>الحالة:</strong> {statuses.find(s => s.value === quotation.status)?.label}
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
            {quotation.items.map((item, index) => {
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
              <span>{formatters.currency(quotation.subtotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span>إجمالي الخصم:</span>
              <span>-{formatters.currency(quotation.totalDiscount)}</span>
            </div>
            <div className='flex justify-between'>
              <span>ضريبة القيمة المضافة:</span>
              <span>{formatters.currency(quotation.taxAmount)}</span>
            </div>
            <div className='flex justify-between border-t pt-2 font-bold'>
              <span>المجموع الإجمالي:</span>
              <span>{formatters.currency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>

        {quotation.notes && (
          <div className='mb-6'>
            <h3 className='font-bold text-gray-800 mb-2'>ملاحظات:</h3>
            <p className='text-sm'>{quotation.notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (showPrintPreview && previewQuotation) {
    return (
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='max-w-4xl mx-auto mb-6'>
          <Button onClick={() => setShowPrintPreview(false)}>← العودة</Button>
        </div>
        <PrintPreview quotation={previewQuotation} />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* رأس الصفحة */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Calculator className='text-blue-600' size={32} />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>نظام عروض الأسعار الذكي</h1>
              <p className='text-gray-600'>إنشاء وإدارة عروض الأسعار المتكاملة</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleExport} variant='secondary' icon={FileText}>
              تصدير
            </Button>
            <Button onClick={openAddModal} icon={Calculator}>
              عرض سعر جديد
            </Button>
          </div>
        </div>

        {/* شريط البحث والتصفية */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <Input
            placeholder='البحث في عروض الأسعار...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            icon={Search}
          />
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value='all'>جميع الحالات</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        {/* الإحصائيات */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='bg-blue-50 p-4 rounded-lg text-center'>
            <div className='text-2xl font-bold text-blue-600'>{stats.total}</div>
            <div className='text-sm text-gray-600'>إجمالي العروض</div>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg text-center'>
            <div className='text-2xl font-bold text-gray-600'>{stats.draft}</div>
            <div className='text-sm text-gray-600'>مسودات</div>
          </div>
          <div className='bg-yellow-50 p-4 rounded-lg text-center'>
            <div className='text-2xl font-bold text-yellow-600'>{stats.sent}</div>
            <div className='text-sm text-gray-600'>مرسلة</div>
          </div>
          <div className='bg-green-50 p-4 rounded-lg text-center'>
            <div className='text-2xl font-bold text-green-600'>{stats.accepted}</div>
            <div className='text-sm text-gray-600'>مقبولة</div>
          </div>
          <div className='bg-purple-50 p-4 rounded-lg text-center'>
            <div className='text-lg font-bold text-purple-600'>{formatters.currency(stats.totalValue, false)}</div>
            <div className='text-sm text-gray-600'>إجمالي القيمة</div>
          </div>
        </div>
      </Card>

      {/* جدول عروض الأسعار */}
      <Card>
        {storeLoading ? (
          <Loading />
        ) : filteredQuotations.length === 0 ? (
          <Empty
            icon={Calculator}
            title='لا توجد عروض أسعار'
            description='ابدأ بإنشاء عرض سعر جديد'
            action={<Button onClick={openAddModal}>عرض سعر جديد</Button>}
          />
        ) : (
          <Table data={filteredQuotations} columns={columns} actions={actions} keyExtractor={item => item.id} />
        )}
      </Card>

      {/* نموذج إضافة/تعديل عرض السعر */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuotation(null);
          reset();
        }}
        title={editingQuotation ? 'تعديل عرض السعر' : 'عرض سعر جديد'}
        size='large'
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave(values);
          }}
          className='space-y-6'
        >
          {/* المعلومات الأساسية */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Input
              label='رقم العرض'
              name='quotationNumber'
              value={values.quotationNumber}
              onChange={handleChange}
              placeholder='سيتم إنشاؤه تلقائياً'
            />
            <Input
              label='التاريخ'
              name='date'
              type='date'
              value={values.date}
              onChange={e => handleDateChange('date', e.target.value)}
              required
            />
            <Input
              label='صالح حتى'
              name='validUntil'
              type='date'
              value={values.validUntil}
              onChange={handleChange}
              required
            />
            <Select label='الحالة' name='status' value={values.status} onChange={handleChange}>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          {/* معلومات العميل */}
          <Card title='معلومات العميل' className='bg-blue-50'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <CustomerSelector
                value={values.customerId}
                onChange={customerId => handleCustomerChange(customerId)}
                error={errors.customerId}
              />
              {values.customerId && (
                <div className='bg-white p-3 rounded border'>
                  {(() => {
                    const customer = customers.find(c => c.id === values.customerId);
                    return customer ? (
                      <div className='text-sm space-y-1'>
                        <div>
                          <strong>الكود:</strong> {customer.customerCode}
                        </div>
                        <div>
                          <strong>المسؤول:</strong> {customer.contactPerson}
                        </div>
                        <div>
                          <strong>الهاتف:</strong> {customer.phone}
                        </div>
                        <div>
                          <strong>شروط الدفع:</strong> {customer.paymentTerms}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </Card>

          {/* بنود العرض */}
          <Card title='أصناف العرض'>
            <div className='space-y-4'>
              <div className='flex justify-end'>
                <Button type='button' onClick={addItem} variant='success' size='sm'>
                  إضافة صنف
                </Button>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='border border-gray-300 p-2'>#</th>
                      <th className='border border-gray-300 p-2'>الصنف</th>
                      <th className='border border-gray-300 p-2'>الكمية</th>
                      <th className='border border-gray-300 p-2'>السعر</th>
                      <th className='border border-gray-300 p-2'>الخصم %</th>
                      <th className='border border-gray-300 p-2'>الإجمالي</th>
                      <th className='border border-gray-300 p-2'>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className='border border-gray-300 p-2 text-center'>{index + 1}</td>
                        <td className='border border-gray-300 p-2'>
                          <ProductSelector
                            value={item.productId}
                            onChange={productId => handleProductChange(index, productId)}
                            index={index}
                          />
                        </td>
                        <td className='border border-gray-300 p-2'>
                          <Input
                            type='number'
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder='الكمية'
                            size='sm'
                          />
                        </td>
                        <td className='border border-gray-300 p-2'>
                          <Input
                            type='number'
                            step='0.01'
                            value={item.unitPrice}
                            onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                            placeholder='السعر'
                            size='sm'
                          />
                        </td>
                        <td className='border border-gray-300 p-2'>
                          <Input
                            type='number'
                            step='0.1'
                            value={item.discount}
                            onChange={e => handleItemChange(index, 'discount', e.target.value)}
                            placeholder='الخصم'
                            size='sm'
                          />
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          <span className='font-medium'>{formatters.currency(item.total)}</span>
                        </td>
                        <td className='border border-gray-300 p-2 text-center'>
                          <Button
                            type='button'
                            onClick={() => removeItem(index)}
                            disabled={values.items.length === 1}
                            variant='danger'
                            size='sm'
                          >
                            حذف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* المجاميع */}
          <Card className='bg-gray-50'>
            <div className='grid grid-cols-2 gap-4'>
              <div></div>
              <div className='space-y-2'>
                {(() => {
                  const totals = calculateTotals(values.items);
                  return (
                    <>
                      <div className='flex justify-between'>
                        <span>المجموع الفرعي:</span>
                        <span className='font-medium'>{formatters.currency(totals.subtotal)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>إجمالي الخصم:</span>
                        <span className='font-medium text-red-600'>-{formatters.currency(totals.totalDiscount)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>ضريبة القيمة المضافة (15%):</span>
                        <span className='font-medium'>{formatters.currency(totals.taxAmount)}</span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='font-bold'>المجموع الإجمالي:</span>
                        <span className='font-bold text-lg text-blue-600'>
                          {formatters.currency(totals.grandTotal)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* معلومات إضافية */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              label='مندوب المبيعات'
              name='salesRep'
              value={values.salesRep}
              onChange={handleChange}
              placeholder='اسم مندوب المبيعات'
            />
            <Select label='شروط الدفع' name='paymentTerms' value={values.paymentTerms} onChange={handleChange}>
              <option value=''>اختر شروط الدفع</option>
              {PAYMENT_TERMS.map(term => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </Select>
            <Select label='شروط التسليم' name='deliveryTerms' value={values.deliveryTerms} onChange={handleChange}>
              <option value=''>اختر شروط التسليم</option>
              {DELIVERY_TERMS.map(term => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </Select>
          </div>

          {/* ملاحظات */}
          <Input
            label='ملاحظات'
            name='notes'
            type='textarea'
            rows={3}
            value={values.notes}
            onChange={handleChange}
            placeholder='أي ملاحظات أو شروط خاصة...'
          />

          <div className='flex justify-end gap-4 pt-4 border-t'>
            <Button
              type='button'
              variant='secondary'
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuotation(null);
                reset();
              }}
            >
              إلغاء
            </Button>
            <Button type='submit' loading={loading}>
              {editingQuotation ? 'حفظ التعديلات' : 'حفظ العرض'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationPage;
