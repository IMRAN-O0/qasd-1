import React, { useState } from 'react';
import { Plus, Trash2, Save, Download, Target, TrendingUp, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

const CorrectiveActionReport = () => {
  const [formData, setFormData] = useState({
    carNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    relatedNCNumber: '',
    initiatedBy: '',
    department: '',
    priority: 'متوسط',
    status: 'مفتوح',
    problemDescription: '',
    rootCauseAnalysis: '',
    methodology: '5 Whys',
    targetDate: '',
    actualDate: '',
    responsiblePerson: '',
    verifiedBy: '',
    approvedBy: '',
    effectiveness: 'غير محدد',
    notes: '',
    actions: [
      {
        id: 1,
        actionDescription: '',
        responsible: '',
        targetDate: '',
        actualDate: '',
        status: 'مخطط',
        evidence: '',
        resources: '',
        notes: ''
      }
    ],
    verification: [
      {
        id: 1,
        verificationMethod: '',
        criteria: '',
        result: '',
        date: '',
        verifiedBy: '',
        notes: ''
      }
    ],
    followUp: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        findings: '',
        effectiveness: 'فعال',
        nextAction: '',
        responsible: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const priorities = ['منخفض', 'متوسط', 'عالي', 'عاجل'];
  const statuses = ['مفتوح', 'في التنفيذ', 'مكتمل', 'تحت التحقق', 'مغلق', 'مؤجل'];
  const departments = ['الإنتاج', 'الجودة', 'المستودع', 'الصيانة', 'المبيعات', 'الموارد البشرية', 'الإدارة'];
  const methodologies = ['5 Whys', 'Fishbone', 'Fault Tree Analysis', 'FMEA', 'Pareto Analysis', 'Root Cause Tree'];
  const actionStatuses = ['مخطط', 'في التنفيذ', 'مكتمل', 'متأخر', 'ملغي'];
  const effectivenessLevels = ['غير محدد', 'فعال', 'فعال جزئياً', 'غير فعال', 'يحتاج مراجعة'];
  const verificationMethods = ['مراجعة الوثائق', 'الفحص المباشر', 'المقابلات', 'القياسات', 'الاختبارات', 'المراقبة'];

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
      case 'actions':
        newItem = {
          id: formData[category].length + 1,
          actionDescription: '',
          responsible: '',
          targetDate: '',
          actualDate: '',
          status: 'مخطط',
          evidence: '',
          resources: '',
          notes: ''
        };
        break;
      case 'verification':
        newItem = {
          id: formData[category].length + 1,
          verificationMethod: '',
          criteria: '',
          result: '',
          date: '',
          verifiedBy: '',
          notes: ''
        };
        break;
      case 'followUp':
        newItem = {
          id: formData[category].length + 1,
          date: new Date().toISOString().split('T')[0],
          findings: '',
          effectiveness: 'فعال',
          nextAction: '',
          responsible: ''
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

  const getPriorityColor = priority => {
    switch (priority) {
      case 'منخفض':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'متوسط':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'عالي':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'عاجل':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'مفتوح':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'في التنفيذ':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'مكتمل':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'تحت التحقق':
        return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'مغلق':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'مؤجل':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'مخطط':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'متأخر':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'ملغي':
        return 'text-gray-700 bg-gray-200 border-gray-400';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getEffectivenessColor = effectiveness => {
    switch (effectiveness) {
      case 'فعال':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'فعال جزئياً':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'غير فعال':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'يحتاج مراجعة':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const calculateProgress = () => {
    const totalActions = formData.actions.length;
    const completedActions = formData.actions.filter(action => action.status === 'مكتمل').length;
    return totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  };

  const calculateDaysOpen = () => {
    const today = new Date();
    const startDate = new Date(formData.date);
    const diffTime = today - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const saveData = () => {
    const jsonData = JSON.stringify(
      {
        ...formData,
        progress: calculateProgress(),
        daysOpen: calculateDaysOpen()
      },
      null,
      2
    );
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corrective_action_${formData.carNumber || 'new'}.json`;
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
            <h1 className='text-2xl font-bold mb-2'>تقرير إجراءات تصحيحية</h1>
            <div className='text-sm'>
              <span>رقم التقرير: {formData.carNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>الحالة: {formData.status}</span>
              <span className='mx-4'>الأولوية: {formData.priority}</span>
            </div>
          </div>

          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>بيانات التقرير:</strong>
              <div>رقم عدم المطابقة المرتبط: {formData.relatedNCNumber}</div>
              <div>المُبادِر: {formData.initiatedBy}</div>
              <div>القسم: {formData.department}</div>
              <div>المسؤول: {formData.responsiblePerson}</div>
            </div>
            <div>
              <strong>بيانات التنفيذ:</strong>
              <div>التاريخ المستهدف: {formData.targetDate}</div>
              <div>التاريخ الفعلي: {formData.actualDate}</div>
              <div>الفعالية: {formData.effectiveness}</div>
              <div>نسبة الإنجاز: {calculateProgress()}%</div>
            </div>
          </div>

          {/* Problem Description */}
          <div className='mb-6 text-sm'>
            <strong>وصف المشكلة:</strong>
            <div className='border border-gray-800 p-2 mt-1'>{formData.problemDescription}</div>
          </div>

          {/* Root Cause Analysis */}
          <div className='mb-6 text-sm'>
            <strong>تحليل السبب الجذري ({formData.methodology}):</strong>
            <div className='border border-gray-800 p-2 mt-1'>{formData.rootCauseAnalysis}</div>
          </div>

          {/* Actions Table */}
          {formData.actions.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2 text-sm'>خطة الإجراءات التصحيحية:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>#</th>
                    <th className='border border-gray-800 p-1'>وصف الإجراء</th>
                    <th className='border border-gray-800 p-1'>المسؤول</th>
                    <th className='border border-gray-800 p-1'>التاريخ المستهدف</th>
                    <th className='border border-gray-800 p-1'>التاريخ الفعلي</th>
                    <th className='border border-gray-800 p-1'>الحالة</th>
                    <th className='border border-gray-800 p-1'>الأدلة</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.actions.map((action, index) => (
                    <tr key={action.id}>
                      <td className='border border-gray-800 p-1 text-center'>{index + 1}</td>
                      <td className='border border-gray-800 p-1'>{action.actionDescription}</td>
                      <td className='border border-gray-800 p-1'>{action.responsible}</td>
                      <td className='border border-gray-800 p-1'>{action.targetDate}</td>
                      <td className='border border-gray-800 p-1'>{action.actualDate}</td>
                      <td className='border border-gray-800 p-1'>{action.status}</td>
                      <td className='border border-gray-800 p-1'>{action.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Verification Table */}
          {formData.verification.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2 text-sm'>التحقق من الفعالية:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>طريقة التحقق</th>
                    <th className='border border-gray-800 p-1'>المعايير</th>
                    <th className='border border-gray-800 p-1'>النتيجة</th>
                    <th className='border border-gray-800 p-1'>التاريخ</th>
                    <th className='border border-gray-800 p-1'>المحقق</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.verification.map((item, index) => (
                    <tr key={item.id}>
                      <td className='border border-gray-800 p-1'>{item.verificationMethod}</td>
                      <td className='border border-gray-800 p-1'>{item.criteria}</td>
                      <td className='border border-gray-800 p-1'>{item.result}</td>
                      <td className='border border-gray-800 p-1'>{item.date}</td>
                      <td className='border border-gray-800 p-1'>{item.verifiedBy}</td>
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
                <div>المسؤول عن التنفيذ</div>
                <div className='font-bold'>{formData.responsiblePerson}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>تم التحقق بواسطة</div>
                <div className='font-bold'>{formData.verifiedBy}</div>
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Target className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>تقرير إجراءات تصحيحية</h1>
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم التقرير</label>
              <input
                type='text'
                value={formData.carNumber}
                onChange={e => handleInputChange('carNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='CAR-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ</label>
              <input
                type='date'
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الوقت</label>
              <input
                type='time'
                value={formData.time}
                onChange={e => handleInputChange('time', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم عدم المطابقة</label>
              <input
                type='text'
                value={formData.relatedNCNumber}
                onChange={e => handleInputChange('relatedNCNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='NC-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الأولوية</label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(formData.priority)}`}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الحالة</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(formData.status)}`}
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

        {/* Status Dashboard */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <TrendingUp className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{calculateProgress()}%</div>
            <div className='text-sm text-gray-600'>نسبة الإنجاز</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Clock className='text-orange-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-orange-600'>{calculateDaysOpen()}</div>
            <div className='text-sm text-gray-600'>أيام مفتوح</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <CheckCircle className='text-green-600 mx-auto mb-2' size={24} />
            <div className={`text-lg font-bold px-2 py-1 rounded ${getStatusColor(formData.status)}`}>
              {formData.status}
            </div>
            <div className='text-sm text-gray-600'>حالة التقرير</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <AlertCircle className='text-red-600 mx-auto mb-2' size={24} />
            <div className={`text-lg font-bold px-2 py-1 rounded ${getPriorityColor(formData.priority)}`}>
              {formData.priority}
            </div>
            <div className='text-sm text-gray-600'>مستوى الأولوية</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Target className='text-purple-600 mx-auto mb-2' size={24} />
            <div className={`text-lg font-bold px-2 py-1 rounded ${getEffectivenessColor(formData.effectiveness)}`}>
              {formData.effectiveness}
            </div>
            <div className='text-sm text-gray-600'>الفعالية</div>
          </div>
        </div>

        {/* Initiator Information */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <Users className='text-indigo-600' size={20} />
            معلومات المُبادِر والمسؤولية
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>المُبادِر</label>
              <input
                type='text'
                value={formData.initiatedBy}
                onChange={e => handleInputChange('initiatedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم مُبادِر التقرير'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>القسم</label>
              <select
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>المسؤول عن التنفيذ</label>
              <input
                type='text'
                value={formData.responsiblePerson}
                onChange={e => handleInputChange('responsiblePerson', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم المسؤول'
              />
            </div>
          </div>
        </div>

        {/* Problem Description and Analysis */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>وصف المشكلة وتحليل السبب الجذري</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>وصف المشكلة</label>
              <textarea
                value={formData.problemDescription}
                onChange={e => handleInputChange('problemDescription', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='وصف تفصيلي للمشكلة التي تتطلب إجراءات تصحيحية...'
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='md:col-span-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>منهجية التحليل</label>
                <select
                  value={formData.methodology}
                  onChange={e => handleInputChange('methodology', e.target.value)}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  {methodologies.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <div className='md:col-span-3'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>تحليل السبب الجذري</label>
                <textarea
                  value={formData.rootCauseAnalysis}
                  onChange={e => handleInputChange('rootCauseAnalysis', e.target.value)}
                  rows={3}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='تحليل مفصل للأسباب الجذرية باستخدام المنهجية المحددة...'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline and Effectiveness */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الجدول الزمني والفعالية</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ المستهدف للإنجاز</label>
              <input
                type='date'
                value={formData.targetDate}
                onChange={e => handleInputChange('targetDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>التاريخ الفعلي للإنجاز</label>
              <input
                type='date'
                value={formData.actualDate}
                onChange={e => handleInputChange('actualDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تقييم الفعالية</label>
              <select
                value={formData.effectiveness}
                onChange={e => handleInputChange('effectiveness', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getEffectivenessColor(formData.effectiveness)}`}
              >
                {effectivenessLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Corrective Actions */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>خطة الإجراءات التصحيحية</h2>
            <button
              onClick={() => addItem('actions')}
              className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
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
                    وصف الإجراء
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المسؤول
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التاريخ المستهدف
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التاريخ الفعلي
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الحالة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الأدلة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الموارد المطلوبة
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
                {formData.actions.map((action, index) => (
                  <tr key={action.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={action.actionDescription}
                        onChange={e => handleItemChange('actions', index, 'actionDescription', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='وصف الإجراء التصحيحي'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={action.responsible}
                        onChange={e => handleItemChange('actions', index, 'responsible', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='اسم المسؤول'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={action.targetDate}
                        onChange={e => handleItemChange('actions', index, 'targetDate', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={action.actualDate}
                        onChange={e => handleItemChange('actions', index, 'actualDate', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={action.status}
                        onChange={e => handleItemChange('actions', index, 'status', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getStatusColor(action.status)}`}
                      >
                        {actionStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={action.evidence}
                        onChange={e => handleItemChange('actions', index, 'evidence', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='أدلة التنفيذ'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={action.resources}
                        onChange={e => handleItemChange('actions', index, 'resources', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='الموارد'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={action.notes}
                        onChange={e => handleItemChange('actions', index, 'notes', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='ملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('actions', index)}
                        disabled={formData.actions.length === 1}
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

        {/* Verification Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <CheckCircle className='text-purple-600' size={20} />
              التحقق من الفعالية
            </h2>
            <button
              onClick={() => addItem('verification')}
              className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
            >
              <Plus size={16} />
              إضافة تحقق
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    طريقة التحقق
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    معايير النجاح
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التاريخ
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المحقق
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
                {formData.verification.map((item, index) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <select
                        value={item.verificationMethod}
                        onChange={e => handleItemChange('verification', index, 'verificationMethod', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value=''>اختر الطريقة</option>
                        {verificationMethods.map(method => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={item.criteria}
                        onChange={e => handleItemChange('verification', index, 'criteria', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='معايير النجاح'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={item.result}
                        onChange={e => handleItemChange('verification', index, 'result', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='نتيجة التحقق'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={item.date}
                        onChange={e => handleItemChange('verification', index, 'date', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.verifiedBy}
                        onChange={e => handleItemChange('verification', index, 'verifiedBy', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='اسم المحقق'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.notes}
                        onChange={e => handleItemChange('verification', index, 'notes', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='ملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('verification', index)}
                        disabled={formData.verification.length === 1}
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

        {/* Follow-up Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <TrendingUp className='text-orange-600' size={20} />
              متابعة الفعالية طويلة المدى
            </h2>
            <button
              onClick={() => addItem('followUp')}
              className='flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'
            >
              <Plus size={16} />
              إضافة متابعة
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    تاريخ المراجعة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتائج والملاحظات
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    تقييم الفعالية
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الإجراء التالي
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المسؤول
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
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={item.findings}
                        onChange={e => handleItemChange('followUp', index, 'findings', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='النتائج والملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={item.effectiveness}
                        onChange={e => handleItemChange('followUp', index, 'effectiveness', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getEffectivenessColor(item.effectiveness)}`}
                      >
                        {effectivenessLevels
                          .filter(level => level !== 'غير محدد')
                          .map(level => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <textarea
                        value={item.nextAction}
                        onChange={e => handleItemChange('followUp', index, 'nextAction', e.target.value)}
                        rows={2}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='الإجراء التالي المطلوب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={item.responsible}
                        onChange={e => handleItemChange('followUp', index, 'responsible', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='اسم المسؤول'
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
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>التحقق والاعتماد</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم التحقق بواسطة</label>
              <input
                type='text'
                value={formData.verifiedBy}
                onChange={e => handleInputChange('verifiedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم المحقق'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الاعتماد بواسطة</label>
              <input
                type='text'
                value={formData.approvedBy}
                onChange={e => handleInputChange('approvedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='أي ملاحظات عامة حول تنفيذ الإجراءات التصحيحية، التحديات المواجهة، أو التوصيات للمستقبل...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectiveActionReport;
