import React from 'react';

export const Card = ({
  children,
  className = '',
  padding = true,
  shadow = 'sm',
  hover = false,
  border = true,
  rounded = true
}) => {
  const baseClasses = 'bg-white';

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const classes = [
    baseClasses,
    shadowClasses[shadow],
    border ? 'border border-gray-200' : '',
    rounded ? 'rounded-lg' : '',
    padding ? 'p-6' : '',
    hover ? 'hover:shadow-md transition-shadow duration-200' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

export default Card;
