import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * مكون القائمة المنسدلة المحسن مع دعم كامل للبيانات العربية و RTL
 * يحل مشكلة عدم عرض الخيارات ويدعم جميع أنواع البيانات
 */
const EnhancedSelect = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = 'اختر...',
      searchPlaceholder = 'ابحث...',
      disabled = false,
      required = false,
      error,
      helperText,
      className = '',
      searchable = false,
      clearable = false,
      loading = false,
      emptyMessage = 'لا توجد خيارات متاحة',
      noResultsMessage = 'لا توجد نتائج',
      maxHeight = '200px',
      name,
      children,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // تحويل children إلى options إذا لم يتم تمرير options
    const processedOptions = React.useMemo(() => {
      if (options && options.length > 0) {
        return options.map((option, index) => {
          if (typeof option === 'string') {
            return { value: option, label: option, originalIndex: index };
          }
          if (typeof option === 'object' && option !== null) {
            return {
              value: option.value ?? option.id ?? option.key ?? option.label ?? option,
              label: option.label ?? option.name ?? option.title ?? option.value ?? option,
              originalIndex: index,
              ...option
            };
          }
          return { value: option, label: String(option), originalIndex: index };
        });
      }

      // استخراج options من children (option elements)
      if (children) {
        const childrenArray = React.Children.toArray(children);
        return childrenArray
          .filter(child => child.type === 'option')
          .map((child, index) => ({
            value: child.props.value || child.props.children,
            label: child.props.children || child.props.value,
            originalIndex: index,
            disabled: child.props.disabled
          }));
      }

      return [];
    }, [options, children]);

    // تصفية الخيارات بناءً على البحث
    const filteredOptions =
      searchable && searchTerm
        ? processedOptions.filter(
          option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(option.value).toLowerCase().includes(searchTerm.toLowerCase())
        )
        : processedOptions;

    // العثور على الخيار المحدد
    const selectedOption = processedOptions.find(option => option.value === value);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
      const handleClickOutside = event => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // التعامل مع لوحة المفاتيح
    useEffect(() => {
      const handleKeyDown = event => {
        if (!isOpen) {
          return;
        }

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
              handleOptionSelect(filteredOptions[highlightedIndex]);
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
    }, [isOpen, highlightedIndex, filteredOptions]);

    // فتح/إغلاق القائمة
    const toggleDropdown = () => {
      if (disabled) {
        return;
      }

      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setHighlightedIndex(-1);
        // التركيز على حقل البحث إذا كان متاحاً
        setTimeout(() => {
          if (searchable && searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
      }
    };

    // اختيار خيار
    const handleOptionSelect = option => {
      if (option.disabled) {
        return;
      }

      // دعم كل من onChange function و event-based onChange
      if (typeof onChange === 'function') {
        // إذا كان onChange يتوقع event object
        if (name) {
          const syntheticEvent = {
            target: {
              name: name,
              value: option.value
            },
            preventDefault: () => {},
            stopPropagation: () => {}
          };
          onChange(syntheticEvent);
        } else {
          // إذا كان onChange يتوقع القيمة مباشرة
          onChange(option.value);
        }
      }

      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
      onBlur?.();
    };

    // مسح الاختيار
    const handleClear = e => {
      e.stopPropagation();
      if (typeof onChange === 'function') {
        if (name) {
          const syntheticEvent = {
            target: {
              name: name,
              value: ''
            },
            preventDefault: () => {},
            stopPropagation: () => {}
          };
          onChange(syntheticEvent);
        } else {
          onChange('');
        }
      }
      onBlur?.();
    };

    // التعامل مع البحث
    const handleSearchChange = e => {
      setSearchTerm(e.target.value);
      setHighlightedIndex(-1);
    };

    return (
      <div className={`relative space-y-1 ${className}`} ref={selectRef} dir='rtl'>
        {label && (
          <label className='block text-sm font-medium text-gray-700'>
            {label}
            {required && <span className='text-red-500 mr-1'>*</span>}
          </label>
        )}

        {/* حقل الاختيار */}
        <div
          className={`
          relative w-full px-3 py-2 border rounded-lg cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          bg-white transition-colors duration-200
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
          onClick={toggleDropdown}
          {...props}
        >
          <div className='flex items-center justify-between'>
            <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <div className='flex items-center gap-1'>
              {clearable && selectedOption && !disabled && (
                <button type='button' onClick={handleClear} className='p-1 hover:bg-gray-100 rounded transition-colors'>
                  <X className='h-4 w-4 text-gray-400' />
                </button>
              )}
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'
            style={{ maxHeight, overflowY: 'auto' }}
          >
            {/* حقل البحث */}
            {searchable && (
              <div className='p-2 border-b border-gray-200'>
                <div className='relative'>
                  <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    ref={searchInputRef}
                    type='text'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className='w-full pl-3 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                    dir='rtl'
                  />
                </div>
              </div>
            )}

            {/* قائمة الخيارات */}
            <div className='py-1'>
              {loading ? (
                <div className='px-3 py-2 text-center text-gray-500'>
                  <div className='inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                  <span className='mr-2'>جاري التحميل...</span>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className='px-3 py-2 text-gray-500 text-center'>
                  {searchTerm ? noResultsMessage : emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={`${option.value}-${option.originalIndex}`}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                    px-3 py-2 cursor-pointer transition-colors duration-150 text-right
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
                    ${option.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}
                  `}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* رسائل الخطأ والمساعدة */}
        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

export default EnhancedSelect;
