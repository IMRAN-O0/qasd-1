// PWA Service - Progressive Web App functionality
class PWAService {
  constructor() {
    this.registration = null;
    this.isOnline = navigator.onLine;
    this.installPrompt = null;
    this.offlineQueue = [];

    this.initializeEventListeners();
  }

  // Initialize PWA service
  async initialize() {
    try {
      // Register service worker
      await this.registerServiceWorker();

      // Setup offline handling
      this.setupOfflineHandling();

      // Setup install prompt
      this.setupInstallPrompt();

      // Setup push notifications
      await this.setupPushNotifications();

      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA Service:', error);
    }
  }

  // Register service worker
  async registerServiceWorker() {
    // Disable service worker in development
    if (import.meta.env.DEV) {
      console.log('Service Worker disabled in development mode');
      return;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', this.registration);

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailable();
            }
          });
        });

        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Workers not supported');
    }
  }

  // Setup offline handling
  setupOfflineHandling() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineQueue();
      this.showNotification('تم استعادة الاتصال', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification('فقدان الاتصال - العمل في وضع عدم الاتصال', 'warning');
    });
  }

  // Setup install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.installPrompt = e;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.hideInstallBanner();
      this.showNotification('تم تثبيت التطبيق بنجاح!', 'success');
    });
  }

  // Setup push notifications
  async setupPushNotifications() {
    if ('Notification' in window && 'PushManager' in window) {
      try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted' && this.registration) {
          const subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
          });

          // Send subscription to server
          await this.sendSubscriptionToServer(subscription);

          console.log('Push notifications enabled');
        }
      } catch (error) {
        console.error('Failed to setup push notifications:', error);
      }
    }
  }

  // Show install banner
  showInstallBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className =
      'fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 transform -translate-y-full transition-transform duration-300';
    banner.innerHTML = `
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center space-x-3 rtl:space-x-reverse">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <span>قم بتثبيت تطبيق QASD للوصول السريع والعمل بدون اتصال</span>
        </div>
        <div class="flex space-x-2 rtl:space-x-reverse">
          <button id="pwa-install-btn" class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            تثبيت
          </button>
          <button id="pwa-dismiss-btn" class="text-white hover:text-gray-200 p-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
      banner.style.transform = 'translateY(0)';
    }, 100);

    // Add event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', () => {
      this.installApp();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  // Hide install banner
  hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  // Install app
  async installApp() {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;

      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      this.installPrompt = null;
      this.hideInstallBanner();
    }
  }

  // Show update available notification
  showUpdateAvailable() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium">تحديث متاح</h4>
          <p class="text-sm opacity-90">إصدار جديد من التطبيق متاح</p>
        </div>
        <button id="update-btn" class="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors ml-3">
          تحديث
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    document.getElementById('update-btn').addEventListener('click', () => {
      this.updateApp();
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  // Update app
  updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Add to offline queue
  addToOfflineQueue(request) {
    this.offlineQueue.push({
      id: Date.now(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
      timestamp: new Date().toISOString()
    });

    // Store in IndexedDB
    this.storeOfflineAction(this.offlineQueue[this.offlineQueue.length - 1]);
  }

  // Sync offline queue
  async syncOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log('Syncing offline queue:', this.offlineQueue.length, 'items');

    for (const action of this.offlineQueue) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        // Remove from queue
        this.offlineQueue = this.offlineQueue.filter(item => item.id !== action.id);
        await this.removeOfflineAction(action.id);

        console.log('Synced offline action:', action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', action.id, error);
      }
    }

    if (this.offlineQueue.length === 0) {
      this.showNotification('تم مزامنة جميع البيانات بنجاح', 'success');
    }
  }

  // Store offline action in IndexedDB
  async storeOfflineAction(action) {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      await store.add(action);
    } catch (error) {
      console.error('Failed to store offline action:', error);
    }
  }

  // Remove offline action from IndexedDB
  async removeOfflineAction(id) {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      await store.delete(id);
    } catch (error) {
      console.error('Failed to remove offline action:', error);
    }
  }

  // Open IndexedDB
  openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('qasd-offline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('actions')) {
          db.createObjectStore('actions', { keyPath: 'id' });
        }
      };
    });
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor =
      {
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
      }[type] || 'bg-blue-600';

    notification.className = `fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 max-w-sm transform translate-x-full transition-transform duration-300`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  // Initialize event listeners
  initializeEventListeners() {
    // Handle visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineQueue();
      }
    });
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Check if app is installed
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // Get installation status
  getInstallationStatus() {
    return {
      isInstalled: this.isInstalled(),
      canInstall: !!this.installPrompt,
      isOnline: this.isOnline,
      hasServiceWorker: !!this.registration
    };
  }
}

// Create singleton instance
const pwaService = new PWAService();

// Export function for conditional registration
export function registerPWA() {
  if (import.meta.env.DEV) return;
  navigator.serviceWorker?.register('/sw.js').catch(() => {});
}

export default pwaService;
