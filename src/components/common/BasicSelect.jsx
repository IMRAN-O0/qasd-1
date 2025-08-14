import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * مكون Select بسيط يدعم children (option elements)
 * يحل مشكلة عدم ظهور الخيارات في القوائم المنسدلة
 */
const BasicSelect = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      children,
      placeholder = 'اختر...',
      disabled = false,
      required = false,
      error,
      helperText,
      className = '',
      name,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`relative ${className}`}>
        {/* التسمية */}
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium mb-1 ${
              error ? 'text-red-700' : 'text-gray-700'
            } ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
          >
            {label}
          </label>
        )}

        {/* حقل الاختيار */}
        <div className='relative'>
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`
            w-full px-3 py-2 pr-10 border rounded-lg
            bg-white text-gray-900 text-right
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            appearance-none
          `}
            {...props}
          >
            {placeholder && (
              <option value='' disabled={!!value}>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* أيقونة السهم */}
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <ChevronDown className={`h-4 w-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>

        {/* رسائل الخطأ والمساعدة */}
        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
      </div>
    );
  }
);

BasicSelect.displayName = 'BasicSelect';

export default BasicSelect;
