// pages/inventory/MaterialReceipt.jsx
import React, { useState } from 'react';
import { Package, Calendar, User, FileText, Truck } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import { useLocalStorage, useForm } from '../../hooks';
import { STORAGE_KEYS, UNITS } from '../../constants';
import { validators, formatters, exporters } from '../../utils';

const MaterialReceiptForm = () => {
  const [receipts, setReceipts] = useLocalStorage(STORAGE_KEYS.MATERIAL_RECEIPTS, []);
  const [products] = useLocalStorage(STORAGE_KEYS.PRODUCTS, []);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  // حالات المواد
  const conditions = [
    { value: 'accepted', label: 'مقبول', color: 'green' },
    { value: 'rejected', label: 'مرفوض', color: 'red' },
    { value: 'conditional', label: 'مقبول مع تحفظ', color: 'yellow' },
    { value: 'under_review', label: 'تحت المراجعة', color: 'blue' }
  ];

  // المستودعات
  const warehouses = [
    'المستودع الرئيسي',
    'مستودع المواد الخام',
    'مستودع المنتجات النهائية',
    'مستودع التعبئة',
    'المخزن البارد'
  ];

  // نموذج إذن الاستلام
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    {
      receiptNumber: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      supplier: '',
      supplierCode: '',
      deliveryNote: '',
      purchaseOrder: '',
      vehicleNumber: '',
      driverName: '',
      receivedBy: '',
      checkedBy: '',
      approvedBy: '',
      warehouse: '',
      notes: '',
      temperature: '',
      humidity: '',
      items: [
        {
          id: Date.now(),
          materialCode: '',
          materialName: '',
          unit: '',
          orderedQty: '',
          receivedQty: '',
          batchNumber: '',
          expiryDate: '',
          manufacturingDate: '',
          condition: 'accepted',
          notes: ''
        }
      ]
    },
    {
      supplier: [validators.required],
      receivedBy: [validators.required],
      warehouse: [validators.required]
    }
  );

  // إضافة بند جديد
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      materialCode: '',
      materialName: '',
      unit: '',
      orderedQty: '',
      receivedQty: '',
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      condition: 'accepted',
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

  // معالج تغيير بنود الاستلام
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
    }
  };

  // إنشاء رقم إذن جديد
  const generateReceiptNumber = () => {
    const year = new Date().getFullYear();
    const number = String(receipts.length + 1).padStart(3, '0');
    return `MR-${year}-${number}`;
  };

  // حفظ إذن الاستلام
  const handleSave = async formData => {
    setLoading(true);
    try {
      const newReceipt = {
        ...formData,
        id: Date.now().toString(),
        receiptNumber: formData.receiptNumber || generateReceiptNumber(),
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      setReceipts(prev => [...prev, newReceipt]);
      reset();
      alert('تم حفظ إذن الاستلام بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ إذن الاستلام:', error);
    } finally {
      setLoading(false);
    }
  };

  // فتح معاينة الطباعة
  const openPrintPreview = () => {
    setPreviewReceipt(values);
    setShowPrintPreview(true);
  };

  // تصدير البيانات
  const handleExport = () => {
    exporters.downloadJSON(values, `material_receipt_${values.receiptNumber || 'new'}`);
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
                  {product.code} • {product.unit}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // مكون معاينة الطباعة
  const PrintPreview = ({ receipt }) => (
    <div className='max-w-4xl mx-auto bg-white p-8 shadow-lg' dir='rtl'>
      {/* رأس الصفحة */}
      <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
        <h1 className='text-2xl font-bold mb-2'>إذن استلام مواد</h1>
        <div className='text-sm'>
          <span>رقم الإذن: {receipt.receiptNumber}</span>
          <span className='mx-4'>التاريخ: {receipt.date}</span>
          <span>الوقت: {receipt.time}</span>
        </div>
      </div>

      {/* معلومات المورد */}
      <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
        <div>
          <strong>بيانات المورد:</strong>
          <div>المورد: {receipt.supplier}</div>
          <div>كود المورد: {receipt.supplierCode}</div>
          <div>إذن التوريد: {receipt.deliveryNote}</div>
          <div>أمر الشراء: {receipt.purchaseOrder}</div>
        </div>
        <div>
          <strong>بيانات النقل:</strong>
          <div>رقم المركبة: {receipt.vehicleNumber}</div>
          <div>اسم السائق: {receipt.driverName}</div>
          <div>الحرارة: {receipt.temperature}°م</div>
          <div>الرطوبة: {receipt.humidity}%</div>
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
            <th className='border border-gray-800 p-2'>المستلم</th>
            <th className='border border-gray-800 p-2'>رقم الدفعة</th>
            <th className='border border-gray-800 p-2'>تاريخ الإنتاج</th>
            <th className='border border-gray-800 p-2'>تاريخ الانتهاء</th>
            <th className='border border-gray-800 p-2'>الحالة</th>
            <th className='border border-gray-800 p-2'>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, index) => (
            <tr key={item.id}>
              <td className='border border-gray-800 p-2 text-center'>{index + 1}</td>
              <td className='border border-gray-800 p-2'>{item.materialCode}</td>
              <td className='border border-gray-800 p-2'>{item.materialName}</td>
              <td className='border border-gray-800 p-2'>{item.unit}</td>
              <td className='border border-gray-800 p-2 text-center'>{item.orderedQty}</td>
              <td className='border border-gray-800 p-2 text-center'>{item.receivedQty}</td>
              <td className='border border-gray-800 p-2'>{item.batchNumber}</td>
              <td className='border border-gray-800 p-2'>{item.manufacturingDate}</td>
              <td className='border border-gray-800 p-2'>{item.expiryDate}</td>
              <td className='border border-gray-800 p-2'>{conditions.find(c => c.value === item.condition)?.label}</td>
              <td className='border border-gray-800 p-2'>{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* التوقيعات */}
      <div className='grid grid-cols-3 gap-8 mt-8 text-sm'>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>تم الاستلام بواسطة</div>
            <div className='font-bold'>{receipt.receivedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>تم الفحص بواسطة</div>
            <div className='font-bold'>{receipt.checkedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
        <div className='text-center'>
          <div className='border-t border-gray-800 pt-2 mt-8'>
            <div>تم الاعتماد بواسطة</div>
            <div className='font-bold'>{receipt.approvedBy}</div>
            <div>التوقيع: _______________</div>
          </div>
        </div>
      </div>

      {receipt.notes && (
        <div className='mt-6 text-sm'>
          <strong>ملاحظات عامة:</strong>
          <div className='border border-gray-800 p-2 mt-2'>{receipt.notes}</div>
        </div>
      )}
    </div>
  );

  if (showPrintPreview && previewReceipt) {
    return (
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='max-w-4xl mx-auto mb-6'>
          <Button onClick={() => setShowPrintPreview(false)}>← العودة</Button>
        </div>
        <PrintPreview receipt={previewReceipt} />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* رأس الصفحة */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Package className='text-blue-600' size={32} />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>إذن استلام مواد</h1>
              <p className='text-gray-600'>تسجيل وتوثيق المواد المستلمة من الموردين</p>
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
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Input
            label='رقم الإذن'
            name='receiptNumber'
            value={values.receiptNumber}
            onChange={handleChange}
            placeholder='سيتم إنشاؤه تلقائياً'
          />
          <Input label='التاريخ' name='date' type='date' value={values.date} onChange={handleChange} required />
          <Input label='الوقت' name='time' type='time' value={values.time} onChange={handleChange} required />
          <Select
            label='المستودع'
            name='warehouse'
            value={values.warehouse}
            onChange={handleChange}
            error={errors.warehouse}
            required
          >
            <option value=''>اختر المستودع</option>
            {warehouses.map(warehouse => (
              <option key={warehouse} value={warehouse}>
                {warehouse}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* معلومات المورد والنقل */}
      <Card title='بيانات المورد والنقل' className='bg-blue-50'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Input
            label='اسم المورد'
            name='supplier'
            value={values.supplier}
            onChange={handleChange}
            error={errors.supplier}
            required
            placeholder='شركة المواد الغذائية'
          />
          <Input
            label='كود المورد'
            name='supplierCode'
            value={values.supplierCode}
            onChange={handleChange}
            placeholder='SUP-001'
          />
          <Input
            label='إذن التوريد'
            name='deliveryNote'
            value={values.deliveryNote}
            onChange={handleChange}
            placeholder='DN-2024-001'
          />
          <Input
            label='أمر الشراء'
            name='purchaseOrder'
            value={values.purchaseOrder}
            onChange={handleChange}
            placeholder='PO-2024-001'
          />
          <Input
            label='رقم المركبة'
            name='vehicleNumber'
            value={values.vehicleNumber}
            onChange={handleChange}
            placeholder='أ ب ج 123'
          />
          <Input
            label='اسم السائق'
            name='driverName'
            value={values.driverName}
            onChange={handleChange}
            placeholder='أحمد محمد'
          />
          <Input
            label='الحرارة (°م)'
            name='temperature'
            type='number'
            value={values.temperature}
            onChange={handleChange}
            placeholder='25'
          />
          <Input
            label='الرطوبة (%)'
            name='humidity'
            type='number'
            value={values.humidity}
            onChange={handleChange}
            placeholder='60'
          />
        </div>
      </Card>

      {/* بنود الاستلام */}
      <Card title='تفاصيل المواد المستلمة'>
        <div className='space-y-4'>
          <div className='flex justify-end'>
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
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>مستلم</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>رقم الدفعة</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>تاريخ الإنتاج</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>تاريخ الانتهاء</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>الحالة</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>ملاحظات</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase'>إجراء</th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {values.items.map((item, index) => (
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
                        value={item.orderedQty}
                        onChange={e => handleItemChange(index, 'orderedQty', e.target.value)}
                        placeholder='100'
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='number'
                        value={item.receivedQty}
                        onChange={e => handleItemChange(index, 'receivedQty', e.target.value)}
                        placeholder='100'
                        size='sm'
                      />
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
                        type='date'
                        value={item.manufacturingDate}
                        onChange={e => handleItemChange(index, 'manufacturingDate', e.target.value)}
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Input
                        type='date'
                        value={item.expiryDate}
                        onChange={e => handleItemChange(index, 'expiryDate', e.target.value)}
                        size='sm'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <Select
                        value={item.condition}
                        onChange={e => handleItemChange(index, 'condition', e.target.value)}
                        size='sm'
                      >
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </Select>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* التوقيعات والملاحظات */}
      <Card title='التوقيعات والملاحظات'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <Input
            label='تم الاستلام بواسطة'
            name='receivedBy'
            value={values.receivedBy}
            onChange={handleChange}
            error={errors.receivedBy}
            required
            placeholder='اسم المستلم'
          />
          <Input
            label='تم الفحص بواسطة'
            name='checkedBy'
            value={values.checkedBy}
            onChange={handleChange}
            placeholder='اسم الفاحص'
          />
          <Input
            label='تم الاعتماد بواسطة'
            name='approvedBy'
            value={values.approvedBy}
            onChange={handleChange}
            placeholder='اسم المعتمد'
          />
        </div>

        <Input
          label='ملاحظات عامة'
          name='notes'
          type='textarea'
          rows={3}
          value={values.notes}
          onChange={handleChange}
          placeholder='أي ملاحظات إضافية...'
        />

        <div className='flex justify-end gap-4 pt-4 border-t mt-6'>
          <Button onClick={reset} variant='secondary'>
            إعادة تعيين
          </Button>
          <Button onClick={handleSubmit(handleSave)} loading={loading}>
            حفظ إذن الاستلام
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MaterialReceiptForm;
