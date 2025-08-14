/**
 * خدمة المصادقة
 *
 * توفر هذه الخدمة واجهة للتعامل مع عمليات المصادقة مثل تسجيل الدخول والخروج
 * وإدارة الجلسات وتغيير كلمات المرور.
 */

import apiClient from './client';
import { tokenManager, userManager, sessionManager } from '../../utils/auth';

// مسارات API للمصادقة
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  CHANGE_PASSWORD: '/auth/change-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_TOKEN: '/auth/verify-token',
  USER_PROFILE: '/auth/profile'
};

/**
 * @typedef {import('../../types/auth').LoginCredentials} LoginCredentials
 * @typedef {import('../../types/auth').LoginResponse} LoginResponse
 * @typedef {import('../../types/auth').PasswordChangeRequest} PasswordChangeRequest
 * @typedef {import('../../types/auth').PasswordResetRequest} PasswordResetRequest
 * @typedef {import('../../types/auth').User} User
 */

/**
 * تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور
 *
 * @param {LoginCredentials} credentials - بيانات تسجيل الدخول
 * @returns {Promise<LoginResponse>} استجابة تسجيل الدخول
 */
async function login(credentials) {
  try {
    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
    
    if (response.success) {
      // حفظ بيانات المصادقة
      tokenManager.setToken(response.token, response.refreshToken);
      userManager.setUser(response.user);
      sessionManager.startSession(response.user, response.token, {
        rememberMe: credentials.rememberMe,
        refreshToken: response.refreshToken
      });
    }
    
    return response;
    */

    // استخدام المحاكاة المحلية من useAuth.js
    // هذا الكود سيتم استبداله عند الانتقال إلى API حقيقي
    const { username, password, rememberMe = false } = credentials;

    // استيراد المستخدمين من ملف البيانات
    const usersModule = await import('../../data/users.json');
    const users = usersModule.default || [];

    // البحث عن المستخدم
    const user = users.find(u => u.username === username);

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || user.password !== password) {
      return {
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      };
    }

    // إنشاء رمز مميز وهمي
    const token = btoa(`${username}:${Date.now()}`);
    const refreshToken = btoa(`refresh:${username}:${Date.now()}`);

    // حذف كلمة المرور من بيانات المستخدم المرسلة
    const { password: _, ...userWithoutPassword } = user;

    // حفظ بيانات المصادقة
    tokenManager.setToken(token, refreshToken);
    userManager.setUser(userWithoutPassword);
    sessionManager.startSession(userWithoutPassword, token, {
      rememberMe,
      refreshToken
    });

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: userWithoutPassword,
      token,
      refreshToken
    };
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء تسجيل الدخول'
    };
  }
}

/**
 * تسجيل الخروج
 *
 * @returns {Promise<{success: boolean, message: string}>} نتيجة تسجيل الخروج
 */
async function logout() {
  try {
    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    // إرسال طلب تسجيل الخروج إلى الخادم
    const token = tokenManager.getToken();
    if (token) {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { token });
    }
    */

    // إنهاء الجلسة المحلية
    sessionManager.endSession();
    tokenManager.removeTokens();
    userManager.removeUser();

    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    };
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);

    // حتى في حالة حدوث خطأ، نقوم بإنهاء الجلسة المحلية
    sessionManager.endSession();
    tokenManager.removeTokens();
    userManager.removeUser();

    return {
      success: true,
      message: 'تم تسجيل الخروج بنجاح رغم وجود أخطاء'
    };
  }
}

/**
 * تحديث الرمز المميز
 *
 * @returns {Promise<{success: boolean, token: string, refreshToken: string}>} الرمز المميز الجديد
 */
async function refreshToken() {
  try {
    const currentRefreshToken = tokenManager.getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error('لا يوجد رمز تحديث');
    }

    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken: currentRefreshToken
    });
    
    if (response.success) {
      tokenManager.setToken(response.token, response.refreshToken);
    }
    
    return response;
    */

    // محاكاة تحديث الرمز المميز
    const user = userManager.getUser();

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    const newToken = btoa(`${user.username}:${Date.now()}`);
    const newRefreshToken = btoa(`refresh:${user.username}:${Date.now()}`);

    tokenManager.setToken(newToken, newRefreshToken);

    return {
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    console.error('خطأ في تحديث الرمز المميز:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث الرمز المميز'
    };
  }
}

/**
 * تغيير كلمة المرور
 *
 * @param {PasswordChangeRequest} passwordData - بيانات تغيير كلمة المرور
 * @returns {Promise<{success: boolean, message: string}>} نتيجة تغيير كلمة المرور
 */
async function changePassword(passwordData) {
  try {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // التحقق من تطابق كلمة المرور الجديدة مع التأكيد
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
      };
    }

    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    return response;
    */

    // محاكاة تغيير كلمة المرور
    const user = userManager.getUser();

    if (!user) {
      return {
        success: false,
        message: 'المستخدم غير مسجل الدخول'
      };
    }

    // استيراد المستخدمين من ملف البيانات
    const usersModule = await import('../../data/users.json');
    const users = usersModule.default || [];

    // البحث عن المستخدم
    const userRecord = users.find(u => u.username === user.username);

    // التحقق من صحة كلمة المرور الحالية
    if (!userRecord || userRecord.password !== currentPassword) {
      return {
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      };
    }

    // في التطبيق الحقيقي، سنقوم بتحديث كلمة المرور في قاعدة البيانات
    // هنا نقوم فقط بمحاكاة نجاح العملية

    return {
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    };
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء تغيير كلمة المرور'
    };
  }
}

/**
 * إعادة تعيين كلمة المرور
 *
 * @param {PasswordResetRequest} resetData - بيانات إعادة تعيين كلمة المرور
 * @returns {Promise<{success: boolean, message: string}>} نتيجة إعادة تعيين كلمة المرور
 */
async function resetPassword(resetData) {
  try {
    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
    return response;
    */

    // محاكاة إعادة تعيين كلمة المرور
    const { email, token, newPassword } = resetData;

    // التحقق من وجود البريد الإلكتروني
    if (!email) {
      return {
        success: false,
        message: 'البريد الإلكتروني مطلوب'
      };
    }

    // إذا كان هناك رمز وكلمة مرور جديدة، فهذا يعني أننا في مرحلة إعادة التعيين
    if (token && newPassword) {
      // في التطبيق الحقيقي، سنتحقق من صحة الرمز ونقوم بتحديث كلمة المرور
      return {
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح'
      };
    }

    // إذا كان هناك بريد إلكتروني فقط، فهذا يعني أننا في مرحلة طلب إعادة التعيين
    return {
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
    };
  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
    };
  }
}

/**
 * التحقق من صحة الرمز المميز
 *
 * @returns {Promise<{valid: boolean, user: User|null}>} نتيجة التحقق
 */
async function verifyToken() {
  try {
    const token = tokenManager.getToken();

    if (!token) {
      return { valid: false, user: null };
    }

    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_TOKEN, { token });
    return {
      valid: response.success,
      user: response.user || null
    };
    */

    // محاكاة التحقق من صحة الرمز المميز
    const isValid = tokenManager.isTokenValid();
    const user = userManager.getUser();

    return {
      valid: isValid,
      user: isValid ? user : null
    };
  } catch (error) {
    console.error('خطأ في التحقق من صحة الرمز المميز:', error);
    return {
      valid: false,
      user: null
    };
  }
}

/**
 * الحصول على الملف الشخصي للمستخدم
 *
 * @returns {Promise<User|null>} بيانات المستخدم
 */
async function getUserProfile() {
  try {
    // في الوضع الحالي، نستخدم المحاكاة المحلية
    // عند الانتقال إلى API حقيقي، سنستخدم الكود التالي:

    /*
    const response = await apiClient.get(AUTH_ENDPOINTS.USER_PROFILE);
    return response.user || null;
    */

    // محاكاة الحصول على الملف الشخصي
    return userManager.getUser();
  } catch (error) {
    console.error('خطأ في الحصول على الملف الشخصي:', error);
    return null;
  }
}

export const authService = {
  login,
  logout,
  refreshToken,
  changePassword,
  resetPassword,
  verifyToken,
  getUserProfile
};

export default authService;
