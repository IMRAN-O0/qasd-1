import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      success = false,
      helperText,
      required = false,
      icon,
      endIcon,
      className = '',
      containerClassName = '',
      variant = 'input',
      validator,
      id,
      type = 'text',
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    const iconNode = icon
      ? (typeof icon === 'function'
        ? icon({ className: 'h-5 w-5 text-gray-400', 'data-testid': 'input-icon' })
        : (React.isValidElement(icon) ? React.cloneElement(icon, { className: 'h-5 w-5 text-gray-400', 'data-testid': 'input-icon' }) : null))
      : null;

    const endIconNode = endIcon
      ? (typeof endIcon === 'function'
        ? endIcon({ className: 'h-5 w-5 text-gray-400' })
        : (React.isValidElement(endIcon) ? React.cloneElement(endIcon, { className: 'h-5 w-5 text-gray-400' }) : null))
      : null;

    const commonClasses = `
            w-full px-3 py-2 border rounded-lg transition-colors
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${iconNode ? 'pr-10' : ''}
            ${endIconNode ? 'pl-10' : ''}
            ${hasError ? 'error border-red-500 focus:ring-red-500' : success ? 'success border-green-500 focus:ring-green-500' : 'border-gray-300'}
            ${className}
          `;

    const handleChange = e => {
      if (onChange) onChange(e);
    };

    const handleBlur = e => {
      if (validator) {
        validator(e.target.value);
      }
      if (onBlur) onBlur(e);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className='block text-sm font-medium text-gray-700 mb-2'>
            {label} {required && <span className='text-red-500'>*</span>}
          </label>
        )}

        <div className='relative'>
          {iconNode && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              {iconNode}
            </div>
          )}

          {variant === 'textarea' ? (
            <textarea
              id={inputId}
              ref={ref}
              className={commonClasses}
              onChange={handleChange}
              onBlur={handleBlur}
              {...props}
            />
          ) : (
            <input
              id={inputId}
              ref={ref}
              type={type}
              className={commonClasses}
              onChange={handleChange}
              onBlur={handleBlur}
              {...props}
            />
          )}

          {endIconNode && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {endIconNode}
            </div>
          )}
        </div>

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
