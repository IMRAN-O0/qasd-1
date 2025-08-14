import { STORAGE_KEYS } from '../constants';

// مفاتيح التخزين للمصادقة
const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'current_user',
  REFRESH_TOKEN: 'refresh_token',
  LOGIN_TIME: 'login_time',
  REMEMBER_ME: 'remember_me'
};

// إدارة الرموز المميزة (Tokens)
export const tokenManager = {
  // حفظ الرمز المميز
  setToken: (token, refreshToken = null) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());

    if (refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  // الحصول على الرمز المميز
  getToken: () => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  },

  // الحصول على رمز التحديث
  getRefreshToken: () => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },

  // حذف الرموز المميزة
  removeTokens: () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_TIME);
  },

  // التحقق من صحة الرمز المميز
  isTokenValid: () => {
    const token = tokenManager.getToken();
    const loginTime = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIME);

    if (!token || !loginTime) {
      return false;
    }

    // التحقق من انتهاء صلاحية الرمز (24 ساعة افتراضياً)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffHours = (now - loginDate) / (1000 * 60 * 60);

    return diffHours < 24;
  },

  // تحديث الرمز المميز
  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('لا يوجد رمز تحديث');
    }

    // هنا يمكن إضافة استدعاء API لتحديث الرمز
    // في الوقت الحالي سنعيد نفس الرمز
    return refreshToken;
  }
};

// إدارة المستخدم الحالي
export const userManager = {
  // حفظ بيانات المستخدم
  setUser: user => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // الحصول على بيانات المستخدم
  getUser: () => {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },

  // حذف بيانات المستخدم
  removeUser: () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },

  // تحديث بيانات المستخدم
  updateUser: updates => {
    const currentUser = userManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      userManager.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  },

  // التحقق من دور المستخدم
  hasRole: role => {
    const user = userManager.getUser();
    return user && user.roles && user.roles.includes(role);
  },

  // التحقق من صلاحية المستخدم
  hasPermission: permission => {
    const user = userManager.getUser();
    return user && user.permissions && user.permissions.includes(permission);
  }
};

// وظائف تشفير كلمات المرور
export const passwordUtils = {
  // تشفير كلمة المرور (بسيط للعرض التوضيحي)
  hashPassword: password => {
    // في الواقع يجب استخدام مكتبة تشفير قوية
    return btoa(password + 'salt_key');
  },

  // التحقق من كلمة المرور
  verifyPassword: (password, hashedPassword) => {
    return passwordUtils.hashPassword(password) === hashedPassword;
  },

  // توليد كلمة مرور عشوائية
  generatePassword: (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  // التحقق من قوة كلمة المرور
  validatePasswordStrength: password => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [password.length >= minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    let strength = 'ضعيف';
    if (score >= 4) {
      strength = 'قوي';
    } else if (score >= 3) {
      strength = 'متوسط';
    }

    return {
      score,
      strength,
      requirements: {
        minLength: password.length >= minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  }
};

// إدارة الجلسات
export const sessionManager = {
  // بدء جلسة جديدة
  startSession: (user, token, options = {}) => {
    const { rememberMe = false, refreshToken = null } = options;

    userManager.setUser(user);
    tokenManager.setToken(token, refreshToken);

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
    }

    // تسجيل وقت تسجيل الدخول
    const loginEvent = {
      userId: user.id,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'localhost' // في التطبيق الحقيقي يجب الحصول على IP الحقيقي
    };

    // حفظ سجل تسجيل الدخول
    const loginHistory = JSON.parse(localStorage.getItem('login_history') || '[]');
    loginHistory.unshift(loginEvent);
    localStorage.setItem('login_history', JSON.stringify(loginHistory.slice(0, 10))); // آخر 10 مرات
  },

  // إنهاء الجلسة
  endSession: () => {
    const user = userManager.getUser();

    if (user) {
      // تسجيل وقت تسجيل الخروج
      const logoutEvent = {
        userId: user.id,
        timestamp: new Date().toISOString(),
        action: 'logout'
      };

      const logoutHistory = JSON.parse(localStorage.getItem('logout_history') || '[]');
      logoutHistory.unshift(logoutEvent);
      localStorage.setItem('logout_history', JSON.stringify(logoutHistory.slice(0, 10)));
    }

    userManager.removeUser();
    tokenManager.removeTokens();
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  },

  // التحقق من صحة الجلسة
  isSessionValid: () => {
    const user = userManager.getUser();
    const token = tokenManager.getToken();
    const isTokenValid = tokenManager.isTokenValid();

    return !!(user && token && isTokenValid);
  },

  // تمديد الجلسة
  extendSession: () => {
    if (sessionManager.isSessionValid()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIME, new Date().toISOString());
      return true;
    }
    return false;
  },

  // الحصول على معلومات الجلسة
  getSessionInfo: () => {
    const user = userManager.getUser();
    const loginTime = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIME);
    const rememberMe = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';

    if (!user || !loginTime) {
      return null;
    }

    const loginDate = new Date(loginTime);
    const now = new Date();
    const sessionDuration = Math.floor((now - loginDate) / (1000 * 60)); // بالدقائق

    return {
      user,
      loginTime: loginDate,
      sessionDuration,
      rememberMe,
      isValid: sessionManager.isSessionValid()
    };
  }
};

// إدارة أذونات الوصول
export const accessControl = {
  // التحقق من الوصول للصفحة
  canAccessPage: (pageName, userRoles = []) => {
    const pagePermissions = {
      dashboard: ['admin', 'manager', 'employee'],
      users: ['admin'],
      sales: ['admin', 'manager', 'sales'],
      inventory: ['admin', 'manager', 'warehouse'],
      production: ['admin', 'manager', 'production'],
      quality: ['admin', 'manager', 'quality'],
      safety: ['admin', 'manager', 'safety'],
      reports: ['admin', 'manager']
    };

    const requiredRoles = pagePermissions[pageName] || [];
    return requiredRoles.some(role => userRoles.includes(role));
  },

  // التحقق من إمكانية تنفيذ العملية
  canPerformAction: (action, userPermissions = []) => {
    const actionPermissions = {
      create: ['create'],
      read: ['read'],
      update: ['update'],
      delete: ['delete'],
      export: ['export'],
      import: ['import'],
      approve: ['approve'],
      reject: ['reject']
    };

    const requiredPermissions = actionPermissions[action] || [];
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  },

  // فلترة البيانات حسب الصلاحيات
  filterDataByPermissions: (data, userPermissions) => {
    // يمكن تخصيص هذه الدالة حسب نوع البيانات
    return data.filter(item => {
      // مثال: إخفاء البيانات الحساسة للمستخدمين غير المخولين
      if (item.sensitive && !userPermissions.includes('view_sensitive')) {
        return false;
      }
      return true;
    });
  }
};

// دوال مساعدة للمصادقة
export const authHelpers = {
  // إنشاء رمز مميز وهمي
  generateMockToken: userId => {
    const payload = {
      userId,
      timestamp: Date.now(),
      random: Math.random()
    };
    return btoa(JSON.stringify(payload));
  },

  // فك تشفير الرمز المميز الوهمي
  decodeMockToken: token => {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  },

  // التحقق من تسجيل الدخول التلقائي
  checkAutoLogin: () => {
    const rememberMe = localStorage.getItem(AUTH_STORAGE_KEYS.REMEMBER_ME) === 'true';
    const isSessionValid = sessionManager.isSessionValid();

    return rememberMe && isSessionValid;
  },

  // تنظيف البيانات المنتهية الصلاحية
  cleanupExpiredData: () => {
    const keys = ['login_history', 'logout_history', 'failed_login_attempts'];

    keys.forEach(key => {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const filteredData = data.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate > oneMonthAgo;
      });

      localStorage.setItem(key, JSON.stringify(filteredData));
    });
  },

  // تسجيل محاولة تسجيل دخول فاشلة
  logFailedLogin: username => {
    const failedAttempts = JSON.parse(localStorage.getItem('failed_login_attempts') || '[]');
    failedAttempts.unshift({
      username,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    localStorage.setItem('failed_login_attempts', JSON.stringify(failedAttempts.slice(0, 20)));
  },

  // التحقق من محاولات تسجيل الدخول المتكررة
  checkBruteForce: (username, maxAttempts = 5, timeWindow = 15) => {
    const failedAttempts = JSON.parse(localStorage.getItem('failed_login_attempts') || '[]');
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 60 * 1000);

    const recentAttempts = failedAttempts.filter(attempt => {
      const attemptTime = new Date(attempt.timestamp);
      return attempt.username === username && attemptTime > windowStart;
    });

    return recentAttempts.length >= maxAttempts;
  }
};

// إعدادات المصادقة الافتراضية
export const authConfig = {
  // مدة انتهاء صلاحية الجلسة (بالساعات)
  sessionTimeout: 24,

  // مدة انتهاء صلاحية رمز التحديث (بالأيام)
  refreshTokenTimeout: 7,

  // عدد محاولات تسجيل الدخول المسموحة
  maxLoginAttempts: 5,

  // مدة الحظر بعد تجاوز المحاولات (بالدقائق)
  lockoutDuration: 15,

  // الأدوار الافتراضية
  defaultRoles: ['employee'],

  // الصلاحيات الافتراضية
  defaultPermissions: ['read']
};

export default {
  tokenManager,
  userManager,
  passwordUtils,
  sessionManager,
  accessControl,
  authHelpers,
  authConfig
};
