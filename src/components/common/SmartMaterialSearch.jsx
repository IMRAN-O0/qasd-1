import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Tag, Building } from 'lucide-react';
import { SmartSearch } from '../../utils/search';
import { useLocalStorage } from '../../hooks';
import { STORAGE_KEYS } from '../../constants';

/**
 * مكون البحث الذكي للمواد
 * يدعم البحث بالعربية مع الاقتراحات والتصفية المتقدمة
 */
const SmartMaterialSearch = ({
  onSelect,
  placeholder = 'ابحث عن مادة...',
  className = '',
  showSuggestions = true,
  maxResults = 10,
  disabled = false
}) => {
  const [materials] = useLocalStorage(STORAGE_KEYS.PRODUCTS, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [smartSearch, setSmartSearch] = useState(null);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // إنشاء محرك البحث الذكي
  useEffect(() => {
    if (materials.length > 0) {
      const search = new SmartSearch(materials);
      setSmartSearch(search);
    }
  }, [materials]);

  // البحث والاقتراحات
  useEffect(() => {
    if (!smartSearch) {
      return;
    }

    if (searchTerm.length >= 2) {
      const results = smartSearch.search(searchTerm, { maxResults });
      setSearchResults(results);

      if (showSuggestions) {
        const suggestions = smartSearch.getSuggestions(searchTerm, 5);
        setSuggestions(suggestions);
      }

      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setSearchResults([]);
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm, smartSearch, maxResults, showSuggestions]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // التنقل بلوحة المفاتيح
  const handleKeyDown = e => {
    if (!isOpen) {
      return;
    }

    const totalItems = searchResults.length + (suggestions.length > 0 ? suggestions.length + 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (suggestions.length > 0 && highlightedIndex <= suggestions.length) {
            // اختيار اقتراح
            if (highlightedIndex === 0) {
              return;
            } // عنوان الاقتراحات
            const suggestion = suggestions[highlightedIndex - 1];
            setSearchTerm(suggestion);
          } else {
            // اختيار مادة
            const resultIndex = suggestions.length > 0 ? highlightedIndex - suggestions.length - 1 : highlightedIndex;
            const selectedMaterial = searchResults[resultIndex];
            if (selectedMaterial) {
              handleSelectMaterial(selectedMaterial);
            }
          }
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // اختيار مادة
  const handleSelectMaterial = material => {
    setSearchTerm(material.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect && onSelect(material);
  };

  // اختيار اقتراح
  const handleSelectSuggestion = suggestion => {
    setSearchTerm(suggestion);
    searchRef.current?.focus();
  };

  // مسح البحث
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    searchRef.current?.focus();
  };

  // تمييز النص المطابق
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) {
      return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className='bg-yellow-200 font-semibold'>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* حقل البحث */}
      <div className='relative'>
        <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
          <Search className='h-5 w-5 text-gray-400' />
        </div>

        <input
          ref={searchRef}
          type='text'
          className={`
            w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            text-right placeholder-gray-500
          `}
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          dir='rtl'
        />

        {searchTerm && (
          <button
            onClick={clearSearch}
            className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* قائمة النتائج والاقتراحات */}
      {isOpen && (searchResults.length > 0 || suggestions.length > 0) && (
        <div
          ref={dropdownRef}
          className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto'
          dir='rtl'
        >
          {/* الاقتراحات */}
          {suggestions.length > 0 && (
            <div className='border-b border-gray-200'>
              <div className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50'>اقتراحات البحث</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  className={`
                    w-full px-4 py-2 text-right hover:bg-blue-50 focus:bg-blue-50
                    flex items-center gap-3 border-b border-gray-100 last:border-b-0
                    ${highlightedIndex === index + 1 ? 'bg-blue-50' : ''}
                  `}
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <Search className='h-4 w-4 text-gray-400' />
                  <span className='text-sm text-gray-700'>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* نتائج البحث */}
          {searchResults.length > 0 && (
            <div>
              {suggestions.length > 0 && (
                <div className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50'>
                  النتائج ({searchResults.length})
                </div>
              )}

              {searchResults.map((material, index) => {
                const actualIndex = suggestions.length > 0 ? index + suggestions.length + 1 : index;

                return (
                  <button
                    key={material.id}
                    className={`
                      w-full px-4 py-3 text-right hover:bg-blue-50 focus:bg-blue-50
                      border-b border-gray-100 last:border-b-0
                      ${highlightedIndex === actualIndex ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => handleSelectMaterial(material)}
                  >
                    <div className='flex items-start gap-3'>
                      <Package className='h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0' />

                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {highlightMatch(material.name, searchTerm)}
                        </div>

                        {material.description && (
                          <div className='text-xs text-gray-500 mt-1 line-clamp-2'>
                            {highlightMatch(material.description, searchTerm)}
                          </div>
                        )}

                        <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                          {material.category && (
                            <div className='flex items-center gap-1'>
                              <Tag className='h-3 w-3' />
                              <span>{material.category}</span>
                            </div>
                          )}

                          {material.brand && (
                            <div className='flex items-center gap-1'>
                              <Building className='h-3 w-3' />
                              <span>{material.brand}</span>
                            </div>
                          )}

                          {material.code && <div className='font-mono'>{material.code}</div>}
                        </div>

                        {material._relevanceScore && (
                          <div className='text-xs text-blue-600 mt-1'>
                            نسبة التطابق: {Math.round(material._relevanceScore * 10)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* رسالة عدم وجود نتائج */}
          {searchTerm.length >= 2 && searchResults.length === 0 && suggestions.length === 0 && (
            <div className='px-4 py-8 text-center text-gray-500'>
              <Package className='h-12 w-12 mx-auto text-gray-300 mb-3' />
              <div className='text-sm font-medium'>لا توجد نتائج</div>
              <div className='text-xs mt-1'>جرب استخدام كلمات مختلفة أو أقل تحديداً</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartMaterialSearch;
