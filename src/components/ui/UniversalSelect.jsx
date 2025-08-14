import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useUnifiedDataStore from '../../services/unifiedDataService';

/**
 * مكون اختيار عالمي يدعم جميع أنواع البيانات مع البحث والتصفية
 * يتكامل مع نظام إدارة البيانات الموحد
 */
const UniversalSelect = forwardRef(
  (
    {
      dataType, // نوع البيانات: 'materials', 'products', 'customers', etc.
      value,
      onChange,
      placeholder = 'اختر...',
      searchPlaceholder = 'البحث...',
      displayField = 'name', // الحقل المراد عرضه
      valueField = 'id', // حقل القيمة
      searchFields = ['name'], // الحقول المراد البحث فيها
      filters = {}, // فلاتر إضافية
      disabled = false,
      required = false,
      error = null,
      className = '',
      clearable = true,
      searchable = true,
      multiple = false,
      maxHeight = '200px',
      onSelectionChange,
      customDisplayRenderer, // دالة مخصصة لعرض العنصر
      customOptionRenderer, // دالة مخصصة لعرض الخيار
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    const optionsRef = useRef([]);

    // الحصول على البيانات من المتجر الموحد
    const { [dataType]: data = [], loading, errors, searchData, filterData, updateSearchTerm } = useUnifiedDataStore();

    // تحميل البيانات عند التحميل الأول
    const loadDataFunction = useUnifiedDataStore(state => {
      switch (dataType) {
        case 'materials':
          return state.loadMaterials;
        case 'products':
          return state.loadProducts;
        case 'customers':
          return state.loadCustomers;
        case 'quotations':
          return state.loadQuotations;
        case 'invoices':
          return state.loadInvoices;
        default:
          return () => Promise.resolve([]);
      }
    });

    useEffect(() => {
      if (data.length === 0 && !loading[dataType]) {
        loadDataFunction();
      }
    }, [dataType, data.length, loading[dataType]]);

    // تصفية وبحث البيانات
    const filteredData = React.useMemo(() => {
      let result = data;

      // تطبيق الفلاتر
      if (Object.keys(filters).length > 0) {
        result = filterData(dataType, filters);
      }

      // تطبيق البحث
      if (searchTerm.trim()) {
        result = result.filter(item => {
          return searchFields.some(field => {
            const fieldValue = item[field];
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return false;
          });
        });
      }

      return result;
    }, [data, filters, searchTerm, dataType, searchFields, filterData]);

    // الحصول على العنصر المحدد
    const selectedItem = React.useMemo(() => {
      if (!value) {
        return null;
      }
      if (multiple) {
        return data.filter(item => value.includes(item[valueField]));
      }
      return data.find(item => item[valueField] === value);
    }, [value, data, valueField, multiple]);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
      const handleClickOutside = event => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // التنقل بالكيبورد
    useEffect(() => {
      const handleKeyDown = event => {
        if (!isOpen) {
          return;
        }

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev => (prev < filteredData.length - 1 ? prev + 1 : 0));
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredData.length - 1));
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0 && filteredData[highlightedIndex]) {
              handleSelect(filteredData[highlightedIndex]);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setSearchTerm('');
            setHighlightedIndex(-1);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, highlightedIndex, filteredData]);

    // التركيز على حقل البحث عند فتح القائمة
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }, [isOpen, searchable]);

    // معالج الاختيار
    const handleSelect = item => {
      if (multiple) {
        const currentValues = value || [];
        const itemValue = item[valueField];
        let newValues;

        if (currentValues.includes(itemValue)) {
          newValues = currentValues.filter(v => v !== itemValue);
        } else {
          newValues = [...currentValues, itemValue];
        }

        onChange?.(newValues);
        onSelectionChange?.(
          newValues,
          data.filter(d => newValues.includes(d[valueField]))
        );
      } else {
        onChange?.(item[valueField]);
        onSelectionChange?.(item[valueField], item);
        setIsOpen(false);
        setSearchTerm('');
      }

      setHighlightedIndex(-1);
    };

    // مسح الاختيار
    const handleClear = event => {
      event.stopPropagation();
      onChange?.(multiple ? [] : null);
      onSelectionChange?.(multiple ? [] : null, multiple ? [] : null);
    };

    // فتح/إغلاق القائمة
    const toggleDropdown = () => {
      if (disabled) {
        return;
      }
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    // عرض النص المحدد
    const getDisplayText = () => {
      if (!selectedItem) {
        return placeholder;
      }

      if (multiple) {
        if (selectedItem.length === 0) {
          return placeholder;
        }
        if (selectedItem.length === 1) {
          return customDisplayRenderer ? customDisplayRenderer(selectedItem[0]) : selectedItem[0][displayField];
        }
        return `تم اختيار ${selectedItem.length} عنصر`;
      }

      return customDisplayRenderer ? customDisplayRenderer(selectedItem) : selectedItem[displayField];
    };

    // عرض الخيار
    const renderOption = (item, index) => {
      const isSelected = multiple ? value?.includes(item[valueField]) : value === item[valueField];
      const isHighlighted = index === highlightedIndex;

      return (
        <div
          key={item[valueField]}
          ref={el => (optionsRef.current[index] = el)}
          className={`
          px-3 py-2 cursor-pointer transition-colors duration-150
          ${isHighlighted ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}
          ${isSelected ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-900'}
        `}
          onClick={() => handleSelect(item)}
          onMouseEnter={() => setHighlightedIndex(index)}
        >
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              {customOptionRenderer ? (
                customOptionRenderer(item, isSelected, isHighlighted)
              ) : (
                <span>{item[displayField]}</span>
              )}
            </div>
            {multiple && isSelected && <div className='text-blue-600 mr-2'>✓</div>}
          </div>
        </div>
      );
    };

    // واجهة المرجع
    useImperativeHandle(ref, () => ({
      focus: () => dropdownRef.current?.focus(),
      blur: () => {
        setIsOpen(false);
        setSearchTerm('');
      },
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      clear: () => handleClear({ stopPropagation: () => {} }),
      refresh: () => loadDataFunction()
    }));

    // فلترة الخصائص غير المناسبة للـ DOM
    const {
      validation,
      isLoading,
      onSelectionChange: _onSelectionChange,
      customDisplayRenderer: _customDisplayRenderer,
      customOptionRenderer: _customOptionRenderer,
      ...domProps
    } = props;

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* حقل الاختيار الرئيسي */}
        <div
          className={`
          relative w-full cursor-pointer rounded-md border bg-white px-3 py-2 text-right shadow-sm transition-colors
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
        `}
          onClick={toggleDropdown}
          tabIndex={disabled ? -1 : 0}
          {...domProps}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              {/* أيقونة السهم */}
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />

              {/* زر المسح */}
              {clearable && selectedItem && !disabled && (
                <button
                  type='button'
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                  onClick={handleClear}
                >
                  <XMarkIcon className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* النص المعروض */}
            <div className={`flex-1 text-right truncate ${selectedItem ? 'text-gray-900' : 'text-gray-500'}`}>
              {loading[dataType] ? 'جاري التحميل...' : getDisplayText()}
            </div>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {/* قائمة الخيارات */}
        {isOpen && (
          <div className='absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200'>
            {/* حقل البحث */}
            {searchable && (
              <div className='p-2 border-b border-gray-200'>
                <div className='relative'>
                  <MagnifyingGlassIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    ref={searchInputRef}
                    type='text'
                    className='w-full rounded-md border border-gray-300 py-2 pr-10 pl-3 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* قائمة الخيارات */}
            <div className='max-h-60 overflow-auto' style={{ maxHeight: maxHeight }}>
              {loading[dataType] ? (
                <div className='px-3 py-8 text-center text-gray-500'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2'></div>
                  جاري التحميل...
                </div>
              ) : errors[dataType] ? (
                <div className='px-3 py-4 text-center text-red-500'>خطأ في تحميل البيانات: {errors[dataType]}</div>
              ) : filteredData.length === 0 ? (
                <div className='px-3 py-4 text-center text-gray-500'>
                  {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد بيانات متاحة'}
                </div>
              ) : (
                filteredData.map((item, index) => renderOption(item, index))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

UniversalSelect.displayName = 'UniversalSelect';

export default UniversalSelect;
