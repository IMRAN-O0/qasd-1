// تعريف الأدوار والصلاحيات
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // صلاحيات عامة
  VIEW_DASHBOARD: 'view_dashboard',
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',

  // صلاحيات المستخدمين
  CREATE_USER: 'create_user',
  VIEW_USERS: 'view_users',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',

  // صلاحيات المبيعات
  CREATE_CUSTOMER: 'create_customer',
  VIEW_CUSTOMERS: 'view_customers',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  CREATE_QUOTATION: 'create_quotation',
  VIEW_QUOTATIONS: 'view_quotations',
  EDIT_QUOTATION: 'edit_quotation',
  DELETE_QUOTATION: 'delete_quotation',
  APPROVE_QUOTATION: 'approve_quotation',
  CREATE_INVOICE: 'create_invoice',
  VIEW_INVOICES: 'view_invoices',
  EDIT_INVOICE: 'edit_invoice',
  DELETE_INVOICE: 'delete_invoice',

  // صلاحيات المستودعات
  CREATE_MATERIAL: 'create_material',
  VIEW_MATERIALS: 'view_materials',
  EDIT_MATERIAL: 'edit_material',
  DELETE_MATERIAL: 'delete_material',
  RECEIVE_MATERIALS: 'receive_materials',
  ISSUE_MATERIALS: 'issue_materials',
  CONDUCT_INVENTORY: 'conduct_inventory',
  VIEW_INVENTORY_REPORTS: 'view_inventory_reports',

  // صلاحيات الإنتاج
  CREATE_PRODUCTION_ORDER: 'create_production_order',
  VIEW_PRODUCTION_ORDERS: 'view_production_orders',
  EDIT_PRODUCTION_ORDER: 'edit_production_order',
  DELETE_PRODUCTION_ORDER: 'delete_production_order',
  START_PRODUCTION: 'start_production',
  STOP_PRODUCTION: 'stop_production',
  VIEW_PRODUCTION_REPORTS: 'view_production_reports',

  // صلاحيات الجودة
  CREATE_QUALITY_TEST: 'create_quality_test',
  VIEW_QUALITY_TESTS: 'view_quality_tests',
  EDIT_QUALITY_TEST: 'edit_quality_test',
  DELETE_QUALITY_TEST: 'delete_quality_test',
  APPROVE_QUALITY: 'approve_quality',
  REJECT_QUALITY: 'reject_quality',
  VIEW_QUALITY_REPORTS: 'view_quality_reports',

  // صلاحيات السلامة
  CREATE_SAFETY_REPORT: 'create_safety_report',
  VIEW_SAFETY_REPORTS: 'view_safety_reports',
  EDIT_SAFETY_REPORT: 'edit_safety_report',
  DELETE_SAFETY_REPORT: 'delete_safety_report',
  CONDUCT_SAFETY_INSPECTION: 'conduct_safety_inspection',

  // صلاحيات التقارير
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  VIEW_OPERATIONAL_REPORTS: 'view_operational_reports',
  VIEW_ANALYTICAL_REPORTS: 'view_analytical_reports',
  CREATE_CUSTOM_REPORTS: 'create_custom_reports'
};

// تعريف الصلاحيات لكل دور
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_ROLES,
    // جميع صلاحيات المبيعات
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.EDIT_QUOTATION,
    PERMISSIONS.DELETE_QUOTATION,
    PERMISSIONS.APPROVE_QUOTATION,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    // جميع صلاحيات المستودعات
    PERMISSIONS.CREATE_MATERIAL,
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.EDIT_MATERIAL,
    PERMISSIONS.DELETE_MATERIAL,
    PERMISSIONS.RECEIVE_MATERIALS,
    PERMISSIONS.ISSUE_MATERIALS,
    PERMISSIONS.CONDUCT_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    // جميع صلاحيات الإنتاج
    PERMISSIONS.CREATE_PRODUCTION_ORDER,
    PERMISSIONS.VIEW_PRODUCTION_ORDERS,
    PERMISSIONS.EDIT_PRODUCTION_ORDER,
    PERMISSIONS.DELETE_PRODUCTION_ORDER,
    PERMISSIONS.START_PRODUCTION,
    PERMISSIONS.STOP_PRODUCTION,
    PERMISSIONS.VIEW_PRODUCTION_REPORTS,
    // جميع صلاحيات الجودة
    PERMISSIONS.CREATE_QUALITY_TEST,
    PERMISSIONS.VIEW_QUALITY_TESTS,
    PERMISSIONS.EDIT_QUALITY_TEST,
    PERMISSIONS.DELETE_QUALITY_TEST,
    PERMISSIONS.APPROVE_QUALITY,
    PERMISSIONS.REJECT_QUALITY,
    PERMISSIONS.VIEW_QUALITY_REPORTS,
    // جميع صلاحيات السلامة
    PERMISSIONS.CREATE_SAFETY_REPORT,
    PERMISSIONS.VIEW_SAFETY_REPORTS,
    PERMISSIONS.EDIT_SAFETY_REPORT,
    PERMISSIONS.DELETE_SAFETY_REPORT,
    PERMISSIONS.CONDUCT_SAFETY_INSPECTION,
    // جميع صلاحيات التقارير
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_OPERATIONAL_REPORTS,
    PERMISSIONS.VIEW_ANALYTICAL_REPORTS,
    PERMISSIONS.CREATE_CUSTOM_REPORTS
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_USERS,
    // صلاحيات المبيعات
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.EDIT_QUOTATION,
    PERMISSIONS.APPROVE_QUOTATION,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.EDIT_INVOICE,
    // صلاحيات المستودعات
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.EDIT_MATERIAL,
    PERMISSIONS.RECEIVE_MATERIALS,
    PERMISSIONS.ISSUE_MATERIALS,
    PERMISSIONS.CONDUCT_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    // صلاحيات الإنتاج
    PERMISSIONS.CREATE_PRODUCTION_ORDER,
    PERMISSIONS.VIEW_PRODUCTION_ORDERS,
    PERMISSIONS.EDIT_PRODUCTION_ORDER,
    PERMISSIONS.START_PRODUCTION,
    PERMISSIONS.STOP_PRODUCTION,
    PERMISSIONS.VIEW_PRODUCTION_REPORTS,
    // صلاحيات الجودة
    PERMISSIONS.VIEW_QUALITY_TESTS,
    PERMISSIONS.APPROVE_QUALITY,
    PERMISSIONS.REJECT_QUALITY,
    PERMISSIONS.VIEW_QUALITY_REPORTS,
    // صلاحيات السلامة
    PERMISSIONS.VIEW_SAFETY_REPORTS,
    PERMISSIONS.CONDUCT_SAFETY_INSPECTION,
    // صلاحيات التقارير
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_OPERATIONAL_REPORTS,
    PERMISSIONS.VIEW_ANALYTICAL_REPORTS
  ],

  [ROLES.SUPERVISOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.EXPORT_DATA,
    // صلاحيات محدودة للمبيعات
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.EDIT_QUOTATION,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_INVOICES,
    // صلاحيات المستودعات
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.RECEIVE_MATERIALS,
    PERMISSIONS.ISSUE_MATERIALS,
    PERMISSIONS.CONDUCT_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    // صلاحيات الإنتاج
    PERMISSIONS.VIEW_PRODUCTION_ORDERS,
    PERMISSIONS.START_PRODUCTION,
    PERMISSIONS.STOP_PRODUCTION,
    PERMISSIONS.VIEW_PRODUCTION_REPORTS,
    // صلاحيات الجودة
    PERMISSIONS.CREATE_QUALITY_TEST,
    PERMISSIONS.VIEW_QUALITY_TESTS,
    PERMISSIONS.EDIT_QUALITY_TEST,
    // صلاحيات السلامة
    PERMISSIONS.CREATE_SAFETY_REPORT,
    PERMISSIONS.VIEW_SAFETY_REPORTS,
    PERMISSIONS.EDIT_SAFETY_REPORT
  ],

  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    // صلاحيات أساسية للمبيعات
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.VIEW_INVOICES,
    // صلاحيات أساسية للمستودعات
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.RECEIVE_MATERIALS,
    PERMISSIONS.ISSUE_MATERIALS,
    // صلاحيات أساسية للإنتاج
    PERMISSIONS.VIEW_PRODUCTION_ORDERS,
    // صلاحيات أساسية للجودة
    PERMISSIONS.CREATE_QUALITY_TEST,
    PERMISSIONS.VIEW_QUALITY_TESTS,
    // صلاحيات أساسية للسلامة
    PERMISSIONS.CREATE_SAFETY_REPORT,
    PERMISSIONS.VIEW_SAFETY_REPORTS
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.VIEW_PRODUCTION_ORDERS,
    PERMISSIONS.VIEW_QUALITY_TESTS,
    PERMISSIONS.VIEW_SAFETY_REPORTS
  ]
};

// إدارة الصلاحيات
export const permissionManager = {
  // الحصول على صلاحيات الدور
  getRolePermissions: role => {
    return ROLE_PERMISSIONS[role] || [];
  },

  // الحصول على جميع صلاحيات المستخدم
  getUserPermissions: user => {
    if (!user || !user.roles) {
      return [];
    }

    const permissions = new Set();

    // جمع صلاحيات جميع الأدوار
    user.roles.forEach(role => {
      const rolePermissions = permissionManager.getRolePermissions(role);
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    // إضافة الصلاحيات المخصصة
    if (user.customPermissions) {
      user.customPermissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  },

  // التحقق من صلاحية معينة
  hasPermission: (user, permission) => {
    const userPermissions = permissionManager.getUserPermissions(user);
    return userPermissions.includes(permission);
  },

  // التحقق من عدة صلاحيات (جميعها مطلوبة)
  hasAllPermissions: (user, permissions) => {
    return permissions.every(permission => permissionManager.hasPermission(user, permission));
  },

  // التحقق من عدة صلاحيات (إحداها كافية)
  hasAnyPermission: (user, permissions) => {
    return permissions.some(permission => permissionManager.hasPermission(user, permission));
  },

  // التحقق من دور معين
  hasRole: (user, role) => {
    return user && user.roles && user.roles.includes(role);
  },

  // التحقق من عدة أدوار (إحداها كافية)
  hasAnyRole: (user, roles) => {
    return roles.some(role => permissionManager.hasRole(user, role));
  },

  // إضافة دور للمستخدم
  addRole: (user, role) => {
    if (!user.roles) {
      user.roles = [];
    }
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    return user;
  },

  // إزالة دور من المستخدم
  removeRole: (user, role) => {
    if (user.roles) {
      user.roles = user.roles.filter(r => r !== role);
    }
    return user;
  },

  // إضافة صلاحية مخصصة
  addCustomPermission: (user, permission) => {
    if (!user.customPermissions) {
      user.customPermissions = [];
    }
    if (!user.customPermissions.includes(permission)) {
      user.customPermissions.push(permission);
    }
    return user;
  },

  // إزالة صلاحية مخصصة
  removeCustomPermission: (user, permission) => {
    if (user.customPermissions) {
      user.customPermissions = user.customPermissions.filter(p => p !== permission);
    }
    return user;
  }
};

// فلترة المحتوى حسب الصلاحيات
export const contentFilter = {
  // فلترة عناصر القائمة
  filterMenuItems: (menuItems, user) => {
    return menuItems.filter(item => {
      if (!item.requiredPermissions) {
        return true;
      }
      return permissionManager.hasAnyPermission(user, item.requiredPermissions);
    });
  },

  // فلترة الأزرار والإجراءات
  filterActions: (actions, user) => {
    return actions.filter(action => {
      if (!action.requiredPermissions) {
        return true;
      }
      return permissionManager.hasAnyPermission(user, action.requiredPermissions);
    });
  },

  // فلترة البيانات حسب مستوى الوصول
  filterDataByAccess: (data, user, accessLevels = {}) => {
    const userPermissions = permissionManager.getUserPermissions(user);

    return data.filter(item => {
      // إذا لم يكن هناك مستوى وصول محدد، السماح بالعرض
      if (!item.accessLevel) {
        return true;
      }

      // التحقق من مستوى الوصول المطلوب
      const requiredPermissions = accessLevels[item.accessLevel] || [];
      return requiredPermissions.some(permission => userPermissions.includes(permission));
    });
  },

  // إخفاء الحقول الحساسة
  filterSensitiveFields: (data, user) => {
    const canViewSensitive = permissionManager.hasPermission(user, 'view_sensitive_data');

    if (canViewSensitive) {
      return data;
    }

    // إزالة الحقول الحساسة
    const sensitiveFields = ['salary', 'ssn', 'creditCard', 'password'];

    if (Array.isArray(data)) {
      return data.map(item => {
        const filtered = { ...item };
        sensitiveFields.forEach(field => {
          if (field in filtered) {
            delete filtered[field];
          }
        });
        return filtered;
      });
    } else {
      const filtered = { ...data };
      sensitiveFields.forEach(field => {
        if (field in filtered) {
          delete filtered[field];
        }
      });
      return filtered;
    }
  }
};

// إدارة مستويات الوصول
export const accessLevels = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
  TOP_SECRET: 'top_secret'
};

// تعريف الصلاحيات المطلوبة لكل مستوى وصول
export const ACCESS_LEVEL_PERMISSIONS = {
  [accessLevels.PUBLIC]: [],
  [accessLevels.INTERNAL]: [PERMISSIONS.VIEW_DASHBOARD],
  [accessLevels.CONFIDENTIAL]: [PERMISSIONS.VIEW_FINANCIAL_REPORTS],
  [accessLevels.RESTRICTED]: [PERMISSIONS.MANAGE_ROLES],
  [accessLevels.TOP_SECRET]: [PERMISSIONS.DELETE_USER]
};

// دوال مساعدة للصلاحيات
export const permissionHelpers = {
  // إنشاء قائمة منسدلة للأدوار
  getRoleOptions: () => {
    return Object.values(ROLES).map(role => ({
      value: role,
      label: permissionHelpers.getRoleDisplayName(role)
    }));
  },

  // الحصول على اسم الدور للعرض
  getRoleDisplayName: role => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: 'مدير عام',
      [ROLES.ADMIN]: 'مدير',
      [ROLES.MANAGER]: 'مدير قسم',
      [ROLES.SUPERVISOR]: 'مشرف',
      [ROLES.EMPLOYEE]: 'موظف',
      [ROLES.VIEWER]: 'مشاهد'
    };
    return roleNames[role] || role;
  },

  // الحصول على وصف الصلاحية
  getPermissionDescription: permission => {
    const descriptions = {
      [PERMISSIONS.VIEW_DASHBOARD]: 'عرض لوحة التحكم',
      [PERMISSIONS.CREATE_USER]: 'إنشاء مستخدم جديد',
      [PERMISSIONS.VIEW_USERS]: 'عرض المستخدمين',
      [PERMISSIONS.EDIT_USER]: 'تعديل بيانات المستخدم',
      [PERMISSIONS.DELETE_USER]: 'حذف المستخدم',
      [PERMISSIONS.MANAGE_ROLES]: 'إدارة الأدوار والصلاحيات',
      [PERMISSIONS.CREATE_CUSTOMER]: 'إضافة عميل جديد',
      [PERMISSIONS.VIEW_CUSTOMERS]: 'عرض العملاء',
      [PERMISSIONS.EDIT_CUSTOMER]: 'تعديل بيانات العميل',
      [PERMISSIONS.DELETE_CUSTOMER]: 'حذف العميل'
      // يمكن إضافة المزيد حسب الحاجة
    };
    return descriptions[permission] || permission;
  },

  // تجميع الصلاحيات حسب الفئة
  groupPermissionsByCategory: () => {
    return {
      عام: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.EXPORT_DATA, PERMISSIONS.IMPORT_DATA],
      المستخدمين: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.MANAGE_ROLES
      ],
      المبيعات: [
        PERMISSIONS.CREATE_CUSTOMER,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.EDIT_CUSTOMER,
        PERMISSIONS.DELETE_CUSTOMER,
        PERMISSIONS.CREATE_QUOTATION,
        PERMISSIONS.VIEW_QUOTATIONS,
        PERMISSIONS.EDIT_QUOTATION,
        PERMISSIONS.DELETE_QUOTATION,
        PERMISSIONS.APPROVE_QUOTATION,
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.DELETE_INVOICE
      ],
      المستودعات: [
        PERMISSIONS.CREATE_MATERIAL,
        PERMISSIONS.VIEW_MATERIALS,
        PERMISSIONS.EDIT_MATERIAL,
        PERMISSIONS.DELETE_MATERIAL,
        PERMISSIONS.RECEIVE_MATERIALS,
        PERMISSIONS.ISSUE_MATERIALS,
        PERMISSIONS.CONDUCT_INVENTORY,
        PERMISSIONS.VIEW_INVENTORY_REPORTS
      ],
      الإنتاج: [
        PERMISSIONS.CREATE_PRODUCTION_ORDER,
        PERMISSIONS.VIEW_PRODUCTION_ORDERS,
        PERMISSIONS.EDIT_PRODUCTION_ORDER,
        PERMISSIONS.DELETE_PRODUCTION_ORDER,
        PERMISSIONS.START_PRODUCTION,
        PERMISSIONS.STOP_PRODUCTION,
        PERMISSIONS.VIEW_PRODUCTION_REPORTS
      ],
      الجودة: [
        PERMISSIONS.CREATE_QUALITY_TEST,
        PERMISSIONS.VIEW_QUALITY_TESTS,
        PERMISSIONS.EDIT_QUALITY_TEST,
        PERMISSIONS.DELETE_QUALITY_TEST,
        PERMISSIONS.APPROVE_QUALITY,
        PERMISSIONS.REJECT_QUALITY,
        PERMISSIONS.VIEW_QUALITY_REPORTS
      ],
      السلامة: [
        PERMISSIONS.CREATE_SAFETY_REPORT,
        PERMISSIONS.VIEW_SAFETY_REPORTS,
        PERMISSIONS.EDIT_SAFETY_REPORT,
        PERMISSIONS.DELETE_SAFETY_REPORT,
        PERMISSIONS.CONDUCT_SAFETY_INSPECTION
      ],
      التقارير: [
        PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        PERMISSIONS.VIEW_OPERATIONAL_REPORTS,
        PERMISSIONS.VIEW_ANALYTICAL_REPORTS,
        PERMISSIONS.CREATE_CUSTOM_REPORTS
      ]
    };
  },

  // التحقق من التسلسل الهرمي للأدوار
  isHigherRole: (role1, role2) => {
    const hierarchy = {
      [ROLES.SUPER_ADMIN]: 6,
      [ROLES.ADMIN]: 5,
      [ROLES.MANAGER]: 4,
      [ROLES.SUPERVISOR]: 3,
      [ROLES.EMPLOYEE]: 2,
      [ROLES.VIEWER]: 1
    };

    return (hierarchy[role1] || 0) > (hierarchy[role2] || 0);
  },

  // التحقق من إمكانية تعديل دور معين
  canModifyRole: (currentUserRole, targetRole) => {
    // المدير العام يمكنه تعديل جميع الأدوار
    if (currentUserRole === ROLES.SUPER_ADMIN) {
      return true;
    }

    // المدير يمكنه تعديل الأدوار الأقل منه
    if (currentUserRole === ROLES.ADMIN) {
      return [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.EMPLOYEE, ROLES.VIEWER].includes(targetRole);
    }

    // المدير القسم يمكنه تعديل المشرفين والموظفين والمشاهدين
    if (currentUserRole === ROLES.MANAGER) {
      return [ROLES.SUPERVISOR, ROLES.EMPLOYEE, ROLES.VIEWER].includes(targetRole);
    }

    return false;
  }
};

// Hook للصلاحيات (للاستخدام مع React)
export const usePermissions = user => {
  const hasPermission = permission => permissionManager.hasPermission(user, permission);
  const hasAnyPermission = permissions => permissionManager.hasAnyPermission(user, permissions);
  const hasAllPermissions = permissions => permissionManager.hasAllPermissions(user, permissions);
  const hasRole = role => permissionManager.hasRole(user, role);
  const hasAnyRole = roles => permissionManager.hasAnyRole(user, roles);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: permissionManager.getUserPermissions(user),
    roles: user?.roles || []
  };
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  permissionManager,
  contentFilter,
  accessLevels,
  ACCESS_LEVEL_PERMISSIONS,
  permissionHelpers,
  usePermissions
};
