import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  FileText,
  Download,
  Wrench
} from 'lucide-react';

const SafetyEquipmentInspection = () => {
  const [formData, setFormData] = useState({
    recordNumber: 'SEI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    department: '',
    shift: 'morning',
    equipmentItems: [
      {
        id: 1,
        category: 'معدات الحماية الشخصية',
        equipment: 'خوذات الأمان',
        location: '',
        condition: '',
        lastMaintenance: '',
        nextMaintenance: '',
        status: 'pending',
        notes: ''
      }
    ],
    overallStatus: 'pending',
    correctiveActions: '',
    inspectorSignature: '',
    supervisorApproval: '',
    followUpDate: ''
  });

  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const equipmentCategories = [
    'معدات الحماية الشخصية',
    'أنظمة إطفاء الحريق',
    'معدات الطوارئ',
    'أنظمة التهوية',
    'معدات الإسعافات الأولية',
    'أجهزة قياس السلامة',
    'معدات التعامل مع المواد',
    'أنظمة الأمان الكهربائي'
  ];

  const commonEquipment = {
    'معدات الحماية الشخصية': ['خوذات الأمان', 'نظارات الحماية', 'قفازات السلامة', 'أحذية السلامة', 'سترات عاكسة'],
    'أنظمة إطفاء الحريق': ['طفايات الحريق', 'رشاشات المياه', 'صنادل الرمل', 'بطانيات الحريق'],
    'معدات الطوارئ': ['مخارج الطوارئ', 'إنذار الحريق', 'صفارات الإنذار', 'أضواء الطوارئ'],
    'أنظمة التهوية': ['مراوح الشفط', 'فلاتر الهواء', 'أنظمة التكييف', 'مجاري التهوية'],
    'معدات الإسعافات الأولية': ['صناديق الإسعاف', 'أجهزة غسيل العيون', 'نقالات', 'أقنعة الأكسجين'],
    'أجهزة قياس السلامة': ['كاشفات الغاز', 'مقاييس الإشعاع', 'أجهزة قياس الضوضاء', 'مقاييس الحرارة'],
    'معدات التعامل مع المواد': ['روافع آمنة', 'حاويات المواد الخطرة', 'أنظمة النقل الآمن'],
    'أنظمة الأمان الكهربائي': ['قواطع الأمان', 'أجهزة الحماية من التسرب', 'مولدات الطوارئ']
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEquipmentChange = (index, field, value) => {
    const updatedItems = [...formData.equipmentItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      equipmentItems: updatedItems
    }));
  };

  const addEquipmentItem = () => {
    const newItem = {
      id: Date.now(),
      category: 'معدات الحماية الشخصية',
      equipment: '',
      location: '',
      condition: '',
      lastMaintenance: '',
      nextMaintenance: '',
      status: 'pending',
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      equipmentItems: [...prev.equipmentItems, newItem]
    }));
  };

  const removeEquipmentItem = index => {
    if (formData.equipmentItems.length > 1) {
      const updatedItems = formData.equipmentItems.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        equipmentItems: updatedItems
      }));
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'pass':
        return <CheckCircle className='w-4 h-4' />;
      case 'fail':
        return <XCircle className='w-4 h-4' />;
      case 'warning':
        return <AlertTriangle className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const calculateOverallStatus = () => {
    const statuses = formData.equipmentItems.map(item => item.status);
    if (statuses.includes('fail')) {
      return 'fail';
    }
    if (statuses.includes('warning')) {
      return 'warning';
    }
    if (statuses.every(s => s === 'pass')) {
      return 'pass';
    }
    return 'pending';
  };

  const generateReport = () => {
    const overallStatus = calculateOverallStatus();
    const passCount = formData.equipmentItems.filter(item => item.status === 'pass').length;
    const warningCount = formData.equipmentItems.filter(item => item.status === 'warning').length;
    const failCount = formData.equipmentItems.filter(item => item.status === 'fail').length;

    return {
      ...formData,
      overallStatus,
      summary: {
        total: formData.equipmentItems.length,
        pass: passCount,
        warning: warningCount,
        fail: failCount
      }
    };
  };

  const PrintPreview = () => {
    const report = generateReport();

    return (
      <div className='max-w-4xl mx-auto bg-white p-8 shadow-lg' dir='rtl'>
        {/* Header */}
        <div className='border-b-2 border-blue-600 pb-4 mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-blue-800 mb-2'>سجل فحص معدات السلامة</h1>
              <p className='text-sm text-gray-600'>Safety Equipment Inspection Record</p>
            </div>
            <div className='text-left'>
              <div className='text-lg font-bold text-blue-600'>رقم السجل: {report.recordNumber}</div>
              <div className='text-sm text-gray-600'>ISO 45001:2018</div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className='grid grid-cols-2 gap-6 mb-6'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-blue-600' />
              <span className='font-semibold'>تاريخ الفحص:</span>
              <span>{new Date(report.inspectionDate).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-blue-600' />
              <span className='font-semibold'>المفتش:</span>
              <span>{report.inspector || '_________________'}</span>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Shield className='w-4 h-4 text-blue-600' />
              <span className='font-semibold'>القسم:</span>
              <span>{report.department || '_________________'}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-blue-600' />
              <span className='font-semibold'>الوردية:</span>
              <span>{report.shift === 'morning' ? 'صباحية' : report.shift === 'evening' ? 'مسائية' : 'ليلية'}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className='bg-gray-50 p-4 rounded-lg mb-6'>
          <h3 className='font-bold text-lg mb-3'>ملخص الفحص</h3>
          <div className='grid grid-cols-4 gap-4 text-center'>
            <div className='bg-blue-100 p-3 rounded'>
              <div className='text-2xl font-bold text-blue-600'>{report.summary.total}</div>
              <div className='text-sm text-blue-800'>إجمالي المعدات</div>
            </div>
            <div className='bg-green-100 p-3 rounded'>
              <div className='text-2xl font-bold text-green-600'>{report.summary.pass}</div>
              <div className='text-sm text-green-800'>مطابق</div>
            </div>
            <div className='bg-yellow-100 p-3 rounded'>
              <div className='text-2xl font-bold text-yellow-600'>{report.summary.warning}</div>
              <div className='text-sm text-yellow-800'>تحذير</div>
            </div>
            <div className='bg-red-100 p-3 rounded'>
              <div className='text-2xl font-bold text-red-600'>{report.summary.fail}</div>
              <div className='text-sm text-red-800'>غير مطابق</div>
            </div>
          </div>
        </div>

        {/* Equipment Details */}
        <div className='mb-6'>
          <h3 className='font-bold text-lg mb-4'>تفاصيل المعدات</h3>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-gray-300 text-sm'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 p-2'>الفئة</th>
                  <th className='border border-gray-300 p-2'>المعدة</th>
                  <th className='border border-gray-300 p-2'>الموقع</th>
                  <th className='border border-gray-300 p-2'>الحالة</th>
                  <th className='border border-gray-300 p-2'>آخر صيانة</th>
                  <th className='border border-gray-300 p-2'>الصيانة التالية</th>
                  <th className='border border-gray-300 p-2'>الحالة</th>
                  <th className='border border-gray-300 p-2'>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {report.equipmentItems.map((item, index) => (
                  <tr key={index}>
                    <td className='border border-gray-300 p-2'>{item.category}</td>
                    <td className='border border-gray-300 p-2'>{item.equipment}</td>
                    <td className='border border-gray-300 p-2'>{item.location}</td>
                    <td className='border border-gray-300 p-2'>{item.condition}</td>
                    <td className='border border-gray-300 p-2'>{item.lastMaintenance}</td>
                    <td className='border border-gray-300 p-2'>{item.nextMaintenance}</td>
                    <td className={`border border-gray-300 p-2 ${getStatusColor(item.status)}`}>
                      <div className='flex items-center gap-1 justify-center'>
                        {getStatusIcon(item.status)}
                        <span className='text-xs'>
                          {item.status === 'pass'
                            ? 'مطابق'
                            : item.status === 'fail'
                              ? 'غير مطابق'
                              : item.status === 'warning'
                                ? 'تحذير'
                                : 'معلق'}
                        </span>
                      </div>
                    </td>
                    <td className='border border-gray-300 p-2 text-xs'>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corrective Actions */}
        {report.correctiveActions && (
          <div className='mb-6'>
            <h3 className='font-bold text-lg mb-3'>الإجراءات التصحيحية المطلوبة</h3>
            <div className='bg-yellow-50 border border-yellow-200 p-4 rounded'>
              <p className='whitespace-pre-wrap'>{report.correctiveActions}</p>
            </div>
          </div>
        )}

        {/* Overall Status */}
        <div className={`p-4 rounded-lg mb-6 ${getStatusColor(report.overallStatus)}`}>
          <div className='flex items-center gap-2 justify-center'>
            {getStatusIcon(report.overallStatus)}
            <span className='font-bold text-lg'>
              الحالة العامة:{' '}
              {report.overallStatus === 'pass'
                ? 'جميع المعدات مطابقة'
                : report.overallStatus === 'warning'
                  ? 'تتطلب متابعة'
                  : report.overallStatus === 'fail'
                    ? 'تتطلب إجراءات فورية'
                    : 'قيد المراجعة'}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className='grid grid-cols-2 gap-8 mt-8'>
          <div className='text-center'>
            <div className='border-t border-gray-400 pt-2'>
              <p className='font-semibold'>المفتش</p>
              <p className='text-sm text-gray-600'>Inspector</p>
              <p className='mt-2 text-sm'>التاريخ: _______________</p>
            </div>
          </div>
          <div className='text-center'>
            <div className='border-t border-gray-400 pt-2'>
              <p className='font-semibold'>مشرف السلامة</p>
              <p className='text-sm text-gray-600'>Safety Supervisor</p>
              <p className='mt-2 text-sm'>التاريخ: _______________</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500'>
          <p>هذا المستند يتوافق مع متطلبات ISO 45001:2018 - أنظمة إدارة السلامة والصحة المهنية</p>
          <p>Safety Equipment Inspection Record - Compliant with ISO 45001:2018</p>
        </div>
      </div>
    );
  };

  if (showPrintPreview) {
    return (
      <div className='min-h-screen bg-gray-100 py-8'>
        <div className='max-w-4xl mx-auto mb-6'>
          <button
            onClick={() => setShowPrintPreview(false)}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2'
          >
            ← العودة للنموذج
          </button>
        </div>
        <PrintPreview />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-6 bg-white' dir='rtl'>
      {/* Header */}
      <div className='border-b-2 border-blue-600 pb-4 mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <Shield className='w-8 h-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-blue-800'>سجل فحص معدات السلامة</h1>
        </div>
        <p className='text-gray-600'>Safety Equipment Inspection Record - ISO 45001:2018</p>
      </div>

      {/* Basic Information */}
      <div className='bg-gray-50 p-6 rounded-lg mb-6'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <FileText className='w-5 h-5' />
          المعلومات الأساسية
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>رقم السجل</label>
            <input
              type='text'
              value={formData.recordNumber}
              onChange={e => handleInputChange('recordNumber', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>تاريخ الفحص</label>
            <input
              type='date'
              value={formData.inspectionDate}
              onChange={e => handleInputChange('inspectionDate', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>المفتش</label>
            <input
              type='text'
              value={formData.inspector}
              onChange={e => handleInputChange('inspector', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
              placeholder='اسم المفتش'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>القسم</label>
            <input
              type='text'
              value={formData.department}
              onChange={e => handleInputChange('department', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
              placeholder='اسم القسم'
            />
          </div>
        </div>

        <div className='mt-4'>
          <label className='block text-sm font-semibold text-gray-700 mb-1'>الوردية</label>
          <select
            value={formData.shift}
            onChange={e => handleInputChange('shift', e.target.value)}
            className='w-full md:w-48 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
          >
            <option value='morning'>صباحية</option>
            <option value='evening'>مسائية</option>
            <option value='night'>ليلية</option>
          </select>
        </div>
      </div>

      {/* Equipment Items */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <Wrench className='w-5 h-5' />
            معدات السلامة
          </h2>
          <button
            onClick={addEquipmentItem}
            className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2'
          >
            + إضافة معدة
          </button>
        </div>

        <div className='space-y-4'>
          {formData.equipmentItems.map((item, index) => (
            <div key={item.id} className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-lg'>معدة السلامة #{index + 1}</h3>
                {formData.equipmentItems.length > 1 && (
                  <button
                    onClick={() => removeEquipmentItem(index)}
                    className='text-red-600 hover:bg-red-50 p-1 rounded'
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>فئة المعدة</label>
                  <select
                    value={item.category}
                    onChange={e => handleEquipmentChange(index, 'category', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  >
                    {equipmentCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>نوع المعدة</label>
                  <select
                    value={item.equipment}
                    onChange={e => handleEquipmentChange(index, 'equipment', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>اختر المعدة</option>
                    {commonEquipment[item.category]?.map(equip => (
                      <option key={equip} value={equip}>
                        {equip}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>الموقع</label>
                  <input
                    type='text'
                    value={item.location}
                    onChange={e => handleEquipmentChange(index, 'location', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                    placeholder='موقع المعدة'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>حالة المعدة</label>
                  <select
                    value={item.condition}
                    onChange={e => handleEquipmentChange(index, 'condition', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  >
                    <option value=''>اختر الحالة</option>
                    <option value='excellent'>ممتازة</option>
                    <option value='good'>جيدة</option>
                    <option value='fair'>متوسطة</option>
                    <option value='poor'>ضعيفة</option>
                    <option value='damaged'>تالفة</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>آخر صيانة</label>
                  <input
                    type='date'
                    value={item.lastMaintenance}
                    onChange={e => handleEquipmentChange(index, 'lastMaintenance', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>الصيانة التالية</label>
                  <input
                    type='date'
                    value={item.nextMaintenance}
                    onChange={e => handleEquipmentChange(index, 'nextMaintenance', e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>حالة الفحص</label>
                  <select
                    value={item.status}
                    onChange={e => handleEquipmentChange(index, 'status', e.target.value)}
                    className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${getStatusColor(item.status)}`}
                  >
                    <option value='pending'>معلق</option>
                    <option value='pass'>مطابق</option>
                    <option value='warning'>تحذير</option>
                    <option value='fail'>غير مطابق</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>ملاحظات</label>
                <textarea
                  value={item.notes}
                  onChange={e => handleEquipmentChange(index, 'notes', e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  rows={2}
                  placeholder='أي ملاحظات أو توصيات...'
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrective Actions */}
      <div className='bg-yellow-50 p-6 rounded-lg mb-6'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <AlertTriangle className='w-5 h-5 text-yellow-600' />
          الإجراءات التصحيحية المطلوبة
        </h2>
        <textarea
          value={formData.correctiveActions}
          onChange={e => handleInputChange('correctiveActions', e.target.value)}
          className='w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
          rows={4}
          placeholder='اذكر الإجراءات التصحيحية المطلوبة إن وجدت...'
        />
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4 justify-center'>
        <button
          onClick={() => setShowPrintPreview(true)}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2'
        >
          <FileText className='w-5 h-5' />
          معاينة التقرير
        </button>

        <button
          onClick={() => {
            const report = generateReport();
            const dataStr = JSON.stringify(report, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `safety-equipment-inspection-${report.recordNumber}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
          className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2'
        >
          <Download className='w-5 h-5' />
          تصدير البيانات
        </button>
      </div>

      {/* Status Summary */}
      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='font-bold mb-2'>ملخص سريع:</h3>
        <div className='text-sm text-gray-600'>
          إجمالي المعدات: {formData.equipmentItems.length} | مطابقة:{' '}
          {formData.equipmentItems.filter(item => item.status === 'pass').length} | تحذير:{' '}
          {formData.equipmentItems.filter(item => item.status === 'warning').length} | غير مطابقة:{' '}
          {formData.equipmentItems.filter(item => item.status === 'fail').length}
        </div>
      </div>
    </div>
  );
};

export default SafetyEquipmentInspection;
