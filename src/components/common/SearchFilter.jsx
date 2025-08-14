import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button, Input, Select, Modal } from './index';

const SearchFilter = ({
  onSearch,
  onFilter,
  searchPlaceholder = 'البحث...',
  filters = [],
  showAdvancedFilters = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // تطبيق البحث
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch?.(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  // تطبيق الفلاتر
  useEffect(() => {
    onFilter?.(activeFilters);
  }, [activeFilters, onFilter]);

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilter = filterKey => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key]).length;
  };

  return (
    <div className={`bg-white rounded-lg border p-4 space-y-4 ${className}`}>
      {/* شريط البحث الرئيسي */}
      <div className='flex gap-3'>
        <div className='flex-1 relative'>
          <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <Input
            type='text'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pr-10'
          />
        </div>

        {filters.length > 0 && (
          <Button variant='outline' onClick={() => setShowFilters(!showFilters)} className='relative'>
            <Filter className='w-4 h-4 ml-2' />
            الفلاتر
            {getActiveFilterCount() > 0 && (
              <span className='absolute -top-2 -left-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        )}

        {showAdvancedFilters && (
          <Button variant='outline' onClick={() => setShowAdvanced(true)}>
            بحث متقدم
          </Button>
        )}

        {(searchTerm || getActiveFilterCount() > 0) && (
          <Button variant='outline' onClick={clearAllFilters} className='text-red-600 hover:text-red-700'>
            <X className='w-4 h-4 ml-1' />
            مسح الكل
          </Button>
        )}
      </div>

      {/* الفلاتر السريعة */}
      {showFilters && filters.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
          {filters.map(filter => (
            <div key={filter.key} className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>{filter.label}</label>

              {filter.type === 'select' && (
                <div className='relative'>
                  <Select
                    value={activeFilters[filter.key] || ''}
                    onChange={value => handleFilterChange(filter.key, value)}
                    options={[{ value: '', label: 'الكل' }, ...filter.options]}
                  />
                  {activeFilters[filter.key] && (
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className='absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              )}

              {filter.type === 'input' && (
                <div className='relative'>
                  <Input
                    type={filter.inputType || 'text'}
                    placeholder={filter.placeholder}
                    value={activeFilters[filter.key] || ''}
                    onChange={e => handleFilterChange(filter.key, e.target.value)}
                  />
                  {activeFilters[filter.key] && (
                    <button
                      onClick={() => clearFilter(filter.key)}
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
              )}

              {filter.type === 'date' && (
                <div className='space-y-2'>
                  <Input
                    type='date'
                    placeholder='من تاريخ'
                    value={activeFilters[`${filter.key}_from`] || ''}
                    onChange={e => handleFilterChange(`${filter.key}_from`, e.target.value)}
                  />
                  <Input
                    type='date'
                    placeholder='إلى تاريخ'
                    value={activeFilters[`${filter.key}_to`] || ''}
                    onChange={e => handleFilterChange(`${filter.key}_to`, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* الفلاتر النشطة */}
      {getActiveFilterCount() > 0 && (
        <div className='flex flex-wrap gap-2'>
          <span className='text-sm text-gray-600'>الفلاتر النشطة:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) {
              return null;
            }

            const filter = filters.find(f => f.key === key || key.startsWith(f.key));
            const label = filter?.label || key;

            return (
              <span
                key={key}
                className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
              >
                {label}: {value}
                <button onClick={() => clearFilter(key)} className='text-blue-600 hover:text-blue-800'>
                  <X className='w-3 h-3' />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* نافذة البحث المتقدم */}
      {showAdvanced && (
        <Modal isOpen={showAdvanced} onClose={() => setShowAdvanced(false)} title='البحث المتقدم' size='lg'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {filters.map(filter => (
                <div key={filter.key} className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>{filter.label}</label>

                  {filter.type === 'select' && (
                    <Select
                      value={activeFilters[filter.key] || ''}
                      onChange={value => handleFilterChange(filter.key, value)}
                      options={[{ value: '', label: 'الكل' }, ...filter.options]}
                    />
                  )}

                  {filter.type === 'input' && (
                    <Input
                      type={filter.inputType || 'text'}
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.key] || ''}
                      onChange={e => handleFilterChange(filter.key, e.target.value)}
                    />
                  )}

                  {filter.type === 'date' && (
                    <div className='grid grid-cols-2 gap-2'>
                      <Input
                        type='date'
                        placeholder='من تاريخ'
                        value={activeFilters[`${filter.key}_from`] || ''}
                        onChange={e => handleFilterChange(`${filter.key}_from`, e.target.value)}
                      />
                      <Input
                        type='date'
                        placeholder='إلى تاريخ'
                        value={activeFilters[`${filter.key}_to`] || ''}
                        onChange={e => handleFilterChange(`${filter.key}_to`, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button variant='outline' onClick={clearAllFilters}>
                مسح الكل
              </Button>
              <Button onClick={() => setShowAdvanced(false)}>تطبيق</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SearchFilter;
