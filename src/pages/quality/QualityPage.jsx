import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  DataTable,
  StatCard,
  StatGrid,
  Form,
  Modal,
  Alert,
  SearchFilter,
  Tabs,
  Badge
} from '../../components/common';
import { useQualityStore } from '../../services';
import { formatters } from '../../utils';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Clock,
  Target
} from 'lucide-react';
import { QUALITY_TEST_TYPES, QUALITY_TEST_RESULTS, STATUS_OPTIONS, ROLES } from '../../constants';

/**
 * صفحة إدارة الجودة
 */
const QualityPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // test, inspection, audit, standard
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const {
    tests,
    inspections,
    audits,
    standards,
    loading,
    loadTests,
    loadInspections,
    loadAudits,
    loadStandards,
    addTest,
    updateTest,
    removeTest,
    addInspection,
    updateInspection,
    removeInspection,
    addAudit,
    updateAudit,
    removeAudit,
    addStandard,
    updateStandard,
    removeStandard
  } = useQualityStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadTests();
    loadInspections();
    loadAudits();
    loadStandards();
  }, []);

  // إضافة تنبيه
  const addAlert = alert => {
    const id = Date.now().toString();
    setAlerts(prev => [...prev, { ...alert, id }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  // حساب الإحصائيات
  const stats = {
    totalTests: tests.length,
    passedTests: tests.filter(test => test.result === 'pass').length,
    failedTests: tests.filter(test => test.result === 'fail').length,
    pendingTests: tests.filter(test => test.status === 'pending').length,
    totalInspections: inspections.length,
    completedInspections: inspections.filter(inspection => inspection.status === 'completed').length,
    totalAudits: audits.length,
    activeAudits: audits.filter(audit => audit.status === 'active').length,
    totalStandards: standards.length,
    activeStandards: standards.filter(standard => standard.status === 'active').length,
    qualityScore: {
      current: tests.length > 0 ? (tests.filter(test => test.result === 'pass').length / tests.length) * 100 : 0,
      target: 95
    },
    complianceRate: {
      current:
        inspections.length > 0
          ? (inspections.filter(inspection => inspection.result === 'compliant').length / inspections.length) * 100
          : 0,
      target: 98
    }
  };

  // معالجات الأحداث
  const handleAdd = type => {
    setModalType(type);
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (type, item) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      return;
    }

    try {
      let success = false;
      switch (type) {
        case 'test':
          success = removeTest(item.id);
          break;
        case 'inspection':
          success = removeInspection(item.id);
          break;
        case 'audit':
          success = removeAudit(item.id);
          break;
        case 'standard':
          success = removeStandard(item.id);
          break;
      }

      if (success) {
        addAlert({
          type: 'success',
          title: 'تم الحذف بنجاح',
          message: 'تم حذف العنصر بنجاح'
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في الحذف',
        message: error.message
      });
    }
  };

  const handleStatusChange = async (type, item, newStatus) => {
    try {
      let success = false;
      const updatedItem = { ...item, status: newStatus };

      switch (type) {
        case 'test':
          success = updateTest(item.id, updatedItem);
          break;
        case 'inspection':
          success = updateInspection(item.id, updatedItem);
          break;
        case 'audit':
          success = updateAudit(item.id, updatedItem);
          break;
        case 'standard':
          success = updateStandard(item.id, updatedItem);
          break;
      }

      if (success) {
        addAlert({
          type: 'success',
          title: 'تم تحديث الحالة',
          message: 'تم تحديث حالة العنصر بنجاح'
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في التحديث',
        message: error.message
      });
    }
  };

  const handleSubmit = async formData => {
    try {
      let success = false;
      let message = '';

      switch (modalType) {
        case 'test':
          if (selectedItem) {
            success = updateTest(selectedItem.id, formData);
            message = 'تم تحديث الاختبار بنجاح';
          } else {
            success = addTest(formData);
            message = 'تم إضافة الاختبار بنجاح';
          }
          break;
        case 'inspection':
          if (selectedItem) {
            success = updateInspection(selectedItem.id, formData);
            message = 'تم تحديث التفتيش بنجاح';
          } else {
            success = addInspection(formData);
            message = 'تم إضافة التفتيش بنجاح';
          }
          break;
        case 'audit':
          if (selectedItem) {
            success = updateAudit(selectedItem.id, formData);
            message = 'تم تحديث المراجعة بنجاح';
          } else {
            success = addAudit(formData);
            message = 'تم إضافة المراجعة بنجاح';
          }
          break;
        case 'standard':
          if (selectedItem) {
            success = updateStandard(selectedItem.id, formData);
            message = 'تم تحديث المعيار بنجاح';
          } else {
            success = addStandard(formData);
            message = 'تم إضافة المعيار بنجاح';
          }
          break;
      }

      if (success) {
        setShowModal(false);
        addAlert({
          type: 'success',
          title: 'تمت العملية بنجاح',
          message
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في العملية',
        message: error.message
      });
    }
  };

  // تكوين الأعمدة للجداول
  const testColumns = [
    {
      key: 'number',
      title: 'رقم الاختبار',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع الاختبار',
      filterable: true,
      filterType: 'select',
      filterOptions: QUALITY_TEST_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'productName',
      title: 'المنتج',
      sortable: true,
      searchable: true
    },
    {
      key: 'batchNumber',
      title: 'رقم الدفعة',
      sortable: true,
      searchable: true
    },
    {
      key: 'testDate',
      title: 'تاريخ الاختبار',
      format: 'date',
      sortable: true
    },
    {
      key: 'testedBy',
      title: 'المختبر',
      searchable: true
    },
    {
      key: 'result',
      title: 'النتيجة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'pass':
            return 'success';
          case 'fail':
            return 'danger';
          case 'conditional':
            return 'warning';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: QUALITY_TEST_RESULTS.map(result => ({ value: result.value, label: result.label }))
    },
    {
      key: 'score',
      title: 'النقاط',
      sortable: true,
      render: value => (value ? `${value}%` : '-')
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'completed':
            return 'success';
          case 'in_progress':
            return 'primary';
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
      filterOptions: STATUS_OPTIONS.map(status => ({ value: status, label: status }))
    }
  ];

  const inspectionColumns = [
    {
      key: 'number',
      title: 'رقم التفتيش',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع التفتيش',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'incoming', label: 'تفتيش الاستلام' },
        { value: 'in_process', label: 'تفتيش العملية' },
        { value: 'final', label: 'تفتيش نهائي' },
        { value: 'random', label: 'تفتيش عشوائي' }
      ]
    },
    {
      key: 'productName',
      title: 'المنتج',
      sortable: true,
      searchable: true
    },
    {
      key: 'inspectionDate',
      title: 'تاريخ التفتيش',
      format: 'date',
      sortable: true
    },
    {
      key: 'inspector',
      title: 'المفتش',
      searchable: true
    },
    {
      key: 'sampleSize',
      title: 'حجم العينة',
      sortable: true,
      format: 'number'
    },
    {
      key: 'defectsFound',
      title: 'العيوب المكتشفة',
      sortable: true,
      format: 'number'
    },
    {
      key: 'result',
      title: 'النتيجة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'compliant':
            return 'success';
          case 'non_compliant':
            return 'danger';
          case 'conditional':
            return 'warning';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'compliant', label: 'مطابق' },
        { value: 'non_compliant', label: 'غير مطابق' },
        { value: 'conditional', label: 'مشروط' }
      ]
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'completed':
            return 'success';
          case 'in_progress':
            return 'primary';
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
      filterOptions: STATUS_OPTIONS.map(status => ({ value: status, label: status }))
    }
  ];

  const auditColumns = [
    {
      key: 'number',
      title: 'رقم المراجعة',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع المراجعة',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'internal', label: 'داخلية' },
        { value: 'external', label: 'خارجية' },
        { value: 'supplier', label: 'مورد' },
        { value: 'customer', label: 'عميل' }
      ]
    },
    {
      key: 'scope',
      title: 'النطاق',
      searchable: true
    },
    {
      key: 'auditDate',
      title: 'تاريخ المراجعة',
      format: 'date',
      sortable: true
    },
    {
      key: 'auditor',
      title: 'المراجع',
      searchable: true
    },
    {
      key: 'duration',
      title: 'المدة',
      render: value => formatters.duration(value)
    },
    {
      key: 'findingsCount',
      title: 'عدد الملاحظات',
      sortable: true,
      format: 'number'
    },
    {
      key: 'score',
      title: 'النقاط',
      sortable: true,
      render: value => (value ? `${value}%` : '-')
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'completed':
            return 'success';
          case 'active':
            return 'primary';
          case 'planned':
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
        { value: 'planned', label: 'مخططة' },
        { value: 'active', label: 'نشطة' },
        { value: 'completed', label: 'مكتملة' },
        { value: 'cancelled', label: 'ملغية' }
      ]
    }
  ];

  const standardColumns = [
    {
      key: 'number',
      title: 'رقم المعيار',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'اسم المعيار',
      sortable: true,
      searchable: true
    },
    {
      key: 'category',
      title: 'الفئة',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'iso', label: 'ISO' },
        { value: 'saso', label: 'SASO' },
        { value: 'internal', label: 'داخلي' },
        { value: 'customer', label: 'عميل' }
      ]
    },
    {
      key: 'version',
      title: 'الإصدار',
      sortable: true
    },
    {
      key: 'effectiveDate',
      title: 'تاريخ السريان',
      format: 'date',
      sortable: true
    },
    {
      key: 'reviewDate',
      title: 'تاريخ المراجعة',
      format: 'date',
      sortable: true
    },
    {
      key: 'owner',
      title: 'المسؤول',
      searchable: true
    },
    {
      key: 'complianceRate',
      title: 'معدل الامتثال',
      sortable: true,
      format: 'percentage'
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'active':
            return 'success';
          case 'draft':
            return 'warning';
          case 'obsolete':
            return 'danger';
          case 'under_review':
            return 'primary';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'draft', label: 'مسودة' },
        { value: 'active', label: 'نشط' },
        { value: 'under_review', label: 'قيد المراجعة' },
        { value: 'obsolete', label: 'ملغي' }
      ]
    }
  ];

  // إجراءات الجداول
  const testActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: test => handleEdit('test', test)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: test => handleEdit('test', test)
    },
    {
      icon: Download,
      label: 'تحميل التقرير',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: test => {
        // تنفيذ تحميل التقرير
        addAlert({
          type: 'info',
          title: 'تحميل التقرير',
          message: 'سيتم تحميل التقرير قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: test => handleDelete('test', test)
    }
  ];

  const inspectionActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: inspection => handleEdit('inspection', inspection)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: inspection => handleEdit('inspection', inspection)
    },
    {
      icon: Download,
      label: 'تحميل التقرير',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: inspection => {
        addAlert({
          type: 'info',
          title: 'تحميل التقرير',
          message: 'سيتم تحميل التقرير قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: inspection => handleDelete('inspection', inspection)
    }
  ];

  const auditActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: audit => handleEdit('audit', audit)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: audit => handleEdit('audit', audit)
    },
    {
      icon: Download,
      label: 'تحميل التقرير',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: audit => {
        addAlert({
          type: 'info',
          title: 'تحميل التقرير',
          message: 'سيتم تحميل التقرير قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: audit => handleDelete('audit', audit)
    }
  ];

  const standardActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: standard => handleEdit('standard', standard)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: standard => handleEdit('standard', standard)
    },
    {
      icon: Download,
      label: 'تحميل الوثيقة',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: standard => {
        addAlert({
          type: 'info',
          title: 'تحميل الوثيقة',
          message: 'سيتم تحميل الوثيقة قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: standard => handleDelete('standard', standard)
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'test':
        return [
          {
            name: 'number',
            label: 'رقم الاختبار',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الاختبار'
          },
          {
            name: 'type',
            label: 'نوع الاختبار',
            type: 'select',
            required: true,
            options: QUALITY_TEST_TYPES
          },
          {
            name: 'productId',
            label: 'المنتج',
            type: 'select',
            required: true,
            options: [] // يجب ربطها بقائمة المنتجات
          },
          {
            name: 'batchNumber',
            label: 'رقم الدفعة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الدفعة'
          },
          {
            name: 'testDate',
            label: 'تاريخ الاختبار',
            type: 'date',
            required: true
          },
          {
            name: 'testedBy',
            label: 'المختبر',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المختبر'
          },
          {
            name: 'testMethod',
            label: 'طريقة الاختبار',
            type: 'text',
            placeholder: 'أدخل طريقة الاختبار'
          },
          {
            name: 'parameters',
            label: 'المعايير المختبرة',
            type: 'textarea',
            placeholder: 'أدخل المعايير المختبرة'
          },
          {
            name: 'result',
            label: 'النتيجة',
            type: 'select',
            options: QUALITY_TEST_RESULTS
          },
          {
            name: 'score',
            label: 'النقاط (%)',
            type: 'number',
            min: 0,
            max: 100,
            placeholder: 'أدخل النقاط'
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل ملاحظات الاختبار'
          }
        ];

      case 'inspection':
        return [
          {
            name: 'number',
            label: 'رقم التفتيش',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم التفتيش'
          },
          {
            name: 'type',
            label: 'نوع التفتيش',
            type: 'select',
            required: true,
            options: [
              { value: 'incoming', label: 'تفتيش الاستلام' },
              { value: 'in_process', label: 'تفتيش العملية' },
              { value: 'final', label: 'تفتيش نهائي' },
              { value: 'random', label: 'تفتيش عشوائي' }
            ]
          },
          {
            name: 'productId',
            label: 'المنتج',
            type: 'select',
            required: true,
            options: [] // يجب ربطها بقائمة المنتجات
          },
          {
            name: 'inspectionDate',
            label: 'تاريخ التفتيش',
            type: 'date',
            required: true
          },
          {
            name: 'inspector',
            label: 'المفتش',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المفتش'
          },
          {
            name: 'sampleSize',
            label: 'حجم العينة',
            type: 'number',
            required: true,
            placeholder: 'أدخل حجم العينة'
          },
          {
            name: 'defectsFound',
            label: 'العيوب المكتشفة',
            type: 'number',
            placeholder: 'أدخل عدد العيوب'
          },
          {
            name: 'checkpoints',
            label: 'نقاط الفحص',
            type: 'textarea',
            placeholder: 'أدخل نقاط الفحص'
          },
          {
            name: 'result',
            label: 'النتيجة',
            type: 'select',
            options: [
              { value: 'compliant', label: 'مطابق' },
              { value: 'non_compliant', label: 'غير مطابق' },
              { value: 'conditional', label: 'مشروط' }
            ]
          },
          {
            name: 'recommendations',
            label: 'التوصيات',
            type: 'textarea',
            placeholder: 'أدخل التوصيات'
          }
        ];

      case 'audit':
        return [
          {
            name: 'number',
            label: 'رقم المراجعة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم المراجعة'
          },
          {
            name: 'type',
            label: 'نوع المراجعة',
            type: 'select',
            required: true,
            options: [
              { value: 'internal', label: 'داخلية' },
              { value: 'external', label: 'خارجية' },
              { value: 'supplier', label: 'مورد' },
              { value: 'customer', label: 'عميل' }
            ]
          },
          {
            name: 'scope',
            label: 'النطاق',
            type: 'text',
            required: true,
            placeholder: 'أدخل نطاق المراجعة'
          },
          {
            name: 'auditDate',
            label: 'تاريخ المراجعة',
            type: 'date',
            required: true
          },
          {
            name: 'auditor',
            label: 'المراجع',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المراجع'
          },
          {
            name: 'duration',
            label: 'المدة (بالساعات)',
            type: 'number',
            placeholder: 'أدخل مدة المراجعة'
          },
          {
            name: 'objectives',
            label: 'الأهداف',
            type: 'textarea',
            placeholder: 'أدخل أهداف المراجعة'
          },
          {
            name: 'criteria',
            label: 'المعايير',
            type: 'textarea',
            placeholder: 'أدخل معايير المراجعة'
          },
          {
            name: 'findings',
            label: 'الملاحظات',
            type: 'textarea',
            placeholder: 'أدخل ملاحظات المراجعة'
          },
          {
            name: 'score',
            label: 'النقاط (%)',
            type: 'number',
            min: 0,
            max: 100,
            placeholder: 'أدخل النقاط'
          }
        ];

      case 'standard':
        return [
          {
            name: 'number',
            label: 'رقم المعيار',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم المعيار'
          },
          {
            name: 'name',
            label: 'اسم المعيار',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المعيار'
          },
          {
            name: 'category',
            label: 'الفئة',
            type: 'select',
            required: true,
            options: [
              { value: 'iso', label: 'ISO' },
              { value: 'saso', label: 'SASO' },
              { value: 'internal', label: 'داخلي' },
              { value: 'customer', label: 'عميل' }
            ]
          },
          {
            name: 'version',
            label: 'الإصدار',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الإصدار'
          },
          {
            name: 'effectiveDate',
            label: 'تاريخ السريان',
            type: 'date',
            required: true
          },
          {
            name: 'reviewDate',
            label: 'تاريخ المراجعة',
            type: 'date',
            required: true
          },
          {
            name: 'owner',
            label: 'المسؤول',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المسؤول'
          },
          {
            name: 'description',
            label: 'الوصف',
            type: 'textarea',
            placeholder: 'أدخل وصف المعيار'
          },
          {
            name: 'requirements',
            label: 'المتطلبات',
            type: 'textarea',
            placeholder: 'أدخل متطلبات المعيار'
          },
          {
            name: 'complianceRate',
            label: 'معدل الامتثال (%)',
            type: 'number',
            min: 0,
            max: 100,
            placeholder: 'أدخل معدل الامتثال'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'test':
        return `${action} اختبار جودة`;
      case 'inspection':
        return `${action} تفتيش`;
      case 'audit':
        return `${action} مراجعة`;
      case 'standard':
        return `${action} معيار جودة`;
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
      id: 'tests',
      label: 'اختبارات الجودة',
      icon: Shield
    },
    {
      id: 'inspections',
      label: 'التفتيش',
      icon: Eye
    },
    {
      id: 'audits',
      label: 'المراجعات',
      icon: FileText
    },
    {
      id: 'standards',
      label: 'معايير الجودة',
      icon: Target
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
        <h1 className='text-2xl font-bold text-gray-900'>إدارة الجودة</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي الاختبارات' value={stats.totalTests} icon={Shield} color='blue' />
            <StatCard title='اختبارات ناجحة' value={stats.passedTests} icon={CheckCircle} color='green' />
            <StatCard title='اختبارات فاشلة' value={stats.failedTests} icon={XCircle} color='red' />
            <StatCard title='اختبارات معلقة' value={stats.pendingTests} icon={Clock} color='orange' />
            <StatCard title='إجمالي التفتيش' value={stats.totalInspections} icon={Eye} color='purple' />
            <StatCard title='مراجعات نشطة' value={stats.activeAudits} icon={FileText} color='indigo' />
            <StatCard
              title='نقاط الجودة'
              value={stats.qualityScore.current}
              format='percentage'
              icon={TrendingUp}
              color='green'
              suffix='%'
            />
            <StatCard
              title='معدل الامتثال'
              value={stats.complianceRate.current}
              format='percentage'
              icon={Target}
              color='blue'
              suffix='%'
            />
          </StatGrid>

          {/* الرسوم البيانية والتقارير */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <Card.Header>
                <Card.Title>اختبارات الجودة الأخيرة</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={tests.slice(0, 5)}
                  columns={testColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>التفتيش الأخير</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={inspections.slice(0, 5)}
                  columns={inspectionColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة اختبارات الجودة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('test')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة اختبار
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={tests}
              columns={testColumns}
              loading={loading.tests}
              actions={testActions}
              onRefresh={loadTests}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'inspections' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة التفتيش</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('inspection')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة تفتيش
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={inspections}
              columns={inspectionColumns}
              loading={loading.inspections}
              actions={inspectionActions}
              onRefresh={loadInspections}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'audits' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة المراجعات</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('audit')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة مراجعة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={audits}
              columns={auditColumns}
              loading={loading.audits}
              actions={auditActions}
              onRefresh={loadAudits}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'standards' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة معايير الجودة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('standard')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة معيار
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={standards}
              columns={standardColumns}
              loading={loading.standards}
              actions={standardActions}
              onRefresh={loadStandards}
            />
          </Card.Content>
        </Card>
      )}

      {/* نافذة النموذج */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={getModalTitle()} size='lg'>
        <Form
          fields={getFormFields()}
          initialData={selectedItem || {}}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitText={selectedItem ? 'تحديث' : 'إضافة'}
        />
      </Modal>
    </div>
  );
};

export default QualityPage;
