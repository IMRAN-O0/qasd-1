import { useState, useEffect, useCallback } from 'react';
import { sessionManager, userManager, tokenManager, authHelpers } from '../utils/auth';
import { permissionManager } from '../utils/permissions';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);

  // تحديث حالة المصادقة
  const updateAuthState = useCallback(() => {
    const currentUser = userManager.getUser();
    const isSessionValid = sessionManager.isSessionValid();

    if (currentUser && isSessionValid) {
      setUser(currentUser);
      setIsAuthenticated(true);
      setPermissions(permissionManager.getUserPermissions(currentUser));
      setRoles(currentUser.roles || []);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setPermissions([]);
      setRoles([]);
    }
    setIsLoading(false);
  }, []);

  // التحقق من الجلسة عند تحميل المكون
  useEffect(() => {
    // التحقق من تسجيل الدخول التلقائي
    if (authHelpers.checkAutoLogin()) {
      updateAuthState();
    } else {
      setIsLoading(false);
    }

    // تنظيف البيانات المنتهية الصلاحية
    authHelpers.cleanupExpiredData();
  }, [updateAuthState]);

  // تسجيل الدخول
  const login = useCallback(
    async credentials => {
      setIsLoading(true);

      try {
        const { username, password, rememberMe = false } = credentials;

        // التحقق من محاولات تسجيل الدخول المتكررة
        if (authHelpers.checkBruteForce(username)) {
          throw new Error('تم تجاوز عدد محاولات تسجيل الدخول المسموحة. يرجى المحاولة لاحقاً.');
        }

        // محاكاة استدعاء API للمصادقة
        const loginResult = await mockLogin(username, password);

        if (loginResult.success) {
          const { user: userData, token, refreshToken } = loginResult;

          // بدء الجلسة
          sessionManager.startSession(userData, token, { rememberMe, refreshToken });

          // تحديث الحالة
          updateAuthState();

          return { success: true, user: userData };
        } else {
          // تسجيل محاولة تسجيل دخول فاشلة
          authHelpers.logFailedLogin(username);
          throw new Error(loginResult.message || 'خطأ في بيانات تسجيل الدخول');
        }
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    [updateAuthState]
  );

  // تسجيل الخروج
  const logout = useCallback(() => {
    sessionManager.endSession();
    updateAuthState();
  }, [updateAuthState]);

  // تحديث بيانات المستخدم
  const updateUser = useCallback(updates => {
    const updatedUser = userManager.updateUser(updates);
    if (updatedUser) {
      setUser(updatedUser);
      setPermissions(permissionManager.getUserPermissions(updatedUser));
      setRoles(updatedUser.roles || []);
    }
    return updatedUser;
  }, []);

  // التحقق من الصلاحيات
  const hasPermission = useCallback(
    permission => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    permissionList => {
      return permissionList.some(permission => permissions.includes(permission));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    permissionList => {
      return permissionList.every(permission => permissions.includes(permission));
    },
    [permissions]
  );

  const hasRole = useCallback(
    role => {
      return roles.includes(role);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    roleList => {
      return roleList.some(role => roles.includes(role));
    },
    [roles]
  );

  // تمديد الجلسة
  const extendSession = useCallback(() => {
    return sessionManager.extendSession();
  }, []);

  // الحصول على معلومات الجلسة
  const getSessionInfo = useCallback(() => {
    return sessionManager.getSessionInfo();
  }, []);

  // تغيير كلمة المرور
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // محاكاة استدعاء API لتغيير كلمة المرور
      const result = await mockChangePassword(user.id, currentPassword, newPassword);

      if (result.success) {
        return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
      } else {
        throw new Error(result.message || 'فشل في تغيير كلمة المرور');
      }
    },
    [user]
  );

  // إعادة تعيين كلمة المرور
  const resetPassword = useCallback(async email => {
    // محاكاة استدعاء API لإعادة تعيين كلمة المرور
    const result = await mockResetPassword(email);

    if (result.success) {
      return { success: true, message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
    } else {
      throw new Error(result.message || 'فشل في إرسال رابط إعادة التعيين');
    }
  }, []);

  // تحديث الرمز المميز
  const refreshToken = useCallback(async () => {
    try {
      const newToken = await tokenManager.refreshToken();
      tokenManager.setToken(newToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }, [logout]);

  return {
    // الحالة
    user,
    isAuthenticated,
    isLoading,
    permissions,
    roles,

    // الإجراءات
    login,
    logout,
    updateUser,
    changePassword,
    resetPassword,
    extendSession,
    refreshToken,

    // دوال التحقق
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,

    // معلومات الجلسة
    getSessionInfo
  };
};

// دوال محاكاة للـ API (يجب استبدالها باستدعاءات API حقيقية)
const mockLogin = async (username, password) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // قاعدة بيانات مستخدمين وهمية
      const users = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'المدير العام',
          email: 'admin@company.com',
          roles: ['super_admin'],
          avatar: null,
          department: 'الإدارة',
          phone: '0501234567'
        },
        {
          id: '2',
          username: 'manager',
          password: 'manager123',
          name: 'مدير المبيعات',
          email: 'manager@company.com',
          roles: ['manager'],
          avatar: null,
          department: 'المبيعات',
          phone: '0502345678'
        },
        {
          id: '3',
          username: 'employee',
          password: 'employee123',
          name: 'موظف المستودع',
          email: 'employee@company.com',
          roles: ['employee'],
          avatar: null,
          department: 'المستودع',
          phone: '0503456789'
        }
      ];

      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        resolve({
          success: true,
          user: userWithoutPassword,
          token: authHelpers.generateMockToken(user.id),
          refreshToken: authHelpers.generateMockToken(user.id + '_refresh')
        });
      } else {
        resolve({
          success: false,
          message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
      }
    }, 1000); // محاكاة تأخير الشبكة
  });
};

const mockChangePassword = async (userId, currentPassword, newPassword) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // في التطبيق الحقيقي، يجب التحقق من كلمة المرور الحالية
      if (currentPassword.length < 6 || newPassword.length < 6) {
        resolve({
          success: false,
          message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        });
      } else {
        resolve({
          success: true,
          message: 'تم تغيير كلمة المرور بنجاح'
        });
      }
    }, 500);
  });
};

const mockResetPassword = async email => {
  return new Promise(resolve => {
    setTimeout(() => {
      // محاكاة التحقق من وجود البريد الإلكتروني
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        resolve({
          success: false,
          message: 'البريد الإلكتروني غير صحيح'
        });
      } else {
        resolve({
          success: true,
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور'
        });
      }
    }, 1000);
  });
};

export default useAuth;
