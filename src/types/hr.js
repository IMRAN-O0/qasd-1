/**
 * @fileoverview تعريفات أنواع إدارة الموارد البشرية
 */

/**
 * @typedef {Object} Employee
 * @property {string} id - معرف الموظف
 * @property {string} employeeNumber - الرقم الوظيفي
 * @property {string} firstName - الاسم الأول
 * @property {string} lastName - الاسم الأخير
 * @property {string} [middleName] - الاسم الأوسط
 * @property {string} fullName - الاسم الكامل
 * @property {string} [nameAr] - الاسم بالعربية
 * @property {string} [nationalId] - رقم الهوية الوطنية
 * @property {string} [passportNumber] - رقم جواز السفر
 * @property {string} [nationality] - الجنسية
 * @property {string} [gender] - الجنس
 * @property {string} [birthDate] - تاريخ الميلاد
 * @property {string} [maritalStatus] - الحالة الاجتماعية
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [personalEmail] - البريد الإلكتروني الشخصي
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [mobile] - رقم الجوال
 * @property {string} [address] - العنوان
 * @property {string} [city] - المدينة
 * @property {string} [country] - الدولة
 * @property {string} [postalCode] - الرمز البريدي
 * @property {string} [photo] - الصورة الشخصية
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [positionId] - معرف المنصب
 * @property {string} [managerId] - معرف المدير
 * @property {string} [employmentType] - نوع التوظيف (دوام كامل، دوام جزئي، متعاقد)
 * @property {string} [employmentStatus] - حالة التوظيف (نشط، إجازة، منتهي)
 * @property {string} [joinDate] - تاريخ الالتحاق
 * @property {string} [confirmationDate] - تاريخ التثبيت
 * @property {string} [terminationDate] - تاريخ انتهاء الخدمة
 * @property {string} [terminationReason] - سبب انتهاء الخدمة
 * @property {string} [bankName] - اسم البنك
 * @property {string} [bankAccount] - رقم الحساب البنكي
 * @property {string} [iban] - رقم الآيبان
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Department
 * @property {string} id - معرف القسم
 * @property {string} code - رمز القسم
 * @property {string} name - اسم القسم
 * @property {string} [nameAr] - اسم القسم بالعربية
 * @property {string} [parentId] - معرف القسم الأب
 * @property {string} [managerId] - معرف مدير القسم
 * @property {string} [description] - وصف القسم
 * @property {boolean} isActive - حالة نشاط القسم
 * @property {string} [costCenter] - مركز التكلفة
 * @property {string} [location] - الموقع
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Position
 * @property {string} id - معرف المنصب
 * @property {string} code - رمز المنصب
 * @property {string} title - مسمى المنصب
 * @property {string} [titleAr] - مسمى المنصب بالعربية
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [reportToPositionId] - معرف المنصب المسؤول
 * @property {string} [description] - وصف المنصب
 * @property {string} [jobGrade] - الدرجة الوظيفية
 * @property {string} [jobFamily] - العائلة الوظيفية
 * @property {number} [minSalary] - الحد الأدنى للراتب
 * @property {number} [maxSalary] - الحد الأعلى للراتب
 * @property {number} [headcount] - عدد الموظفين المطلوب
 * @property {boolean} isActive - حالة نشاط المنصب
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Attendance
 * @property {string} id - معرف الحضور
 * @property {string} employeeId - معرف الموظف
 * @property {string} date - التاريخ
 * @property {string} [checkIn] - وقت الحضور
 * @property {string} [checkOut] - وقت الانصراف
 * @property {string} [status] - حالة الحضور (حاضر، غائب، متأخر، مغادرة مبكرة)
 * @property {number} [workedHours] - ساعات العمل
 * @property {number} [overtimeHours] - ساعات العمل الإضافي
 * @property {string} [shiftId] - معرف الوردية
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Leave
 * @property {string} id - معرف الإجازة
 * @property {string} employeeId - معرف الموظف
 * @property {string} leaveTypeId - معرف نوع الإجازة
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {number} days - عدد الأيام
 * @property {string} [halfDay] - نصف يوم (صباحي، مسائي)
 * @property {string} reason - سبب الإجازة
 * @property {string} status - حالة الإجازة (مقدمة، معتمدة، مرفوضة، ملغاة)
 * @property {string} [attachmentPath] - مسار المرفق
 * @property {string} [notes] - ملاحظات
 * @property {string} [approvedBy] - معتمد الإجازة
 * @property {string} [approvalDate] - تاريخ الاعتماد
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} LeaveType
 * @property {string} id - معرف نوع الإجازة
 * @property {string} name - اسم نوع الإجازة
 * @property {string} [nameAr] - اسم نوع الإجازة بالعربية
 * @property {string} [description] - وصف نوع الإجازة
 * @property {number} [daysPerYear] - عدد الأيام في السنة
 * @property {boolean} [isPaid] - مدفوعة الأجر
 * @property {boolean} [isCarryForward] - قابلة للترحيل
 * @property {number} [maxCarryForwardDays] - الحد الأقصى لأيام الترحيل
 * @property {number} [maxConsecutiveDays] - الحد الأقصى للأيام المتتالية
 * @property {boolean} [requiresApproval] - تتطلب موافقة
 * @property {boolean} [requiresAttachment] - تتطلب مرفق
 * @property {boolean} isActive - حالة نشاط نوع الإجازة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} LeaveBalance
 * @property {string} id - معرف رصيد الإجازة
 * @property {string} employeeId - معرف الموظف
 * @property {string} leaveTypeId - معرف نوع الإجازة
 * @property {string} year - السنة
 * @property {number} entitlement - الاستحقاق
 * @property {number} taken - المأخوذ
 * @property {number} balance - الرصيد
 * @property {number} [carryForward] - المرحل من السنة السابقة
 * @property {number} [adjustment] - التعديل
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Payroll
 * @property {string} id - معرف كشف الرواتب
 * @property {string} payrollNumber - رقم كشف الرواتب
 * @property {string} name - اسم كشف الرواتب
 * @property {string} period - الفترة
 * @property {string} startDate - تاريخ البداية
 * @property {string} endDate - تاريخ النهاية
 * @property {string} paymentDate - تاريخ الدفع
 * @property {string} status - حالة كشف الرواتب (مسودة، معتمد، مدفوع)
 * @property {number} totalBasicSalary - إجمالي الراتب الأساسي
 * @property {number} totalAllowances - إجمالي البدلات
 * @property {number} totalDeductions - إجمالي الاستقطاعات
 * @property {number} totalNetSalary - إجمالي صافي الراتب
 * @property {PayrollItem[]} items - بنود كشف الرواتب
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ كشف الرواتب
 * @property {string} [approvedBy] - معتمد كشف الرواتب
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} PayrollItem
 * @property {string} id - معرف بند كشف الرواتب
 * @property {string} payrollId - معرف كشف الرواتب
 * @property {string} employeeId - معرف الموظف
 * @property {string} employeeName - اسم الموظف
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [positionId] - معرف المنصب
 * @property {number} basicSalary - الراتب الأساسي
 * @property {number} [housingAllowance] - بدل السكن
 * @property {number} [transportAllowance] - بدل النقل
 * @property {number} [otherAllowances] - بدلات أخرى
 * @property {number} [overtime] - العمل الإضافي
 * @property {number} [bonus] - المكافآت
 * @property {number} [incomeTax] - ضريبة الدخل
 * @property {number} [socialInsurance] - التأمينات الاجتماعية
 * @property {number} [loans] - القروض
 * @property {number} [otherDeductions] - استقطاعات أخرى
 * @property {number} grossSalary - إجمالي الراتب
 * @property {number} totalDeductions - إجمالي الاستقطاعات
 * @property {number} netSalary - صافي الراتب
 * @property {string} [bankAccount] - رقم الحساب البنكي
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} SalaryComponent
 * @property {string} id - معرف مكون الراتب
 * @property {string} code - رمز المكون
 * @property {string} name - اسم المكون
 * @property {string} [nameAr] - اسم المكون بالعربية
 * @property {string} type - نوع المكون (أساسي، بدل، استقطاع، مكافأة)
 * @property {string} [calculationType] - نوع الحساب (ثابت، نسبة من الراتب الأساسي، نسبة من الإجمالي)
 * @property {number} [value] - القيمة
 * @property {boolean} [isTaxable] - خاضع للضريبة
 * @property {boolean} [isActive] - نشط
 * @property {string} [description] - الوصف
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} EmployeeSalary
 * @property {string} id - معرف راتب الموظف
 * @property {string} employeeId - معرف الموظف
 * @property {number} basicSalary - الراتب الأساسي
 * @property {string} currency - العملة
 * @property {string} effectiveDate - تاريخ السريان
 * @property {EmployeeSalaryComponent[]} components - مكونات الراتب
 * @property {number} [totalAllowances] - إجمالي البدلات
 * @property {number} [totalDeductions] - إجمالي الاستقطاعات
 * @property {number} [grossSalary] - إجمالي الراتب
 * @property {number} [netSalary] - صافي الراتب
 * @property {string} [reason] - سبب التغيير
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ الراتب
 * @property {string} [approvedBy] - معتمد الراتب
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} EmployeeSalaryComponent
 * @property {string} id - معرف مكون راتب الموظف
 * @property {string} employeeSalaryId - معرف راتب الموظف
 * @property {string} componentId - معرف مكون الراتب
 * @property {string} name - اسم المكون
 * @property {string} type - نوع المكون
 * @property {number} amount - المبلغ
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} Recruitment
 * @property {string} id - معرف التوظيف
 * @property {string} requisitionNumber - رقم طلب التوظيف
 * @property {string} title - العنوان
 * @property {string} [positionId] - معرف المنصب
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [jobDescription] - الوصف الوظيفي
 * @property {string} [employmentType] - نوع التوظيف
 * @property {number} [vacancies] - عدد الشواغر
 * @property {string} [minQualification] - الحد الأدنى للمؤهلات
 * @property {string} [minExperience] - الحد الأدنى للخبرة
 * @property {string} [skills] - المهارات المطلوبة
 * @property {string} [location] - الموقع
 * @property {number} [budgetedSalary] - الراتب المخصص
 * @property {string} status - حالة الطلب (مسودة، معتمد، قيد التوظيف، مكتمل، ملغي)
 * @property {string} [requestedBy] - طالب التوظيف
 * @property {string} [approvedBy] - معتمد الطلب
 * @property {string} [targetDate] - التاريخ المستهدف
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Candidate
 * @property {string} id - معرف المرشح
 * @property {string} firstName - الاسم الأول
 * @property {string} lastName - الاسم الأخير
 * @property {string} [middleName] - الاسم الأوسط
 * @property {string} fullName - الاسم الكامل
 * @property {string} [email] - البريد الإلكتروني
 * @property {string} [phone] - رقم الهاتف
 * @property {string} [mobile] - رقم الجوال
 * @property {string} [address] - العنوان
 * @property {string} [city] - المدينة
 * @property {string} [country] - الدولة
 * @property {string} [nationality] - الجنسية
 * @property {string} [gender] - الجنس
 * @property {string} [birthDate] - تاريخ الميلاد
 * @property {string} [education] - التعليم
 * @property {string} [experience] - الخبرة
 * @property {string} [currentCompany] - الشركة الحالية
 * @property {string} [currentPosition] - المنصب الحالي
 * @property {string} [currentSalary] - الراتب الحالي
 * @property {string} [expectedSalary] - الراتب المتوقع
 * @property {string} [noticePeriod] - فترة الإشعار
 * @property {string} [resumePath] - مسار السيرة الذاتية
 * @property {string} [source] - مصدر المرشح
 * @property {string} [notes] - ملاحظات
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Interview
 * @property {string} id - معرف المقابلة
 * @property {string} requisitionId - معرف طلب التوظيف
 * @property {string} candidateId - معرف المرشح
 * @property {string} interviewDate - تاريخ المقابلة
 * @property {string} [startTime] - وقت البدء
 * @property {string} [endTime] - وقت الانتهاء
 * @property {string} [location] - الموقع
 * @property {string} [type] - نوع المقابلة (هاتفية، فيديو، شخصية، فنية)
 * @property {string} [round] - جولة المقابلة (أولى، ثانية، نهائية)
 * @property {string[]} [interviewers] - المقابلين
 * @property {string} status - حالة المقابلة (مخططة، مكتملة، ملغاة، معاد جدولتها)
 * @property {string} [result] - نتيجة المقابلة (مقبول، مرفوض، قيد النظر)
 * @property {string} [feedback] - التغذية الراجعة
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ المقابلة
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} JobOffer
 * @property {string} id - معرف العرض الوظيفي
 * @property {string} offerNumber - رقم العرض
 * @property {string} requisitionId - معرف طلب التوظيف
 * @property {string} candidateId - معرف المرشح
 * @property {string} offerDate - تاريخ العرض
 * @property {string} [positionId] - معرف المنصب
 * @property {string} [departmentId] - معرف القسم
 * @property {string} [employmentType] - نوع التوظيف
 * @property {string} [proposedStartDate] - تاريخ البدء المقترح
 * @property {number} [basicSalary] - الراتب الأساسي
 * @property {number} [totalPackage] - إجمالي الحزمة
 * @property {string} [currency] - العملة
 * @property {string} [benefits] - المزايا
 * @property {string} [expiryDate] - تاريخ انتهاء الصلاحية
 * @property {string} status - حالة العرض (مسودة، مرسل، مقبول، مرفوض، منتهي)
 * @property {string} [acceptanceDate] - تاريخ القبول
 * @property {string} [rejectionReason] - سبب الرفض
 * @property {string} [offerLetterPath] - مسار خطاب العرض
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ العرض
 * @property {string} [approvedBy] - معتمد العرض
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} Training
 * @property {string} id - معرف التدريب
 * @property {string} title - عنوان التدريب
 * @property {string} [description] - وصف التدريب
 * @property {string} [type] - نوع التدريب (داخلي، خارجي، عبر الإنترنت)
 * @property {string} [category] - فئة التدريب
 * @property {string} [provider] - مزود التدريب
 * @property {string} [location] - موقع التدريب
 * @property {string} startDate - تاريخ البدء
 * @property {string} endDate - تاريخ الانتهاء
 * @property {number} [duration] - المدة
 * @property {string} [durationUnit] - وحدة المدة (ساعات، أيام، أسابيع)
 * @property {number} [cost] - التكلفة
 * @property {string} [currency] - العملة
 * @property {string} status - حالة التدريب (مخطط، قيد التنفيذ، مكتمل، ملغي)
 * @property {TrainingAttendee[]} attendees - الحضور
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ التدريب
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} TrainingAttendee
 * @property {string} id - معرف الحضور
 * @property {string} trainingId - معرف التدريب
 * @property {string} employeeId - معرف الموظف
 * @property {string} status - حالة الحضور (مسجل، حاضر، غائب، مكتمل)
 * @property {string} [result] - النتيجة
 * @property {string} [feedback] - التغذية الراجعة
 * @property {string} [certificatePath] - مسار الشهادة
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PerformanceReview
 * @property {string} id - معرف تقييم الأداء
 * @property {string} reviewNumber - رقم التقييم
 * @property {string} title - عنوان التقييم
 * @property {string} [description] - وصف التقييم
 * @property {string} [reviewType] - نوع التقييم (سنوي، نصف سنوي، ربع سنوي)
 * @property {string} [reviewPeriod] - فترة التقييم
 * @property {string} startDate - تاريخ البدء
 * @property {string} endDate - تاريخ الانتهاء
 * @property {string} status - حالة التقييم (مخطط، قيد التنفيذ، مكتمل)
 * @property {PerformanceReviewEmployee[]} employees - الموظفين
 * @property {string} [notes] - ملاحظات
 * @property {string} createdBy - منشئ التقييم
 * @property {string} createdAt - تاريخ الإنشاء
 * @property {string} updatedAt - تاريخ التحديث
 */

/**
 * @typedef {Object} PerformanceReviewEmployee
 * @property {string} id - معرف تقييم الموظف
 * @property {string} reviewId - معرف التقييم
 * @property {string} employeeId - معرف الموظف
 * @property {string} [reviewerId] - معرف المقيم
 * @property {string} status - حالة التقييم (معلق، قيد التقييم، مكتمل)
 * @property {PerformanceReviewCriteria[]} criteria - معايير التقييم
 * @property {number} [overallRating] - التقييم العام
 * @property {string} [strengths] - نقاط القوة
 * @property {string} [areasForImprovement] - مجالات التحسين
 * @property {string} [goals] - الأهداف
 * @property {string} [employeeComments] - تعليقات الموظف
 * @property {string} [reviewerComments] - تعليقات المقيم
 * @property {string} [completionDate] - تاريخ الإكمال
 * @property {string} [notes] - ملاحظات
 */

/**
 * @typedef {Object} PerformanceReviewCriteria
 * @property {string} id - معرف معيار التقييم
 * @property {string} reviewEmployeeId - معرف تقييم الموظف
 * @property {string} criteriaId - معرف المعيار
 * @property {string} name - اسم المعيار
 * @property {string} [description] - وصف المعيار
 * @property {string} [category] - فئة المعيار
 * @property {number} [weight] - وزن المعيار
 * @property {number} rating - التقييم
 * @property {string} [comments] - التعليقات
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
