// QASD Service Worker Diagnostic and Cleanup Script
// تشخيص وتنظيف Service Worker

console.log('🔍 بدء تشخيص Service Worker...');

// 1. فحص Service Workers المسجلة
async function checkServiceWorkers() {
  console.log('\n📋 فحص Service Workers المسجلة:');
  
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('✅ لا توجد Service Workers مسجلة');
        return [];
      }
      
      registrations.forEach((registration, index) => {
        console.log(`📌 Service Worker ${index + 1}:`);
        console.log(`   - Scope: ${registration.scope}`);
        console.log(`   - Script URL: ${registration.active?.scriptURL || 'غير نشط'}`);
        console.log(`   - State: ${registration.active?.state || 'غير محدد'}`);
        console.log(`   - Update Via Cache: ${registration.updateViaCache}`);
      });
      
      return registrations;
    } catch (error) {
      console.error('❌ خطأ في فحص Service Workers:', error);
      return [];
    }
  } else {
    console.log('⚠️ Service Workers غير مدعومة في هذا المتصفح');
    return [];
  }
}

// 2. فحص الكاش
async function checkCaches() {
  console.log('\n💾 فحص الكاش:');
  
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        console.log('✅ لا توجد كاشات محفوظة');
        return [];
      }
      
      console.log(`📦 عدد الكاشات الموجودة: ${cacheNames.length}`);
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        console.log(`\n🗂️ الكاش: ${cacheName}`);
        console.log(`   - عدد العناصر: ${keys.length}`);
        
        if (keys.length > 0) {
          console.log('   - العناصر المحفوظة:');
          keys.slice(0, 5).forEach(request => {
            console.log(`     • ${request.url}`);
          });
          if (keys.length > 5) {
            console.log(`     ... و ${keys.length - 5} عنصر آخر`);
          }
        }
      }
      
      return cacheNames;
    } catch (error) {
      console.error('❌ خطأ في فحص الكاش:', error);
      return [];
    }
  } else {
    console.log('⚠️ Cache API غير مدعوم في هذا المتصفح');
    return [];
  }
}

// 3. فحص التخزين المحلي
function checkLocalStorage() {
  console.log('\n🗄️ فحص التخزين المحلي:');
  
  const localStorageSize = Object.keys(localStorage).length;
  const sessionStorageSize = Object.keys(sessionStorage).length;
  
  console.log(`📊 localStorage: ${localStorageSize} عنصر`);
  console.log(`📊 sessionStorage: ${sessionStorageSize} عنصر`);
  
  if (localStorageSize > 0) {
    console.log('\n🔑 مفاتيح localStorage:');
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      console.log(`   • ${key}: ${size} bytes`);
    });
  }
  
  if (sessionStorageSize > 0) {
    console.log('\n🔑 مفاتيح sessionStorage:');
    Object.keys(sessionStorage).forEach(key => {
      const value = sessionStorage.getItem(key);
      const size = new Blob([value]).size;
      console.log(`   • ${key}: ${size} bytes`);
    });
  }
}

// 4. تنظيف شامل
async function performCleanup() {
  console.log('\n🧹 بدء التنظيف الشامل...');
  
  let cleanupResults = {
    serviceWorkers: 0,
    caches: 0,
    localStorage: false,
    sessionStorage: false
  };
  
  try {
    // إلغاء تسجيل Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
        cleanupResults.serviceWorkers++;
        console.log(`✅ تم إلغاء تسجيل Service Worker: ${registration.scope}`);
      }
    }
    
    // حذف جميع الكاشات
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
        cleanupResults.caches++;
        console.log(`✅ تم حذف الكاش: ${cacheName}`);
      }
    }
    
    // مسح localStorage
    if (Object.keys(localStorage).length > 0) {
      localStorage.clear();
      cleanupResults.localStorage = true;
      console.log('✅ تم مسح localStorage');
    }
    
    // مسح sessionStorage
    if (Object.keys(sessionStorage).length > 0) {
      sessionStorage.clear();
      cleanupResults.sessionStorage = true;
      console.log('✅ تم مسح sessionStorage');
    }
    
    console.log('\n🎉 تم التنظيف بنجاح!');
    console.log(`📊 النتائج:`);
    console.log(`   - Service Workers ملغاة: ${cleanupResults.serviceWorkers}`);
    console.log(`   - كاشات محذوفة: ${cleanupResults.caches}`);
    console.log(`   - localStorage ممسوح: ${cleanupResults.localStorage ? 'نعم' : 'لا'}`);
    console.log(`   - sessionStorage ممسوح: ${cleanupResults.sessionStorage ? 'نعم' : 'لا'}`);
    
    return cleanupResults;
    
  } catch (error) {
    console.error('❌ خطأ أثناء التنظيف:', error);
    throw error;
  }
}

// 5. اختبار الاتصال بالـ API
async function testAPIConnection() {
  console.log('\n🌐 اختبار الاتصال بالـ API...');
  
  const apiBaseUrl = 'http://localhost:5000';
  const endpoints = [
    '/health',
    '/api/auth/me',
    '/api/dashboard/stats'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok && endpoint === '/health') {
        const data = await response.json();
        console.log(`   📊 حالة الخادم: ${data.status}`);
        console.log(`   ⏱️ وقت التشغيل: ${data.uptime?.toFixed(2)} ثانية`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: خطأ في الاتصال - ${error.message}`);
    }
  }
}

// 6. التشخيص الكامل
async function fullDiagnostic() {
  console.log('🚀 بدء التشخيص الكامل لـ QASD...');
  console.log('=' .repeat(50));
  
  try {
    // فحص الحالة الحالية
    const registrations = await checkServiceWorkers();
    const cacheNames = await checkCaches();
    checkLocalStorage();
    
    // اختبار API
    await testAPIConnection();
    
    // تقرير المشكلة
    console.log('\n🔍 تحليل المشكلة:');
    
    if (registrations.length > 0) {
      console.log('⚠️ يوجد Service Workers مسجلة قد تسبب مشاكل في التطوير');
    }
    
    if (cacheNames.length > 0) {
      console.log('⚠️ يوجد كاشات قد تحتوي على أصول غير متاحة في وضع التطوير');
    }
    
    // توصيات
    console.log('\n💡 التوصيات:');
    console.log('1. قم بتشغيل performCleanup() لتنظيف شامل');
    console.log('2. أعد تحميل الصفحة بعد التنظيف');
    console.log('3. تأكد من تشغيل الخادم الخلفي على المنفذ 5000');
    console.log('4. أضف VITE_ENABLE_PWA=false إلى ملف .env لتعطيل PWA في التطوير');
    
    return {
      serviceWorkers: registrations.length,
      caches: cacheNames.length,
      hasIssues: registrations.length > 0 || cacheNames.length > 0
    };
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
    throw error;
  }
}

// 7. إعادة تحميل آمنة
function safeReload() {
  console.log('🔄 إعادة تحميل الصفحة...');
  
  // تأكد من عدم وجود Service Workers قبل إعادة التحميل
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length === 0) {
        window.location.reload(true);
      } else {
        console.log('⚠️ لا يزال هناك Service Workers مسجلة. قم بتشغيل performCleanup() أولاً');
      }
    });
  } else {
    window.location.reload(true);
  }
}

// تصدير الدوال للاستخدام في Console
window.qasdDebug = {
  checkServiceWorkers,
  checkCaches,
  checkLocalStorage,
  performCleanup,
  testAPIConnection,
  fullDiagnostic,
  safeReload
};

console.log('\n🛠️ أدوات التشخيص جاهزة!');
console.log('استخدم qasdDebug.fullDiagnostic() للتشخيص الكامل');
console.log('استخدم qasdDebug.performCleanup() للتنظيف الشامل');
console.log('استخدم qasdDebug.safeReload() لإعادة التحميل الآمنة');

// تشغيل التشخيص تلقائياً
fullDiagnostic();