import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  RefreshCw,
  Plus,
  Calendar,
  FileText,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Archive,
  Copy,
  ExternalLink,
  Columns,
  SortAsc,
  SortDesc,
  ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdvancedDataTable = ({
  data = [],
  columns = [],
  title = '',
  loading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  onBulkAction,
  enableSelection = true,
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  enableColumnToggle = true,
  enableInlineEdit = false,
  pageSize = 10,
  customActions = [],
  emptyMessage = 'لا توجد بيانات للعرض',
  searchPlaceholder = 'البحث...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
  );
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [bulkActionDropdown, setBulkActionDropdown] = useState(false);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col => {
          if (!visibleColumns[col.key]) {
            return false;
          }
          const value = row[col.key];
          if (value == null) {
            return false;
          }
          return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        result = result.filter(row => {
          const value = row[key];
          if (filterValue.type === 'date') {
            const rowDate = new Date(value);
            const fromDate = filterValue.from ? new Date(filterValue.from) : null;
            const toDate = filterValue.to ? new Date(filterValue.to) : null;

            if (fromDate && rowDate < fromDate) {
              return false;
            }
            if (toDate && rowDate > toDate) {
              return false;
            }
            return true;
          }
          return value === filterValue || (Array.isArray(filterValue) && filterValue.includes(value));
        });
      }
    });

    return result;
  }, [data, searchTerm, filters, columns, visibleColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) {
        return 0;
      }
      if (aValue == null) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      if (bValue == null) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();

      if (aStr < bStr) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle row selection
  const handleRowSelect = (rowId, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
  };

  // Handle select all
  const handleSelectAll = checked => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Handle inline editing
  const handleCellEdit = (rowId, columnKey, value) => {
    setEditingCell({ rowId, columnKey });
    setEditValue(value || '');
  };

  const handleCellSave = () => {
    if (editingCell && onEdit) {
      onEdit(editingCell.rowId, { [editingCell.columnKey]: editValue });
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = sortedData.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        if (visibleColumns[col.key]) {
          exportRow[col.header] = row[col.key];
        }
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${title || 'data'}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 20, 20);
    }

    // Prepare table data
    const headers = columns.filter(col => visibleColumns[col.key]).map(col => col.header);

    const rows = sortedData.map(row => columns.filter(col => visibleColumns[col.key]).map(col => row[col.key] || ''));

    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: title ? 30 : 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`${title || 'data'}.pdf`);
  };

  // Bulk actions
  const bulkActions = [
    { id: 'delete', label: 'حذف المحدد', icon: Trash2, color: 'text-red-600' },
    { id: 'archive', label: 'أرشفة المحدد', icon: Archive, color: 'text-yellow-600' },
    { id: 'export', label: 'تصدير المحدد', icon: Download, color: 'text-blue-600' },
    ...customActions
  ];

  const handleBulkActionClick = actionId => {
    if (onBulkAction) {
      onBulkAction(actionId, Array.from(selectedRows));
    }
    setBulkActionDropdown(false);
    setSelectedRows(new Set());
  };

  // Get unique values for filter options
  const getFilterOptions = columnKey => {
    const uniqueValues = [...new Set(data.map(row => row[columnKey]).filter(Boolean))];
    return uniqueValues.map(value => ({ value, label: value }));
  };

  // Render cell content
  const renderCellContent = (row, column) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === column.key;

    if (isEditing && enableInlineEdit && column.editable) {
      return (
        <div className='flex items-center gap-1'>
          <input
            type={column.type || 'text'}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleCellSave();
              }
              if (e.key === 'Escape') {
                handleCellCancel();
              }
            }}
            autoFocus
          />
          <button onClick={handleCellSave} className='text-green-600 hover:text-green-700'>
            <Check className='w-4 h-4' />
          </button>
          <button onClick={handleCellCancel} className='text-red-600 hover:text-red-700'>
            <X className='w-4 h-4' />
          </button>
        </div>
      );
    }

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === 'date' && value) {
      return new Intl.DateTimeFormat('ar-SA').format(new Date(value));
    }

    if (column.type === 'currency' && value != null) {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
      }).format(value);
    }

    if (column.type === 'number' && value != null) {
      return new Intl.NumberFormat('ar-SA').format(value);
    }

    if (column.type === 'badge' && value) {
      const badgeConfig = column.badgeConfig || {};
      const colorClass = badgeConfig[value] || 'bg-gray-100 text-gray-800';
      return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{value}</span>;
    }

    return value || '-';
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className='p-6'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='h-4 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex justify-between items-center mb-4'>
          <div>
            {title && <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>}
            <p className='text-sm text-gray-500 mt-1'>
              عرض {paginatedData.length} من {sortedData.length} عنصر
              {selectedRows.size > 0 && ` (${selectedRows.size} محدد)`}
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {onAdd && (
              <button
                onClick={onAdd}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                إضافة جديد
              </button>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className='p-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                <RefreshCw className='w-4 h-4' />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className='flex flex-wrap gap-4 items-center'>
          {enableSearch && (
            <div className='relative flex-1 min-w-64'>
              <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          )}

          <div className='flex items-center gap-2'>
            {enableFilters && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-600'
                }`}
              >
                <Filter className='w-4 h-4' />
              </button>
            )}

            {enableColumnToggle && (
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className='p-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                <Columns className='w-4 h-4' />
              </button>
            )}

            {enableExport && (
              <div className='relative'>
                <button className='p-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 group'>
                  <Download className='w-4 h-4' />
                </button>
                <div className='absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                  <button
                    onClick={exportToExcel}
                    className='w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                  >
                    <FileText className='w-4 h-4' />
                    تصدير Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className='w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'
                  >
                    <FileText className='w-4 h-4' />
                    تصدير PDF
                  </button>
                </div>
              </div>
            )}

            {selectedRows.size > 0 && onBulkAction && (
              <div className='relative'>
                <button
                  onClick={() => setBulkActionDropdown(!bulkActionDropdown)}
                  className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2'
                >
                  إجراءات ({selectedRows.size})
                  <ChevronDown className='w-4 h-4' />
                </button>
                {bulkActionDropdown && (
                  <div className='absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-48'>
                    {bulkActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleBulkActionClick(action.id)}
                          className={`w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2 ${action.color || 'text-gray-700'}`}
                        >
                          <Icon className='w-4 h-4' />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {columns
                .filter(col => col.filterable && visibleColumns[col.key])
                .map(column => (
                  <div key={column.key}>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>{column.header}</label>
                    {column.filterType === 'date' ? (
                      <div className='flex gap-2'>
                        <input
                          type='date'
                          value={filters[column.key]?.from || ''}
                          onChange={e =>
                            setFilters(prev => ({
                              ...prev,
                              [column.key]: { ...prev[column.key], from: e.target.value, type: 'date' }
                            }))
                          }
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                        <input
                          type='date'
                          value={filters[column.key]?.to || ''}
                          onChange={e =>
                            setFilters(prev => ({
                              ...prev,
                              [column.key]: { ...prev[column.key], to: e.target.value, type: 'date' }
                            }))
                          }
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    ) : (
                      <select
                        value={filters[column.key] || 'all'}
                        onChange={e => setFilters(prev => ({ ...prev, [column.key]: e.target.value }))}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='all'>الكل</option>
                        {getFilterOptions(column.key).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => setFilters({})}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        )}

        {/* Column Settings */}
        {showColumnSettings && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <h3 className='text-sm font-medium text-gray-900 mb-3'>إعدادات الأعمدة</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
              {columns.map(column => (
                <label key={column.key} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={visibleColumns[column.key]}
                    onChange={e =>
                      setVisibleColumns(prev => ({
                        ...prev,
                        [column.key]: e.target.checked
                      }))
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2'
                  />
                  <span className='text-sm text-gray-700'>{column.header}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {enableSelection && (
                <th className='px-6 py-3 text-right'>
                  <input
                    type='checkbox'
                    checked={paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row.id))}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                </th>
              )}

              {columns
                .filter(col => visibleColumns[col.key])
                .map(column => (
                  <th
                    key={column.key}
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{column.header}</span>
                      {column.sortable !== false && (
                        <div className='flex flex-col'>
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <SortAsc className='w-4 h-4 text-blue-600' />
                            ) : (
                              <SortDesc className='w-4 h-4 text-blue-600' />
                            )
                          ) : (
                            <ArrowUpDown className='w-4 h-4 text-gray-400' />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}

              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.filter(col => visibleColumns[col.key]).length + (enableSelection ? 2 : 1)}
                  className='px-6 py-12 text-center text-gray-500'
                >
                  <div className='flex flex-col items-center'>
                    <Package className='w-12 h-12 text-gray-300 mb-4' />
                    <p className='text-lg font-medium text-gray-900 mb-2'>{emptyMessage}</p>
                    <p className='text-sm text-gray-500'>جرب تغيير معايير البحث أو الفلاتر</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={row.id} className={`hover:bg-gray-50 ${selectedRows.has(row.id) ? 'bg-blue-50' : ''}`}>
                  {enableSelection && (
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedRows.has(row.id)}
                        onChange={e => handleRowSelect(row.id, e.target.checked)}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </td>
                  )}

                  {columns
                    .filter(col => visibleColumns[col.key])
                    .map(column => (
                      <td
                        key={column.key}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'
                        onClick={() => {
                          if (enableInlineEdit && column.editable) {
                            handleCellEdit(row.id, column.key, row[column.key]);
                          }
                        }}
                      >
                        {renderCellContent(row, column)}
                      </td>
                    ))}

                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex items-center gap-2'>
                      {onView && (
                        <button onClick={() => onView(row)} className='text-blue-600 hover:text-blue-700' title='عرض'>
                          <Eye className='w-4 h-4' />
                        </button>
                      )}

                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className='text-green-600 hover:text-green-700'
                          title='تعديل'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                      )}

                      {onDelete && (
                        <button onClick={() => onDelete(row)} className='text-red-600 hover:text-red-700' title='حذف'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      )}

                      {customActions.length > 0 && (
                        <div className='relative group'>
                          <button className='text-gray-600 hover:text-gray-700'>
                            <MoreVertical className='w-4 h-4' />
                          </button>
                          <div className='absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                            {customActions.map(action => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={action.id}
                                  onClick={() => action.onClick(row)}
                                  className={`w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2 ${action.color || 'text-gray-700'}`}
                                >
                                  <Icon className='w-4 h-4' />
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            عرض {(currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, sortedData.length)} من{' '}
            {sortedData.length} نتيجة
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className='p-2 text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed'
            >
              <ChevronsRight className='w-4 h-4' />
            </button>

            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className='p-2 text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed'
            >
              <ChevronRight className='w-4 h-4' />
            </button>

            <div className='flex items-center gap-1'>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) {
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className='p-2 text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className='p-2 text-gray-600 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed'
            >
              <ChevronsLeft className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDataTable;
