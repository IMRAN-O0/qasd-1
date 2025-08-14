/**
 * @fileoverview تعريفات أنواع بيانات السلامة والصحة المهنية
 */

/**
 * @typedef {Object} SafetyPolicy
 * @property {string} id - المعرف الفريد
 * @property {string} title - عنوان السياسة
 * @property {string} description - وصف السياسة
 * @property {string} content - محتوى السياسة
 * @property {string} category - تصنيف السياسة
 * @property {string} documentNumber - رقم الوثيقة
 * @property {Date} effectiveDate - تاريخ سريان السياسة
 * @property {Date} reviewDate - تاريخ المراجعة القادمة
 * @property {string} approvedBy - الشخص المعتمد للسياسة
 * @property {string} status - حالة السياسة (مسودة، معتمدة، قيد المراجعة، ملغاة)
 * @property {string[]} [attachments] - قائمة بمرفقات السياسة
 * @property {string[]} [relatedPolicies] - قائمة بالسياسات ذات الصلة
 * @property {Date} createdAt - تاريخ إنشاء السياسة
 * @property {string} createdBy - معرف منشئ السياسة
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} SafetyProcedure
 * @property {string} id - المعرف الفريد
 * @property {string} title - عنوان الإجراء
 * @property {string} description - وصف الإجراء
 * @property {string} content - محتوى الإجراء
 * @property {string} category - تصنيف الإجراء
 * @property {string} documentNumber - رقم الوثيقة
 * @property {string[]} steps - خطوات الإجراء
 * @property {string[]} [precautions] - احتياطات السلامة
 * @property {string[]} [requiredEquipment] - المعدات المطلوبة
 * @property {Date} effectiveDate - تاريخ سريان الإجراء
 * @property {Date} reviewDate - تاريخ المراجعة القادمة
 * @property {string} approvedBy - الشخص المعتمد للإجراء
 * @property {string} status - حالة الإجراء (مسودة، معتمد، قيد المراجعة، ملغي)
 * @property {string[]} [attachments] - قائمة بمرفقات الإجراء
 * @property {string[]} [relatedProcedures] - قائمة بالإجراءات ذات الصلة
 * @property {Date} createdAt - تاريخ إنشاء الإجراء
 * @property {string} createdBy - معرف منشئ الإجراء
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} RiskAssessment
 * @property {string} id - المعرف الفريد
 * @property {string} title - عنوان تقييم المخاطر
 * @property {string} description - وصف تقييم المخاطر
 * @property {string} location - موقع تقييم المخاطر
 * @property {string} department - القسم المعني
 * @property {string} activity - النشاط المقيم
 * @property {Hazard[]} hazards - قائمة المخاطر المحددة
 * @property {string} assessedBy - الشخص الذي قام بالتقييم
 * @property {Date} assessmentDate - تاريخ التقييم
 * @property {Date} reviewDate - تاريخ المراجعة القادمة
 * @property {string} status - حالة التقييم (مسودة، معتمد، قيد المراجعة، ملغي)
 * @property {string[]} [attachments] - قائمة بمرفقات التقييم
 * @property {Date} createdAt - تاريخ إنشاء التقييم
 * @property {string} createdBy - معرف منشئ التقييم
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} Hazard
 * @property {string} id - المعرف الفريد
 * @property {string} description - وصف الخطر
 * @property {string} category - تصنيف الخطر (كيميائي، فيزيائي، بيولوجي، إرغونومي، نفسي، إلخ)
 * @property {string} location - موقع الخطر
 * @property {string} riskLevel - مستوى الخطورة (منخفض، متوسط، عالي، حرج)
 * @property {string} likelihood - احتمالية الحدوث (نادر، محتمل، مرجح، شبه مؤكد)
 * @property {string} consequence - عواقب الخطر (طفيفة، متوسطة، شديدة، كارثية)
 * @property {string[]} existingControls - الضوابط الحالية
 * @property {string[]} recommendedControls - الضوابط الموصى بها
 * @property {string} responsiblePerson - الشخص المسؤول عن معالجة الخطر
 * @property {Date} targetDate - تاريخ الاستهداف للمعالجة
 * @property {string} status - حالة معالجة الخطر (مفتوح، قيد المعالجة، مغلق)
 * @property {Date} createdAt - تاريخ إنشاء الخطر
 * @property {string} createdBy - معرف منشئ الخطر
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} IncidentReport
 * @property {string} id - المعرف الفريد
 * @property {string} reportNumber - رقم التقرير
 * @property {string} title - عنوان الحادث
 * @property {string} description - وصف الحادث
 * @property {string} incidentType - نوع الحادث (إصابة عمل، يكاد أن يحدث، ضرر في الممتلكات، انسكاب مواد، حريق، إلخ)
 * @property {string} severityLevel - مستوى الخطورة (طفيف، متوسط، شديد، خطير جداً)
 * @property {Date} incidentDate - تاريخ وقوع الحادث
 * @property {string} incidentTime - وقت وقوع الحادث
 * @property {string} location - موقع الحادث
 * @property {string} department - القسم المعني
 * @property {string[]} [involvedPersons] - الأشخاص المتورطون
 * @property {string[]} [witnesses] - الشهود
 * @property {string} [injuryType] - نوع الإصابة
 * @property {string} [bodyPart] - الجزء المصاب من الجسم
 * @property {string} [damageType] - نوع الضرر
 * @property {string} [damageDescription] - وصف الضرر
 * @property {string} [rootCause] - السبب الجذري
 * @property {string[]} [contributingFactors] - العوامل المساهمة
 * @property {string[]} [correctiveActions] - الإجراءات التصحيحية
 * @property {string[]} [preventiveActions] - الإجراءات الوقائية
 * @property {string} reportedBy - الشخص المبلغ
 * @property {string} investigatedBy - الشخص المحقق
 * @property {string} status - حالة التقرير (مفتوح، تحت التحقيق، تحت المعالجة، مكتمل، مغلق)
 * @property {string[]} [attachments] - قائمة بمرفقات التقرير
 * @property {Date} createdAt - تاريخ إنشاء التقرير
 * @property {string} createdBy - معرف منشئ التقرير
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} SafetyInspection
 * @property {string} id - المعرف الفريد
 * @property {string} inspectionNumber - رقم التفتيش
 * @property {string} title - عنوان التفتيش
 * @property {string} description - وصف التفتيش
 * @property {string} type - نوع التفتيش (روتيني، مفاجئ، متابعة، إلخ)
 * @property {string} location - موقع التفتيش
 * @property {string} department - القسم المعني
 * @property {Date} inspectionDate - تاريخ التفتيش
 * @property {string} inspectionTime - وقت التفتيش
 * @property {string} inspector - المفتش
 * @property {string[]} inspectionItems - عناصر التفتيش
 * @property {string[]} findings - النتائج
 * @property {string[]} recommendations - التوصيات
 * @property {string[]} [correctiveActions] - الإجراءات التصحيحية
 * @property {string} status - حالة التفتيش (مخطط، قيد التنفيذ، مكتمل، متابعة مطلوبة)
 * @property {string[]} [attachments] - قائمة بمرفقات التفتيش
 * @property {Date} createdAt - تاريخ إنشاء التفتيش
 * @property {string} createdBy - معرف منشئ التفتيش
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} SafetyTraining
 * @property {string} id - المعرف الفريد
 * @property {string} trainingNumber - رقم التدريب
 * @property {string} title - عنوان التدريب
 * @property {string} description - وصف التدريب
 * @property {string} type - نوع التدريب (توجيهي، دوري، متخصص، إلخ)
 * @property {string[]} topics - مواضيع التدريب
 * @property {string} trainer - المدرب
 * @property {string[]} attendees - الحاضرون
 * @property {Date} startDate - تاريخ بدء التدريب
 * @property {Date} endDate - تاريخ انتهاء التدريب
 * @property {string} location - موقع التدريب
 * @property {string} department - القسم المعني
 * @property {string} status - حالة التدريب (مخطط، قيد التنفيذ، مكتمل، ملغي)
 * @property {string[]} [attachments] - قائمة بمرفقات التدريب
 * @property {Date} createdAt - تاريخ إنشاء التدريب
 * @property {string} createdBy - معرف منشئ التدريب
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} EmergencyPlan
 * @property {string} id - المعرف الفريد
 * @property {string} planNumber - رقم الخطة
 * @property {string} title - عنوان الخطة
 * @property {string} description - وصف الخطة
 * @property {string} type - نوع الخطة (حريق، زلزال، تسرب كيميائي، إلخ)
 * @property {string[]} procedures - إجراءات الطوارئ
 * @property {string[]} evacuationRoutes - مسارات الإخلاء
 * @property {string[]} assemblyPoints - نقاط التجمع
 * @property {string[]} emergencyContacts - جهات الاتصال في حالات الطوارئ
 * @property {string[]} responsiblePersons - الأشخاص المسؤولون
 * @property {Date} effectiveDate - تاريخ سريان الخطة
 * @property {Date} reviewDate - تاريخ المراجعة القادمة
 * @property {string} status - حالة الخطة (مسودة، معتمدة، قيد المراجعة، ملغاة)
 * @property {string[]} [attachments] - قائمة بمرفقات الخطة
 * @property {Date} createdAt - تاريخ إنشاء الخطة
 * @property {string} createdBy - معرف منشئ الخطة
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */

/**
 * @typedef {Object} SafetyEquipment
 * @property {string} id - المعرف الفريد
 * @property {string} equipmentNumber - رقم المعدة
 * @property {string} name - اسم المعدة
 * @property {string} category - فئة المعدة (معدات الحماية الشخصية، أنظمة إطفاء الحريق، معدات الطوارئ، إلخ)
 * @property {string} type - نوع المعدة
 * @property {string} location - موقع المعدة
 * @property {string} department - القسم المعني
 * @property {string} manufacturer - الشركة المصنعة
 * @property {string} model - الموديل
 * @property {string} serialNumber - الرقم التسلسلي
 * @property {Date} purchaseDate - تاريخ الشراء
 * @property {Date} installationDate - تاريخ التركيب
 * @property {Date} lastMaintenanceDate - تاريخ آخر صيانة
 * @property {Date} nextMaintenanceDate - تاريخ الصيانة القادمة
 * @property {string} maintenanceFrequency - تكرار الصيانة
 * @property {string} condition - حالة المعدة
 * @property {string} status - حالة التشغيل (فعال، غير فعال، قيد الإصلاح، مسحوب)
 * @property {string[]} [attachments] - قائمة بمرفقات المعدة
 * @property {Date} createdAt - تاريخ إنشاء المعدة
 * @property {string} createdBy - معرف منشئ المعدة
 * @property {Date} [updatedAt] - تاريخ آخر تحديث
 * @property {string} [updatedBy] - معرف آخر محدث
 */
