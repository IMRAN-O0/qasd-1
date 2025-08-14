import React, { useState, useMemo } from 'react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import { useLocalStorage, useForm } from '../../hooks';
import { STORAGE_KEYS, UNITS, WAREHOUSE_TYPES, RISK_LEVELS, EXPIRY_ACTIONS } from '../../constants';
import { validators, formatters, exporters } from '../../utils';
import { Plus, Trash2, Save, Download, AlertTriangle, Clock, Calendar, Package, Eye, EyeOff } from 'lucide-react';

const ExpiryReports = () => {
  const {
    values: formData,
    setValue,
    setFieldValues,
    reset: resetForm
  } = useForm({
    reportNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    reportType: 'منتهية الصلاحية',
    warehouse: '',
    preparedBy: '',
    reviewedBy: '',
    approvedBy: '',
    notes: '',
    items: [
      {
        id: 1,
        materialCode: '',
        materialName: '',
        unit: 'كيلو',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        location: '',
        unitCost: '',
        totalValue: 0,
        daysToExpiry: 0,
        riskLevel: 'متوسط',
        supplierName: '',
        action: '',
        notes: ''
      }
    ]
  });

  const [expiryReports, setExpiryReports] = useLocalStorage(STORAGE_KEYS.EXPIRY_REPORTS, []);
  const [showSummary, setShowSummary] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    'منتهية الصلاحية',
    'قريبة الانتهاء (30 يوم)',
    'قريبة الانتهاء (60 يوم)',
    'قريبة الانتهاء (90 يوم)'
  ];

  // حفظ تقرير انتهاء الصلاحية
  const saveExpiryReport = () => {
    setLoading(true);
    try {
      const reportData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        summary: calculateSummary
      };

      setExpiryReports(prev => [reportData, ...prev]);

      // إعادة تعيين النموذج
      resetForm();

      alert('تم حفظ تقرير انتهاء الصلاحية بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء حفظ التقرير');
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
      batchNumber: '',
      manufacturingDate: '',
      expiryDate: '',
      quantity: '',
      location: '',
      unitCost: '',
      totalValue: 0,
      daysToExpiry: 0,
      riskLevel: 'متوسط',
      supplierName: '',
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

    // حساب إجمالي القيمة والأيام للانتهاء
    if (field === 'quantity' || field === 'unitCost') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const cost = parseFloat(newItems[index].unitCost) || 0;
      newItems[index].totalValue = qty * cost;
    }

    if (field === 'expiryDate' || field === 'quantity' || field === 'unitCost') {
      const today = new Date();
      const expiryDate = new Date(newItems[index].expiryDate);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      newItems[index].daysToExpiry = diffDays;

      // تحديد مستوى المخاطر
      if (diffDays < 0) {
        newItems[index].riskLevel = 'عالي';
      } else if (diffDays <= 30) {
        newItems[index].riskLevel = 'عالي';
      } else if (diffDays <= 90) {
        newItems[index].riskLevel = 'متوسط';
      } else {
        newItems[index].riskLevel = 'منخفض';
      }
    }

    setValue('items', newItems);
  };

  // حساب الملخص
  const calculateSummary = useMemo(() => {
    const totalItems = formData.items.length;
    const expiredItems = formData.items.filter(item => item.daysToExpiry < 0).length;
    const highRiskItems = formData.items.filter(item => item.riskLevel === 'عالي').length;
    const totalValue = formData.items.reduce((sum, item) => sum + (parseFloat(item.totalValue) || 0), 0);
    const expiredValue = formData.items
      .filter(item => item.daysToExpiry < 0)
      .reduce((sum, item) => sum + (parseFloat(item.totalValue) || 0), 0);

    return {
      totalItems,
      expiredItems,
      highRiskItems,
      totalValue: totalValue.toFixed(2),
      expiredValue: expiredValue.toFixed(2)
    };
  }, [formData.items]);

  // الحصول على لون مستوى المخاطر
  const getRiskColor = riskLevel => {
    switch (riskLevel) {
      case 'عالي':
        return 'danger';
      case 'متوسط':
        return 'warning';
      case 'منخفض':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // الحصول على لون الأيام
  const getDaysColor = days => {
    if (days < 0) {
      return 'text-red-600 font-bold';
    }
    if (days <= 30) {
      return 'text-red-600';
    }
    if (days <= 90) {
      return 'text-yellow-600';
    }
    return 'text-green-600';
  };

  // تصدير البيانات
  const exportData = () => {
    const dataToExport = {
      ...formData,
      summary: calculateSummary,
      exportedAt: new Date().toISOString()
    };

    exporters.exportToJSON(dataToExport, `expiry_report_${formData.reportNumber || 'new'}`);
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
      key: 'manufacturingDate',
      title: 'تاريخ الإنتاج',
      width: '130px',
      render: (item, index) => (
        <Input
          size='sm'
          type='date'
          value={item.manufacturingDate}
          onChange={e => updateItem(index, 'manufacturingDate', e.target.value)}
        />
      )
    },
    {
      key: 'expiryDate',
      title: 'تاريخ الانتهاء',
      width: '130px',
      render: (item, index) => (
        <Input
          size='sm'
          type='date'
          value={item.expiryDate}
          onChange={e => updateItem(index, 'expiryDate', e.target.value)}
        />
      )
    },
    {
      key: 'quantity',
      title: 'الكمية',
      width: '100px',
      render: (item, index) => (
        <Input
          size='sm'
          type='number'
          value={item.quantity}
          onChange={e => updateItem(index, 'quantity', e.target.value)}
          placeholder='100'
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
      key: 'daysToExpiry',
      title: 'أيام للانتهاء',
      width: '120px',
      render: item => (
        <div className={`text-center text-sm font-medium ${getDaysColor(item.daysToExpiry)}`}>
          {item.daysToExpiry < 0 ? `منتهية منذ ${Math.abs(item.daysToExpiry)} يوم` : `${item.daysToExpiry} يوم`}
        </div>
      )
    },
    {
      key: 'riskLevel',
      title: 'مستوى المخاطر',
      width: '120px',
      render: item => <Badge color={getRiskColor(item.riskLevel)}>{item.riskLevel}</Badge>
    },
    {
      key: 'unitCost',
      title: 'التكلفة/وحدة',
      width: '120px',
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
      key: 'totalValue',
      title: 'القيمة الإجمالية',
      width: '120px',
      render: item => (
        <div className='text-center text-sm font-medium text-gray-900'>{formatters.currency(item.totalValue)}</div>
      )
    },
    {
      key: 'supplierName',
      title: 'المورد',
      width: '120px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.supplierName}
          onChange={e => updateItem(index, 'supplierName', e.target.value)}
          placeholder='اسم المورد'
        />
      )
    },
    {
      key: 'action',
      title: 'الإجراء المطلوب',
      width: '150px',
      render: (item, index) => (
        <Select
          size='sm'
          value={item.action}
          onChange={value => updateItem(index, 'action', value)}
          options={[
            { label: 'اختر الإجراء', value: '' },
            ...EXPIRY_ACTIONS.map(action => ({ label: action.label, value: action.value }))
          ]}
        />
      )
    },
    {
      key: 'notes',
      title: 'ملاحظات',
      width: '120px',
      render: (item, index) => (
        <Input
          size='sm'
          value={item.notes}
          onChange={e => updateItem(index, 'notes', e.target.value)}
          placeholder='ملاحظات'
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
            <h1 className='text-2xl font-bold mb-2'>تقرير انتهاء الصلاحية</h1>
            <div className='text-sm'>
              <span>رقم التقرير: {formData.reportNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>الوقت: {formData.time}</span>
              <span className='mx-4'>النوع: {formData.reportType}</span>
            </div>
          </div>

          {/* Report Info */}
          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>بيانات التقرير:</strong>
              <div>المستودع: {formData.warehouse}</div>
              <div>أعد بواسطة: {formData.preparedBy}</div>
              <div>راجع بواسطة: {formData.reviewedBy}</div>
            </div>
            <div>
              <strong>ملخص التقرير:</strong>
              <div>إجمالي المواد: {calculateSummary.totalItems}</div>
              <div>المواد المنتهية: {calculateSummary.expiredItems}</div>
              <div>قيمة المواد المنتهية: {calculateSummary.expiredValue} ريال</div>
            </div>
          </div>

          {/* Items Table */}
          <table className='w-full border-collapse border border-gray-800 mb-6 text-xs'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border border-gray-800 p-1'>#</th>
                <th className='border border-gray-800 p-1'>كود المادة</th>
                <th className='border border-gray-800 p-1'>اسم المادة</th>
                <th className='border border-gray-800 p-1'>رقم الدفعة</th>
                <th className='border border-gray-800 p-1'>تاريخ الانتهاء</th>
                <th className='border border-gray-800 p-1'>الكمية</th>
                <th className='border border-gray-800 p-1'>الموقع</th>
                <th className='border border-gray-800 p-1'>أيام للانتهاء</th>
                <th className='border border-gray-800 p-1'>مستوى المخاطر</th>
                <th className='border border-gray-800 p-1'>القيمة الإجمالية</th>
                <th className='border border-gray-800 p-1'>الإجراء المطلوب</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className='border border-gray-800 p-1 text-center'>{index + 1}</td>
                  <td className='border border-gray-800 p-1'>{item.materialCode}</td>
                  <td className='border border-gray-800 p-1'>{item.materialName}</td>
                  <td className='border border-gray-800 p-1'>{item.batchNumber}</td>
                  <td className='border border-gray-800 p-1'>{item.expiryDate}</td>
                  <td className='border border-gray-800 p-1 text-center'>
                    {item.quantity} {item.unit}
                  </td>
                  <td className='border border-gray-800 p-1'>{item.location}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.daysToExpiry}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.riskLevel}</td>
                  <td className='border border-gray-800 p-1 text-center'>{item.totalValue.toFixed(2)}</td>
                  <td className='border border-gray-800 p-1'>{item.action}</td>
                </tr>
              ))}
              <tr className='bg-gray-100 font-bold'>
                <td colSpan='9' className='border border-gray-800 p-1 text-left'>
                  إجمالي القيمة:
                </td>
                <td className='border border-gray-800 p-1 text-center'>{calculateSummary.totalValue}</td>
                <td className='border border-gray-800 p-1'></td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className='grid grid-cols-3 gap-8 mt-8 text-sm'>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>أعد التقرير</div>
                <div className='font-bold'>{formData.preparedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>راجع التقرير</div>
                <div className='font-bold'>{formData.reviewedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>اعتمد التقرير</div>
                <div className='font-bold'>{formData.approvedBy}</div>
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
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <AlertTriangle className='text-orange-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>تقرير انتهاء الصلاحية</h1>
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
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <Input
              label='رقم التقرير'
              value={formData.reportNumber}
              onChange={e => setValue('reportNumber', e.target.value)}
              placeholder='EXP-2024-001'
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
              label='نوع التقرير'
              value={formData.reportType}
              onChange={value => setValue('reportType', value)}
              options={reportTypes.map(type => ({ label: type, value: type }))}
              required
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
          </div>
        </Card>

        {/* Summary Cards */}
        {showSummary && (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            <Card className='p-4 text-center'>
              <Package className='text-blue-600 mx-auto mb-2' size={24} />
              <div className='text-2xl font-bold text-blue-600'>{calculateSummary.totalItems}</div>
              <div className='text-sm text-gray-600'>إجمالي المواد</div>
            </Card>
            <Card className='p-4 text-center'>
              <AlertTriangle className='text-red-600 mx-auto mb-2' size={24} />
              <div className='text-2xl font-bold text-red-600'>{calculateSummary.expiredItems}</div>
              <div className='text-sm text-gray-600'>منتهية الصلاحية</div>
            </Card>
            <Card className='p-4 text-center'>
              <Clock className='text-orange-600 mx-auto mb-2' size={24} />
              <div className='text-2xl font-bold text-orange-600'>{calculateSummary.highRiskItems}</div>
              <div className='text-sm text-gray-600'>مخاطر عالية</div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-lg font-bold text-green-600'>{formatters.currency(calculateSummary.totalValue)}</div>
              <div className='text-sm text-gray-600'>إجمالي القيمة</div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-lg font-bold text-red-600'>{formatters.currency(calculateSummary.expiredValue)}</div>
              <div className='text-sm text-gray-600'>قيمة المنتهية</div>
            </Card>
          </div>
        )}

        {/* Staff Information */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات التقرير</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              label='أعد بواسطة'
              value={formData.preparedBy}
              onChange={e => setValue('preparedBy', e.target.value)}
              placeholder='اسم محضر التقرير'
              required
            />
            <Input
              label='راجع بواسطة'
              value={formData.reviewedBy}
              onChange={e => setValue('reviewedBy', e.target.value)}
              placeholder='اسم مراجع التقرير'
              required
            />
            <Input
              label='اعتمد بواسطة'
              value={formData.approvedBy}
              onChange={e => setValue('approvedBy', e.target.value)}
              placeholder='اسم معتمد التقرير'
              required
            />
          </div>
        </Card>

        {/* Items Section */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>تفاصيل المواد</h2>
            <Button color='success' onClick={addItem} icon={Plus}>
              إضافة مادة
            </Button>
          </div>

          {formData.items.length === 0 ? (
            <Empty message='لا توجد مواد في التقرير' />
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
            placeholder='أي ملاحظات حول المواد منتهية الصلاحية أو الإجراءات المتخذة...'
          />
        </Card>

        {/* Actions */}
        <Card className='p-6'>
          <div className='flex justify-center gap-4'>
            <Button
              color='success'
              size='lg'
              onClick={saveExpiryReport}
              disabled={loading || !formData.reportNumber || !formData.warehouse}
              loading={loading}
              icon={Save}
            >
              حفظ التقرير
            </Button>
            <Button color='primary' size='lg' onClick={printReport} disabled={!formData.reportNumber} icon={Download}>
              طباعة التقرير
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpiryReports;
