import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Generic API hook for data fetching
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(options.immediate !== false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const { isAuthenticated } = useAuth();
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute API call
  const execute = useCallback(
    async (...args) => {
      if (!isAuthenticated && options.requireAuth !== false) {
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);

        if (isMountedRef.current) {
          setData(result.data || result);
          setLastFetch(new Date().toISOString());
        }

        return result;
      } catch (err) {
        if (err.name !== 'AbortError' && isMountedRef.current) {
          const errorMessage = err.message || 'حدث خطأ أثناء جلب البيانات';
          setError(errorMessage);
          console.error('API Error:', err);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFunction, isAuthenticated, options.requireAuth]
  );

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, [execute, ...dependencies]);

  // Refresh function
  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  // Reset function
  const reset = useCallback(() => {
    setData(options.initialData || null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
  }, [options.initialData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    refresh,
    reset
  };
};

// Hook for paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: options.limit || 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const { isAuthenticated } = useAuth();

  // Fetch data
  const fetchData = useCallback(
    async (newParams = {}, append = false) => {
      if (!isAuthenticated && options.requireAuth !== false) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const requestParams = { ...params, ...newParams };
        const result = await apiFunction(requestParams);

        if (result.success) {
          const responseData = result.data || [];
          const responsePagination = result.pagination || {};

          setData(prev => (append ? [...prev, ...responseData] : responseData));
          setPagination(prev => ({
            ...prev,
            ...responsePagination
          }));
        }

        return result;
      } catch (err) {
        const errorMessage = err.message || 'حدث خطأ أثناء جلب البيانات';
        setError(errorMessage);
        console.error('Paginated API Error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, params, isAuthenticated, options.requireAuth]
  );

  // Load next page
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      return fetchData({ page: pagination.page + 1 }, true);
    }
  }, [fetchData, pagination, loading]);

  // Go to specific page
  const goToPage = useCallback(
    page => {
      return fetchData({ page });
    },
    [fetchData]
  );

  // Update search/filter params
  const updateParams = useCallback(
    newParams => {
      setParams(prev => ({ ...prev, ...newParams }));
      return fetchData({ ...newParams, page: 1 });
    },
    [fetchData]
  );

  // Reset to first page
  const reset = useCallback(() => {
    setData([]);
    setPagination({
      page: 1,
      limit: options.limit || 10,
      total: 0,
      totalPages: 0
    });
    setParams(initialParams);
    setError(null);
  }, [initialParams, options.limit]);

  // Initial load
  useEffect(() => {
    if (options.immediate !== false) {
      fetchData();
    }
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    fetchData,
    loadMore,
    goToPage,
    updateParams,
    reset,
    hasMore: pagination.page < pagination.totalPages
  };
};

// Hook for form submission
export const useApiSubmit = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { isAuthenticated } = useAuth();

  const submit = useCallback(
    async data => {
      if (!isAuthenticated && options.requireAuth !== false) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const result = await apiFunction(data);

        setSuccess(true);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = err.message || 'حدث خطأ أثناء الحفظ';
        setError(errorMessage);

        if (options.onError) {
          options.onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, isAuthenticated, options]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
};

// Hook for optimistic updates
export const useOptimisticApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(options.initialData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const execute = useCallback(
    async (optimisticData, apiData) => {
      if (!isAuthenticated && options.requireAuth !== false) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // Apply optimistic update
      const previousData = data;
      if (options.optimisticUpdate) {
        setData(options.optimisticUpdate(data, optimisticData));
      }

      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(apiData);

        // Apply real update
        if (options.onSuccess) {
          setData(options.onSuccess(data, result));
        }

        return result;
      } catch (err) {
        // Revert optimistic update
        setData(previousData);

        const errorMessage = err.message || 'حدث خطأ أثناء العملية';
        setError(errorMessage);

        if (options.onError) {
          options.onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, data, isAuthenticated, options]
  );

  return {
    data,
    setData,
    loading,
    error,
    execute
  };
};

// Hook for real-time data with polling
export const usePollingApi = (apiFunction, interval = 30000, dependencies = []) => {
  const { data, loading, error, execute } = useApi(apiFunction, dependencies);
  const intervalRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && interval > 0) {
      intervalRef.current = setInterval(() => {
        execute();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [execute, interval, isAuthenticated]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!intervalRef.current && interval > 0) {
      intervalRef.current = setInterval(() => {
        execute();
      }, interval);
    }
  }, [execute, interval]);

  return {
    data,
    loading,
    error,
    execute,
    stopPolling,
    startPolling,
    isPolling: !!intervalRef.current
  };
};

// Hook for debounced API calls (useful for search)
export const useDebouncedApi = (apiFunction, delay = 500, dependencies = []) => {
  const [debouncedDeps, setDebouncedDeps] = useState(dependencies);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedDeps(dependencies);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);

  return useApi(apiFunction, debouncedDeps, { immediate: false });
};

export default useApi;
