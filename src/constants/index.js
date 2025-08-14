// مفاتيح التخزين المحلي
export const STORAGE_KEYS = {
  // بيانات المستخدمين والمصادقة
  USERS: 'users',

  // بيانات العملاء والمبيعات
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  QUOTATIONS: 'quotations',
  INVOICES: 'invoices',

  // بيانات المستودعات
  MATERIALS: 'materials',
  RAW_MATERIALS: 'rawMaterials',
  MATERIAL_RECEIPTS: 'materialReceipts',
  MATERIAL_ISSUES: 'materialIssues',
  INVENTORY_COUNTS: 'inventoryCounts',
  EXPIRY_REPORTS: 'expiryReports',

  // بيانات الإنتاج
  PRODUCTION_ORDERS: 'productionOrders',
  PRODUCTION_REPORTS: 'productionReports',

  // بيانات الجودة
  QUALITY_TESTS: 'qualityTests',
  QUALITY_REPORTS: 'qualityReports',

  // بيانات السلامة
  SAFETY_REPORTS: 'safetyReports',
  SAFETY_INSPECTIONS: 'safetyInspections',

  // إعدادات النظام
  SETTINGS: 'systemSettings',
  USER_PREFERENCES: 'userPreferences',
  COMPANY_SETTINGS: 'companySettings',
  SYSTEM_SETTINGS: 'systemSettings',
  USER_SETTINGS: 'userSettings',
  SECURITY_SETTINGS: 'securitySettings'
};

// الوحدات
export const UNITS = [
  { value: 'kg', label: 'كيلو' },
  { value: 'g', label: 'جرام' },
  { value: 'ton', label: 'طن' },
  { value: 'l', label: 'لتر' },
  { value: 'ml', label: 'مل' },
  { value: 'm3', label: 'متر مكعب' },
  { value: 'piece', label: 'قطعة' },
  { value: 'box', label: 'صندوق' },
  { value: 'carton', label: 'كرتون' },
  { value: 'bag', label: 'كيس' },
  { value: 'can', label: 'علبة' },
  { value: 'barrel', label: 'برميل' },
  { value: 'sack', label: 'جوال' },
  { value: 'roll', label: 'رول' },
  { value: 'm', label: 'متر' },
  { value: 'cm', label: 'سم' },
  { value: 'inch', label: 'إنش' },
  { value: 'ft', label: 'قدم' }
];

// أنواع المستودعات
export const WAREHOUSE_TYPES = [
  { value: 'main_warehouse', label: 'المستودع الرئيسي' },
  { value: 'raw_materials_warehouse', label: 'مستودع المواد الخام' },
  { value: 'finished_goods_warehouse', label: 'مستودع المنتجات النهائية' },
  { value: 'wip_warehouse', label: 'مستودع المنتجات تحت التشغيل' },
  { value: 'packaging_warehouse', label: 'مستودع التعبئة والتغليف' },
  { value: 'cold_storage', label: 'المخزن البارد' },
  { value: 'chemical_warehouse', label: 'مستودع المواد الكيميائية' },
  { value: 'spare_parts_warehouse', label: 'مستودع قطع الغيار' },
  { value: 'emergency_warehouse', label: 'مستودع الطوارئ' }
];

// فئات المواد
export const MATERIAL_CATEGORIES = [
  { value: 'raw_materials', label: 'مواد خام أساسية' },
  { value: 'chemicals', label: 'مواد كيميائية' },
  { value: 'packaging', label: 'مواد التعبئة والتغليف' },
  { value: 'auxiliary', label: 'مواد مساعدة' },
  { value: 'cleaning', label: 'مواد التنظيف' },
  { value: 'spare_parts', label: 'قطع غيار' },
  { value: 'consumables', label: 'مواد استهلاكية' },
  { value: 'maintenance', label: 'مواد الصيانة' },
  { value: 'laboratory', label: 'مواد المختبر' },
  { value: 'safety', label: 'مواد السلامة' }
];

// أنواع العملاء
export const CUSTOMER_TYPES = [
  { value: 'corporate', label: 'عميل مؤسسي' },
  { value: 'commercial', label: 'عميل تجاري' },
  { value: 'retail', label: 'عميل تجزئة' },
  { value: 'distributor', label: 'موزع' },
  { value: 'agent', label: 'وكيل' },
  { value: 'government', label: 'مؤسسة حكومية' },
  { value: 'import_export', label: 'شركة استيراد وتصدير' }
];

// حالات العملاء
export const CUSTOMER_STATUS = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'blocked', label: 'محظور' },
  { value: 'under_review', label: 'قيد المراجعة' }
];

// أنواع المنتجات
export const PRODUCT_CATEGORIES = [
  { value: 'food', label: 'منتجات غذائية' },
  { value: 'beverages', label: 'منتجات مشروبات' },
  { value: 'cosmetics', label: 'منتجات تجميل' },
  { value: 'medical', label: 'منتجات طبية' },
  { value: 'chemical', label: 'منتجات كيميائية' },
  { value: 'cleaning', label: 'منتجات تنظيف' },
  { value: 'agricultural', label: 'منتجات زراعية' },
  { value: 'industrial', label: 'منتجات صناعية' }
];

// فئات عامة
export const CATEGORIES = PRODUCT_CATEGORIES;

// شروط الدفع
export const PAYMENT_TERMS = [
  { value: 'net_0', label: 'فوري' },
  { value: 'net_15', label: '15 يوم' },
  { value: 'net_30', label: '30 يوم' },
  { value: 'net_45', label: '45 يوم' },
  { value: 'net_60', label: '60 يوم' },
  { value: 'net_90', label: '90 يوم' },
  { value: 'cod', label: 'عند التسليم' },
  { value: 'prepaid', label: 'مقدماً' }
];

// شروط التسليم
export const DELIVERY_TERMS = [
  'تسليم في المصنع',
  'تسليم في المستودع',
  'تسليم في الموقع',
  'شحن مجاني',
  'شحن مدفوع',
  'استلام من العميل'
];

// خيارات الحالة العامة
export const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط', color: 'green' },
  { value: 'inactive', label: 'غير نشط', color: 'red' },
  { value: 'pending', label: 'معلق', color: 'yellow' },
  { value: 'completed', label: 'مكتمل', color: 'blue' },
  { value: 'canceled', label: 'ملغي', color: 'gray' }
];

// الأدوار
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
  QUALITY_MANAGER: 'quality_manager',
  SAFETY_OFFICER: 'safety_officer',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  PRODUCTION_MANAGER: 'production_manager',
  SALES_MANAGER: 'sales_manager'
};

// المناطق السعودية
export const SAUDI_REGIONS = [
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'القصيم',
  'المنطقة الشرقية',
  'عسير',
  'تبوك',
  'حائل',
  'الحدود الشمالية',
  'جازان',
  'نجران',
  'الباحة',
  'الجوف'
];

// الصلاحيات
export const PERMISSIONS = {
  // صلاحيات المبيعات
  SALES: {
    VIEW: 'sales.view',
    CREATE: 'sales.create',
    EDIT: 'sales.edit',
    DELETE: 'sales.delete',
    APPROVE: 'sales.approve'
  },
  // صلاحيات المخزون
  INVENTORY: {
    VIEW: 'inventory.view',
    CREATE: 'inventory.create',
    EDIT: 'inventory.edit',
    DELETE: 'inventory.delete',
    COUNT: 'inventory.count'
  },
  // صلاحيات الإنتاج
  PRODUCTION: {
    VIEW: 'production.view',
    CREATE: 'production.create',
    EDIT: 'production.edit',
    DELETE: 'production.delete',
    APPROVE: 'production.approve'
  },
  // صلاحيات الجودة
  QUALITY: {
    VIEW: 'quality.view',
    CREATE: 'quality.create',
    EDIT: 'quality.edit',
    DELETE: 'quality.delete',
    APPROVE: 'quality.approve'
  },
  // صلاحيات السلامة
  SAFETY: {
    VIEW: 'safety.view',
    CREATE: 'safety.create',
    EDIT: 'safety.edit',
    DELETE: 'safety.delete',
    INVESTIGATE: 'safety.investigate'
  },
  // صلاحيات النظام
  SYSTEM: {
    ADMIN: 'system.admin',
    USER_MANAGEMENT: 'system.users',
    SETTINGS: 'system.settings',
    BACKUP: 'system.backup'
  }
};

// ربط الأدوار بالصلاحيات
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  [ROLES.MANAGER]: [
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.PRODUCTION),
    PERMISSIONS.QUALITY.VIEW,
    PERMISSIONS.SAFETY.VIEW
  ],
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.EDIT,
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.INVENTORY.CREATE,
    PERMISSIONS.INVENTORY.EDIT,
    PERMISSIONS.PRODUCTION.VIEW,
    PERMISSIONS.PRODUCTION.CREATE,
    PERMISSIONS.PRODUCTION.EDIT
  ],
  [ROLES.OPERATOR]: [
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.PRODUCTION.VIEW,
    PERMISSIONS.PRODUCTION.CREATE
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.SALES.VIEW,
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.PRODUCTION.VIEW,
    PERMISSIONS.QUALITY.VIEW,
    PERMISSIONS.SAFETY.VIEW
  ],
  [ROLES.QUALITY_MANAGER]: Object.values(PERMISSIONS.QUALITY),
  [ROLES.SAFETY_OFFICER]: Object.values(PERMISSIONS.SAFETY),
  [ROLES.WAREHOUSE_MANAGER]: Object.values(PERMISSIONS.INVENTORY),
  [ROLES.PRODUCTION_MANAGER]: Object.values(PERMISSIONS.PRODUCTION),
  [ROLES.SALES_MANAGER]: Object.values(PERMISSIONS.SALES)
};

// حالات المنتجات
export const PRODUCT_STATUS = ['متوفر', 'غير متوفر', 'قيد الإنتاج', 'متوقف مؤقتاً', 'متوقف نهائياً'];

// حالات عروض الأسعار
export const QUOTATION_STATUS = ['مسودة', 'مرسل', 'قيد المراجعة', 'مقبول', 'مرفوض', 'منتهي الصلاحية', 'محول لفاتورة'];

// حالات الفواتير
export const INVOICE_STATUS = ['مسودة', 'مرسلة', 'مدفوعة جزئياً', 'مدفوعة كاملة', 'متأخرة', 'ملغية'];

// طرق الدفع
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'cheque', label: 'شيك' },
  { value: 'credit_card', label: 'بطاقة ائتمان' },
  { value: 'on_credit', label: 'آجل' },
  { value: 'direct_debit', label: 'خصم مباشر' }
];

// أنواع الجرد
export const COUNT_TYPES = [
  { value: 'comprehensive', label: 'شامل' },
  { value: 'periodic', label: 'دوري' },
  { value: 'random_sample', label: 'عينة عشوائية' },
  { value: 'expired_materials', label: 'مواد منتهية الصلاحية' },
  { value: 'slow_moving_materials', label: 'مواد بطيئة الحركة' },
  { value: 'emergency_count', label: 'جرد طارئ' },
  { value: 'year_end_count', label: 'جرد نهاية السنة' }
];

// أسباب الفروقات في الجرد
export const VARIANCE_REASONS = [
  { value: 'registration_error', label: 'خطأ في التسجيل' },
  { value: 'damage', label: 'تلف' },
  { value: 'expiry', label: 'انتهاء صلاحية' },
  { value: 'theft', label: 'سرقة' },
  { value: 'loss', label: 'فقدان' },
  { value: 'counting_error', label: 'خطأ في العد' },
  { value: 'natural_evaporation', label: 'تبخر طبيعي' },
  { value: 'transportation_error', label: 'خطأ في النقل' },
  { value: 'leakage', label: 'تسرب' },
  { value: 'breakage', label: 'كسر' },
  { value: 'other', label: 'أخرى' }
];

// إجراءات الفروقات
export const VARIANCE_ACTIONS = [
  { value: 'system_adjustment', label: 'تعديل النظام' },
  { value: 'investigation', label: 'إجراء تحقيق' },
  { value: 'material_disposal', label: 'إعدام المادة' },
  { value: 'recount', label: 'إعادة عد' },
  { value: 'price_update', label: 'تحديث الأسعار' },
  { value: 'transfer_to_damaged_stock', label: 'تحويل لمخزون تالف' },
  { value: 'no_action', label: 'لا يوجد إجراء' }
];

// مستويات المخاطر
export const RISK_LEVELS = [
  { value: 'high', label: 'عالي' },
  { value: 'medium', label: 'متوسط' },
  { value: 'low', label: 'منخفض' }
];

// إجراءات انتهاء الصلاحية
export const EXPIRY_ACTIONS = [
  { value: 'immediate_disposal', label: 'إعدام فوري' },
  { value: 're_evaluation', label: 'إعادة تقييم' },
  { value: 'sell_at_discount', label: 'بيع بخصم' },
  { value: 'priority_use', label: 'استخدام أولوية' },
  { value: 'convert_to_another_product', label: 'تحويل لمنتج آخر' },
  { value: 'return_to_supplier', label: 'إرجاع للمورد' },
  { value: 'donation', label: 'تبرع' },
  { value: 'recycling', label: 'إعادة تدوير' }
];

// أنواع الحركات
export const MOVEMENT_TYPES = ['استلام', 'صرف', 'تحويل', 'إرجاع', 'تعديل', 'جرد', 'إعدام', 'تلف'];

// حالات أوامر الإنتاج
export const PRODUCTION_STATUS = ['مخطط', 'قيد التحضير', 'قيد التنفيذ', 'مكتمل', 'متوقف', 'ملغي'];

// أنواع اختبارات الجودة
export const QUALITY_TEST_TYPES = [
  'اختبار كيميائي',
  'اختبار فيزيائي',
  'اختبار ميكروبيولوجي',
  'اختبار حسي',
  'اختبار التعبئة',
  'اختبار الاستقرار'
];

// نتائج اختبارات الجودة
export const QUALITY_RESULTS = ['مطابق', 'غير مطابق', 'قيد الاختبار', 'إعادة اختبار'];


// توافق مع الاستيراد القديم
export const QUALITY_TEST_RESULTS = QUALITY_RESULTS;

// أنواع تقارير السلامة
export const SAFETY_REPORT_TYPES = ['حادث عمل', 'إصابة', 'حالة طوارئ', 'انتهاك سلامة', 'تفتيش سلامة', 'تدريب سلامة'];

// مستويات الخطورة
export const SEVERITY_LEVELS = ['منخفض', 'متوسط', 'عالي', 'حرج'];

// حالات التقارير
export const REPORT_STATUS = ['مفتوح', 'قيد المعالجة', 'مغلق', 'متابعة مطلوبة'];

// أنواع التنبيهات
export const ALERT_TYPES = [
  'انتهاء صلاحية',
  'نقص مخزون',
  'تجاوز حد أقصى',
  'خطأ في النظام',
  'تأخير في التسليم',
  'مطلوب موافقة'
];

// الألوان المتاحة للعناصر
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4'
};

// أحجام العناصر
export const SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
};

// متغيرات النظام
export const SYSTEM_CONFIG = {
  // إعدادات الترقيم التلقائي
  AUTO_NUMBERING: {
    CUSTOMER: 'CUST-',
    PRODUCT: 'PROD-',
    QUOTATION: 'QUO-',
    INVOICE: 'INV-',
    RECEIPT: 'RCP-',
    ISSUE: 'ISS-',
    COUNT: 'CNT-',
    EXPIRY: 'EXP-'
  },

  // إعدادات العملة
  CURRENCY: {
    SYMBOL: 'ريال',
    CODE: 'SAR',
    DECIMAL_PLACES: 2
  },

  // إعدادات التاريخ
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',

  // إعدادات الجداول
  TABLE: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 25, 50, 100]
  },

  // إعدادات التنبيهات
  ALERTS: {
    EXPIRY_WARNING_DAYS: 30,
    LOW_STOCK_THRESHOLD: 10,
    AUTO_DISMISS_TIME: 5000
  }
};

// حالات الطلبات
export const ORDER_STATUS = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'processing', label: 'قيد المعالجة' },
  { value: 'preparing', label: 'قيد التحضير' },
  { value: 'ready_to_ship', label: 'جاهز للشحن' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'returned', label: 'مرتجع' }
];

// أولويات الطلبات
export const ORDER_PRIORITIES = [
  { value: 'normal', label: 'عادي' },
  { value: 'important', label: 'مهم' },
  { value: 'urgent', label: 'عاجل' },
  { value: 'emergency', label: 'طارئ' }
];

// حالات الجودة
export const QUALITY_STATUS = [
  { value: 'accepted', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'under_inspection', label: 'قيد الفحص' },
  { value: 'needs_recheck', label: 'يحتاج إعادة فحص' },
  { value: 'on_hold', label: 'معلق' }
];

// رسائل النظام
// ثوابت الموارد البشرية
export const EMPLOYEE_STATUS = ['نشط', 'غير نشط', 'في إجازة', 'منتهي الخدمة', 'معلق', 'تحت التجربة'];

export const DEPARTMENT_OPTIONS = [
  'الإدارة العامة',
  'الموارد البشرية',
  'المالية والمحاسبة',
  'المبيعات والتسويق',
  'الإنتاج',
  'الجودة',
  'المستودعات',
  'الصيانة',
  'تقنية المعلومات',
  'الأمن والسلامة',
  'الشؤون القانونية',
  'خدمة العملاء'
];

export const POSITION_LEVELS = [
  'مدير عام',
  'مدير',
  'نائب مدير',
  'رئيس قسم',
  'مشرف',
  'أخصائي أول',
  'أخصائي',
  'موظف أول',
  'موظف',
  'مساعد إداري',
  'متدرب'
];

export const EMPLOYMENT_TYPES = ['دوام كامل', 'دوام جزئي', 'متعاقد', 'مؤقت', 'موسمي', 'استشاري', 'متدرب'];

export const LEAVE_TYPES = [
  'إجازة سنوية',
  'إجازة مرضية',
  'إجازة أمومة',
  'إجازة أبوة',
  'إجازة طارئة',
  'إجازة بدون راتب',
  'إجازة حج',
  'إجازة دراسية',
  'إجازة زواج',
  'إجازة وفاة'
];

export const PERFORMANCE_RATINGS = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'يحتاج تحسين', 'غير مرضي'];

export const TRAINING_STATUS = ['مخطط', 'قيد التنفيذ', 'مكتمل', 'ملغي', 'مؤجل'];

export const MESSAGES = {
  SUCCESS: {
    SAVE: 'تم الحفظ بنجاح',
    UPDATE: 'تم التحديث بنجاح',
    DELETE: 'تم الحذف بنجاح',
    EXPORT: 'تم التصدير بنجاح'
  },
  ERROR: {
    REQUIRED_FIELD: 'هذا الحقل مطلوب',
    INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
    INVALID_PHONE: 'رقم الهاتف غير صحيح',
    DUPLICATE_CODE: 'هذا الكود موجود مسبقاً',
    SAVE_ERROR: 'حدث خطأ أثناء الحفظ',
    DELETE_ERROR: 'حدث خطأ أثناء الحذف',
    NETWORK_ERROR: 'خطأ في الاتصال'
  },
  CONFIRMATION: {
    DELETE: 'هل أنت متأكد من الحذف؟',
    CANCEL: 'هل تريد إلغاء العملية؟',
    SAVE_CHANGES: 'هل تريد حفظ التغييرات؟'
  }
};

// تصدير جميع الثوابت كـ default
export default {
  STORAGE_KEYS,
  UNITS,
  WAREHOUSE_TYPES,
  MATERIAL_CATEGORIES,
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  PRODUCT_CATEGORIES,
  CATEGORIES,
  PAYMENT_TERMS,
  DELIVERY_TERMS,
  STATUS_OPTIONS,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  SAUDI_REGIONS,
  PRODUCT_STATUS,
  QUOTATION_STATUS,
  INVOICE_STATUS,
  PAYMENT_METHODS,
  COUNT_TYPES,
  VARIANCE_REASONS,
  VARIANCE_ACTIONS,
  RISK_LEVELS,
  EXPIRY_ACTIONS,
  MOVEMENT_TYPES,
  PRODUCTION_STATUS,
  QUALITY_TEST_TYPES,
  QUALITY_RESULTS,
  SAFETY_REPORT_TYPES,
  SEVERITY_LEVELS,
  REPORT_STATUS,
  ALERT_TYPES,
  COLORS,
  SIZES,
  SYSTEM_CONFIG,
  MESSAGES,
  ORDER_STATUS,
  ORDER_PRIORITIES,
  QUALITY_STATUS,
  EMPLOYEE_STATUS,
  DEPARTMENT_OPTIONS,
  POSITION_LEVELS,
  EMPLOYMENT_TYPES,
  LEAVE_TYPES,
  PERFORMANCE_RATINGS,
  TRAINING_STATUS
};
