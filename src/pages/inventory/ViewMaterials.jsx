import React, { useState, useMemo } from 'react';
import { Button, Input, Select, Modal, Card, Badge, Table, Loading, Empty } from '../../components/common';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import { UNITS, MATERIAL_CATEGORIES } from '../../constants';
import { validators, formatters, exporters } from '../../utils';
import { Search, Trash2, Package, Filter, Calendar, CheckCircle, Edit, Eye, Plus, Download } from 'lucide-react';

const ViewMaterials = () => {
  const { materials, loading, removeMaterial: remove, showNotification } = useUnifiedDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // تصفية وفرز المواد
  const processedMaterials = useMemo(() => {
    let filtered = materials || [];

    // تطبيق البحث
    if (searchTerm) {
      filtered = filtered.filter(
        material =>
          material.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تطبيق فلاتر الفئة والوحدة
    if (filterCategory) {
      filtered = filtered.filter(material => material.category === filterCategory);
    }

    if (filterUnit) {
      filtered = filtered.filter(material => material.unit === filterUnit);
    }

    // تطبيق الترتيب
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'dateAdded') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [materials, searchTerm, filterCategory, filterUnit, sortBy, sortOrder]);

  // حذف مادة
  const deleteMaterial = async id => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      try {
        await remove('materials', id);
        showNotification('تم حذف المادة بنجاح', 'success');
      } catch (error) {
        showNotification(`خطأ في حذف المادة: ${error.message}`, 'error');
      }
    }
  };

  // عرض تفاصيل المادة
  const viewMaterial = material => {
    setSelectedMaterial(material);
    setShowModal(true);
  };

  // تصدير البيانات
  const exportData = () => {
    const dataToExport = {
      materials: processedMaterials,
      summary: {
        totalMaterials: materials.length,
        categoriesCount: [...new Set(materials.map(m => m.category))].length,
        exportedAt: new Date().toISOString()
      }
    };

    exporters.exportToJSON(dataToExport, 'materials_list');
  };

  // إحصائيات المواد
  const materialStats = useMemo(() => {
    const totalMaterials = materials.length;
    const categories = [...new Set(materials.map(m => m.category))];
    const units = [...new Set(materials.map(m => m.unit))];
    const recentlyAdded = materials.filter(m => {
      const addedDate = new Date(m.dateAdded);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return addedDate > thirtyDaysAgo;
    }).length;

    return {
      totalMaterials,
      categoriesCount: categories.length,
      unitsCount: units.length,
      recentlyAdded
    };
  }, [materials]);

  // أعمدة الجدول
  const columns = [
    {
      key: 'index',
      title: '#',
      width: '50px',
      render: (_, index) => index + 1
    },
    {
      key: 'code',
      title: 'الكود',
      width: '120px',
      render: material => (
        <Badge color='primary' variant='outline'>
          {material.code}
        </Badge>
      )
    },
    {
      key: 'nameAr',
      title: 'الاسم العربي',
      width: '200px',
      render: material => <div className='font-medium text-gray-900'>{material.nameAr}</div>
    },
    {
      key: 'nameEn',
      title: 'الاسم الإنجليزي',
      width: '200px',
      render: material => <div className='text-gray-600'>{material.nameEn}</div>
    },
    {
      key: 'unit',
      title: 'الوحدة',
      width: '100px',
      render: material => <Badge color='secondary'>{material.unit}</Badge>
    },
    {
      key: 'category',
      title: 'الفئة',
      width: '150px',
      render: material => (
        <Badge color='info' variant='outline'>
          {material.category}
        </Badge>
      )
    },
    {
      key: 'dateAdded',
      title: 'تاريخ الإضافة',
      width: '130px',
      render: material => <div className='text-sm text-gray-600'>{formatters.date(material.dateAdded)}</div>
    },
    {
      key: 'status',
      title: 'الحالة',
      width: '100px',
      render: material => (
        <Badge color='success' variant='filled'>
          <CheckCircle size={12} className='mr-1' />
          نشط
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      width: '150px',
      render: material => (
        <div className='flex gap-2'>
          <Button variant='ghost' size='sm' color='primary' onClick={() => viewMaterial(material)} icon={Eye} />
          <Button variant='ghost' size='sm' color='danger' onClick={() => deleteMaterial(material.id)} icon={Trash2} />
        </div>
      )
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <Package className='text-blue-600' size={32} />
              <h1 className='text-2xl font-bold text-gray-800'>المواد المخزنة</h1>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowFilters(!showFilters)} icon={Filter}>
                {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
              </Button>
              <Button color='success' onClick={exportData} icon={Download}>
                تصدير البيانات
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className='mb-4'>
            <Input
              placeholder='🔍 ابحث بالاسم العربي أو الإنجليزي أو الكود...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
              <Select
                label='الفئة'
                value={filterCategory}
                onChange={setFilterCategory}
                options={[
                  { label: 'جميع الفئات', value: '' },
                  ...MATERIAL_CATEGORIES.map(cat => ({ label: cat.label, value: cat.value }))
                ]}
              />
              <Select
                label='الوحدة'
                value={filterUnit}
                onChange={setFilterUnit}
                options={[
                  { label: 'جميع الوحدات', value: '' },
                  ...UNITS.map(unit => ({ label: unit.label, value: unit.value }))
                ]}
              />
              <Select
                label='ترتيب حسب'
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { label: 'تاريخ الإضافة', value: 'dateAdded' },
                  { label: 'الاسم العربي', value: 'nameAr' },
                  { label: 'الكود', value: 'code' },
                  { label: 'الفئة', value: 'category' }
                ]}
              />
              <Select
                label='ترتيب'
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { label: 'تنازلي', value: 'desc' },
                  { label: 'تصاعدي', value: 'asc' }
                ]}
              />
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card className='p-4 text-center'>
            <Package className='text-blue-600 mx-auto mb-2' size={24} />
            <div className='text-2xl font-bold text-blue-600'>{materialStats.totalMaterials}</div>
            <div className='text-sm text-gray-600'>إجمالي المواد</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>{materialStats.categoriesCount}</div>
            <div className='text-sm text-gray-600'>عدد الفئات</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-purple-600'>{materialStats.unitsCount}</div>
            <div className='text-sm text-gray-600'>عدد الوحدات</div>
          </Card>
          <Card className='p-4 text-center'>
            <div className='text-2xl font-bold text-orange-600'>{materialStats.recentlyAdded}</div>
            <div className='text-sm text-gray-600'>مضافة حديثاً (30 يوم)</div>
          </Card>
        </div>

        {/* Materials Table */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>
              قائمة المواد ({processedMaterials.length} من {materials.length})
            </h2>
          </div>

          {loading ? (
            <Loading message='جاري تحميل المواد...' />
          ) : processedMaterials.length === 0 ? (
            <Empty message='لا توجد مواد مطابقة للبحث' />
          ) : (
            <Table columns={columns} data={processedMaterials} className='min-w-max' />
          )}
        </Card>

        {/* Material Details Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title='تفاصيل المادة' size='lg'>
          {selectedMaterial && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الكود</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.code}</div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الوحدة</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.unit}</div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الاسم العربي</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.nameAr}</div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الاسم الإنجليزي</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.nameEn}</div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الفئة</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.category}</div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الإضافة</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{formatters.date(selectedMaterial.dateAdded)}</div>
                </div>
              </div>

              {selectedMaterial.description && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>الوصف</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.description}</div>
                </div>
              )}

              {selectedMaterial.notes && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>ملاحظات</label>
                  <div className='p-2 bg-gray-50 rounded-lg'>{selectedMaterial.notes}</div>
                </div>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <Button variant='outline' onClick={() => setShowModal(false)}>
                  إغلاق
                </Button>
                <Button
                  color='danger'
                  onClick={() => {
                    deleteMaterial(selectedMaterial.id);
                    setShowModal(false);
                  }}
                  icon={Trash2}
                >
                  حذف المادة
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ViewMaterials;
