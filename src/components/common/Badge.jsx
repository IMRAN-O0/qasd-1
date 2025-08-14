import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '', icon: Icon }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800'
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
    xl: 'px-4 py-1.5 text-base'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon className='w-3 h-3 ml-1' />}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, customColors = {} }) => {
  const statusMap = {
    active: { variant: 'success', text: 'نشط' },
    inactive: { variant: 'danger', text: 'غير نشط' },
    pending: { variant: 'warning', text: 'في الانتظار' },
    completed: { variant: 'success', text: 'مكتمل' },
    cancelled: { variant: 'danger', text: 'ملغي' },
    draft: { variant: 'secondary', text: 'مسودة' },
    ...customColors
  };

  const config = statusMap[status] || { variant: 'default', text: status };

  return <Badge variant={config.variant}>{config.text}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const priorityMap = {
    low: { variant: 'info', text: 'منخفض' },
    medium: { variant: 'warning', text: 'متوسط' },
    high: { variant: 'danger', text: 'عالي' },
    critical: { variant: 'danger', text: 'حرج' }
  };

  const config = priorityMap[priority] || { variant: 'default', text: priority };

  return <Badge variant={config.variant}>{config.text}</Badge>;
};

export default Badge;
