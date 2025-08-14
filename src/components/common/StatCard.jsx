import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatters } from '../../utils';

const StatCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  color = 'blue',
  format = 'number',
  suffix = '',
  prefix = '',
  trend = true,
  loading = false,
  onClick,
  className = ''
}) => {
  // حساب النسبة المئوية للتغيير
  const calculateChange = () => {
    if (!previousValue || !value || previousValue === 0) {
      return null;
    }

    const change = ((value - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  };

  // تنسيق القيمة حسب النوع
  const formatValue = val => {
    if (loading || val === null || val === undefined) {
      return '---';
    }

    switch (format) {
      case 'currency':
        return formatters.currency(val);
      case 'percentage':
        return formatters.percentage(val);
      case 'number':
        return formatters.number(val);
      case 'decimal':
        return formatters.number(val, 2);
      default:
        return val;
    }
  };

  const change = calculateChange();

  // ألوان الكارت
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50',
    gray: 'border-gray-200 bg-gray-50'
  };

  // ألوان الأيقونة
  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  // ألوان الاتجاه
  const trendColorClasses = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    same: 'text-gray-600 bg-gray-100'
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg border-2 p-6 transition-all duration-200
        ${colorClasses[color]}
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      )}

      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {/* العنوان */}
          <p className='text-sm font-medium text-gray-600 mb-2'>{title}</p>

          {/* القيمة الرئيسية */}
          <div className='flex items-baseline gap-2'>
            {prefix && <span className='text-lg text-gray-500'>{prefix}</span>}
            <p className='text-3xl font-bold text-gray-900'>{formatValue(value)}</p>
            {suffix && <span className='text-lg text-gray-500'>{suffix}</span>}
          </div>

          {/* مؤشر التغيير */}
          {trend && change && (
            <div className='flex items-center gap-2 mt-3'>
              <div
                className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${trendColorClasses[change.direction]}
              `}
              >
                {change.direction === 'up' && <TrendingUp className='w-3 h-3' />}
                {change.direction === 'down' && <TrendingDown className='w-3 h-3' />}
                {change.direction === 'same' && <Minus className='w-3 h-3' />}
                {formatters.percentage(change.percentage, 1)}
              </div>
              <span className='text-xs text-gray-500'>مقارنة بالفترة السابقة</span>
            </div>
          )}
        </div>

        {/* الأيقونة */}
        {Icon && (
          <div
            className={`
            p-3 rounded-lg
            ${iconColorClasses[color]}
          `}
          >
            <Icon className='w-6 h-6' />
          </div>
        )}
      </div>
    </div>
  );
};

// مكون مجموعة الإحصائيات
export const StatGrid = ({ stats, loading = false, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={stat.key || index} {...stat} loading={loading} />
      ))}
    </div>
  );
};

export default StatCard;
