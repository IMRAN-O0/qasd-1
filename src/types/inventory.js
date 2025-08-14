/**
 * @fileoverview تعريفات أنواع المخزون والمستودعات
 */

/**
 * @typedef {Object} Product
 * @property {string} id - معرف المنتج
 * @property {string} code - رمز المنتج
 * @property {string} name - اسم المنتج
 * @property {string} description - وصف المنتج
 * @property {string} category - فئة المنتج
 * @property {string} [subcategory] - الفئة الفرعية للمنتج
 * @property {string} unit - وحدة القياس
 * @property {number} price - سعر المنتج
 * @property {number} cost - تكلفة المنتج
 * @property {number} minStock - الحد الأدنى للمخزون
 * @property {number} maxStock - الحد الأقصى للمخزون
 * @property {string} [barcode] - الباركود
 * @property {string[]} [images] - صور المنتج
 * @property {boolean} isActive - حالة نشاط المنتج
 * @property {string} createdAt - تاريخ إنشاء المنتج
 * @property {string} updatedAt - تاريخ تحديث المنتج
 */

/**
 * @typedef {Object} Warehouse
 * @property {string} id - معرف المستودع
 * @property {string} code - رمز المستودع
 * @property {string} name - اسم المستودع
 * @property {string} location - موقع المستودع
 * @property {string} [manager] - مدير المستودع
 * @property {boolean} isActive - حالة نشاط المستودع
 * @property {number} capacity - سعة المستودع
 * @property {string} createdAt - تاريخ إنشاء المستودع
 * @property {string} updatedAt - تاريخ تحديث المستودع
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id - معرف عنصر المخزون
 * @property {string} productId - معرف المنتج
 * @property {string} warehouseId - معرف المستودع
 * @property {number} quantity - الكمية المتوفرة
 * @property {number} [reservedQuantity] - الكمية المحجوزة
 * @property {string} [location] - موقع التخزين داخل المستودع
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {string} [expiryDate] - تاريخ انتهاء الصلاحية
 * @property {string} lastStockTake - تاريخ آخر جرد
 * @property {string} updatedAt - تاريخ تحديث المخزون
 */

/**
 * @typedef {Object} StockMovement
 * @property {string} id - معرف حركة المخزون
 * @property {string} productId - معرف المنتج
 * @property {string} warehouseId - معرف المستودع
 * @property {string} type - نوع الحركة (إضافة، سحب، تحويل، تعديل)
 * @property {number} quantity - الكمية
 * @property {string} [referenceId] - معرف المرجع (طلب، فاتورة، إلخ)
 * @property {string} [referenceType] - نوع المرجع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الحركة
 * @property {string} createdAt - تاريخ إنشاء الحركة
 */

/**
 * @typedef {Object} StockTransfer
 * @property {string} id - معرف عملية النقل
 * @property {string} sourceWarehouseId - معرف المستودع المصدر
 * @property {string} destinationWarehouseId - معرف المستودع الوجهة
 * @property {StockTransferItem[]} items - عناصر النقل
 * @property {string} status - حالة النقل (مطلوب، قيد التنفيذ، مكتمل، ملغي)
 * @property {string} [notes] - ملاحظات
 * @property {string} requestedBy - طالب النقل
 * @property {string} [approvedBy] - معتمد النقل
 * @property {string} requestDate - تاريخ الطلب
 * @property {string} [completionDate] - تاريخ الإكمال
 */

/**
 * @typedef {Object} StockTransferItem
 * @property {string} productId - معرف المنتج
 * @property {number} quantity - الكمية
 * @property {string} [batchNumber] - رقم الدفعة
 * @property {boolean} [isTransferred] - حالة النقل
 */

/**
 * @typedef {Object} StockTake
 * @property {string} id - معرف الجرد
 * @property {string} warehouseId - معرف المستودع
 * @property {string} status - حالة الجرد (مخطط، قيد التنفيذ، مكتمل)
 * @property {StockTakeItem[]} items - عناصر الجرد
 * @property {string} startDate - تاريخ بدء الجرد
 * @property {string} [endDate] - تاريخ انتهاء الجرد
 * @property {string} createdBy - منشئ الجرد
 * @property {string} [approvedBy] - معتمد الجرد
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} StockTakeItem
 * @property {string} productId - معرف المنتج
 * @property {number} expectedQuantity - الكمية المتوقعة
 * @property {number} actualQuantity - الكمية الفعلية
 * @property {number} [difference] - الفرق
 * @property {string} [notes] - ملاحظات
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
