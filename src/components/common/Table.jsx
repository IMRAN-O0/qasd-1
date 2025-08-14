import React from 'react';

// مكون الجدول الرئيسي
export const Table = ({ children, className = '', striped = false, bordered = false }) => {
  const baseClasses = 'min-w-full divide-y divide-gray-200';
  const stripedClasses = striped ? 'divide-y divide-gray-200' : '';
  const borderedClasses = bordered ? 'border border-gray-200' : '';

  return (
    <div className='overflow-x-auto'>
      <table className={`${baseClasses} ${stripedClasses} ${borderedClasses} ${className}`}>{children}</table>
    </div>
  );
};

// رأس الجدول
export const TableHead = ({ children, className = '' }) => {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
};

// جسم الجدول
export const TableBody = ({ children, className = '' }) => {
  return <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>{children}</tbody>;
};

// صف الجدول
export const TableRow = ({ children, className = '', onClick, hover = false }) => {
  const hoverClasses = hover ? 'hover:bg-gray-50' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <tr className={`${hoverClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </tr>
  );
};

// خلية رأس الجدول
export const TableHeader = ({ children, className = '', sortable = false, onSort }) => {
  const sortableClasses = sortable ? 'cursor-pointer hover:bg-gray-100' : '';

  return (
    <th
      className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${sortableClasses} ${className}`}
      onClick={sortable ? onSort : undefined}
    >
      {children}
    </th>
  );
};

// خلية الجدول
export const TableCell = ({ children, className = '' }) => {
  return <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>{children}</td>;
};

// مكون الجدول الكامل مع جميع الأجزاء
const TableComponent = Object.assign(Table, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Header: TableHeader,
  Cell: TableCell
});

export default TableComponent;
