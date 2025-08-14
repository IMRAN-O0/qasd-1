/**
 * @fileoverview تعريفات أنواع الإنتاج والتصنيع
 */

/**
 * @typedef {Object} ProductionOrder
 * @property {string} id - معرف أمر الإنتاج
 * @property {string} orderNumber - رقم أمر الإنتاج
 * @property {string} productId - معرف المنتج
 * @property {number} quantity - الكمية المطلوبة
 * @property {string} status - حالة أمر الإنتاج (مخطط، قيد التنفيذ، مكتمل، ملغي)
 * @property {string} priority - أولوية الأمر (منخفضة، متوسطة، عالية، حرجة)
 * @property {string} startDate - تاريخ بدء الإنتاج
 * @property {string} [endDate] - تاريخ انتهاء الإنتاج
 * @property {string} dueDate - تاريخ الاستحقاق
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الأمر
 * @property {string} [approvedBy] - معتمد الأمر
 * @property {string} createdAt - تاريخ إنشاء الأمر
 * @property {string} updatedAt - تاريخ تحديث الأمر
 */

/**
 * @typedef {Object} ProductionBatch
 * @property {string} id - معرف دفعة الإنتاج
 * @property {string} batchNumber - رقم الدفعة
 * @property {string} productionOrderId - معرف أمر الإنتاج
 * @property {string} productId - معرف المنتج
 * @property {number} plannedQuantity - الكمية المخططة
 * @property {number} actualQuantity - الكمية الفعلية
 * @property {string} status - حالة الدفعة
 * @property {string} startDate - تاريخ بدء الإنتاج
 * @property {string} [endDate] - تاريخ انتهاء الإنتاج
 * @property {string} [expiryDate] - تاريخ انتهاء الصلاحية
 * @property {ProductionStage[]} stages - مراحل الإنتاج
 * @property {MaterialUsage[]} materials - المواد المستخدمة
 * @property {QualityCheck[]} qualityChecks - فحوصات الجودة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} ProductionStage
 * @property {string} id - معرف مرحلة الإنتاج
 * @property {string} name - اسم المرحلة
 * @property {string} status - حالة المرحلة
 * @property {string} startDate - تاريخ بدء المرحلة
 * @property {string} [endDate] - تاريخ انتهاء المرحلة
 * @property {string} [assignedTo] - المسؤول عن المرحلة
 * @property {string} [workstationId] - معرف محطة العمل
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} MaterialUsage
 * @property {string} materialId - معرف المادة
 * @property {number} plannedQuantity - الكمية المخططة
 * @property {number} actualQuantity - الكمية الفعلية
 * @property {string} [batchNumber] - رقم دفعة المادة
 * @property {string} [warehouseId] - معرف المستودع
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} QualityCheck
 * @property {string} id - معرف فحص الجودة
 * @property {string} checkType - نوع الفحص
 * @property {string} status - نتيجة الفحص (مقبول، مرفوض، بحاجة لإعادة العمل)
 * @property {QualityParameter[]} parameters - معايير الفحص
 * @property {string} checkedBy - منفذ الفحص
 * @property {string} checkDate - تاريخ الفحص
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} QualityParameter
 * @property {string} name - اسم المعيار
 * @property {string} value - القيمة المسجلة
 * @property {string} [unit] - وحدة القياس
 * @property {string} [minValue] - الحد الأدنى المقبول
 * @property {string} [maxValue] - الحد الأقصى المقبول
 * @property {boolean} isPassed - هل اجتاز الفحص
 */

/**
 * @typedef {Object} Workstation
 * @property {string} id - معرف محطة العمل
 * @property {string} code - رمز محطة العمل
 * @property {string} name - اسم محطة العمل
 * @property {string} type - نوع محطة العمل
 * @property {string} location - موقع محطة العمل
 * @property {string} status - حالة محطة العمل (متاحة، قيد الاستخدام، في الصيانة، معطلة)
 * @property {string} [currentOperator] - المشغل الحالي
 * @property {string} [currentProductionBatchId] - معرف دفعة الإنتاج الحالية
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} MaintenanceRecord
 * @property {string} id - معرف سجل الصيانة
 * @property {string} workstationId - معرف محطة العمل
 * @property {string} type - نوع الصيانة (وقائية، تصحيحية، دورية)
 * @property {string} description - وصف الصيانة
 * @property {string} status - حالة الصيانة
 * @property {string} startDate - تاريخ بدء الصيانة
 * @property {string} [endDate] - تاريخ انتهاء الصيانة
 * @property {string} [performedBy] - منفذ الصيانة
 * @property {string} [cost] - تكلفة الصيانة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} ProductionFormula
 * @property {string} id - معرف الوصفة
 * @property {string} productId - معرف المنتج
 * @property {string} name - اسم الوصفة
 * @property {string} version - رقم الإصدار
 * @property {boolean} isActive - حالة نشاط الوصفة
 * @property {FormulaItem[]} items - مكونات الوصفة
 * @property {ProductionStep[]} steps - خطوات الإنتاج
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الوصفة
 * @property {string} [approvedBy] - معتمد الوصفة
 * @property {string} createdAt - تاريخ إنشاء الوصفة
 * @property {string} updatedAt - تاريخ تحديث الوصفة
 */

/**
 * @typedef {Object} FormulaItem
 * @property {string} materialId - معرف المادة
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {boolean} isOptional - هل المادة اختيارية
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} ProductionStep
 * @property {string} id - معرف الخطوة
 * @property {number} sequence - ترتيب الخطوة
 * @property {string} name - اسم الخطوة
 * @property {string} description - وصف الخطوة
 * @property {string} [workstationType] - نوع محطة العمل المطلوبة
 * @property {number} [estimatedTime] - الوقت التقديري (بالدقائق)
 * @property {string} [notes] - ملاحظات
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
