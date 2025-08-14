# مكون Select المحسن - دليل الاستخدام

## نظرة عامة

مكون Select محسن وقابل لإعادة الاستخدام تم تطويره خصيصاً لحل مشكلة عدم ظهور الخيارات في القوائم المنسدلة في نظام QASD. يدعم المكون البحث، التصفية، وإدارة الحالة بشكل متقدم.

## المشاكل التي يحلها

### 1. مشكلة عدم ظهور الخيارات

- **السبب**: عدم توافق تنسيق البيانات مع المكون
- **الحل**: تطبيع البيانات تلقائياً إلى تنسيق `{value, label}`

### 2. مشكلة البيانات الفارغة

- **السبب**: عدم وجود معالجة للحالات الاستثنائية
- **الحل**: عرض رسائل مناسبة وحالات تحميل

### 3. مشكلة عدم التزامن

- **السبب**: عرض المكون قبل تحميل البيانات
- **الحل**: دعم حالات التحميل والتعطيل

## الميزات الرئيسية

✅ **البحث والتصفية**: إمكانية البحث في الخيارات
✅ **دعم اللغة العربية**: RTL وتخطيط عربي كامل
✅ **حالات التحميل**: عرض مؤشرات التحميل
✅ **تطبيع البيانات**: تحويل تلقائي لتنسيقات البيانات المختلفة
✅ **تخصيص العرض**: إمكانية تخصيص شكل الخيارات
✅ **إدارة الأخطاء**: معالجة شاملة للأخطاء
✅ **التنقل بلوحة المفاتيح**: دعم كامل للوصولية

## طريقة الاستخدام

### الاستخدام الأساسي

```jsx
import Select from '../components/common/Select';
import { CUSTOMER_TYPES } from '../constants';

function MyComponent() {
  const [selectedType, setSelectedType] = useState('');

  return (
    <Select options={CUSTOMER_TYPES} value={selectedType} onChange={setSelectedType} placeholder='اختر نوع العميل' />
  );
}
```

### الاستخدام المتقدم

```jsx
<Select
  options={customers}
  value={selectedCustomer}
  onChange={setSelectedCustomer}
  placeholder='اختر عميل'
  searchable
  clearable
  loading={isLoading}
  disabled={isLoading}
  renderOption={option => (
    <div className='flex justify-between'>
      <span>{option.label}</span>
      <span className='text-gray-500'>{option.code}</span>
    </div>
  )}
/>
```

## خصائص المكون (Props)

| الخاصية        | النوع      | الافتراضي   | الوصف                    |
| -------------- | ---------- | ----------- | ------------------------ |
| `options`      | `Array`    | `[]`        | قائمة الخيارات المتاحة   |
| `value`        | `string`   | `''`        | القيمة المحددة حالياً    |
| `onChange`     | `function` | -           | دالة معالجة تغيير القيمة |
| `placeholder`  | `string`   | `'اختر...'` | النص الافتراضي           |
| `searchable`   | `boolean`  | `false`     | تفعيل البحث              |
| `clearable`    | `boolean`  | `false`     | إمكانية مسح الاختيار     |
| `loading`      | `boolean`  | `false`     | حالة التحميل             |
| `disabled`     | `boolean`  | `false`     | تعطيل المكون             |
| `error`        | `string`   | -           | رسالة خطأ                |
| `renderOption` | `function` | -           | دالة تخصيص عرض الخيارات  |
| `className`    | `string`   | -           | فئات CSS إضافية          |

## تنسيقات البيانات المدعومة

### 1. تنسيق القيمة/التسمية (مُفضل)

```javascript
const options = [
  { value: 'option1', label: 'الخيار الأول' },
  { value: 'option2', label: 'الخيار الثاني' }
];
```

### 2. تنسيق النص البسيط (يتم تحويله تلقائياً)

```javascript
const options = ['الخيار الأول', 'الخيار الثاني'];
```

### 3. تنسيق الكائنات المعقدة

```javascript
const options = [
  { id: 1, name: 'العميل الأول', code: 'C001' },
  { id: 2, name: 'العميل الثاني', code: 'C002' }
];
// يتم تحويلها تلقائياً باستخدام id كـ value و name كـ label
```

## أمثلة الاستخدام

### مع البيانات الثابتة

```jsx
import { CUSTOMER_TYPES, CUSTOMER_STATUS } from '../constants';

<Select
  options={CUSTOMER_TYPES}
  value={customerType}
  onChange={setCustomerType}
  placeholder='اختر نوع العميل'
  searchable
  clearable
/>;
```

### مع البيانات الديناميكية

```jsx
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchCustomers()
    .then(setCustomers)
    .finally(() => setLoading(false));
}, []);

<Select
  options={customers}
  value={selectedCustomer}
  onChange={setSelectedCustomer}
  placeholder={loading ? 'جاري التحميل...' : 'اختر عميل'}
  loading={loading}
  disabled={loading}
  searchable
  clearable
/>;
```

### مع تخصيص العرض

```jsx
<Select
  options={customers}
  value={selectedCustomer}
  onChange={setSelectedCustomer}
  placeholder='اختر عميل'
  searchable
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
```

## معالجة الأخطاء

```jsx
const [error, setError] = useState('');

const handleChange = value => {
  try {
    // التحقق من صحة القيمة
    if (!value) {
      setError('يرجى اختيار قيمة');
      return;
    }

    setError('');
    setSelectedValue(value);
  } catch (err) {
    setError('حدث خطأ في الاختيار');
  }
};

<Select options={options} value={selectedValue} onChange={handleChange} error={error} placeholder='اختر خيار' />;
```

## أفضل الممارسات

### 1. استخدام تنسيق value/label

```javascript
// ✅ صحيح
const CUSTOMER_TYPES = [
  { value: 'corporate', label: 'عميل مؤسسي' },
  { value: 'retail', label: 'عميل تجزئة' }
];

// ❌ تجنب (رغم أنه مدعوم)
const CUSTOMER_TYPES = ['عميل مؤسسي', 'عميل تجزئة'];
```

### 2. معالجة حالات التحميل

```jsx
// ✅ صحيح
<Select
  options={data}
  loading={isLoading}
  disabled={isLoading}
  placeholder={isLoading ? "جاري التحميل..." : "اختر خيار"}
/>

// ❌ تجنب
<Select
  options={data}
  placeholder="اختر خيار"
/>
```

### 3. استخدام البحث للقوائم الطويلة

```jsx
// ✅ للقوائم التي تحتوي على أكثر من 10 خيارات
<Select options={longList} searchable placeholder='ابحث واختر...' />
```

### 4. إضافة إمكانية المسح عند الحاجة

```jsx
// ✅ للحقول الاختيارية
<Select options={options} clearable placeholder='اختر خيار (اختياري)' />
```

## استكشاف الأخطاء وإصلاحها

### المشكلة: لا تظهر الخيارات

**الحلول:**

1. تأكد من أن `options` ليست فارغة
2. تحقق من تنسيق البيانات
3. تأكد من عدم وجود أخطاء في console

### المشكلة: البحث لا يعمل

**الحلول:**

1. تأكد من تفعيل `searchable={true}`
2. تحقق من أن البيانات تحتوي على `label`

### المشكلة: القيمة لا تتحدث

**الحلول:**

1. تأكد من تمرير `onChange` صحيح
2. تحقق من أن `value` يطابق `value` في الخيارات

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل، يرجى:

1. مراجعة هذا الدليل أولاً
2. فحص ملف `SelectExample.jsx` للأمثلة العملية
3. التأكد من استخدام أحدث إصدار من المكون

---

**ملاحظة**: هذا المكون تم تطويره خصيصاً لنظام QASD ويتبع معايير التصميم والأمان المطلوبة.
