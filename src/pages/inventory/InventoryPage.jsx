import React, { useState, useEffect } from 'react';
import { Card, Button, StatCard, StatGrid, Modal, Tabs } from '../../components/common';
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';
import { formatters } from '../../utils';
import {
  Package,
  Warehouse,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  ArrowUpDown,
  BarChart3
} from 'lucide-react';
import ViewMaterials from './ViewMaterials';
import AddMaterial from './AddMaterial';

/**
 * صفحة إدارة المخزون
 */
const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);

  const {
    data: { materials, warehouses, movements, counts },
    loading,
    loadData,
    add,
    update,
    remove,
    showNotification
  } = useUnifiedDataStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadData('materials');
    loadData('warehouses');
    loadData('movements');
    loadData('counts');
  }, [loadData]);

  // حساب الإحصائيات
  const stats = {
    totalItems: materials.length,
    lowStockItems: materials.filter(item => item.currentStock <= item.minStock).length,
    // Assuming materials have expiryDate, currentStock, minStock, unitCost properties
    expiredItems: materials.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length,
    nearExpiryItems: materials.filter(item => {
      if (!item.expiryDate) {
        return false;
      }
      const expiryDate = new Date(item.expiryDate);
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 30); // 30 يوم تحذير
      return expiryDate <= warningDate && expiryDate >= new Date();
    }).length,
    totalValue: materials.reduce((sum, item) => sum + (item.currentStock * item.unitCost || 0), 0),
    totalWarehouses: warehouses.length,
    todayMovements: movements.filter(movement => {
      const movementDate = new Date(movement.date);
      const today = new Date();
      return movementDate.toDateString() === today.toDateString();
    }).length,
    pendingCounts: counts.filter(count => count.status === 'pending').length
  };

  // تكوين الأعمدة للجداول
  const itemColumns = [
    {
      key: 'code',
      title: 'رمز الصنف',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'اسم الصنف',
      sortable: true,
      searchable: true
    },
    {
      key: 'category',
      title: 'الفئة',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: MATERIAL_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))
    },
    {
      key: 'currentStock',
      title: 'المخزون الحالي',
      sortable: true,
      format: 'number'
    },
    {
      key: 'unit',
      title: 'الوحدة',
      filterable: true,
      filterType: 'select',
      filterOptions: UNITS.map(unit => ({ value: unit.value, label: unit.label }))
    },
    {
      key: 'minStock',
      title: 'الحد الأدنى',
      sortable: true,
      format: 'number'
    },
    {
      key: 'maxStock',
      title: 'الحد الأقصى',
      sortable: true,
      format: 'number'
    },
    {
      key: 'unitCost',
      title: 'تكلفة الوحدة',
      sortable: true,
      format: 'currency'
    },
    {
      key: 'totalValue',
      title: 'القيمة الإجمالية',
      render: (value, row) => formatters.currency((row.currentStock || 0) * (row.unitCost || 0))
    },
    {
      key: 'expiryDate',
      title: 'تاريخ الانتهاء',
      format: 'date',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      render: (value, row) => {
        if (row.currentStock <= 0) {
          return <Badge variant='danger'>نفد المخزون</Badge>;
        } else if (row.currentStock <= row.minStock) {
          return <Badge variant='warning'>مخزون منخفض</Badge>;
        } else if (row.expiryDate && new Date(row.expiryDate) < new Date()) {
          return <Badge variant='danger'>منتهي الصلاحية</Badge>;
        } else if (row.expiryDate) {
          const expiryDate = new Date(row.expiryDate);
          const warningDate = new Date();
          warningDate.setDate(warningDate.getDate() + 30);
          if (expiryDate <= warningDate) {
            return <Badge variant='warning'>قريب الانتهاء</Badge>;
          }
        }
        return <Badge variant='success'>متوفر</Badge>;
      }
    }
  ];

  const warehouseColumns = [
    {
      key: 'code',
      title: 'رمز المستودع',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'اسم المستودع',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'النوع',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: WAREHOUSE_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'location',
      title: 'الموقع',
      searchable: true
    },
    {
      key: 'capacity',
      title: 'السعة',
      format: 'number',
      sortable: true
    },
    {
      key: 'currentUsage',
      title: 'الاستخدام الحالي',
      format: 'number',
      sortable: true
    },
    {
      key: 'usagePercentage',
      title: 'نسبة الاستخدام',
      render: (value, row) => {
        const percentage = row.capacity > 0 ? (row.currentUsage / row.capacity) * 100 : 0;
        return formatters.percentage(percentage / 100);
      }
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => (value === 'active' ? 'success' : 'warning')
    }
  ];

  const movementColumns = [
    {
      key: 'number',
      title: 'رقم الحركة',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع الحركة',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: MOVEMENT_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'itemName',
      title: 'الصنف',
      sortable: true,
      searchable: true
    },
    {
      key: 'warehouseName',
      title: 'المستودع',
      sortable: true,
      searchable: true
    },
    {
      key: 'quantity',
      title: 'الكمية',
      sortable: true,
      format: 'number'
    },
    {
      key: 'unit',
      title: 'الوحدة'
    },
    {
      key: 'date',
      title: 'التاريخ',
      format: 'date',
      sortable: true
    },
    {
      key: 'reference',
      title: 'المرجع',
      searchable: true
    },
    {
      key: 'notes',
      title: 'ملاحظات'
    }
  ];

  const countColumns = [
    {
      key: 'number',
      title: 'رقم الجرد',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع الجرد',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: INVENTORY_COUNT_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'warehouseName',
      title: 'المستودع',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'تاريخ الجرد',
      format: 'date',
      sortable: true
    },
    {
      key: 'itemsCount',
      title: 'عدد الأصناف',
      sortable: true,
      format: 'number'
    },
    {
      key: 'variancesCount',
      title: 'عدد الفروقات',
      sortable: true,
      format: 'number'
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'completed':
            return 'success';
          case 'pending':
            return 'warning';
          case 'cancelled':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'قيد التنفيذ' },
        { value: 'completed', label: 'مكتمل' },
        { value: 'cancelled', label: 'ملغي' }
      ]
    }
  ];

  // إجراءات الجداول
  const itemActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: item => handleEdit('item', item)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: item => handleEdit('item', item)
    },
    {
      icon: ArrowUpDown,
      label: 'حركة',
      variant: 'ghost',
      onClick: item => {
        setSelectedItem(item);
        handleAdd('movement');
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: item => handleDelete('item', item)
    }
  ];

  const warehouseActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: warehouse => handleEdit('warehouse', warehouse)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: warehouse => handleEdit('warehouse', warehouse)
    },
    {
      icon: BarChart3,
      label: 'جرد',
      variant: 'ghost',
      onClick: warehouse => {
        setSelectedItem(warehouse);
        handleAdd('count');
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: warehouse => handleDelete('warehouse', warehouse)
    }
  ];

  const countActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: count => handleEdit('count', count)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: count => handleEdit('count', count)
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'item':
        return [
          {
            name: 'code',
            label: 'رمز الصنف',
            type: 'text',
            required: true,
            placeholder: 'أدخل رمز الصنف'
          },
          {
            name: 'name',
            label: 'اسم الصنف',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم الصنف'
          },
          {
            name: 'category',
            label: 'الفئة',
            type: 'select',
            required: true,
            options: MATERIAL_CATEGORIES
          },
          {
            name: 'unit',
            label: 'الوحدة',
            type: 'select',
            required: true,
            options: UNITS
          },
          {
            name: 'currentStock',
            label: 'المخزون الحالي',
            type: 'number',
            required: true,
            placeholder: 'أدخل المخزون الحالي'
          },
          {
            name: 'minStock',
            label: 'الحد الأدنى',
            type: 'number',
            required: true,
            placeholder: 'أدخل الحد الأدنى'
          },
          {
            name: 'maxStock',
            label: 'الحد الأقصى',
            type: 'number',
            placeholder: 'أدخل الحد الأقصى'
          },
          {
            name: 'unitCost',
            label: 'تكلفة الوحدة',
            type: 'number',
            step: '0.01',
            placeholder: 'أدخل تكلفة الوحدة'
          },
          {
            name: 'expiryDate',
            label: 'تاريخ الانتهاء',
            type: 'date'
          },
          {
            name: 'description',
            label: 'الوصف',
            type: 'textarea',
            placeholder: 'أدخل وصف الصنف'
          }
        ];

      case 'warehouse':
        return [
          {
            name: 'code',
            label: 'رمز المستودع',
            type: 'text',
            required: true,
            placeholder: 'أدخل رمز المستودع'
          },
          {
            name: 'name',
            label: 'اسم المستودع',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المستودع'
          },
          {
            name: 'type',
            label: 'نوع المستودع',
            type: 'select',
            required: true,
            options: WAREHOUSE_TYPES
          },
          {
            name: 'location',
            label: 'الموقع',
            type: 'text',
            placeholder: 'أدخل موقع المستودع'
          },
          {
            name: 'capacity',
            label: 'السعة',
            type: 'number',
            placeholder: 'أدخل سعة المستودع'
          },
          {
            name: 'description',
            label: 'الوصف',
            type: 'textarea',
            placeholder: 'أدخل وصف المستودع'
          },
          {
            name: 'status',
            label: 'الحالة',
            type: 'select',
            required: true,
            options: [
              { value: 'active', label: 'نشط' },
              { value: 'inactive', label: 'غير نشط' }
            ]
          }
        ];

      case 'movement':
        return [
          {
            name: 'number',
            label: 'رقم الحركة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الحركة'
          },
          {
            name: 'type',
            label: 'نوع الحركة',
            type: 'select',
            required: true,
            options: MOVEMENT_TYPES
          },
          {
            name: 'itemId',
            label: 'الصنف',
            type: 'select',
            required: true,
            options: items.map(item => ({ value: item.id, label: item.name }))
          },
          {
            name: 'warehouseId',
            label: 'المستودع',
            type: 'select',
            required: true,
            options: warehouses.map(wh => ({ value: wh.id, label: wh.name }))
          },
          {
            name: 'quantity',
            label: 'الكمية',
            type: 'number',
            required: true,
            placeholder: 'أدخل الكمية'
          },
          {
            name: 'date',
            label: 'التاريخ',
            type: 'date',
            required: true
          },
          {
            name: 'reference',
            label: 'المرجع',
            type: 'text',
            placeholder: 'أدخل المرجع'
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل الملاحظات'
          }
        ];

      case 'count':
        return [
          {
            name: 'number',
            label: 'رقم الجرد',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الجرد'
          },
          {
            name: 'type',
            label: 'نوع الجرد',
            type: 'select',
            required: true,
            options: INVENTORY_COUNT_TYPES
          },
          {
            name: 'warehouseId',
            label: 'المستودع',
            type: 'select',
            required: true,
            options: warehouses.map(wh => ({ value: wh.id, label: wh.name }))
          },
          {
            name: 'date',
            label: 'تاريخ الجرد',
            type: 'date',
            required: true
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل ملاحظات الجرد'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'item':
        return `${action} صنف`;
      case 'warehouse':
        return `${action} مستودع`;
      case 'movement':
        return 'تسجيل حركة مخزون';
      case 'count':
        return `${action} جرد`;
      default:
        return '';
    }
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: BarChart3
    },
    {
      id: 'materials',
      label: 'المواد',
      icon: Package
    },
    {
      id: 'warehouses',
      label: 'المستودعات',
      icon: Warehouse
    },
    {
      id: 'movements',
      label: 'حركات المخزون',
      icon: ArrowUpDown
    },
    {
      id: 'counts',
      label: 'الجرد',
      icon: FileText
    }
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* التنبيهات */}
      <div className='fixed top-4 left-4 z-50 space-y-2'>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            title={alert.title}
            message={alert.message}
            dismissible
            onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          />
        ))}
      </div>

      {/* العنوان */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-900'>إدارة المخزون</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي الأصناف' value={stats.totalItems} icon={Package} color='blue' />
            <StatCard title='مخزون منخفض' value={stats.lowStockItems} icon={TrendingDown} color='orange' />
            <StatCard title='منتهي الصلاحية' value={stats.expiredItems} icon={AlertTriangle} color='red' />
            <StatCard title='قريب الانتهاء' value={stats.nearExpiryItems} icon={AlertTriangle} color='yellow' />
            <StatCard
              title='القيمة الإجمالية'
              value={stats.totalValue}
              format='currency'
              icon={Package}
              color='green'
            />
            <StatCard title='المستودعات' value={stats.totalWarehouses} icon={Warehouse} color='purple' />
            <StatCard title='حركات اليوم' value={stats.todayMovements} icon={ArrowUpDown} color='blue' />
            <StatCard title='جرد معلق' value={stats.pendingCounts} icon={FileText} color='orange' />
          </StatGrid>

          {/* التقارير والرسوم البيانية */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <Card.Header>
                <Card.Title>المواد منخفضة المخزون</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={materials.filter(item => item.currentStock <= item.minStock).slice(0, 5)}
                  columns={itemColumns.slice(0, 4)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>أحدث حركات المخزون</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={movements.slice(0, 5)}
                  columns={movementColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة المواد</Card.Title>
              <Button
                variant='primary'
                onClick={() => setShowAddMaterialModal(true)}
                className='flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                إضافة مادة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <ViewMaterials />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'warehouses' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة المستودعات</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('warehouse')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة مستودع
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={warehouses}
              columns={warehouseColumns}
              loading={loading.warehouses}
              actions={warehouseActions}
              onRefresh={loadWarehouses}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'movements' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>حركات المخزون</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('movement')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                تسجيل حركة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={movements}
              columns={movementColumns}
              loading={loading.movements}
              onRefresh={loadMovements}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'counts' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة الجرد</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('count')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة جرد
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={counts}
              columns={countColumns}
              loading={loading.counts}
              actions={countActions}
              onRefresh={loadCounts}
            />
          </Card.Content>
        </Card>
      )}

      <Modal isOpen={showAddMaterialModal} onClose={() => setShowAddMaterialModal(false)} title='إضافة مادة جديدة'>
        <AddMaterial
          onSave={() => {
            setShowAddMaterialModal(false);
            loadData('materials');
          }}
          onCancel={() => setShowAddMaterialModal(false)}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
