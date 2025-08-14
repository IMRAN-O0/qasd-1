import React, { useState } from 'react';
import { Plus, Trash2, Save, Download, AlertTriangle, Clock, User, Shield, FileText, Eye } from 'lucide-react';

const IncidentReport = () => {
  const [formData, setFormData] = useState({
    incidentNumber: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportTime: new Date().toTimeString().slice(0, 5),
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    reportedBy: '',
    department: '',
    location: '',
    incidentType: 'إصابة عمل',
    severity: 'متوسط',
    status: 'مفتوح',
    description: '',
    immediateActions: '',
    rootCause: '',
    correctiveActions: '',
    preventiveActions: '',
    investigatedBy: '',
    supervisedBy: '',
    approvedBy: '',
    targetDate: '',
    actualDate: '',
    notes: '',
    witnesses: [
      {
        id: 1,
        witnessName: '',
        jobTitle: '',
        department: '',
        contactInfo: '',
        statement: ''
      }
    ],
    injuries: [
      {
        id: 1,
        personName: '',
        jobTitle: '',
        department: '',
        injuryType: '',
        bodyPart: '',
        severity: 'طفيف',
        medicalTreatment: '',
        hospitalName: '',
        doctorName: ''
      }
    ],
    damages: [
      {
        id: 1,
        itemType: 'معدات',
        itemName: '',
        damageDescription: '',
        estimatedCost: '',
        repairStatus: 'قيد التقييم'
      }
    ],
    followUp: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        action: '',
        responsible: '',
        status: 'مخطط',
        notes: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const incidentTypes = [
    'إصابة عمل',
    'يكاد أن يحدث',
    'ضرر في الممتلكات',
    'انسكاب مواد',
    'حريق',
    'انقطاع كهرباء',
    'عطل معدات',
    'حادث مروري',
    'أخرى'
  ];
  const severityLevels = ['طفيف', 'متوسط', 'شديد', 'خطير جداً'];
  const departments = ['الإنتاج', 'الجودة', 'المستودع', 'الصيانة', 'الإدارة', 'الأمن', 'النقل', 'المختبر'];
  const statuses = ['مفتوح', 'تحت التحقيق', 'تحت المعالجة', 'مكتمل', 'مغلق'];
  const injuryTypes = ['جرح', 'كسر', 'التواء', 'حرق', 'كدمة', 'إجهاد', 'تسمم', 'حساسية', 'أخرى'];
  const bodyParts = [
    'الرأس',
    'العين',
    'الوجه',
    'الرقبة',
    'الكتف',
    'الذراع',
    'اليد',
    'الأصابع',
    'الصدر',
    'الظهر',
    'البطن',
    'الساق',
    'القدم',
    'أخرى'
  ];
  const damageTypes = ['معدات', 'مباني', 'مركبات', 'مواد خام', 'منتجات', 'أثاث', 'أجهزة كمبيوتر', 'أخرى'];
  const repairStatuses = ['قيد التقييم', 'قيد الإصلاح', 'مُصلح', 'غير قابل للإصلاح', 'مُستبدل'];
  const actionStatuses = ['مخطط', 'في التنفيذ', 'مكتمل', 'متأخر', 'ملغي'];

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
    let newItem;
    switch (category) {
      case 'witnesses':
        newItem = {
          id: formData[category].length + 1,
          witnessName: '',
          jobTitle: '',
          department: '',
          contactInfo: '',
          statement: ''
        };
        break;
      case 'injuries':
        newItem = {
          id: formData[category].length + 1,
          personName: '',
          jobTitle: '',
          department: '',
          injuryType: '',
          bodyPart: '',
          severity: 'طفيف',
          medicalTreatment: '',
          hospitalName: '',
          doctorName: ''
        };
        break;
      case 'damages':
        newItem = {
          id: formData[category].length + 1,
          itemType: 'معدات',
          itemName: '',
          damageDescription: '',
          estimatedCost: '',
          repairStatus: 'قيد التقييم'
        };
        break;
      case 'followUp':
        newItem = {
          id: formData[category].length + 1,
          date: new Date().toISOString().split('T')[0],
          action: '',
          responsible: '',
          status: 'مخطط',
          notes: ''
        };
        break;
      default:
        newItem = {};
    }

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
      case 'طفيف':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'متوسط':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'شديد':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'خطير جداً':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'مفتوح':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'تحت التحقيق':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'تحت المعالجة':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'مكتمل':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'مغلق':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'مخطط':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'في التنفيذ':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'متأخر':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'ملغي':
        return 'text-gray-700 bg-gray-200 border-gray-400';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const calculateDaysOpen = () => {
    const today = new Date();
    const incidentDate = new Date(formData.incidentDate);
    const diffTime = today - incidentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateSummary = () => {
    const totalInjuries = formData.injuries.length;
    const totalWitnesses = formData.witnesses.length;
    const totalDamages = formData.damages.length;
    const estimatedTotalCost = formData.damages.reduce(
      (sum, damage) => sum + (parseFloat(damage.estimatedCost) || 0),
      0
    );
    const completedActions = formData.followUp.filter(action => action.status === 'مكتمل').length;
    const totalActions = formData.followUp.length;

    return {
      totalInjuries,
      totalWitnesses,
      totalDamages,
      estimatedTotalCost: estimatedTotalCost.toFixed(2),
      completedActions,
      totalActions,
      actionProgress: totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0
    };
  };

  const saveData = () => {
    const jsonData = JSON.stringify(
      {
        ...formData,
        summary: calculateSummary(),
        daysOpen: calculateDaysOpen()
      },
      null,
      2
    );
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_report_${formData.incidentNumber || 'new'}.json`;
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

  const summary = calculateSummary();

  if (printMode) {
    return (
      <div className='print-container'>
        <h1 className='text-2xl font-bold text-gray-800'>تقرير حادث</h1>
        <div className='border border-gray-300 p-4'>
          <p>
            <strong>رقم التقرير:</strong> {formData.incidentNumber}
          </p>
          <p>
            <strong>تاريخ التقرير:</strong> {formData.reportDate}
          </p>
          <p>
            <strong>تاريخ الحادث:</strong> {formData.incidentDate}
          </p>
          <p>
            <strong>وقت الحادث:</strong> {formData.incidentTime}
          </p>
          <p>
            <strong>نوع الحادث:</strong> {formData.incidentType}
          </p>
          <p>
            <strong>مستوى الخطورة:</strong> {formData.severity}
          </p>
          <p>
            <strong>وصف الحادث:</strong> {formData.description}
          </p>
          <p>
            <strong>الإجراءات الفورية:</strong> {formData.immediateActions}
          </p>
          <p>
            <strong>السبب الجذري:</strong> {formData.rootCause}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <AlertTriangle className='text-red-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>تقرير حادث</h1>
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

          <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم التقرير</label>
              <input
                type='text'
                value={formData.incidentNumber}
                onChange={e => handleInputChange('incidentNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='INC-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ التقرير</label>
              <input
                type='date'
                value={formData.reportDate}
                onChange={e => handleInputChange('reportDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الحادث</label>
              <input
                type='date'
                value={formData.incidentDate}
                onChange={e => handleInputChange('incidentDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>وقت الحادث</label>
              <input
                type='time'
                value={formData.incidentTime}
                onChange={e => handleInputChange('incidentTime', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>نوع الحادث</label>
              <select
                value={formData.incidentType}
                onChange={e => handleInputChange('incidentType', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              >
                {incidentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>مستوى الخطورة</label>
              <select
                value={formData.severity}
                onChange={e => handleInputChange('severity', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent ${getSeverityColor(formData.severity)}`}
              >
                {severityLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-6 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Clock className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{calculateDaysOpen()}</div>
            <div className='text-sm text-gray-600'>أيام الفتح</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <User className='text-green-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-green-600'>{summary.totalInjuries}</div>
            <div className='text-sm text-gray-600'>إصابات</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Eye className='text-purple-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-purple-600'>{summary.totalWitnesses}</div>
            <div className='text-sm text-gray-600'>شهود</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <FileText className='text-orange-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-orange-600'>{summary.totalDamages}</div>
            <div className='text-sm text-gray-600'>أضرار</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-lg font-bold text-red-600'>{summary.estimatedTotalCost}</div>
            <div className='text-sm text-gray-600'>تكلفة مقدرة (ريال)</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className={`text-lg font-bold px-2 py-1 rounded ${getStatusColor(formData.status)}`}>
              {formData.status}
            </div>
            <div className='text-sm text-gray-600'>حالة التقرير</div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات أساسية</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الموقع</label>
              <input
                type='text'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='الموقع التفصيلي للحادث'
              />
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

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>وصف الحادث والإجراءات</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>وصف تفصيلي للحادث</label>
              <textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={4}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='وصف شامل ومفصل لما حدث...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الإجراءات الفورية المتخذة</label>
              <textarea
                value={formData.immediateActions}
                onChange={e => handleInputChange('immediateActions', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='الإجراءات الفورية التي تم اتخاذها لمعالجة الحادث...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>السبب الجذري</label>
              <textarea
                value={formData.rootCause}
                onChange={e => handleInputChange('rootCause', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='تحليل السبب الجذري للحادث...'
              />
            </div>
          </div>
        </div>

        {/* Injuries Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <User className='text-red-600' size={20} />
              الإصابات
            </h2>
            <button
              onClick={() => addItem('injuries')}
              className='flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
            >
              <Plus size={16} />
              إضافة إصابة
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    اسم المصاب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المنصب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القسم
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    نوع الإصابة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    العضو المصاب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الخطورة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    العلاج
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {formData.injuries.map((injury, index) => (
                  <tr key={injury.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={injury.personName}
                        onChange={e => handleItemChange('injuries', index, 'personName', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='اسم المصاب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={injury.jobTitle}
                        onChange={e => handleItemChange('injuries', index, 'jobTitle', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='المنصب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={injury.department}
                        onChange={e => handleItemChange('injuries', index, 'department', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        <option value=''>اختر القسم</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={injury.injuryType}
                        onChange={e => handleItemChange('injuries', index, 'injuryType', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        <option value=''>اختر النوع</option>
                        {injuryTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={injury.bodyPart}
                        onChange={e => handleItemChange('injuries', index, 'bodyPart', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        <option value=''>اختر العضو</option>
                        {bodyParts.map(part => (
                          <option key={part} value={part}>
                            {part}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={injury.severity}
                        onChange={e => handleItemChange('injuries', index, 'severity', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent ${getSeverityColor(injury.severity)}`}
                      >
                        {severityLevels.map(level => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={injury.medicalTreatment}
                        onChange={e => handleItemChange('injuries', index, 'medicalTreatment', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='العلاج المقدم'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('injuries', index)}
                        disabled={formData.injuries.length === 1}
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

        {/* Damages Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Shield className='text-orange-600' size={20} />
              الأضرار في الممتلكات
            </h2>
            <button
              onClick={() => addItem('damages')}
              className='flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'
            >
              <Plus size={16} />
              إضافة ضرر
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
                    وصف الضرر
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التكلفة المقدرة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حالة الإصلاح
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {formData.damages.map((damage, index) => (
                  <tr key={damage.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <select
                        value={damage.itemType}
                        onChange={e => handleItemChange('damages', index, 'itemType', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        {damageTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={damage.itemName}
                        onChange={e => handleItemChange('damages', index, 'itemName', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='اسم العنصر المتضرر'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={damage.damageDescription}
                        onChange={e => handleItemChange('damages', index, 'damageDescription', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='وصف الضرر'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='number'
                        step='0.01'
                        value={damage.estimatedCost}
                        onChange={e => handleItemChange('damages', index, 'estimatedCost', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='0.00'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={damage.repairStatus}
                        onChange={e => handleItemChange('damages', index, 'repairStatus', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent ${getStatusColor(damage.repairStatus)}`}
                      >
                        {repairStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('damages', index)}
                        disabled={formData.damages.length === 1}
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

        {/* Witnesses Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Eye className='text-purple-600' size={20} />
              الشهود
            </h2>
            <button
              onClick={() => addItem('witnesses')}
              className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
            >
              <Plus size={16} />
              إضافة شاهد
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    اسم الشاهد
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المنصب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القسم
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    معلومات الاتصال
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الشهادة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {formData.witnesses.map((witness, index) => (
                  <tr key={witness.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={witness.witnessName}
                        onChange={e => handleItemChange('witnesses', index, 'witnessName', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='اسم الشاهد'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={witness.jobTitle}
                        onChange={e => handleItemChange('witnesses', index, 'jobTitle', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='المنصب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={witness.department}
                        onChange={e => handleItemChange('witnesses', index, 'department', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                      >
                        <option value=''>اختر القسم</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={witness.contactInfo}
                        onChange={e => handleItemChange('witnesses', index, 'contactInfo', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='رقم الهاتف'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={witness.statement}
                        onChange={e => handleItemChange('witnesses', index, 'statement', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-red-500 focus:border-transparent'
                        placeholder='شهادة الشاهد'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('witnesses', index)}
                        disabled={formData.witnesses.length === 1}
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

        {/* Investigation Team */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>فريق التحقيق والاعتماد</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم التحقيق بواسطة</label>
              <input
                type='text'
                value={formData.investigatedBy}
                onChange={e => handleInputChange('investigatedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم المحقق'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الإشراف بواسطة</label>
              <input
                type='text'
                value={formData.supervisedBy}
                onChange={e => handleInputChange('supervisedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                placeholder='اسم المشرف'
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
              rows={4}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              placeholder='أي ملاحظات إضافية حول الحادث، الدروس المستفادة، أو التوصيات...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;
