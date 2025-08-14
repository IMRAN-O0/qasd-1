import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS, SYSTEM_CONFIG } from '../constants';
import dataService from './dataService';

/**
 * خدمة البيانات الموحدة - تدير جميع البيانات عبر النظام
 * تضمن التزامن والتكامل بين جميع الوحدات
 */
const useUnifiedDataStore = create(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // البيانات المركزية
          materials: [],
          products: [],
          customers: [],
          suppliers: [],
          quotations: [],
          invoices: [],
          purchaseOrders: [],
          productionBatches: [],
          qualityTests: [],
          employees: [],
          materialIssues: [],
          stockMovements: [],

          // حالة التحميل
          loading: {
            materials: false,
            products: false,
            customers: false,
            suppliers: false,
            quotations: false,
            invoices: false,
            purchaseOrders: false,
            productionBatches: false,
            qualityTests: false,
            employees: false,
            materialIssues: false,
            stockMovements: false
          },

          // الأخطاء
          errors: {},

          // الفلاتر والبحث
          searchTerm: '',
          filters: {},

          // === عمليات إضافة، تحديث، حذف عامة ===
          addEntity: (entityType, data) => {
            const entities = get()[entityType] || [];
            const newEntity = {
              ...data,
              id: data.id || Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            set(state => ({
              [entityType]: [...entities, newEntity],
              errors: { ...state.errors, [entityType]: null }
            }));

            return newEntity;
          },

          updateEntity: (entityType, id, data) => {
            const entities = get()[entityType] || [];
            const updatedEntities = entities.map(entity =>
              entity.id === id ? { ...entity, ...data, updatedAt: new Date().toISOString() } : entity
            );

            set(state => ({
              [entityType]: updatedEntities,
              errors: { ...state.errors, [entityType]: null }
            }));

            return updatedEntities.find(entity => entity.id === id);
          },

          removeEntity: (entityType, id) => {
            const entities = get()[entityType] || [];
            const filteredEntities = entities.filter(entity => entity.id !== id);

            set(state => ({
              [entityType]: filteredEntities,
              errors: { ...state.errors, [entityType]: null }
            }));

            return true;
          },

          // === إدارة المواد ===
          addMaterial: data => get().addEntity('materials', data),
          updateMaterial: (id, data) => get().updateEntity('materials', id, data),
          removeMaterial: id => get().removeEntity('materials', id),
          loadMaterials: async () => {
            set(state => ({ loading: { ...state.loading, materials: true } }));
            try {
              const materials = dataService.load(STORAGE_KEYS.MATERIALS, []);
              set({ materials });
              return materials;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, materials: error.message } }));
              console.error('خطأ في تحميل المواد:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, materials: false } }));
            }
          },

          // === إدارة المنتجات ===
          addProduct: data => get().addEntity('products', data),
          updateProduct: (id, data) => get().updateEntity('products', id, data),
          removeProduct: id => get().removeEntity('products', id),
          loadProducts: async () => {
            set(state => ({ loading: { ...state.loading, products: true } }));
            try {
              const products = dataService.load(STORAGE_KEYS.PRODUCTS, []);
              set({ products });
              return products;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, products: error.message } }));
              console.error('خطأ في تحميل المنتجات:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, products: false } }));
            }
          },

          // === إدارة العملاء ===
          addCustomer: data => get().addEntity('customers', data),
          updateCustomer: (id, data) => get().updateEntity('customers', id, data),
          removeCustomer: id => get().removeEntity('customers', id),
          loadCustomers: async () => {
            set(state => ({ loading: { ...state.loading, customers: true } }));
            try {
              const customers = dataService.load(STORAGE_KEYS.CUSTOMERS, []);
              set({ customers });
              return customers;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, customers: error.message } }));
              console.error('خطأ في تحميل العملاء:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, customers: false } }));
            }
          },

          // === إدارة الموردين ===
          addSupplier: data => get().addEntity('suppliers', data),
          updateSupplier: (id, data) => get().updateEntity('suppliers', id, data),
          removeSupplier: id => get().removeEntity('suppliers', id),
          loadSuppliers: async () => {
            set(state => ({ loading: { ...state.loading, suppliers: true } }));
            try {
              const suppliers = dataService.load(STORAGE_KEYS.SUPPLIERS, []);
              set({ suppliers });
              return suppliers;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, suppliers: error.message } }));
              console.error('خطأ في تحميل الموردين:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, suppliers: false } }));
            }
          },

          // === إدارة عروض الأسعار ===
          addQuotation: data => get().addEntity('quotations', data),
          updateQuotation: (id, data) => get().updateEntity('quotations', id, data),
          removeQuotation: id => get().removeEntity('quotations', id),
          loadQuotations: async () => {
            set(state => ({ loading: { ...state.loading, quotations: true } }));
            try {
              const quotations = dataService.load(STORAGE_KEYS.QUOTATIONS, []);
              set({ quotations });
              return quotations;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, quotations: error.message } }));
              console.error('خطأ في تحميل عروض الأسعار:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, quotations: false } }));
            }
          },

          // تحويل عرض السعر إلى فاتورة
          convertQuotationToInvoice: quotationId => {
            try {
              const quotation = get().quotations.find(q => q.id === quotationId);
              if (!quotation) {
                throw new Error('عرض السعر غير موجود');
              }

              const invoiceData = {
                customerId: quotation.customerId,
                customerName: quotation.customerName,
                items: quotation.items,
                subtotal: quotation.subtotal,
                tax: quotation.tax,
                total: quotation.total,
                notes: quotation.notes,
                quotationId: quotationId,
                type: 'sales'
              };

              return get().addInvoice(invoiceData);
            } catch (error) {
              set(state => ({ errors: { ...state.errors, quotations: error.message } }));
              console.error('خطأ في تحويل عرض السعر:', error);
              return null;
            }
          },

          // === إدارة الفواتير ===
          addInvoice: data => get().addEntity('invoices', data),
          updateInvoice: (id, data) => get().updateEntity('invoices', id, data),
          removeInvoice: id => get().removeEntity('invoices', id),
          loadInvoices: async () => {
            set(state => ({ loading: { ...state.loading, invoices: true } }));
            try {
              const invoices = dataService.load(STORAGE_KEYS.INVOICES, []);
              set({ invoices });
              return invoices;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, invoices: error.message } }));
              console.error('خطأ في تحميل الفواتير:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, invoices: false } }));
            }
          },

          // === إدارة أوامر الشراء ===
          addPurchaseOrder: data => get().addEntity('purchaseOrders', data),
          updatePurchaseOrder: (id, data) => get().updateEntity('purchaseOrders', id, data),
          removePurchaseOrder: id => get().removeEntity('purchaseOrders', id),
          loadPurchaseOrders: async () => {
            set(state => ({ loading: { ...state.loading, purchaseOrders: true } }));
            try {
              const purchaseOrders = dataService.load(STORAGE_KEYS.PURCHASE_ORDERS, []);
              set({ purchaseOrders });
              return purchaseOrders;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, purchaseOrders: error.message } }));
              console.error('خطأ في تحميل أوامر الشراء:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, purchaseOrders: false } }));
            }
          },

          // === إدارة الدفقات الإنتاجية ===
          addProductionBatch: data => get().addEntity('productionBatches', data),
          updateProductionBatch: (id, data) => get().updateEntity('productionBatches', id, data),
          removeProductionBatch: id => get().removeEntity('productionBatches', id),
          loadProductionBatches: async () => {
            set(state => ({ loading: { ...state.loading, productionBatches: true } }));
            try {
              const productionBatches = dataService.load(STORAGE_KEYS.PRODUCTION_BATCHES, []);
              set({ productionBatches });
              return productionBatches;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, productionBatches: error.message } }));
              console.error('خطأ في تحميل الدفقات الإنتاجية:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, productionBatches: false } }));
            }
          },

          // === إدارة اختبارات الجودة ===
          addQualityTest: data => get().addEntity('qualityTests', data),
          updateQualityTest: (id, data) => get().updateEntity('qualityTests', id, data),
          removeQualityTest: id => get().removeEntity('qualityTests', id),
          loadQualityTests: async () => {
            set(state => ({ loading: { ...state.loading, qualityTests: true } }));
            try {
              const qualityTests = dataService.load(STORAGE_KEYS.QUALITY_TESTS, []);
              set({ qualityTests });
              return qualityTests;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, qualityTests: error.message } }));
              console.error('خطأ في تحميل اختبارات الجودة:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, qualityTests: false } }));
            }
          },

          // === إدارة الموظفين ===
          addEmployee: data => get().addEntity('employees', data),
          updateEmployee: (id, data) => get().updateEntity('employees', id, data),
          removeEmployee: id => get().removeEntity('employees', id),
          loadEmployees: async () => {
            set(state => ({ loading: { ...state.loading, employees: true } }));
            try {
              const employees = dataService.load(STORAGE_KEYS.EMPLOYEES, []);
              set({ employees });
              return employees;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, employees: error.message } }));
              console.error('خطأ في تحميل الموظفين:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, employees: false } }));
            }
          },

          // === إدارة مشاكل المواد ===
          addMaterialIssue: data => get().addEntity('materialIssues', data),
          updateMaterialIssue: (id, data) => get().updateEntity('materialIssues', id, data),
          removeMaterialIssue: id => get().removeEntity('materialIssues', id),
          loadMaterialIssues: async () => {
            set(state => ({ loading: { ...state.loading, materialIssues: true } }));
            try {
              const materialIssues = dataService.load(STORAGE_KEYS.MATERIAL_ISSUES, []);
              set({ materialIssues });
              return materialIssues;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, materialIssues: error.message } }));
              console.error('خطأ في تحميل مشاكل المواد:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, materialIssues: false } }));
            }
          },

          // === إدارة حركات المخزون ===
          addStockMovement: data => get().addEntity('stockMovements', data),
          updateStockMovement: (id, data) => get().updateEntity('stockMovements', id, data),
          removeStockMovement: id => get().removeEntity('stockMovements', id),
          loadStockMovements: async () => {
            set(state => ({ loading: { ...state.loading, stockMovements: true } }));
            try {
              const stockMovements = dataService.load(STORAGE_KEYS.STOCK_MOVEMENTS, []);
              set({ stockMovements });
              return stockMovements;
            } catch (error) {
              set(state => ({ errors: { ...state.errors, stockMovements: error.message } }));
              console.error('خطأ في تحميل حركات المخزون:', error);
              return [];
            } finally {
              set(state => ({ loading: { ...state.loading, stockMovements: false } }));
            }
          },

          // === البحث الموحد ===
          searchData: (entityType, searchTerm, searchFields = []) => {
            const entities = get()[entityType] || [];
            if (!searchTerm) {
              return entities;
            }

            const normalizedSearch = searchTerm.toLowerCase().trim();

            return entities.filter(entity => {
              return searchFields.some(field => {
                const value = entity[field];
                if (!value) {
                  return false;
                }

                const normalizedValue = value.toString().toLowerCase();
                return (
                  normalizedValue.includes(normalizedSearch) ||
                  normalizedValue.replace(/[\u064B-\u0652]/g, '').includes(normalizedSearch)
                );
              });
            });
          },

          // تصفية البيانات
          filterData: (entityType, filters) => {
            const entities = get()[entityType] || [];

            return entities.filter(entity => {
              return Object.entries(filters).every(([key, value]) => {
                if (!value || value === 'all') {
                  return true;
                }
                return entity[key] === value;
              });
            });
          },

          // تحديث فلاتر البحث
          updateSearchTerm: term => set({ searchTerm: term }),

          updateFilters: filters =>
            set(state => ({
              filters: { ...state.filters, ...filters }
            })),

          // مسح الأخطاء
          clearError: entityType =>
            set(state => ({
              errors: { ...state.errors, [entityType]: null }
            })),

          clearAllErrors: () => {
            set({ errors: {} });
          },

          // تحميل جميع البيانات
          loadAllData: async () => {
            const promises = [
              get().loadMaterials(),
              get().loadProducts(),
              get().loadCustomers(),
              get().loadSuppliers(),
              get().loadQuotations(),
              get().loadInvoices(),
              get().loadPurchaseOrders(),
              get().loadProductionBatches(),
              get().loadQualityTests(),
              get().loadEmployees(),
              get().loadMaterialIssues(),
              get().loadStockMovements()
            ];

            try {
              await Promise.all(promises);
              return true;
            } catch (error) {
              console.error('خطأ في تحميل البيانات:', error);
              return false;
            }
          },

          // === وظائف مساعدة ===
          generateInvoiceNumber: () => {
            const invoices = get().invoices;
            const lastInvoice = invoices[invoices.length - 1];
            const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) : 0;
            return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
          },

          generateQuotationNumber: () => {
            const quotations = get().quotations;
            const lastQuotation = quotations[quotations.length - 1];
            const lastNumber = lastQuotation ? parseInt(lastQuotation.quotationNumber.split('-')[1]) : 0;
            return `QUO-${String(lastNumber + 1).padStart(4, '0')}`;
          },

          // إشعار تغيير البيانات للوحدات الأخرى
          notifyDataChange: (dataType, action, data) => {
            // يمكن استخدام هذه الوظيفة لإشعار المكونات الأخرى بالتغييرات
            console.log(`Data change notification: ${dataType} ${action}`, data);
          },

          // استرجاع مواد متاحة
          getAvailableMaterials: () => {
            return get().materials.filter(material => material.status === 'active' && (material.currentStock || 0) > 0);
          },

          // استرجاع منتجات متاحة
          getAvailableProducts: () => {
            return get().products.filter(product => product.status === 'active' && (product.currentStock || 0) > 0);
          },

          // استرجاع عملاء نشطين
          getActiveCustomers: () => {
            return get().customers.filter(customer => customer.status === 'active');
          },

          // إعادة تعيين المتجر
          reset: () =>
            set({
              materials: [],
              products: [],
              customers: [],
              suppliers: [],
              quotations: [],
              invoices: [],
              purchaseOrders: [],
              productionBatches: [],
              qualityTests: [],
              employees: [],
              materialIssues: [],
              stockMovements: [],
              loading: {},
              errors: {},
              searchTerm: '',
              filters: {}
            })
        }),
        {
          name: 'unified-data-store',
          partialize: state => ({
            materials: state.materials,
            products: state.products,
            customers: state.customers,
            suppliers: state.suppliers,
            quotations: state.quotations,
            invoices: state.invoices,
            purchaseOrders: state.purchaseOrders,
            productionBatches: state.productionBatches,
            qualityTests: state.qualityTests,
            employees: state.employees,
            materialIssues: state.materialIssues,
            stockMovements: state.stockMovements
          })
        }
      )
    ),
    { name: 'UnifiedDataStore' }
  )
);

export default useUnifiedDataStore;
