import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Plus,
  FolderOpen,
  Archive
} from 'lucide-react';
import { Button, Input, Card, Modal, Badge, Loading, DataTable } from '../../components/common';
import EnhancedSelect from '../../components/common/EnhancedSelect';
import { useLocalStorage } from '../../hooks';
import { STORAGE_KEYS } from '../../constants';
import { formatDate, formatFileSize } from '../../utils';

/**
 * مركز إدارة التقارير المحفوظة
 * يوفر واجهة شاملة لعرض وإدارة جميع التقارير المحفوظة
 */
const ReportsCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // التقارير المحفوظة
  const [savedReports, setSavedReports] = useLocalStorage(STORAGE_KEYS.SAVED_REPORTS, [
    {
      id: '1',
      name: 'تقرير المخزون الشهري - يناير 2024',
      type: 'inventory',
      category: 'المخزون',
      description: 'تقرير شامل عن حالة المخزون لشهر يناير 2024',
      createdAt: '2024-01-31T10:30:00Z',
      createdBy: 'أحمد محمد',
      fileSize: 2.5,
      format: 'PDF',
      status: 'completed',
      downloadCount: 5,
      lastAccessed: '2024-02-01T09:15:00Z',
      tags: ['مخزون', 'شهري', 'يناير'],
      filePath: '/reports/inventory-jan-2024.pdf'
    },
    {
      id: '2',
      name: 'تقرير المبيعات الأسبوعي',
      type: 'sales',
      category: 'المبيعات',
      description: 'تقرير المبيعات للأسبوع الأول من فبراير',
      createdAt: '2024-02-07T16:45:00Z',
      createdBy: 'فاطمة أحمد',
      fileSize: 1.8,
      format: 'Excel',
      status: 'completed',
      downloadCount: 12,
      lastAccessed: '2024-02-08T11:20:00Z',
      tags: ['مبيعات', 'أسبوعي', 'فبراير'],
      filePath: '/reports/sales-week1-feb-2024.xlsx'
    },
    {
      id: '3',
      name: 'تقرير جودة المنتجات',
      type: 'quality',
      category: 'الجودة',
      description: 'تقرير فحص الجودة للمنتجات المصنعة في يناير',
      createdAt: '2024-01-28T14:20:00Z',
      createdBy: 'محمد علي',
      fileSize: 3.2,
      format: 'PDF',
      status: 'completed',
      downloadCount: 8,
      lastAccessed: '2024-01-30T08:45:00Z',
      tags: ['جودة', 'فحص', 'منتجات'],
      filePath: '/reports/quality-jan-2024.pdf'
    },
    {
      id: '4',
      name: 'تقرير الموردين والمشتريات',
      type: 'suppliers',
      category: 'المشتريات',
      description: 'تقرير تقييم الموردين وحالة المشتريات',
      createdAt: '2024-02-05T12:10:00Z',
      createdBy: 'سارة خالد',
      fileSize: 2.1,
      format: 'PDF',
      status: 'processing',
      downloadCount: 0,
      lastAccessed: null,
      tags: ['موردين', 'مشتريات', 'تقييم'],
      filePath: '/reports/suppliers-feb-2024.pdf'
    },
    {
      id: '5',
      name: 'تقرير الأداء المالي',
      type: 'financial',
      category: 'المالية',
      description: 'تقرير الأداء المالي للربع الأول 2024',
      createdAt: '2024-02-10T09:30:00Z',
      createdBy: 'عبدالله أحمد',
      fileSize: 4.7,
      format: 'PDF',
      status: 'completed',
      downloadCount: 15,
      lastAccessed: '2024-02-11T14:25:00Z',
      tags: ['مالية', 'أداء', 'ربع سنوي'],
      filePath: '/reports/financial-q1-2024.pdf'
    }
  ]);

  // فئات التقارير
  const reportCategories = [
    { value: 'all', label: 'جميع التقارير', icon: FileText },
    { value: 'المخزون', label: 'تقارير المخزون', icon: Package },
    { value: 'المبيعات', label: 'تقارير المبيعات', icon: TrendingUp },
    { value: 'الجودة', label: 'تقارير الجودة', icon: BarChart3 },
    { value: 'المشتريات', label: 'تقارير المشتريات', icon: DollarSign },
    { value: 'المالية', label: 'التقارير المالية', icon: PieChart },
    { value: 'الموارد البشرية', label: 'الموارد البشرية', icon: Users }
  ];

  // نطاقات التاريخ
  const dateRanges = [
    { value: 'all', label: 'جميع التواريخ' },
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'quarter', label: 'هذا الربع' },
    { value: 'year', label: 'هذا العام' }
  ];

  // حالات التقارير
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    completed: 'مكتمل',
    processing: 'قيد المعالجة',
    failed: 'فشل',
    pending: 'في الانتظار'
  };

  // تصفية التقارير
  const filteredReports = savedReports
    .filter(report => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;

      const matchesDateRange = selectedDateRange === 'all' || checkDateRange(report.createdAt, selectedDateRange);

      return matchesSearch && matchesCategory && matchesDateRange;
    })
    .sort((a, b) => {
      const aValue =
        sortBy === 'date'
          ? new Date(a.createdAt)
          : sortBy === 'name'
            ? a.name
            : sortBy === 'size'
              ? a.fileSize
              : a.downloadCount;

      const bValue =
        sortBy === 'date'
          ? new Date(b.createdAt)
          : sortBy === 'name'
            ? b.name
            : sortBy === 'size'
              ? b.fileSize
              : b.downloadCount;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // فحص نطاق التاريخ
  const checkDateRange = (dateString, range) => {
    const date = new Date(dateString);
    const now = new Date();

    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      case 'month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const reportQuarter = Math.floor(date.getMonth() / 3);
        return reportQuarter === quarter && date.getFullYear() === now.getFullYear();
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  // تحميل التقرير
  const handleDownload = report => {
    // محاكاة تحميل الملف
    const link = document.createElement('a');
    link.href = report.filePath;
    link.download = `${report.name}.${report.format.toLowerCase()}`;
    link.click();

    // تحديث عداد التحميل
    const updatedReports = savedReports.map(r =>
      r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1, lastAccessed: new Date().toISOString() } : r
    );
    setSavedReports(updatedReports);
  };

  // معاينة التقرير
  const handlePreview = report => {
    setSelectedReport(report);
    setShowPreviewModal(true);

    // تحديث آخر وصول
    const updatedReports = savedReports.map(r =>
      r.id === report.id ? { ...r, lastAccessed: new Date().toISOString() } : r
    );
    setSavedReports(updatedReports);
  };

  // حذف التقرير
  const handleDelete = report => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  // تأكيد الحذف
  const confirmDelete = () => {
    const updatedReports = savedReports.filter(r => r.id !== selectedReport.id);
    setSavedReports(updatedReports);
    setShowDeleteModal(false);
    setSelectedReport(null);
  };

  // إحصائيات التقارير
  const stats = {
    total: savedReports.length,
    completed: savedReports.filter(r => r.status === 'completed').length,
    processing: savedReports.filter(r => r.status === 'processing').length,
    totalSize: savedReports.reduce((sum, r) => sum + r.fileSize, 0),
    totalDownloads: savedReports.reduce((sum, r) => sum + r.downloadCount, 0)
  };

  // أعمدة الجدول
  const columns = [
    {
      key: 'name',
      label: 'اسم التقرير',
      render: report => (
        <div className='flex items-start gap-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <FileText className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-medium text-gray-900'>{report.name}</h3>
            <p className='text-sm text-gray-500 mt-1'>{report.description}</p>
            <div className='flex items-center gap-2 mt-2'>
              {report.tags.map((tag, index) => (
                <Badge key={index} variant='secondary' size='sm'>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'الفئة',
      render: report => <Badge variant='outline'>{report.category}</Badge>
    },
    {
      key: 'status',
      label: 'الحالة',
      render: report => <Badge className={statusColors[report.status]}>{statusLabels[report.status]}</Badge>
    },
    {
      key: 'createdAt',
      label: 'تاريخ الإنشاء',
      render: report => (
        <div className='text-sm'>
          <div className='text-gray-900'>{formatDate(report.createdAt)}</div>
          <div className='text-gray-500'>بواسطة {report.createdBy}</div>
        </div>
      )
    },
    {
      key: 'fileInfo',
      label: 'معلومات الملف',
      render: report => (
        <div className='text-sm'>
          <div className='text-gray-900'>{report.format}</div>
          <div className='text-gray-500'>{formatFileSize(report.fileSize)}</div>
        </div>
      )
    },
    {
      key: 'stats',
      label: 'الإحصائيات',
      render: report => (
        <div className='text-sm'>
          <div className='text-gray-900'>{report.downloadCount} تحميل</div>
          {report.lastAccessed && <div className='text-gray-500'>آخر وصول: {formatDate(report.lastAccessed)}</div>}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: report => (
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => handlePreview(report)}
            icon={Eye}
            disabled={report.status !== 'completed'}
          >
            معاينة
          </Button>

          <Button
            size='sm'
            onClick={() => handleDownload(report)}
            icon={Download}
            disabled={report.status !== 'completed'}
          >
            تحميل
          </Button>

          <Button size='sm' variant='danger' onClick={() => handleDelete(report)} icon={Trash2}>
            حذف
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className='min-h-screen bg-gray-50' dir='rtl'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* العنوان والإحصائيات */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                <Archive className='h-8 w-8 text-blue-600' />
                مركز إدارة التقارير
              </h1>
              <p className='text-gray-600 mt-2'>عرض وإدارة جميع التقارير المحفوظة في النظام</p>
            </div>

            <Button onClick={() => alert('قريباً: إنشاء تقرير جديد')} icon={Plus}>
              إنشاء تقرير جديد
            </Button>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
            <Card className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>إجمالي التقارير</p>
                  <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
                </div>
                <FileText className='h-8 w-8 text-blue-600' />
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>التقارير المكتملة</p>
                  <p className='text-2xl font-bold text-green-600'>{stats.completed}</p>
                </div>
                <BarChart3 className='h-8 w-8 text-green-600' />
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>قيد المعالجة</p>
                  <p className='text-2xl font-bold text-yellow-600'>{stats.processing}</p>
                </div>
                <Clock className='h-8 w-8 text-yellow-600' />
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>الحجم الإجمالي</p>
                  <p className='text-2xl font-bold text-purple-600'>{formatFileSize(stats.totalSize)}</p>
                </div>
                <Archive className='h-8 w-8 text-purple-600' />
              </div>
            </Card>

            <Card className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>إجمالي التحميلات</p>
                  <p className='text-2xl font-bold text-indigo-600'>{stats.totalDownloads}</p>
                </div>
                <Download className='h-8 w-8 text-indigo-600' />
              </div>
            </Card>
          </div>
        </div>

        {/* أدوات البحث والتصفية */}
        <Card className='mb-8'>
          <Card.Content className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='md:col-span-2'>
                <Input
                  placeholder='البحث في التقارير...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>

              <EnhancedSelect
                value={selectedCategory}
                onChange={value => setSelectedCategory(value)}
                placeholder='اختر الفئة'
              >
                {reportCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </EnhancedSelect>

              <EnhancedSelect
                value={selectedDateRange}
                onChange={value => setSelectedDateRange(value)}
                placeholder='اختر النطاق الزمني'
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </EnhancedSelect>
            </div>

            <div className='flex items-center justify-between mt-4 pt-4 border-t'>
              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-600'>
                  عرض {filteredReports.length} من {savedReports.length} تقرير
                </span>
              </div>

              <div className='flex items-center gap-4'>
                <span className='text-sm text-gray-600'>ترتيب حسب:</span>

                <EnhancedSelect value={sortBy} onChange={value => setSortBy(value)} className='w-32'>
                  <option value='date'>التاريخ</option>
                  <option value='name'>الاسم</option>
                  <option value='size'>الحجم</option>
                  <option value='downloads'>التحميلات</option>
                </EnhancedSelect>

                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  icon={sortOrder === 'asc' ? TrendingUp : TrendingUp}
                >
                  {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* جدول التقارير */}
        <Card>
          <DataTable
            data={filteredReports}
            columns={columns}
            loading={loading}
            emptyMessage='لا توجد تقارير محفوظة'
            emptyDescription='لم يتم العثور على أي تقارير تطابق معايير البحث'
          />
        </Card>
      </div>

      {/* نافذة معاينة التقرير */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title='معاينة التقرير' size='lg'>
        {selectedReport && (
          <div className='space-y-6'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <FileText className='h-6 w-6 text-blue-600' />
              </div>

              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-gray-900'>{selectedReport.name}</h3>
                <p className='text-gray-600 mt-1'>{selectedReport.description}</p>

                <div className='flex items-center gap-4 mt-3'>
                  <Badge className={statusColors[selectedReport.status]}>{statusLabels[selectedReport.status]}</Badge>

                  <span className='text-sm text-gray-500'>
                    {selectedReport.format} • {formatFileSize(selectedReport.fileSize)}
                  </span>

                  <span className='text-sm text-gray-500'>{selectedReport.downloadCount} تحميل</span>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
              <div>
                <span className='text-sm font-medium text-gray-600'>تاريخ الإنشاء:</span>
                <p className='text-sm text-gray-900'>{formatDate(selectedReport.createdAt)}</p>
              </div>

              <div>
                <span className='text-sm font-medium text-gray-600'>المنشئ:</span>
                <p className='text-sm text-gray-900'>{selectedReport.createdBy}</p>
              </div>

              <div>
                <span className='text-sm font-medium text-gray-600'>الفئة:</span>
                <p className='text-sm text-gray-900'>{selectedReport.category}</p>
              </div>

              <div>
                <span className='text-sm font-medium text-gray-600'>آخر وصول:</span>
                <p className='text-sm text-gray-900'>
                  {selectedReport.lastAccessed ? formatDate(selectedReport.lastAccessed) : 'لم يتم الوصول'}
                </p>
              </div>
            </div>

            <div>
              <span className='text-sm font-medium text-gray-600'>العلامات:</span>
              <div className='flex items-center gap-2 mt-2'>
                {selectedReport.tags.map((tag, index) => (
                  <Badge key={index} variant='secondary'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setShowPreviewModal(false)}>
                إغلاق
              </Button>

              <Button
                onClick={() => {
                  handleDownload(selectedReport);
                  setShowPreviewModal(false);
                }}
                icon={Download}
              >
                تحميل التقرير
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* نافذة تأكيد الحذف */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title='تأكيد حذف التقرير' size='md'>
        {selectedReport && (
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-6 w-6 text-red-600 mt-1' />
              <div>
                <p className='text-gray-900 font-medium'>هل أنت متأكد من حذف التقرير "{selectedReport.name}"؟</p>
                <p className='text-gray-600 text-sm mt-1'>لا يمكن التراجع عن هذا الإجراء وسيتم فقدان الملف نهائياً.</p>
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setShowDeleteModal(false)}>
                إلغاء
              </Button>

              <Button variant='danger' onClick={confirmDelete} icon={Trash2}>
                تأكيد الحذف
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReportsCenter;
