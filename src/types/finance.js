/**
 * @fileoverview تعريفات أنواع الإدارة المالية والمحاسبة
 */

/**
 * @typedef {Object} Account
 * @property {string} id - معرف الحساب
 * @property {string} code - رمز الحساب
 * @property {string} name - اسم الحساب
 * @property {string} type - نوع الحساب (أصول، خصوم، إيرادات، مصروفات، حقوق ملكية)
 * @property {string} [parentId] - معرف الحساب الأب
 * @property {string} [description] - وصف الحساب
 * @property {boolean} isActive - حالة نشاط الحساب
 * @property {boolean} [allowJournalEntries] - السماح بقيود اليومية
 * @property {string} [currency] - العملة
 * @property {number} [openingBalance] - الرصيد الافتتاحي
 * @property {number} [currentBalance] - الرصيد الحالي
 * @property {string} [taxCode] - رمز الضريبة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} JournalEntry
 * @property {string} id - معرف القيد
 * @property {string} entryNumber - رقم القيد
 * @property {string} entryDate - تاريخ القيد
 * @property {string} type - نوع القيد (عادي، افتتاحي، إقفال، تسوية)
 * @property {string} [reference] - المرجع
 * @property {string} [sourceDocument] - المستند المصدر
 * @property {string} [sourceType] - نوع المصدر (فاتورة مبيعات، فاتورة مشتريات، دفعة، إلخ)
 * @property {string} [sourceId] - معرف المصدر
 * @property {string} currency - العملة
 * @property {number} amount - المبلغ
 * @property {string} status - حالة القيد (مسودة، معتمد، مرحل)
 * @property {JournalEntryLine[]} lines - بنود القيد
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ القيد
 * @property {string} [approvedBy] - معتمد القيد
 * @property {string} [postedBy] - مرحل القيد
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} JournalEntryLine
 * @property {string} id - معرف بند القيد
 * @property {string} entryId - معرف القيد
 * @property {string} accountId - معرف الحساب
 * @property {string} accountCode - رمز الحساب
 * @property {string} accountName - اسم الحساب
 * @property {string} description - وصف البند
 * @property {number} debitAmount - مبلغ المدين
 * @property {number} creditAmount - مبلغ الدائن
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [projectId] - معرف المشروع
 * @property {string} [customerId] - معرف العميل
 * @property {string} [supplierId] - معرف المورد
 * @property {string} [taxCode] - رمز الضريبة
 * @property {number} [taxAmount] - مبلغ الضريبة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} FiscalYear
 * @property {string} id - معرف السنة المالية
 * @property {string} name - اسم السنة المالية
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} status - حالة السنة المالية (مخططة، نشطة، مغلقة)
 * @property {boolean} isCurrent - السنة المالية الحالية
 * @property {FiscalPeriod[]} periods - الفترات المالية
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} FiscalPeriod
 * @property {string} id - معرف الفترة المالية
 * @property {string} fiscalYearId - معرف السنة المالية
 * @property {string} name - اسم الفترة
 * @property {number} periodNumber - رقم الفترة
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} status - حالة الفترة (مخططة، نشطة، مغلقة)
 * @property {boolean} isCurrent - الفترة الحالية
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} BankAccount
 * @property {string} id - معرف الحساب البنكي
 * @property {string} accountId - معرف الحساب المحاسبي
 * @property {string} name - اسم الحساب البنكي
 * @property {string} accountNumber - رقم الحساب
 * @property {string} [iban] - رقم الآيبان
 * @property {string} bankName - اسم البنك
 * @property {string} [branchName] - اسم الفرع
 * @property {string} [swiftCode] - رمز سويفت
 * @property {string} [routingNumber] - رقم التوجيه
 * @property {string} currency - العملة
 * @property {string} type - نوع الحساب (جاري، توفير، ودائع)
 * @property {number} [openingBalance] - الرصيد الافتتاحي
 * @property {number} [currentBalance] - الرصيد الحالي
 * @property {string} status - حالة الحساب (نشط، مجمد، مغلق)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} BankTransaction
 * @property {string} id - معرف المعاملة البنكية
 * @property {string} transactionNumber - رقم المعاملة
 * @property {string} bankAccountId - معرف الحساب البنكي
 * @property {string} transactionDate - تاريخ المعاملة
 * @property {string} type - نوع المعاملة (إيداع، سحب، تحويل، شيك صادر، شيك وارد)
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} [payee] - المستفيد/الدافع
 * @property {number} amount - المبلغ
 * @property {string} [description] - الوصف
 * @property {string} status - حالة المعاملة (معلقة، مكتملة، مرفوضة)
 * @property {string} [journalEntryId] - معرف قيد اليومية
 * @property {string} [categoryId] - معرف الفئة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ المعاملة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} BankReconciliation
 * @property {string} id - معرف التسوية البنكية
 * @property {string} reconciliationNumber - رقم التسوية
 * @property {string} bankAccountId - معرف الحساب البنكي
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} statementDate - تاريخ كشف الحساب
 * @property {number} statementBalance - رصيد كشف الحساب
 * @property {number} bankBalance - الرصيد البنكي
 * @property {number} bookBalance - الرصيد الدفتري
 * @property {number} [unrecordedDeposits] - الإيداعات غير المسجلة
 * @property {number} [unrecordedWithdrawals] - السحوبات غير المسجلة
 * @property {number} [unclearedChecks] - الشيكات غير المحصلة
 * @property {number} [bankCharges] - الرسوم البنكية
 * @property {number} [bankInterest] - الفوائد البنكية
 * @property {number} adjustedBalance - الرصيد المعدل
 * @property {string} status - حالة التسوية (مسودة، مكتملة)
 * @property {BankReconciliationItem[]} items - بنود التسوية
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ التسوية
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} BankReconciliationItem
 * @property {string} id - معرف بند التسوية
 * @property {string} reconciliationId - معرف التسوية
 * @property {string} transactionId - معرف المعاملة
 * @property {string} transactionDate - تاريخ المعاملة
 * @property {string} transactionType - نوع المعاملة
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} [description] - الوصف
 * @property {number} amount - المبلغ
 * @property {boolean} isReconciled - تمت تسويته
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} FinancialStatement
 * @property {string} id - معرف التقرير المالي
 * @property {string} type - نوع التقرير (ميزانية عمومية، قائمة دخل، تدفقات نقدية)
 * @property {string} name - اسم التقرير
 * @property {string} [fiscalYearId] - معرف السنة المالية
 * @property {string} [fiscalPeriodId] - معرف الفترة المالية
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} currency - العملة
 * @property {string} status - حالة التقرير (مسودة، نهائي)
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ التقرير
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Budget
 * @property {string} id - معرف الموازنة
 * @property {string} name - اسم الموازنة
 * @property {string} [fiscalYearId] - معرف السنة المالية
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} type - نوع الموازنة (تشغيلية، رأسمالية، نقدية)
 * @property {string} status - حالة الموازنة (مسودة، معتمدة، مغلقة)
 * @property {string} currency - العملة
 * @property {number} totalAmount - المبلغ الإجمالي
 * @property {BudgetItem[]} items - بنود الموازنة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الموازنة
 * @property {string} [approvedBy] - معتمد الموازنة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} BudgetItem
 * @property {string} id - معرف بند الموازنة
 * @property {string} budgetId - معرف الموازنة
 * @property {string} accountId - معرف الحساب
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [projectId] - معرف المشروع
 * @property {string} [description] - الوصف
 * @property {number} annualAmount - المبلغ السنوي
 * @property {number} [januaryAmount] - مبلغ يناير
 * @property {number} [februaryAmount] - مبلغ فبراير
 * @property {number} [marchAmount] - مبلغ مارس
 * @property {number} [aprilAmount] - مبلغ أبريل
 * @property {number} [mayAmount] - مبلغ مايو
 * @property {number} [juneAmount] - مبلغ يونيو
 * @property {number} [julyAmount] - مبلغ يوليو
 * @property {number} [augustAmount] - مبلغ أغسطس
 * @property {number} [septemberAmount] - مبلغ سبتمبر
 * @property {number} [octoberAmount] - مبلغ أكتوبر
 * @property {number} [novemberAmount] - مبلغ نوفمبر
 * @property {number} [decemberAmount] - مبلغ ديسمبر
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} TaxConfiguration
 * @property {string} id - معرف الضريبة
 * @property {string} code - رمز الضريبة
 * @property {string} name - اسم الضريبة
 * @property {string} type - نوع الضريبة (قيمة مضافة، استقطاع، دخل)
 * @property {number} rate - نسبة الضريبة
 * @property {string} [accountId] - معرف حساب الضريبة
 * @property {boolean} isActive - حالة نشاط الضريبة
 * @property {string} [description] - وصف الضريبة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} TaxReturn
 * @property {string} id - معرف الإقرار الضريبي
 * @property {string} returnNumber - رقم الإقرار
 * @property {string} type - نوع الإقرار (قيمة مضافة، استقطاع، دخل)
 * @property {string} period - الفترة الضريبية
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} dueDate - تاريخ الاستحقاق
 * @property {string} filingDate - تاريخ التقديم
 * @property {string} status - حالة الإقرار (مسودة، مقدم، مدفوع)
 * @property {number} salesAmount - مبلغ المبيعات
 * @property {number} purchasesAmount - مبلغ المشتريات
 * @property {number} outputTax - ضريبة المخرجات
 * @property {number} inputTax - ضريبة المدخلات
 * @property {number} adjustments - التعديلات
 * @property {number} taxDue - الضريبة المستحقة
 * @property {string} [referenceNumber] - رقم المرجع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الإقرار
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
