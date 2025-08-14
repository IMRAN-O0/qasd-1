/**
 * @fileoverview ملف تصدير مركزي لجميع أنواع البيانات المعرفة في النظام
 */

// استيراد جميع أنواع البيانات من الملفات المختلفة
import './auth';
import './customer';
import './facility';
import './finance';
import './hr';
import './inventory';
import './logistics';
import './maintenance';
import './production';
import './quality';
import './safety';
import './supplier';

/**
 * @typedef {Object} CommonFields
 * @property {string} id - المعرف الفريد
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 * @property {string} [createdBy] - معرف منشئ السجل
 * @property {string} [updatedBy] - معرف محدث السجل
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id - معرف سجل التدقيق
 * @property {string} entityType - نوع الكيان
 * @property {string} entityId - معرف الكيان
 * @property {string} action - الإجراء (إنشاء، تحديث، حذف)
 * @property {string} userId - معرف المستخدم
 * @property {string} timestamp - الطابع الزمني
 * @property {Object} [oldValues] - القيم القديمة
 * @property {Object} [newValues] - القيم الجديدة
 * @property {string} [ipAddress] - عنوان IP
 * @property {string} [userAgent] - وكيل المستخدم
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - معرف الإشعار
 * @property {string} userId - معرف المستخدم
 * @property {string} title - عنوان الإشعار
 * @property {string} message - نص الإشعار
 * @property {string} type - نوع الإشعار (معلومات، نجاح، تحذير، خطأ)
 * @property {boolean} isRead - هل تمت قراءة الإشعار
 * @property {string} [entityType] - نوع الكيان المرتبط
 * @property {string} [entityId] - معرف الكيان المرتبط
 * @property {string} [link] - رابط متعلق بالإشعار
 * @property {string} createdAt - تاريخ الإنشاء
 */

/**
 * @typedef {Object} Attachment
 * @property {string} id - معرف المرفق
 * @property {string} fileName - اسم الملف
 * @property {string} fileType - نوع الملف
 * @property {number} fileSize - حجم الملف
 * @property {string} filePath - مسار الملف
 * @property {string} [url] - رابط الملف
 * @property {string} entityType - نوع الكيان المرتبط
 * @property {string} entityId - معرف الكيان المرتبط
 * @property {string} [description] - وصف المرفق
 * @property {string} uploadedBy - معرف من قام برفع الملف
 * @property {string} createdAt - تاريخ الإنشاء
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - معرف التعليق
 * @property {string} entityType - نوع الكيان المرتبط
 * @property {string} entityId - معرف الكيان المرتبط
 * @property {string} text - نص التعليق
 * @property {string} userId - معرف المستخدم
 * @property {string} [parentCommentId] - معرف التعليق الأب
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} [updatedAt] - تاريخ التحديث
 */

/**
 * @typedef {Object} Tag
 * @property {string} id - معرف الوسم
 * @property {string} name - اسم الوسم
 * @property {string} [nameAr] - اسم الوسم بالعربية
 * @property {string} [color] - لون الوسم
 * @property {string} [category] - فئة الوسم
 * @property {string} [description] - وصف الوسم
 */

/**
 * @typedef {Object} EntityTag
 * @property {string} id - معرف ربط الوسم
 * @property {string} tagId - معرف الوسم
 * @property {string} entityType - نوع الكيان
 * @property {string} entityId - معرف الكيان
 * @property {string} createdAt - تاريخ الإنشاء
 */

/**
 * @typedef {Object} SystemSetting
 * @property {string} id - معرف الإعداد
 * @property {string} key - مفتاح الإعداد
 * @property {string} value - قيمة الإعداد
 * @property {string} [description] - وصف الإعداد
 * @property {string} [group] - مجموعة الإعداد
 * @property {string} [dataType] - نوع البيانات (نص، رقم، منطقي، تاريخ، json)
 * @property {boolean} [isPublic] - هل الإعداد عام
 * @property {string} updatedBy - معرف محدث الإعداد
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} UserSetting
 * @property {string} id - معرف الإعداد
 * @property {string} userId - معرف المستخدم
 * @property {string} key - مفتاح الإعداد
 * @property {string} value - قيمة الإعداد
 * @property {string} [description] - وصف الإعداد
 * @property {string} [dataType] - نوع البيانات
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Report
 * @property {string} id - معرف التقرير
 * @property {string} code - رمز التقرير
 * @property {string} name - اسم التقرير
 * @property {string} [nameAr] - اسم التقرير بالعربية
 * @property {string} [description] - وصف التقرير
 * @property {string} [category] - فئة التقرير
 * @property {string} [type] - نوع التقرير
 * @property {string} [query] - استعلام التقرير
 * @property {Object} [parameters] - معلمات التقرير
 * @property {string} [template] - قالب التقرير
 * @property {boolean} [isSystem] - هل التقرير نظامي
 * @property {string} [createdBy] - معرف منشئ التقرير
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Dashboard
 * @property {string} id - معرف لوحة المعلومات
 * @property {string} name - اسم لوحة المعلومات
 * @property {string} [nameAr] - اسم لوحة المعلومات بالعربية
 * @property {string} [description] - وصف لوحة المعلومات
 * @property {string} [layout] - تخطيط لوحة المعلومات
 * @property {DashboardWidget[]} [widgets] - عناصر لوحة المعلومات
 * @property {boolean} [isDefault] - هل لوحة المعلومات افتراضية
 * @property {boolean} [isSystem] - هل لوحة المعلومات نظامية
 * @property {string} [userId] - معرف المستخدم
 * @property {string} [roleId] - معرف الدور
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} DashboardWidget
 * @property {string} id - معرف العنصر
 * @property {string} dashboardId - معرف لوحة المعلومات
 * @property {string} type - نوع العنصر
 * @property {string} title - عنوان العنصر
 * @property {string} [titleAr] - عنوان العنصر بالعربية
 * @property {Object} [config] - إعدادات العنصر
 * @property {Object} [data] - بيانات العنصر
 * @property {string} [dataSource] - مصدر البيانات
 * @property {Object} [position] - موقع العنصر
 * @property {Object} [size] - حجم العنصر
 */

/**
 * @typedef {Object} Workflow
 * @property {string} id - معرف سير العمل
 * @property {string} code - رمز سير العمل
 * @property {string} name - اسم سير العمل
 * @property {string} [nameAr] - اسم سير العمل بالعربية
 * @property {string} [description] - وصف سير العمل
 * @property {string} entityType - نوع الكيان
 * @property {string} [version] - إصدار سير العمل
 * @property {boolean} [isActive] - هل سير العمل نشط
 * @property {WorkflowStage[]} stages - مراحل سير العمل
 * @property {WorkflowTransition[]} transitions - انتقالات سير العمل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} WorkflowStage
 * @property {string} id - معرف المرحلة
 * @property {string} workflowId - معرف سير العمل
 * @property {string} name - اسم المرحلة
 * @property {string} [nameAr] - اسم المرحلة بالعربية
 * @property {string} [description] - وصف المرحلة
 * @property {boolean} [isInitial] - هل المرحلة ابتدائية
 * @property {boolean} [isFinal] - هل المرحلة نهائية
 * @property {string[]} [allowedRoles] - الأدوار المسموح لها
 * @property {string[]} [actions] - الإجراءات المتاحة
 * @property {Object} [config] - إعدادات المرحلة
 */

/**
 * @typedef {Object} WorkflowTransition
 * @property {string} id - معرف الانتقال
 * @property {string} workflowId - معرف سير العمل
 * @property {string} fromStageId - معرف المرحلة المصدر
 * @property {string} toStageId - معرف المرحلة الهدف
 * @property {string} name - اسم الانتقال
 * @property {string} [nameAr] - اسم الانتقال بالعربية
 * @property {string} [description] - وصف الانتقال
 * @property {string[]} [allowedRoles] - الأدوار المسموح لها
 * @property {string[]} [conditions] - شروط الانتقال
 * @property {string[]} [actions] - إجراءات الانتقال
 */

/**
 * @typedef {Object} WorkflowInstance
 * @property {string} id - معرف نسخة سير العمل
 * @property {string} workflowId - معرف سير العمل
 * @property {string} entityType - نوع الكيان
 * @property {string} entityId - معرف الكيان
 * @property {string} currentStageId - معرف المرحلة الحالية
 * @property {string} [previousStageId] - معرف المرحلة السابقة
 * @property {string} [status] - حالة نسخة سير العمل
 * @property {WorkflowHistory[]} [history] - سجل سير العمل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} WorkflowHistory
 * @property {string} id - معرف السجل
 * @property {string} workflowInstanceId - معرف نسخة سير العمل
 * @property {string} fromStageId - معرف المرحلة المصدر
 * @property {string} toStageId - معرف المرحلة الهدف
 * @property {string} transitionId - معرف الانتقال
 * @property {string} userId - معرف المستخدم
 * @property {string} timestamp - الطابع الزمني
 * @property {string} [comment] - التعليق
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
