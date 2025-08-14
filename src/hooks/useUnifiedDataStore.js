// src/hooks/useUnifiedDataStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUnifiedDataStore = create(
  persist(
    (set, get) => ({
      // State
      invoices: [],
      customers: [],
      products: [],
      materials: [],
      quotations: [],
      loading: {},
      error: null,
      notification: null,

      // Actions
      showNotification: (message, type = 'info') => set({ notification: { message, type } }),
      hideNotification: () => set({ notification: null }),

      // Generic CRUD and Search
      loadData: async (dataType, loaderFunc) => {
        set(state => ({ loading: { ...state.loading, [dataType]: true } }));
        try {
          const data = await loaderFunc();
          set(state => ({ [dataType]: data, loading: { ...state.loading, [dataType]: false } }));
        } catch (error) {
          set(state => ({ error, loading: { ...state.loading, [dataType]: false } }));
        }
      },

      searchData: (data, term, fields) => {
        if (!term) {
          return data;
        }
        const lowercasedTerm = term.toLowerCase();
        return data.filter(item =>
          fields.some(field => item[field] && item[field].toString().toLowerCase().includes(lowercasedTerm))
        );
      },

      // Invoice specific actions
      addInvoice: invoice => set(state => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, updatedInvoice) =>
        set(state => ({
          invoices: state.invoices.map(inv => (inv.id === id ? updatedInvoice : inv))
        })),
      removeInvoice: id => set(state => ({ invoices: state.invoices.filter(inv => inv.id !== id) })),

      // Customer specific actions
      addCustomer: customer => set(state => ({ customers: [...state.customers, customer] })),
      updateCustomer: (id, updatedCustomer) =>
        set(state => ({
          customers: state.customers.map(cust => (cust.id === id ? updatedCustomer : cust))
        })),
      removeCustomer: id => set(state => ({ customers: state.customers.filter(cust => cust.id !== id) })),

      // Product specific actions
      addProduct: product => set(state => ({ products: [...state.products, product] })),
      updateProduct: (id, updatedProduct) =>
        set(state => ({
          products: state.products.map(prod => (prod.id === id ? updatedProduct : prod))
        })),
      removeProduct: id => set(state => ({ products: state.products.filter(prod => prod.id !== id) })),

      // Material specific actions
      addMaterial: material => set(state => ({ materials: [...state.materials, material] })),
      updateMaterial: (id, updatedMaterial) =>
        set(state => ({
          materials: state.materials.map(mat => (mat.id === id ? updatedMaterial : mat))
        })),
      removeMaterial: id => set(state => ({ materials: state.materials.filter(mat => mat.id !== id) })),

      // Quotation specific actions
      addQuotation: quotation => set(state => ({ quotations: [...state.quotations, quotation] })),
      updateQuotation: (id, updatedQuotation) =>
        set(state => ({
          quotations: state.quotations.map(q => (q.id === id ? updatedQuotation : q))
        })),
      removeQuotation: id => set(state => ({ quotations: state.quotations.filter(q => q.id !== id) }))
    }),
    {
      name: 'unified-data-store',
      getStorage: () => localStorage
    }
  )
);

export default useUnifiedDataStore;
