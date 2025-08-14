/**
 * خدمة التخزين المؤقت
 *
 * توفر هذه الخدمة وظائف لتخزين البيانات مؤقتًا وإدارتها، مما يحسن الأداء ويقلل من طلبات الشبكة
 * ويوفر دعمًا للعمل دون اتصال بالإنترنت.
 */

import { storage } from '../../utils/storage';

// مفتاح التخزين المؤقت الرئيسي في localStorage
const CACHE_STORAGE_KEY = 'app_cache';

// الإعدادات الافتراضية للتخزين المؤقت
const DEFAULT_CACHE_OPTIONS = {
  // مدة صلاحية التخزين المؤقت بالمللي ثانية (ساعة واحدة افتراضيًا)
  ttl: 60 * 60 * 1000,
  // الحد الأقصى لحجم التخزين المؤقت بالبايت (5 ميجابايت افتراضيًا)
  maxSize: 5 * 1024 * 1024,
  // ما إذا كان يجب ضغط البيانات المخزنة مؤقتًا
  compress: true
};

/**
 * الحصول على حالة التخزين المؤقت الحالية
 *
 * @returns {Object} حالة التخزين المؤقت
 */
function getCacheState() {
  try {
    const cacheState = storage.get(CACHE_STORAGE_KEY) || {};
    return cacheState;
  } catch (error) {
    console.error('خطأ في الحصول على حالة التخزين المؤقت:', error);
    return {};
  }
}

/**
 * حفظ حالة التخزين المؤقت
 *
 * @param {Object} cacheState - حالة التخزين المؤقت
 */
function saveCacheState(cacheState) {
  try {
    storage.set(CACHE_STORAGE_KEY, cacheState);
  } catch (error) {
    console.error('خطأ في حفظ حالة التخزين المؤقت:', error);
  }
}

/**
 * ضغط البيانات لتقليل حجم التخزين
 *
 * @param {*} data - البيانات المراد ضغطها
 * @returns {string} البيانات المضغوطة
 */
function compressData(data) {
  try {
    const jsonString = JSON.stringify(data);
    // استخدام Base64 لتمثيل البيانات المضغوطة
    // في التطبيق الحقيقي، يمكن استخدام مكتبات ضغط أكثر كفاءة
    return btoa(jsonString);
  } catch (error) {
    console.error('خطأ في ضغط البيانات:', error);
    return JSON.stringify(data);
  }
}

/**
 * فك ضغط البيانات
 *
 * @param {string} compressedData - البيانات المضغوطة
 * @returns {*} البيانات الأصلية
 */
function decompressData(compressedData) {
  try {
    // فك ضغط البيانات المشفرة بـ Base64
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('خطأ في فك ضغط البيانات:', error);
    try {
      // محاولة تحليل البيانات كما هي في حالة عدم ضغطها
      return JSON.parse(compressedData);
    } catch {
      return compressedData;
    }
  }
}

/**
 * حساب حجم البيانات بالبايت
 *
 * @param {*} data - البيانات المراد حساب حجمها
 * @returns {number} حجم البيانات بالبايت
 */
function calculateDataSize(data) {
  try {
    const jsonString = JSON.stringify(data);
    // حساب حجم السلسلة النصية بالبايت (كل حرف يمثل 2 بايت في UTF-16)
    return jsonString.length * 2;
  } catch (error) {
    console.error('خطأ في حساب حجم البيانات:', error);
    return 0;
  }
}

/**
 * إنشاء مفتاح التخزين المؤقت
 *
 * @param {string} key - المفتاح الأساسي
 * @param {Object} [params={}] - المعلمات الإضافية
 * @returns {string} مفتاح التخزين المؤقت
 */
function createCacheKey(key, params = {}) {
  // إنشاء مفتاح فريد بناءً على المفتاح الأساسي والمعلمات
  const paramString = Object.keys(params).length > 0 ? `-${btoa(JSON.stringify(params))}` : '';

  return `${key}${paramString}`;
}

/**
 * تخزين البيانات في التخزين المؤقت
 *
 * @param {string} key - مفتاح التخزين المؤقت
 * @param {*} data - البيانات المراد تخزينها
 * @param {Object} [options={}] - خيارات التخزين المؤقت
 * @returns {boolean} نجاح العملية
 */
function setCache(key, data, options = {}) {
  try {
    const cacheOptions = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const cacheState = getCacheState();

    // حساب حجم البيانات
    const dataSize = calculateDataSize(data);

    // التحقق من حجم البيانات
    if (dataSize > cacheOptions.maxSize) {
      console.warn(`البيانات كبيرة جدًا للتخزين المؤقت: ${dataSize} بايت`);
      return false;
    }

    // تحضير البيانات للتخزين
    const cacheData = {
      data: cacheOptions.compress ? compressData(data) : data,
      timestamp: Date.now(),
      ttl: cacheOptions.ttl,
      size: dataSize,
      compressed: cacheOptions.compress
    };

    // تحديث حالة التخزين المؤقت
    cacheState[key] = cacheData;

    // حفظ حالة التخزين المؤقت
    saveCacheState(cacheState);

    return true;
  } catch (error) {
    console.error('خطأ في تخزين البيانات مؤقتًا:', error);
    return false;
  }
}

/**
 * الحصول على البيانات من التخزين المؤقت
 *
 * @param {string} key - مفتاح التخزين المؤقت
 * @returns {*|null} البيانات المخزنة أو null إذا لم تكن موجودة أو منتهية الصلاحية
 */
function getCache(key) {
  try {
    const cacheState = getCacheState();
    const cacheData = cacheState[key];

    // التحقق من وجود البيانات
    if (!cacheData) {
      return null;
    }

    // التحقق من صلاحية البيانات
    const now = Date.now();
    if (cacheData.timestamp + cacheData.ttl < now) {
      // البيانات منتهية الصلاحية، إزالتها من التخزين المؤقت
      removeCache(key);
      return null;
    }

    // إرجاع البيانات
    return cacheData.compressed ? decompressData(cacheData.data) : cacheData.data;
  } catch (error) {
    console.error('خطأ في الحصول على البيانات من التخزين المؤقت:', error);
    return null;
  }
}

/**
 * إزالة البيانات من التخزين المؤقت
 *
 * @param {string} key - مفتاح التخزين المؤقت
 * @returns {boolean} نجاح العملية
 */
function removeCache(key) {
  try {
    const cacheState = getCacheState();

    // التحقق من وجود المفتاح
    if (!cacheState[key]) {
      return false;
    }

    // إزالة المفتاح
    delete cacheState[key];

    // حفظ حالة التخزين المؤقت
    saveCacheState(cacheState);

    return true;
  } catch (error) {
    console.error('خطأ في إزالة البيانات من التخزين المؤقت:', error);
    return false;
  }
}

/**
 * مسح جميع البيانات من التخزين المؤقت
 *
 * @returns {boolean} نجاح العملية
 */
function clearCache() {
  try {
    saveCacheState({});
    return true;
  } catch (error) {
    console.error('خطأ في مسح التخزين المؤقت:', error);
    return false;
  }
}

/**
 * تنظيف التخزين المؤقت من البيانات منتهية الصلاحية
 *
 * @returns {number} عدد العناصر التي تمت إزالتها
 */
function cleanExpiredCache() {
  try {
    const cacheState = getCacheState();
    const now = Date.now();
    let removedCount = 0;

    // البحث عن العناصر منتهية الصلاحية
    Object.keys(cacheState).forEach(key => {
      const cacheData = cacheState[key];
      if (cacheData.timestamp + cacheData.ttl < now) {
        // إزالة العنصر منتهي الصلاحية
        delete cacheState[key];
        removedCount++;
      }
    });

    // حفظ حالة التخزين المؤقت إذا تمت إزالة أي عناصر
    if (removedCount > 0) {
      saveCacheState(cacheState);
    }

    return removedCount;
  } catch (error) {
    console.error('خطأ في تنظيف التخزين المؤقت:', error);
    return 0;
  }
}

/**
 * الحصول على إحصائيات التخزين المؤقت
 *
 * @returns {Object} إحصائيات التخزين المؤقت
 */
function getCacheStats() {
  try {
    const cacheState = getCacheState();
    const keys = Object.keys(cacheState);

    // حساب الحجم الإجمالي
    let totalSize = 0;
    keys.forEach(key => {
      totalSize += cacheState[key].size || 0;
    });

    return {
      count: keys.length,
      totalSize,
      keys
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات التخزين المؤقت:', error);
    return {
      count: 0,
      totalSize: 0,
      keys: []
    };
  }
}

/**
 * تحديث مدة صلاحية عنصر في التخزين المؤقت
 *
 * @param {string} key - مفتاح التخزين المؤقت
 * @param {number} ttl - مدة الصلاحية الجديدة بالمللي ثانية
 * @returns {boolean} نجاح العملية
 */
function updateCacheTTL(key, ttl) {
  try {
    const cacheState = getCacheState();

    // التحقق من وجود المفتاح
    if (!cacheState[key]) {
      return false;
    }

    // تحديث مدة الصلاحية
    cacheState[key].ttl = ttl;
    cacheState[key].timestamp = Date.now(); // إعادة تعيين الطابع الزمني

    // حفظ حالة التخزين المؤقت
    saveCacheState(cacheState);

    return true;
  } catch (error) {
    console.error('خطأ في تحديث مدة صلاحية التخزين المؤقت:', error);
    return false;
  }
}

/**
 * التحقق من وجود مفتاح في التخزين المؤقت وصلاحيته
 *
 * @param {string} key - مفتاح التخزين المؤقت
 * @returns {boolean} ما إذا كان المفتاح موجودًا وصالحًا
 */
function hasCacheValid(key) {
  try {
    const cacheState = getCacheState();
    const cacheData = cacheState[key];

    // التحقق من وجود البيانات
    if (!cacheData) {
      return false;
    }

    // التحقق من صلاحية البيانات
    const now = Date.now();
    return cacheData.timestamp + cacheData.ttl >= now;
  } catch (error) {
    console.error('خطأ في التحقق من صلاحية التخزين المؤقت:', error);
    return false;
  }
}

export const cacheService = {
  setCache,
  getCache,
  removeCache,
  clearCache,
  cleanExpiredCache,
  getCacheStats,
  updateCacheTTL,
  hasCacheValid,
  createCacheKey
};

export default cacheService;
