import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

export const Loading = ({ size = 'md', text = 'جاري التحميل...', variant = 'spinner', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const SpinnerIcon = variant === 'refresh' ? RefreshCw : Loader2;

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <SpinnerIcon className={`animate-spin text-blue-600 ${sizes[size]} mb-4`} />
      {text && <p className={`text-gray-600 ${textSizes[size]} text-center`}>{text}</p>}
    </div>
  );
};

export const LoadingOverlay = ({ isLoading, children, text = 'جاري التحميل...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};

export const LoadingButton = ({ loading = false, children, disabled = false, ...props }) => {
  return (
    <button
      disabled={disabled || loading}
      className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
      {...props}
    >
      {loading && <Loader2 className='animate-spin -ml-1 mr-2 h-4 w-4' />}
      {children}
    </button>
  );
};

export const LoadingSkeleton = ({ lines = 3, className = '', animated = true }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded ${
            animated ? 'animate-pulse' : ''
          } ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600'
  };

  return <Loader2 className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`} />;
};

export default Loading;
