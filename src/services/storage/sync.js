/**
 * خدمة المزامنة
 *
 * توفر هذه الخدمة وظائف لمزامنة البيانات بين التخزين المحلي والخادم،
 * مما يسمح بالعمل دون اتصال بالإنترنت ومزامنة التغييرات عند استعادة الاتصال.
 */

import { storage } from '../../utils/storage';

// مفاتيح التخزين
const SYNC_QUEUE_KEY = 'sync_queue';
const SYNC_STATE_KEY = 'sync_state';

// حالات المزامنة
const SYNC_STATUS = {
  PENDING: 'pending', // في انتظار المزامنة
  SYNCING: 'syncing', // جاري المزامنة
  COMPLETED: 'completed', // تمت المزامنة
  FAILED: 'failed' // فشلت المزامنة
};

// أنواع العمليات
const OPERATION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

/**
 * الحصول على قائمة المزامنة
 *
 * @returns {Array} قائمة العمليات المعلقة للمزامنة
 */
function getSyncQueue() {
  try {
    return storage.get(SYNC_QUEUE_KEY) || [];
  } catch (error) {
    console.error('خطأ في الحصول على قائمة المزامنة:', error);
    return [];
  }
}

/**
 * حفظ قائمة المزامنة
 *
 * @param {Array} queue - قائمة المزامنة
 */
function saveSyncQueue(queue) {
  try {
    storage.set(SYNC_QUEUE_KEY, queue);
  } catch (error) {
    console.error('خطأ في حفظ قائمة المزامنة:', error);
  }
}

/**
 * الحصول على حالة المزامنة
 *
 * @returns {Object} حالة المزامنة
 */
function getSyncState() {
  try {
    return (
      storage.get(SYNC_STATE_KEY) || {
        lastSync: null,
        status: SYNC_STATUS.COMPLETED,
        error: null
      }
    );
  } catch (error) {
    console.error('خطأ في الحصول على حالة المزامنة:', error);
    return {
      lastSync: null,
      status: SYNC_STATUS.COMPLETED,
      error: null
    };
  }
}

/**
 * حفظ حالة المزامنة
 *
 * @param {Object} state - حالة المزامنة
 */
function saveSyncState(state) {
  try {
    storage.set(SYNC_STATE_KEY, state);
  } catch (error) {
    console.error('خطأ في حفظ حالة المزامنة:', error);
  }
}

/**
 * إضافة عملية إلى قائمة المزامنة
 *
 * @param {string} entityType - نوع الكيان (مثل 'user', 'product', 'order')
 * @param {string} operationType - نوع العملية (create, update, delete)
 * @param {Object} data - بيانات العملية
 * @param {string} [id] - معرف الكيان (مطلوب لعمليات التحديث والحذف)
 * @returns {string} معرف العملية
 */
function addToSyncQueue(entityType, operationType, data, id) {
  try {
    // التحقق من صحة المعلمات
    if (!entityType || !operationType || !OPERATION_TYPES[operationType.toUpperCase()]) {
      throw new Error('معلمات غير صالحة');
    }

    // التحقق من وجود المعرف لعمليات التحديث والحذف
    if ((operationType === OPERATION_TYPES.UPDATE || operationType === OPERATION_TYPES.DELETE) && !id) {
      throw new Error('المعرف مطلوب لعمليات التحديث والحذف');
    }

    const queue = getSyncQueue();

    // إنشاء معرف فريد للعملية
    const operationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء كائن العملية
    const operation = {
      id: operationId,
      entityType,
      operationType,
      entityId: id,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: SYNC_STATUS.PENDING
    };

    // إضافة العملية إلى القائمة
    queue.push(operation);

    // حفظ القائمة
    saveSyncQueue(queue);

    // تحديث حالة المزامنة
    const syncState = getSyncState();
    if (syncState.status === SYNC_STATUS.COMPLETED) {
      syncState.status = SYNC_STATUS.PENDING;
      saveSyncState(syncState);
    }

    return operationId;
  } catch (error) {
    console.error('خطأ في إضافة عملية إلى قائمة المزامنة:', error);
    throw error;
  }
}

/**
 * تحديث حالة عملية في قائمة المزامنة
 *
 * @param {string} operationId - معرف العملية
 * @param {string} status - الحالة الجديدة
 * @param {Object} [error] - معلومات الخطأ (إذا كانت الحالة 'failed')
 * @returns {boolean} نجاح العملية
 */
function updateOperationStatus(operationId, status, error = null) {
  try {
    const queue = getSyncQueue();

    // البحث عن العملية
    const operationIndex = queue.findIndex(op => op.id === operationId);

    if (operationIndex === -1) {
      return false;
    }

    // تحديث حالة العملية
    queue[operationIndex].status = status;

    // إذا كانت الحالة 'failed'، تخزين معلومات الخطأ وزيادة عدد المحاولات
    if (status === SYNC_STATUS.FAILED) {
      queue[operationIndex].error = error;
      queue[operationIndex].retryCount++;
    }

    // إذا كانت الحالة 'completed'، إزالة العملية من القائمة
    if (status === SYNC_STATUS.COMPLETED) {
      queue.splice(operationIndex, 1);
    }

    // حفظ القائمة
    saveSyncQueue(queue);

    return true;
  } catch (error) {
    console.error('خطأ في تحديث حالة عملية:', error);
    return false;
  }
}

/**
 * مزامنة العمليات المعلقة مع الخادم
 *
 * @param {Function} syncFunction - دالة المزامنة التي تتعامل مع الخادم
 * @returns {Promise<{success: boolean, synced: number, failed: number, pending: number}>} نتيجة المزامنة
 */
async function syncPendingOperations(syncFunction) {
  try {
    // التحقق من وجود دالة المزامنة
    if (typeof syncFunction !== 'function') {
      throw new Error('دالة المزامنة غير صالحة');
    }

    const queue = getSyncQueue();

    // التحقق من وجود عمليات معلقة
    if (queue.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        pending: 0
      };
    }

    // تحديث حالة المزامنة
    const syncState = getSyncState();
    syncState.status = SYNC_STATUS.SYNCING;
    syncState.error = null;
    saveSyncState(syncState);

    // عدادات المزامنة
    let syncedCount = 0;
    let failedCount = 0;

    // مزامنة كل عملية
    for (const operation of queue) {
      // تخطي العمليات التي تمت مزامنتها بالفعل
      if (operation.status === SYNC_STATUS.COMPLETED) {
        continue;
      }

      try {
        // تحديث حالة العملية إلى 'syncing'
        operation.status = SYNC_STATUS.SYNCING;

        // استدعاء دالة المزامنة
        await syncFunction(operation);

        // تحديث حالة العملية إلى 'completed'
        updateOperationStatus(operation.id, SYNC_STATUS.COMPLETED);

        syncedCount++;
      } catch (error) {
        // تحديث حالة العملية إلى 'failed'
        updateOperationStatus(operation.id, SYNC_STATUS.FAILED, error.message);

        failedCount++;
      }
    }

    // تحديث حالة المزامنة
    const updatedQueue = getSyncQueue();
    syncState.lastSync = Date.now();
    syncState.status = updatedQueue.length > 0 ? SYNC_STATUS.PENDING : SYNC_STATUS.COMPLETED;
    saveSyncState(syncState);

    return {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      pending: updatedQueue.length
    };
  } catch (error) {
    console.error('خطأ في مزامنة العمليات المعلقة:', error);

    // تحديث حالة المزامنة
    const syncState = getSyncState();
    syncState.status = SYNC_STATUS.FAILED;
    syncState.error = error.message;
    saveSyncState(syncState);

    return {
      success: false,
      synced: 0,
      failed: 0,
      pending: getSyncQueue().length,
      error: error.message
    };
  }
}

/**
 * إعادة محاولة مزامنة العمليات الفاشلة
 *
 * @param {Function} syncFunction - دالة المزامنة التي تتعامل مع الخادم
 * @param {number} [maxRetries=3] - الحد الأقصى لعدد المحاولات
 * @returns {Promise<{success: boolean, retried: number, succeeded: number, failed: number}>} نتيجة إعادة المحاولة
 */
async function retryFailedOperations(syncFunction, maxRetries = 3) {
  try {
    // التحقق من وجود دالة المزامنة
    if (typeof syncFunction !== 'function') {
      throw new Error('دالة المزامنة غير صالحة');
    }

    const queue = getSyncQueue();

    // تصفية العمليات الفاشلة التي لم تتجاوز الحد الأقصى لعدد المحاولات
    const failedOperations = queue.filter(op => op.status === SYNC_STATUS.FAILED && op.retryCount < maxRetries);

    // التحقق من وجود عمليات فاشلة
    if (failedOperations.length === 0) {
      return {
        success: true,
        retried: 0,
        succeeded: 0,
        failed: 0
      };
    }

    // عدادات إعادة المحاولة
    let retriedCount = 0;
    let succeededCount = 0;
    let failedCount = 0;

    // إعادة محاولة كل عملية فاشلة
    for (const operation of failedOperations) {
      try {
        // تحديث حالة العملية إلى 'syncing'
        operation.status = SYNC_STATUS.SYNCING;

        // استدعاء دالة المزامنة
        await syncFunction(operation);

        // تحديث حالة العملية إلى 'completed'
        updateOperationStatus(operation.id, SYNC_STATUS.COMPLETED);

        retriedCount++;
        succeededCount++;
      } catch (error) {
        // تحديث حالة العملية إلى 'failed'
        updateOperationStatus(operation.id, SYNC_STATUS.FAILED, error.message);

        retriedCount++;
        failedCount++;
      }
    }

    return {
      success: failedCount === 0,
      retried: retriedCount,
      succeeded: succeededCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('خطأ في إعادة محاولة العمليات الفاشلة:', error);
    return {
      success: false,
      retried: 0,
      succeeded: 0,
      failed: 0,
      error: error.message
    };
  }
}

/**
 * مسح قائمة المزامنة
 *
 * @returns {boolean} نجاح العملية
 */
function clearSyncQueue() {
  try {
    saveSyncQueue([]);

    // تحديث حالة المزامنة
    const syncState = getSyncState();
    syncState.status = SYNC_STATUS.COMPLETED;
    syncState.error = null;
    saveSyncState(syncState);

    return true;
  } catch (error) {
    console.error('خطأ في مسح قائمة المزامنة:', error);
    return false;
  }
}

/**
 * الحصول على إحصائيات المزامنة
 *
 * @returns {Object} إحصائيات المزامنة
 */
function getSyncStats() {
  try {
    const queue = getSyncQueue();
    const state = getSyncState();

    // حساب عدد العمليات حسب الحالة
    const pendingCount = queue.filter(op => op.status === SYNC_STATUS.PENDING).length;
    const syncingCount = queue.filter(op => op.status === SYNC_STATUS.SYNCING).length;
    const failedCount = queue.filter(op => op.status === SYNC_STATUS.FAILED).length;

    // حساب عدد العمليات حسب النوع
    const createCount = queue.filter(op => op.operationType === OPERATION_TYPES.CREATE).length;
    const updateCount = queue.filter(op => op.operationType === OPERATION_TYPES.UPDATE).length;
    const deleteCount = queue.filter(op => op.operationType === OPERATION_TYPES.DELETE).length;

    return {
      totalOperations: queue.length,
      byStatus: {
        pending: pendingCount,
        syncing: syncingCount,
        failed: failedCount
      },
      byType: {
        create: createCount,
        update: updateCount,
        delete: deleteCount
      },
      lastSync: state.lastSync,
      currentStatus: state.status
    };
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المزامنة:', error);
    return {
      totalOperations: 0,
      byStatus: {
        pending: 0,
        syncing: 0,
        failed: 0
      },
      byType: {
        create: 0,
        update: 0,
        delete: 0
      },
      lastSync: null,
      currentStatus: SYNC_STATUS.FAILED
    };
  }
}

/**
 * إزالة عملية من قائمة المزامنة
 *
 * @param {string} operationId - معرف العملية
 * @returns {boolean} نجاح العملية
 */
function removeOperation(operationId) {
  try {
    const queue = getSyncQueue();

    // البحث عن العملية
    const operationIndex = queue.findIndex(op => op.id === operationId);

    if (operationIndex === -1) {
      return false;
    }

    // إزالة العملية
    queue.splice(operationIndex, 1);

    // حفظ القائمة
    saveSyncQueue(queue);

    return true;
  } catch (error) {
    console.error('خطأ في إزالة عملية من قائمة المزامنة:', error);
    return false;
  }
}

/**
 * التحقق من حالة الاتصال بالإنترنت
 *
 * @returns {boolean} ما إذا كان الجهاز متصلاً بالإنترنت
 */
function isOnline() {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * إضافة مستمع لحالة الاتصال بالإنترنت
 *
 * @param {Function} onlineCallback - دالة تُستدعى عند استعادة الاتصال
 * @param {Function} offlineCallback - دالة تُستدعى عند فقدان الاتصال
 * @returns {Function} دالة لإزالة المستمعين
 */
function addConnectivityListeners(onlineCallback, offlineCallback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // إضافة مستمعين لأحداث الاتصال
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  // إرجاع دالة لإزالة المستمعين
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
}

export const syncService = {
  // ثوابت
  SYNC_STATUS,
  OPERATION_TYPES,

  // وظائف إدارة قائمة المزامنة
  addToSyncQueue,
  updateOperationStatus,
  removeOperation,
  clearSyncQueue,

  // وظائف المزامنة
  syncPendingOperations,
  retryFailedOperations,

  // وظائف الحالة والإحصائيات
  getSyncState,
  getSyncStats,
  getSyncQueue,

  // وظائف الاتصال
  isOnline,
  addConnectivityListeners
};

export default syncService;
