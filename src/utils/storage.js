export const storage = {
  // Basic localStorage operations
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },

  remove: key => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Get all keys from localStorage
  getKeys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys', error);
      return [];
    }
  },

  // Get localStorage size in bytes
  getSize: () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating localStorage size', error);
      return 0;
    }
  },

  // Advanced operations
  getWithExpiry: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return defaultValue;
      }

      const data = JSON.parse(item);

      // Check if item has expiry
      if (data.expiry && new Date().getTime() > data.expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }

      return data.value !== undefined ? data.value : data;
    } catch (error) {
      console.error(`Error reading from localStorage with expiry: ${key}`, error);
      return defaultValue;
    }
  },

  setWithExpiry: (key, value, ttlMinutes = 60) => {
    try {
      const expiry = new Date().getTime() + ttlMinutes * 60 * 1000;
      const data = {
        value: value,
        expiry: expiry
      };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage with expiry: ${key}`, error);
      return false;
    }
  },

  // Batch operations
  getBatch: (keys, defaultValue = null) => {
    const result = {};
    keys.forEach(key => {
      result[key] = storage.get(key, defaultValue);
    });
    return result;
  },

  setBatch: data => {
    let success = true;
    Object.entries(data).forEach(([key, value]) => {
      if (!storage.set(key, value)) {
        success = false;
      }
    });
    return success;
  },

  removeBatch: keys => {
    let success = true;
    keys.forEach(key => {
      if (!storage.remove(key)) {
        success = false;
      }
    });
    return success;
  },

  // Backup and restore
  backup: () => {
    try {
      const backup = {};
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          backup[key] = localStorage[key];
        }
      }
      return backup;
    } catch (error) {
      console.error('Error creating localStorage backup', error);
      return null;
    }
  },

  restore: backup => {
    try {
      storage.clear();
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error restoring localStorage backup', error);
      return false;
    }
  },

  // Export and import
  exportData: () => {
    const data = storage.backup();
    if (!data) {
      return null;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `localStorage_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  },

  importData: file => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();

      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          const success = storage.restore(data);
          resolve(success);
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  },

  // Search functionality
  search: (query, keys = null) => {
    try {
      const results = {};
      const searchKeys = keys || storage.getKeys();

      searchKeys.forEach(key => {
        const value = storage.get(key);
        if (value && typeof value === 'object') {
          const valueString = JSON.stringify(value).toLowerCase();
          if (valueString.includes(query.toLowerCase())) {
            results[key] = value;
          }
        } else if (value && value.toString().toLowerCase().includes(query.toLowerCase())) {
          results[key] = value;
        }
      });

      return results;
    } catch (error) {
      console.error('Error searching localStorage', error);
      return {};
    }
  },

  // Cleanup expired items
  cleanup: () => {
    try {
      let removedCount = 0;
      const keys = storage.getKeys();

      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.expiry && new Date().getTime() > data.expiry) {
              localStorage.removeItem(key);
              removedCount++;
            }
          }
        } catch {
          // Skip malformed items
        }
      });

      return removedCount;
    } catch (error) {
      console.error('Error cleaning up localStorage', error);
      return 0;
    }
  }
};

// Session storage wrapper with same interface
export const sessionStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${key}`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage: ${key}`, error);
      return false;
    }
  },

  remove: key => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage: ${key}`, error);
      return false;
    }
  },

  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
      return false;
    }
  }
};

// Application-specific storage helpers
export const appStorage = {
  // User preferences
  getUserPreferences: () => storage.get('userPreferences', {}),
  setUserPreferences: preferences => storage.set('userPreferences', preferences),

  // App settings
  getAppSettings: () => storage.get('appSettings', {}),
  setAppSettings: settings => storage.set('appSettings', settings),

  // Recent items
  getRecentItems: type => storage.get(`recent_${type}`, []),
  addRecentItem: (type, item, maxItems = 10) => {
    const recent = appStorage.getRecentItems(type);
    const filtered = recent.filter(i => i.id !== item.id);
    filtered.unshift(item);
    storage.set(`recent_${type}`, filtered.slice(0, maxItems));
  },

  // Form drafts
  saveDraft: (formId, data) => {
    storage.setWithExpiry(`draft_${formId}`, data, 60); // 1 hour expiry
  },
  getDraft: formId => storage.getWithExpiry(`draft_${formId}`),
  removeDraft: formId => storage.remove(`draft_${formId}`),

  // Cache management
  setCache: (key, data, ttlMinutes = 30) => {
    storage.setWithExpiry(`cache_${key}`, data, ttlMinutes);
  },
  getCache: key => storage.getWithExpiry(`cache_${key}`),
  clearCache: () => {
    const keys = storage.getKeys().filter(key => key.startsWith('cache_'));
    storage.removeBatch(keys);
  }
};

export default storage;
