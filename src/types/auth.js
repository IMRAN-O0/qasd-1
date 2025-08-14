/**
 * @fileoverview تعريفات أنواع المصادقة والمستخدمين
 */

/**
 * @typedef {Object} User
 * @property {string} id - معرف المستخدم
 * @property {string} username - اسم المستخدم
 * @property {string} [fullName] - الاسم الكامل للمستخدم
 * @property {string} [email] - البريد الإلكتروني للمستخدم
 * @property {string[]} roles - أدوار المستخدم
 * @property {string[]} permissions - صلاحيات المستخدم
 * @property {string} [avatar] - رابط الصورة الرمزية للمستخدم
 * @property {string} [lastLogin] - تاريخ آخر تسجيل دخول
 * @property {boolean} [isActive] - حالة نشاط المستخدم
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - المستخدم الحالي
 * @property {boolean} isAuthenticated - حالة المصادقة
 * @property {boolean} isLoading - حالة التحميل
 * @property {string[]} permissions - صلاحيات المستخدم
 * @property {string[]} roles - أدوار المستخدم
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username - اسم المستخدم
 * @property {string} password - كلمة المرور
 * @property {boolean} [rememberMe] - تذكر المستخدم
 */

/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success - نجاح عملية تسجيل الدخول
 * @property {string} [message] - رسالة توضيحية
 * @property {User} [user] - بيانات المستخدم
 * @property {string} [token] - رمز المصادقة
 * @property {string} [refreshToken] - رمز تحديث المصادقة
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string} currentPassword - كلمة المرور الحالية
 * @property {string} newPassword - كلمة المرور الجديدة
 * @property {string} confirmPassword - تأكيد كلمة المرور الجديدة
 */

/**
 * @typedef {Object} PasswordResetRequest
 * @property {string} email - البريد الإلكتروني للمستخدم
 * @property {string} [token] - رمز إعادة تعيين كلمة المرور
 * @property {string} [newPassword] - كلمة المرور الجديدة
 */

/**
 * @typedef {Object} SessionInfo
 * @property {string} loginTime - وقت تسجيل الدخول
 * @property {string} expiryTime - وقت انتهاء الجلسة
 * @property {string} userAgent - معلومات متصفح المستخدم
 * @property {string} [ipAddress] - عنوان IP للمستخدم
 */

export {}; // تصدير فارغ لأن هذا الملف يستخدم فقط للتوثيق
