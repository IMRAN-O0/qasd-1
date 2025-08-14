import React, { useState, useEffect } from 'react';
import Select from '../components/common/Select';
import {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  UNITS,
  MATERIAL_CATEGORIES,
  ORDER_STATUS,
  ORDER_PRIORITIES,
  QUALITY_STATUS
} from '../constants';

/**
 * مثال شامل لاستخدام مكون Select المحسن
 * يوضح كيفية حل مشكلة عدم ظهور الخيارات في القوائم المنسدلة
 */
const SelectExample = () => {
  // حالات النموذج
  const [formData, setFormData] = useState({
    customerType: '',
    customerStatus: '',
    unit: '',
    materialCategory: '',
    orderStatus: '',
    orderPriority: '',
    qualityStatus: ''
  });

  // حالة التحميل
  const [isLoading, setIsLoading] = useState(true);

  // بيانات العملاء الديناميكية (محاكاة API)
  const [customers, setCustomers] = useState([]);

  // محاكاة تحميل البيانات من API
  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);

      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // بيانات العملاء المحاكاة
      const mockCustomers = [
        { value: 'cust_001', label: 'شركة الأهرام للصناعات الغذائية', code: 'AHR001', type: 'مؤسسي' },
        { value: 'cust_002', label: 'مؤسسة النيل التجارية', code: 'NIL002', type: 'تجاري' },
        { value: 'cust_003', label: 'شركة الفجر للاستيراد والتصدير', code: 'FAJ003', type: 'استيراد وتصدير' },
        { value: 'cust_004', label: 'مصنع الشروق للمواد الكيميائية', code: 'SHR004', type: 'مؤسسي' },
        { value: 'cust_005', label: 'شركة البدر للتوزيع', code: 'BAD005', type: 'موزع' }
      ];

      setCustomers(mockCustomers);
      setIsLoading(false);
    };

    loadCustomers();
  }, []);

  // معالج تغيير القيم
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    console.log(`تم تحديث ${field}:`, value);
  };

  // معالج إرسال النموذج
  const handleSubmit = e => {
    e.preventDefault();
    console.log('بيانات النموذج:', formData);
    alert('تم حفظ البيانات بنجاح!');
  };

  // معالج إعادة تعيين النموذج
  const handleReset = () => {
    setFormData({
      customerType: '',
      customerStatus: '',
      unit: '',
      materialCategory: '',
      orderStatus: '',
      orderPriority: '',
      qualityStatus: ''
    });
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg' dir='rtl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>مثال شامل لمكون Select المحسن</h1>
        <p className='text-gray-600'>
          يوضح هذا المثال كيفية استخدام مكون Select مع أنواع مختلفة من البيانات وحل مشكلة عدم ظهور الخيارات
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* قسم بيانات العملاء */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>بيانات العملاء</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>نوع العميل</label>
              <Select
                options={CUSTOMER_TYPES}
                value={formData.customerType}
                onChange={value => handleChange('customerType', value)}
                placeholder='اختر نوع العميل'
                searchable
                clearable
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>حالة العميل</label>
              <Select
                options={CUSTOMER_STATUS}
                value={formData.customerStatus}
                onChange={value => handleChange('customerStatus', value)}
                placeholder='اختر حالة العميل'
                searchable
                clearable
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                العملاء المتاحون (بيانات ديناميكية)
              </label>
              <Select
                options={customers}
                value={formData.selectedCustomer}
                onChange={value => handleChange('selectedCustomer', value)}
                placeholder={isLoading ? 'جاري تحميل العملاء...' : 'اختر عميل'}
                searchable
                clearable
                loading={isLoading}
                disabled={isLoading}
                renderOption={option => (
                  <div className='flex justify-between items-center'>
                    <div>
                      <div className='font-medium'>{option.label}</div>
                      <div className='text-sm text-gray-500'>
                        كود: {option.code} | نوع: {option.type}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* قسم بيانات المواد */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>بيانات المواد</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>فئة المادة</label>
              <Select
                options={MATERIAL_CATEGORIES}
                value={formData.materialCategory}
                onChange={value => handleChange('materialCategory', value)}
                placeholder='اختر فئة المادة'
                searchable
                clearable
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>وحدة القياس</label>
              <Select
                options={UNITS}
                value={formData.unit}
                onChange={value => handleChange('unit', value)}
                placeholder='اختر وحدة القياس'
                searchable
                clearable
              />
            </div>
          </div>
        </div>

        {/* قسم بيانات الطلبات */}
        <div className='bg-gray-50 p-6 rounded-lg'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4'>بيانات الطلبات</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>حالة الطلب</label>
              <Select
                options={ORDER_STATUS}
                value={formData.orderStatus}
                onChange={value => handleChange('orderStatus', value)}
                placeholder='اختر حالة الطلب'
                searchable
                clearable
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>أولوية الطلب</label>
              <Select
                options={ORDER_PRIORITIES}
                value={formData.orderPriority}
                onChange={value => handleChange('orderPriority', value)}
                placeholder='اختر أولوية الطلب'
                searchable
                clearable
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>حالة الجودة</label>
              <Select
                options={QUALITY_STATUS}
                value={formData.qualityStatus}
                onChange={value => handleChange('qualityStatus', value)}
                placeholder='اختر حالة الجودة'
                searchable
                clearable
              />
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className='flex justify-between items-center pt-6 border-t'>
          <div className='flex gap-3'>
            <button
              type='submit'
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              حفظ البيانات
            </button>

            <button
              type='button'
              onClick={handleReset}
              className='bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors'
            >
              إعادة تعيين
            </button>
          </div>

          <div className='text-sm text-gray-500'>جميع الحقول اختيارية</div>
        </div>
      </form>

      {/* عرض البيانات المحددة */}
      <div className='mt-8 p-4 bg-gray-100 rounded-lg'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>البيانات المحددة:</h3>
        <pre className='text-sm text-gray-600 whitespace-pre-wrap'>{JSON.stringify(formData, null, 2)}</pre>
      </div>

      {/* ملاحظات مهمة */}
      <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <h3 className='text-lg font-semibold text-yellow-800 mb-2'>ملاحظات مهمة:</h3>
        <ul className='text-sm text-yellow-700 space-y-1'>
          <li>• تم حل مشكلة عدم ظهور الخيارات من خلال تحويل البيانات إلى تنسيق value/label</li>
          <li>• المكون يدعم البحث والتصفية للخيارات الكثيرة</li>
          <li>• يتعامل مع حالات التحميل والبيانات الفارغة بشكل صحيح</li>
          <li>• يدعم اللغة العربية و RTL بشكل كامل</li>
          <li>• يمكن تخصيص عرض الخيارات باستخدام renderOption</li>
        </ul>
      </div>
    </div>
  );
};

export default SelectExample;
