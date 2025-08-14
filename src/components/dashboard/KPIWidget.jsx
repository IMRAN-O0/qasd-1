import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPIWidget = ({
  title,
  value,
  previousValue,
  unit = '',
  icon: Icon,
  color = 'blue',
  format = 'number',
  loading = false
}) => {
  const calculateChange = () => {
    if (!previousValue || previousValue === 0) {
      return { percentage: 0, trend: 'neutral' };
    }
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const formatValue = val => {
    if (format === 'currency') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return new Intl.NumberFormat('ar-SA').format(val);
  };

  const { percentage, trend } = calculateChange();

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const TrendIcon = trendIcons[trend];

  if (loading) {
    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} animate-pulse`}>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-8 h-8 bg-gray-300 rounded'></div>
          <div className='w-16 h-4 bg-gray-300 rounded'></div>
        </div>
        <div className='w-24 h-8 bg-gray-300 rounded mb-2'></div>
        <div className='w-32 h-4 bg-gray-300 rounded'></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} hover:shadow-lg transition-shadow duration-200`}>
      <div className='flex items-center justify-between mb-4'>
        {Icon && <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />}
        <div className='flex items-center space-x-2 space-x-reverse'>
          <TrendIcon className={`w-4 h-4 ${trendColors[trend]}`} />
          <span className={`text-sm font-medium ${trendColors[trend]}`}>{percentage.toFixed(1)}%</span>
        </div>
      </div>

      <div className='mb-2'>
        <div className='text-3xl font-bold text-gray-900'>
          {formatValue(value)}
          {unit && <span className='text-lg text-gray-600 mr-1'>{unit}</span>}
        </div>
      </div>

      <div className='text-sm text-gray-600'>{title}</div>

      {previousValue && (
        <div className='text-xs text-gray-500 mt-1'>
          السابق: {formatValue(previousValue)}
          {unit}
        </div>
      )}
    </div>
  );
};

export default KPIWidget;
