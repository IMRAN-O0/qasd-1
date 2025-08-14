/**
 * تصدير خدمات التطبيق
 *
 * هذا الملف يجمع ويصدر جميع خدمات التطبيق من مختلف المجلدات الفرعية،
 * مما يسهل استيرادها في أجزاء أخرى من التطبيق.
 */

// خدمات API
import authService from './api/auth';

// خدمات التخزين
import cacheService from './storage/cache';
import syncService from './storage/sync';

// تصدير جميع الخدمات
export {
  // خدمات API
  authService,

  // خدمات التخزين
  cacheService,
  syncService
};

// Services
export { default as dataService } from './dataService';
export {
  useAppStore,
  useSalesStore,
  useInventoryStore,
  useProductionStore,
  useQualityStore,
  useSafetyStore
} from './stateService';

// تصدير كائن يحتوي على جميع الخدمات
const services = {
  auth: authService,
  cache: cacheService,
  sync: syncService,
  data: dataService,
  stores: {
    app: useAppStore,
    sales: useSalesStore,
    inventory: useInventoryStore,
    production: useProductionStore,
    quality: useQualityStore,
    safety: useSafetyStore
  }
};

export default services;
