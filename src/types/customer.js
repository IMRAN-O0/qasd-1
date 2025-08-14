/**
 * @fileoverview تعريفات أنواع العملاء والمبيعات
 */

/**
 * @typedef {Object} Customer
 * @property {string} id - معرف العميل
 * @property {string} code - رمز العميل
 * @property {string} name - اسم العميل
 * @property {string} [legalName] - الاسم القانوني للعميل
 * @property {string} [commercialRegistration] - رقم السجل التجاري
 * @property {string} [vatNumber] - الرقم الضريبي
 * @property {string} [customerType] - نوع العميل (فرد، شركة، حكومي، موزع)
 * @property {string} [category] - فئة العميل
 * @property {string} [segment] - شريحة العميل
 * @property {string} [status] - حالة العميل (نشط، غير نشط، محظور)
 * @property {string} [website] - الموقع الإلكتروني
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [fax] - رقم الفاكس
 * @property {string} [address] - العنوان
 * @property {string} [city] - المدينة
 * @property {string} [country] - الدولة
 * @property {string} [postalCode] - الرمز البريدي
 * @property {string} [currency] - العملة
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [deliveryTerms] - شروط التسليم
 * @property {string} [creditLimit] - حد الائتمان
 * @property {string} [taxExempt] - معفى من الضريبة
 * @property {string} [taxExemptionNumber] - رقم الإعفاء الضريبي
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} CustomerContact
 * @property {string} id - معرف جهة الاتصال
 * @property {string} customerId - معرف العميل
 * @property {string} name - اسم جهة الاتصال
 * @property {string} position - المنصب
 * @property {string} [department] - القسم
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [mobile] - رقم الجوال
 * @property {boolean} isPrimary - جهة اتصال رئيسية
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} SalesQuote
 * @property {string} id - معرف عرض السعر
 * @property {string} quoteNumber - رقم عرض السعر
 * @property {string} quoteDate - تاريخ عرض السعر
 * @property {string} customerId - معرف العميل
 * @property {string} [customerContactId] - معرف جهة اتصال العميل
 * @property {string} status - حالة عرض السعر (مسودة، مرسل، مقبول، مرفوض، منتهي)
 * @property {string} validUntil - تاريخ انتهاء الصلاحية
 * @property {string} [opportunityId] - معرف الفرصة البيعية
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [deliveryTerms] - شروط التسليم
 * @property {string} currency - العملة
 * @property {number} subtotal - المجموع الفرعي
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {SalesQuoteItem[]} items - عناصر عرض السعر
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ عرض السعر
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SalesQuoteItem
 * @property {string} id - معرف عنصر عرض السعر
 * @property {string} quoteId - معرف عرض السعر
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {number} unitPrice - سعر الوحدة
 * @property {number} [taxRate] - نسبة الضريبة
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountRate] - نسبة الخصم
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalPrice - السعر الإجمالي
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} SalesOrder
 * @property {string} id - معرف أمر البيع
 * @property {string} orderNumber - رقم أمر البيع
 * @property {string} orderDate - تاريخ الأمر
 * @property {string} customerId - معرف العميل
 * @property {string} [customerContactId] - معرف جهة اتصال العميل
 * @property {string} [quoteId] - معرف عرض السعر المرتبط
 * @property {string} status - حالة أمر البيع (مسودة، مؤكد، قيد التنفيذ، مكتمل، ملغي)
 * @property {string} [expectedDeliveryDate] - تاريخ التسليم المتوقع
 * @property {string} [deliveryAddress] - عنوان التسليم
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [deliveryTerms] - شروط التسليم
 * @property {string} currency - العملة
 * @property {number} subtotal - المجموع الفرعي
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} [shippingAmount] - مبلغ الشحن
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {SalesOrderItem[]} items - عناصر أمر البيع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الأمر
 * @property {string} [approvedBy] - معتمد الأمر
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SalesOrderItem
 * @property {string} id - معرف عنصر أمر البيع
 * @property {string} orderId - معرف أمر البيع
 * @property {string} [quoteItemId] - معرف عنصر عرض السعر
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {number} unitPrice - سعر الوحدة
 * @property {number} [taxRate] - نسبة الضريبة
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountRate] - نسبة الخصم
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalPrice - السعر الإجمالي
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} Delivery
 * @property {string} id - معرف التسليم
 * @property {string} deliveryNumber - رقم التسليم
 * @property {string} deliveryDate - تاريخ التسليم
 * @property {string} [orderId] - معرف أمر البيع المرتبط
 * @property {string} customerId - معرف العميل
 * @property {string} status - حالة التسليم (مخطط، قيد التنفيذ، مكتمل، ملغي)
 * @property {string} [warehouseId] - معرف المستودع
 * @property {string} [shippingMethod] - طريقة الشحن
 * @property {string} [trackingNumber] - رقم التتبع
 * @property {string} [carrier] - شركة النقل
 * @property {string} [deliveryAddress] - عنوان التسليم
 * @property {DeliveryItem[]} items - عناصر التسليم
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ التسليم
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} DeliveryItem
 * @property {string} id - معرف عنصر التسليم
 * @property {string} deliveryId - معرف التسليم
 * @property {string} [orderItemId] - معرف عنصر أمر البيع
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} orderedQuantity - الكمية المطلوبة
 * @property {number} deliveredQuantity - الكمية المسلمة
 * @property {string} unit - وحدة القياس
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {string} [serialNumber] - الرقم التسلسلي
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} CustomerInvoice
 * @property {string} id - معرف الفاتورة
 * @property {string} invoiceNumber - رقم الفاتورة
 * @property {string} invoiceDate - تاريخ الفاتورة
 * @property {string} customerId - معرف العميل
 * @property {string} [orderId] - معرف أمر البيع المرتبط
 * @property {string} [deliveryId] - معرف التسليم المرتبط
 * @property {string} status - حالة الفاتورة (مسودة، مصدرة، مدفوعة، ملغاة)
 * @property {string} [dueDate] - تاريخ الاستحقاق
 * @property {string} currency - العملة
 * @property {number} subtotal - المجموع الفرعي
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {number} [paidAmount] - المبلغ المدفوع
 * @property {number} [remainingAmount] - المبلغ المتبقي
 * @property {CustomerInvoiceItem[]} items - عناصر الفاتورة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الفاتورة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} CustomerInvoiceItem
 * @property {string} id - معرف عنصر الفاتورة
 * @property {string} invoiceId - معرف الفاتورة
 * @property {string} [orderItemId] - معرف عنصر أمر البيع
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {number} unitPrice - سعر الوحدة
 * @property {number} [taxRate] - نسبة الضريبة
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountRate] - نسبة الخصم
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalPrice - السعر الإجمالي
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} CustomerPayment
 * @property {string} id - معرف الدفعة
 * @property {string} paymentNumber - رقم الدفعة
 * @property {string} paymentDate - تاريخ الدفعة
 * @property {string} customerId - معرف العميل
 * @property {string} [invoiceId] - معرف الفاتورة المرتبطة
 * @property {string} paymentMethod - طريقة الدفع (نقدي، شيك، تحويل بنكي، بطاقة ائتمان)
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} currency - العملة
 * @property {number} amount - المبلغ
 * @property {string} [bankAccount] - الحساب البنكي
 * @property {string} [checkNumber] - رقم الشيك
 * @property {string} [checkDate] - تاريخ الشيك
 * @property {string} status - حالة الدفعة (مسجلة، معتمدة، محصلة، ملغاة)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الدفعة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SalesOpportunity
 * @property {string} id - معرف الفرصة
 * @property {string} opportunityNumber - رقم الفرصة
 * @property {string} title - عنوان الفرصة
 * @property {string} customerId - معرف العميل
 * @property {string} [customerContactId] - معرف جهة اتصال العميل
 * @property {string} status - حالة الفرصة (جديدة، مؤهلة، عرض سعر، مفاوضات، مغلقة-فوز، مغلقة-خسارة)
 * @property {string} [stage] - مرحلة الفرصة
 * @property {string} [source] - مصدر الفرصة
 * @property {string} [campaignId] - معرف الحملة
 * @property {string} [expectedCloseDate] - تاريخ الإغلاق المتوقع
 * @property {number} [probability] - احتمالية الفوز
 * @property {string} currency - العملة
 * @property {number} [estimatedValue] - القيمة التقديرية
 * @property {string} [assignedTo] - المسؤول عن الفرصة
 * @property {string} [lostReason] - سبب الخسارة
 * @property {string} [winReason] - سبب الفوز
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الفرصة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
