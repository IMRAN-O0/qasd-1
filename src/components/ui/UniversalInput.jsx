import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// Fix import path
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';

const UniversalInput = forwardRef(
  (
    {
      type = 'text',
      value = '',
      onChange,
      onSearch,
      placeholder = '',
      label = '',
      error = '',
      helperText = '',
      disabled = false,
      required = false,
      className = '',
      inputClassName = '',

      // Search properties
      searchable = false,
      dataType = '',
      searchFields = ['name'],
      searchPlaceholder = 'البحث...',
      showSearchResults = true,
      maxSearchResults = 5,
      onSearchResultSelect,

      // Validation properties
      validation,
      validateOnChange = true,
      validateOnBlur = true,

      // Formatting properties
      direction = 'rtl',
      autoComplete = 'off',
      maxLength,
      minLength,
      pattern,

      // Additional properties
      startIcon,
      endIcon,
      clearable = false,
      showPasswordToggle = false,

      // Events
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onEnterPress,

      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const [showPassword, setShowPassword] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    // Get data from unified store
    const { searchData, customers = [], products = [], materials = [] } = useUnifiedDataStore();

    // Handle controlled/uncontrolled component properly
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = e => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      if (onChange) {
        onChange(e);
      }

      // Handle search
      if (searchable && dataType) {
        handleSearch(newValue);
      }
    };

    const handleSearch = useCallback(
      searchTerm => {
        if (!searchTerm || searchTerm.length < 2) {
          setSearchResults([]);
          setShowResults(false);
          return;
        }

        setIsSearching(true);

        let dataSource = [];
        switch (dataType) {
          case 'customers':
            dataSource = customers;
            break;
          case 'products':
            dataSource = products;
            break;
          case 'materials':
            dataSource = materials;
            break;
          default:
            dataSource = [];
        }

        const results = searchData(dataSource, searchTerm, searchFields).slice(0, maxSearchResults);

        setSearchResults(results);
        setShowResults(results.length > 0);
        setIsSearching(false);

        if (onSearch) {
          onSearch(searchTerm, results);
        }
      },
      [dataType, customers, products, materials, searchData, searchFields, maxSearchResults, onSearch]
    );

    // ... rest of component ...
  }
);

UniversalInput.displayName = 'UniversalInput';

export default UniversalInput;
