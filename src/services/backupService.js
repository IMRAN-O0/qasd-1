// Backup Service - Automated encrypted backups with retention policies
import CryptoJS from 'crypto-js';

class BackupService {
  constructor() {
    this.backupConfig = {
      retention: {
        daily: 7, // Keep 7 daily backups
        weekly: 4, // Keep 4 weekly backups
        monthly: 12, // Keep 12 monthly backups
        yearly: 5 // Keep 5 yearly backups
      },
      encryption: {
        algorithm: 'AES',
        keySize: 256,
        iterations: 10000
      },
      compression: true,
      maxBackupSize: 100 * 1024 * 1024, // 100MB
      autoBackup: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000, // 24 hours
        lastBackup: null
      }
    };

    this.backupQueue = [];
    this.isBackupInProgress = false;
    this.backupHistory = [];

    this.initializeBackupSystem();
  }

  // Initialize backup system
  initializeBackupSystem() {
    // Load backup history from localStorage
    this.loadBackupHistory();

    // Setup automatic backup
    this.setupAutomaticBackup();

    // Setup storage quota monitoring
    this.monitorStorageQuota();

    // Setup backup verification
    this.setupBackupVerification();
  }

  // Setup automatic backup
  setupAutomaticBackup() {
    if (!this.backupConfig.autoBackup.enabled) {
      return;
    }

    const checkBackup = () => {
      const now = Date.now();
      const lastBackup = this.backupConfig.autoBackup.lastBackup;

      if (!lastBackup || now - lastBackup >= this.backupConfig.autoBackup.interval) {
        this.performAutomaticBackup();
      }
    };

    // Check immediately
    checkBackup();

    // Setup interval
    setInterval(checkBackup, 60 * 60 * 1000); // Check every hour
  }

  // Perform automatic backup
  async performAutomaticBackup() {
    try {
      console.log('Starting automatic backup...');

      const backupData = await this.collectBackupData();
      const backupId = await this.createBackup(backupData, 'automatic');

      this.backupConfig.autoBackup.lastBackup = Date.now();
      this.saveBackupConfig();

      console.log('Automatic backup completed:', backupId);

      // Cleanup old backups
      await this.cleanupOldBackups();
    } catch (error) {
      console.error('Automatic backup failed:', error);
      this.logBackupError('automatic_backup_failed', error);
    }
  }

  // Collect data for backup
  async collectBackupData() {
    const data = {
      timestamp: Date.now(),
      version: '1.0.0',
      data: {}
    };

    try {
      // Collect localStorage data
      data.data.localStorage = this.collectLocalStorageData();

      // Collect IndexedDB data
      data.data.indexedDB = await this.collectIndexedDBData();

      // Collect user preferences
      data.data.preferences = this.collectUserPreferences();

      // Collect application state
      data.data.appState = this.collectApplicationState();

      // Collect cache data (selective)
      data.data.cache = this.collectCacheData();
    } catch (error) {
      console.error('Error collecting backup data:', error);
      throw error;
    }

    return data;
  }

  // Collect localStorage data
  collectLocalStorageData() {
    const data = {};

    // Only backup specific keys (exclude sensitive data)
    const allowedKeys = [
      'user_preferences',
      'dashboard_layout',
      'table_settings',
      'theme_settings',
      'language_settings',
      'notification_settings'
    ];

    allowedKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (error) {
          data[key] = value;
        }
      }
    });

    return data;
  }

  // Collect IndexedDB data
  async collectIndexedDBData() {
    const data = {};

    try {
      // This would be implemented based on your IndexedDB structure
      // Example for common stores
      const stores = ['documents', 'reports', 'offline_queue', 'user_data'];

      for (const storeName of stores) {
        try {
          data[storeName] = await this.getIndexedDBStore(storeName);
        } catch (error) {
          console.warn(`Failed to backup IndexedDB store ${storeName}:`, error);
        }
      }
    } catch (error) {
      console.error('Error collecting IndexedDB data:', error);
    }

    return data;
  }

  // Get IndexedDB store data
  async getIndexedDBStore(storeName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDDatabase', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(storeName)) {
          resolve([]);
          return;
        }

        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
      };
    });
  }

  // Collect user preferences
  collectUserPreferences() {
    return {
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('language') || 'ar',
      notifications: JSON.parse(localStorage.getItem('notification_settings') || '{}'),
      dashboard: JSON.parse(localStorage.getItem('dashboard_layout') || '{}'),
      tables: JSON.parse(localStorage.getItem('table_settings') || '{}')
    };
  }

  // Collect application state
  collectApplicationState() {
    return {
      currentRoute: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  // Collect cache data (selective)
  collectCacheData() {
    // Only backup essential cache data
    return {
      apiCache: this.getEssentialApiCache(),
      imageCache: this.getEssentialImageCache()
    };
  }

  // Get essential API cache
  getEssentialApiCache() {
    const essential = {};

    // Only cache user-specific data that's expensive to reload
    const essentialKeys = ['/api/user/preferences', '/api/dashboard/layout', '/api/user/settings'];

    // This would access your actual cache service
    // For now, return empty object
    return essential;
  }

  // Get essential image cache
  getEssentialImageCache() {
    // Only backup user-uploaded images or important assets
    return {};
  }

  // Create backup
  async createBackup(data, type = 'manual', description = '') {
    if (this.isBackupInProgress) {
      throw new Error('Backup already in progress');
    }

    this.isBackupInProgress = true;

    try {
      const backupId = this.generateBackupId();
      const timestamp = Date.now();

      // Compress data if enabled
      let processedData = data;
      if (this.backupConfig.compression) {
        processedData = await this.compressData(data);
      }

      // Encrypt data
      const encryptedData = await this.encryptData(processedData);

      // Check size limit
      const dataSize = new Blob([encryptedData]).size;
      if (dataSize > this.backupConfig.maxBackupSize) {
        throw new Error(
          `Backup size (${Math.round(dataSize / 1024 / 1024)}MB) exceeds limit (${Math.round(this.backupConfig.maxBackupSize / 1024 / 1024)}MB)`
        );
      }

      // Store backup
      const backup = {
        id: backupId,
        timestamp,
        type,
        description,
        size: dataSize,
        compressed: this.backupConfig.compression,
        encrypted: true,
        data: encryptedData,
        checksum: await this.calculateChecksum(encryptedData)
      };

      await this.storeBackup(backup);

      // Update backup history
      this.backupHistory.push({
        id: backupId,
        timestamp,
        type,
        description,
        size: dataSize,
        status: 'completed'
      });

      this.saveBackupHistory();

      console.log('Backup created successfully:', backupId);
      return backupId;
    } catch (error) {
      console.error('Backup creation failed:', error);
      this.logBackupError('backup_creation_failed', error);
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  // Generate backup ID
  generateBackupId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `backup_${timestamp}_${random}`;
  }

  // Compress data
  async compressData(data) {
    try {
      const jsonString = JSON.stringify(data);

      // Use CompressionStream if available (modern browsers)
      if ('CompressionStream' in window) {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(new TextEncoder().encode(jsonString));
        writer.close();

        const chunks = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }

        return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
      } else {
        // Fallback: simple string compression
        return this.simpleCompress(jsonString);
      }
    } catch (error) {
      console.warn('Compression failed, using uncompressed data:', error);
      return JSON.stringify(data);
    }
  }

  // Simple compression fallback
  simpleCompress(str) {
    // Basic LZ-string style compression
    const dict = {};
    const data = str.split('');
    const result = [];
    let dictSize = 256;
    let w = '';

    for (let i = 0; i < data.length; i++) {
      const c = data[i];
      const wc = w + c;

      if (dict[wc]) {
        w = wc;
      } else {
        result.push(dict[w] || w.charCodeAt(0));
        dict[wc] = dictSize++;
        w = c;
      }
    }

    if (w) {
      result.push(dict[w] || w.charCodeAt(0));
    }

    return JSON.stringify(result);
  }

  // Encrypt data
  async encryptData(data) {
    try {
      const key = await this.getEncryptionKey();
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      const encrypted = CryptoJS.AES.encrypt(dataString, key, {
        keySize: this.backupConfig.encryption.keySize / 32,
        iterations: this.backupConfig.encryption.iterations
      }).toString();

      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  // Get encryption key
  async getEncryptionKey() {
    // In a real application, this would be derived from user password or stored securely
    let key = localStorage.getItem('backup_encryption_key');

    if (!key) {
      // Generate new key
      key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      localStorage.setItem('backup_encryption_key', key);
    }

    return key;
  }

  // Calculate checksum
  async calculateChecksum(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  }

  // Store backup
  async storeBackup(backup) {
    try {
      // Store in IndexedDB
      await this.storeInIndexedDB(backup);

      // Also store metadata in localStorage for quick access
      const metadata = {
        id: backup.id,
        timestamp: backup.timestamp,
        type: backup.type,
        description: backup.description,
        size: backup.size,
        checksum: backup.checksum
      };

      const existingMetadata = JSON.parse(localStorage.getItem('backup_metadata') || '[]');
      existingMetadata.push(metadata);
      localStorage.setItem('backup_metadata', JSON.stringify(existingMetadata));
    } catch (error) {
      console.error('Failed to store backup:', error);
      throw error;
    }
  }

  // Store backup in IndexedDB
  async storeInIndexedDB(backup) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDBackups', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');

        const addRequest = store.add(backup);

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
    });
  }

  // Restore backup
  async restoreBackup(backupId) {
    try {
      console.log('Starting backup restoration:', backupId);

      // Get backup data
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Verify checksum
      const calculatedChecksum = await this.calculateChecksum(backup.data);
      if (calculatedChecksum !== backup.checksum) {
        throw new Error('Backup integrity check failed');
      }

      // Decrypt data
      const decryptedData = await this.decryptData(backup.data);

      // Decompress if needed
      let restoredData = decryptedData;
      if (backup.compressed) {
        restoredData = await this.decompressData(decryptedData);
      }

      // Parse data
      const backupData = JSON.parse(restoredData);

      // Restore data
      await this.restoreData(backupData);

      console.log('Backup restored successfully:', backupId);

      // Log restoration
      this.logBackupEvent('backup_restored', { backupId, timestamp: Date.now() });

      return true;
    } catch (error) {
      console.error('Backup restoration failed:', error);
      this.logBackupError('backup_restoration_failed', error);
      throw error;
    }
  }

  // Get backup
  async getBackup(backupId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDBackups', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');

        const getRequest = store.get(backupId);

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };

        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      };
    });
  }

  // Decrypt data
  async decryptData(encryptedData) {
    try {
      const key = await this.getEncryptionKey();

      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        keySize: this.backupConfig.encryption.keySize / 32,
        iterations: this.backupConfig.encryption.iterations
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  // Decompress data
  async decompressData(compressedData) {
    try {
      // Use DecompressionStream if available
      if ('DecompressionStream' in window) {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(new Uint8Array(compressedData));
        writer.close();

        const chunks = [];
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }

        return new TextDecoder().decode(new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [])));
      } else {
        // Fallback: simple decompression
        return this.simpleDecompress(compressedData);
      }
    } catch (error) {
      console.warn('Decompression failed, treating as uncompressed:', error);
      return compressedData;
    }
  }

  // Simple decompression fallback
  simpleDecompress(compressedStr) {
    try {
      const data = JSON.parse(compressedStr);
      const dict = {};
      const result = [];
      let dictSize = 256;
      let w = String.fromCharCode(data[0]);
      result.push(w);

      for (let i = 1; i < data.length; i++) {
        const k = data[i];
        let entry;

        if (dict[k]) {
          entry = dict[k];
        } else if (k === dictSize) {
          entry = w + w.charAt(0);
        } else {
          entry = String.fromCharCode(k);
        }

        result.push(entry);
        dict[dictSize++] = w + entry.charAt(0);
        w = entry;
      }

      return result.join('');
    } catch (error) {
      return compressedStr;
    }
  }

  // Restore data
  async restoreData(backupData) {
    try {
      // Restore localStorage data
      if (backupData.data.localStorage) {
        Object.entries(backupData.data.localStorage).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      }

      // Restore IndexedDB data
      if (backupData.data.indexedDB) {
        await this.restoreIndexedDBData(backupData.data.indexedDB);
      }

      // Restore user preferences
      if (backupData.data.preferences) {
        this.restoreUserPreferences(backupData.data.preferences);
      }

      console.log('Data restoration completed');
    } catch (error) {
      console.error('Data restoration failed:', error);
      throw error;
    }
  }

  // Restore IndexedDB data
  async restoreIndexedDBData(indexedDBData) {
    for (const [storeName, storeData] of Object.entries(indexedDBData)) {
      try {
        await this.restoreIndexedDBStore(storeName, storeData);
      } catch (error) {
        console.warn(`Failed to restore IndexedDB store ${storeName}:`, error);
      }
    }
  }

  // Restore IndexedDB store
  async restoreIndexedDBStore(storeName, storeData) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDDatabase', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(storeName)) {
          console.warn(`Store ${storeName} does not exist, skipping restoration`);
          resolve();
          return;
        }

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore('backups');

        // Clear existing data
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          // Add restored data
          let completed = 0;
          const total = storeData.length;

          if (total === 0) {
            resolve();
            return;
          }

          storeData.forEach(item => {
            const addRequest = store.add(item);

            addRequest.onsuccess = () => {
              completed++;
              if (completed === total) {
                resolve();
              }
            };

            addRequest.onerror = () => {
              console.warn('Failed to restore item:', item);
              completed++;
              if (completed === total) {
                resolve();
              }
            };
          });
        };

        clearRequest.onerror = () => {
          reject(clearRequest.error);
        };
      };
    });
  }

  // Restore user preferences
  restoreUserPreferences(preferences) {
    Object.entries(preferences).forEach(([key, value]) => {
      if (typeof value === 'object') {
        localStorage.setItem(`${key}_settings`, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    });
  }

  // Cleanup old backups
  async cleanupOldBackups() {
    try {
      const backups = await this.getAllBackups();
      const now = Date.now();

      // Group backups by type
      const groupedBackups = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: []
      };

      backups.forEach(backup => {
        const age = now - backup.timestamp;
        const days = age / (24 * 60 * 60 * 1000);

        if (days <= 1) {
          groupedBackups.daily.push(backup);
        } else if (days <= 7) {
          groupedBackups.weekly.push(backup);
        } else if (days <= 30) {
          groupedBackups.monthly.push(backup);
        } else {
          groupedBackups.yearly.push(backup);
        }
      });

      // Apply retention policies
      const toDelete = [];

      Object.entries(groupedBackups).forEach(([period, periodBackups]) => {
        const limit = this.backupConfig.retention[period];
        if (periodBackups.length > limit) {
          // Sort by timestamp (oldest first) and mark excess for deletion
          periodBackups.sort((a, b) => a.timestamp - b.timestamp);
          toDelete.push(...periodBackups.slice(0, periodBackups.length - limit));
        }
      });

      // Delete old backups
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id);
      }

      console.log(`Cleaned up ${toDelete.length} old backups`);
    } catch (error) {
      console.error('Backup cleanup failed:', error);
    }
  }

  // Get all backups
  async getAllBackups() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDBackups', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');

        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
      };
    });
  }

  // Delete backup
  async deleteBackup(backupId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('QASDBackups', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');

        const deleteRequest = store.delete(backupId);

        deleteRequest.onsuccess = () => {
          // Also remove from metadata
          const metadata = JSON.parse(localStorage.getItem('backup_metadata') || '[]');
          const filteredMetadata = metadata.filter(item => item.id !== backupId);
          localStorage.setItem('backup_metadata', JSON.stringify(filteredMetadata));

          resolve();
        };

        deleteRequest.onerror = () => {
          reject(deleteRequest.error);
        };
      };
    });
  }

  // Monitor storage quota
  async monitorStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedPercentage = (estimate.usage / estimate.quota) * 100;

        console.log('Storage usage:', {
          used: Math.round(estimate.usage / 1024 / 1024) + ' MB',
          quota: Math.round(estimate.quota / 1024 / 1024) + ' MB',
          percentage: Math.round(usedPercentage) + '%'
        });

        // Warn if storage is getting full
        if (usedPercentage > 80) {
          console.warn('Storage quota is getting full, consider cleaning up old backups');
          await this.cleanupOldBackups();
        }
      } catch (error) {
        console.error('Failed to check storage quota:', error);
      }
    }
  }

  // Setup backup verification
  setupBackupVerification() {
    // Verify backups periodically
    setInterval(
      async () => {
        try {
          await this.verifyBackups();
        } catch (error) {
          console.error('Backup verification failed:', error);
        }
      },
      24 * 60 * 60 * 1000
    ); // Daily verification
  }

  // Verify backups integrity
  async verifyBackups() {
    try {
      const backups = await this.getAllBackups();
      let corruptedCount = 0;

      for (const backup of backups) {
        try {
          const calculatedChecksum = await this.calculateChecksum(backup.data);
          if (calculatedChecksum !== backup.checksum) {
            console.error('Corrupted backup detected:', backup.id);
            corruptedCount++;

            // Mark backup as corrupted
            this.logBackupError('backup_corrupted', { backupId: backup.id });
          }
        } catch (error) {
          console.error('Failed to verify backup:', backup.id, error);
          corruptedCount++;
        }
      }

      if (corruptedCount === 0) {
        console.log('All backups verified successfully');
      } else {
        console.warn(`${corruptedCount} corrupted backups detected`);
      }
    } catch (error) {
      console.error('Backup verification failed:', error);
    }
  }

  // Get backup statistics
  getBackupStatistics() {
    const metadata = JSON.parse(localStorage.getItem('backup_metadata') || '[]');

    const stats = {
      total: metadata.length,
      totalSize: metadata.reduce((sum, backup) => sum + backup.size, 0),
      byType: {},
      oldest: null,
      newest: null
    };

    metadata.forEach(backup => {
      stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;

      if (!stats.oldest || backup.timestamp < stats.oldest) {
        stats.oldest = backup.timestamp;
      }

      if (!stats.newest || backup.timestamp > stats.newest) {
        stats.newest = backup.timestamp;
      }
    });

    return stats;
  }

  // Export backup
  async exportBackup(backupId) {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      const exportData = {
        ...backup,
        exportedAt: Date.now(),
        version: '1.0.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${backupId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Backup exported successfully:', backupId);
    } catch (error) {
      console.error('Backup export failed:', error);
      throw error;
    }
  }

  // Import backup
  async importBackup(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.id || !importData.data || !importData.checksum) {
        throw new Error('Invalid backup file format');
      }

      // Verify checksum
      const calculatedChecksum = await this.calculateChecksum(importData.data);
      if (calculatedChecksum !== importData.checksum) {
        throw new Error('Backup file integrity check failed');
      }

      // Store imported backup
      await this.storeBackup(importData);

      console.log('Backup imported successfully:', importData.id);
      return importData.id;
    } catch (error) {
      console.error('Backup import failed:', error);
      throw error;
    }
  }

  // Load backup history
  loadBackupHistory() {
    const history = localStorage.getItem('backup_history');
    if (history) {
      try {
        this.backupHistory = JSON.parse(history);
      } catch (error) {
        console.error('Failed to load backup history:', error);
        this.backupHistory = [];
      }
    }
  }

  // Save backup history
  saveBackupHistory() {
    localStorage.setItem('backup_history', JSON.stringify(this.backupHistory));
  }

  // Save backup config
  saveBackupConfig() {
    localStorage.setItem('backup_config', JSON.stringify(this.backupConfig));
  }

  // Log backup event
  logBackupEvent(event, data) {
    const logEntry = {
      timestamp: Date.now(),
      event,
      data
    };

    const logs = JSON.parse(localStorage.getItem('backup_logs') || '[]');
    logs.push(logEntry);

    // Keep only last 1000 log entries
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem('backup_logs', JSON.stringify(logs));
  }

  // Log backup error
  logBackupError(error, details) {
    this.logBackupEvent('error', { error, details, stack: new Error().stack });
  }

  // Get backup logs
  getBackupLogs() {
    return JSON.parse(localStorage.getItem('backup_logs') || '[]');
  }
}

// Create singleton instance
const backupService = new BackupService();

export default backupService;
