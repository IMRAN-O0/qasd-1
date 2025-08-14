/**
 * عميل HTTP أساسي للتعامل مع طلبات API
 *
 * يوفر هذا الملف طبقة تجريد فوق طلبات الشبكة ويدعم:
 * - إدارة الرموز المميزة (tokens)
 * - التعامل مع الأخطاء بشكل موحد
 * - تخزين مؤقت للطلبات
 * - دعم وضع عدم الاتصال
 */

import { tokenManager } from '../../utils/auth';
import { storage } from '../../utils/storage';

// الإعدادات الافتراضية
const DEFAULT_CONFIG = {
  baseURL: process.env.API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
};

// مفتاح التخزين المؤقت
const CACHE_KEY_PREFIX = 'api_cache_';

/**
 * تنفيذ طلب HTTP مع دعم التخزين المؤقت ووضع عدم الاتصال
 *
 * @param {Object} options - خيارات الطلب
 * @param {string} options.url - مسار الطلب
 * @param {string} options.method - طريقة الطلب (GET, POST, PUT, DELETE)
 * @param {Object} [options.data] - بيانات الطلب
 * @param {Object} [options.params] - معلمات الاستعلام
 * @param {Object} [options.headers] - رؤوس الطلب الإضافية
 * @param {boolean} [options.useCache=false] - استخدام التخزين المؤقت للطلبات
 * @param {number} [options.cacheTTL=5] - مدة صلاحية التخزين المؤقت بالدقائق
 * @param {boolean} [options.offlineSupport=false] - دعم وضع عدم الاتصال
 * @returns {Promise<any>} استجابة الطلب
 */
async function request(options) {
  const {
    url,
    method = 'GET',
    data = null,
    params = null,
    headers = {},
    useCache = false,
    cacheTTL = 5,
    offlineSupport = false
  } = options;

  // إنشاء مفتاح التخزين المؤقت
  const cacheKey = `${CACHE_KEY_PREFIX}${method}_${url}_${JSON.stringify(params)}`;

  // التحقق من التخزين المؤقت للطلبات GET
  if (method === 'GET' && useCache) {
    const cachedData = storage.getWithExpiry(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // إضافة رمز المصادقة إذا كان متاحًا
  const token = tokenManager.getToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // تجميع الرؤوس
  const requestHeaders = {
    ...DEFAULT_CONFIG.headers,
    ...authHeaders,
    ...headers
  };

  // بناء URL كامل
  let fullUrl = `${DEFAULT_CONFIG.baseURL}${url}`;

  // إضافة معلمات الاستعلام إذا كانت موجودة
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    fullUrl += `?${queryParams.toString()}`;
  }

  try {
    // التحقق من الاتصال بالإنترنت
    const isOnline = navigator.onLine;

    if (!isOnline) {
      if (offlineSupport && method === 'GET') {
        // محاولة استرداد البيانات المخزنة مؤقتًا حتى لو انتهت صلاحيتها
        const expiredCache = storage.get(cacheKey);
        if (expiredCache) {
          console.warn(`استخدام بيانات مخزنة منتهية الصلاحية لـ: ${url}`);
          return {
            ...expiredCache,
            _fromOfflineCache: true
          };
        }
      }

      throw new Error('أنت غير متصل بالإنترنت');
    }

    // إعداد خيارات الطلب
    const fetchOptions = {
      method,
      headers: requestHeaders,
      timeout: DEFAULT_CONFIG.timeout
    };

    // إضافة الجسم للطلبات غير GET
    if (method !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    // تنفيذ الطلب
    const response = await fetch(fullUrl, fetchOptions);

    // التحقق من حالة الاستجابة
    if (!response.ok) {
      // التعامل مع أخطاء المصادقة
      if (response.status === 401) {
        // محاولة تحديث الرمز المميز
        try {
          const newToken = await tokenManager.refreshToken();
          if (newToken) {
            // إعادة المحاولة مع الرمز الجديد
            return request(options);
          }
        } catch (refreshError) {
          console.error('فشل تحديث الرمز المميز:', refreshError);
          // تسجيل الخروج عند فشل تحديث الرمز
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }

      // استخراج رسالة الخطأ من الاستجابة
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `خطأ: ${response.status}`;
      } catch (e) {
        errorMessage = `خطأ: ${response.status} ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    // تحويل الاستجابة إلى JSON
    const responseData = await response.json();

    // تخزين الاستجابة مؤقتًا للطلبات GET
    if (method === 'GET' && useCache) {
      storage.setWithExpiry(cacheKey, responseData, cacheTTL);
    }

    return responseData;
  } catch (error) {
    // تسجيل الخطأ
    console.error(`خطأ في طلب API: ${fullUrl}`, error);

    // إعادة إلقاء الخطأ ليتم التعامل معه في المستدعي
    throw error;
  }
}

/**
 * طلب GET
 * @param {string} url - مسار الطلب
 * @param {Object} [params] - معلمات الاستعلام
 * @param {Object} [options] - خيارات إضافية
 * @returns {Promise<any>} استجابة الطلب
 */
function get(url, params = null, options = {}) {
  return request({ url, method: 'GET', params, ...options });
}

/**
 * طلب POST
 * @param {string} url - مسار الطلب
 * @param {Object} data - بيانات الطلب
 * @param {Object} [options] - خيارات إضافية
 * @returns {Promise<any>} استجابة الطلب
 */
function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options });
}

/**
 * طلب PUT
 * @param {string} url - مسار الطلب
 * @param {Object} data - بيانات الطلب
 * @param {Object} [options] - خيارات إضافية
 * @returns {Promise<any>} استجابة الطلب
 */
function put(url, data, options = {}) {
  return request({ url, method: 'PUT', data, ...options });
}

/**
 * طلب DELETE
 * @param {string} url - مسار الطلب
 * @param {Object} [options] - خيارات إضافية
 * @returns {Promise<any>} استجابة الطلب
 */
function del(url, options = {}) {
  return request({ url, method: 'DELETE', ...options });
}

/**
 * مسح التخزين المؤقت للطلبات
 * @param {string} [urlPattern] - نمط URL لمسح التخزين المؤقت المحدد
 */
function clearCache(urlPattern) {
  const keys = storage.getKeys();
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

  if (urlPattern) {
    const matchingKeys = cacheKeys.filter(key => key.includes(urlPattern));
    storage.removeBatch(matchingKeys);
  } else {
    storage.removeBatch(cacheKeys);
  }
}

/**
 * تحديد ما إذا كان التطبيق في وضع عدم الاتصال
 * @returns {boolean} حالة الاتصال
 */
function isOffline() {
  return !navigator.onLine;
}

/**
 * إضافة مستمع لتغييرات حالة الاتصال
 * @param {Function} callback - دالة رد الاتصال
 * @returns {Function} دالة لإزالة المستمع
 */
function addConnectivityListener(callback) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export const apiClient = {
  request,
  get,
  post,
  put,
  delete: del,
  clearCache,
  isOffline,
  addConnectivityListener
};

export default apiClient;
