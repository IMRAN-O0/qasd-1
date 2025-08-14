import React, { useState, useEffect } from 'react';
import {
  WifiIcon,
  CloudArrowDownIcon,
  DevicePhoneMobileIcon,
  BellIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PWAManager = () => {
  const [pwaStatus, setPwaStatus] = useState({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    serviceWorkerRegistered: false,
    notificationsEnabled: false,
    updateAvailable: false,
    syncPending: false
  });

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  useEffect(() => {
    initializePWA();
    setupEventListeners();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  // Initialize PWA features
  const initializePWA = async () => {
    // Disable PWA in development
    if (import.meta.env.DEV) {
      console.log('PWA disabled in development mode');
      return;
    }
    
    try {
      // Check if app is installed
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

      // Register service worker
      const swRegistered = await registerServiceWorker();

      // Check notification permission
      const notificationsEnabled = Notification.permission === 'granted';

      // Load offline queue
      const queue = await loadOfflineQueue();

      setPwaStatus(prev => ({
        ...prev,
        isInstalled,
        serviceWorkerRegistered: swRegistered,
        notificationsEnabled
      }));

      setOfflineQueue(queue);

      // Show install banner if not installed and can install
      if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    } catch (error) {
      console.error('Failed to initialize PWA:', error);
    }
  };

  // Register service worker
  const registerServiceWorker = async () => {
    // Disable service worker in development
    if (import.meta.env.DEV) {
      return false;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdateBanner(true);
              setPwaStatus(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        });

        console.log('Service Worker registered successfully');
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }

    return false;
  };

  // Setup event listeners
  const setupEventListeners = () => {
    // Online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt event
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // App installed event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Background sync
    window.addEventListener('sync', handleBackgroundSync);
  };

  // Cleanup event listeners
  const cleanupEventListeners = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    }

    window.removeEventListener('sync', handleBackgroundSync);
  };

  // Handle online event
  const handleOnline = async () => {
    setPwaStatus(prev => ({ ...prev, isOnline: true }));

    // Sync offline queue
    if (offlineQueue.length > 0) {
      await syncOfflineQueue();
    }

    // Show success notification
    showNotification('اتصال الإنترنت متاح', 'تم استعادة الاتصال بالإنترنت', 'success');
  };

  // Handle offline event
  const handleOffline = () => {
    setPwaStatus(prev => ({ ...prev, isOnline: false }));
    showNotification('لا يوجد اتصال بالإنترنت', 'سيتم حفظ التغييرات محلياً', 'warning');
  };

  // Handle install prompt
  const handleInstallPrompt = e => {
    e.preventDefault();
    setInstallPrompt(e);
    setPwaStatus(prev => ({ ...prev, canInstall: true }));
  };

  // Handle app installed
  const handleAppInstalled = () => {
    setPwaStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
    setShowInstallBanner(false);
    setInstallPrompt(null);
    showNotification('تم تثبيت التطبيق', 'يمكنك الآن الوصول للتطبيق من الشاشة الرئيسية', 'success');
  };

  // Handle service worker messages
  const handleServiceWorkerMessage = event => {
    const { type, payload } = event.data;

    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;

      case 'OFFLINE_FALLBACK':
        showNotification('وضع عدم الاتصال', 'تم تحميل الصفحة من التخزين المحلي', 'info');
        break;

      case 'BACKGROUND_SYNC':
        handleBackgroundSyncMessage(payload);
        break;

      case 'PUSH_RECEIVED':
        handlePushMessage(payload);
        break;

      default:
        console.log('Unknown service worker message:', type, payload);
    }
  };

  // Handle background sync
  const handleBackgroundSync = event => {
    console.log('Background sync event:', event);
    setPwaStatus(prev => ({ ...prev, syncPending: true }));
  };

  // Handle background sync message
  const handleBackgroundSyncMessage = payload => {
    const { status, syncedItems } = payload;

    if (status === 'success') {
      setSyncStatus('success');
      setOfflineQueue(prev => prev.filter(item => !syncedItems.includes(item.id)));

      showNotification('تم المزامنة', `تم مزامنة ${syncedItems.length} عنصر`, 'success');

      setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
      setSyncStatus('error');
      showNotification('فشل في المزامنة', 'حدث خطأ أثناء مزامنة البيانات', 'error');

      setTimeout(() => setSyncStatus('idle'), 5000);
    }

    setPwaStatus(prev => ({ ...prev, syncPending: false }));
  };

  // Handle push message
  const handlePushMessage = payload => {
    console.log('Push message received:', payload);

    // Show in-app notification
    showNotification(payload.title, payload.body, 'info');
  };

  // Install app
  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      const result = await installPrompt.prompt();

      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      setInstallPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };

  // Dismiss install banner
  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Update app
  const updateApp = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload the page to activate the new service worker
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  };

  // Dismiss update banner
  const dismissUpdateBanner = () => {
    setShowUpdateBanner(false);
    setPwaStatus(prev => ({ ...prev, updateAvailable: false }));
  };

  // Enable notifications
  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setPwaStatus(prev => ({ ...prev, notificationsEnabled: true }));

        // Subscribe to push notifications
        await subscribeToPushNotifications();

        showNotification('تم تفعيل الإشعارات', 'ستتلقى إشعارات حول التحديثات المهمة', 'success');
      } else {
        showNotification('تم رفض الإشعارات', 'لن تتلقى إشعارات من التطبيق', 'warning');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();

      if (registration) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
        });

        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(subscription)
        });

        console.log('Push notification subscription successful');
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  // Sync offline queue
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) {
      return;
    }

    setSyncStatus('syncing');

    try {
      const syncPromises = offlineQueue.map(async item => {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body
          });

          if (response.ok) {
            return { id: item.id, status: 'success' };
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          return { id: item.id, status: 'error', error: error.message };
        }
      });

      const results = await Promise.allSettled(syncPromises);

      const successful = results
        .filter(result => result.status === 'fulfilled' && result.value.status === 'success')
        .map(result => result.value.id);

      const failed = results.filter(result => result.status === 'rejected' || result.value.status === 'error').length;

      // Update offline queue
      setOfflineQueue(prev => prev.filter(item => !successful.includes(item.id)));

      // Save updated queue
      await saveOfflineQueue(offlineQueue.filter(item => !successful.includes(item.id)));

      if (successful.length > 0) {
        setSyncStatus('success');
        showNotification('تم المزامنة', `تم مزامنة ${successful.length} عنصر`, 'success');
      }

      if (failed > 0) {
        showNotification('مزامنة جزئية', `فشل في مزامنة ${failed} عنصر`, 'warning');
      }
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync offline queue:', error);
      showNotification('فشل في المزامنة', 'حدث خطأ أثناء مزامنة البيانات', 'error');
    }

    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Load offline queue
  const loadOfflineQueue = async () => {
    try {
      const stored = localStorage.getItem('pwa-offline-queue');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      return [];
    }
  };

  // Save offline queue
  const saveOfflineQueue = async queue => {
    try {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  };

  // Add to offline queue
  const addToOfflineQueue = request => {
    const queueItem = {
      id: Date.now().toString(),
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      timestamp: Date.now()
    };

    setOfflineQueue(prev => {
      const updated = [...prev, queueItem];
      saveOfflineQueue(updated);
      return updated;
    });
  };

  // Show notification
  const showNotification = (title, message, type = 'info') => {
    // Create custom notification element
    const notification = document.createElement('div');
    notification.className =
      'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full';

    const bgColor =
      {
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
      }[type] || 'bg-blue-500';

    notification.className += ` ${bgColor} text-white`;

    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-sm">${title}</h4>
          <p class="text-xs mt-1 opacity-90">${message}</p>
        </div>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  };

  // Clear offline queue
  const clearOfflineQueue = async () => {
    setOfflineQueue([]);
    await saveOfflineQueue([]);
    showNotification('تم مسح القائمة', 'تم مسح جميع العناصر المعلقة', 'success');
  };

  // Force sync
  const forceSync = async () => {
    if (!pwaStatus.isOnline) {
      showNotification('لا يوجد اتصال', 'تحتاج إلى اتصال بالإنترنت للمزامنة', 'warning');
      return;
    }

    await syncOfflineQueue();
  };

  return (
    <div className='pwa-manager'>
      {/* Install Banner */}
      {showInstallBanner && (
        <div className='fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm'>
          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <DevicePhoneMobileIcon className='w-6 h-6 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>تثبيت التطبيق</h4>
              <p className='text-xs mt-1 opacity-90'>ثبت التطبيق للوصول السريع والعمل بدون اتصال</p>
              <div className='flex space-x-2 rtl:space-x-reverse mt-3'>
                <button
                  onClick={installApp}
                  className='bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100'
                >
                  تثبيت
                </button>
                <button
                  onClick={dismissInstallBanner}
                  className='text-white px-3 py-1 rounded text-xs hover:bg-blue-700'
                >
                  إغلاق
                </button>
              </div>
            </div>
            <button onClick={dismissInstallBanner} className='text-white hover:text-gray-200'>
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className='fixed top-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm'>
          <div className='flex items-start space-x-3 rtl:space-x-reverse'>
            <CloudArrowDownIcon className='w-6 h-6 flex-shrink-0 mt-0.5' />
            <div className='flex-1'>
              <h4 className='font-semibold text-sm'>تحديث متاح</h4>
              <p className='text-xs mt-1 opacity-90'>يتوفر إصدار جديد من التطبيق</p>
              <div className='flex space-x-2 rtl:space-x-reverse mt-3'>
                <button
                  onClick={updateApp}
                  className='bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100'
                >
                  تحديث
                </button>
                <button
                  onClick={dismissUpdateBanner}
                  className='text-white px-3 py-1 rounded text-xs hover:bg-green-700'
                >
                  لاحقاً
                </button>
              </div>
            </div>
            <button onClick={dismissUpdateBanner} className='text-white hover:text-gray-200'>
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className='fixed top-4 left-4 z-40 flex flex-col space-y-2'>
        {/* Online/Offline Status */}
        <div
          className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-medium ${
            pwaStatus.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <WifiIcon className='w-4 h-4' />
          <span>{pwaStatus.isOnline ? 'متصل' : 'غير متصل'}</span>
        </div>

        {/* Sync Status */}
        {(syncStatus !== 'idle' || offlineQueue.length > 0) && (
          <div
            className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full text-xs font-medium ${
              syncStatus === 'syncing'
                ? 'bg-blue-100 text-blue-800'
                : syncStatus === 'success'
                  ? 'bg-green-100 text-green-800'
                  : syncStatus === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <ArrowPathIcon className='w-4 h-4 animate-spin' />
            ) : syncStatus === 'success' ? (
              <CheckCircleIcon className='w-4 h-4' />
            ) : syncStatus === 'error' ? (
              <ExclamationTriangleIcon className='w-4 h-4' />
            ) : (
              <span className='w-4 h-4 bg-current rounded-full flex items-center justify-center text-white text-xs'>
                {offlineQueue.length}
              </span>
            )}
            <span>
              {syncStatus === 'syncing'
                ? 'جاري المزامنة...'
                : syncStatus === 'success'
                  ? 'تم المزامنة'
                  : syncStatus === 'error'
                    ? 'فشل في المزامنة'
                    : `${offlineQueue.length} معلق`}
            </span>
          </div>
        )}
      </div>

      {/* PWA Controls (for development/admin) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 max-w-xs'>
          <h4 className='font-semibold text-sm mb-3'>PWA Controls</h4>

          <div className='space-y-2 text-xs'>
            <div className='flex justify-between'>
              <span>Service Worker:</span>
              <span className={pwaStatus.serviceWorkerRegistered ? 'text-green-600' : 'text-red-600'}>
                {pwaStatus.serviceWorkerRegistered ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Installed:</span>
              <span className={pwaStatus.isInstalled ? 'text-green-600' : 'text-gray-600'}>
                {pwaStatus.isInstalled ? 'Yes' : 'No'}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Notifications:</span>
              <span className={pwaStatus.notificationsEnabled ? 'text-green-600' : 'text-gray-600'}>
                {pwaStatus.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className='flex justify-between'>
              <span>Offline Queue:</span>
              <span className='text-blue-600'>{offlineQueue.length} items</span>
            </div>
          </div>

          <div className='flex flex-wrap gap-1 mt-3'>
            {pwaStatus.canInstall && (
              <button
                onClick={installApp}
                className='bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600'
              >
                Install
              </button>
            )}

            {!pwaStatus.notificationsEnabled && (
              <button
                onClick={enableNotifications}
                className='bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600'
              >
                <BellIcon className='w-3 h-3 inline mr-1' />
                Notify
              </button>
            )}

            {offlineQueue.length > 0 && (
              <>
                <button
                  onClick={forceSync}
                  className='bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600'
                  disabled={!pwaStatus.isOnline || syncStatus === 'syncing'}
                >
                  Sync
                </button>

                <button
                  onClick={clearOfflineQueue}
                  className='bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600'
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAManager;
