import React, { useState } from 'react';
import { Plus, Trash2, Save, Download, Award, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CertificateOfAnalysis = () => {
  const [formData, setFormData] = useState({
    coaNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    productName: '',
    productCode: '',
    batchNumber: '',
    lotNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    sampleDate: '',
    testDate: '',
    quantity: '',
    customerName: '',
    customerCode: '',
    sampledBy: '',
    analyzedBy: '',
    reviewedBy: '',
    approvedBy: '',
    laboratoryName: 'مختبر ضمان الجودة',
    conclusion: 'مطابق للمواصفات',
    comments: '',
    tests: [
      {
        id: 1,
        parameter: 'المظهر العام',
        method: 'فحص بصري',
        specification: 'مسحوق أبيض ناعم',
        result: 'مسحوق أبيض ناعم',
        unit: '',
        status: 'مطابق',
        notes: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const testStatuses = ['مطابق', 'غير مطابق', 'حدي'];
  const conclusions = ['مطابق للمواصفات', 'غير مطابق للمواصفات', 'مطابق مع تحفظ', 'يحتاج إعادة فحص'];
  const parameters = [
    'المظهر العام',
    'اللون',
    'الرائحة',
    'الطعم',
    'الرطوبة',
    'الحموضة',
    'البروتين',
    'الدهون',
    'العد الكلي للبكتيريا',
    'الخمائر والعفن'
  ];
  const units = ['', '%', 'mg/kg', 'CFU/g', 'درجة مئوية', 'جرام', 'مل'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test))
    }));
  };

  const addTest = () => {
    setFormData(prev => ({
      ...prev,
      tests: [
        ...prev.tests,
        {
          id: prev.tests.length + 1,
          parameter: '',
          method: '',
          specification: '',
          result: '',
          unit: '',
          status: 'مطابق',
          notes: ''
        }
      ]
    }));
  };

  const removeTest = index => {
    if (formData.tests.length > 1) {
      setFormData(prev => ({
        ...prev,
        tests: prev.tests.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'مطابق':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'غير مطابق':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'حدي':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'مطابق':
        return CheckCircle;
      case 'غير مطابق':
        return XCircle;
      case 'حدي':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const getConclusionColor = conclusion => {
    switch (conclusion) {
      case 'مطابق للمواصفات':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'غير مطابق للمواصفات':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'مطابق مع تحفظ':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'يحتاج إعادة فحص':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const calculateTestSummary = () => {
    const totalTests = formData.tests.length;
    const passedTests = formData.tests.filter(test => test.status === 'مطابق').length;
    const failedTests = formData.tests.filter(test => test.status === 'غير مطابق').length;
    const borderlineTests = formData.tests.filter(test => test.status === 'حدي').length;
    const complianceRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      borderlineTests,
      complianceRate
    };
  };

  const saveData = () => {
    const jsonData = JSON.stringify(
      {
        ...formData,
        testSummary: calculateTestSummary(),
        generatedDate: new Date().toISOString()
      },
      null,
      2
    );
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COA_${formData.coaNumber || 'new'}.json`;
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

  const summary = calculateTestSummary();

  if (printMode) {
    return (
      <div className='min-h-screen bg-white p-8 text-black print:p-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
            <div className='flex items-center justify-center gap-3 mb-2'>
              <Award className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold'>شهادة التحليل</h1>
            </div>
            <div className='text-lg font-semibold'>Certificate of Analysis (COA)</div>
            <div className='text-sm mt-2'>
              <span>رقم الشهادة: {formData.coaNumber}</span>
              <span className='mx-4'>تاريخ الإصدار: {formData.issueDate}</span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>معلومات المنتج:</strong>
              <div>اسم المنتج: {formData.productName}</div>
              <div>كود المنتج: {formData.productCode}</div>
              <div>رقم الدفعة: {formData.batchNumber}</div>
              <div>رقم اللوط: {formData.lotNumber}</div>
              <div>تاريخ الإنتاج: {formData.manufacturingDate}</div>
              <div>تاريخ الانتهاء: {formData.expiryDate}</div>
            </div>
            <div>
              <strong>معلومات العينة:</strong>
              <div>تاريخ أخذ العينة: {formData.sampleDate}</div>
              <div>تاريخ التحليل: {formData.testDate}</div>
              <div>الكمية: {formData.quantity}</div>
              <div>العميل: {formData.customerName}</div>
              <div>المختبر: {formData.laboratoryName}</div>
              <div>معدل المطابقة: {summary.complianceRate}%</div>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='font-bold mb-2 text-sm'>نتائج الفحوصات:</h3>
            <table className='w-full border-collapse border border-gray-800 text-xs'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='border border-gray-800 p-1'>المعامل</th>
                  <th className='border border-gray-800 p-1'>طريقة الفحص</th>
                  <th className='border border-gray-800 p-1'>المواصفة</th>
                  <th className='border border-gray-800 p-1'>النتيجة</th>
                  <th className='border border-gray-800 p-1'>الوحدة</th>
                  <th className='border border-gray-800 p-1'>الحالة</th>
                  <th className='border border-gray-800 p-1'>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {formData.tests.map((test, index) => (
                  <tr key={test.id}>
                    <td className='border border-gray-800 p-1'>{test.parameter}</td>
                    <td className='border border-gray-800 p-1'>{test.method}</td>
                    <td className='border border-gray-800 p-1'>{test.specification}</td>
                    <td className='border border-gray-800 p-1'>{test.result}</td>
                    <td className='border border-gray-800 p-1'>{test.unit}</td>
                    <td className='border border-gray-800 p-1'>{test.status}</td>
                    <td className='border border-gray-800 p-1'>{test.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='bg-gray-100 p-4 mb-6 text-sm text-center'>
            <h3 className='font-bold mb-2'>الخلاصة والنتيجة النهائية:</h3>
            <div className='text-lg font-bold'>{formData.conclusion}</div>
            {formData.comments && <div className='mt-2'>{formData.comments}</div>}
          </div>

          <div className='grid grid-cols-4 gap-6 mt-8 text-sm'>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>أخذ العينة</div>
                <div className='font-bold'>{formData.sampledBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>قام بالتحليل</div>
                <div className='font-bold'>{formData.analyzedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>المراجعة</div>
                <div className='font-bold'>{formData.reviewedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
            <div className='text-center'>
              <div className='border-t border-gray-800 pt-2 mt-8'>
                <div>الاعتماد</div>
                <div className='font-bold'>{formData.approvedBy}</div>
                <div>التوقيع: _______________</div>
              </div>
            </div>
          </div>

          <div className='text-center mt-6 text-xs text-gray-600'>
            تم إصدار هذه الشهادة وفقاً لمعايير الجودة المعتمدة ونظام إدارة الجودة ISO 17025
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Award className='text-green-600' size={32} />
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>شهادة التحليل</h1>
                <p className='text-sm text-gray-600'>Certificate of Analysis (COA)</p>
              </div>
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
                طباعة الشهادة
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم الشهادة</label>
              <input
                type='text'
                value={formData.coaNumber}
                onChange={e => handleInputChange('coaNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='COA-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الإصدار</label>
              <input
                type='date'
                value={formData.issueDate}
                onChange={e => handleInputChange('issueDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اسم المختبر</label>
              <input
                type='text'
                value={formData.laboratoryName}
                onChange={e => handleInputChange('laboratoryName', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='مختبر ضمان الجودة'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الخلاصة النهائية</label>
              <select
                value={formData.conclusion}
                onChange={e => handleInputChange('conclusion', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${getConclusionColor(formData.conclusion)}`}
              >
                {conclusions.map(conclusion => (
                  <option key={conclusion} value={conclusion}>
                    {conclusion}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <Shield className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{summary.totalTests}</div>
            <div className='text-sm text-gray-600'>إجمالي الفحوصات</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <CheckCircle className='text-green-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-green-600'>{summary.passedTests}</div>
            <div className='text-sm text-gray-600'>مطابقة</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <XCircle className='text-red-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-red-600'>{summary.failedTests}</div>
            <div className='text-sm text-gray-600'>غير مطابقة</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <AlertTriangle className='text-yellow-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-yellow-600'>{summary.borderlineTests}</div>
            <div className='text-sm text-gray-600'>حدية</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-purple-600'>{summary.complianceRate}%</div>
            <div className='text-sm text-gray-600'>معدل المطابقة</div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات المنتج والعينة</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اسم المنتج</label>
              <input
                type='text'
                value={formData.productName}
                onChange={e => handleInputChange('productName', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='مسحوق الحليب المجفف'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>كود المنتج</label>
              <input
                type='text'
                value={formData.productCode}
                onChange={e => handleInputChange('productCode', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='PROD-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم الدفعة</label>
              <input
                type='text'
                value={formData.batchNumber}
                onChange={e => handleInputChange('batchNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='B2024001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم اللوط</label>
              <input
                type='text'
                value={formData.lotNumber}
                onChange={e => handleInputChange('lotNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='LOT-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الإنتاج</label>
              <input
                type='date'
                value={formData.manufacturingDate}
                onChange={e => handleInputChange('manufacturingDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الانتهاء</label>
              <input
                type='date'
                value={formData.expiryDate}
                onChange={e => handleInputChange('expiryDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ أخذ العينة</label>
              <input
                type='date'
                value={formData.sampleDate}
                onChange={e => handleInputChange('sampleDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ التحليل</label>
              <input
                type='date'
                value={formData.testDate}
                onChange={e => handleInputChange('testDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الكمية</label>
              <input
                type='text'
                value={formData.quantity}
                onChange={e => handleInputChange('quantity', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='1000 كيلو'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اسم العميل</label>
              <input
                type='text'
                value={formData.customerName}
                onChange={e => handleInputChange('customerName', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='شركة الألبان المحدودة'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>كود العميل</label>
              <input
                type='text'
                value={formData.customerCode}
                onChange={e => handleInputChange('customerCode', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='CUST-001'
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>فريق المختبر</h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>أخذ العينة</label>
              <input
                type='text'
                value={formData.sampledBy}
                onChange={e => handleInputChange('sampledBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='اسم أخذ العينة'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>قام بالتحليل</label>
              <input
                type='text'
                value={formData.analyzedBy}
                onChange={e => handleInputChange('analyzedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='اسم المحلل'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>المراجعة</label>
              <input
                type='text'
                value={formData.reviewedBy}
                onChange={e => handleInputChange('reviewedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='اسم المراجع'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الاعتماد</label>
              <input
                type='text'
                value={formData.approvedBy}
                onChange={e => handleInputChange('approvedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                placeholder='اسم المعتمد'
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>نتائج الفحوصات</h2>
            <button
              onClick={addTest}
              className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
            >
              <Plus size={16} />
              إضافة فحص
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-max'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>#</th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المعامل
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    طريقة الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوحدة
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
                {formData.tests.map((test, index) => {
                  const StatusIcon = getStatusIcon(test.status);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.parameter}
                          onChange={e => handleTestChange(index, 'parameter', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                        >
                          <option value=''>اختر المعامل</option>
                          {parameters.map(param => (
                            <option key={param} value={param}>
                              {param}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.method}
                          onChange={e => handleTestChange(index, 'method', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          placeholder='طريقة الفحص'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e => handleTestChange(index, 'specification', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          placeholder='المواصفة المطلوبة'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.result}
                          onChange={e => handleTestChange(index, 'result', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          placeholder='النتيجة الفعلية'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.unit}
                          onChange={e => handleTestChange(index, 'unit', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <select
                            value={test.status}
                            onChange={e => handleTestChange(index, 'status', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent ${getStatusColor(test.status)}`}
                          >
                            {testStatuses.map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <StatusIcon
                            size={16}
                            className={
                              test.status === 'مطابق'
                                ? 'text-green-600'
                                : test.status === 'غير مطابق'
                                  ? 'text-red-600'
                                  : 'text-yellow-600'
                            }
                          />
                        </div>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.notes}
                          onChange={e => handleTestChange(index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest(index)}
                          disabled={formData.tests.length === 1}
                          className='text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed'
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>التعليقات النهائية</h2>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>التعليقات والملاحظات</label>
            <textarea
              value={formData.comments}
              onChange={e => handleInputChange('comments', e.target.value)}
              rows={3}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent'
              placeholder='أي تعليقات إضافية، قيود على النتائج، أو توصيات...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateOfAnalysis;
