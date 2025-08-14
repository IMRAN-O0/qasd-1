/**
 * @fileoverview تعريفات أنواع الخدمات اللوجستية والنقل
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} id - معرف المركبة
 * @property {string} code - رمز المركبة
 * @property {string} plateNumber - رقم اللوحة
 * @property {string} [plateType] - نوع اللوحة
 * @property {string} [registrationNumber] - رقم التسجيل
 * @property {string} [vin] - رقم الهيكل
 * @property {string} [make] - الشركة المصنعة
 * @property {string} [model] - الطراز
 * @property {string} [year] - سنة الصنع
 * @property {string} [color] - اللون
 * @property {string} [type] - نوع المركبة (شاحنة، سيارة، دراجة نارية)
 * @property {string} [category] - فئة المركبة
 * @property {string} [status] - حالة المركبة (متاحة، قيد الاستخدام، في الصيانة، غير صالحة)
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [assignedTo] - معرف الموظف المسؤول
 * @property {number} [capacity] - السعة
 * @property {string} [capacityUnit] - وحدة السعة
 * @property {number} [fuelCapacity] - سعة الوقود
 * @property {string} [fuelType] - نوع الوقود
 * @property {number} [odometer] - قراءة العداد
 * @property {string} [purchaseDate] - تاريخ الشراء
 * @property {number} [purchasePrice] - سعر الشراء
 * @property {string} [registrationExpiryDate] - تاريخ انتهاء التسجيل
 * @property {string} [insuranceExpiryDate] - تاريخ انتهاء التأمين
 * @property {string} [insuranceProvider] - مزود التأمين
 * @property {string} [insurancePolicyNumber] - رقم بوليصة التأمين
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Driver
 * @property {string} id - معرف السائق
 * @property {string} employeeId - معرف الموظف
 * @property {string} fullName - الاسم الكامل
 * @property {string} [licenseNumber] - رقم الرخصة
 * @property {string} [licenseType] - نوع الرخصة
 * @property {string} [licenseExpiryDate] - تاريخ انتهاء الرخصة
 * @property {string} [licenseIssuingCountry] - بلد إصدار الرخصة
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [mobile] - رقم الجوال
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [address] - العنوان
 * @property {string} [city] - المدينة
 * @property {string} [country] - الدولة
 * @property {string} [status] - الحالة (متاح، مشغول، في إجازة، غير نشط)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Route
 * @property {string} id - معرف المسار
 * @property {string} code - رمز المسار
 * @property {string} name - اسم المسار
 * @property {string} [description] - وصف المسار
 * @property {string} startLocation - موقع البداية
 * @property {string} endLocation - موقع النهاية
 * @property {RouteStop[]} [stops] - محطات التوقف
 * @property {number} [distance] - المسافة
 * @property {string} [distanceUnit] - وحدة المسافة
 * @property {number} [estimatedDuration] - المدة المقدرة
 * @property {string} [durationUnit] - وحدة المدة
 * @property {string} [status] - حالة المسار (نشط، غير نشط)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} RouteStop
 * @property {string} id - معرف محطة التوقف
 * @property {string} routeId - معرف المسار
 * @property {string} name - اسم المحطة
 * @property {string} [description] - وصف المحطة
 * @property {string} [location] - الموقع
 * @property {number} [sequenceNumber] - رقم التسلسل
 * @property {number} [distanceFromStart] - المسافة من نقطة البداية
 * @property {number} [estimatedDuration] - المدة المقدرة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} Shipment
 * @property {string} id - معرف الشحنة
 * @property {string} shipmentNumber - رقم الشحنة
 * @property {string} [referenceNumber] - الرقم المرجعي
 * @property {string} [type] - نوع الشحنة (صادرة، واردة، داخلية)
 * @property {string} [status] - حالة الشحنة (مخططة، قيد التنفيذ، مكتملة، ملغاة)
 * @property {string} [priority] - الأولوية (عادية، عالية، منخفضة)
 * @property {string} [customerId] - معرف العميل
 * @property {string} [supplierId] - معرف المورد
 * @property {string} [warehouseId] - معرف المستودع
 * @property {string} [sourceLocationId] - معرف موقع المصدر
 * @property {string} [destinationLocationId] - معرف موقع الوجهة
 * @property {string} [routeId] - معرف المسار
 * @property {string} [vehicleId] - معرف المركبة
 * @property {string} [driverId] - معرف السائق
 * @property {string} [scheduledDate] - التاريخ المجدول
 * @property {string} [scheduledTime] - الوقت المجدول
 * @property {string} [actualDepartureDate] - تاريخ المغادرة الفعلي
 * @property {string} [actualArrivalDate] - تاريخ الوصول الفعلي
 * @property {number} [totalWeight] - الوزن الإجمالي
 * @property {string} [weightUnit] - وحدة الوزن
 * @property {number} [totalVolume] - الحجم الإجمالي
 * @property {string} [volumeUnit] - وحدة الحجم
 * @property {number} [totalItems] - إجمالي العناصر
 * @property {number} [totalPackages] - إجمالي الطرود
 * @property {number} [totalCost] - التكلفة الإجمالية
 * @property {string} [currency] - العملة
 * @property {ShipmentItem[]} items - عناصر الشحنة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الشحنة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} ShipmentItem
 * @property {string} id - معرف عنصر الشحنة
 * @property {string} shipmentId - معرف الشحنة
 * @property {string} [productId] - معرف المنتج
 * @property {string} [description] - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} [unit] - الوحدة
 * @property {number} [weight] - الوزن
 * @property {string} [weightUnit] - وحدة الوزن
 * @property {number} [volume] - الحجم
 * @property {string} [volumeUnit] - وحدة الحجم
 * @property {number} [declaredValue] - القيمة المعلنة
 * @property {string} [currency] - العملة
 * @property {string} [trackingNumber] - رقم التتبع
 * @property {string} [status] - الحالة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} DeliveryTrip
 * @property {string} id - معرف رحلة التوصيل
 * @property {string} tripNumber - رقم الرحلة
 * @property {string} [description] - وصف الرحلة
 * @property {string} [status] - حالة الرحلة (مخططة، قيد التنفيذ، مكتملة، ملغاة)
 * @property {string} [vehicleId] - معرف المركبة
 * @property {string} [driverId] - معرف السائق
 * @property {string} [routeId] - معرف المسار
 * @property {string} scheduledDate - التاريخ المجدول
 * @property {string} [scheduledStartTime] - وقت البدء المجدول
 * @property {string} [scheduledEndTime] - وقت الانتهاء المجدول
 * @property {string} [actualStartTime] - وقت البدء الفعلي
 * @property {string} [actualEndTime] - وقت الانتهاء الفعلي
 * @property {number} [odometer] - قراءة العداد
 * @property {number} [fuelConsumed] - الوقود المستهلك
 * @property {number} [totalDistance] - المسافة الإجمالية
 * @property {string} [distanceUnit] - وحدة المسافة
 * @property {number} [totalDuration] - المدة الإجمالية
 * @property {string} [durationUnit] - وحدة المدة
 * @property {DeliveryStop[]} stops - محطات التوصيل
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الرحلة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} DeliveryStop
 * @property {string} id - معرف محطة التوصيل
 * @property {string} tripId - معرف الرحلة
 * @property {string} [shipmentId] - معرف الشحنة
 * @property {string} [orderId] - معرف الطلب
 * @property {string} [customerId] - معرف العميل
 * @property {string} [supplierId] - معرف المورد
 * @property {string} [locationId] - معرف الموقع
 * @property {string} [address] - العنوان
 * @property {string} [contactName] - اسم جهة الاتصال
 * @property {string} [contactPhone] - هاتف جهة الاتصال
 * @property {number} sequenceNumber - رقم التسلسل
 * @property {string} [scheduledArrivalTime] - وقت الوصول المجدول
 * @property {string} [actualArrivalTime] - وقت الوصول الفعلي
 * @property {string} [departureTime] - وقت المغادرة
 * @property {string} [status] - الحالة (معلق، تم التوصيل، فشل التوصيل)
 * @property {string} [failureReason] - سبب الفشل
 * @property {string} [notes] - ملاحظات
 * @property {string} [signature] - التوقيع
 * @property {string} [proofOfDelivery] - إثبات التسليم
 */

/**
 * @typedef {Object} MaintenanceRecord
 * @property {string} id - معرف سجل الصيانة
 * @property {string} recordNumber - رقم السجل
 * @property {string} vehicleId - معرف المركبة
 * @property {string} [type] - نوع الصيانة (وقائية، تصحيحية، دورية)
 * @property {string} [category] - فئة الصيانة
 * @property {string} [description] - وصف الصيانة
 * @property {string} date - تاريخ الصيانة
 * @property {number} [odometer] - قراءة العداد
 * @property {string} [status] - حالة الصيانة (مخططة، قيد التنفيذ، مكتملة، ملغاة)
 * @property {string} [serviceProvider] - مزود الخدمة
 * @property {string} [technicianName] - اسم الفني
 * @property {number} [cost] - التكلفة
 * @property {string} [currency] - العملة
 * @property {string} [invoiceNumber] - رقم الفاتورة
 * @property {string} [nextServiceDate] - تاريخ الخدمة التالية
 * @property {number} [nextServiceOdometer] - قراءة العداد للخدمة التالية
 * @property {MaintenanceTask[]} [tasks] - مهام الصيانة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ السجل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} MaintenanceTask
 * @property {string} id - معرف مهمة الصيانة
 * @property {string} maintenanceId - معرف سجل الصيانة
 * @property {string} [taskCode] - رمز المهمة
 * @property {string} description - وصف المهمة
 * @property {string} [category] - فئة المهمة
 * @property {string} [status] - حالة المهمة (معلقة، مكتملة، ملغاة)
 * @property {string} [technicianName] - اسم الفني
 * @property {number} [laborHours] - ساعات العمل
 * @property {number} [partsCost] - تكلفة القطع
 * @property {number} [laborCost] - تكلفة العمل
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} FuelRecord
 * @property {string} id - معرف سجل الوقود
 * @property {string} vehicleId - معرف المركبة
 * @property {string} [driverId] - معرف السائق
 * @property {string} date - تاريخ التعبئة
 * @property {number} [odometer] - قراءة العداد
 * @property {number} quantity - كمية الوقود
 * @property {string} [unit] - وحدة القياس
 * @property {number} [unitPrice] - سعر الوحدة
 * @property {number} [totalCost] - التكلفة الإجمالية
 * @property {string} [currency] - العملة
 * @property {string} [fuelType] - نوع الوقود
 * @property {string} [fuelStation] - محطة الوقود
 * @property {string} [invoiceNumber] - رقم الفاتورة
 * @property {boolean} [isFull] - تعبئة كاملة
 * @property {number} [tripDistance] - مسافة الرحلة
 * @property {number} [fuelEfficiency] - كفاءة الوقود
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ السجل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} TransportationCost
 * @property {string} id - معرف تكلفة النقل
 * @property {string} [vehicleId] - معرف المركبة
 * @property {string} [routeId] - معرف المسار
 * @property {string} [shipmentId] - معرف الشحنة
 * @property {string} [tripId] - معرف الرحلة
 * @property {string} [description] - وصف التكلفة
 * @property {string} [category] - فئة التكلفة
 * @property {string} date - تاريخ التكلفة
 * @property {number} amount - المبلغ
 * @property {string} [currency] - العملة
 * @property {string} [paymentMethod] - طريقة الدفع
 * @property {string} [paymentStatus] - حالة الدفع
 * @property {string} [invoiceNumber] - رقم الفاتورة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ السجل
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
