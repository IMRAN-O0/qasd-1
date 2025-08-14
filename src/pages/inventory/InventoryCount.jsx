import React, { useState, useMemo } from 'react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import { useLocalStorage, useForm } from '../../hooks';
import { STORAGE_KEYS, UNITS, WAREHOUSE_TYPES, COUNT_TYPES, VARIANCE_REASONS, VARIANCE_ACTIONS } from '../../constants';
import { validators, formatters, exporters } from '../../utils';
import {
  Plus,
  Trash2,
  Save,
  Download,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const InventoryCount = () => {
  const {
    values: formData,
    setValue,
    setFieldValues,
    reset: resetForm
  } = useForm({
    countNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    countType: 'شامل',
    warehouse: '',
    section: '',
    countedBy: '',
    supervisedBy: '',
    verifiedBy: '',
    notes: '',
    items: [
      {
        id: 1,
        materialCode: '',
        materialName: '',
        unit: 'كيلو',
        location: '',
        batchNumber: '',
        expiryDate: '',
        systemQty: '',
        physicalQty: '',
        variance: 0,
        varianceValue: 0,
        unitCost: '',
        reason: '',
        action: '',
        notes: ''
      }
    ]
  });

  const [inventoryCounts, setInventoryCounts] = useLocalStorage(STORAGE_KEYS.INVENTORY_COUNTS, []);
  const [showSummary, setShowSummary] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // حفظ بيانات الجرد
  const saveInventoryCount = () => {
    setLoading(true);
    try {
      const countData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        summary: calculateSummary()
      };

      setInventoryCounts(prev => [countData, ...prev]);

      // إعادة تعيين النموذج
      resetForm();

      alert('تم حفظ بيانات الجرد بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  // إضافة صف جديد
  const addItem = () => {
    const newItem = {
      id: formData.items.length + 1,
      materialCode: '',
      materialName: '',
      unit: 'كيلو',
      location: '',
      batchNumber: '',
      expiryDate: '',
      systemQty: '',
      physicalQty: '',
      variance: 0,
      varianceValue: 0,
      unitCost: '',
      reason: '',
      action: '',
      notes: ''
    };

    setValue('items', [...formData.items, newItem]);
  };

  // حذف صف
  const removeItem = index => {
    if (formData.items.length > 1) {
      setValue(
        'items',
        formData.items.filter((_, i) => i !== index)
      );
    }
  };

  // تحديث عنصر
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // حساب الفرق التلقائي
    if (field === 'systemQty' || field === 'physicalQty' || field === 'unitCost') {
      const systemQty = parseFloat(newItems[index].systemQty) || 0;
      const physicalQty = parseFloat(newItems[index].physicalQty) || 0;
      const unitCost = parseFloat(newItems[index].unitCost) || 0;

      newItems[index].variance = physicalQty - systemQty;
      newItems[index].varianceValue = (physicalQty - systemQty) * unitCost;
    }

    setValue('items', newItems);
  };

  // حساب الملخص
  const calculateSummary = useMemo(() => {
    const totalItems = formData.items.length;
    const itemsWithVariance = formData.items.filter(item => Math.abs(item.variance) > 0).length;
    const totalVarianceValue = formData.items.reduce((sum, item) => sum + (parseFloat(item.varianceValue) || 0), 0);
    const positiveVariance = formData.items.filter(item => item.variance > 0).length;
    const negativeVariance = formData.items.filter(item => item.variance < 0).length;
    const accuracyRate = totalItems > 0 ? (((totalItems - itemsWithVariance) / totalItems) * 100).toFixed(1) : 0;

    return {
      totalItems,
      itemsWithVariance,
      totalVarianceValue: totalVarianceValue.toFixed(2),
      positiveVariance,
      negativeVariance,
      accuracyRate
    };
  }, [formData.items]);

  // الحصول على حالة الفرق
  const getVarianceStatus = variance => {
    if (variance > 0) {
      return { status: 'زيادة', color: 'success', icon: CheckCircle };
    }
    if (variance < 0) {
      return { status: 'نقص', color: 'danger', icon: XCircle };
    }
    return { status: 'مطابق', color: 'secondary', icon: CheckCircle };
  };

  // تصدير البيانات
  const exportData = () => {
    const dataToExport = {
      ...formData,
      summary: calculateSummary,
      exportedAt: new Date().toISOString()
    };

    exporters.exportToJSON(dataToExport, `inventory_count_${formData.countNumber || 'new'}`);
  };

  // طباعة التقرير
  const printReport = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  // أعمدة الجدول
  const columns = [
    {
      key: 'index',
      title: '#',
      width: '50px',
      render: (_, index) => index + 1
    },
    {
      key: 'materialCode',
      title: 'كود المادة',
      width: '120px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.materialCode}
          onChange={e => updateItem(index, 'materialCode', e.target.value)}
          placeholder='MAT-001'
        />
      )
    },
    {
      key: 'materialName',
      title: 'اسم المادة',
      width: '150px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.materialName}
          onChange={e => updateItem(index, 'materialName', e.target.value)}
          placeholder='اسم المادة'
        />
      )
    },
    {
      key: 'unit',
      title: 'الوحدة',
      width: '100px',
      render: (item, index) => (
        <Select
          size='sm'
          value={item.unit}
          onChange={value => updateItem(index, 'unit', value)}
          options={UNITS.map(unit => ({ label: unit.label, value: unit.value }))}
        />
      )
    },
    {
      key: 'location',
      title: 'الموقع',
      width: '100px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.location}
          onChange={e => updateItem(index, 'location', e.target.value)}
          placeholder='A1-B2'
        />
      )
    },
    {
      key: 'batchNumber',
      title: 'رقم الدفعة',
      width: '120px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.batchNumber}
          onChange={e => updateItem(index, 'batchNumber', e.target.value)}
          placeholder='B2024001'
        />
      )
    },
    {
      key: 'systemQty',
      title: 'كمية النظام',
      width: '100px',
      render: (item, index) => (
        <Input
          size='sm'
          type='number'
          value={item.systemQty}
          onChange={e => updateItem(index, 'systemQty', e.target.value)}
          placeholder='100'
        />
      )
    },
    {
      key: 'physicalQty',
      title: 'الكمية الفعلية',
      width: '100px',
      render: (item, index) => (
        <Input
          size='sm'
          type='number'
          value={item.physicalQty}
          onChange={e => updateItem(index, 'physicalQty', e.target.value)}
          placeholder='98'
        />
      )
    },
    {
      key: 'variance',
      title: 'الفرق',
      width: '80px',
      render: item => (
        <div
          className={`text-center font-medium ${item.variance > 0 ? 'text-green-600' : item.variance < 0 ? 'text-red-600' : 'text-gray-600'}`}
        >
          {item.variance}
        </div>
      )
    },
    {
      key: 'status',
      title: 'الحالة',
      width: '100px',
      render: item => {
        const varianceInfo = getVarianceStatus(item.variance);
        return <Badge color={varianceInfo.color}>{varianceInfo.status}</Badge>;
      }
    },
    {
      key: 'unitCost',
      title: 'التكلفة/وحدة',
      width: '100px',
      render: (item, index) => (
        <Input
          size='sm'
          type='number'
          step='0.01'
          value={item.unitCost}
          onChange={e => updateItem(index, 'unitCost', e.target.value)}
          placeholder='10.50'
        />
      )
    },
    {
      key: 'varianceValue',
      title: 'قيمة الفرق',
      width: '100px',
      render: item => (
        <div
          className={`text-center font-medium ${item.varianceValue > 0 ? 'text-green-600' : item.varianceValue < 0 ? 'text-red-600' : 'text-gray-600'}`}
        >
          {formatters.currency(item.varianceValue)}
        </div>
      )
    },
    {
      key: 'reason',
      title: 'السبب',
      width: '120px',
      render: (item, index) => (
        <Select
          size='sm'
          value={item.reason}
          onChange={value => updateItem(index, 'reason', value)}
          options={[
            { label: 'اختر السبب', value: '' },
            ...VARIANCE_REASONS.map(reason => ({ label: reason.label, value: reason.value }))
          ]}
        />
      )
    },
    {
      key: 'action',
      title: 'الإجراء',
      width: '120px',
      render: (item, index) => (
        <Select
          size='sm'
          value={item.action}
          onChange={value => updateItem(index, 'action', value)}
          options={[
            { label: 'اختر الإجراء', value: '' },
            ...VARIANCE_ACTIONS.map(action => ({ label: action.label, value: action.value }))
          ]}
        />
      )
    },
    {
      key: 'actions',
      title: 'حذف',
      width: '80px',
      render: (_, index) => (
        <Button
          variant='ghost'
          size='sm'
          color='danger'
          onClick={() => removeItem(index)}
          disabled={formData.items.length === 1}
        >
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  if (printMode) {
    return (
      <div className='min-h-screen bg-white p-8 text-black print:p-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
            <h1 className='text-2xl font-bold mb-2'>سجل جرد المخزون</h1>
            <div className='text-sm'>
              <span>رقم الجرد: {formData.countNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>الوقت: {formData.time}</span>
              <span className='mx-4'>النوع: {formData.countType}</span>
            </div>
          </div>

          {/* Count Info */}
          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>بيانات الجرد:</strong>
              <div>المستودع: {formData.warehouse}</div>
              <div>القسم: {formData.section}</div>
              <div>قام بالعد: {formData.countedBy}</div>
            </div>
            <div>
              <strong>بيانات المراجعة:</strong>
              <div>تم الإشراف بواسطة: {formData.supervisedBy}</div>
              <div>تم التحقق بواسطة: {formData.verifiedBy}</div>
              <div>دقة الجرد: {calculateSummary.accuracyRate}%</div>
            </div>
          </div>

          {/* Summary */}
          <div className='bg-gray-100 p-4 mb-6 text-sm'>
            <h3 className='font-bold mb-2'>ملخص الجرد:</h3>
            <div className='grid grid-cols-4 gap-4'>
              <div>إجمالي المواد: {calculateSummary.totalItems}</div>
              <div>مواد بها فروقات: {calculateSummary.itemsWithVariance}</div>
              <div>زيادة: {calculateSummary.positiveVariance}</div>
              <div>نقص: {calculateSummary.negativeVariance}</div>
            </div>
            <div className='mt-2'>إجمالي قيمة الفروقات: {calculateSummary.totalVarianceValue} ريال</div>
          </div>

          {/* Items Table */}
          <table className='w-full border-collapse border border-gray-800 mb-6 text-xs'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-800 p-1'>#</th>
                <th className='border border-gray-800 p-1'>كود المادة</th>
                <th className='border border-gray-800 p-1'>اسم المادة</th>
                <th className='border border-gray-800 p-1'>الموقع</th>
                <th className='border border-gray-800 p-1'>رقم الدفعة</th>
                <th className='border border-gray-800 p-1'>كمية النظام</th>
                <th className='border border-gray-800 p-1'>الكمية الفعلية</th>
                <th className='border border-gray-800 p-1'>الفرق</th>
                <th className='border border-gray-800 p-1'>قيمة الفرق</th>
                <th className='border border-gray-800 p-1'>السبب</th>
                <th className='border border-gray-800 p-1'>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className='border border-gray-800 p-1 text-center'>{index + 1}</td>
                  <td className='border border-gray-800 p-1'>{item.materialCode}</td>
                  <td className='border border-gray-800 p-1'>{item.materialName}</td>
                  <td className='border border-gray-800 p-1'>{item.location}</td>
                  <td className='border border-gray-800 p-1'>{item.batchNumber}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.systemQty}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.physicalQty}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.variance}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.varianceValue}</td>
                  <td className='border border-gray-800 p-1'>{item.reason}</td>
                  <td className='border border-gray-800 p-1'>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className='grid grid-cols-3 gap-8 mt-8 text-sm'>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>قام بالعد</div>
                <div className='font-bold'>{formData.countedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>الإشراف</div>
                <div className='font-bold'>{formData.supervisedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>التحقق</div>
                <div className='font-bold'>{formData.verifiedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
          </div>

          {formData.notes && (
            <div className='mt-6 text-sm'>
              <strong>ملاحظات:</strong>
              <div className='border border-gray-800 p-2 mt-2'>{formData.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <BarChart3 className='text-purple-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>سجل جرد المخزون</h1>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowSummary(!showSummary)} icon={showSummary ? EyeOff : Eye}>
                {showSummary ? 'إخفاء الملخص' : 'عرض الملخص'}
              </Button>
              <Button color='success' onClick={exportData} icon={Save}>
                تصدير البيانات
              </Button>
              <Button color='primary' onClick={printReport} icon={Download}>
                طباعة
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
            <Input
              label='رقم الجرد'
              value={formData.countNumber}
              onChange={e => setValue('countNumber', e.target.value)}
              placeholder='IC-2024-001'
              required
            />
            <Input
              label='التاريخ'
              type='date'
              value={formData.date}
              onChange={e => setValue('date', e.target.value)}
              required
            />
            <Input
              label='الوقت'
              type='time'
              value={formData.time}
              onChange={e => setValue('time', e.target.value)}
              required
            />
            <Select
              label='نوع الجرد'
              value={formData.countType}
              onChange={value => setValue('countType', value)}
              options={COUNT_TYPES.map(type => ({ label: type.label, value: type.value }))}
              placeholder='اختر نوع الجرد'
            />
            <Select
              label='المستودع'
              value={formData.warehouse}
              onChange={value => setValue('warehouse', value)}
              options={[
                { label: 'اختر المستودع', value: '' },
                ...WAREHOUSE_TYPES.map(warehouse => ({ label: warehouse, value: warehouse }))
              ]}
              required
            />
            <Input
              label='القسم'
              value={formData.section}
              onChange={e => setFormData(prev => ({ ...prev, section: e.target.value }))}
              placeholder='قسم A'
            />
          </div>
        </Card>

        {/* Summary */}
        {showSummary && (
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <BarChart3 className='text-purple-600' size={20} />
              ملخص الجرد
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-6 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-blue-600'>{calculateSummary.totalItems}</div>
                <div className='text-sm text-gray-600'>إجمالي المواد</div>
              </div>
              <div className='bg-yellow-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-yellow-600'>{calculateSummary.itemsWithVariance}</div>
                <div className='text-sm text-gray-600'>مواد بها فروقات</div>
              </div>
              <div className='bg-green-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-green-600'>{calculateSummary.positiveVariance}</div>
                <div className='text-sm text-gray-600'>زيادة</div>
              </div>
              <div className='bg-red-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-red-600'>{calculateSummary.negativeVariance}</div>
                <div className='text-sm text-gray-600'>نقص</div>
              </div>
              <div className='bg-purple-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-purple-600'>{calculateSummary.accuracyRate}%</div>
                <div className='text-sm text-gray-600'>دقة الجرد</div>
              </div>
              <div className='bg-gray-50 p-4 rounded-lg text-center'>
                <div className='text-2xl font-bold text-gray-600'>
                  {formatters.currency(calculateSummary.totalVarianceValue)}
                </div>
                <div className='text-sm text-gray-600'>قيمة الفروقات</div>
              </div>
            </div>
          </Card>
        )}

        {/* Staff Information */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>فريق الجرد</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              label='قام بالعد'
              value={formData.countedBy}
              onChange={e => setFormData(prev => ({ ...prev, countedBy: e.target.value }))}
              placeholder='اسم موظف المستودع'
              required
            />
            <Input
              label='تم الإشراف بواسطة'
              value={formData.supervisedBy}
              onChange={e => setFormData(prev => ({ ...prev, supervisedBy: e.target.value }))}
              placeholder='اسم المشرف'
              required
            />
            <Input
              label='تم التحقق بواسطة'
              value={formData.verifiedBy}
              onChange={e => setFormData(prev => ({ ...prev, verifiedBy: e.target.value }))}
              placeholder='اسم مدير المستودع'
              required
            />
          </div>
        </Card>

        {/* Items Section */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>تفاصيل الجرد</h2>
            <Button color='success' onClick={addItem} icon={Plus}>
              إضافة مادة
            </Button>
          </div>

          {formData.items.length === 0 ? (
            <Empty message='لا توجد مواد في قائمة الجرد' />
          ) : (
            <Table columns={columns} data={formData.items} className='min-w-max' />
          )}
        </Card>

        {/* Notes */}
        <Card className='p-6'>
          <Input
            label='ملاحظات عامة'
            type='textarea'
            rows={3}
            value={formData.notes}
            onChange={e => setValue('notes', e.target.value)}
            placeholder='أي ملاحظات حول عملية الجرد...'
          />
        </Card>

        {/* Actions */}
        <Card className='p-6'>
          <div className='flex justify-center gap-4'>
            <Button
              color='success'
              size='lg'
              onClick={saveInventoryCount}
              disabled={loading || !formData.countNumber || !formData.warehouse}
              loading={loading}
              icon={Save}
            >
              حفظ بيانات الجرد
            </Button>
            <Button color='primary' size='lg' onClick={printReport} disabled={!formData.countNumber} icon={Download}>
              طباعة التقرير
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InventoryCount;
