/**
 * @fileoverview تعريفات أنواع إدارة الجودة
 */

/**
 * @typedef {Object} QualityStandard
 * @property {string} id - معرف معيار الجودة
 * @property {string} code - رمز المعيار
 * @property {string} name - اسم المعيار
 * @property {string} description - وصف المعيار
 * @property {string} category - فئة المعيار
 * @property {string} [version] - إصدار المعيار
 * @property {string} [authority] - الجهة المصدرة للمعيار
 * @property {boolean} isActive - حالة نشاط المعيار
 * @property {string} createdAt - تاريخ إنشاء المعيار
 * @property {string} updatedAt - تاريخ تحديث المعيار
 */

/**
 * @typedef {Object} QualityParameter
 * @property {string} id - معرف معامل الجودة
 * @property {string} standardId - معرف معيار الجودة
 * @property {string} name - اسم المعامل
 * @property {string} description - وصف المعامل
 * @property {string} unit - وحدة القياس
 * @property {string} [minValue] - الحد الأدنى المقبول
 * @property {string} [maxValue] - الحد الأقصى المقبول
 * @property {string} [targetValue] - القيمة المستهدفة
 * @property {string} [testMethod] - طريقة الاختبار
 * @property {string} [frequency] - تكرار الاختبار
 * @property {boolean} isCritical - هل المعامل حرج
 */

/**
 * @typedef {Object} QualityTest
 * @property {string} id - معرف اختبار الجودة
 * @property {string} code - رمز الاختبار
 * @property {string} name - اسم الاختبار
 * @property {string} description - وصف الاختبار
 * @property {string} category - فئة الاختبار
 * @property {string} [testMethod] - طريقة الاختبار
 * @property {string} [equipment] - المعدات المطلوبة
 * @property {string} [sampleSize] - حجم العينة
 * @property {string} [duration] - مدة الاختبار
 * @property {string[]} [applicableProducts] - المنتجات القابلة للتطبيق
 * @property {boolean} isActive - حالة نشاط الاختبار
 */

/**
 * @typedef {Object} QualityInspection
 * @property {string} id - معرف الفحص
 * @property {string} inspectionNumber - رقم الفحص
 * @property {string} type - نوع الفحص (مواد خام، إنتاج، منتج نهائي)
 * @property {string} [productId] - معرف المنتج
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {string} [supplierId] - معرف المورد
 * @property {string} status - حالة الفحص (مخطط، قيد التنفيذ، مكتمل)
 * @property {string} result - نتيجة الفحص (مقبول، مرفوض، مقبول بشروط)
 * @property {InspectionItem[]} items - عناصر الفحص
 * @property {string} inspectedBy - منفذ الفحص
 * @property {string} [approvedBy] - معتمد الفحص
 * @property {string} inspectionDate - تاريخ الفحص
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} InspectionItem
 * @property {string} parameterId - معرف المعامل
 * @property {string} parameterName - اسم المعامل
 * @property {string} [expectedValue] - القيمة المتوقعة
 * @property {string} actualValue - القيمة الفعلية
 * @property {boolean} isPassed - هل اجتاز الفحص
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} NonConformity
 * @property {string} id - معرف عدم المطابقة
 * @property {string} ncNumber - رقم عدم المطابقة
 * @property {string} type - نوع عدم المطابقة
 * @property {string} severity - شدة عدم المطابقة (بسيطة، متوسطة، حرجة)
 * @property {string} [productId] - معرف المنتج
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {string} [inspectionId] - معرف الفحص المرتبط
 * @property {string} description - وصف عدم المطابقة
 * @property {string} status - حالة عدم المطابقة (مفتوحة، قيد المعالجة، مغلقة)
 * @property {string} reportedBy - مبلغ عدم المطابقة
 * @property {string} reportDate - تاريخ الإبلاغ
 * @property {string} [assignedTo] - المسؤول عن المعالجة
 * @property {string} [closedBy] - من قام بإغلاق الحالة
 * @property {string} [closedDate] - تاريخ الإغلاق
 * @property {string} [rootCause] - السبب الجذري
 * @property {string} [correctiveAction] - الإجراء التصحيحي
 * @property {string} [preventiveAction] - الإجراء الوقائي
 */

/**
 * @typedef {Object} QualityDocument
 * @property {string} id - معرف المستند
 * @property {string} documentNumber - رقم المستند
 * @property {string} title - عنوان المستند
 * @property {string} type - نوع المستند (سياسة، إجراء، تعليمات عمل، سجل)
 * @property {string} category - فئة المستند
 * @property {string} version - إصدار المستند
 * @property {string} status - حالة المستند (مسودة، مراجعة، معتمد، ملغي)
 * @property {string} [filePath] - مسار الملف
 * @property {string} effectiveDate - تاريخ السريان
 * @property {string} [expiryDate] - تاريخ انتهاء الصلاحية
 * @property {string} createdBy - منشئ المستند
 * @property {string} [reviewedBy] - مراجع المستند
 * @property {string} [approvedBy] - معتمد المستند
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} QualityAudit
 * @property {string} id - معرف التدقيق
 * @property {string} auditNumber - رقم التدقيق
 * @property {string} type - نوع التدقيق (داخلي، خارجي، تفتيش)
 * @property {string} scope - نطاق التدقيق
 * @property {string} status - حالة التدقيق (مخطط، قيد التنفيذ، مكتمل)
 * @property {string} [standardId] - معرف المعيار المطبق
 * @property {string} [department] - القسم المدقق عليه
 * @property {string} startDate - تاريخ بدء التدقيق
 * @property {string} [endDate] - تاريخ انتهاء التدقيق
 * @property {string} [leadAuditor] - المدقق الرئيسي
 * @property {string[]} [auditTeam] - فريق التدقيق
 * @property {AuditFinding[]} findings - نتائج التدقيق
 * @property {string} [summary] - ملخص التدقيق
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} AuditFinding
 * @property {string} id - معرف النتيجة
 * @property {string} type - نوع النتيجة (عدم مطابقة، ملاحظة، فرصة تحسين)
 * @property {string} description - وصف النتيجة
 * @property {string} [reference] - المرجع (بند المعيار)
 * @property {string} [evidence] - الدليل
 * @property {string} status - حالة النتيجة (مفتوحة، قيد المعالجة، مغلقة)
 * @property {string} [assignedTo] - المسؤول عن المعالجة
 * @property {string} [correctiveAction] - الإجراء التصحيحي
 * @property {string} [dueDate] - تاريخ الاستحقاق
 * @property {string} [closedDate] - تاريخ الإغلاق
 */

/**
 * @typedef {Object} QualityIndicator
 * @property {string} id - معرف المؤشر
 * @property {string} code - رمز المؤشر
 * @property {string} name - اسم المؤشر
 * @property {string} description - وصف المؤشر
 * @property {string} category - فئة المؤشر
 * @property {string} unit - وحدة القياس
 * @property {string} formula - صيغة الحساب
 * @property {string} frequency - تكرار القياس
 * @property {string} [target] - القيمة المستهدفة
 * @property {string} [lowerLimit] - الحد الأدنى المقبول
 * @property {string} [upperLimit] - الحد الأعلى المقبول
 * @property {string} [responsiblePerson] - الشخص المسؤول
 * @property {boolean} isActive - حالة نشاط المؤشر
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
