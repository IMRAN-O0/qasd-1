// pages/sales/products.jsx
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import UniversalForm from '../../components/ui/UniversalForm';
import { useForm } from '../../hooks';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import { UNITS, STATUS_OPTIONS, CATEGORIES } from '../../constants';
import { validators, formatters, exporters } from '../../utils';

const ProductsPage = () => {
  const {
    products,
    materials,
    loading,
    error,
    addProduct,
    updateProduct,
    removeProduct,
    loadData,
    searchData,
    showNotification
  } = useUnifiedDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Initialize form hook
  const { values, setValues, handleChange, errors: formErrors, reset } = useForm({});

  // تعريف حقول النموذج
  const formFields = [
    {
      name: 'nameAr',
      type: 'text',
      label: 'الاسم العربي',
      placeholder: 'أدخل الاسم العربي للمنتج',
      required: true,
      validation: value => (!value ? 'الاسم العربي مطلوب' : null)
    },
    {
      name: 'nameEn',
      type: 'text',
      label: 'الاسم الإنجليزي',
      placeholder: 'أدخل الاسم الإنجليزي للمنتج',
      required: true,
      validation: value => (!value ? 'الاسم الإنجليزي مطلوب' : null)
    },
    {
      name: 'code',
      type: 'text',
      label: 'رمز المنتج',
      placeholder: 'أدخل رمز المنتج أو اتركه فارغاً للتوليد التلقائي',
      required: false
    },
    {
      name: 'barcode',
      type: 'text',
      label: 'الباركود',
      placeholder: 'أدخل الباركود (اختياري)',
      required: false
    },
    {
      name: 'category',
      type: 'select',
      label: 'الفئة',
      placeholder: 'اختر فئة المنتج',
      required: true,
      options: CATEGORIES.map(cat => ({ value: cat.value || cat, label: cat.label || cat })),
      validation: value => (!value ? 'الفئة مطلوبة' : null)
    },
    {
      name: 'unit',
      type: 'select',
      label: 'الوحدة',
      placeholder: 'اختر وحدة القياس',
      required: true,
      options: UNITS.map(unit => ({ value: unit.value, label: unit.label })),
      validation: value => (!value ? 'الوحدة مطلوبة' : null)
    },
    {
      name: 'costPrice',
      type: 'number',
      label: 'سعر التكلفة',
      placeholder: 'أدخل سعر التكلفة',
      required: true,
      min: 0,
      step: 0.01,
      validation: value => {
        if (!value) {
          return 'سعر التكلفة مطلوب';
        }
        if (isNaN(value) || parseFloat(value) < 0) {
          return 'يجب أن يكون رقماً موجباً';
        }
        return null;
      }
    },
    {
      name: 'sellingPrice',
      type: 'number',
      label: 'سعر البيع',
      placeholder: 'أدخل سعر البيع',
      required: true,
      min: 0,
      step: 0.01,
      validation: value => {
        if (!value) {
          return 'سعر البيع مطلوب';
        }
        if (isNaN(value) || parseFloat(value) < 0) {
          return 'يجب أن يكون رقماً موجباً';
        }
        return null;
      }
    },
    {
      name: 'currentStock',
      type: 'number',
      label: 'المخزون الحالي',
      placeholder: 'أدخل الكمية الحالية في المخزون',
      required: true,
      min: 0,
      validation: value => {
        if (!value && value !== 0) {
          return 'المخزون الحالي مطلوب';
        }
        if (isNaN(value) || parseFloat(value) < 0) {
          return 'يجب أن يكون رقماً موجباً';
        }
        return null;
      }
    },
    {
      name: 'minStock',
      type: 'number',
      label: 'الحد الأدنى للمخزون',
      placeholder: 'أدخل الحد الأدنى للمخزون',
      required: true,
      min: 0,
      validation: value => {
        if (!value && value !== 0) {
          return 'الحد الأدنى للمخزون مطلوب';
        }
        if (isNaN(value) || parseFloat(value) < 0) {
          return 'يجب أن يكون رقماً موجباً';
        }
        return null;
      }
    },
    {
      name: 'maxStock',
      type: 'number',
      label: 'الحد الأقصى للمخزون',
      placeholder: 'أدخل الحد الأقصى للمخزون (اختياري)',
      required: false,
      min: 0
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'الوصف',
      placeholder: 'أدخل وصف المنتج (اختياري)',
      required: false,
      rows: 3
    },
    {
      name: 'brand',
      type: 'text',
      label: 'العلامة التجارية',
      placeholder: 'أدخل العلامة التجارية (اختياري)',
      required: false
    },
    {
      name: 'manufacturer',
      type: 'text',
      label: 'الشركة المصنعة',
      placeholder: 'أدخل اسم الشركة المصنعة (اختياري)',
      required: false
    },
    {
      name: 'origin',
      type: 'text',
      label: 'بلد المنشأ',
      placeholder: 'أدخل بلد المنشأ',
      required: false
    },
    {
      name: 'shelfLife',
      type: 'text',
      label: 'مدة الصلاحية',
      placeholder: 'أدخل مدة الصلاحية (اختياري)',
      required: false
    },
    {
      name: 'storageConditions',
      type: 'text',
      label: 'ظروف التخزين',
      placeholder: 'أدخل ظروف التخزين (اختياري)',
      required: false
    },
    {
      name: 'ingredients',
      type: 'textarea',
      label: 'المكونات',
      placeholder: 'أدخل قائمة المكونات (اختياري)',
      required: false,
      rows: 2
    },
    {
      name: 'specifications',
      type: 'textarea',
      label: 'المواصفات التقنية',
      placeholder: 'أدخل المواصفات التقنية (اختياري)',
      required: false,
      rows: 2
    },
    {
      name: 'certifications',
      type: 'text',
      label: 'الشهادات والاعتمادات',
      placeholder: 'أدخل الشهادات والاعتمادات (اختياري)',
      required: false
    },
    {
      name: 'status',
      type: 'select',
      label: 'الحالة',
      placeholder: 'اختر حالة المنتج',
      required: true,
      options: STATUS_OPTIONS.map(status => ({ value: status.value, label: status.label })),
      validation: value => (!value ? 'الحالة مطلوبة' : null)
    }
  ];

  // البيانات الأولية للنموذج
  const getInitialFormData = () => ({
    code: '',
    nameAr: '',
    nameEn: '',
    category: '',
    unit: 'قطعة',
    costPrice: '',
    sellingPrice: '',
    minStock: '',
    currentStock: '',
    maxStock: '',
    description: '',
    barcode: '',
    brand: '',
    manufacturer: '',
    origin: 'السعودية',
    shelfLife: '',
    storageConditions: '',
    ingredients: '',
    specifications: '',
    certifications: '',
    status: 'active',
    image: null
  });

  // حالة المخزون
  const getStockStatus = (current, min) => {
    const currentStock = parseInt(current) || 0;
    const minStock = parseInt(min) || 0;

    if (currentStock === 0) {
      return { type: 'out', label: 'نفد المخزون', color: 'red' };
    }
    if (currentStock <= minStock) {
      return { type: 'low', label: 'مخزون منخفض', color: 'yellow' };
    }
    return { type: 'good', label: 'متوفر', color: 'green' };
  };

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadData('products', async () => mockProducts); // Replace with actual API call
    loadData('materials', async () => mockMaterials);
  }, [loadData]);

  // تصفية المنتجات
  const filteredProducts = (products || []).filter(product => {
    let matchesSearch = true;
    if (searchTerm) {
      const searchResults = searchData('products', searchTerm, ['nameAr', 'nameEn', 'code', 'barcode']);
      matchesSearch = searchResults.some(result => result.id === product.id);
    }

    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    const stockStatus = getStockStatus(product.currentStock, product.minStock);
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && stockStatus.type === 'low') ||
      (stockFilter === 'out' && stockStatus.type === 'out') ||
      (stockFilter === 'good' && stockStatus.type === 'good');

    return matchesSearch && matchesStatus && matchesCategory && matchesStock;
  });

  // إنشاء كود منتج جديد
  const generateProductCode = () => {
    if (!products || products.length === 0) {
      return 'PRD-001';
    }
    const lastProduct = products[products.length - 1];
    const lastNumber = lastProduct ? parseInt(lastProduct.code.split('-')[1]) : 0;
    return `PRD-${String(lastNumber + 1).padStart(3, '0')}`;
  };

  // حفظ المنتج
  const handleSave = async formData => {
    setLocalLoading(true);
    try {
      if (editingProduct) {
        // تحديث منتج موجود
        const updatedProduct = await updateProduct(editingProduct.id, formData);
        if (updatedProduct) {
          setIsModalOpen(false);
          setEditingProduct(null);
          reset();
        }
      } else {
        // إضافة منتج جديد
        const productData = {
          ...formData,
          code: formData.code || generateProductCode()
        };
        const newProduct = await addProduct(productData);
        if (newProduct) {
          setIsModalOpen(false);
          reset();
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // حذف المنتج
  const handleDelete = async productId => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
      }
    }
  };

  // فتح نموذج التعديل
  const openEditModal = product => {
    setEditingProduct(product);
    setValues(product);
    setIsModalOpen(true);
  };

  // فتح نموذج إضافة جديد
  const openAddModal = () => {
    setEditingProduct(null);
    reset();
    setIsModalOpen(true);
  };

  // رفع صورة
  const handleImageUpload = file => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        handleChange('image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // تصدير البيانات
  const handleExport = () => {
    exporters.downloadJSON(products, 'products');
  };

  // إحصائيات سريعة
  const getStats = () => {
    if (!products) {
      return { total: 0, active: 0, lowStock: 0, outOfStock: 0 };
    }
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const lowStock = products.filter(p => getStockStatus(p.currentStock, p.minStock).type === 'low').length;
    const outOfStock = products.filter(p => getStockStatus(p.currentStock, p.minStock).type === 'out').length;

    return { total, active, lowStock, outOfStock };
  };

  const stats = getStats();

  // أعمدة الجدول
  const columns = [
    {
      key: 'image',
      title: 'الصورة',
      render: product =>
        product.image ? (
          <img src={product.image} alt={product.nameAr} className='w-12 h-12 object-cover rounded-lg' />
        ) : (
          <div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center'>
            <Package className='text-gray-400' size={20} />
          </div>
        )
    },
    {
      key: 'code',
      title: 'الكود',
      render: product => <span className='font-medium text-blue-600'>{product.code}</span>
    },
    {
      key: 'name',
      title: 'اسم المنتج',
      render: product => (
        <div>
          <div className='font-medium'>{product.nameAr}</div>
          {product.nameEn && <div className='text-sm text-gray-500'>{product.nameEn}</div>}
        </div>
      )
    },
    {
      key: 'category',
      title: 'الفئة',
      render: product => product.category
    },
    {
      key: 'price',
      title: 'سعر البيع',
      render: product => formatters.currency(product.sellingPrice)
    },
    {
      key: 'stock',
      title: 'المخزون',
      render: product => {
        const stockStatus = getStockStatus(product.currentStock, product.minStock);
        return (
          <div className='flex items-center gap-2'>
            <span>{product.currentStock || 0}</span>
            <Badge variant={stockStatus.color} size='sm'>
              {stockStatus.label}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'الحالة',
      render: product => {
        const status = STATUS_OPTIONS.find(s => s.value === product.status);
        return <Badge variant={status?.color || 'gray'}>{status?.label || product.status}</Badge>;
      }
    }
  ];

  // إجراءات الجدول
  const actions = [
    {
      label: 'تعديل',
      onClick: openEditModal,
      variant: 'primary'
    },
    {
      label: 'حذف',
      onClick: handleDelete,
      variant: 'danger',
      confirm: true
    }
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* رأس الصفحة */}
      <Card>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Package className='text-blue-600' size={32} />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>إدارة المنتجات</h1>
              <p className='text-gray-600'>إدارة وتنظيم قاعدة بيانات المنتجات</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleExport} variant='secondary' icon={Upload}>
              تصدير
            </Button>
            <Button onClick={openAddModal} icon={Package}>
              إضافة منتج
            </Button>
          </div>
        </div>

        {/* شريط البحث والتصفية */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Input placeholder='البحث في المنتجات...' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value='all'>جميع الفئات</option>
            {CATEGORIES.map((category, index) => (
              <option key={`filter-category-${index}-${category}`} value={category.value || category}>
                {category.label || category}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value='all'>جميع الحالات</option>
            {STATUS_OPTIONS.map((status, index) => (
              <option key={`filter-status-${index}-${status.value}`} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
          <Select value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
            <option value='all'>جميع المخزون</option>
            <option value='good'>متوفر</option>
            <option value='low'>منخفض</option>
            <option value='out'>نفد</option>
          </Select>
        </div>

        {/* الإحصائيات */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-blue-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-blue-600'>إجمالي المنتجات</p>
                <p className='text-2xl font-bold text-blue-800'>{stats.total}</p>
              </div>
              <Package className='text-blue-600' size={24} />
            </div>
          </div>
          <div className='bg-green-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-green-600'>المنتجات النشطة</p>
                <p className='text-2xl font-bold text-green-800'>{stats.active}</p>
              </div>
              <CheckCircle className='text-green-600' size={24} />
            </div>
          </div>
          <div className='bg-yellow-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-yellow-600'>مخزون منخفض</p>
                <p className='text-2xl font-bold text-yellow-800'>{stats.lowStock}</p>
              </div>
              <AlertTriangle className='text-yellow-600' size={24} />
            </div>
          </div>
          <div className='bg-red-50 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-red-600'>نفد المخزون</p>
                <p className='text-2xl font-bold text-red-800'>{stats.outOfStock}</p>
              </div>
              <AlertTriangle className='text-red-600' size={24} />
            </div>
          </div>
        </div>
      </Card>

      {/* جدول المنتجات */}
      <Card>
        {loading.products || localLoading ? (
          <Loading />
        ) : filteredProducts.length === 0 ? (
          <Empty
            icon={Package}
            title='لا توجد منتجات'
            description='ابدأ بإضافة منتج جديد'
            action={<Button onClick={openAddModal}>إضافة منتج</Button>}
          />
        ) : (
          <Table data={filteredProducts} columns={columns} actions={actions} keyExtractor={item => item.id} />
        )}
      </Card>

      {/* نموذج إضافة/تعديل المنتج */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        size='large'
      >
        <UniversalForm
          fields={formFields}
          initialData={editingProduct || getInitialFormData()}
          onSubmit={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          submitLabel={editingProduct ? 'حفظ التعديلات' : 'حفظ المنتج'}
          loading={localLoading}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
