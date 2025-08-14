import React, { useState, useMemo, useCallback } from 'react';
import { Button, Input, Select, Loading, Empty, Badge } from './index';
import { formatters } from '../../utils';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';

/**
 * مكون الجدول المتقدم
 * يوفر ميزات شاملة لعرض وإدارة البيانات
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  pagination = true,
  pageSize = 10,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  actions = [],
  onRowClick,
  onSelectionChange,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  emptyMessage = 'لا توجد بيانات للعرض',
  className = '',
  rowClassName,
  cellClassName,
  headerClassName = '',
  showHeader = true,
  showFooter = true,
  stickyHeader = false,
  virtualScroll = false,
  expandable = false,
  renderExpandedRow,
  filters = {},
  onFiltersChange,
  searchTerm = '',
  onSearchChange,
  sortConfig = { field: null, direction: 'asc' },
  onSortChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSortConfig, setLocalSortConfig] = useState(sortConfig);
  const [showFilters, setShowFilters] = useState(false);

  // معالجة البيانات (البحث، الفلترة، الترتيب)
  const processedData = useMemo(() => {
    let result = [...data];

    // البحث
    const searchValue = onSearchChange ? searchTerm : localSearchTerm;
    if (searchValue && searchable) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          if (!column.searchable) {
            return false;
          }
          const value = getNestedValue(row, column.key);
          return String(value || '')
            .toLowerCase()
            .includes(searchLower);
        });
      });
    }

    // الفلترة
    const activeFilters = onFiltersChange ? filters : localFilters;
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter(row => {
        return Object.entries(activeFilters).every(([key, value]) => {
          if (!value) {
            return true;
          }
          const rowValue = getNestedValue(row, key);

          if (Array.isArray(value)) {
            return value.includes(rowValue);
          }

          if (typeof value === 'object' && value.from && value.to) {
            const rowDate = new Date(rowValue);
            const fromDate = new Date(value.from);
            const toDate = new Date(value.to);
            return rowDate >= fromDate && rowDate <= toDate;
          }

          return String(rowValue || '')
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      });
    }

    // الترتيب
    const sortField = onSortChange ? sortConfig.field : localSortConfig.field;
    const sortDirection = onSortChange ? sortConfig.direction : localSortConfig.direction;

    if (sortField && sortable) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortField);
        const bValue = getNestedValue(b, sortField);

        if (aValue === null || aValue === undefined) {
          return 1;
        }
        if (bValue === null || bValue === undefined) {
          return -1;
        }

        let comparison = 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue), 'ar');
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [
    data,
    columns,
    searchTerm,
    localSearchTerm,
    filters,
    localFilters,
    sortConfig,
    localSortConfig,
    searchable,
    onSearchChange,
    onFiltersChange,
    onSortChange
  ]);

  // التصفح
  const paginatedData = useMemo(() => {
    if (!pagination) {
      return processedData;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  // الحصول على قيمة متداخلة من الكائن
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // معالج البحث
  const handleSearch = useCallback(
    value => {
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        setLocalSearchTerm(value);
      }
      setCurrentPage(1);
    },
    [onSearchChange]
  );

  // معالج الفلترة
  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...localFilters, [key]: value };
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      } else {
        setLocalFilters(newFilters);
      }
      setCurrentPage(1);
    },
    [localFilters, onFiltersChange]
  );

  // معالج الترتيب
  const handleSort = useCallback(
    field => {
      const currentSort = onSortChange ? sortConfig : localSortConfig;
      const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
      const newSortConfig = { field, direction: newDirection };

      if (onSortChange) {
        onSortChange(newSortConfig);
      } else {
        setLocalSortConfig(newSortConfig);
      }
    },
    [sortConfig, localSortConfig, onSortChange]
  );

  // معالج تحديد الصفوف
  const handleRowSelection = useCallback(
    (rowId, selected) => {
      const newSelection = new Set(selectedRows);
      if (selected) {
        newSelection.add(rowId);
      } else {
        newSelection.delete(rowId);
      }
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    },
    [selectedRows, onSelectionChange]
  );

  // معالج تحديد الكل
  const handleSelectAll = useCallback(
    selected => {
      const newSelection = selected ? new Set(paginatedData.map(row => row.id)) : new Set();
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    },
    [paginatedData, onSelectionChange]
  );

  // معالج توسيع الصف
  const handleRowExpand = useCallback(
    rowId => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(rowId)) {
        newExpanded.delete(rowId);
      } else {
        newExpanded.add(rowId);
      }
      setExpandedRows(newExpanded);
    },
    [expandedRows]
  );

  // رندر خلية الجدول
  const renderCell = (row, column) => {
    const value = getNestedValue(row, column.key);

    if (column.render) {
      return column.render(value, row);
    }

    if (column.format && formatters[column.format]) {
      return formatters[column.format](value);
    }

    if (column.type === 'badge') {
      return (
        <Badge variant={column.badgeVariant?.(value) || 'default'} className={column.badgeClassName}>
          {value}
        </Badge>
      );
    }

    if (column.type === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'نعم' : 'لا'}
        </span>
      );
    }

    return value || '-';
  };

  // رندر أيقونة الترتيب
  const renderSortIcon = column => {
    const currentSort = onSortChange ? sortConfig : localSortConfig;
    if (!sortable || !column.sortable || currentSort.field !== column.key) {
      return null;
    }

    return currentSort.direction === 'asc' ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />;
  };

  // رندر شريط الأدوات
  const renderToolbar = () => (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {searchable && (
          <div className='relative'>
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='البحث...'
              value={onSearchChange ? searchTerm : localSearchTerm}
              onChange={handleSearch}
              className='pr-10 w-64'
            />
          </div>
        )}

        {filterable && (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Filter className='w-4 h-4 ml-2' />
            فلترة
          </Button>
        )}

        {onRefresh && (
          <Button variant='outline' size='sm' onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        )}
      </div>

      <div className='flex items-center gap-2'>
        {onExport && (
          <Button variant='outline' size='sm' onClick={onExport}>
            <Download className='w-4 h-4 ml-2' />
            تصدير
          </Button>
        )}

        {onAdd && (
          <Button variant='primary' size='sm' onClick={onAdd}>
            <Plus className='w-4 h-4 ml-2' />
            إضافة
          </Button>
        )}
      </div>
    </div>
  );

  // رندر الفلاتر
  const renderFilters = () => {
    if (!showFilters || !filterable) {
      return null;
    }

    const filterableColumns = columns.filter(col => col.filterable);

    return (
      <div className='bg-gray-50 p-4 rounded-lg mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filterableColumns.map(column => {
            const filterValue = (onFiltersChange ? filters : localFilters)[column.key] || '';

            if (column.filterType === 'select') {
              return (
                <div key={column.key}>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>{column.title}</label>
                  <Select
                    value={filterValue}
                    onChange={value => handleFilterChange(column.key, value)}
                    options={column.filterOptions || []}
                    placeholder={`اختر ${column.title}`}
                  />
                </div>
              );
            }

            return (
              <div key={column.key}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>{column.title}</label>
                <Input
                  value={filterValue}
                  onChange={value => handleFilterChange(column.key, value)}
                  placeholder={`فلترة حسب ${column.title}`}
                />
              </div>
            );
          })}
        </div>

        <div className='flex justify-end mt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              if (onFiltersChange) {
                onFiltersChange({});
              } else {
                setLocalFilters({});
              }
            }}
          >
            مسح الفلاتر
          </Button>
        </div>
      </div>
    );
  };

  // رندر التصفح
  const renderPagination = () => {
    if (!pagination || totalPages <= 1) {
      return null;
    }

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className='flex items-center justify-between mt-4'>
        <div className='text-sm text-gray-700'>
          عرض {(currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, processedData.length)} من{' '}
          {processedData.length} نتيجة
        </div>

        <div className='flex items-center space-x-1 space-x-reverse'>
          <Button variant='outline' size='sm' onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            الأولى
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            السابقة
          </Button>

          {pages.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            التالية
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            الأخيرة
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loading size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <div className='text-red-600 mb-4'>{error}</div>
        {onRefresh && (
          <Button variant='outline' onClick={onRefresh}>
            إعادة المحاولة
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`}>
      {renderToolbar()}
      {renderFilters()}

      <div className={`overflow-x-auto ${stickyHeader ? 'max-h-96 overflow-y-auto' : ''}`}>
        <table className='min-w-full divide-y divide-gray-200'>
          {showHeader && (
            <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''} ${headerClassName}`}>
              <tr>
                {selectable && (
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <input
                      type='checkbox'
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                )}

                {expandable && (
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
                )}

                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => sortable && column.sortable && handleSort(column.key)}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{column.title}</span>
                      {renderSortIcon(column)}
                    </div>
                  </th>
                ))}

                {actions.length > 0 && (
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    الإجراءات
                  </th>
                )}
              </tr>
            </thead>
          )}

          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className='px-6 py-12'
                >
                  <Empty message={emptyMessage} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <React.Fragment key={row.id || index}>
                  <tr
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${
                      typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName || ''
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <input
                          type='checkbox'
                          checked={selectedRows.has(row.id)}
                          onChange={e => handleRowSelection(row.id, e.target.checked)}
                          onClick={e => e.stopPropagation()}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </td>
                    )}

                    {expandable && (
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={e => {
                            e.stopPropagation();
                            handleRowExpand(row.id);
                          }}
                        >
                          {expandedRows.has(row.id) ? (
                            <ChevronUp className='w-4 h-4' />
                          ) : (
                            <ChevronDown className='w-4 h-4' />
                          )}
                        </Button>
                      </td>
                    )}

                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          typeof cellClassName === 'function' ? cellClassName(row, column, index) : cellClassName || ''
                        }`}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}

                    {actions.length > 0 && (
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center space-x-2 space-x-reverse'>
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size='sm'
                              onClick={e => {
                                e.stopPropagation();
                                action.onClick?.(row);
                              }}
                              disabled={action.disabled?.(row)}
                              className={action.className}
                            >
                              {action.icon && <action.icon className='w-4 h-4' />}
                              {action.label && <span className='mr-1'>{action.label}</span>}
                            </Button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>

                  {expandable && expandedRows.has(row.id) && renderExpandedRow && (
                    <tr>
                      <td
                        colSpan={columns.length + (selectable ? 1 : 0) + 1 + (actions.length > 0 ? 1 : 0)}
                        className='px-6 py-4 bg-gray-50'
                      >
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFooter && renderPagination()}
    </div>
  );
};

export default DataTable;
