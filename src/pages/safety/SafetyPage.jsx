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
import { useSafetyStore } from '../../services';
import { formatters } from '../../utils';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
  Target,
  HardHat,
  Activity,
  Zap
} from 'lucide-react';
import {
  SAFETY_REPORT_TYPES,
  SEVERITY_LEVELS,
  REPORT_STATUS,
  ALERT_TYPES,
  STATUS_OPTIONS,
  ROLES
} from '../../constants';

/**
 * صفحة إدارة السلامة
 */
const SafetyPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // incident, training, inspection, procedure
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const {
    incidents,
    trainings,
    inspections,
    procedures,
    loading,
    loadIncidents,
    loadTrainings,
    loadInspections,
    loadProcedures,
    addIncident,
    updateIncident,
    removeIncident,
    addTraining,
    updateTraining,
    removeTraining,
    addInspection,
    updateInspection,
    removeInspection,
    addProcedure,
    updateProcedure,
    removeProcedure
  } = useSafetyStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadIncidents();
    loadTrainings();
    loadInspections();
    loadProcedures();
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
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(incident => incident.status === 'open').length,
    closedIncidents: incidents.filter(incident => incident.status === 'closed').length,
    criticalIncidents: incidents.filter(incident => incident.severity === 'critical').length,
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter(training => training.status === 'completed').length,
    totalInspections: inspections.length,
    passedInspections: inspections.filter(inspection => inspection.result === 'pass').length,
    totalProcedures: procedures.length,
    activeProcedures: procedures.filter(procedure => procedure.status === 'active').length,
    safetyScore: {
      current:
        incidents.length > 0 ? Math.max(0, 100 - incidents.filter(i => i.severity === 'critical').length * 10) : 100,
      target: 95
    },
    complianceRate: {
      current:
        inspections.length > 0
          ? (inspections.filter(inspection => inspection.result === 'pass').length / inspections.length) * 100
          : 0,
      target: 98
    },
    trainingCompletion: {
      current:
        trainings.length > 0
          ? (trainings.filter(training => training.status === 'completed').length / trainings.length) * 100
          : 0,
      target: 90
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
        case 'incident':
          success = removeIncident(item.id);
          break;
        case 'training':
          success = removeTraining(item.id);
          break;
        case 'inspection':
          success = removeInspection(item.id);
          break;
        case 'procedure':
          success = removeProcedure(item.id);
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
        case 'incident':
          success = updateIncident(item.id, updatedItem);
          break;
        case 'training':
          success = updateTraining(item.id, updatedItem);
          break;
        case 'inspection':
          success = updateInspection(item.id, updatedItem);
          break;
        case 'procedure':
          success = updateProcedure(item.id, updatedItem);
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
        case 'incident':
          if (selectedItem) {
            success = updateIncident(selectedItem.id, formData);
            message = 'تم تحديث الحادث بنجاح';
          } else {
            success = addIncident(formData);
            message = 'تم إضافة الحادث بنجاح';
          }
          break;
        case 'training':
          if (selectedItem) {
            success = updateTraining(selectedItem.id, formData);
            message = 'تم تحديث التدريب بنجاح';
          } else {
            success = addTraining(formData);
            message = 'تم إضافة التدريب بنجاح';
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
        case 'procedure':
          if (selectedItem) {
            success = updateProcedure(selectedItem.id, formData);
            message = 'تم تحديث الإجراء بنجاح';
          } else {
            success = addProcedure(formData);
            message = 'تم إضافة الإجراء بنجاح';
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
  const incidentColumns = [
    {
      key: 'number',
      title: 'رقم الحادث',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع الحادث',
      filterable: true,
      filterType: 'select',
      filterOptions: SAFETY_REPORT_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'title',
      title: 'العنوان',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'تاريخ الحادث',
      format: 'date',
      sortable: true
    },
    {
      key: 'location',
      title: 'الموقع',
      searchable: true
    },
    {
      key: 'reportedBy',
      title: 'المُبلِغ',
      searchable: true
    },
    {
      key: 'severity',
      title: 'الخطورة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'critical':
            return 'danger';
          case 'high':
            return 'warning';
          case 'medium':
            return 'primary';
          case 'low':
            return 'default';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: SEVERITY_LEVELS.map(level => ({ value: level.value, label: level.label }))
    },
    {
      key: 'injuryCount',
      title: 'عدد الإصابات',
      sortable: true,
      format: 'number'
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'closed':
            return 'success';
          case 'investigating':
            return 'primary';
          case 'open':
            return 'warning';
          case 'resolved':
            return 'success';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: REPORT_STATUS.map(status => ({ value: status.value, label: status.label }))
    }
  ];

  const trainingColumns = [
    {
      key: 'number',
      title: 'رقم التدريب',
      sortable: true,
      searchable: true
    },
    {
      key: 'title',
      title: 'عنوان التدريب',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع التدريب',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'safety_orientation', label: 'توجيه السلامة' },
        { value: 'emergency_response', label: 'الاستجابة للطوارئ' },
        { value: 'equipment_safety', label: 'سلامة المعدات' },
        { value: 'chemical_safety', label: 'السلامة الكيميائية' },
        { value: 'fire_safety', label: 'السلامة من الحرائق' }
      ]
    },
    {
      key: 'startDate',
      title: 'تاريخ البدء',
      format: 'date',
      sortable: true
    },
    {
      key: 'endDate',
      title: 'تاريخ الانتهاء',
      format: 'date',
      sortable: true
    },
    {
      key: 'instructor',
      title: 'المدرب',
      searchable: true
    },
    {
      key: 'participantsCount',
      title: 'عدد المشاركين',
      sortable: true,
      format: 'number'
    },
    {
      key: 'completedCount',
      title: 'المكتملين',
      sortable: true,
      format: 'number'
    },
    {
      key: 'completionRate',
      title: 'معدل الإكمال',
      sortable: true,
      render: (value, row) => {
        const rate = row.participantsCount > 0 ? (row.completedCount / row.participantsCount) * 100 : 0;
        return formatters.percentage(rate / 100);
      }
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
          case 'scheduled':
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
        { value: 'routine', label: 'دوري' },
        { value: 'emergency', label: 'طارئ' },
        { value: 'compliance', label: 'امتثال' },
        { value: 'equipment', label: 'معدات' },
        { value: 'workplace', label: 'مكان العمل' }
      ]
    },
    {
      key: 'area',
      title: 'المنطقة',
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
      key: 'checkpointsTotal',
      title: 'إجمالي النقاط',
      sortable: true,
      format: 'number'
    },
    {
      key: 'checkpointsPassed',
      title: 'النقاط المجتازة',
      sortable: true,
      format: 'number'
    },
    {
      key: 'score',
      title: 'النقاط',
      sortable: true,
      render: (value, row) => {
        const score = row.checkpointsTotal > 0 ? (row.checkpointsPassed / row.checkpointsTotal) * 100 : 0;
        return `${score.toFixed(1)}%`;
      }
    },
    {
      key: 'violationsCount',
      title: 'عدد المخالفات',
      sortable: true,
      format: 'number'
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
      filterOptions: [
        { value: 'pass', label: 'نجح' },
        { value: 'fail', label: 'فشل' },
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
          case 'scheduled':
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

  const procedureColumns = [
    {
      key: 'number',
      title: 'رقم الإجراء',
      sortable: true,
      searchable: true
    },
    {
      key: 'title',
      title: 'عنوان الإجراء',
      sortable: true,
      searchable: true
    },
    {
      key: 'category',
      title: 'الفئة',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'emergency', label: 'طوارئ' },
        { value: 'safety', label: 'سلامة' },
        { value: 'equipment', label: 'معدات' },
        { value: 'chemical', label: 'كيميائي' },
        { value: 'fire', label: 'حريق' }
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
      key: 'trainingRequired',
      title: 'يتطلب تدريب',
      type: 'badge',
      badgeVariant: value => (value ? 'success' : 'default'),
      render: value => (value ? 'نعم' : 'لا')
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
          case 'under_review':
            return 'primary';
          case 'obsolete':
            return 'danger';
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
  const incidentActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: incident => handleEdit('incident', incident)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: incident => handleEdit('incident', incident)
    },
    {
      icon: CheckCircle,
      label: 'إغلاق',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: incident => handleStatusChange('incident', incident, 'closed'),
      show: incident => incident.status !== 'closed'
    },
    {
      icon: Download,
      label: 'تحميل التقرير',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: incident => {
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
      onClick: incident => handleDelete('incident', incident)
    }
  ];

  const trainingActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: training => handleEdit('training', training)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: training => handleEdit('training', training)
    },
    {
      icon: Users,
      label: 'المشاركين',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: training => {
        addAlert({
          type: 'info',
          title: 'قائمة المشاركين',
          message: 'سيتم عرض قائمة المشاركين قريباً'
        });
      }
    },
    {
      icon: Download,
      label: 'تحميل الشهادات',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: training => {
        addAlert({
          type: 'info',
          title: 'تحميل الشهادات',
          message: 'سيتم تحميل الشهادات قريباً'
        });
      },
      show: training => training.status === 'completed'
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: training => handleDelete('training', training)
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

  const procedureActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: procedure => handleEdit('procedure', procedure)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: procedure => handleEdit('procedure', procedure)
    },
    {
      icon: Download,
      label: 'تحميل الوثيقة',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: procedure => {
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
      onClick: procedure => handleDelete('procedure', procedure)
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'incident':
        return [
          {
            name: 'number',
            label: 'رقم الحادث',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الحادث'
          },
          {
            name: 'type',
            label: 'نوع الحادث',
            type: 'select',
            required: true,
            options: SAFETY_REPORT_TYPES
          },
          {
            name: 'title',
            label: 'عنوان الحادث',
            type: 'text',
            required: true,
            placeholder: 'أدخل عنوان الحادث'
          },
          {
            name: 'date',
            label: 'تاريخ الحادث',
            type: 'datetime-local',
            required: true
          },
          {
            name: 'location',
            label: 'موقع الحادث',
            type: 'text',
            required: true,
            placeholder: 'أدخل موقع الحادث'
          },
          {
            name: 'reportedBy',
            label: 'المُبلِغ',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المُبلِغ'
          },
          {
            name: 'severity',
            label: 'مستوى الخطورة',
            type: 'select',
            required: true,
            options: SEVERITY_LEVELS
          },
          {
            name: 'injuryCount',
            label: 'عدد الإصابات',
            type: 'number',
            min: 0,
            placeholder: 'أدخل عدد الإصابات'
          },
          {
            name: 'description',
            label: 'وصف الحادث',
            type: 'textarea',
            required: true,
            placeholder: 'أدخل وصف تفصيلي للحادث'
          },
          {
            name: 'immediateActions',
            label: 'الإجراءات الفورية',
            type: 'textarea',
            placeholder: 'أدخل الإجراءات المتخذة فوراً'
          },
          {
            name: 'rootCause',
            label: 'السبب الجذري',
            type: 'textarea',
            placeholder: 'أدخل السبب الجذري للحادث'
          },
          {
            name: 'correctiveActions',
            label: 'الإجراءات التصحيحية',
            type: 'textarea',
            placeholder: 'أدخل الإجراءات التصحيحية المطلوبة'
          }
        ];

      case 'training':
        return [
          {
            name: 'number',
            label: 'رقم التدريب',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم التدريب'
          },
          {
            name: 'title',
            label: 'عنوان التدريب',
            type: 'text',
            required: true,
            placeholder: 'أدخل عنوان التدريب'
          },
          {
            name: 'type',
            label: 'نوع التدريب',
            type: 'select',
            required: true,
            options: [
              { value: 'safety_orientation', label: 'توجيه السلامة' },
              { value: 'emergency_response', label: 'الاستجابة للطوارئ' },
              { value: 'equipment_safety', label: 'سلامة المعدات' },
              { value: 'chemical_safety', label: 'السلامة الكيميائية' },
              { value: 'fire_safety', label: 'السلامة من الحرائق' }
            ]
          },
          {
            name: 'startDate',
            label: 'تاريخ البدء',
            type: 'date',
            required: true
          },
          {
            name: 'endDate',
            label: 'تاريخ الانتهاء',
            type: 'date',
            required: true
          },
          {
            name: 'instructor',
            label: 'المدرب',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المدرب'
          },
          {
            name: 'duration',
            label: 'مدة التدريب (بالساعات)',
            type: 'number',
            required: true,
            placeholder: 'أدخل مدة التدريب'
          },
          {
            name: 'participantsCount',
            label: 'عدد المشاركين',
            type: 'number',
            required: true,
            placeholder: 'أدخل عدد المشاركين'
          },
          {
            name: 'location',
            label: 'مكان التدريب',
            type: 'text',
            required: true,
            placeholder: 'أدخل مكان التدريب'
          },
          {
            name: 'objectives',
            label: 'أهداف التدريب',
            type: 'textarea',
            placeholder: 'أدخل أهداف التدريب'
          },
          {
            name: 'content',
            label: 'محتوى التدريب',
            type: 'textarea',
            placeholder: 'أدخل محتوى التدريب'
          },
          {
            name: 'requirements',
            label: 'المتطلبات',
            type: 'textarea',
            placeholder: 'أدخل متطلبات التدريب'
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
              { value: 'routine', label: 'دوري' },
              { value: 'emergency', label: 'طارئ' },
              { value: 'compliance', label: 'امتثال' },
              { value: 'equipment', label: 'معدات' },
              { value: 'workplace', label: 'مكان العمل' }
            ]
          },
          {
            name: 'area',
            label: 'المنطقة',
            type: 'text',
            required: true,
            placeholder: 'أدخل المنطقة المفتشة'
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
            name: 'checkpointsTotal',
            label: 'إجمالي نقاط الفحص',
            type: 'number',
            required: true,
            placeholder: 'أدخل إجمالي نقاط الفحص'
          },
          {
            name: 'checkpointsPassed',
            label: 'النقاط المجتازة',
            type: 'number',
            required: true,
            placeholder: 'أدخل عدد النقاط المجتازة'
          },
          {
            name: 'violationsCount',
            label: 'عدد المخالفات',
            type: 'number',
            placeholder: 'أدخل عدد المخالفات'
          },
          {
            name: 'checkpoints',
            label: 'نقاط الفحص',
            type: 'textarea',
            placeholder: 'أدخل تفاصيل نقاط الفحص'
          },
          {
            name: 'violations',
            label: 'المخالفات المكتشفة',
            type: 'textarea',
            placeholder: 'أدخل تفاصيل المخالفات'
          },
          {
            name: 'recommendations',
            label: 'التوصيات',
            type: 'textarea',
            placeholder: 'أدخل التوصيات'
          },
          {
            name: 'result',
            label: 'نتيجة التفتيش',
            type: 'select',
            options: [
              { value: 'pass', label: 'نجح' },
              { value: 'fail', label: 'فشل' },
              { value: 'conditional', label: 'مشروط' }
            ]
          }
        ];

      case 'procedure':
        return [
          {
            name: 'number',
            label: 'رقم الإجراء',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الإجراء'
          },
          {
            name: 'title',
            label: 'عنوان الإجراء',
            type: 'text',
            required: true,
            placeholder: 'أدخل عنوان الإجراء'
          },
          {
            name: 'category',
            label: 'فئة الإجراء',
            type: 'select',
            required: true,
            options: [
              { value: 'emergency', label: 'طوارئ' },
              { value: 'safety', label: 'سلامة' },
              { value: 'equipment', label: 'معدات' },
              { value: 'chemical', label: 'كيميائي' },
              { value: 'fire', label: 'حريق' }
            ]
          },
          {
            name: 'version',
            label: 'رقم الإصدار',
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
            name: 'purpose',
            label: 'الغرض',
            type: 'textarea',
            placeholder: 'أدخل الغرض من الإجراء'
          },
          {
            name: 'scope',
            label: 'النطاق',
            type: 'textarea',
            placeholder: 'أدخل نطاق تطبيق الإجراء'
          },
          {
            name: 'steps',
            label: 'خطوات الإجراء',
            type: 'textarea',
            required: true,
            placeholder: 'أدخل خطوات تنفيذ الإجراء'
          },
          {
            name: 'responsibilities',
            label: 'المسؤوليات',
            type: 'textarea',
            placeholder: 'أدخل المسؤوليات'
          },
          {
            name: 'trainingRequired',
            label: 'يتطلب تدريب',
            type: 'checkbox'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'incident':
        return `${action} حادث سلامة`;
      case 'training':
        return `${action} تدريب سلامة`;
      case 'inspection':
        return `${action} تفتيش سلامة`;
      case 'procedure':
        return `${action} إجراء سلامة`;
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
      id: 'incidents',
      label: 'الحوادث',
      icon: AlertTriangle
    },
    {
      id: 'trainings',
      label: 'التدريب',
      icon: HardHat
    },
    {
      id: 'inspections',
      label: 'التفتيش',
      icon: Eye
    },
    {
      id: 'procedures',
      label: 'الإجراءات',
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
        <h1 className='text-2xl font-bold text-gray-900'>إدارة السلامة</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي الحوادث' value={stats.totalIncidents} icon={AlertTriangle} color='red' />
            <StatCard title='حوادث مفتوحة' value={stats.openIncidents} icon={XCircle} color='orange' />
            <StatCard title='حوادث مغلقة' value={stats.closedIncidents} icon={CheckCircle} color='green' />
            <StatCard title='حوادث حرجة' value={stats.criticalIncidents} icon={Zap} color='red' />
            <StatCard title='إجمالي التدريبات' value={stats.totalTrainings} icon={HardHat} color='blue' />
            <StatCard title='تفتيش ناجح' value={stats.passedInspections} icon={Shield} color='green' />
            <StatCard
              title='نقاط السلامة'
              value={stats.safetyScore.current}
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
                <Card.Title>الحوادث الأخيرة</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={incidents.slice(0, 5)}
                  columns={incidentColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>التدريبات النشطة</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={trainings.filter(training => training.status === 'in_progress').slice(0, 5)}
                  columns={trainingColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة حوادث السلامة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('incident')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة حادث
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={incidents}
              columns={incidentColumns}
              loading={loading.incidents}
              actions={incidentActions}
              onRefresh={loadIncidents}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'trainings' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة تدريبات السلامة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('training')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة تدريب
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={trainings}
              columns={trainingColumns}
              loading={loading.trainings}
              actions={trainingActions}
              onRefresh={loadTrainings}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'inspections' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة تفتيش السلامة</Card.Title>
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

      {activeTab === 'procedures' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة إجراءات السلامة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('procedure')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة إجراء
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={procedures}
              columns={procedureColumns}
              loading={loading.procedures}
              actions={procedureActions}
              onRefresh={loadProcedures}
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

export default SafetyPage;
