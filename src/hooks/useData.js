import { useCallback, useState, useRef, useEffect } from 'react';
import { useApi, usePaginatedApi, useApiSubmit } from './useApi';
import { salesAPI, inventoryAPI, productionAPI, hrAPI, safetyAPI, reportsAPI, settingsAPI } from '../services/api';

// Sales hooks
export const useCustomers = (params = {}) => {
  return usePaginatedApi(salesAPI.getCustomers, params);
};

export const useCustomer = id => {
  return useApi(() => salesAPI.getCustomer(id), [id], {
    immediate: !!id
  });
};

export const useCreateCustomer = (options = {}) => {
  return useApiSubmit(salesAPI.createCustomer, options);
};

export const useUpdateCustomer = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => salesAPI.updateCustomer(id, data), options);
};

export const useDeleteCustomer = (options = {}) => {
  return useApiSubmit(salesAPI.deleteCustomer, options);
};

export const useQuotations = (params = {}) => {
  return usePaginatedApi(salesAPI.getQuotations, params);
};

export const useQuotation = id => {
  return useApi(() => salesAPI.getQuotation(id), [id], {
    immediate: !!id
  });
};

export const useCreateQuotation = (options = {}) => {
  return useApiSubmit(salesAPI.createQuotation, options);
};

export const useUpdateQuotation = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => salesAPI.updateQuotation(id, data), options);
};

export const useDeleteQuotation = (options = {}) => {
  return useApiSubmit(salesAPI.deleteQuotation, options);
};

// Inventory hooks
export const useMaterials = (params = {}) => {
  return usePaginatedApi(inventoryAPI.getMaterials, params);
};

export const useMaterial = id => {
  return useApi(() => inventoryAPI.getMaterial(id), [id], {
    immediate: !!id
  });
};

export const useCreateMaterial = (options = {}) => {
  return useApiSubmit(inventoryAPI.createMaterial, options);
};

export const useUpdateMaterial = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => inventoryAPI.updateMaterial(id, data), options);
};

export const useDeleteMaterial = (options = {}) => {
  return useApiSubmit(inventoryAPI.deleteMaterial, options);
};

export const useProducts = (params = {}) => {
  return usePaginatedApi(inventoryAPI.getProducts, params);
};

export const useProduct = id => {
  return useApi(() => inventoryAPI.getProduct(id), [id], {
    immediate: !!id
  });
};

export const useCreateProduct = (options = {}) => {
  return useApiSubmit(inventoryAPI.createProduct, options);
};

export const useUpdateProduct = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => inventoryAPI.updateProduct(id, data), options);
};

export const useDeleteProduct = (options = {}) => {
  return useApiSubmit(inventoryAPI.deleteProduct, options);
};

export const useInventoryTransactions = (params = {}) => {
  return usePaginatedApi(inventoryAPI.getTransactions, params);
};

export const useCreateTransaction = (options = {}) => {
  return useApiSubmit(inventoryAPI.createTransaction, options);
};

// Production hooks
export const useBatches = (params = {}) => {
  return usePaginatedApi(productionAPI.getBatches, params);
};

export const useBatch = id => {
  return useApi(() => productionAPI.getBatch(id), [id], {
    immediate: !!id
  });
};

export const useCreateBatch = (options = {}) => {
  return useApiSubmit(productionAPI.createBatch, options);
};

export const useUpdateBatch = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => productionAPI.updateBatch(id, data), options);
};

export const useDeleteBatch = (options = {}) => {
  return useApiSubmit(productionAPI.deleteBatch, options);
};

export const useEquipment = (params = {}) => {
  return usePaginatedApi(productionAPI.getEquipment, params);
};

export const useEquipmentItem = id => {
  return useApi(() => productionAPI.getEquipmentItem(id), [id], {
    immediate: !!id
  });
};

export const useCreateEquipment = (options = {}) => {
  return useApiSubmit(productionAPI.createEquipment, options);
};

export const useUpdateEquipment = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => productionAPI.updateEquipment(id, data), options);
};

export const useDeleteEquipment = (options = {}) => {
  return useApiSubmit(productionAPI.deleteEquipment, options);
};

// HR hooks
export const useEmployees = (params = {}) => {
  return usePaginatedApi(hrAPI.getEmployees, params);
};

export const useEmployee = id => {
  return useApi(() => hrAPI.getEmployee(id), [id], {
    immediate: !!id
  });
};

export const useCreateEmployee = (options = {}) => {
  return useApiSubmit(hrAPI.createEmployee, options);
};

export const useUpdateEmployee = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => hrAPI.updateEmployee(id, data), options);
};

export const useDeleteEmployee = (options = {}) => {
  return useApiSubmit(hrAPI.deleteEmployee, options);
};

// Safety hooks
export const useIncidents = (params = {}) => {
  return usePaginatedApi(safetyAPI.getIncidents, params);
};

export const useCreateIncident = (options = {}) => {
  return useApiSubmit(safetyAPI.createIncident, options);
};

export const useTrainingRecords = (params = {}) => {
  return usePaginatedApi(safetyAPI.getTrainingRecords, params);
};

export const useCreateTrainingRecord = (options = {}) => {
  return useApiSubmit(safetyAPI.createTrainingRecord, options);
};

// Reports hooks
export const useReports = (type, params = {}) => {
  return useApi(() => reportsAPI.getReports(type, params), [type, params]);
};

export const useGenerateReport = (options = {}) => {
  return useApiSubmit(reportsAPI.generateReport, options);
};

export const useDownloadReport = () => {
  return useApiSubmit(reportsAPI.downloadReport, {
    onSuccess: (result, reportId) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  });
};

// Settings hooks
export const useSettings = () => {
  return useApi(settingsAPI.getSettings);
};

export const useUpdateSettings = (options = {}) => {
  return useApiSubmit(settingsAPI.updateSettings, options);
};

export const useUsers = (params = {}) => {
  return usePaginatedApi(settingsAPI.getUsers, params);
};

export const useCreateUser = (options = {}) => {
  return useApiSubmit(settingsAPI.createUser, options);
};

export const useUpdateUser = (options = {}) => {
  return useApiSubmit(({ id, ...data }) => settingsAPI.updateUser(id, data), options);
};

export const useDeleteUser = (options = {}) => {
  return useApiSubmit(settingsAPI.deleteUser, options);
};

// Combined hooks for complex operations
export const useCustomerWithQuotations = customerId => {
  const customer = useCustomer(customerId);
  const quotations = useQuotations({ customer_id: customerId });

  return {
    customer: customer.data,
    quotations: quotations.data,
    loading: customer.loading || quotations.loading,
    error: customer.error || quotations.error,
    refresh: useCallback(() => {
      customer.refresh();
      quotations.fetchData();
    }, [customer, quotations])
  };
};

export const useProductWithInventory = productId => {
  const product = useProduct(productId);
  const transactions = useInventoryTransactions({ product_id: productId });

  return {
    product: product.data,
    transactions: transactions.data,
    loading: product.loading || transactions.loading,
    error: product.error || transactions.error,
    refresh: useCallback(() => {
      product.refresh();
      transactions.fetchData();
    }, [product, transactions])
  };
};

export const useBatchWithDetails = batchId => {
  const batch = useBatch(batchId);
  const equipment = useEquipment({ batch_id: batchId });

  return {
    batch: batch.data,
    equipment: equipment.data,
    loading: batch.loading || equipment.loading,
    error: batch.error || equipment.error,
    refresh: useCallback(() => {
      batch.refresh();
      equipment.fetchData();
    }, [batch, equipment])
  };
};

// Dashboard data hook
export const useDashboardData = () => {
  const customers = useCustomers({ limit: 5 });
  const products = useProducts({ limit: 5 });
  const batches = useBatches({ limit: 5, status: 'active' });
  const incidents = useIncidents({ limit: 5 });

  return {
    customers: customers.data,
    products: products.data,
    batches: batches.data,
    incidents: incidents.data,
    loading: customers.loading || products.loading || batches.loading || incidents.loading,
    error: customers.error || products.error || batches.error || incidents.error,
    refresh: useCallback(() => {
      customers.fetchData();
      products.fetchData();
      batches.fetchData();
      incidents.fetchData();
    }, [customers, products, batches, incidents])
  };
};

// Search hooks
export const useSearch = (searchFunction, initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const search = useCallback(
    async searchQuery => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await searchFunction(searchQuery);
        setResults(response.data || []);
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء البحث');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchFunction]
  );

  const debouncedSearch = useCallback(
    searchQuery => {
      setQuery(searchQuery);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        search(searchQuery);
      }, 300);
    },
    [search]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search: debouncedSearch,
    clearResults: () => setResults([])
  };
};

export default {
  // Sales
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useQuotations,
  useQuotation,
  useCreateQuotation,
  useUpdateQuotation,
  useDeleteQuotation,

  // Inventory
  useMaterials,
  useMaterial,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useInventoryTransactions,
  useCreateTransaction,

  // Production
  useBatches,
  useBatch,
  useCreateBatch,
  useUpdateBatch,
  useDeleteBatch,
  useEquipment,
  useEquipmentItem,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,

  // HR
  useEmployees,
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,

  // Safety
  useIncidents,
  useCreateIncident,
  useTrainingRecords,
  useCreateTrainingRecord,

  // Reports
  useReports,
  useGenerateReport,
  useDownloadReport,

  // Settings
  useSettings,
  useUpdateSettings,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,

  // Combined
  useCustomerWithQuotations,
  useProductWithInventory,
  useBatchWithDetails,
  useDashboardData,
  useSearch
};
