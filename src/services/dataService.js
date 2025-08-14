import { STORAGE_KEYS, SYSTEM_CONFIG } from '../constants';
import { formatters } from '../utils';

/**
 * خدمة إدارة البيانات المحلية
 * توفر واجهة موحدة للتعامل مع localStorage مع ميزات متقدمة
 */
class DataService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.init();
  }

  /**
   * تهيئة الخدمة
   */
  init() {
    // تحقق من دعم localStorage
    if (!this.isStorageAvailable()) {
      console.warn('localStorage غير متاح، سيتم استخدام الذاكرة المؤقتة فقط');
    }

    // تنظيف البيانات المنتهية الصلاحية
    this.cleanExpiredData();

    // إعداد مستمع تغييرات التخزين
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  /**
   * تحقق من توفر localStorage
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * حفظ البيانات
   */
  save(key, data, options = {}) {
    try {
      const { encrypt = false, compress = false, expiry = null, version = '1.0' } = options;

      const item = {
        data,
        timestamp: Date.now(),
        version,
        expiry: expiry ? Date.now() + expiry : null
      };

      let serializedData = JSON.stringify(item);

      // ضغط البيانات إذا كانت كبيرة
      if (compress && serializedData.length > 1000) {
        serializedData = this.compress(serializedData);
        item.compressed = true;
      }

      // تشفير البيانات
      if (encrypt) {
        serializedData = this.encrypt(serializedData);
        item.encrypted = true;
      }

      // حفظ في localStorage
      if (this.isStorageAvailable()) {
        localStorage.setItem(key, serializedData);
      }

      // حفظ في الكاش
      this.cache.set(key, item);

      // إشعار المستمعين
      this.notifyListeners(key, 'save', data);

      return true;
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      return false;
    }
  }

  /**
   * استرجاع البيانات
   */
  load(key, defaultValue = null) {
    try {
      // البحث في الكاش أولاً
      if (this.cache.has(key)) {
        const item = this.cache.get(key);
        if (!this.isExpired(item)) {
          return item.data;
        } else {
          this.remove(key);
        }
      }

      // البحث في localStorage
      if (this.isStorageAvailable()) {
        const stored = localStorage.getItem(key);
        if (stored) {
          let item = JSON.parse(stored);

          // فك التشفير
          if (item.encrypted) {
            item = JSON.parse(this.decrypt(stored));
          }

          // فك الضغط
          if (item.compressed) {
            item = JSON.parse(this.decompress(stored));
          }

          // تحقق من انتهاء الصلاحية
          if (this.isExpired(item)) {
            this.remove(key);
            return defaultValue;
          }

          // حفظ في الكاش
          this.cache.set(key, item);
          return item.data;
        }
      }

      return defaultValue;
    } catch (error) {
      console.error('خطأ في استرجاع البيانات:', error);
      return defaultValue;
    }
  }

  /**
   * حذف البيانات
   */
  remove(key) {
    try {
      // حذف من localStorage
      if (this.isStorageAvailable()) {
        localStorage.removeItem(key);
      }

      // حذف من الكاش
      this.cache.delete(key);

      // إشعار المستمعين
      this.notifyListeners(key, 'remove', null);

      return true;
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      return false;
    }
  }

  /**
   * مسح جميع البيانات
   */
  clear() {
    try {
      if (this.isStorageAvailable()) {
        localStorage.clear();
      }
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('خطأ في مسح البيانات:', error);
      return false;
    }
  }

  /**
   * تحديث البيانات
   */
  update(key, updater, options = {}) {
    const currentData = this.load(key, {});
    const newData = typeof updater === 'function' ? updater(currentData) : { ...currentData, ...updater };

    return this.save(key, newData, options);
  }

  /**
   * البحث في البيانات
   */
  search(key, query, searchFields = []) {
    const data = this.load(key, []);
    if (!Array.isArray(data)) {
      return [];
    }

    if (!query) {
      return data;
    }

    const searchTerm = query.toLowerCase();

    return data.filter(item => {
      if (searchFields.length === 0) {
        // البحث في جميع الحقول
        return Object.values(item).some(value => String(value).toLowerCase().includes(searchTerm));
      } else {
        // البحث في حقول محددة
        return searchFields.some(field =>
          String(item[field] || '')
            .toLowerCase()
            .includes(searchTerm)
        );
      }
    });
  }

  /**
   * فلترة البيانات
   */
  filter(key, filters = {}) {
    const data = this.load(key, []);
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(item => {
      return Object.entries(filters).every(([field, value]) => {
        if (!value) {
          return true;
        }

        const itemValue = item[field];

        // فلترة التاريخ
        if (field.includes('_from') || field.includes('_to')) {
          const dateField = field.replace('_from', '').replace('_to', '');
          const itemDate = new Date(item[dateField]);
          const filterDate = new Date(value);

          if (field.includes('_from')) {
            return itemDate >= filterDate;
          } else {
            return itemDate <= filterDate;
          }
        }

        // فلترة النص
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }

        // فلترة دقيقة
        return itemValue === value;
      });
    });
  }

  /**
   * ترتيب البيانات
   */
  sort(key, sortField, sortDirection = 'asc') {
    const data = this.load(key, []);
    if (!Array.isArray(data)) {
      return [];
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // ترتيب التواريخ
      if (aValue instanceof Date || bValue instanceof Date) {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }

      // ترتيب الأرقام
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // ترتيب النصوص
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'ar');
      } else {
        return bStr.localeCompare(aStr, 'ar');
      }
    });
  }

  /**
   * إضافة عنصر جديد
   */
  add(key, item, options = {}) {
    const data = this.load(key, []);

    // إنشاء ID تلقائي
    if (!item.id) {
      item.id = this.generateId();
    }

    // إضافة timestamp
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    const newData = [...data, item];
    return this.save(key, newData, options) ? item : null;
  }

  /**
   * تحديث عنصر
   */
  updateItem(key, id, updates, options = {}) {
    const data = this.load(key, []);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const newData = [...data];
    newData[index] = updatedItem;

    return this.save(key, newData, options) ? updatedItem : null;
  }

  /**
   * حذف عنصر
   */
  removeItem(key, id, options = {}) {
    const data = this.load(key, []);
    const newData = data.filter(item => item.id !== id);

    return this.save(key, newData, options);
  }

  /**
   * البحث عن عنصر
   */
  findItem(key, id) {
    const data = this.load(key, []);
    return data.find(item => item.id === id) || null;
  }

  /**
   * إنشاء ID فريد
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * تحقق من انتهاء الصلاحية
   */
  isExpired(item) {
    return item.expiry && Date.now() > item.expiry;
  }

  /**
   * تنظيف البيانات المنتهية الصلاحية
   */
  cleanExpiredData() {
    if (!this.isStorageAvailable()) {
      return;
    }

    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && this.isExpired(item)) {
          keysToRemove.push(key);
        }
      } catch (e) {
        // تجاهل الأخطاء
      }
    }

    keysToRemove.forEach(key => this.remove(key));
  }

  /**
   * إضافة مستمع للتغييرات
   */
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  /**
   * إزالة مستمع
   */
  removeListener(key, callback) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).delete(callback);
    }
  }

  /**
   * إشعار المستمعين
   */
  notifyListeners(key, action, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback({ key, action, data });
        } catch (error) {
          console.error('خطأ في مستمع البيانات:', error);
        }
      });
    }
  }

  /**
   * معالج تغييرات التخزين
   */
  handleStorageChange(event) {
    if (event.key && this.cache.has(event.key)) {
      this.cache.delete(event.key);
      this.notifyListeners(event.key, 'external_change', event.newValue);
    }
  }

  /**
   * تصدير البيانات
   */
  export(keys = null) {
    const exportData = {};
    const keysToExport = keys || Object.values(STORAGE_KEYS);

    keysToExport.forEach(key => {
      const data = this.load(key);
      if (data !== null) {
        exportData[key] = data;
      }
    });

    return {
      data: exportData,
      timestamp: new Date().toISOString(),
      version: SYSTEM_CONFIG.VERSION || '1.0'
    };
  }

  /**
   * استيراد البيانات
   */
  import(exportedData, options = {}) {
    const { overwrite = false, validate = true } = options;

    try {
      if (validate && !this.validateImportData(exportedData)) {
        throw new Error('بيانات الاستيراد غير صحيحة');
      }

      Object.entries(exportedData.data || {}).forEach(([key, data]) => {
        if (overwrite || !this.load(key)) {
          this.save(key, data);
        }
      });

      return true;
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      return false;
    }
  }

  /**
   * التحقق من صحة بيانات الاستيراد
   */
  validateImportData(data) {
    return data && typeof data === 'object' && data.data && typeof data.data === 'object';
  }

  /**
   * ضغط البيانات (تنفيذ بسيط)
   */
  compress(data) {
    // يمكن تحسين هذا باستخدام مكتبة ضغط حقيقية
    return data;
  }

  /**
   * فك ضغط البيانات
   */
  decompress(data) {
    return data;
  }

  /**
   * تشفير البيانات (تنفيذ بسيط)
   */
  encrypt(data) {
    // يمكن تحسين هذا باستخدام تشفير حقيقي
    return btoa(data);
  }

  /**
   * فك تشفير البيانات
   */
  decrypt(data) {
    return atob(data);
  }

  /**
   * الحصول على إحصائيات التخزين
   */
  getStorageStats() {
    if (!this.isStorageAvailable()) {
      return { available: false };
    }

    let totalSize = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + value.length;
      itemCount++;
    }

    return {
      available: true,
      totalSize: formatters.fileSize(totalSize * 2), // تقريبي (UTF-16)
      itemCount,
      cacheSize: this.cache.size
    };
  }
}

// إنشاء مثيل واحد للخدمة
const dataService = new DataService();

export default dataService;
