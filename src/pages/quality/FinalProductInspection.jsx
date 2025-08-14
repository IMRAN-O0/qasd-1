import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Eye,
  Thermometer,
  Package2
} from 'lucide-react';

const FinalProductInspectionForm = () => {
  const [formData, setFormData] = useState({
    inspectionNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    productName: '',
    productCode: '',
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    totalQuantity: '',
    sampleSize: '',
    inspectedBy: '',
    supervisedBy: '',
    approvedBy: '',
    overallResult: 'مقبول',
    notes: '',
    physicalTests: [
      {
        id: 1,
        testName: 'الوزن',
        specification: '',
        actualValue: '',
        unit: 'جرام',
        result: 'مطابق',
        notes: ''
      }
    ],
    chemicalTests: [
      {
        id: 1,
        testName: 'الرطوبة',
        specification: '',
        actualValue: '',
        unit: '%',
        result: 'مطابق',
        notes: ''
      }
    ],
    microbiologicalTests: [
      {
        id: 1,
        testName: 'العد الكلي للبكتيريا',
        specification: '',
        actualValue: '',
        unit: 'CFU/g',
        result: 'مطابق',
        notes: ''
      }
    ],
    sensoryTests: [
      {
        id: 1,
        testName: 'المظهر العام',
        specification: '',
        actualValue: '',
        result: 'مطابق',
        notes: ''
      }
    ],
    packagingTests: [
      {
        id: 1,
        testName: 'سلامة التعبئة',
        specification: '',
        actualValue: '',
        result: 'مطابق',
        notes: ''
      }
    ]
  });

  const [printMode, setPrintMode] = useState(false);

  const testResults = ['مطابق', 'غير مطابق', 'حدي'];
  const overallResults = ['مقبول', 'مرفوض', 'مقبول مع تحفظ'];
  const units = ['جرام', 'كيلو', 'مل', 'لتر', '%', 'درجة مئوية', 'CFU/g', 'mg/kg', 'وحدة/مل'];

  const physicalTestNames = [
    'الوزن',
    'الطول',
    'العرض',
    'السماكة',
    'الكثافة',
    'اللزوجة',
    'درجة الصلابة',
    'نقطة الانصهار'
  ];
  const chemicalTestNames = ['الرطوبة', 'الحموضة', 'الدهون', 'البروتين', 'الكربوهيدرات', 'الملح', 'السكر', 'الرماد'];
  const microTestNames = [
    'العد الكلي للبكتيريا',
    'الخمائر والعفن',
    'البكتيريا المرضية',
    'السالمونيلا',
    'الإشريكية القولونية',
    'المكورات العنقودية'
  ];
  const sensoryTestNames = ['المظهر العام', 'اللون', 'الرائحة', 'الطعم', 'القوام', 'الملمس'];
  const packagingTestNames = [
    'سلامة التعبئة',
    'إحكام الغلق',
    'البيانات التوضيحية',
    'تاريخ الصلاحية',
    'وزن المحتوى',
    'شكل العبوة الخارجي'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestChange = (category, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map((test, i) => (i === index ? { ...test, [field]: value } : test))
    }));
  };

  const addTest = category => {
    setFormData(prev => ({
      ...prev,
      [category]: [
        ...prev[category],
        {
          id: prev[category].length + 1,
          testName: '',
          specification: '',
          actualValue: '',
          unit: category === 'sensoryTests' || category === 'packagingTests' ? '' : 'جرام',
          result: 'مطابق',
          notes: ''
        }
      ]
    }));
  };

  const removeTest = (category, index) => {
    if (formData[category].length > 1) {
      setFormData(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    }
  };

  const getResultColor = result => {
    switch (result) {
      case 'مطابق':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'غير مطابق':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'حدي':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'مقبول':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'مرفوض':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'مقبول مع تحفظ':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getResultIcon = result => {
    switch (result) {
      case 'مطابق':
      case 'مقبول':
        return CheckCircle;
      case 'غير مطابق':
      case 'مرفوض':
        return XCircle;
      case 'حدي':
      case 'مقبول مع تحفظ':
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const calculateTestSummary = () => {
    const allTests = [
      ...formData.physicalTests,
      ...formData.chemicalTests,
      ...formData.microbiologicalTests,
      ...formData.sensoryTests,
      ...formData.packagingTests
    ];

    const totalTests = allTests.length;
    const passedTests = allTests.filter(test => test.result === 'مطابق').length;
    const failedTests = allTests.filter(test => test.result === 'غير مطابق').length;
    const borderlineTests = allTests.filter(test => test.result === 'حدي').length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      borderlineTests,
      passRate
    };
  };

  const saveData = () => {
    const jsonData = JSON.stringify({ ...formData, testSummary: calculateTestSummary() }, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `final_inspection_${formData.inspectionNumber || 'new'}.json`;
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
          {/* Header */}
          <div className='text-center border-b-2 border-gray-800 pb-4 mb-6'>
            <h1 className='text-2xl font-bold mb-2'>تقرير فحص المنتج النهائي</h1>
            <div className='text-sm'>
              <span>رقم التقرير: {formData.inspectionNumber}</span>
              <span className='mx-4'>التاريخ: {formData.date}</span>
              <span>الوقت: {formData.time}</span>
            </div>
          </div>

          {/* Product Info */}
          <div className='grid grid-cols-2 gap-4 mb-6 text-sm'>
            <div>
              <strong>بيانات المنتج:</strong>
              <div>اسم المنتج: {formData.productName}</div>
              <div>كود المنتج: {formData.productCode}</div>
              <div>رقم الدفعة: {formData.batchNumber}</div>
              <div>تاريخ الإنتاج: {formData.productionDate}</div>
            </div>
            <div>
              <strong>بيانات الفحص:</strong>
              <div>الكمية الإجمالية: {formData.totalQuantity}</div>
              <div>حجم العينة: {formData.sampleSize}</div>
              <div>النتيجة العامة: {formData.overallResult}</div>
              <div>معدل النجاح: {summary.passRate}%</div>
            </div>
          </div>

          {/* Physical Tests */}
          {formData.physicalTests.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2'>الفحوصات الفيزيائية:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>الفحص</th>
                    <th className='border border-gray-800 p-1'>المواصفة</th>
                    <th className='border border-gray-800 p-1'>القيمة الفعلية</th>
                    <th className='border border-gray-800 p-1'>الوحدة</th>
                    <th className='border border-gray-800 p-1'>النتيجة</th>
                    <th className='border border-gray-800 p-1'>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.physicalTests.map((test, index) => (
                    <tr key={test.id}>
                      <td className='border border-gray-800 p-1'>{test.testName}</td>
                      <td className='border border-gray-800 p-1'>{test.specification}</td>
                      <td className='border border-gray-800 p-1'>{test.actualValue}</td>
                      <td className='border border-gray-800 p-1'>{test.unit}</td>
                      <td className='border border-gray-800 p-1'>{test.result}</td>
                      <td className='border border-gray-800 p-1'>{test.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Chemical Tests */}
          {formData.chemicalTests.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2'>الفحوصات الكيميائية:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>الفحص</th>
                    <th className='border border-gray-800 p-1'>المواصفة</th>
                    <th className='border border-gray-800 p-1'>القيمة الفعلية</th>
                    <th className='border border-gray-800 p-1'>الوحدة</th>
                    <th className='border border-gray-800 p-1'>النتيجة</th>
                    <th className='border border-gray-800 p-1'>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.chemicalTests.map((test, index) => (
                    <tr key={test.id}>
                      <td className='border border-gray-800 p-1'>{test.testName}</td>
                      <td className='border border-gray-800 p-1'>{test.specification}</td>
                      <td className='border border-gray-800 p-1'>{test.actualValue}</td>
                      <td className='border border-gray-800 p-1'>{test.unit}</td>
                      <td className='border border-gray-800 p-1'>{test.result}</td>
                      <td className='border border-gray-800 p-1'>{test.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Microbiological Tests */}
          {formData.microbiologicalTests.length > 0 && (
            <div className='mb-6'>
              <h3 className='font-bold mb-2'>الفحوصات الميكروبيولوجية:</h3>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='border border-gray-800 p-1'>الفحص</th>
                    <th className='border border-gray-800 p-1'>المواصفة</th>
                    <th className='border border-gray-800 p-1'>القيمة الفعلية</th>
                    <th className='border border-gray-800 p-1'>الوحدة</th>
                    <th className='border border-gray-800 p-1'>النتيجة</th>
                    <th className='border border-gray-800 p-1'>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.microbiologicalTests.map((test, index) => (
                    <tr key={test.id}>
                      <td className='border border-gray-800 p-1'>{test.testName}</td>
                      <td className='border border-gray-800 p-1'>{test.specification}</td>
                      <td className='border border-gray-800 p-1'>{test.actualValue}</td>
                      <td className='border border-gray-800 p-1'>{test.unit}</td>
                      <td className='border border-gray-800 p-1'>{test.result}</td>
                      <td className='border border-gray-800 p-1'>{test.notes}</td>
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
                <div>قام بالفحص</div>
                <div className='font-bold'>{formData.inspectedBy}</div>
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
                <div>الاعتماد</div>
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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Award className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>تقرير فحص المنتج النهائي</h1>
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
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم التقرير</label>
              <input
                type='text'
                value={formData.inspectionNumber}
                onChange={e => handleInputChange('inspectionNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='FPI-2024-001'
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
              <label className='block text-sm font-medium text-gray-700 mb-1'>النتيجة العامة</label>
              <select
                value={formData.overallResult}
                onChange={e => handleInputChange('overallResult', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {overallResults.map(result => (
                  <option key={result} value={result}>
                    {result}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test Summary Cards */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-blue-600'>{summary.totalTests}</div>
            <div className='text-sm text-gray-600'>إجمالي الفحوصات</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-green-600'>{summary.passedTests}</div>
            <div className='text-sm text-gray-600'>مطابقة</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-red-600'>{summary.failedTests}</div>
            <div className='text-sm text-gray-600'>غير مطابقة</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-yellow-600'>{summary.borderlineTests}</div>
            <div className='text-sm text-gray-600'>حدية</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-md text-center'>
            <div className='text-2xl font-bold text-purple-600'>{summary.passRate}%</div>
            <div className='text-sm text-gray-600'>معدل النجاح</div>
          </div>
        </div>

        {/* Product Information */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>معلومات المنتج</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>اسم المنتج</label>
              <input
                type='text'
                value={formData.productName}
                onChange={e => handleInputChange('productName', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='بسكويت الشوفان'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>كود المنتج</label>
              <input
                type='text'
                value={formData.productCode}
                onChange={e => handleInputChange('productCode', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='PROD-2024-001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم الدفعة</label>
              <input
                type='text'
                value={formData.batchNumber}
                onChange={e => handleInputChange('batchNumber', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='B2024001'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الإنتاج</label>
              <input
                type='date'
                value={formData.productionDate}
                onChange={e => handleInputChange('productionDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ انتهاء الصلاحية</label>
              <input
                type='date'
                value={formData.expiryDate}
                onChange={e => handleInputChange('expiryDate', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>الكمية الإجمالية</label>
              <input
                type='text'
                value={formData.totalQuantity}
                onChange={e => handleInputChange('totalQuantity', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='1000 كرتون'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>حجم العينة</label>
              <input
                type='text'
                value={formData.sampleSize}
                onChange={e => handleInputChange('sampleSize', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='10 عبوات'
              />
            </div>
          </div>
        </div>

        {/* Staff Information */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>فريق الفحص</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>قام بالفحص</label>
              <input
                type='text'
                value={formData.inspectedBy}
                onChange={e => handleInputChange('inspectedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم فني الجودة'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الإشراف بواسطة</label>
              <input
                type='text'
                value={formData.supervisedBy}
                onChange={e => handleInputChange('supervisedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم مشرف الجودة'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>تم الاعتماد بواسطة</label>
              <input
                type='text'
                value={formData.approvedBy}
                onChange={e => handleInputChange('approvedBy', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='اسم مدير الجودة'
              />
            </div>
          </div>
        </div>

        {/* Physical Tests */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Thermometer className='text-orange-600' size={20} />
              الفحوصات الفيزيائية
            </h2>
            <button
              onClick={() => addTest('physicalTests')}
              className='flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors'
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
                    اسم الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القيمة الفعلية
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوحدة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
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
                {formData.physicalTests.map((test, index) => {
                  const ResultIcon = getResultIcon(test.result);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.testName}
                          onChange={e => handleTestChange('physicalTests', index, 'testName', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value=''>اختر الفحص</option>
                          {physicalTestNames.map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e => handleTestChange('physicalTests', index, 'specification', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='إغلاق جيد'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.actualValue}
                          onChange={e => handleTestChange('physicalTests', index, 'actualValue', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='100 ± 5'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.unit}
                          onChange={e => handleTestChange('physicalTests', index, 'unit', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
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
                            value={test.result}
                            onChange={e => handleTestChange('physicalTests', index, 'result', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(test.result)}`}
                          >
                            {testResults.map(result => (
                              <option key={result} value={result}>
                                {result}
                              </option>
                            ))}
                          </select>
                          <ResultIcon
                            size={16}
                            className={
                              test.result === 'مطابق'
                                ? 'text-green-600'
                                : test.result === 'غير مطابق'
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
                          onChange={e => handleTestChange('physicalTests', index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest('physicalTests', index)}
                          disabled={formData.physicalTests.length === 1}
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

        {/* Chemical Tests */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <span className='text-green-600'>⚗️</span>
              الفحوصات الكيميائية
            </h2>
            <button
              onClick={() => addTest('chemicalTests')}
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
                    اسم الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القيمة الفعلية
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوحدة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
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
                {formData.chemicalTests.map((test, index) => {
                  const ResultIcon = getResultIcon(test.result);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.testName}
                          onChange={e => handleTestChange('chemicalTests', index, 'testName', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value=''>اختر الفحص</option>
                          {chemicalTestNames.map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e => handleTestChange('chemicalTests', index, 'specification', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='< 5%'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.actualValue}
                          onChange={e => handleTestChange('chemicalTests', index, 'actualValue', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='4.2'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.unit}
                          onChange={e => handleTestChange('chemicalTests', index, 'unit', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
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
                            value={test.result}
                            onChange={e => handleTestChange('chemicalTests', index, 'result', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(test.result)}`}
                          >
                            {testResults.map(result => (
                              <option key={result} value={result}>
                                {result}
                              </option>
                            ))}
                          </select>
                          <ResultIcon
                            size={16}
                            className={
                              test.result === 'مطابق'
                                ? 'text-green-600'
                                : test.result === 'غير مطابق'
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
                          onChange={e => handleTestChange('chemicalTests', index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest('chemicalTests', index)}
                          disabled={formData.chemicalTests.length === 1}
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

        {/* Microbiological Tests */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <span className='text-purple-600'>🦠</span>
              الفحوصات الميكروبيولوجية
            </h2>
            <button
              onClick={() => addTest('microbiologicalTests')}
              className='flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
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
                    اسم الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    القيمة الفعلية
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوحدة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
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
                {formData.microbiologicalTests.map((test, index) => {
                  const ResultIcon = getResultIcon(test.result);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.testName}
                          onChange={e => handleTestChange('microbiologicalTests', index, 'testName', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value=''>اختر الفحص</option>
                          {microTestNames.map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e =>
                            handleTestChange('microbiologicalTests', index, 'specification', e.target.value)
                          }
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='< 1000'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.actualValue}
                          onChange={e => handleTestChange('microbiologicalTests', index, 'actualValue', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='150'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.unit}
                          onChange={e => handleTestChange('microbiologicalTests', index, 'unit', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
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
                            value={test.result}
                            onChange={e => handleTestChange('microbiologicalTests', index, 'result', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(test.result)}`}
                          >
                            {testResults.map(result => (
                              <option key={result} value={result}>
                                {result}
                              </option>
                            ))}
                          </select>
                          <ResultIcon
                            size={16}
                            className={
                              test.result === 'مطابق'
                                ? 'text-green-600'
                                : test.result === 'غير مطابق'
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
                          onChange={e => handleTestChange('microbiologicalTests', index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest('microbiologicalTests', index)}
                          disabled={formData.microbiologicalTests.length === 1}
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

        {/* Sensory Tests */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Eye className='text-pink-600' size={20} />
              الفحوصات الحسية
            </h2>
            <button
              onClick={() => addTest('sensoryTests')}
              className='flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors'
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
                    اسم الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوصف الفعلي
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
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
                {formData.sensoryTests.map((test, index) => {
                  const ResultIcon = getResultIcon(test.result);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.testName}
                          onChange={e => handleTestChange('sensoryTests', index, 'testName', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value=''>اختر الفحص</option>
                          {sensoryTestNames.map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e => handleTestChange('sensoryTests', index, 'specification', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='لون ذهبي مميز'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.actualValue}
                          onChange={e => handleTestChange('sensoryTests', index, 'actualValue', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='لون ذهبي طبيعي'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <select
                            value={test.result}
                            onChange={e => handleTestChange('sensoryTests', index, 'result', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(test.result)}`}
                          >
                            {testResults.map(result => (
                              <option key={result} value={result}>
                                {result}
                              </option>
                            ))}
                          </select>
                          <ResultIcon
                            size={16}
                            className={
                              test.result === 'مطابق'
                                ? 'text-green-600'
                                : test.result === 'غير مطابق'
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
                          onChange={e => handleTestChange('sensoryTests', index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest('sensoryTests', index)}
                          disabled={formData.sensoryTests.length === 1}
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

        {/* Packaging Tests */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Package2 className='text-indigo-600' size={20} />
              فحوصات التعبئة والتغليف
            </h2>
            <button
              onClick={() => addTest('packagingTests')}
              className='flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors'
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
                    اسم الفحص
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    المواصفة
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    الوصف الفعلي
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider'>
                    النتيجة
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
                {formData.packagingTests.map((test, index) => {
                  const ResultIcon = getResultIcon(test.result);
                  return (
                    <tr key={test.id} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-sm text-gray-900 text-center'>{index + 1}</td>
                      <td className='px-3 py-2'>
                        <select
                          value={test.testName}
                          onChange={e => handleTestChange('packagingTests', index, 'testName', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value=''>اختر الفحص</option>
                          {packagingTestNames.map(name => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.specification}
                          onChange={e => handleTestChange('packagingTests', index, 'specification', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='محكم الإغلاق'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          value={test.actualValue}
                          onChange={e => handleTestChange('packagingTests', index, 'actualValue', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='تاريخ الإنتاج 100 ± 5'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <div className='flex items-center gap-2'>
                          <select
                            value={test.result}
                            onChange={e => handleTestChange('packagingTests', index, 'result', e.target.value)}
                            className={`flex-1 border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getResultColor(test.result)}`}
                          >
                            {testResults.map(result => (
                              <option key={result} value={result}>
                                {result}
                              </option>
                            ))}
                          </select>
                          <ResultIcon
                            size={16}
                            className={
                              test.result === 'مطابق'
                                ? 'text-green-600'
                                : test.result === 'غير مطابق'
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
                          onChange={e => handleTestChange('packagingTests', index, 'notes', e.target.value)}
                          className='w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent'
                          placeholder='ملاحظات'
                        />
                      </td>
                      <td className='px-3 py-2 text-center'>
                        <button
                          onClick={() => removeTest('packagingTests', index)}
                          disabled={formData.packagingTests.length === 1}
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

        {/* Notes */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>ملاحظات عامة</label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              rows={4}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='أي ملاحظات عامة حول فحص المنتج النهائي، التوصيات، أو الإجراءات التصحيحية المطلوبة...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalProductInspectionForm;
