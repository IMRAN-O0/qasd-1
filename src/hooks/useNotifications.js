import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل التنبيهات من التخزين المحلي
  useEffect(() => {
    loadNotifications();
  }, []);

  // تحديث عدد التنبيهات غير المقروءة
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // تحميل التنبيهات
  const loadNotifications = useCallback(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS || 'notifications');
      const storedNotifications = stored ? JSON.parse(stored) : [];

      // ترتيب حسب التاريخ (الأحدث أولاً)
      const sortedNotifications = storedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('خطأ في تحميل التنبيهات:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // حفظ التنبيهات في التخزين المحلي
  const saveNotifications = useCallback(notificationsList => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS || 'notifications', JSON.stringify(notificationsList));
    } catch (error) {
      console.error('خطأ في حفظ التنبيهات:', error);
    }
  }, []);

  // إضافة تنبيه جديد
  const addNotification = useCallback(
    notification => {
      const newNotification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
        ...notification
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        saveNotifications(updated);
        return updated;
      });

      return newNotification.id;
    },
    [saveNotifications]
  );

  // إزالة تنبيه
  const removeNotification = useCallback(
    id => {
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        saveNotifications(updated);
        return updated;
      });
    },
    [saveNotifications]
  );

  // تحديد تنبيه كمقروء
  const markAsRead = useCallback(
    id => {
      setNotifications(prev => {
        const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
        saveNotifications(updated);
        return updated;
      });
    },
    [saveNotifications]
  );

  // تحديد جميع التنبيهات كمقروءة
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // مسح جميع التنبيهات
  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  // مسح التنبيهات المقروءة
  const clearRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.filter(n => !n.read);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // دوال مختصرة لأنواع التنبيهات
  const success = useCallback(
    (title, message, options = {}) => {
      return addNotification({
        type: 'success',
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (title, message, options = {}) => {
      return addNotification({
        type: 'error',
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title, message, options = {}) => {
      return addNotification({
        type: 'warning',
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (title, message, options = {}) => {
      return addNotification({
        type: 'info',
        title,
        message,
        ...options
      });
    },
    [addNotification]
  );

  // إنشاء تنبيهات تلقائية للنظام
  const createSystemNotifications = useCallback(() => {
    const systemNotifications = [];

    // تنبيهات انتهاء الصلاحية
    const materials = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS || 'materials') || '[]');
    const expiringMaterials = materials.filter(material => {
      if (!material.expiryDate) {
        return false;
      }
      const expiryDate = new Date(material.expiryDate);
      const today = new Date();
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
    });

    if (expiringMaterials.length > 0) {
      systemNotifications.push({
        type: 'warning',
        title: 'تنبيه انتهاء الصلاحية',
        message: `يوجد ${expiringMaterials.length} مادة ستنتهي صلاحيتها خلال 30 يوم`,
        category: 'expiry',
        data: expiringMaterials
      });
    }

    // تنبيهات نقص المخزون
    const lowStockMaterials = materials.filter(material => {
      const currentStock = material.currentStock || 0;
      const minStock = material.minStock || 10;
      return currentStock <= minStock;
    });

    if (lowStockMaterials.length > 0) {
      systemNotifications.push({
        type: 'error',
        title: 'تنبيه نقص المخزون',
        message: `يوجد ${lowStockMaterials.length} مادة تحتاج إلى إعادة تموين`,
        category: 'stock',
        data: lowStockMaterials
      });
    }

    // تنبيهات الفواتير المتأخرة
    const invoices = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES || 'invoices') || '[]');
    const overdueInvoices = invoices.filter(invoice => {
      if (invoice.status === 'مدفوعة كاملة') {
        return false;
      }
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today;
    });

    if (overdueInvoices.length > 0) {
      systemNotifications.push({
        type: 'warning',
        title: 'فواتير متأخرة',
        message: `يوجد ${overdueInvoices.length} فاتورة متأخرة السداد`,
        category: 'overdue',
        data: overdueInvoices
      });
    }

    // إضافة التنبيهات التلقائية
    systemNotifications.forEach(notification => {
      // التحقق من عدم وجود تنبيه مماثل
      const existingNotification = notifications.find(
        n => n.category === notification.category && !n.read && new Date() - new Date(n.timestamp) < 24 * 60 * 60 * 1000 // خلال 24 ساعة
      );

      if (!existingNotification) {
        addNotification(notification);
      }
    });
  }, [notifications, addNotification]);

  // فلترة التنبيهات
  const filterNotifications = useCallback(
    (filters = {}) => {
      let filtered = [...notifications];

      // فلترة حسب النوع
      if (filters.type) {
        filtered = filtered.filter(n => n.type === filters.type);
      }

      // فلترة حسب الفئة
      if (filters.category) {
        filtered = filtered.filter(n => n.category === filters.category);
      }

      // فلترة حسب حالة القراءة
      if (filters.read !== undefined) {
        filtered = filtered.filter(n => n.read === filters.read);
      }

      // فلترة حسب التاريخ
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(n => new Date(n.timestamp) >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filtered = filtered.filter(n => new Date(n.timestamp) <= toDate);
      }

      // فلترة حسب النص
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(
          n => n.title?.toLowerCase().includes(searchTerm) || n.message?.toLowerCase().includes(searchTerm)
        );
      }

      return filtered;
    },
    [notifications]
  );

  // الحصول على إحصائيات التنبيهات
  const getStatistics = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});

    const recent = notifications.filter(n => {
      const notificationDate = new Date(n.timestamp);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return notificationDate > oneDayAgo;
    }).length;

    return {
      total,
      unread,
      read: total - unread,
      byType,
      recent
    };
  }, [notifications]);

  // تشغيل التنبيهات التلقائية دورياً
  useEffect(() => {
    // تشغيل فوري
    createSystemNotifications();

    // تشغيل كل 30 دقيقة
    const interval = setInterval(createSystemNotifications, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [createSystemNotifications]);

  // تنظيف التنبيهات القديمة تلقائياً
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      setNotifications(prev => {
        const filtered = prev.filter(n => new Date(n.timestamp) > thirtyDaysAgo);
        if (filtered.length !== prev.length) {
          saveNotifications(filtered);
        }
        return filtered;
      });
    };

    // تنظيف عند التحميل
    cleanupOldNotifications();

    // تنظيف يومي
    const interval = setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [saveNotifications]);

  // تقسيم التنبيهات حسب الفترة الزمنية
  const getNotificationsByPeriod = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      today: notifications.filter(n => new Date(n.timestamp) >= today),
      yesterday: notifications.filter(n => {
        const nDate = new Date(n.timestamp);
        return nDate >= yesterday && nDate < today;
      }),
      thisWeek: notifications.filter(n => {
        const nDate = new Date(n.timestamp);
        return nDate >= weekAgo && nDate < yesterday;
      }),
      older: notifications.filter(n => new Date(n.timestamp) < weekAgo)
    };
  }, [notifications]);

  // إنشاء تنبيه مع إجراء
  const addActionableNotification = useCallback(
    (notification, actions = []) => {
      const actionableNotification = {
        ...notification,
        actions: actions.map(action => ({
          id: Date.now() + Math.random(),
          label: action.label,
          type: action.type || 'button',
          onClick: action.onClick,
          style: action.style || 'primary'
        }))
      };

      return addNotification(actionableNotification);
    },
    [addNotification]
  );

  // تنفيذ إجراء تنبيه
  const executeNotificationAction = useCallback(
    (notificationId, actionId) => {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && notification.actions) {
        const action = notification.actions.find(a => a.id === actionId);
        if (action && action.onClick) {
          action.onClick();
          // تحديد التنبيه كمقروء بعد تنفيذ الإجراء
          markAsRead(notificationId);
        }
      }
    },
    [notifications, markAsRead]
  );

  return {
    // البيانات
    notifications,
    unreadCount,
    isLoading,

    // الإجراءات الأساسية
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearRead,
    loadNotifications,

    // دوال مختصرة للأنواع
    success,
    error,
    warning,
    info,

    // دوال متقدمة
    filterNotifications,
    getStatistics,
    getNotificationsByPeriod,
    addActionableNotification,
    executeNotificationAction,
    createSystemNotifications
  };
};

export default useNotifications;
