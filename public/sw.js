// QASD Service Worker - PWA Implementation
const CACHE_NAME = 'qasd-v1.0.0';
const STATIC_CACHE = 'qasd-static-v1.0.0';
const DYNAMIC_CACHE = 'qasd-dynamic-v1.0.0';
const API_CACHE = 'qasd-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/dashboard/stats',
  '/api/production/summary',
  '/api/quality/metrics',
  '/api/inventory/levels'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('[SW] Pre-caching API endpoints');
        return Promise.allSettled(
          API_ENDPOINTS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response.clone());
              }
            }).catch(() => {})
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback to cache
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssets(request));
  } else {
    // HTML pages - Stale While Revalidate
    event.respondWith(handlePageRequest(request));
  }
});

// Network First strategy for API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API calls
    if (request.url.includes('/api/auth/me')) {
      return new Response(JSON.stringify({ offline: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Cache First strategy for static assets
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Stale While Revalidate for HTML pages
async function handlePageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // If network fails and we have no cache, return offline page
    if (!cachedResponse) {
      return caches.match('/offline.html');
    }
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    const db = await openIndexedDB();
    const offlineActions = await getOfflineActions(db);
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action from offline storage
        await removeOfflineAction(db, action.id);
        console.log('[SW] Synced offline action:', action.id);
      } catch (error) {
        console.log('[SW] Failed to sync action:', action.id, error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('qasd-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getOfflineActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['actions'], 'readwrite');
    const store = transaction.objectStore('actions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'لديك إشعار جديد من نظام QASD',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icons/action-close.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('نظام QASD', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.payload);
      })
    );
  }
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'update-dashboard') {
    event.waitUntil(updateDashboardData());
  }
});

async function updateDashboardData() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put('/api/dashboard/stats', response.clone());
      console.log('[SW] Dashboard data updated in background');
    }
  } catch (error) {
    console.log('[SW] Failed to update dashboard data:', error);
  }
}

console.log('[SW] Service worker script loaded');