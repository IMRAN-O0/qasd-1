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
import { useProductionStore } from '../../services';
import { formatters } from '../../utils';
import {
  Factory,
  ClipboardList,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Square,
  BarChart3
} from 'lucide-react';
import { PRODUCTION_STATUS, UNITS, ROLES } from '../../constants';

/**
 * صفحة إدارة الإنتاج
 */
const ProductionPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // order, plan, schedule, report
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const {
    orders,
    plans,
    schedules,
    reports,
    loading,
    loadOrders,
    loadPlans,
    loadSchedules,
    loadReports,
    addOrder,
    updateOrder,
    removeOrder,
    addPlan,
    updatePlan,
    removePlan,
    addSchedule,
    updateSchedule,
    removeSchedule,
    addReport,
    updateReport
  } = useProductionStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadOrders();
    loadPlans();
    loadSchedules();
    loadReports();
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
    totalOrders: orders.length,
    activeOrders: orders.filter(order => order.status === 'in_progress').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,
    delayedOrders: orders.filter(order => {
      if (order.status === 'completed') {
        return false;
      }
      return new Date(order.dueDate) < new Date();
    }).length,
    totalPlans: plans.length,
    activePlans: plans.filter(plan => plan.status === 'active').length,
    todaySchedules: schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      const today = new Date();
      return scheduleDate.toDateString() === today.toDateString();
    }).length,
    pendingReports: reports.filter(report => report.status === 'pending').length,
    efficiency: {
      current: 85, // يمكن حسابها من البيانات الفعلية
      target: 90
    },
    productivity: {
      current: 78,
      target: 85
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
        case 'order':
          success = removeOrder(item.id);
          break;
        case 'plan':
          success = removePlan(item.id);
          break;
        case 'schedule':
          success = removeSchedule(item.id);
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
        case 'order':
          success = updateOrder(item.id, updatedItem);
          break;
        case 'plan':
          success = updatePlan(item.id, updatedItem);
          break;
        case 'schedule':
          success = updateSchedule(item.id, updatedItem);
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
        case 'order':
          if (selectedItem) {
            success = updateOrder(selectedItem.id, formData);
            message = 'تم تحديث أمر الإنتاج بنجاح';
          } else {
            success = addOrder(formData);
            message = 'تم إضافة أمر الإنتاج بنجاح';
          }
          break;
        case 'plan':
          if (selectedItem) {
            success = updatePlan(selectedItem.id, formData);
            message = 'تم تحديث خطة الإنتاج بنجاح';
          } else {
            success = addPlan(formData);
            message = 'تم إضافة خطة الإنتاج بنجاح';
          }
          break;
        case 'schedule':
          if (selectedItem) {
            success = updateSchedule(selectedItem.id, formData);
            message = 'تم تحديث الجدولة بنجاح';
          } else {
            success = addSchedule(formData);
            message = 'تم إضافة الجدولة بنجاح';
          }
          break;
        case 'report':
          if (selectedItem) {
            success = updateReport(selectedItem.id, formData);
            message = 'تم تحديث التقرير بنجاح';
          } else {
            success = addReport(formData);
            message = 'تم إضافة التقرير بنجاح';
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
  const orderColumns = [
    {
      key: 'number',
      title: 'رقم الأمر',
      sortable: true,
      searchable: true
    },
    {
      key: 'productName',
      title: 'المنتج',
      sortable: true,
      searchable: true
    },
    {
      key: 'quantity',
      title: 'الكمية المطلوبة',
      sortable: true,
      format: 'number'
    },
    {
      key: 'producedQuantity',
      title: 'الكمية المنتجة',
      sortable: true,
      format: 'number'
    },
    {
      key: 'progress',
      title: 'نسبة الإنجاز',
      render: (value, row) => {
        const percentage = row.quantity > 0 ? (row.producedQuantity / row.quantity) * 100 : 0;
        return (
          <div className='flex items-center gap-2'>
            <div className='w-20 bg-gray-200 rounded-full h-2'>
              <div className='bg-blue-600 h-2 rounded-full' style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
            <span className='text-sm'>{formatters.percentage(percentage / 100)}</span>
          </div>
        );
      }
    },
    {
      key: 'startDate',
      title: 'تاريخ البدء',
      format: 'date',
      sortable: true
    },
    {
      key: 'dueDate',
      title: 'تاريخ الاستحقاق',
      format: 'date',
      sortable: true
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
          case 'paused':
            return 'warning';
          case 'cancelled':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: PRODUCTION_STATUS.map(status => ({ value: status.value, label: status.label }))
    },
    {
      key: 'priority',
      title: 'الأولوية',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'high':
            return 'danger';
          case 'medium':
            return 'warning';
          case 'low':
            return 'default';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'high', label: 'عالية' },
        { value: 'medium', label: 'متوسطة' },
        { value: 'low', label: 'منخفضة' }
      ]
    }
  ];

  const planColumns = [
    {
      key: 'number',
      title: 'رقم الخطة',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'اسم الخطة',
      sortable: true,
      searchable: true
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
      key: 'ordersCount',
      title: 'عدد الأوامر',
      sortable: true,
      format: 'number'
    },
    {
      key: 'progress',
      title: 'نسبة الإنجاز',
      render: (value, row) => {
        const percentage = row.progress || 0;
        return (
          <div className='flex items-center gap-2'>
            <div className='w-20 bg-gray-200 rounded-full h-2'>
              <div className='bg-green-600 h-2 rounded-full' style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
            <span className='text-sm'>{formatters.percentage(percentage / 100)}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'active':
            return 'success';
          case 'completed':
            return 'primary';
          case 'paused':
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
        { value: 'active', label: 'نشطة' },
        { value: 'completed', label: 'مكتملة' },
        { value: 'paused', label: 'متوقفة' },
        { value: 'cancelled', label: 'ملغية' }
      ]
    }
  ];

  const scheduleColumns = [
    {
      key: 'number',
      title: 'رقم الجدولة',
      sortable: true,
      searchable: true
    },
    {
      key: 'orderNumber',
      title: 'رقم الأمر',
      sortable: true,
      searchable: true
    },
    {
      key: 'productName',
      title: 'المنتج',
      sortable: true,
      searchable: true
    },
    {
      key: 'date',
      title: 'التاريخ',
      format: 'date',
      sortable: true
    },
    {
      key: 'shift',
      title: 'الوردية',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'morning', label: 'صباحية' },
        { value: 'evening', label: 'مسائية' },
        { value: 'night', label: 'ليلية' }
      ]
    },
    {
      key: 'workstation',
      title: 'محطة العمل',
      searchable: true
    },
    {
      key: 'assignedTo',
      title: 'المسؤول',
      searchable: true
    },
    {
      key: 'estimatedDuration',
      title: 'المدة المقدرة',
      render: value => formatters.duration(value)
    },
    {
      key: 'actualDuration',
      title: 'المدة الفعلية',
      render: value => (value ? formatters.duration(value) : '-')
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
      filterOptions: [
        { value: 'scheduled', label: 'مجدولة' },
        { value: 'in_progress', label: 'قيد التنفيذ' },
        { value: 'completed', label: 'مكتملة' },
        { value: 'cancelled', label: 'ملغية' }
      ]
    }
  ];

  const reportColumns = [
    {
      key: 'number',
      title: 'رقم التقرير',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع التقرير',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'daily', label: 'يومي' },
        { value: 'weekly', label: 'أسبوعي' },
        { value: 'monthly', label: 'شهري' },
        { value: 'shift', label: 'وردية' }
      ]
    },
    {
      key: 'date',
      title: 'التاريخ',
      format: 'date',
      sortable: true
    },
    {
      key: 'shift',
      title: 'الوردية',
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'morning', label: 'صباحية' },
        { value: 'evening', label: 'مسائية' },
        { value: 'night', label: 'ليلية' }
      ]
    },
    {
      key: 'producedQuantity',
      title: 'الكمية المنتجة',
      format: 'number',
      sortable: true
    },
    {
      key: 'efficiency',
      title: 'الكفاءة',
      format: 'percentage',
      sortable: true
    },
    {
      key: 'downtime',
      title: 'وقت التوقف',
      render: value => formatters.duration(value)
    },
    {
      key: 'reportedBy',
      title: 'المُبلِغ',
      searchable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'approved':
            return 'success';
          case 'pending':
            return 'warning';
          case 'rejected':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'معلق' },
        { value: 'approved', label: 'موافق عليه' },
        { value: 'rejected', label: 'مرفوض' }
      ]
    }
  ];

  // إجراءات الجداول
  const orderActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: order => handleEdit('order', order)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: order => handleEdit('order', order)
    },
    {
      icon: Play,
      label: 'بدء',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: order => handleStatusChange('order', order, 'in_progress'),
      show: order => order.status === 'pending'
    },
    {
      icon: Pause,
      label: 'إيقاف',
      variant: 'ghost',
      className: 'text-yellow-600 hover:text-yellow-700',
      onClick: order => handleStatusChange('order', order, 'paused'),
      show: order => order.status === 'in_progress'
    },
    {
      icon: CheckCircle,
      label: 'إكمال',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: order => handleStatusChange('order', order, 'completed'),
      show: order => order.status === 'in_progress'
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: order => handleDelete('order', order)
    }
  ];

  const planActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: plan => handleEdit('plan', plan)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: plan => handleEdit('plan', plan)
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: plan => handleDelete('plan', plan)
    }
  ];

  const scheduleActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: schedule => handleEdit('schedule', schedule)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: schedule => handleEdit('schedule', schedule)
    },
    {
      icon: Play,
      label: 'بدء',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: schedule => handleStatusChange('schedule', schedule, 'in_progress'),
      show: schedule => schedule.status === 'scheduled'
    },
    {
      icon: CheckCircle,
      label: 'إكمال',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: schedule => handleStatusChange('schedule', schedule, 'completed'),
      show: schedule => schedule.status === 'in_progress'
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: schedule => handleDelete('schedule', schedule)
    }
  ];

  const reportActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: report => handleEdit('report', report)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: report => handleEdit('report', report)
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'order':
        return [
          {
            name: 'number',
            label: 'رقم الأمر',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم أمر الإنتاج'
          },
          {
            name: 'productId',
            label: 'المنتج',
            type: 'select',
            required: true,
            options: [] // يجب ربطها بقائمة المنتجات
          },
          {
            name: 'quantity',
            label: 'الكمية المطلوبة',
            type: 'number',
            required: true,
            placeholder: 'أدخل الكمية المطلوبة'
          },
          {
            name: 'unit',
            label: 'الوحدة',
            type: 'select',
            required: true,
            options: UNITS
          },
          {
            name: 'startDate',
            label: 'تاريخ البدء',
            type: 'date',
            required: true
          },
          {
            name: 'dueDate',
            label: 'تاريخ الاستحقاق',
            type: 'date',
            required: true
          },
          {
            name: 'priority',
            label: 'الأولوية',
            type: 'select',
            required: true,
            options: [
              { value: 'high', label: 'عالية' },
              { value: 'medium', label: 'متوسطة' },
              { value: 'low', label: 'منخفضة' }
            ]
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل ملاحظات إضافية'
          }
        ];

      case 'plan':
        return [
          {
            name: 'number',
            label: 'رقم الخطة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم خطة الإنتاج'
          },
          {
            name: 'name',
            label: 'اسم الخطة',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم خطة الإنتاج'
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
            name: 'description',
            label: 'الوصف',
            type: 'textarea',
            placeholder: 'أدخل وصف الخطة'
          },
          {
            name: 'objectives',
            label: 'الأهداف',
            type: 'textarea',
            placeholder: 'أدخل أهداف الخطة'
          }
        ];

      case 'schedule':
        return [
          {
            name: 'number',
            label: 'رقم الجدولة',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الجدولة'
          },
          {
            name: 'orderId',
            label: 'أمر الإنتاج',
            type: 'select',
            required: true,
            options: orders.map(order => ({ value: order.id, label: order.number }))
          },
          {
            name: 'date',
            label: 'التاريخ',
            type: 'date',
            required: true
          },
          {
            name: 'shift',
            label: 'الوردية',
            type: 'select',
            required: true,
            options: [
              { value: 'morning', label: 'صباحية' },
              { value: 'evening', label: 'مسائية' },
              { value: 'night', label: 'ليلية' }
            ]
          },
          {
            name: 'workstation',
            label: 'محطة العمل',
            type: 'text',
            required: true,
            placeholder: 'أدخل محطة العمل'
          },
          {
            name: 'assignedTo',
            label: 'المسؤول',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المسؤول'
          },
          {
            name: 'estimatedDuration',
            label: 'المدة المقدرة (بالدقائق)',
            type: 'number',
            required: true,
            placeholder: 'أدخل المدة المقدرة'
          },
          {
            name: 'notes',
            label: 'ملاحظات',
            type: 'textarea',
            placeholder: 'أدخل ملاحظات الجدولة'
          }
        ];

      case 'report':
        return [
          {
            name: 'number',
            label: 'رقم التقرير',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم التقرير'
          },
          {
            name: 'type',
            label: 'نوع التقرير',
            type: 'select',
            required: true,
            options: [
              { value: 'daily', label: 'يومي' },
              { value: 'weekly', label: 'أسبوعي' },
              { value: 'monthly', label: 'شهري' },
              { value: 'shift', label: 'وردية' }
            ]
          },
          {
            name: 'date',
            label: 'التاريخ',
            type: 'date',
            required: true
          },
          {
            name: 'shift',
            label: 'الوردية',
            type: 'select',
            options: [
              { value: 'morning', label: 'صباحية' },
              { value: 'evening', label: 'مسائية' },
              { value: 'night', label: 'ليلية' }
            ]
          },
          {
            name: 'producedQuantity',
            label: 'الكمية المنتجة',
            type: 'number',
            required: true,
            placeholder: 'أدخل الكمية المنتجة'
          },
          {
            name: 'efficiency',
            label: 'الكفاءة (%)',
            type: 'number',
            min: 0,
            max: 100,
            placeholder: 'أدخل نسبة الكفاءة'
          },
          {
            name: 'downtime',
            label: 'وقت التوقف (بالدقائق)',
            type: 'number',
            placeholder: 'أدخل وقت التوقف'
          },
          {
            name: 'issues',
            label: 'المشاكل والملاحظات',
            type: 'textarea',
            placeholder: 'أدخل المشاكل والملاحظات'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'order':
        return `${action} أمر إنتاج`;
      case 'plan':
        return `${action} خطة إنتاج`;
      case 'schedule':
        return `${action} جدولة`;
      case 'report':
        return `${action} تقرير إنتاج`;
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
      id: 'orders',
      label: 'أوامر الإنتاج',
      icon: ClipboardList
    },
    {
      id: 'plans',
      label: 'خطط الإنتاج',
      icon: Calendar
    },
    {
      id: 'schedules',
      label: 'الجدولة',
      icon: Clock
    },
    {
      id: 'reports',
      label: 'التقارير',
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
        <h1 className='text-2xl font-bold text-gray-900'>إدارة الإنتاج</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي الأوامر' value={stats.totalOrders} icon={ClipboardList} color='blue' />
            <StatCard title='أوامر نشطة' value={stats.activeOrders} icon={Factory} color='green' />
            <StatCard title='أوامر مكتملة' value={stats.completedOrders} icon={CheckCircle} color='blue' />
            <StatCard title='أوامر متأخرة' value={stats.delayedOrders} icon={AlertTriangle} color='red' />
            <StatCard title='خطط نشطة' value={stats.activePlans} icon={Calendar} color='purple' />
            <StatCard title='جدولة اليوم' value={stats.todaySchedules} icon={Clock} color='orange' />
            <StatCard
              title='الكفاءة الحالية'
              value={stats.efficiency.current}
              format='percentage'
              icon={TrendingUp}
              color='green'
              suffix='%'
            />
            <StatCard
              title='الإنتاجية'
              value={stats.productivity.current}
              format='percentage'
              icon={BarChart3}
              color='blue'
              suffix='%'
            />
          </StatGrid>

          {/* الرسوم البيانية والتقارير */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <Card.Header>
                <Card.Title>أوامر الإنتاج النشطة</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={orders.filter(order => order.status === 'in_progress').slice(0, 5)}
                  columns={orderColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>جدولة اليوم</Card.Title>
              </Card.Header>
              <Card.Content>
                <DataTable
                  data={schedules
                    .filter(schedule => {
                      const scheduleDate = new Date(schedule.date);
                      const today = new Date();
                      return scheduleDate.toDateString() === today.toDateString();
                    })
                    .slice(0, 5)}
                  columns={scheduleColumns.slice(0, 5)}
                  pagination={false}
                  searchable={false}
                  filterable={false}
                />
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة أوامر الإنتاج</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('order')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة أمر إنتاج
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={orders}
              columns={orderColumns}
              loading={loading.orders}
              actions={orderActions}
              onRefresh={loadOrders}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'plans' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة خطط الإنتاج</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('plan')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة خطة إنتاج
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={plans}
              columns={planColumns}
              loading={loading.plans}
              actions={planActions}
              onRefresh={loadPlans}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'schedules' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>إدارة الجدولة</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('schedule')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة جدولة
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={schedules}
              columns={scheduleColumns}
              loading={loading.schedules}
              actions={scheduleActions}
              onRefresh={loadSchedules}
            />
          </Card.Content>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <Card.Header>
            <div className='flex justify-between items-center'>
              <Card.Title>تقارير الإنتاج</Card.Title>
              <Button variant='primary' onClick={() => handleAdd('report')} className='flex items-center gap-2'>
                <Plus className='w-4 h-4' />
                إضافة تقرير
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <DataTable
              data={reports}
              columns={reportColumns}
              loading={loading.reports}
              actions={reportActions}
              onRefresh={loadReports}
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

export default ProductionPage;
