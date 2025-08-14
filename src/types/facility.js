/**
 * @fileoverview تعريفات أنواع إدارة المرافق والمباني
 */

/**
 * @typedef {Object} Facility
 * @property {string} id - معرف المرفق
 * @property {string} code - رمز المرفق
 * @property {string} name - اسم المرفق
 * @property {string} [nameAr] - اسم المرفق بالعربية
 * @property {string} [description] - وصف المرفق
 * @property {string} [type] - نوع المرفق (مبنى، مصنع، مستودع، مكتب، متجر)
 * @property {string} [status] - حالة المرفق (نشط، غير نشط، قيد الإنشاء، قيد الصيانة)
 * @property {string} [address] - العنوان
 * @property {string} [city] - المدينة
 * @property {string} [state] - المنطقة/المحافظة
 * @property {string} [country] - الدولة
 * @property {string} [postalCode] - الرمز البريدي
 * @property {number} [latitude] - خط العرض
 * @property {number} [longitude] - خط الطول
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [managerId] - معرف المدير المسؤول
 * @property {string} [parentFacilityId] - معرف المرفق الأب
 * @property {number} [totalArea] - المساحة الإجمالية
 * @property {string} [areaUnit] - وحدة المساحة
 * @property {string} [constructionDate] - تاريخ الإنشاء
 * @property {string} [acquisitionDate] - تاريخ الاستحواذ
 * @property {number} [acquisitionCost] - تكلفة الاستحواذ
 * @property {string} [currency] - العملة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Space
 * @property {string} id - معرف المساحة
 * @property {string} code - رمز المساحة
 * @property {string} name - اسم المساحة
 * @property {string} [nameAr] - اسم المساحة بالعربية
 * @property {string} [description] - وصف المساحة
 * @property {string} facilityId - معرف المرفق
 * @property {string} [floorId] - معرف الطابق
 * @property {string} [type] - نوع المساحة (مكتب، قاعة اجتماعات، مستودع، منطقة إنتاج، كافتيريا)
 * @property {string} [status] - حالة المساحة (نشطة، غير نشطة، قيد الإنشاء، قيد الصيانة)
 * @property {number} [area] - المساحة
 * @property {string} [areaUnit] - وحدة المساحة
 * @property {number} [capacity] - السعة
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [responsibleId] - معرف الشخص المسؤول
 * @property {string} [parentSpaceId] - معرف المساحة الأب
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Floor
 * @property {string} id - معرف الطابق
 * @property {string} code - رمز الطابق
 * @property {string} name - اسم الطابق
 * @property {string} [nameAr] - اسم الطابق بالعربية
 * @property {string} facilityId - معرف المرفق
 * @property {number} floorNumber - رقم الطابق
 * @property {string} [description] - وصف الطابق
 * @property {number} [area] - المساحة
 * @property {string} [areaUnit] - وحدة المساحة
 * @property {string} [status] - حالة الطابق
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} WorkRequest
 * @property {string} id - معرف طلب العمل
 * @property {string} requestNumber - رقم الطلب
 * @property {string} [title] - عنوان الطلب
 * @property {string} [description] - وصف الطلب
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [spaceId] - معرف المساحة
 * @property {string} [requestType] - نوع الطلب (إصلاح، صيانة، تنظيف، تعديل، تركيب)
 * @property {string} [category] - فئة الطلب
 * @property {string} [priority] - الأولوية (منخفضة، متوسطة، عالية، طارئة)
 * @property {string} status - حالة الطلب (جديد، معتمد، قيد التنفيذ، معلق، مكتمل، مرفوض)
 * @property {string} [requestedBy] - معرف مقدم الطلب
 * @property {string} [requestedDate] - تاريخ تقديم الطلب
 * @property {string} [assignedTo] - معرف الشخص المسؤول
 * @property {string} [assignedDate] - تاريخ الإسناد
 * @property {string} [scheduledDate] - التاريخ المجدول
 * @property {string} [completionDate] - تاريخ الإكمال
 * @property {string} [feedback] - التغذية الراجعة
 * @property {number} [rating] - التقييم
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Reservation
 * @property {string} id - معرف الحجز
 * @property {string} reservationNumber - رقم الحجز
 * @property {string} spaceId - معرف المساحة
 * @property {string} [title] - عنوان الحجز
 * @property {string} [description] - وصف الحجز
 * @property {string} startDateTime - تاريخ ووقت البدء
 * @property {string} endDateTime - تاريخ ووقت الانتهاء
 * @property {string} [status] - حالة الحجز (مؤكد، معلق، ملغي، مكتمل)
 * @property {string} requestedBy - معرف طالب الحجز
 * @property {string} [requestedDate] - تاريخ طلب الحجز
 * @property {string} [approvedBy] - معرف معتمد الحجز
 * @property {string} [approvedDate] - تاريخ اعتماد الحجز
 * @property {number} [attendees] - عدد الحضور
 * @property {string[]} [attendeeList] - قائمة الحضور
 * @property {string} [purpose] - الغرض من الحجز
 * @property {string} [department] - القسم
 * @property {boolean} [isRecurring] - هل الحجز متكرر
 * @property {string} [recurrencePattern] - نمط التكرار
 * @property {string} [recurrenceEndDate] - تاريخ انتهاء التكرار
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Inspection
 * @property {string} id - معرف التفتيش
 * @property {string} inspectionNumber - رقم التفتيش
 * @property {string} [title] - عنوان التفتيش
 * @property {string} [description] - وصف التفتيش
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [spaceId] - معرف المساحة
 * @property {string} [assetId] - معرف الأصل
 * @property {string} [inspectionType] - نوع التفتيش (دوري، طارئ، قانوني)
 * @property {string} [category] - فئة التفتيش
 * @property {string} [checklistId] - معرف قائمة التحقق
 * @property {string} [status] - حالة التفتيش (مخطط، قيد التنفيذ، مكتمل، معلق)
 * @property {string} [scheduledDate] - التاريخ المجدول
 * @property {string} [assignedTo] - معرف الشخص المسؤول
 * @property {string} [assignedDate] - تاريخ الإسناد
 * @property {string} [completedBy] - معرف منفذ التفتيش
 * @property {string} [completedDate] - تاريخ الإكمال
 * @property {string} [result] - نتيجة التفتيش (مقبول، مرفوض، يحتاج إلى إصلاح)
 * @property {string} [notes] - ملاحظات
 * @property {InspectionItem[]} [items] - عناصر التفتيش
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} InspectionItem
 * @property {string} id - معرف عنصر التفتيش
 * @property {string} inspectionId - معرف التفتيش
 * @property {string} [checklistItemId] - معرف عنصر قائمة التحقق
 * @property {string} description - وصف العنصر
 * @property {string} [status] - حالة العنصر (مقبول، مرفوض، غير منطبق)
 * @property {string} [value] - القيمة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} Utility
 * @property {string} id - معرف المرفق العام
 * @property {string} code - رمز المرفق العام
 * @property {string} name - اسم المرفق العام
 * @property {string} [nameAr] - اسم المرفق العام بالعربية
 * @property {string} [description] - وصف المرفق العام
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [type] - نوع المرفق العام (كهرباء، ماء، غاز، تدفئة، تبريد)
 * @property {string} [provider] - مزود الخدمة
 * @property {string} [accountNumber] - رقم الحساب
 * @property {string} [meterNumber] - رقم العداد
 * @property {string} [status] - حالة المرفق العام
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} UtilityReading
 * @property {string} id - معرف القراءة
 * @property {string} utilityId - معرف المرفق العام
 * @property {number} reading - القراءة
 * @property {string} readingDate - تاريخ القراءة
 * @property {string} [readBy] - معرف القارئ
 * @property {number} [consumption] - الاستهلاك
 * @property {number} [cost] - التكلفة
 * @property {string} [currency] - العملة
 * @property {string} [billingPeriodStart] - بداية فترة الفوترة
 * @property {string} [billingPeriodEnd] - نهاية فترة الفوترة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Contract
 * @property {string} id - معرف العقد
 * @property {string} contractNumber - رقم العقد
 * @property {string} title - عنوان العقد
 * @property {string} [description] - وصف العقد
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [type] - نوع العقد (صيانة، تنظيف، أمن، تأجير)
 * @property {string} [category] - فئة العقد
 * @property {string} [vendorId] - معرف المورد
 * @property {string} startDate - تاريخ بدء العقد
 * @property {string} endDate - تاريخ انتهاء العقد
 * @property {string} [renewalDate] - تاريخ التجديد
 * @property {string} [terminationDate] - تاريخ الإنهاء
 * @property {string} [status] - حالة العقد (نشط، منتهي، ملغي، قيد التجديد)
 * @property {number} [value] - قيمة العقد
 * @property {string} [currency] - العملة
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [paymentFrequency] - تكرار الدفع
 * @property {string} [responsibleId] - معرف الشخص المسؤول
 * @property {string} [approvedBy] - معرف معتمد العقد
 * @property {string} [approvedDate] - تاريخ الاعتماد
 * @property {string} [documentUrl] - رابط المستند
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} ContractPayment
 * @property {string} id - معرف الدفعة
 * @property {string} contractId - معرف العقد
 * @property {string} paymentNumber - رقم الدفعة
 * @property {string} [description] - وصف الدفعة
 * @property {number} amount - المبلغ
 * @property {string} [currency] - العملة
 * @property {string} dueDate - تاريخ الاستحقاق
 * @property {string} [paymentDate] - تاريخ الدفع
 * @property {string} [status] - حالة الدفعة (مستحقة، مدفوعة، متأخرة، ملغاة)
 * @property {string} [paymentMethod] - طريقة الدفع
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} SecurityIncident
 * @property {string} id - معرف الحادث
 * @property {string} incidentNumber - رقم الحادث
 * @property {string} [title] - عنوان الحادث
 * @property {string} [description] - وصف الحادث
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [spaceId] - معرف المساحة
 * @property {string} [type] - نوع الحادث (سرقة، اقتحام، حريق، تخريب)
 * @property {string} [severity] - شدة الحادث (منخفضة، متوسطة، عالية، حرجة)
 * @property {string} incidentDate - تاريخ الحادث
 * @property {string} [reportedBy] - معرف مبلغ الحادث
 * @property {string} [reportedDate] - تاريخ الإبلاغ
 * @property {string} [status] - حالة الحادث (مفتوح، قيد التحقيق، مغلق)
 * @property {string} [assignedTo] - معرف الشخص المسؤول
 * @property {string} [assignedDate] - تاريخ الإسناد
 * @property {string} [resolutionDate] - تاريخ الحل
 * @property {string} [resolution] - الحل
 * @property {string} [actionTaken] - الإجراء المتخذ
 * @property {boolean} [isReportedToAuthorities] - هل تم الإبلاغ للسلطات
 * @property {string} [authorityReportNumber] - رقم بلاغ السلطات
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} KeyManagement
 * @property {string} id - معرف المفتاح
 * @property {string} keyNumber - رقم المفتاح
 * @property {string} [description] - وصف المفتاح
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [spaceId] - معرف المساحة
 * @property {string} [type] - نوع المفتاح (مفتاح عادي، بطاقة، رمز)
 * @property {string} [status] - حالة المفتاح (متاح، مستعار، مفقود، معطل)
 * @property {string} [issuedTo] - معرف الشخص المستلم
 * @property {string} [issuedDate] - تاريخ الإصدار
 * @property {string} [returnDate] - تاريخ الإرجاع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} Visitor
 * @property {string} id - معرف الزائر
 * @property {string} [visitorNumber] - رقم الزائر
 * @property {string} name - اسم الزائر
 * @property {string} [company] - الشركة
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [idType] - نوع الهوية
 * @property {string} [idNumber] - رقم الهوية
 * @property {string} [photo] - الصورة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

/**
 * @typedef {Object} VisitorLog
 * @property {string} id - معرف سجل الزيارة
 * @property {string} [logNumber] - رقم السجل
 * @property {string} visitorId - معرف الزائر
 * @property {string} [facilityId] - معرف المرفق
 * @property {string} [hostId] - معرف المضيف
 * @property {string} [purpose] - الغرض من الزيارة
 * @property {string} checkInTime - وقت الدخول
 * @property {string} [checkOutTime] - وقت الخروج
 * @property {string} [badgeNumber] - رقم البطاقة
 * @property {string} [status] - حالة الزيارة (نشطة، مكتملة، ملغاة)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ إنشاء السجل
 * @property {string} updatedAt - تاريخ تحديث السجل
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
