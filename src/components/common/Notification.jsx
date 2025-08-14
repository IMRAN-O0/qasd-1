import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';

// مكون التنبيه الفردي
const Notification = ({
  id,
  type = 'info',
  title = '',
  message = '',
  duration = 5000,
  position = 'top-right',
  closable = true,
  onClose = () => {},
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) {
    return null;
  }

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto
        ${getPositionClasses()}
        ${config.bgColor} ${config.borderColor} border
        transform transition-all duration-300 ease-in-out
        ${isRemoving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${className}
      `}
      {...props}
    >
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className='mr-3 mr-reverse w-0 flex-1'>
            {title && <p className={`text-sm font-medium ${config.titleColor}`}>{title}</p>}
            {message && <p className={`text-sm ${config.messageColor} ${title ? 'mt-1' : ''}`}>{message}</p>}
          </div>
          {closable && (
            <div className='mr-4 mr-reverse flex-shrink-0 flex'>
              <button
                className={`rounded-md inline-flex ${config.iconColor} hover:opacity-75 focus:outline-none`}
                onClick={handleClose}
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون إدارة التنبيهات
const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = notification => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // تعريض الدوال للاستخدام العام
  React.useEffect(() => {
    window.notification = {
      success: (title, message, options = {}) => addNotification({ type: 'success', title, message, ...options }),
      error: (title, message, options = {}) => addNotification({ type: 'error', title, message, ...options }),
      warning: (title, message, options = {}) => addNotification({ type: 'warning', title, message, ...options }),
      info: (title, message, options = {}) => addNotification({ type: 'info', title, message, ...options }),
      remove: removeNotification,
      clear: clearAll
    };

    return () => {
      delete window.notification;
    };
  }, []);

  return (
    <div>
      {notifications.map(notification => (
        <Notification key={notification.id} {...notification} onClose={removeNotification} />
      ))}
    </div>
  );
};

// مكون قائمة التنبيهات
const NotificationList = ({
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClear = () => {},
  className = '',
  maxHeight = '400px',
  ...props
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return <CheckCircle className='text-green-500' size={16} />;
      case 'error':
        return <AlertCircle className='text-red-500' size={16} />;
      case 'warning':
        return <AlertTriangle className='text-yellow-500' size={16} />;
      default:
        return <Info className='text-blue-500' size={16} />;
    }
  };

  const formatTime = timestamp => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;

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
    <div className={`bg-white rounded-lg shadow-lg border ${className}`} {...props}>
      {/* رأس القائمة */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-2'>
          <Bell size={20} className='text-gray-600' />
          <h3 className='font-medium text-gray-900'>التنبيهات</h3>
          {unreadCount > 0 && (
            <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center'>
              {unreadCount}
            </span>
          )}
        </div>
        <div className='flex gap-2'>
          {unreadCount > 0 && (
            <button onClick={onMarkAllAsRead} className='text-sm text-blue-600 hover:text-blue-800'>
              تحديد الكل كمقروء
            </button>
          )}
          <button onClick={onClear} className='text-sm text-gray-600 hover:text-gray-800'>
            مسح الكل
          </button>
        </div>
      </div>

      {/* قائمة التنبيهات */}
      <div className='overflow-y-auto' style={{ maxHeight }}>
        {notifications.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <Bell size={48} className='mx-auto mb-4 text-gray-300' />
            <p>لا توجد تنبيهات</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`
                p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors
                ${!notification.read ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''}
              `}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className='flex items-start gap-3'>
                <div className='flex-shrink-0 mt-1'>{getNotificationIcon(notification.type)}</div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>{notification.title}</p>
                  {notification.message && <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>}
                  <p className='text-xs text-gray-400 mt-2'>{formatTime(notification.timestamp)}</p>
                </div>
                {!notification.read && (
                  <div className='flex-shrink-0'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Hook للتنبيهات
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = notification => {
    const id = Date.now() + Math.random();
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  };

  const removeNotification = id => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const success = (title, message, options = {}) => addNotification({ type: 'success', title, message, ...options });

  const error = (title, message, options = {}) => addNotification({ type: 'error', title, message, ...options });

  const warning = (title, message, options = {}) => addNotification({ type: 'warning', title, message, ...options });

  const info = (title, message, options = {}) => addNotification({ type: 'info', title, message, ...options });

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    success,
    error,
    warning,
    info
  };
};

Notification.Manager = NotificationManager;
Notification.List = NotificationList;
Notification.useNotifications = useNotifications;

export default Notification;
