import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X, Bell, Clock, AlertCircle } from 'lucide-react';
import { formatters } from '../../utils';

const Alert = ({
  type = 'info',
  title,
  message,
  actions = [],
  dismissible = true,
  autoClose = false,
  autoCloseDelay = 5000,
  onClose,
  className = '',
  size = 'md',
  icon: CustomIcon,
  timestamp,
  priority = 'normal'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000);

  // إغلاق تلقائي
  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      // عداد الوقت المتبقي
      const countdownTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  // تحديد الأيقونة والألوان حسب النوع
  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700'
      },
      error: {
        icon: XCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-700'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700'
      },
      critical: {
        icon: AlertCircle,
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        iconColor: 'text-red-700',
        titleColor: 'text-red-900',
        messageColor: 'text-red-800'
      }
    };

    return configs[type] || configs.info;
  };

  // تحديد حجم التنبيه
  const getSizeClasses = () => {
    const sizes = {
      sm: 'p-3 text-sm',
      md: 'p-4',
      lg: 'p-6 text-lg'
    };

    return sizes[size] || sizes.md;
  };

  // تحديد أولوية التنبيه
  const getPriorityClasses = () => {
    const priorities = {
      low: '',
      normal: '',
      high: 'ring-2 ring-offset-2',
      critical: 'ring-4 ring-offset-2 animate-pulse'
    };

    return priorities[priority] || priorities.normal;
  };

  const config = getTypeConfig();
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={`
      relative rounded-lg border transition-all duration-300
      ${config.bgColor} ${config.borderColor}
      ${getSizeClasses()}
      ${getPriorityClasses()}
      ${className}
    `}
    >
      {/* شريط الأولوية */}
      {priority === 'high' && (
        <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-orange-500 to-red-500 rounded-t-lg' />
      )}
      {priority === 'critical' && (
        <div className='absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-red-600 to-red-800 rounded-t-lg' />
      )}

      <div className='flex items-start gap-3'>
        {/* الأيقونة */}
        <div className='flex-shrink-0'>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        {/* المحتوى */}
        <div className='flex-1 min-w-0'>
          {/* العنوان والوقت */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1'>
              {title && <h4 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h4>}

              {/* الوقت */}
              {timestamp && (
                <div className='flex items-center gap-1 text-xs text-gray-500 mb-2'>
                  <Clock className='w-3 h-3' />
                  {formatters.datetime(timestamp, 'short', '24')}
                </div>
              )}
            </div>

            {/* زر الإغلاق */}
            {dismissible && (
              <button
                onClick={handleClose}
                className={`
                  flex-shrink-0 p-1 rounded-md transition-colors
                  ${config.iconColor} hover:bg-black hover:bg-opacity-10
                `}
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* الرسالة */}
          {message && <p className={`${config.messageColor} leading-relaxed`}>{message}</p>}

          {/* الإجراءات */}
          {actions.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-3'>
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1 text-sm font-medium rounded-md transition-colors
                    ${
                action.variant === 'primary'
                  ? `${config.iconColor} bg-white hover:bg-gray-50 border border-current`
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* عداد الإغلاق التلقائي */}
          {autoClose && timeLeft > 0 && (
            <div className='mt-3'>
              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <span>سيتم الإغلاق خلال {timeLeft} ثانية</span>
                <div className='flex-1 bg-gray-200 rounded-full h-1'>
                  <div
                    className='bg-gray-400 h-1 rounded-full transition-all duration-1000'
                    style={{ width: `${(timeLeft / (autoCloseDelay / 1000)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون مجموعة التنبيهات
export const AlertContainer = ({ alerts = [], className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert, index) => (
        <Alert key={alert.id || index} {...alert} />
      ))}
    </div>
  );
};

// مكون تنبيه مضمن في الصفحة
export const InlineAlert = ({ children, ...props }) => {
  return (
    <Alert {...props} className={`mb-4 ${props.className || ''}`}>
      {children}
    </Alert>
  );
};

export default Alert;
