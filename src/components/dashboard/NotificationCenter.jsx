import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSocket } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Listen for real-time notifications
    if (socket) {
      socket.on('notification', handleNewNotification);
      socket.on('inventory_alert', handleInventoryAlert);
      socket.on('production_update', handleProductionUpdate);
      socket.on('quality_alert', handleQualityAlert);
      socket.on('safety_incident', handleSafetyIncident);
    }

    return () => {
      if (socket) {
        socket.off('notification');
        socket.off('inventory_alert');
        socket.off('production_update');
        socket.off('quality_alert');
        socket.off('safety_incident');
      }
    };
  }, [socket]);

  const loadNotifications = () => {
    // Mock notifications - replace with API call
    const mockNotifications = [
      {
        id: 1,
        type: 'warning',
        title: 'مستوى المخزون منخفض',
        message: 'مادة البولي إيثيلين أقل من الحد الأدنى (50 كجم متبقي)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionUrl: '/inventory/view'
      },
      {
        id: 2,
        type: 'success',
        title: 'اكتمال دفعة الإنتاج',
        message: 'تم إنتاج 1000 وحدة من المنتج A بنجاح',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionUrl: '/production/batch-record'
      },
      {
        id: 3,
        type: 'error',
        title: 'فشل في فحص الجودة',
        message: 'عينة من الدفعة #2024-001 لم تجتز معايير الجودة',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/quality/final-product'
      },
      {
        id: 4,
        type: 'info',
        title: 'صيانة مجدولة',
        message: 'صيانة دورية للمعدة رقم 5 مجدولة غداً الساعة 9:00 ص',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/production/equipment-maintenance'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const handleNewNotification = notification => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleInventoryAlert = data => {
    const notification = {
      id: Date.now(),
      type: 'warning',
      title: 'تنبيه مخزون',
      message: data.message,
      timestamp: new Date(),
      read: false,
      actionUrl: '/inventory/view'
    };
    handleNewNotification(notification);
  };

  const handleProductionUpdate = data => {
    const notification = {
      id: Date.now(),
      type: 'info',
      title: 'تحديث الإنتاج',
      message: data.message,
      timestamp: new Date(),
      read: false,
      actionUrl: '/production/batch-record'
    };
    handleNewNotification(notification);
  };

  const handleQualityAlert = data => {
    const notification = {
      id: Date.now(),
      type: 'error',
      title: 'تنبيه جودة',
      message: data.message,
      timestamp: new Date(),
      read: false,
      actionUrl: '/quality/final-product'
    };
    handleNewNotification(notification);
  };

  const handleSafetyIncident = data => {
    const notification = {
      id: Date.now(),
      type: 'error',
      title: 'حادث سلامة',
      message: data.message,
      timestamp: new Date(),
      read: false,
      actionUrl: '/safety/incident'
    };
    handleNewNotification(notification);
  };

  const markAsRead = id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = id => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = type => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const getTypeStyles = type => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = timestamp => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'الآن';
    }
    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    }
    if (hours < 24) {
      return `منذ ${hours} ساعة`;
    }
    return `منذ ${days} يوم`;
  };

  return (
    <div className='relative'>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
      >
        <Bell className='w-6 h-6' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className='absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>الإشعارات</h3>
            <div className='flex items-center space-x-2 space-x-reverse'>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className='text-sm text-blue-600 hover:text-blue-800'>
                  تحديد الكل كمقروء
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600'>
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>
                <Bell className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map(notification => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className='flex items-start space-x-3 space-x-reverse'>
                      <div className={`p-2 rounded-lg ${getTypeStyles(notification.type)}`}>
                        <Icon className='w-4 h-4' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h4
                            className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className='text-gray-400 hover:text-gray-600'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>
                        <div className='flex items-center justify-between mt-2'>
                          <span className='text-xs text-gray-500 flex items-center'>
                            <Clock className='w-3 h-3 ml-1' />
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className='text-xs text-blue-600 hover:text-blue-800'
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='p-3 border-t border-gray-200 text-center'>
              <button className='text-sm text-blue-600 hover:text-blue-800'>عرض جميع الإشعارات</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
