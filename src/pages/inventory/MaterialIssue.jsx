// pages/inventory/MaterialIssue.jsx
import React, { useState } from 'react';
import { Package2, AlertTriangle, User, FileText } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import { useLocalStorage, useForm } from '../../hooks';
import { STORAGE_KEYS, UNITS } from '../../constants';
import { validators, formatters, exporters } from '../../utils';

const MaterialIssueForm = () => {
  const [issues, setIssues] = useLocalStorage(STORAGE_KEYS.MATERIAL_ISSUES, []);
  const [products] = useLocalStorage(STORAGE_KEYS.PRODUCTS, []);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewIssue, setPreviewIssue] = useState(null);
  const [loading, setLoading] = useState(false);

  // الأقسام والأولويات
  const departments = ['الإنتاج', 'الجودة', 'الصيانة', 'التعبئة', 'المختبر', 'الإدارة', 'التنظيف', 'الأمن'];
  const priorities = [
    { value: 'urgent', label: 'عاجل', color: 'red' },
    { value: 'normal', label: 'عادي', color: 'blue' },
    { value: 'low', label: 'غير عاجل', color: 'gray' }
  ];
  const purposes = ['الإنتاج', 'الصيانة', 'التنظيف', 'المختبر', 'الاستهلاك العام', 'أخرى'];

  // نموذج إذن الصرف
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    {
      issueNumber: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      department: '',
      requestedBy: '',
      authorizedBy: '',
      issuedBy: '',
      receivedBy: '',
      purpose: '',
      priority: 'normal',
      notes: '',
      items: [
        {
          id: Date.now(),
          materialCode: '',
          materialName: '',
          unit: '',
          requestedQty: '',
          issuedQty: '',
          availableStock: '',
          batchNumber: '',
          expiryDate: '',
          location: '',
          cost: '',
          notes: ''
        }
      ]
    },
    {
      department: [validators.required],
      requestedBy: [validators.required],
      authorizedBy: [validators.required],
      issuedBy: [validators.required]
    }
  );

  // إضافة بند جديد
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      materialCode: '',
      materialName: '',
      unit: '',
      requestedQty: '',
      issuedQty: '',
      availableStock: '',
      batchNumber: '',
      expiryDate: '',
      location: '',
      cost: '',
      notes: ''
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

  // معالج تغيير بنود الصرف
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...values.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleChange('items', updatedItems);
  };

  // معالج تغيير المنتج
  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleItemChange(index, 'materialCode', product.code);
      handleItemChange(index, 'materialName', product.nameAr);
      handleItemChange(index, 'unit', product.unit);
      handleItemChange(index, 'cost', product.unitCost);
      handleItemChange(index, 'availableStock', product.currentStock || 0);
    }
  };

  // حساب إجمالي التكلفة
  const calculateTotalCost = () => {
    return values.items.reduce((total, item) => {
      const cost = parseFloat(item.cost) || 0;
      const qty = parseFloat(item.issuedQty) || 0;
      return total + cost * qty;
    }, 0);
  };

  // تحديد حالة المخزون
  const getStockAlert = (available, requested) => {
    const avail = parseFloat(available) || 0;
    const req = parseFloat(requested) || 0;
    if (avail < req) {
      return { status: 'نقص في المخزون', color: 'red' };
    }
    if (avail < req * 1.2) {
      return { status: 'مخزون منخفض', color: 'yellow' };
    }
    return { status: 'مخزون كافي', color: 'green' };
  };

  // إنشاء رقم إذن جديد
  const generateIssueNumber = () => {
    const year = new Date().getFullYear();
    const number = String(issues.length + 1).padStart(3, '0');
    return `MI-${year}-${number}`;
  };

  // حفظ إذن الصرف
  const handleSave = async formData => {
    setLoading(true);
    try {
      const totalCost = calculateTotalCost();
      const newIssue = {
        ...formData,
        id: Date.now().toString(),
        issueNumber: formData.issueNumber || generateIssueNumber(),
        totalCost,
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      setIssues(prev => [...prev, newIssue]);
      reset();
      alert('تم حفظ إذن الصرف بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ إذن الصرف:', error);
    } finally {
      setLoading(false);
    }
  };

  // فتح معاينة الطباعة
  const openPrintPreview = () => {
    const issueWithTotals = {
      ...values,
      totalCost: calculateTotalCost()
    };
    setPreviewIssue(issueWithTotals);
    setShowPrintPreview(true);
  };

  // تصدير البيانات
  const handleExport = () => {
    exporters.downloadJSON(values, `material_issue_${values.issueNumber || 'new'}`);
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
                  {product.code} • متوفر: {product.currentStock || 0} {product.unit}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // مكون معاينة الطباعة
  const PrintPreview = ({ issue }) => (
    <div className='max-w-4xl mx-auto bg-white p-8 shadow-lg' dir='rtl'>
      {/* رأس الصفحة */}
      <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
        <h1 className='text-2xl font-bold mb-2'>إذن صرف مواد</h1>
        <div className='text-sm'>
          <span>رقم الإذن: {issue.issueNumber}</span>
          <span className='mx-4'>التاريخ: {issue.date}</span>
          <span>الوقت: {issue.time}</span>
          <span className='mx-4'>الأولوية: {priorities.find(p => p.value === issue.priority)?.label}</span>
        </div>
      </div>

      {/* معلومات الطلب */}
      <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
        <div>
          <strong>بيانات الطلب:</strong>
          <div>القسم الطالب: {issue.department}</div>
          <div>طالب الصرف: {issue.requestedBy}</div>
          <div>الغرض: {issue.purpose}</div>
        </div>
        <div>
          <strong>بيانات التنفيذ:</strong>
          <div>المخول بالصرف: {issue.authorizedBy}</div>
          <div>قام بالصرف: {issue.issuedBy}</div>
          <div>المستلم: {issue.receivedBy}</div>
        </div>
      </div>

      {/* جدول الأصناف */}
      <table className='w-full border-collapse border border-gray-800 mb-6 text-xs'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='border border-gray-800 p-2'>#</th>
            <th className='border border-gray-800 p-2'>كود المادة</th>
            <th className='border border-gray-800 p-2'>اسم المادة</th>
            <th className='border border-gray-800 p-2'>الوحدة</th>
            <th className='border border-gray-800 p-2'>المطلوب</th>
            <th className='border border-gray-800 p-2'>المصروف</th>
            <th className='border border-gray-800 p-2'>المخزون المتاح</th>
            <th className='border border-gray-800 p-2'>رقم الدفعة</th>
            <th className='border border-gray-800 p-2'>الموقع</th>
            <th className='border border-gray-800 p-2'>التكلفة/الوحدة</th>
            <th className='border border-gray-800 p-2'>إجمالي التكلفة</th>
            <th className='border border-gray-800 p-2'>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {issue.items.map((item, index) => {
            const unitCost = parseFloat(item.cost) || 0;
            const issuedQty = parseFloat(item.issuedQty) || 0;
            const totalItemCost = unitCost * issuedQty;

            return (
              <tr key={item.id}>
                <td className='border border-gray-800 p-2 text-center'>{index + 1}</td>
                <td className='border border-gray-800 p-2'>{item.materialCode}</td>
                <td className='border border-gray-800 p-2'>{item.materialName}</td>
                <td className='border border-gray-800 p-2'>{item.unit}</td>
                <td className='border border-gray-800 p-2 text-center'>{item.requestedQty}</td>
                <td className='border border-gray-800 p-2 text-center'>{item.issuedQty}</td>
                <td className='border border-gray-800 p-2 text-center'>{item.availableStock}</td>
                <td className='border border-gray-800 p-2'>{item.batchNumber}</td>
                <td className='border border-gray-800 p-2'>{item.location}</td>
                <td className='border border-gray-800 p-2 text-center'>{formatters.currency(item.cost)}</td>
                <td className='border border-gray-800 p-2 text-center'>{formatters.currency(totalItemCost)}</td>
                <td className='border border-gray-800 p-2'>{item.notes}</td>
              </tr>
            );
          })}
          <tr className='bg-gray-100 font-bold'>
            <td colSpan='10' className='border border-gray-800 p-2 text-left'>
              إجمالي التكلفة:
            </td>
            <td className='border border-gray-800 p-2 text-center'>{formatters.currency(issue.totalCost)}</td>
            <td className='border border-gray-800 p-2'></td>
          </tr>
        </tbody>
      </table>

      {/* التوقيعات */}
      <div className='grid grid-cols-4 gap-6 mt-8 text-sm'>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>طالب الصرف</div>
            <div className='font-bold'>{issue.requestedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>المخول بالصرف</div>
            <div className='font-bold'>{issue.authorizedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>قام بالصرف</div>
            <div className='font-bold'>{issue.issuedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>المستلم</div>
            <div className='font-bold'>{issue.receivedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
      </div>

      {issue.notes && (
        <div className='mt-6 text-sm'>
          <strong>ملاحظات عامة:</strong>
          <div className='border border-gray-800 p-2 mt-2'>{issue.notes}</div>
        </div>
      )}
    </div>
  );

  if (showPrintPreview && previewIssue) {
    return (
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='max-w-4xl mx-auto mb-6'>
          <Button onClick={() => setShowPrintPreview(false)}>← العودة</Button>
        </div>
        <PrintPreview issue={previewIssue} />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* رأس الصفحة */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Package2 className='text-red-600' size={32} />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>إذن صرف مواد</h1>
              <p className='text-gray-600'>صرف وتوزيع المواد للأقسام المختلفة</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleExport} variant='secondary'>
              تصدير البيانات
            </Button>
            <Button onClick={openPrintPreview} variant='secondary'>
              معاينة الطباعة
            </Button>
          </div>
        </div>

        {/* المعلومات الأساسية */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <Input
            label='رقم الإذن'
            name='issueNumber'
            value={values.issueNumber}
            onChange={handleChange}
            placeholder='سيتم إنشاؤه تلقائياً'
          />
          <Input label='التاريخ' name='date' type='date' value={values.date} onChange={handleChange} required />
          <Input label='الوقت' name='time' type='time' value={values.time} onChange={handleChange} required />
          <Select
            label='القسم الطالب'
            name='department'
            value={values.department}
            onChange={handleChange}
            error={errors.department}
            required
          >
            <option value=''>اختر القسم</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
          <Select label='الأولوية' name='priority' value={values.priority} onChange={handleChange}>
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* معلومات الطلب والتخويل */}
      <Card title='بيانات الطلب والتخويل' className='bg-indigo-50'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
          <Input
            label='طالب الصرف'
            name='requestedBy'
            value={values.requestedBy}
            onChange={handleChange}
            error={errors.requestedBy}
            required
            placeholder='اسم طالب الصرف'
          />
          <Input
            label='المخول بالصرف'
            name='authorizedBy'
            value={values.authorizedBy}
            onChange={handleChange}
            error={errors.authorizedBy}
            required
            placeholder='اسم المخول'
          />
          <Input
            label='قام بالصرف'
            name='issuedBy'
            value={values.issuedBy}
            onChange={handleChange}
            error={errors.issuedBy}
            required
            placeholder='موظف المستودع'
          />
          <Input
            label='المستلم'
            name='receivedBy'
            value={values.receivedBy}
            onChange={handleChange}
            placeholder='اسم المستلم'
          />
          <Select label='الغرض من الصرف' name='purpose' value={values.purpose} onChange={handleChange}>
            <option value=''>اختر الغرض</option>
            {purposes.map(purpose => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* بنود الصرف */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <h2 className='text-lg font-semibold'>تفاصيل المواد المطلوب صرفها</h2>
            <Badge variant='primary'>إجمالي التكلفة: {formatters.currency(calculateTotalCost())}</Badge>
          </div>
          <Button onClick={addItem} variant='success' size='sm'>
            إضافة مادة
          </Button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full min-w-max'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>#</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>المنتج</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>الوحدة</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>مطلوب</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>مصروف</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>المخزون</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>حالة المخزون</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>رقم الدفعة</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>الموقع</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>التكلفة</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>ملاحظات</th>
                <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>إجراء</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {values.items.map((item, index) => {
                const stockAlert = getStockAlert(item.availableStock, item.requestedQty);

                return (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <ProductSelector
                        value={item.productId}
                        onChange={productId => handleProductChange(index, productId)}
                        index={index}
                      />
                      {item.materialCode && <div className='text-xs text-gray-500 mt-1'>{item.materialCode}</div>}
                    </td>
                    <td className='px-3 py-2'>
                      <Select
                        value={item.unit}
                        onChange={e => handleItemChange(index, 'unit', e.target.value)}
                        size='sm'
                      >
                        <option value=''>اختر</option>
                        {UNITS.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        value={item.requestedQty}
                        onChange={e => handleItemChange(index, 'requestedQty', e.target.value)}
                        placeholder='100'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        value={item.issuedQty}
                        onChange={e => handleItemChange(index, 'issuedQty', e.target.value)}
                        placeholder='100'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        value={item.availableStock}
                        onChange={e => handleItemChange(index, 'availableStock', e.target.value)}
                        placeholder='500'
                        size='sm'
                        readOnly
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Badge variant={stockAlert.color} size='sm'>
                        {stockAlert.status}
                        {stockAlert.color === 'red' && <AlertTriangle size={12} className='inline ml-1' />}
                      </Badge>
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        value={item.batchNumber}
                        onChange={e => handleItemChange(index, 'batchNumber', e.target.value)}
                        placeholder='B2024001'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        value={item.location}
                        onChange={e => handleItemChange(index, 'location', e.target.value)}
                        placeholder='A1-B2'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        step='0.01'
                        value={item.cost}
                        onChange={e => handleItemChange(index, 'cost', e.target.value)}
                        placeholder='0.00'
                        size='sm'
                        readOnly
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        value={item.notes}
                        onChange={e => handleItemChange(index, 'notes', e.target.value)}
                        placeholder='ملاحظات'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <Button
                        onClick={() => removeItem(index)}
                        disabled={values.items.length === 1}
                        variant='danger'
                        size='sm'
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ملاحظات */}
      <Card title='ملاحظات عامة'>
        <Input
          name='notes'
          type='textarea'
          rows={3}
          value={values.notes}
          onChange={handleChange}
          placeholder='أي ملاحظات إضافية حول الصرف...'
        />

        <div className='flex justify-end gap-4 pt-4 border-t mt-6'>
          <Button onClick={reset} variant='secondary'>
            إعادة تعيين
          </Button>
          <Button onClick={handleSubmit(handleSave)} loading={loading}>
            حفظ إذن الصرف
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MaterialIssueForm;
