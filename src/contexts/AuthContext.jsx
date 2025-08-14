import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import socketService from '../services/socket';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        loginAttempts: state.loginAttempts + 1,
        lastLoginAttempt: new Date().toISOString()
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user }
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading
      };

    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        // In development, skip backend verification and go to login unless valid token exists
        const mode = (import.meta && import.meta.env && import.meta.env.MODE) || 'development';

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData && userData.token) {
            localStorage.setItem('token', userData.token);

            if (mode === 'production') {
              try {
                const response = await api.get('/auth/profile');
                if (response.success) {
                  dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { user: response.data, token: userData.token }
                  });
                  socketService.connect(userData.token);
                  return;
                }
              } catch (error) {
                console.error('Token verification failed:', error);
                localStorage.removeItem('authUser');
                localStorage.removeItem('token');
              }
            } else {
              // In dev, accept stored user without network verification
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user: userData, token: userData.token }
              });
              socketService.connect(userData.token);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: false } });
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async credentials => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await api.post('/auth/login', credentials);

      if (response.success) {
        const { user, tokens } = response.data;
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;

        // Store in localStorage (include refresh token)
        localStorage.setItem('authUser', JSON.stringify({ ...user, token: accessToken, refreshToken }));

        // Update state
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token: accessToken }
        });

        // Connect socket
        socketService.connect(accessToken);

        return { success: true, user };
      } else {
        throw new Error(response.message || 'فشل في تسجيل الدخول');
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async userData => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: true } });

    try {
      const response = await api.post('/auth/register', userData);

      if (response.success) {
        // Auto-login after successful registration
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });

        return loginResult;
      } else {
        throw new Error(response.message || 'فشل في إنشاء الحساب');
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء إنشاء الحساب';
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: { isLoading: false }
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('authUser');
      setToken(null);
      socketService.disconnect();

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update profile function
  const updateProfile = async profileData => {
    try {
      const response = await api.put('/auth/profile', profileData);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE,
          payload: { user: response.data }
        });

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        localStorage.setItem(
          'authUser',
          JSON.stringify({
            ...storedUser,
            ...response.data
          })
        );

        return { success: true, user: response.data };
      } else {
        throw new Error(response.message || 'فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
      return { success: false, error: errorMessage };
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');

      if (response.success) {
        const { tokens } = response.data;
        const token = tokens.accessToken;
        localStorage.setItem('token', token);

        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: { token }
        });

        // Update localStorage (token is already updated; ensure sync)
        const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        localStorage.setItem(
          'authUser',
          JSON.stringify({
            ...storedUser,
            token
          })
        );

        return { success: true, token };
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Force logout on refresh failure
      logout();
      return { success: false, error: error.message };
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles = []) => {
    if (!state.user || !requiredRoles.length) {
      return true;
    }

    const userRole = state.user.role;
    return requiredRoles.includes(userRole);
  };

  // Check if user has permission
  const hasPermission = permission => {
    if (!state.user) {
      return false;
    }

    const userPermissions = state.user.permissions || [];
    return userPermissions.includes(permission);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!state.user) {
      return '';
    }
    return state.user.full_name || state.user.name || state.user.email || 'مستخدم';
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    loginAttempts: state.loginAttempts,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshToken,

    // Utilities
    hasRole,
    hasPermission,
    getUserDisplayName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected components
export const withAuth = (Component, requiredRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasRole, isLoading } = useAuth();

    if (isLoading) {
      return <div className='flex justify-center items-center h-64'>جاري التحميل...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to='/login' replace />;
    }

    if (!hasRole(requiredRoles)) {
      return (
        <div className='flex justify-center items-center h-64 text-red-600'>ليس لديك صلاحية للوصول إلى هذه الصفحة</div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
};

// Permission constants
export const PERMISSIONS = {
  // Sales
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_EDIT: 'sales:edit',
  SALES_DELETE: 'sales:delete',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_EDIT: 'inventory:edit',
  INVENTORY_DELETE: 'inventory:delete',

  // Production
  PRODUCTION_VIEW: 'production:view',
  PRODUCTION_CREATE: 'production:create',
  PRODUCTION_EDIT: 'production:edit',
  PRODUCTION_DELETE: 'production:delete',

  // HR
  HR_VIEW: 'hr:view',
  HR_CREATE: 'hr:create',
  HR_EDIT: 'hr:edit',
  HR_DELETE: 'hr:delete',

  // Safety
  SAFETY_VIEW: 'safety:view',
  SAFETY_CREATE: 'safety:create',
  SAFETY_EDIT: 'safety:edit',
  SAFETY_DELETE: 'safety:delete',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  USER_MANAGEMENT: 'users:manage'
};
