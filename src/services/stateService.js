import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS, SYSTEM_CONFIG } from '../constants';
import dataService from './dataService';

/**
 * خدمة إدارة الحالة العامة للتطبيق
 */
const useAppStore = create(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // حالة التطبيق العامة
          isLoading: false,
          error: null,
          notifications: [],
          theme: 'light',
          language: 'ar',
          sidebarCollapsed: false,

          // بيانات المستخدم
          user: null,
          permissions: [],

          // إعدادات التطبيق
          settings: SYSTEM_CONFIG,

          // الإجراءات العامة
          setLoading: loading => set({ isLoading: loading }),
          setError: error => set({ error }),
          clearError: () => set({ error: null }),

          // إدارة الإشعارات
          addNotification: notification => {
            const id = Date.now().toString();
            const newNotification = {
              id,
              timestamp: new Date().toISOString(),
              ...notification
            };

            set(state => ({
              notifications: [...state.notifications, newNotification]
            }));

            // إزالة تلقائية بعد مدة
            if (notification.autoRemove !== false) {
              setTimeout(() => {
                get().removeNotification(id);
              }, notification.duration || 5000);
            }

            return id;
          },

          removeNotification: id => {
            set(state => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }));
          },

          clearNotifications: () => set({ notifications: [] }),

          // إدارة المستخدم
          setUser: user => set({ user }),
          setPermissions: permissions => set({ permissions }),
          logout: () => {
            set({ user: null, permissions: [] });
            dataService.remove(STORAGE_KEYS.AUTH_TOKEN);
          },

          // إدارة الإعدادات
          updateSettings: newSettings => {
            set(state => ({
              settings: { ...state.settings, ...newSettings }
            }));
          },

          // إدارة الواجهة
          setTheme: theme => set({ theme }),
          setLanguage: language => set({ language }),
          toggleSidebar: () =>
            set(state => ({
              sidebarCollapsed: !state.sidebarCollapsed
            })),
          setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed })
        }),
        {
          name: 'app-store',
          partialize: state => ({
            theme: state.theme,
            language: state.language,
            sidebarCollapsed: state.sidebarCollapsed,
            settings: state.settings
          })
        }
      )
    ),
    { name: 'AppStore' }
  )
);

/**
 * خدمة إدارة حالة المبيعات
 */
const useSalesStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // البيانات
      customers: [],
      quotations: [],
      invoices: [],
      payments: [],

      // حالة التحميل
      loading: {
        customers: false,
        quotations: false,
        invoices: false,
        payments: false
      },

      // الفلاتر والبحث
      filters: {
        customers: {},
        quotations: {},
        invoices: {},
        payments: {}
      },

      searchTerms: {
        customers: '',
        quotations: '',
        invoices: '',
        payments: ''
      },

      // الترتيب
      sorting: {
        customers: { field: 'name', direction: 'asc' },
        quotations: { field: 'date', direction: 'desc' },
        invoices: { field: 'date', direction: 'desc' },
        payments: { field: 'date', direction: 'desc' }
      },

      // إجراءات العملاء
      loadCustomers: async () => {
        set(state => ({ loading: { ...state.loading, customers: true } }));
        try {
          const customers = dataService.load(STORAGE_KEYS.CUSTOMERS, []);
          set({ customers });
        } catch (error) {
          console.error('خطأ في تحميل العملاء:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, customers: false } }));
        }
      },

      addCustomer: customer => {
        const newCustomer = dataService.add(STORAGE_KEYS.CUSTOMERS, customer);
        if (newCustomer) {
          set(state => ({ customers: [...state.customers, newCustomer] }));
          return newCustomer;
        }
        return null;
      },

      updateCustomer: (id, updates) => {
        const updatedCustomer = dataService.updateItem(STORAGE_KEYS.CUSTOMERS, id, updates);
        if (updatedCustomer) {
          set(state => ({
            customers: state.customers.map(c => (c.id === id ? updatedCustomer : c))
          }));
          return updatedCustomer;
        }
        return null;
      },

      removeCustomer: id => {
        if (dataService.removeItem(STORAGE_KEYS.CUSTOMERS, id)) {
          set(state => ({
            customers: state.customers.filter(c => c.id !== id)
          }));
          return true;
        }
        return false;
      },

      // إجراءات عروض الأسعار
      loadQuotations: async () => {
        set(state => ({ loading: { ...state.loading, quotations: true } }));
        try {
          const quotations = dataService.load(STORAGE_KEYS.QUOTATIONS, []);
          set({ quotations });
        } catch (error) {
          console.error('خطأ في تحميل عروض الأسعار:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, quotations: false } }));
        }
      },

      addQuotation: quotation => {
        const newQuotation = dataService.add(STORAGE_KEYS.QUOTATIONS, quotation);
        if (newQuotation) {
          set(state => ({ quotations: [...state.quotations, newQuotation] }));
          return newQuotation;
        }
        return null;
      },

      updateQuotation: (id, updates) => {
        const updatedQuotation = dataService.updateItem(STORAGE_KEYS.QUOTATIONS, id, updates);
        if (updatedQuotation) {
          set(state => ({
            quotations: state.quotations.map(q => (q.id === id ? updatedQuotation : q))
          }));
          return updatedQuotation;
        }
        return null;
      },

      removeQuotation: id => {
        if (dataService.removeItem(STORAGE_KEYS.QUOTATIONS, id)) {
          set(state => ({
            quotations: state.quotations.filter(q => q.id !== id)
          }));
          return true;
        }
        return false;
      },

      // إجراءات الفواتير
      loadInvoices: async () => {
        set(state => ({ loading: { ...state.loading, invoices: true } }));
        try {
          const invoices = dataService.load(STORAGE_KEYS.INVOICES, []);
          set({ invoices });
        } catch (error) {
          console.error('خطأ في تحميل الفواتير:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, invoices: false } }));
        }
      },

      addInvoice: invoice => {
        const newInvoice = dataService.add(STORAGE_KEYS.INVOICES, invoice);
        if (newInvoice) {
          set(state => ({ invoices: [...state.invoices, newInvoice] }));
          return newInvoice;
        }
        return null;
      },

      updateInvoice: (id, updates) => {
        const updatedInvoice = dataService.updateItem(STORAGE_KEYS.INVOICES, id, updates);
        if (updatedInvoice) {
          set(state => ({
            invoices: state.invoices.map(i => (i.id === id ? updatedInvoice : i))
          }));
          return updatedInvoice;
        }
        return null;
      },

      removeInvoice: id => {
        if (dataService.removeItem(STORAGE_KEYS.INVOICES, id)) {
          set(state => ({
            invoices: state.invoices.filter(i => i.id !== id)
          }));
          return true;
        }
        return false;
      },

      // إجراءات المدفوعات
      loadPayments: async () => {
        set(state => ({ loading: { ...state.loading, payments: true } }));
        try {
          const payments = dataService.load(STORAGE_KEYS.PAYMENTS, []);
          set({ payments });
        } catch (error) {
          console.error('خطأ في تحميل المدفوعات:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, payments: false } }));
        }
      },

      addPayment: payment => {
        const newPayment = dataService.add(STORAGE_KEYS.PAYMENTS, payment);
        if (newPayment) {
          set(state => ({ payments: [...state.payments, newPayment] }));
          return newPayment;
        }
        return null;
      },

      // إجراءات البحث والفلترة
      setFilter: (section, filters) => {
        set(state => ({
          filters: { ...state.filters, [section]: filters }
        }));
      },

      setSearchTerm: (section, term) => {
        set(state => ({
          searchTerms: { ...state.searchTerms, [section]: term }
        }));
      },

      setSorting: (section, field, direction) => {
        set(state => ({
          sorting: { ...state.sorting, [section]: { field, direction } }
        }));
      },

      // الحصول على البيانات المفلترة
      getFilteredData: section => {
        const state = get();
        let data = state[section] || [];

        // تطبيق البحث
        const searchTerm = state.searchTerms[section];
        if (searchTerm) {
          data = dataService.search(STORAGE_KEYS[section.toUpperCase()], searchTerm);
        }

        // تطبيق الفلاتر
        const filters = state.filters[section];
        if (filters && Object.keys(filters).length > 0) {
          data = dataService.filter(STORAGE_KEYS[section.toUpperCase()], filters);
        }

        // تطبيق الترتيب
        const sorting = state.sorting[section];
        if (sorting) {
          data = dataService.sort(STORAGE_KEYS[section.toUpperCase()], sorting.field, sorting.direction);
        }

        return data;
      }
    })),
    { name: 'SalesStore' }
  )
);

/**
 * خدمة إدارة حالة المخزون
 */
const useInventoryStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // البيانات
      products: [],
      inventory: [],
      movements: [],
      counts: [],

      // حالة التحميل
      loading: {
        products: false,
        inventory: false,
        movements: false,
        counts: false
      },

      // الفلاتر
      filters: {
        products: {},
        inventory: {},
        movements: {},
        counts: {}
      },

      // إجراءات المنتجات
      loadProducts: async () => {
        set(state => ({ loading: { ...state.loading, products: true } }));
        try {
          const products = dataService.load(STORAGE_KEYS.PRODUCTS, []);
          set({ products });
        } catch (error) {
          console.error('خطأ في تحميل المنتجات:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, products: false } }));
        }
      },

      addProduct: product => {
        const newProduct = dataService.add(STORAGE_KEYS.PRODUCTS, product);
        if (newProduct) {
          set(state => ({ products: [...state.products, newProduct] }));
          return newProduct;
        }
        return null;
      },

      updateProduct: (id, updates) => {
        const updatedProduct = dataService.updateItem(STORAGE_KEYS.PRODUCTS, id, updates);
        if (updatedProduct) {
          set(state => ({
            products: state.products.map(p => (p.id === id ? updatedProduct : p))
          }));
          return updatedProduct;
        }
        return null;
      },

      // إجراءات المخزون
      loadInventory: async () => {
        set(state => ({ loading: { ...state.loading, inventory: true } }));
        try {
          const inventory = dataService.load(STORAGE_KEYS.INVENTORY, []);
          set({ inventory });
        } catch (error) {
          console.error('خطأ في تحميل المخزون:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, inventory: false } }));
        }
      },

      updateInventory: (productId, quantity, type = 'adjustment') => {
        // تحديث المخزون
        const inventory = get().inventory;
        const existingItem = inventory.find(item => item.productId === productId);

        if (existingItem) {
          const updatedItem = dataService.updateItem(STORAGE_KEYS.INVENTORY, existingItem.id, {
            quantity: type === 'set' ? quantity : existingItem.quantity + quantity,
            lastUpdated: new Date().toISOString()
          });

          if (updatedItem) {
            set(state => ({
              inventory: state.inventory.map(item => (item.id === existingItem.id ? updatedItem : item))
            }));
          }
        } else {
          const newItem = dataService.add(STORAGE_KEYS.INVENTORY, {
            productId,
            quantity,
            lastUpdated: new Date().toISOString()
          });

          if (newItem) {
            set(state => ({ inventory: [...state.inventory, newItem] }));
          }
        }

        // إضافة حركة مخزون
        const movement = {
          productId,
          type,
          quantity,
          date: new Date().toISOString(),
          reason: 'تعديل يدوي'
        };

        get().addMovement(movement);
      },

      // إجراءات حركات المخزون
      loadMovements: async () => {
        set(state => ({ loading: { ...state.loading, movements: true } }));
        try {
          const movements = dataService.load(STORAGE_KEYS.MOVEMENTS, []);
          set({ movements });
        } catch (error) {
          console.error('خطأ في تحميل حركات المخزون:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, movements: false } }));
        }
      },

      addMovement: movement => {
        const newMovement = dataService.add(STORAGE_KEYS.MOVEMENTS, movement);
        if (newMovement) {
          set(state => ({ movements: [...state.movements, newMovement] }));
          return newMovement;
        }
        return null;
      }
    })),
    { name: 'InventoryStore' }
  )
);

/**
 * خدمة إدارة حالة الإنتاج
 */
const useProductionStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // البيانات
      orders: [],
      schedules: [],
      resources: [],

      // حالة التحميل
      loading: {
        orders: false,
        schedules: false,
        resources: false
      },

      // إجراءات أوامر الإنتاج
      loadOrders: async () => {
        set(state => ({ loading: { ...state.loading, orders: true } }));
        try {
          const orders = dataService.load(STORAGE_KEYS.PRODUCTION, []);
          set({ orders });
        } catch (error) {
          console.error('خطأ في تحميل أوامر الإنتاج:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, orders: false } }));
        }
      },

      addOrder: order => {
        const newOrder = dataService.add(STORAGE_KEYS.PRODUCTION, order);
        if (newOrder) {
          set(state => ({ orders: [...state.orders, newOrder] }));
          return newOrder;
        }
        return null;
      },

      updateOrder: (id, updates) => {
        const updatedOrder = dataService.updateItem(STORAGE_KEYS.PRODUCTION, id, updates);
        if (updatedOrder) {
          set(state => ({
            orders: state.orders.map(o => (o.id === id ? updatedOrder : o))
          }));
          return updatedOrder;
        }
        return null;
      }
    })),
    { name: 'ProductionStore' }
  )
);

/**
 * خدمة إدارة حالة الجودة
 */
const useQualityStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // البيانات
      tests: [],
      reports: [],
      standards: [],

      // حالة التحميل
      loading: {
        tests: false,
        reports: false,
        standards: false
      },

      // إجراءات اختبارات الجودة
      loadTests: async () => {
        set(state => ({ loading: { ...state.loading, tests: true } }));
        try {
          const tests = dataService.load(STORAGE_KEYS.QUALITY, []);
          set({ tests });
        } catch (error) {
          console.error('خطأ في تحميل اختبارات الجودة:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, tests: false } }));
        }
      },

      addTest: test => {
        const newTest = dataService.add(STORAGE_KEYS.QUALITY, test);
        if (newTest) {
          set(state => ({ tests: [...state.tests, newTest] }));
          return newTest;
        }
        return null;
      },

      updateTest: (id, updates) => {
        const updatedTest = dataService.updateItem(STORAGE_KEYS.QUALITY, id, updates);
        if (updatedTest) {
          set(state => ({
            tests: state.tests.map(t => (t.id === id ? updatedTest : t))
          }));
          return updatedTest;
        }
        return null;
      }
    })),
    { name: 'QualityStore' }
  )
);

/**
 * خدمة إدارة حالة السلامة
 */
const useSafetyStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // البيانات
      incidents: [],
      inspections: [],
      trainings: [],

      // حالة التحميل
      loading: {
        incidents: false,
        inspections: false,
        trainings: false
      },

      // إجراءات الحوادث
      loadIncidents: async () => {
        set(state => ({ loading: { ...state.loading, incidents: true } }));
        try {
          const incidents = dataService.load(STORAGE_KEYS.SAFETY, []);
          set({ incidents });
        } catch (error) {
          console.error('خطأ في تحميل الحوادث:', error);
        } finally {
          set(state => ({ loading: { ...state.loading, incidents: false } }));
        }
      },

      addIncident: incident => {
        const newIncident = dataService.add(STORAGE_KEYS.SAFETY, incident);
        if (newIncident) {
          set(state => ({ incidents: [...state.incidents, newIncident] }));
          return newIncident;
        }
        return null;
      },

      updateIncident: (id, updates) => {
        const updatedIncident = dataService.updateItem(STORAGE_KEYS.SAFETY, id, updates);
        if (updatedIncident) {
          set(state => ({
            incidents: state.incidents.map(i => (i.id === id ? updatedIncident : i))
          }));
          return updatedIncident;
        }
        return null;
      }
    })),
    { name: 'SafetyStore' }
  )
);

// تصدير جميع المتاجر
export { useAppStore, useSalesStore, useInventoryStore, useProductionStore, useQualityStore, useSafetyStore };

// تصدير افتراضي للمتجر الرئيسي
export default useAppStore;
