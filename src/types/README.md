# أنواع البيانات

هذا المجلد يحتوي على تعريفات الأنواع المستخدمة في التطبيق. يمكن استخدام هذه التعريفات مع TypeScript أو مع JSDoc للتوثيق وتحسين تجربة التطوير.

## نظرة عامة

تم تنظيم أنواع البيانات في ملفات منفصلة حسب وحدات النظام المختلفة. يوفر ملف `index.js` تصديراً مركزياً لجميع الأنواع، مما يسهل استيرادها واستخدامها في أي مكان في التطبيق.

## بنية المجلد

```
types/
├── auth.js          # أنواع المصادقة والمستخدمين
├── customer.js      # أنواع العملاء والمبيعات
├── facility.js      # أنواع إدارة المرافق والمباني
├── finance.js       # أنواع المالية والمحاسبة
├── hr.js            # أنواع الموارد البشرية
├── index.js         # ملف تصدير مركزي لجميع الأنواع
├── inventory.js     # أنواع المخزون والمواد
├── logistics.js     # أنواع النقل والخدمات اللوجستية
├── maintenance.js   # أنواع الصيانة والإدارة الفنية
├── production.js    # أنواع الإنتاج والتصنيع
├── quality.js       # أنواع إدارة الجودة
├── safety.js        # أنواع السلامة
└── supplier.js      # أنواع الموردين والمشتريات
```

## كيفية استخدام الأنواع

### مع JSDoc

```javascript
/**
 * @typedef {import('../types/auth').User} User
 */

/**
 * تحديث بيانات المستخدم
 * @param {User} user - بيانات المستخدم المحدثة
 * @returns {Promise<User>} المستخدم بعد التحديث
 */
export function updateUser(user) {
  // تنفيذ الوظيفة
}
```

### استخدام الأنواع في المتغيرات

```javascript
/**
 * @type {import('../types/inventory').Product}
 */
const product = {
  id: '123',
  name: 'منتج تجريبي',
  sku: 'PRD-123',
  price: 100
  // ... باقي الخصائص
};
```

### استخدام الأنواع في مكونات React

```javascript
import React from 'react';

/**
 * @typedef {import('../types/maintenance').MaintenanceRequest} MaintenanceRequest
 */

/**
 * مكون عرض تفاصيل طلب الصيانة
 * @param {Object} props - خصائص المكون
 * @param {MaintenanceRequest} props.request - طلب الصيانة
 * @returns {JSX.Element}
 */
function MaintenanceRequestDetails({ request }) {
  return (
    <div>
      <h2>طلب صيانة #{request.requestNumber}</h2>
      <p>الحالة: {request.status}</p>
      <p>الوصف: {request.description}</p>
    </div>
  );
}

export default MaintenanceRequestDetails;
```

### مع TypeScript (في حال الترقية مستقبلاً)

```typescript
import { User } from '../types/auth';

export function updateUser(user: User): Promise<User> {
  // تنفيذ الوظيفة
}
```

## الأنواع المشتركة

يحتوي ملف `index.js` على تعريفات للأنواع المشتركة التي يمكن استخدامها في جميع أنحاء التطبيق:

### الحقول المشتركة

```javascript
/**
 * @typedef {Object} BaseEntity - الكيان الأساسي الذي ترث منه جميع الكيانات
 * @property {string} id - المعرف الفريد
 * @property {string} createdBy - معرف المستخدم الذي أنشأ الكيان
 * @property {Date} createdAt - تاريخ إنشاء الكيان
 * @property {string} [updatedBy] - معرف المستخدم الذي قام بآخر تحديث
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {boolean} [isActive=true] - حالة نشاط الكيان
 */
```

### سجلات التدقيق

```javascript
/**
 * @typedef {Object} AuditLog - سجل تدقيق للتغييرات
 * @property {string} id - المعرف الفريد
 * @property {string} entityType - نوع الكيان (مثل "User", "Product")
 * @property {string} entityId - معرف الكيان
 * @property {string} action - الإجراء (مثل "create", "update", "delete")
 * @property {Object} changes - التغييرات التي تمت
 * @property {string} userId - معرف المستخدم الذي قام بالإجراء
 * @property {Date} timestamp - وقت حدوث الإجراء
 */
```

### المرفقات والتعليقات

```javascript
/**
 * @typedef {Object} Attachment - مرفق
 * @property {string} id - المعرف الفريد
 * @property {string} fileName - اسم الملف
 * @property {string} fileType - نوع الملف
 * @property {number} fileSize - حجم الملف بالبايت
 * @property {string} filePath - مسار الملف
 * @property {string} entityType - نوع الكيان المرتبط
 * @property {string} entityId - معرف الكيان المرتبط
 * @property {string} uploadedBy - معرف المستخدم الذي قام برفع الملف
 * @property {Date} uploadedAt - تاريخ رفع الملف
 */

/**
 * @typedef {Object} Comment - تعليق
 * @property {string} id - المعرف الفريد
 * @property {string} content - محتوى التعليق
 * @property {string} entityType - نوع الكيان المرتبط
 * @property {string} entityId - معرف الكيان المرتبط
 * @property {string} createdBy - معرف المستخدم الذي أنشأ التعليق
 * @property {Date} createdAt - تاريخ إنشاء التعليق
 * @property {Date} [updatedAt] - تاريخ آخر تحديث للتعليق
 */
```

## استخدام الأنواع المركبة

يمكن استخدام الأنواع المركبة لإنشاء أنواع جديدة تجمع بين عدة أنواع موجودة:

```javascript
/**
 * @typedef {import('../types').BaseEntity & import('../types/inventory').Product} ProductWithBase
 */

/**
 * @typedef {Object} ProductWithAttachments
 * @property {import('../types/inventory').Product} product - بيانات المنتج
 * @property {import('../types').Attachment[]} attachments - مرفقات المنتج
 * @property {import('../types').Comment[]} comments - تعليقات المنتج
 */
```
