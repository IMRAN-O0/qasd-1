// الهوكس الأساسية
export { default as useLocalStorage } from './useLocalStorage';
export { default as useForm } from './useForm';

// الهوكس الجديدة
export { default as useAuth } from './useAuth';
export { default as useNotifications } from './useNotifications';
export { usePermissions } from '../utils/permissions';

// استيراد الهوكس للتصدير الافتراضي
import useLocalStorage from './useLocalStorage';
import useForm from './useForm';
import useAuth from './useAuth';
import useNotifications from './useNotifications';
import { usePermissions } from '../utils/permissions';

// تصدير جميع الهوكس كـ default
export default {
  useLocalStorage,
  useForm,
  useAuth,
  useNotifications,
  usePermissions
};
