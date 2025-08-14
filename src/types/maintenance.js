/**
 * @fileoverview تعريفات أنواع الصيانة والإدارة الفنية للمنشآت والمعدات
 */

/**
 * @typedef {Object} Asset
 * @property {string} id - معرف الأصل
 * @property {string} assetNumber - رقم الأصل
 * @property {string} name - اسم الأصل
 * @property {string} [nameAr] - اسم الأصل بالعربية
 * @property {string} [description] - وصف الأصل
 * @property {string} [category] - فئة الأصل
 * @property {string} [type] - نوع الأصل
 * @property {string} [status] - حالة الأصل (نشط، غير نشط، قيد الصيانة، متقاعد)
 * @property {string} [locationId] - معرف الموقع
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [assignedTo] - معرف الموظف المسؤول
 * @property {string} [manufacturer] - الشركة المصنعة
 * @property {string} [model] - الطراز
 * @property {string} [serialNumber] - الرقم التسلسلي
 * @property {string} [barcode] - الباركود
 * @property {string} [purchaseDate] - تاريخ الشراء
 * @property {number} [purchasePrice] - سعر الشراء
 * @property {string} [currency] - العملة
 * @property {string} [warrantyExpiryDate] - تاريخ انتهاء الضمان
 * @property {string} [installationDate] - تاريخ التركيب
 * @property {number} [expectedLifespan] - العمر المتوقع
 * @property {string} [lifespanUnit] - وحدة العمر المتوقع
 * @property {string} [lastMaintenanceDate] - تاريخ آخر صيانة
 * @property {string} [nextMaintenanceDate] - تاريخ الصيانة القادمة
 * @property {string} [parentAssetId] - معرف الأصل الأب
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceRequest
 * @property {string} id - معرف طلب الصيانة
 * @property {string} requestNumber - رقم الطلب
 * @property {string} [title] - عنوان الطلب
 * @property {string} [description] - وصف الطلب
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [locationId] - معرف الموقع
 * @property {string} [requestType] - نوع الطلب (إصلاح، صيانة وقائية، فحص، تركيب)
 * @property {string} [priority] - الأولوية (منخفضة، متوسطة، عالية، طارئة)
 * @property {string} status - حالة الطلب (جديد، معتمد، قيد التنفيذ، معلق، مكتمل، مرفوض)
 * @property {string} [reportedBy] - معرف مقدم الطلب
 * @property {string} [reportedDate] - تاريخ تقديم الطلب
 * @property {string} [assignedTo] - معرف الفني المسؤول
 * @property {string} [assignedDate] - تاريخ الإسناد
 * @property {string} [scheduledDate] - التاريخ المجدول
 * @property {string} [startDate] - تاريخ البدء
 * @property {string} [completionDate] - تاريخ الإكمال
 * @property {string} [problem] - المشكلة
 * @property {string} [solution] - الحل
 * @property {string} [rootCause] - السبب الجذري
 * @property {number} [estimatedCost] - التكلفة المقدرة
 * @property {number} [actualCost] - التكلفة الفعلية
 * @property {string} [currency] - العملة
 * @property {number} [estimatedHours] - الساعات المقدرة
 * @property {number} [actualHours] - الساعات الفعلية
 * @property {string} [feedback] - التغذية الراجعة
 * @property {number} [rating] - التقييم
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceWorkOrder
 * @property {string} id - معرف أمر العمل
 * @property {string} workOrderNumber - رقم أمر العمل
 * @property {string} [title] - عنوان أمر العمل
 * @property {string} [description] - وصف أمر العمل
 * @property {string} [requestId] - معرف طلب الصيانة
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [locationId] - معرف الموقع
 * @property {string} [workOrderType] - نوع أمر العمل (إصلاح، صيانة وقائية، فحص، تركيب)
 * @property {string} [priority] - الأولوية (منخفضة، متوسطة، عالية، طارئة)
 * @property {string} status - حالة أمر العمل (مخطط، قيد التنفيذ، معلق، مكتمل، ملغي)
 * @property {string} [assignedTo] - معرف الفني المسؤول
 * @property {string} [assignedDate] - تاريخ الإسناد
 * @property {string} [scheduledStartDate] - تاريخ البدء المجدول
 * @property {string} [scheduledEndDate] - تاريخ الانتهاء المجدول
 * @property {string} [actualStartDate] - تاريخ البدء الفعلي
 * @property {string} [actualEndDate] - تاريخ الانتهاء الفعلي
 * @property {number} [estimatedCost] - التكلفة المقدرة
 * @property {number} [actualCost] - التكلفة الفعلية
 * @property {string} [currency] - العملة
 * @property {number} [estimatedHours] - الساعات المقدرة
 * @property {number} [actualHours] - الساعات الفعلية
 * @property {string} [instructions] - التعليمات
 * @property {string} [safetyNotes] - ملاحظات السلامة
 * @property {string} [completionNotes] - ملاحظات الإكمال
 * @property {MaintenanceTask[]} [tasks] - المهام
 * @property {MaintenancePart[]} [parts] - القطع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ أمر العمل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceTask
 * @property {string} id - معرف المهمة
 * @property {string} workOrderId - معرف أمر العمل
 * @property {string} [taskCode] - رمز المهمة
 * @property {string} description - وصف المهمة
 * @property {string} [instructions] - التعليمات
 * @property {string} [category] - فئة المهمة
 * @property {string} [status] - حالة المهمة (معلقة، قيد التنفيذ، مكتملة، ملغاة)
 * @property {string} [assignedTo] - معرف الفني المسؤول
 * @property {number} [estimatedHours] - الساعات المقدرة
 * @property {number} [actualHours] - الساعات الفعلية
 * @property {string} [startDate] - تاريخ البدء
 * @property {string} [completionDate] - تاريخ الإكمال
 * @property {string} [result] - النتيجة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} MaintenancePart
 * @property {string} id - معرف القطعة
 * @property {string} workOrderId - معرف أمر العمل
 * @property {string} [partId] - معرف القطعة في المخزون
 * @property {string} [partNumber] - رقم القطعة
 * @property {string} description - وصف القطعة
 * @property {number} quantity - الكمية
 * @property {string} [unit] - الوحدة
 * @property {number} [unitCost] - تكلفة الوحدة
 * @property {number} [totalCost] - التكلفة الإجمالية
 * @property {string} [currency] - العملة
 * @property {string} [status] - حالة القطعة (مطلوبة، متوفرة، مستخدمة، مرتجعة)
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PreventiveMaintenance
 * @property {string} id - معرف الصيانة الوقائية
 * @property {string} pmNumber - رقم الصيانة الوقائية
 * @property {string} title - عنوان الصيانة الوقائية
 * @property {string} [description] - وصف الصيانة الوقائية
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [assetCategoryId] - معرف فئة الأصل
 * @property {string} [frequency] - التكرار (يومي، أسبوعي، شهري، ربع سنوي، نصف سنوي، سنوي)
 * @property {number} [interval] - الفاصل الزمني
 * @property {string} [intervalUnit] - وحدة الفاصل الزمني
 * @property {string} [startDate] - تاريخ البدء
 * @property {string} [endDate] - تاريخ الانتهاء
 * @property {string} [lastCompletionDate] - تاريخ آخر إكمال
 * @property {string} [nextDueDate] - تاريخ الاستحقاق القادم
 * @property {string} [status] - حالة الصيانة الوقائية (نشطة، غير نشطة، معلقة)
 * @property {string} [assignedTo] - معرف الفني المسؤول
 * @property {number} [estimatedHours] - الساعات المقدرة
 * @property {string} [instructions] - التعليمات
 * @property {string} [safetyNotes] - ملاحظات السلامة
 * @property {PreventiveMaintenanceTask[]} [tasks] - المهام
 * @property {PreventiveMaintenancePart[]} [parts] - القطع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الصيانة الوقائية
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} PreventiveMaintenanceTask
 * @property {string} id - معرف المهمة
 * @property {string} pmId - معرف الصيانة الوقائية
 * @property {string} [taskCode] - رمز المهمة
 * @property {string} description - وصف المهمة
 * @property {string} [instructions] - التعليمات
 * @property {string} [category] - فئة المهمة
 * @property {number} [estimatedHours] - الساعات المقدرة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PreventiveMaintenancePart
 * @property {string} id - معرف القطعة
 * @property {string} pmId - معرف الصيانة الوقائية
 * @property {string} [partId] - معرف القطعة في المخزون
 * @property {string} [partNumber] - رقم القطعة
 * @property {string} description - وصف القطعة
 * @property {number} quantity - الكمية
 * @property {string} [unit] - الوحدة
 * @property {number} [unitCost] - تكلفة الوحدة
 * @property {string} [currency] - العملة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} MaintenanceSchedule
 * @property {string} id - معرف جدول الصيانة
 * @property {string} [pmId] - معرف الصيانة الوقائية
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [title] - عنوان الجدول
 * @property {string} [description] - وصف الجدول
 * @property {string} scheduledDate - التاريخ المجدول
 * @property {string} [status] - حالة الجدول (مخطط، قيد التنفيذ، مكتمل، ملغي)
 * @property {string} [workOrderId] - معرف أمر العمل
 * @property {string} [assignedTo] - معرف الفني المسؤول
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceChecklist
 * @property {string} id - معرف قائمة التحقق
 * @property {string} code - رمز قائمة التحقق
 * @property {string} name - اسم قائمة التحقق
 * @property {string} [description] - وصف قائمة التحقق
 * @property {string} [category] - فئة قائمة التحقق
 * @property {string} [assetTypeId] - معرف نوع الأصل
 * @property {string} [maintenanceType] - نوع الصيانة
 * @property {MaintenanceChecklistItem[]} items - عناصر قائمة التحقق
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ قائمة التحقق
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceChecklistItem
 * @property {string} id - معرف عنصر قائمة التحقق
 * @property {string} checklistId - معرف قائمة التحقق
 * @property {string} description - وصف العنصر
 * @property {string} [instructions] - التعليمات
 * @property {string} [category] - فئة العنصر
 * @property {string} [type] - نوع العنصر (تحقق، قياس، ملاحظة)
 * @property {string} [unit] - وحدة القياس
 * @property {number} [minValue] - القيمة الدنيا
 * @property {number} [maxValue] - القيمة القصوى
 * @property {string} [expectedValue] - القيمة المتوقعة
 * @property {boolean} [isMandatory] - إلزامي
 * @property {number} [sequenceNumber] - رقم التسلسل
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} MaintenanceChecklistResult
 * @property {string} id - معرف نتيجة قائمة التحقق
 * @property {string} workOrderId - معرف أمر العمل
 * @property {string} checklistId - معرف قائمة التحقق
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [completedBy] - معرف منفذ القائمة
 * @property {string} [completedDate] - تاريخ الإكمال
 * @property {string} [status] - حالة النتيجة (مكتملة، غير مكتملة)
 * @property {MaintenanceChecklistItemResult[]} itemResults - نتائج عناصر القائمة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceChecklistItemResult
 * @property {string} id - معرف نتيجة عنصر القائمة
 * @property {string} checklistResultId - معرف نتيجة القائمة
 * @property {string} checklistItemId - معرف عنصر القائمة
 * @property {string} [status] - حالة النتيجة (مقبول، مرفوض، غير منطبق)
 * @property {string} [value] - القيمة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} Meter
 * @property {string} id - معرف العداد
 * @property {string} code - رمز العداد
 * @property {string} name - اسم العداد
 * @property {string} [description] - وصف العداد
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [meterType] - نوع العداد (تراكمي، قراءة مطلقة)
 * @property {string} [unit] - وحدة القياس
 * @property {number} [currentReading] - القراءة الحالية
 * @property {string} [lastReadingDate] - تاريخ آخر قراءة
 * @property {number} [minValue] - القيمة الدنيا
 * @property {number} [maxValue] - القيمة القصوى
 * @property {number} [warningThreshold] - عتبة التحذير
 * @property {number} [criticalThreshold] - عتبة الحرج
 * @property {string} [status] - حالة العداد (نشط، غير نشط)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MeterReading
 * @property {string} id - معرف القراءة
 * @property {string} meterId - معرف العداد
 * @property {number} reading - القراءة
 * @property {string} readingDate - تاريخ القراءة
 * @property {string} [readBy] - معرف القارئ
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
