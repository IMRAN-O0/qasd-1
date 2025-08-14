import React, { useState } from 'react';
import { Plus, Trash2, Save, Download, AlertTriangle, Clock, User, FileX, CheckSquare } from 'lucide-react';

const NonConformanceRecord = () => {
  const [formData, setFormData] = useState({
    ncNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    reportedBy: '',
    department: '',
    category: 'منتج',
    severity: 'متوسط',
    status: 'مفتوح',
    description: '',
    rootCause: '',
    immediateAction: '',
    correctiveAction: '',
    preventiveAction: '',
    targetDate: '',
    actualDate: '',
    verifiedBy: '',
    closedBy: '',
    approvedBy: '',
    notes: '',
    affectedItems: [
      {
        id: 1,
        itemType: '',
        itemName: '',
        itemCode: '',
        batchNumber: '',
        quantity: '',
        location: '',
        impact: ''
      }
    ],
    followUp: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        action: '',
        responsible: '',
        status: 'في الانتظار',
        notes: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const categories = ['منتج', 'عملية', 'وثيقة', 'معدات', 'بيئة عمل', 'موظف', 'عميل', 'مورد'];
  const severities = ['منخفض', 'متوسط', 'عالي', 'حرج'];
  const statuses = ['مفتوح', 'تحت المراجعة', 'في التنفيذ', 'مكتمل', 'مغلق', 'ملغي'];
  const departments = ['الإنتاج', 'الجودة', 'المستودع', 'الصيانة', 'المبيعات', 'المشتريات', 'الإدارة'];
  const itemTypes = ['مادة خام', 'منتج نهائي', 'منتج وسطي', 'مواد تعبئة', 'معدات', 'وثيقة', 'عملية'];
  const followUpStatuses = ['في الانتظار', 'في التنفيذ', 'مكتمل', 'متأخر', 'ملغي'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (category, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? { ...item, [field]: value } : item))
    }));
  };

  const addItem = category => {
    const newItem =
      category === 'affectedItems'
        ? {
          id: formData[category].length + 1,
          itemType: '',
          itemName: '',
          itemCode: '',
          batchNumber: '',
          quantity: '',
          location: '',
          impact: ''
        }
        : {
          id: formData[category].length + 1,
          date: new Date().toISOString().split('T')[0],
          action: '',
          responsible: '',
          status: 'في الانتظار',
          notes: ''
        };

    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  const removeItem = (category, index) => {
    if (formData[category].length > 1) {
      setFormData(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'منخفض':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'متوسط':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'عالي':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'حرج':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'مفتوح':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'تحت المراجعة':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'في التنفيذ':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'مكتمل':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'مغلق':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'ملغي':
        return 'text-gray-700 bg-gray-200 border-gray-400';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const calculateDaysOpen = () => {
    const today = new Date();
    const reportDate = new Date(formData.date);
    const diffTime = today - reportDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const saveData = () => {
    const jsonData = JSON.stringify({ ...formData, daysOpen: calculateDaysOpen() }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `non_conformance_${formData.ncNumber || 'new'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printForm = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  if (printMode) {
    return (
      <div className='min-h-screen bg-white p-8 text-black print:p-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
            <h1 className='text-2xl font-bold mb-2'>سجل عدم المطابقة</h1>
            <div className='text-sm'>
              <span>رقم السجل: {formData.ncNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>الوقت: {formData.time}</span>
              <span className='mx-4'>الحالة: {formData.status}</span>
            </div>
          </div>

          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>بيانات التقرير:</strong>
              <div>المُبلغ: {formData.reportedBy}</div>
              <div>القسم: {formData.department}</div>
              <div>الفئة: {formData.category}</div>
              <div>الخطورة: {formData.severity}</div>
            </div>
            <div>
              <strong>بيانات المتابعة:</strong>
              <div>التاريخ المستهدف: {formData.targetDate}</div>
              <div>التاريخ الفعلي: {formData.actualDate}</div>
              <div>أيام الفتح: {calculateDaysOpen()}</div>
              <div>تم التحقق بواسطة: {formData.verifiedBy}</div>
            </div>
          </div>

          {/* Description */}
          <div className='mb-6 text-sm'>
            <strong>وصف عدم المطابقة:</strong>
            <div className='border border-gray-800 p-2 mt-1'>{formData.description}</div>
          </div>

          {/* Root Cause */}
          <div className='mb-6 text-sm'>
            <strong>السبب الجذري:</strong>
            <div className='border border-gray-800 p-2 mt-1'>{formData.rootCause}</div>
          </div>

          {/* Actions */}
          <div className='grid grid-cols-1 gap-4 mb-6 text-sm'>
            <div>
              <strong>الإجراء الفوري:</strong>
              <div className='border border-gray-800 p-2 mt-1'>{formData.immediateAction}</div>
            </div>
            <div>
              <strong>الإجراء التصحيحي:</strong>
              <div className='border border-gray-800 p-2 mt-1'>{formData.correctiveAction}</div>
            </div>
            <div>
              <strong>الإجراء الوقائي:</strong>
              <div className='border border-gray-800 p-2 mt-1'>{formData.preventiveAction}</div>
            </div>
          </div>

          {/* Affected Items */}
          {formData.affectedItems.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2 text-sm'>العناصر المتأثرة:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>النوع</th>
                    <th className='border border-gray-800 p-1'>الاسم</th>
                    <th className='border border-gray-800 p-1'>الكود</th>
                    <th className='border border-gray-800 p-1'>رقم الدفعة</th>
                    <th className='border border-gray-800 p-1'>الكمية</th>
                    <th className='border border-gray-800 p-1'>الموقع</th>
                    <th className='border border-gray-800 p-1'>التأثير</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.affectedItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className='border border-gray-800 p-1'>{item.itemType}</td>
                      <td className='border border-gray-800 p-1'>{item.itemName}</td>
                      <td className='border border-gray-800 p-1'>{item.itemCode}</td>
                      <td className='border border-gray-800 p-1'>{item.batchNumber}</td>
                      <td className='border border-gray-800 p-1'>{item.quantity}</td>
                      <td className='border border-gray-800 p-1'>{item.location}</td>
                      <td className='border border-gray-800 p-1'>{item.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Follow Up */}
          {formData.followUp.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2 text-sm'>خطة المتابعة:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>التاريخ</th>
                    <th className='border border-gray-800 p-1'>الإجراء</th>
                    <th className='border border-gray-800 p-1'>المسؤول</th>
                    <th className='border border-gray-800 p-1'>الحالة</th>
                    <th className='border border-gray-800 p-1'>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.followUp.map((item, index) => (
                    <tr key={item.id}>
                      <td className='border border-gray-800 p-1'>{item.date}</td>
                      <td className='border border-gray-800 p-1'>{item.action}</td>
                      <td className='border border-gray-800 p-1'>{item.responsible}</td>
                      <td className='border border-gray-800 p-1'>{item.status}</td>
                      <td className='border border-gray-800 p-1'>{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className='grid grid-cols-3 gap-8 mt-8 text-sm'>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>تم التحقق بواسطة</div>
                <div className='font-bold'>{formData.verifiedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>تم الإغلاق بواسطة</div>
                <div className='font-bold'>{formData.closedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>تم الاعتماد بواسطة</div>
                <div className='font-bold'>{formData.approvedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
          </div>

          {formData.notes && (
            <div className='mt-6 text-sm'>
              <strong>ملاحظات عامة:</strong>
              <div className='border border-gray-800 p-2 mt-2'>{formData.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <FileX className='text-red-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>سجل عدم المطابقة</h1>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={saveData}
                className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
              >
                <Save size={16} />
                حفظ البيانات
              </button>
              <button
                onClick={printForm}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Download size={16} />
                طباعة
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم السجل</label>
              <input
                type='text'
                value={formData.ncNumber}
                onChange={e => handleInputChange('ncNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='NC-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ</label>
              <input
                type='date'
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الوقت</label>
              <input
                type='time'
                value={formData.time}
                onChange={e => handleInputChange('time', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الفئة</label>
              <select
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الخطورة</label>
              <select
                value={formData.severity}
                onChange={e => handleInputChange('severity', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent ${getSeverityColor(formData.severity)}`}
              >
                {severities.map(sev => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الحالة</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent ${getStatusColor(formData.status)}`}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <AlertTriangle className='text-red-600 mx-auto mb-2' size={24} />
            <div className={`text-lg font-bold px-2 py-1 rounded ${getSeverityColor(formData.severity)}`}>
              {formData.severity}
            </div>
            <div className='text-sm text-gray-600'>مستوى الخطورة</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Clock className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{calculateDaysOpen()}</div>
            <div className='text-sm text-gray-600'>أيام الفتح</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <CheckSquare className='text-green-600 mx-auto mb-2' size={24} />
            <div className={`text-lg font-bold px-2 py-1 rounded ${getStatusColor(formData.status)}`}>
              {formData.status}
            </div>
            <div className='text-sm text-gray-600'>حالة السجل</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <User className='text-purple-600 mx-auto mb-2' size={24} />
            <div className='text-lg font-bold text-purple-600'>{formData.category}</div>
            <div className='text-sm text-gray-600'>فئة عدم المطابقة</div>
          </div>
        </div>

        {/* Reporter Information */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات المُبلغ</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>المُبلغ</label>
              <input
                type='text'
                value={formData.reportedBy}
                onChange={e => handleInputChange('reportedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم المُبلغ'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>القسم</label>
              <select
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              >
                <option value=''>اختر القسم</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description and Analysis */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الوصف والتحليل</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>وصف عدم المطابقة</label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='وصف تفصيلي لعدم المطابقة...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تحليل السبب الجذري</label>
              <textarea
                value={formData.rootCause}
                onChange={e => handleInputChange('rootCause', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='تحليل الأسباب الجذرية لعدم المطابقة...'
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الإجراءات</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الإجراء الفوري</label>
              <textarea
                value={formData.immediateAction}
                onChange={e => handleInputChange('immediateAction', e.target.value)}
                rows={2}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='الإجراءات الفورية المتخذة لاحتواء المشكلة...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الإجراء التصحيحي</label>
              <textarea
                value={formData.correctiveAction}
                onChange={e => handleInputChange('correctiveAction', e.target.value)}
                rows={2}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='الإجراءات التصحيحية لمعالجة السبب الجذري...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الإجراء الوقائي</label>
              <textarea
                value={formData.preventiveAction}
                onChange={e => handleInputChange('preventiveAction', e.target.value)}
                rows={2}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='الإجراءات الوقائية لمنع تكرار المشكلة...'
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الجدول الزمني</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ المستهدف للإنجاز</label>
              <input
                type='date'
                value={formData.targetDate}
                onChange={e => handleInputChange('targetDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ الفعلي للإنجاز</label>
              <input
                type='date'
                value={formData.actualDate}
                onChange={e => handleInputChange('actualDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Affected Items */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>العناصر المتأثرة</h2>
            <button
              onClick={() => addItem('affectedItems')}
              className='flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'
            >
              <Plus size={16} />
              إضافة عنصر
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    نوع العنصر
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    اسم العنصر
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الكود
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    رقم الدفعة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الكمية
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الموقع
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التأثير
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {formData.affectedItems.map((item, index) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <select
                        value={item.itemType}
                        onChange={e => handleItemChange('affectedItems', index, 'itemType', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        <option value=''>اختر النوع</option>
                        {itemTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.itemName}
                        onChange={e => handleItemChange('affectedItems', index, 'itemName', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='اسم العنصر'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.itemCode}
                        onChange={e => handleItemChange('affectedItems', index, 'itemCode', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='الكود'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.batchNumber}
                        onChange={e => handleItemChange('affectedItems', index, 'batchNumber', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='رقم الدفعة'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.quantity}
                        onChange={e => handleItemChange('affectedItems', index, 'quantity', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='الكمية'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.location}
                        onChange={e => handleItemChange('affectedItems', index, 'location', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='الموقع'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.impact}
                        onChange={e => handleItemChange('affectedItems', index, 'impact', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='التأثير'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('affectedItems', index)}
                        disabled={formData.affectedItems.length === 1}
                        className='text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow Up Actions */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>خطة المتابعة</h2>
            <button
              onClick={() => addItem('followUp')}
              className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus size={16} />
              إضافة إجراء
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التاريخ
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الإجراء
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المسؤول
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الحالة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    ملاحظات
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {formData.followUp.map((item, index) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={item.date}
                        onChange={e => handleItemChange('followUp', index, 'date', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.action}
                        onChange={e => handleItemChange('followUp', index, 'action', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='الإجراء المطلوب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.responsible}
                        onChange={e => handleItemChange('followUp', index, 'responsible', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='المسؤول'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={item.status}
                        onChange={e => handleItemChange('followUp', index, 'status', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent ${getStatusColor(item.status)}`}
                      >
                        {followUpStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.notes}
                        onChange={e => handleItemChange('followUp', index, 'notes', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='ملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('followUp', index)}
                        disabled={formData.followUp.length === 1}
                        className='text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الاعتماد والإغلاق</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم التحقق بواسطة</label>
              <input
                type='text'
                value={formData.verifiedBy}
                onChange={e => handleInputChange('verifiedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم المحقق'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الإغلاق بواسطة</label>
              <input
                type='text'
                value={formData.closedBy}
                onChange={e => handleInputChange('closedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم من أغلق السجل'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الاعتماد بواسطة</label>
              <input
                type='text'
                value={formData.approvedBy}
                onChange={e => handleInputChange('approvedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم المعتمد'
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>ملاحظات عامة</label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              rows={3}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              placeholder='أي ملاحظات إضافية أو تعليقات على سجل عدم المطابقة...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonConformanceRecord;
