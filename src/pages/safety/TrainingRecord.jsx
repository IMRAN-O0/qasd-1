import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  GraduationCap,
  Users,
  Calendar,
  Award,
  BookOpen,
  CheckCircle
} from 'lucide-react';

const EmployeeTrainingRecord = () => {
  const [formData, setFormData] = useState({
    recordNumber: '',
    date: new Date().toISOString().split('T')[0],
    trainingType: 'برنامج تدريبي',
    trainingTitle: '',
    trainingCode: '',
    startDate: '',
    endDate: '',
    duration: '',
    location: '',
    trainerName: '',
    trainerQualification: '',
    department: '',
    trainingObjectives: '',
    trainingContent: '',
    evaluationMethod: 'امتحان كتابي',
    passingScore: '70',
    certificateIssued: 'نعم',
    validityPeriod: '12',
    preparedBy: '',
    approvedBy: '',
    notes: '',
    attendees: [
      {
        id: 1,
        employeeId: '',
        employeeName: '',
        jobTitle: '',
        department: '',
        attendanceStatus: 'حضر',
        score: '',
        result: 'ناجح',
        certificateNumber: '',
        certificateDate: '',
        notes: ''
      }
    ],
    sessions: [
      {
        id: 1,
        sessionNumber: 1,
        sessionDate: '',
        sessionTime: '',
        topic: '',
        duration: '',
        trainer: '',
        attendeesCount: '',
        notes: ''
      }
    ],
    evaluations: [
      {
        id: 1,
        evaluationCriteria: 'الحضور والمشاركة',
        weight: '20',
        maxScore: '100',
        description: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const trainingTypes = [
    'برنامج تدريبي',
    'ورشة عمل',
    'ندوة',
    'محاضرة',
    'تدريب عملي',
    'تدريب إلكتروني',
    'تدريب خارجي',
    'تأهيل جديد'
  ];
  const departments = [
    'الإنتاج',
    'الجودة',
    'المستودع',
    'الصيانة',
    'الإدارة',
    'الأمن',
    'النقل',
    'المختبر',
    'الموارد البشرية'
  ];
  const attendanceStatuses = ['حضر', 'غاب', 'حضر جزئياً', 'انسحب'];
  const results = ['ناجح', 'راسب', 'يحتاج إعادة', 'لم يختبر'];
  const evaluationMethods = ['امتحان كتابي', 'امتحان شفهي', 'امتحان عملي', 'مشروع', 'تقييم مستمر', 'حضور فقط'];
  const certificateOptions = ['نعم', 'لا', 'معلق'];

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
      case 'attendees':
        newItem = {
          id: formData[category].length + 1,
          employeeId: '',
          employeeName: '',
          jobTitle: '',
          department: '',
          attendanceStatus: 'حضر',
          score: '',
          result: 'ناجح',
          certificateNumber: '',
          certificateDate: '',
          notes: ''
        };
        break;
      case 'sessions':
        newItem = {
          id: formData[category].length + 1,
          sessionNumber: formData[category].length + 1,
          sessionDate: '',
          sessionTime: '',
          topic: '',
          duration: '',
          trainer: '',
          attendeesCount: '',
          notes: ''
        };
        break;
      case 'evaluations':
        newItem = {
          id: formData[category].length + 1,
          evaluationCriteria: '',
          weight: '',
          maxScore: '100',
          description: ''
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

  const getAttendanceColor = status => {
    switch (status) {
      case 'حضر':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'غاب':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'حضر جزئياً':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'انسحب':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getResultColor = result => {
    switch (result) {
      case 'ناجح':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'راسب':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'يحتاج إعادة':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'لم يختبر':
        return 'text-gray-700 bg-gray-100 border-gray-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const calculateTrainingStats = () => {
    const totalAttendees = formData.attendees.length;
    const attendedCount = formData.attendees.filter(att => att.attendanceStatus === 'حضر').length;
    const passedCount = formData.attendees.filter(att => att.result === 'ناجح').length;
    const certificatesIssued = formData.attendees.filter(att => att.certificateNumber).length;

    const attendanceRate = totalAttendees > 0 ? ((attendedCount / totalAttendees) * 100).toFixed(1) : 0;
    const passRate = totalAttendees > 0 ? ((passedCount / totalAttendees) * 100).toFixed(1) : 0;

    const averageScore =
      formData.attendees
        .filter(att => att.score && !isNaN(att.score))
        .reduce((sum, att, _, arr) => {
          if (arr.length === 0) {
            return 0;
          }
          return sum + parseFloat(att.score);
        }, 0) / Math.max(1, formData.attendees.filter(att => att.score && !isNaN(att.score)).length);

    return {
      totalAttendees,
      attendedCount,
      passedCount,
      certificatesIssued,
      attendanceRate,
      passRate,
      averageScore: averageScore.toFixed(1)
    };
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const saveData = () => {
    const jsonData = JSON.stringify(
      {
        ...formData,
        stats: calculateTrainingStats(),
        calculatedDuration: calculateDuration()
      },
      null,
      2
    );
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training_record_${formData.recordNumber || 'new'}.json`;
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

  const stats = calculateTrainingStats();

  if (printMode) {
    return (
      <div className='min-h-screen bg-white p-8 text-black print:p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
            <h1 className='text-2xl font-bold mb-2'>سجل تدريب الموظفين</h1>
            <div className='text-sm'>
              <span>رقم السجل: {formData.recordNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>نوع التدريب: {formData.trainingType}</span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>معلومات التدريب:</strong>
              <div>عنوان التدريب: {formData.trainingTitle}</div>
              <div>كود التدريب: {formData.trainingCode}</div>
              <div>تاريخ البداية: {formData.startDate}</div>
              <div>تاريخ النهاية: {formData.endDate}</div>
              <div>المدة: {formData.duration}</div>
              <div>الموقع: {formData.location}</div>
            </div>
            <div>
              <strong>معلومات المدرب:</strong>
              <div>اسم المدرب: {formData.trainerName}</div>
              <div>المؤهل: {formData.trainerQualification}</div>
              <div>طريقة التقييم: {formData.evaluationMethod}</div>
              <div>درجة النجاح: {formData.passingScore}%</div>
              <div>معدل الحضور: {stats.attendanceRate}%</div>
              <div>معدل النجاح: {stats.passRate}%</div>
            </div>
          </div>

          <div className='mb-6 text-sm'>
            <strong>أهداف التدريب:</strong>
            <div className='border border-gray-800 p-2 mt-1'>{formData.trainingObjectives}</div>
          </div>

          <div className='mb-6'>
            <h3 className='font-bold mb-2 text-sm'>قائمة المتدربين:</h3>
            <table className='w-full border-collapse border border-gray-800 text-xs'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='border border-gray-800 p-1'>#</th>
                  <th className='border border-gray-800 p-1'>رقم الموظف</th>
                  <th className='border border-gray-800 p-1'>الاسم</th>
                  <th className='border border-gray-800 p-1'>المنصب</th>
                  <th className='border border-gray-800 p-1'>القسم</th>
                  <th className='border border-gray-800 p-1'>الحضور</th>
                  <th className='border border-gray-800 p-1'>الدرجة</th>
                  <th className='border border-gray-800 p-1'>النتيجة</th>
                  <th className='border border-gray-800 p-1'>رقم الشهادة</th>
                </tr>
              </thead>
              <tbody>
                {formData.attendees.map((attendee, index) => (
                  <tr key={attendee.id}>
                    <td className='border border-gray-800 p-1 text-center'>{index + 1}</td>
                    <td className='border border-gray-800 p-1'>{attendee.employeeId}</td>
                    <td className='border border-gray-800 p-1'>{attendee.employeeName}</td>
                    <td className='border border-gray-800 p-1'>{attendee.jobTitle}</td>
                    <td className='border border-gray-800 p-1'>{attendee.department}</td>
                    <td className='border border-gray-800 p-1'>{attendee.attendanceStatus}</td>
                    <td className='border border-gray-800 p-1 text-center'>{attendee.score}</td>
                    <td className='border border-gray-800 p-1'>{attendee.result}</td>
                    <td className='border border-gray-800 p-1'>{attendee.certificateNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {formData.sessions.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2 text-sm'>جلسات التدريب:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>الجلسة</th>
                    <th className='border border-gray-800 p-1'>التاريخ</th>
                    <th className='border border-gray-800 p-1'>الوقت</th>
                    <th className='border border-gray-800 p-1'>الموضوع</th>
                    <th className='border border-gray-800 p-1'>المدة</th>
                    <th className='border border-gray-800 p-1'>المدرب</th>
                    <th className='border border-gray-800 p-1'>عدد الحضور</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.sessions.map((session, index) => (
                    <tr key={session.id}>
                      <td className='border border-gray-800 p-1 text-center'>{session.sessionNumber}</td>
                      <td className='border border-gray-800 p-1'>{session.sessionDate}</td>
                      <td className='border border-gray-800 p-1'>{session.sessionTime}</td>
                      <td className='border border-gray-800 p-1'>{session.topic}</td>
                      <td className='border border-gray-800 p-1'>{session.duration}</td>
                      <td className='border border-gray-800 p-1'>{session.trainer}</td>
                      <td className='border border-gray-800 p-1 text-center'>{session.attendeesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className='grid grid-cols-2 gap-8 mt-8 text-sm'>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>أعد التقرير</div>
                <div className='font-bold'>{formData.preparedBy}</div>
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
              <strong>ملاحظات عامة:</strong>
              <div className='border border-gray-800 p-2 mt-2'>{formData.notes}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <GraduationCap className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>سجل تدريب الموظفين</h1>
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم السجل</label>
              <input
                type='text'
                value={formData.recordNumber}
                onChange={e => handleInputChange('recordNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='TR-2024-001'
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>نوع التدريب</label>
              <select
                value={formData.trainingType}
                onChange={e => handleInputChange('trainingType', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {trainingTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ البداية</label>
              <input
                type='date'
                value={formData.startDate}
                onChange={e => handleInputChange('startDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ النهاية</label>
              <input
                type='date'
                value={formData.endDate}
                onChange={e => handleInputChange('endDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>المدة (أيام)</label>
              <input
                type='text'
                value={formData.duration || calculateDuration()}
                onChange={e => handleInputChange('duration', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='المدة بالأيام'
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-6 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Users className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{stats.totalAttendees}</div>
            <div className='text-sm text-gray-600'>إجمالي المتدربين</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <CheckCircle className='text-green-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-green-600'>{stats.attendedCount}</div>
            <div className='text-sm text-gray-600'>حضور</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Award className='text-purple-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-purple-600'>{stats.passedCount}</div>
            <div className='text-sm text-gray-600'>ناجح</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-orange-600'>{stats.attendanceRate}%</div>
            <div className='text-sm text-gray-600'>معدل الحضور</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-red-600'>{stats.passRate}%</div>
            <div className='text-sm text-gray-600'>معدل النجاح</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-yellow-600'>{stats.averageScore}</div>
            <div className='text-sm text-gray-600'>متوسط الدرجات</div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>تفاصيل التدريب</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>عنوان التدريب</label>
              <input
                type='text'
                value={formData.trainingTitle}
                onChange={e => handleInputChange('trainingTitle', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='السلامة المهنية في المصانع الغذائية'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>كود التدريب</label>
              <input
                type='text'
                value={formData.trainingCode}
                onChange={e => handleInputChange('trainingCode', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='TRN-SAFETY-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الموقع</label>
              <input
                type='text'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='قاعة التدريب الرئيسية'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>القسم المستهدف</label>
              <select
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>جميع الأقسام</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>أهداف التدريب</label>
              <textarea
                value={formData.trainingObjectives}
                onChange={e => handleInputChange('trainingObjectives', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='الأهداف الرئيسية للتدريب...'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>محتوى التدريب</label>
              <textarea
                value={formData.trainingContent}
                onChange={e => handleInputChange('trainingContent', e.target.value)}
                rows={3}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='المحتوى التفصيلي للتدريب...'
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات المدرب والتقييم</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اسم المدرب</label>
              <input
                type='text'
                value={formData.trainerName}
                onChange={e => handleInputChange('trainerName', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='د. أحمد محمد'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>مؤهلات المدرب</label>
              <input
                type='text'
                value={formData.trainerQualification}
                onChange={e => handleInputChange('trainerQualification', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='دكتوراه في السلامة المهنية'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>طريقة التقييم</label>
              <select
                value={formData.evaluationMethod}
                onChange={e => handleInputChange('evaluationMethod', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {evaluationMethods.map(method => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>درجة النجاح (%)</label>
              <input
                type='number'
                value={formData.passingScore}
                onChange={e => handleInputChange('passingScore', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='70'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>إصدار شهادة</label>
              <select
                value={formData.certificateIssued}
                onChange={e => handleInputChange('certificateIssued', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {certificateOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>مدة صلاحية الشهادة (شهر)</label>
              <input
                type='number'
                value={formData.validityPeriod}
                onChange={e => handleInputChange('validityPeriod', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='12'
              />
            </div>
          </div>
        </div>

        {/* Attendees Section */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Users className='text-green-600' size={20} />
              قائمة المتدربين
            </h2>
            <button
              onClick={() => addItem('attendees')}
              className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
            >
              <Plus size={16} />
              إضافة متدرب
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    رقم الموظف
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    اسم الموظف
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المنصب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القسم
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الحضور
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الدرجة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    رقم الشهادة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    تاريخ الشهادة
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
                {formData.attendees.map((attendee, index) => (
                  <tr key={attendee.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={attendee.employeeId}
                        onChange={e => handleItemChange('attendees', index, 'employeeId', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='EMP001'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={attendee.employeeName}
                        onChange={e => handleItemChange('attendees', index, 'employeeName', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='اسم الموظف'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={attendee.jobTitle}
                        onChange={e => handleItemChange('attendees', index, 'jobTitle', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='المنصب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={attendee.department}
                        onChange={e => handleItemChange('attendees', index, 'department', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
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
                        value={attendee.attendanceStatus}
                        onChange={e => handleItemChange('attendees', index, 'attendanceStatus', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getAttendanceColor(attendee.attendanceStatus)}`}
                      >
                        {attendanceStatuses.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='number'
                        value={attendee.score}
                        onChange={e => handleItemChange('attendees', index, 'score', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='85'
                        min='0'
                        max='100'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <select
                        value={attendee.result}
                        onChange={e => handleItemChange('attendees', index, 'result', e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(attendee.result)}`}
                      >
                        {results.map(result => (
                          <option key={result} value={result}>
                            {result}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={attendee.certificateNumber}
                        onChange={e => handleItemChange('attendees', index, 'certificateNumber', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='CERT-001'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={attendee.certificateDate}
                        onChange={e => handleItemChange('attendees', index, 'certificateDate', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={attendee.notes}
                        onChange={e => handleItemChange('attendees', index, 'notes', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='ملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('attendees', index)}
                        disabled={formData.attendees.length === 1}
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

        {/* Training Sessions */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Calendar className='text-purple-600' size={20} />
              جلسات التدريب
            </h2>
            <button
              onClick={() => addItem('sessions')}
              className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
            >
              <Plus size={16} />
              إضافة جلسة
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    رقم الجلسة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    التاريخ
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوقت
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الموضوع
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المدة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المدرب
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    عدد الحضور
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
                {formData.sessions.map((session, index) => (
                  <tr key={session.id} className='hover:bg-gray-50'>
                    <td className='px-3 py-2 text-center'>
                      <input
                        type='number'
                        value={session.sessionNumber}
                        onChange={e => handleItemChange('sessions', index, 'sessionNumber', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center'
                        min='1'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='date'
                        value={session.sessionDate}
                        onChange={e => handleItemChange('sessions', index, 'sessionDate', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='time'
                        value={session.sessionTime}
                        onChange={e => handleItemChange('sessions', index, 'sessionTime', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={session.topic}
                        onChange={e => handleItemChange('sessions', index, 'topic', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='موضوع الجلسة'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={session.duration}
                        onChange={e => handleItemChange('sessions', index, 'duration', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='2 ساعة'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={session.trainer}
                        onChange={e => handleItemChange('sessions', index, 'trainer', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='اسم المدرب'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='number'
                        value={session.attendeesCount}
                        onChange={e => handleItemChange('sessions', index, 'attendeesCount', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center'
                        placeholder='15'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        type='text'
                        value={session.notes}
                        onChange={e => handleItemChange('sessions', index, 'notes', e.target.value)}
                        className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        placeholder='ملاحظات'
                      />
                    </td>
                    <td className='px-3 py-2 text-center'>
                      <button
                        onClick={() => removeItem('sessions', index)}
                        disabled={formData.sessions.length === 1}
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
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>الإعداد والاعتماد</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>أعد التقرير</label>
              <input
                type='text'
                value={formData.preparedBy}
                onChange={e => handleInputChange('preparedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم معد التقرير'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اعتمد التقرير</label>
              <input
                type='text'
                value={formData.approvedBy}
                onChange={e => handleInputChange('approvedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم معتمد التقرير'
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
              placeholder='أي ملاحظات عامة حول التدريب، التوصيات، أو خطط التحسين...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTrainingRecord;
