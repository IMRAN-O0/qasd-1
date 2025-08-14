/**
 * @fileoverview تعريفات أنواع إدارة الموردين والمشتريات
 */

/**
 * @typedef {Object} Supplier
 * @property {string} id - معرف المورد
 * @property {string} code - رمز المورد
 * @property {string} name - اسم المورد
 * @property {string} [legalName] - الاسم القانوني للمورد
 * @property {string} [commercialRegistration] - رقم السجل التجاري
 * @property {string} [vatNumber] - الرقم الضريبي
 * @property {string} [supplierType] - نوع المورد (محلي، دولي، وكيل، موزع)
 * @property {string} [category] - فئة المورد
 * @property {string} [status] - حالة المورد (نشط، غير نشط، محظور)
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
 * @property {number} [rating] - تقييم المورد
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SupplierContact
 * @property {string} id - معرف جهة الاتصال
 * @property {string} supplierId - معرف المورد
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
 * @typedef {Object} SupplierEvaluation
 * @property {string} id - معرف التقييم
 * @property {string} supplierId - معرف المورد
 * @property {string} evaluationDate - تاريخ التقييم
 * @property {string} evaluatedBy - المقيم
 * @property {string} [period] - الفترة المقيمة
 * @property {number} qualityScore - درجة الجودة
 * @property {number} deliveryScore - درجة التسليم
 * @property {number} priceScore - درجة السعر
 * @property {number} serviceScore - درجة الخدمة
 * @property {number} totalScore - الدرجة الإجمالية
 * @property {string} [rating] - التصنيف (ممتاز، جيد، متوسط، ضعيف)
 * @property {string} [strengths] - نقاط القوة
 * @property {string} [weaknesses] - نقاط الضعف
 * @property {string} [recommendations] - التوصيات
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PurchaseRequest
 * @property {string} id - معرف طلب الشراء
 * @property {string} requestNumber - رقم طلب الشراء
 * @property {string} requestDate - تاريخ الطلب
 * @property {string} status - حالة الطلب (جديد، معتمد، مرفوض، مكتمل)
 * @property {string} requestedBy - مقدم الطلب
 * @property {string} [department] - القسم
 * @property {string} [project] - المشروع
 * @property {string} [approvedBy] - معتمد الطلب
 * @property {string} [approvalDate] - تاريخ الاعتماد
 * @property {string} [requiredDate] - التاريخ المطلوب
 * @property {string} [priority] - الأولوية (عادي، عاجل، حرج)
 * @property {PurchaseRequestItem[]} items - عناصر الطلب
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} PurchaseRequestItem
 * @property {string} id - معرف عنصر الطلب
 * @property {string} requestId - معرف طلب الشراء
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {number} [estimatedPrice] - السعر التقديري
 * @property {string} [currency] - العملة
 * @property {string} [status] - حالة العنصر
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id - معرف أمر الشراء
 * @property {string} orderNumber - رقم أمر الشراء
 * @property {string} orderDate - تاريخ الأمر
 * @property {string} [requestId] - معرف طلب الشراء المرتبط
 * @property {string} supplierId - معرف المورد
 * @property {string} status - حالة الأمر (مسودة، مرسل، مؤكد، ملغي، مكتمل)
 * @property {string} [expectedDeliveryDate] - تاريخ التسليم المتوقع
 * @property {string} [deliveryAddress] - عنوان التسليم
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [deliveryTerms] - شروط التسليم
 * @property {string} [currency] - العملة
 * @property {number} subtotal - المجموع الفرعي
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} [shippingAmount] - مبلغ الشحن
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {PurchaseOrderItem[]} items - عناصر أمر الشراء
 * @property {string} createdBy - منشئ الأمر
 * @property {string} [approvedBy] - معتمد الأمر
 * @property {string} [approvalDate] - تاريخ الاعتماد
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} PurchaseOrderItem
 * @property {string} id - معرف عنصر أمر الشراء
 * @property {string} orderId - معرف أمر الشراء
 * @property {string} [requestItemId] - معرف عنصر طلب الشراء
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
 * @typedef {Object} GoodsReceipt
 * @property {string} id - معرف استلام البضائع
 * @property {string} receiptNumber - رقم الاستلام
 * @property {string} receiptDate - تاريخ الاستلام
 * @property {string} [orderId] - معرف أمر الشراء المرتبط
 * @property {string} supplierId - معرف المورد
 * @property {string} [deliveryNoteNumber] - رقم إشعار التسليم
 * @property {string} status - حالة الاستلام (مسودة، مكتمل، مرفوض)
 * @property {string} receivedBy - مستلم البضائع
 * @property {string} [warehouseId] - معرف المستودع
 * @property {GoodsReceiptItem[]} items - عناصر الاستلام
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} GoodsReceiptItem
 * @property {string} id - معرف عنصر الاستلام
 * @property {string} receiptId - معرف استلام البضائع
 * @property {string} [orderItemId] - معرف عنصر أمر الشراء
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} expectedQuantity - الكمية المتوقعة
 * @property {number} receivedQuantity - الكمية المستلمة
 * @property {string} unit - وحدة القياس
 * @property {string} [status] - حالة العنصر (مقبول، مرفوض، مقبول جزئياً)
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {string} [expiryDate] - تاريخ انتهاء الصلاحية
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} SupplierInvoice
 * @property {string} id - معرف الفاتورة
 * @property {string} invoiceNumber - رقم الفاتورة
 * @property {string} invoiceDate - تاريخ الفاتورة
 * @property {string} supplierId - معرف المورد
 * @property {string} [orderId] - معرف أمر الشراء المرتبط
 * @property {string} [receiptId] - معرف استلام البضائع المرتبط
 * @property {string} status - حالة الفاتورة (مسجلة، معتمدة، مدفوعة، ملغاة)
 * @property {string} [dueDate] - تاريخ الاستحقاق
 * @property {string} currency - العملة
 * @property {number} subtotal - المجموع الفرعي
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {number} [paidAmount] - المبلغ المدفوع
 * @property {number} [remainingAmount] - المبلغ المتبقي
 * @property {SupplierInvoiceItem[]} items - عناصر الفاتورة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SupplierInvoiceItem
 * @property {string} id - معرف عنصر الفاتورة
 * @property {string} invoiceId - معرف الفاتورة
 * @property {string} [orderItemId] - معرف عنصر أمر الشراء
 * @property {string} [productId] - معرف المنتج
 * @property {string} description - وصف العنصر
 * @property {number} quantity - الكمية
 * @property {string} unit - وحدة القياس
 * @property {number} unitPrice - سعر الوحدة
 * @property {number} [taxRate] - نسبة الضريبة
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {number} [discountAmount] - مبلغ الخصم
 * @property {number} totalPrice - السعر الإجمالي
 */

/**
 * @typedef {Object} SupplierPayment
 * @property {string} id - معرف الدفعة
 * @property {string} paymentNumber - رقم الدفعة
 * @property {string} paymentDate - تاريخ الدفعة
 * @property {string} supplierId - معرف المورد
 * @property {string} [invoiceId] - معرف الفاتورة المرتبطة
 * @property {string} paymentMethod - طريقة الدفع (نقدي، شيك، تحويل بنكي، بطاقة ائتمان)
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} currency - العملة
 * @property {number} amount - المبلغ
 * @property {string} [bankAccount] - الحساب البنكي
 * @property {string} [checkNumber] - رقم الشيك
 * @property {string} [checkDate] - تاريخ الشيك
 * @property {string} status - حالة الدفعة (مسجلة، معتمدة، مصروفة، ملغاة)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الدفعة
 * @property {string} [approvedBy] - معتمد الدفعة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} SupplierContract
 * @property {string} id - معرف العقد
 * @property {string} contractNumber - رقم العقد
 * @property {string} supplierId - معرف المورد
 * @property {string} title - عنوان العقد
 * @property {string} type - نوع العقد (توريد، خدمات، صيانة، إطاري)
 * @property {string} status - حالة العقد (مسودة، نشط، منتهي، ملغي)
 * @property {string} startDate - تاريخ البدء
 * @property {string} endDate - تاريخ الانتهاء
 * @property {string} [renewalDate] - تاريخ التجديد
 * @property {string} [terminationDate] - تاريخ الإنهاء
 * @property {string} currency - العملة
 * @property {number} [value] - قيمة العقد
 * @property {string} [paymentTerms] - شروط الدفع
 * @property {string} [deliveryTerms] - شروط التسليم
 * @property {string} [warrantyTerms] - شروط الضمان
 * @property {string} [documentPath] - مسار مستند العقد
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ العقد
 * @property {string} [approvedBy] - معتمد العقد
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
