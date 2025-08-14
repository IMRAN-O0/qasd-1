import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses =
    'btn inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'btn-primary bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'btn-secondary bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'btn-success bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'btn-danger bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'btn-warning bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    outline: 'btn-outline border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'btn-ghost text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
  };

  const sizes = {
    xs: 'btn-xs px-2 py-1 text-xs',
    sm: 'btn-sm px-3 py-1.5 text-sm',
    md: 'btn-md px-4 py-2 text-sm',
    lg: 'btn-lg px-6 py-3 text-base',
    xl: 'btn-xl px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  let iconNode = null;
  if (loading) {
    iconNode = <Loader2 className='w-4 h-4 animate-spin ml-2' />;
  } else if (icon) {
    // icon can be a React component (function) or a React element (object)
    iconNode = typeof icon === 'function' ? React.createElement(icon, { className: 'w-4 h-4 ml-2' }) :
      React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-4 h-4 ml-2' }) : null;
  }

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} ${loading ? 'loading' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {iconNode}
      {children}
    </button>
  );
});

export default Button;
