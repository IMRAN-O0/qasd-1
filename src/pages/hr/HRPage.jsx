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
import { useAppStore } from '../../services';
import { formatters } from '../../utils';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  UserX,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import {
  EMPLOYEE_STATUS,
  DEPARTMENT_OPTIONS,
  POSITION_LEVELS,
  EMPLOYMENT_TYPES,
  LEAVE_TYPES,
  PERFORMANCE_RATINGS,
  TRAINING_STATUS,
  ROLES
} from '../../constants';

/**
 * صفحة إدارة الموارد البشرية
 */
const HRPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // employee, leave, performance, training, payroll
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [hrData, setHrData] = useState({
    employees: [],
    leaves: [],
    performances: [],
    trainings: [],
    payrolls: [],
    loading: {
      employees: false,
      leaves: false,
      performances: false,
      trainings: false,
      payrolls: false
    }
  });

  const { user } = useAppStore();

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setHrData(prev => ({
        ...prev,
        loading: {
          employees: true,
          leaves: true,
          performances: true,
          trainings: true,
          payrolls: true
        }
      }));

      // محاكاة تحميل البيانات
      const mockEmployees = [
        {
          id: '1',
          employeeId: 'EMP001',
          name: 'أحمد محمد علي',
          email: 'ahmed@company.com',
          phone: '+966501234567',
          department: 'production',
          position: 'مشرف إنتاج',
          level: 'senior',
          employmentType: 'full_time',
          hireDate: '2020-01-15',
          salary: 8000,
          status: 'active',
          manager: 'محمد أحمد',
          location: 'الرياض',
          nationalId: '1234567890',
          birthDate: '1985-05-20',
          address: 'الرياض، المملكة العربية السعودية',
          emergencyContact: 'فاطمة علي - 0501234568',
          skills: ['إدارة الإنتاج', 'ضمان الجودة', 'قيادة الفريق'],
          certifications: ['شهادة إدارة الجودة', 'شهادة السلامة المهنية'],
          lastPerformanceRating: 'excellent',
          lastReviewDate: '2023-12-01'
        },
        {
          id: '2',
          employeeId: 'EMP002',
          name: 'فاطمة سعد الدين',
          email: 'fatima@company.com',
          phone: '+966502345678',
          department: 'quality',
          position: 'مختصة جودة',
          level: 'mid',
          employmentType: 'full_time',
          hireDate: '2021-03-10',
          salary: 6500,
          status: 'active',
          manager: 'أحمد محمد علي',
          location: 'جدة',
          nationalId: '2345678901',
          birthDate: '1990-08-15',
          address: 'جدة، المملكة العربية السعودية',
          emergencyContact: 'سعد الدين - 0502345679',
          skills: ['فحص الجودة', 'تحليل البيانات', 'كتابة التقارير'],
          certifications: ['شهادة ISO 9001', 'شهادة مراقبة الجودة'],
          lastPerformanceRating: 'good',
          lastReviewDate: '2023-11-15'
        }
      ];

      const mockLeaves = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'أحمد محمد علي',
          type: 'annual',
          startDate: '2024-02-01',
          endDate: '2024-02-07',
          days: 7,
          reason: 'إجازة سنوية',
          status: 'approved',
          appliedDate: '2024-01-15',
          approvedBy: 'مدير الموارد البشرية',
          approvedDate: '2024-01-16'
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'فاطمة سعد الدين',
          type: 'sick',
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          days: 3,
          reason: 'إجازة مرضية',
          status: 'pending',
          appliedDate: '2024-01-19',
          medicalCertificate: true
        }
      ];

      const mockPerformances = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'أحمد محمد علي',
          reviewPeriod: '2023-Q4',
          reviewDate: '2023-12-01',
          reviewer: 'مدير الإنتاج',
          overallRating: 'excellent',
          goals: [
            { goal: 'تحسين كفاءة الإنتاج', target: 95, achieved: 98, rating: 'excellent' },
            { goal: 'تقليل الهدر', target: 5, achieved: 3, rating: 'excellent' },
            { goal: 'تدريب الفريق', target: 10, achieved: 12, rating: 'excellent' }
          ],
          strengths: ['قيادة ممتازة', 'حل المشاكل', 'التواصل الفعال'],
          areasForImprovement: ['إدارة الوقت', 'التخطيط الاستراتيجي'],
          developmentPlan: 'دورة في الإدارة الاستراتيجية',
          comments: 'أداء ممتاز ومتميز في جميع المجالات'
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'فاطمة سعد الدين',
          reviewPeriod: '2023-Q4',
          reviewDate: '2023-11-15',
          reviewer: 'مدير الجودة',
          overallRating: 'good',
          goals: [
            { goal: 'تحسين دقة الفحص', target: 98, achieved: 96, rating: 'good' },
            { goal: 'تقليل أخطاء التقارير', target: 2, achieved: 3, rating: 'satisfactory' },
            { goal: 'تطوير المهارات التقنية', target: 3, achieved: 2, rating: 'satisfactory' }
          ],
          strengths: ['دقة في العمل', 'التزام بالمواعيد', 'تعلم سريع'],
          areasForImprovement: ['مهارات التحليل', 'استخدام البرامج المتقدمة'],
          developmentPlan: 'دورة في تحليل البيانات وبرامج الجودة',
          comments: 'أداء جيد مع إمكانية للتحسن'
        }
      ];

      const mockTrainings = [
        {
          id: '1',
          title: 'دورة إدارة الجودة الشاملة',
          type: 'quality',
          startDate: '2024-02-15',
          endDate: '2024-02-17',
          duration: 24,
          instructor: 'د. محمد الأحمد',
          location: 'قاعة التدريب الرئيسية',
          maxParticipants: 20,
          enrolledCount: 15,
          completedCount: 0,
          status: 'scheduled',
          cost: 5000,
          objectives: 'تطوير مهارات إدارة الجودة وتطبيق معايير ISO',
          prerequisites: 'خبرة سنتين في مجال الجودة',
          materials: 'كتيب التدريب، شهادة إتمام',
          participants: ['EMP001', 'EMP002']
        },
        {
          id: '2',
          title: 'دورة السلامة المهنية',
          type: 'safety',
          startDate: '2024-01-20',
          endDate: '2024-01-21',
          duration: 16,
          instructor: 'م. سارة أحمد',
          location: 'مركز التدريب',
          maxParticipants: 25,
          enrolledCount: 22,
          completedCount: 20,
          status: 'completed',
          cost: 3000,
          objectives: 'تعزيز الوعي بالسلامة المهنية وتطبيق إجراءات السلامة',
          prerequisites: 'لا توجد متطلبات مسبقة',
          materials: 'دليل السلامة، شهادة إتمام',
          participants: ['EMP001', 'EMP002']
        }
      ];

      const mockPayrolls = [
        {
          id: '1',
          employeeId: 'EMP001',
          employeeName: 'أحمد محمد علي',
          month: '2024-01',
          basicSalary: 8000,
          allowances: {
            housing: 2000,
            transport: 500,
            food: 300
          },
          overtime: {
            hours: 10,
            rate: 50,
            amount: 500
          },
          deductions: {
            insurance: 400,
            tax: 200,
            loan: 0
          },
          grossSalary: 11300,
          netSalary: 10700,
          status: 'paid',
          payDate: '2024-01-30',
          workingDays: 22,
          attendedDays: 22,
          leaveDays: 0
        },
        {
          id: '2',
          employeeId: 'EMP002',
          employeeName: 'فاطمة سعد الدين',
          month: '2024-01',
          basicSalary: 6500,
          allowances: {
            housing: 1500,
            transport: 400,
            food: 300
          },
          overtime: {
            hours: 5,
            rate: 40,
            amount: 200
          },
          deductions: {
            insurance: 325,
            tax: 150,
            loan: 200
          },
          grossSalary: 8900,
          netSalary: 8225,
          status: 'paid',
          payDate: '2024-01-30',
          workingDays: 22,
          attendedDays: 21,
          leaveDays: 1
        }
      ];

      setTimeout(() => {
        setHrData({
          employees: mockEmployees,
          leaves: mockLeaves,
          performances: mockPerformances,
          trainings: mockTrainings,
          payrolls: mockPayrolls,
          loading: {
            employees: false,
            leaves: false,
            performances: false,
            trainings: false,
            payrolls: false
          }
        });
      }, 1000);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في تحميل البيانات',
        message: error.message
      });
    }
  };

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
    totalEmployees: hrData.employees.length,
    activeEmployees: hrData.employees.filter(emp => emp.status === 'active').length,
    inactiveEmployees: hrData.employees.filter(emp => emp.status === 'inactive').length,
    newHires: hrData.employees.filter(emp => {
      const hireDate = new Date(emp.hireDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return hireDate >= threeMonthsAgo;
    }).length,
    pendingLeaves: hrData.leaves.filter(leave => leave.status === 'pending').length,
    approvedLeaves: hrData.leaves.filter(leave => leave.status === 'approved').length,
    totalTrainings: hrData.trainings.length,
    completedTrainings: hrData.trainings.filter(training => training.status === 'completed').length,
    averageSalary:
      hrData.employees.length > 0
        ? hrData.employees.reduce((sum, emp) => sum + emp.salary, 0) / hrData.employees.length
        : 0,
    totalPayroll: hrData.payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0),
    attendanceRate: {
      current:
        hrData.payrolls.length > 0
          ? (hrData.payrolls.reduce((sum, p) => sum + p.attendedDays / p.workingDays, 0) / hrData.payrolls.length) * 100
          : 0,
      target: 95
    },
    performanceDistribution: {
      excellent: hrData.employees.filter(emp => emp.lastPerformanceRating === 'excellent').length,
      good: hrData.employees.filter(emp => emp.lastPerformanceRating === 'good').length,
      satisfactory: hrData.employees.filter(emp => emp.lastPerformanceRating === 'satisfactory').length,
      needsImprovement: hrData.employees.filter(emp => emp.lastPerformanceRating === 'needs_improvement').length
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
      // محاكاة حذف العنصر
      setHrData(prev => ({
        ...prev,
        [type + 's']: prev[type + 's'].filter(i => i.id !== item.id)
      }));

      addAlert({
        type: 'success',
        title: 'تم الحذف بنجاح',
        message: 'تم حذف العنصر بنجاح'
      });
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
      // محاكاة تحديث الحالة
      setHrData(prev => ({
        ...prev,
        [type + 's']: prev[type + 's'].map(i => (i.id === item.id ? { ...i, status: newStatus } : i))
      }));

      addAlert({
        type: 'success',
        title: 'تم تحديث الحالة',
        message: 'تم تحديث حالة العنصر بنجاح'
      });
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
      if (selectedItem) {
        // تحديث العنصر
        setHrData(prev => ({
          ...prev,
          [modalType + 's']: prev[modalType + 's'].map(item =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          )
        }));
        addAlert({
          type: 'success',
          title: 'تم التحديث بنجاح',
          message: 'تم تحديث العنصر بنجاح'
        });
      } else {
        // إضافة عنصر جديد
        const newItem = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setHrData(prev => ({
          ...prev,
          [modalType + 's']: [...prev[modalType + 's'], newItem]
        }));
        addAlert({
          type: 'success',
          title: 'تمت الإضافة بنجاح',
          message: 'تم إضافة العنصر بنجاح'
        });
      }
      setShowModal(false);
    } catch (error) {
      addAlert({
        type: 'error',
        title: 'خطأ في العملية',
        message: error.message
      });
    }
  };

  // تكوين الأعمدة للجداول
  const employeeColumns = [
    {
      key: 'employeeId',
      title: 'رقم الموظف',
      sortable: true,
      searchable: true
    },
    {
      key: 'name',
      title: 'الاسم',
      sortable: true,
      searchable: true
    },
    {
      key: 'email',
      title: 'البريد الإلكتروني',
      searchable: true
    },
    {
      key: 'phone',
      title: 'الهاتف',
      searchable: true
    },
    {
      key: 'department',
      title: 'القسم',
      filterable: true,
      filterType: 'select',
      filterOptions: DEPARTMENT_OPTIONS
    },
    {
      key: 'position',
      title: 'المنصب',
      searchable: true
    },
    {
      key: 'level',
      title: 'المستوى',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'senior':
            return 'success';
          case 'mid':
            return 'primary';
          case 'junior':
            return 'warning';
          case 'intern':
            return 'default';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: POSITION_LEVELS
    },
    {
      key: 'hireDate',
      title: 'تاريخ التوظيف',
      format: 'date',
      sortable: true
    },
    {
      key: 'salary',
      title: 'الراتب',
      format: 'currency',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'active':
            return 'success';
          case 'inactive':
            return 'danger';
          case 'on_leave':
            return 'warning';
          case 'terminated':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: EMPLOYEE_STATUS
    }
  ];

  const leaveColumns = [
    {
      key: 'employeeName',
      title: 'اسم الموظف',
      sortable: true,
      searchable: true
    },
    {
      key: 'type',
      title: 'نوع الإجازة',
      filterable: true,
      filterType: 'select',
      filterOptions: LEAVE_TYPES
    },
    {
      key: 'startDate',
      title: 'تاريخ البداية',
      format: 'date',
      sortable: true
    },
    {
      key: 'endDate',
      title: 'تاريخ النهاية',
      format: 'date',
      sortable: true
    },
    {
      key: 'days',
      title: 'عدد الأيام',
      sortable: true,
      format: 'number'
    },
    {
      key: 'reason',
      title: 'السبب',
      searchable: true
    },
    {
      key: 'appliedDate',
      title: 'تاريخ التقديم',
      format: 'date',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'approved':
            return 'success';
          case 'rejected':
            return 'danger';
          case 'pending':
            return 'warning';
          case 'cancelled':
            return 'default';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'قيد المراجعة' },
        { value: 'approved', label: 'موافق عليها' },
        { value: 'rejected', label: 'مرفوضة' },
        { value: 'cancelled', label: 'ملغية' }
      ]
    }
  ];

  const performanceColumns = [
    {
      key: 'employeeName',
      title: 'اسم الموظف',
      sortable: true,
      searchable: true
    },
    {
      key: 'reviewPeriod',
      title: 'فترة التقييم',
      sortable: true
    },
    {
      key: 'reviewDate',
      title: 'تاريخ التقييم',
      format: 'date',
      sortable: true
    },
    {
      key: 'reviewer',
      title: 'المقيم',
      searchable: true
    },
    {
      key: 'overallRating',
      title: 'التقييم العام',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'excellent':
            return 'success';
          case 'good':
            return 'primary';
          case 'satisfactory':
            return 'warning';
          case 'needs_improvement':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: PERFORMANCE_RATINGS
    },
    {
      key: 'goals',
      title: 'الأهداف المحققة',
      render: value => {
        if (!value || !Array.isArray(value)) {
          return '0/0';
        }
        const achieved = value.filter(goal => goal.rating === 'excellent' || goal.rating === 'good').length;
        return `${achieved}/${value.length}`;
      }
    }
  ];

  const trainingColumns = [
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
        { value: 'technical', label: 'تقني' },
        { value: 'soft_skills', label: 'مهارات شخصية' },
        { value: 'leadership', label: 'قيادة' },
        { value: 'safety', label: 'سلامة' },
        { value: 'quality', label: 'جودة' }
      ]
    },
    {
      key: 'startDate',
      title: 'تاريخ البداية',
      format: 'date',
      sortable: true
    },
    {
      key: 'duration',
      title: 'المدة (ساعة)',
      sortable: true,
      format: 'number'
    },
    {
      key: 'instructor',
      title: 'المدرب',
      searchable: true
    },
    {
      key: 'enrolledCount',
      title: 'المسجلين',
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
        const rate = row.enrolledCount > 0 ? (row.completedCount / row.enrolledCount) * 100 : 0;
        return formatters.percentage(rate / 100);
      }
    },
    {
      key: 'cost',
      title: 'التكلفة',
      format: 'currency',
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
      filterOptions: TRAINING_STATUS
    }
  ];

  const payrollColumns = [
    {
      key: 'employeeName',
      title: 'اسم الموظف',
      sortable: true,
      searchable: true
    },
    {
      key: 'month',
      title: 'الشهر',
      sortable: true
    },
    {
      key: 'basicSalary',
      title: 'الراتب الأساسي',
      format: 'currency',
      sortable: true
    },
    {
      key: 'grossSalary',
      title: 'إجمالي الراتب',
      format: 'currency',
      sortable: true
    },
    {
      key: 'netSalary',
      title: 'صافي الراتب',
      format: 'currency',
      sortable: true
    },
    {
      key: 'workingDays',
      title: 'أيام العمل',
      sortable: true,
      format: 'number'
    },
    {
      key: 'attendedDays',
      title: 'أيام الحضور',
      sortable: true,
      format: 'number'
    },
    {
      key: 'attendanceRate',
      title: 'معدل الحضور',
      sortable: true,
      render: (value, row) => {
        const rate = row.workingDays > 0 ? (row.attendedDays / row.workingDays) * 100 : 0;
        return formatters.percentage(rate / 100);
      }
    },
    {
      key: 'payDate',
      title: 'تاريخ الدفع',
      format: 'date',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      type: 'badge',
      badgeVariant: value => {
        switch (value) {
          case 'paid':
            return 'success';
          case 'pending':
            return 'warning';
          case 'processing':
            return 'primary';
          case 'failed':
            return 'danger';
          default:
            return 'default';
        }
      },
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'قيد الانتظار' },
        { value: 'processing', label: 'قيد المعالجة' },
        { value: 'paid', label: 'مدفوع' },
        { value: 'failed', label: 'فشل' }
      ]
    }
  ];

  // إجراءات الجداول
  const employeeActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: employee => handleEdit('employee', employee)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: employee => handleEdit('employee', employee)
    },
    {
      icon: FileText,
      label: 'ملف الموظف',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: employee => {
        addAlert({
          type: 'info',
          title: 'ملف الموظف',
          message: 'سيتم عرض ملف الموظف قريباً'
        });
      }
    },
    {
      icon: Download,
      label: 'تحميل البيانات',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: employee => {
        addAlert({
          type: 'info',
          title: 'تحميل البيانات',
          message: 'سيتم تحميل بيانات الموظف قريباً'
        });
      }
    },
    {
      icon: UserX,
      label: 'إلغاء تفعيل',
      variant: 'ghost',
      className: 'text-orange-600 hover:text-orange-700',
      onClick: employee => handleStatusChange('employee', employee, 'inactive'),
      show: employee => employee.status === 'active'
    },
    {
      icon: UserCheck,
      label: 'تفعيل',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: employee => handleStatusChange('employee', employee, 'active'),
      show: employee => employee.status === 'inactive'
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: employee => handleDelete('employee', employee)
    }
  ];

  const leaveActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: leave => handleEdit('leave', leave)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: leave => handleEdit('leave', leave),
      show: leave => leave.status === 'pending'
    },
    {
      icon: CheckCircle,
      label: 'موافقة',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: leave => handleStatusChange('leave', leave, 'approved'),
      show: leave => leave.status === 'pending'
    },
    {
      icon: XCircle,
      label: 'رفض',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: leave => handleStatusChange('leave', leave, 'rejected'),
      show: leave => leave.status === 'pending'
    },
    {
      icon: Download,
      label: 'تحميل الطلب',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: leave => {
        addAlert({
          type: 'info',
          title: 'تحميل الطلب',
          message: 'سيتم تحميل طلب الإجازة قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: leave => handleDelete('leave', leave)
    }
  ];

  const performanceActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: performance => handleEdit('performance', performance)
    },
    {
      icon: Edit,
      label: 'تعديل',
      variant: 'ghost',
      onClick: performance => handleEdit('performance', performance)
    },
    {
      icon: Download,
      label: 'تحميل التقرير',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: performance => {
        addAlert({
          type: 'info',
          title: 'تحميل التقرير',
          message: 'سيتم تحميل تقرير الأداء قريباً'
        });
      }
    },
    {
      icon: Trash2,
      label: 'حذف',
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700',
      onClick: performance => handleDelete('performance', performance)
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

  const payrollActions = [
    {
      icon: Eye,
      label: 'عرض',
      variant: 'ghost',
      onClick: payroll => handleEdit('payroll', payroll)
    },
    {
      icon: Download,
      label: 'تحميل كشف الراتب',
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700',
      onClick: payroll => {
        addAlert({
          type: 'info',
          title: 'تحميل كشف الراتب',
          message: 'سيتم تحميل كشف الراتب قريباً'
        });
      }
    },
    {
      icon: CheckCircle,
      label: 'تأكيد الدفع',
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700',
      onClick: payroll => handleStatusChange('payroll', payroll, 'paid'),
      show: payroll => payroll.status === 'pending'
    }
  ];

  // نماذج البيانات
  const getFormFields = () => {
    switch (modalType) {
      case 'employee':
        return [
          {
            name: 'employeeId',
            label: 'رقم الموظف',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الموظف'
          },
          {
            name: 'name',
            label: 'الاسم الكامل',
            type: 'text',
            required: true,
            placeholder: 'أدخل الاسم الكامل'
          },
          {
            name: 'email',
            label: 'البريد الإلكتروني',
            type: 'email',
            required: true,
            placeholder: 'أدخل البريد الإلكتروني'
          },
          {
            name: 'phone',
            label: 'رقم الهاتف',
            type: 'tel',
            required: true,
            placeholder: 'أدخل رقم الهاتف'
          },
          {
            name: 'nationalId',
            label: 'رقم الهوية',
            type: 'text',
            required: true,
            placeholder: 'أدخل رقم الهوية'
          },
          {
            name: 'birthDate',
            label: 'تاريخ الميلاد',
            type: 'date',
            required: true
          },
          {
            name: 'department',
            label: 'القسم',
            type: 'select',
            required: true,
            options: DEPARTMENT_OPTIONS
          },
          {
            name: 'position',
            label: 'المنصب',
            type: 'text',
            required: true,
            placeholder: 'أدخل المنصب'
          },
          {
            name: 'level',
            label: 'المستوى الوظيفي',
            type: 'select',
            required: true,
            options: POSITION_LEVELS
          },
          {
            name: 'employmentType',
            label: 'نوع التوظيف',
            type: 'select',
            required: true,
            options: EMPLOYMENT_TYPES
          },
          {
            name: 'hireDate',
            label: 'تاريخ التوظيف',
            type: 'date',
            required: true
          },
          {
            name: 'salary',
            label: 'الراتب الأساسي',
            type: 'number',
            required: true,
            placeholder: 'أدخل الراتب الأساسي'
          },
          {
            name: 'manager',
            label: 'المدير المباشر',
            type: 'text',
            placeholder: 'أدخل اسم المدير المباشر'
          },
          {
            name: 'location',
            label: 'مكان العمل',
            type: 'text',
            required: true,
            placeholder: 'أدخل مكان العمل'
          },
          {
            name: 'address',
            label: 'العنوان',
            type: 'textarea',
            placeholder: 'أدخل العنوان الكامل'
          },
          {
            name: 'emergencyContact',
            label: 'جهة الاتصال في الطوارئ',
            type: 'text',
            placeholder: 'أدخل جهة الاتصال في الطوارئ'
          }
        ];

      case 'leave':
        return [
          {
            name: 'employeeId',
            label: 'الموظف',
            type: 'select',
            required: true,
            options: hrData.employees.map(emp => ({ value: emp.employeeId, label: emp.name }))
          },
          {
            name: 'type',
            label: 'نوع الإجازة',
            type: 'select',
            required: true,
            options: LEAVE_TYPES
          },
          {
            name: 'startDate',
            label: 'تاريخ البداية',
            type: 'date',
            required: true
          },
          {
            name: 'endDate',
            label: 'تاريخ النهاية',
            type: 'date',
            required: true
          },
          {
            name: 'reason',
            label: 'سبب الإجازة',
            type: 'textarea',
            required: true,
            placeholder: 'أدخل سبب الإجازة'
          },
          {
            name: 'medicalCertificate',
            label: 'شهادة طبية (للإجازة المرضية)',
            type: 'checkbox'
          },
          {
            name: 'contactDuringLeave',
            label: 'معلومات الاتصال أثناء الإجازة',
            type: 'text',
            placeholder: 'أدخل معلومات الاتصال'
          }
        ];

      case 'performance':
        return [
          {
            name: 'employeeId',
            label: 'الموظف',
            type: 'select',
            required: true,
            options: hrData.employees.map(emp => ({ value: emp.employeeId, label: emp.name }))
          },
          {
            name: 'reviewPeriod',
            label: 'فترة التقييم',
            type: 'text',
            required: true,
            placeholder: 'مثال: 2024-Q1'
          },
          {
            name: 'reviewDate',
            label: 'تاريخ التقييم',
            type: 'date',
            required: true
          },
          {
            name: 'reviewer',
            label: 'المقيم',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المقيم'
          },
          {
            name: 'overallRating',
            label: 'التقييم العام',
            type: 'select',
            required: true,
            options: PERFORMANCE_RATINGS
          },
          {
            name: 'strengths',
            label: 'نقاط القوة',
            type: 'textarea',
            placeholder: 'أدخل نقاط القوة'
          },
          {
            name: 'areasForImprovement',
            label: 'مجالات التحسين',
            type: 'textarea',
            placeholder: 'أدخل مجالات التحسين'
          },
          {
            name: 'developmentPlan',
            label: 'خطة التطوير',
            type: 'textarea',
            placeholder: 'أدخل خطة التطوير'
          },
          {
            name: 'comments',
            label: 'تعليقات إضافية',
            type: 'textarea',
            placeholder: 'أدخل تعليقات إضافية'
          }
        ];

      case 'training':
        return [
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
              { value: 'technical', label: 'تقني' },
              { value: 'soft_skills', label: 'مهارات شخصية' },
              { value: 'leadership', label: 'قيادة' },
              { value: 'safety', label: 'سلامة' },
              { value: 'quality', label: 'جودة' }
            ]
          },
          {
            name: 'startDate',
            label: 'تاريخ البداية',
            type: 'date',
            required: true
          },
          {
            name: 'endDate',
            label: 'تاريخ النهاية',
            type: 'date',
            required: true
          },
          {
            name: 'duration',
            label: 'مدة التدريب (بالساعات)',
            type: 'number',
            required: true,
            placeholder: 'أدخل مدة التدريب'
          },
          {
            name: 'instructor',
            label: 'المدرب',
            type: 'text',
            required: true,
            placeholder: 'أدخل اسم المدرب'
          },
          {
            name: 'location',
            label: 'مكان التدريب',
            type: 'text',
            required: true,
            placeholder: 'أدخل مكان التدريب'
          },
          {
            name: 'maxParticipants',
            label: 'الحد الأقصى للمشاركين',
            type: 'number',
            required: true,
            placeholder: 'أدخل الحد الأقصى للمشاركين'
          },
          {
            name: 'cost',
            label: 'تكلفة التدريب',
            type: 'number',
            placeholder: 'أدخل تكلفة التدريب'
          },
          {
            name: 'objectives',
            label: 'أهداف التدريب',
            type: 'textarea',
            placeholder: 'أدخل أهداف التدريب'
          },
          {
            name: 'prerequisites',
            label: 'المتطلبات المسبقة',
            type: 'textarea',
            placeholder: 'أدخل المتطلبات المسبقة'
          },
          {
            name: 'materials',
            label: 'المواد التدريبية',
            type: 'textarea',
            placeholder: 'أدخل المواد التدريبية'
          }
        ];

      case 'payroll':
        return [
          {
            name: 'employeeId',
            label: 'الموظف',
            type: 'select',
            required: true,
            options: hrData.employees.map(emp => ({ value: emp.employeeId, label: emp.name }))
          },
          {
            name: 'month',
            label: 'الشهر',
            type: 'month',
            required: true
          },
          {
            name: 'workingDays',
            label: 'أيام العمل',
            type: 'number',
            required: true,
            placeholder: 'أدخل أيام العمل'
          },
          {
            name: 'attendedDays',
            label: 'أيام الحضور',
            type: 'number',
            required: true,
            placeholder: 'أدخل أيام الحضور'
          },
          {
            name: 'leaveDays',
            label: 'أيام الإجازة',
            type: 'number',
            placeholder: 'أدخل أيام الإجازة'
          },
          {
            name: 'overtimeHours',
            label: 'ساعات العمل الإضافي',
            type: 'number',
            placeholder: 'أدخل ساعات العمل الإضافي'
          },
          {
            name: 'overtimeRate',
            label: 'معدل العمل الإضافي',
            type: 'number',
            placeholder: 'أدخل معدل العمل الإضافي'
          },
          {
            name: 'housingAllowance',
            label: 'بدل السكن',
            type: 'number',
            placeholder: 'أدخل بدل السكن'
          },
          {
            name: 'transportAllowance',
            label: 'بدل النقل',
            type: 'number',
            placeholder: 'أدخل بدل النقل'
          },
          {
            name: 'foodAllowance',
            label: 'بدل الطعام',
            type: 'number',
            placeholder: 'أدخل بدل الطعام'
          },
          {
            name: 'insurance',
            label: 'التأمين',
            type: 'number',
            placeholder: 'أدخل مبلغ التأمين'
          },
          {
            name: 'tax',
            label: 'الضريبة',
            type: 'number',
            placeholder: 'أدخل مبلغ الضريبة'
          },
          {
            name: 'loan',
            label: 'القرض',
            type: 'number',
            placeholder: 'أدخل مبلغ القرض'
          }
        ];

      default:
        return [];
    }
  };

  const getModalTitle = () => {
    const action = selectedItem ? 'تعديل' : 'إضافة';
    switch (modalType) {
      case 'employee':
        return `${action} موظف`;
      case 'leave':
        return `${action} طلب إجازة`;
      case 'performance':
        return `${action} تقييم أداء`;
      case 'training':
        return `${action} تدريب`;
      case 'payroll':
        return `${action} كشف راتب`;
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
      id: 'employees',
      label: 'الموظفين',
      icon: Users
    },
    {
      id: 'leaves',
      label: 'الإجازات',
      icon: Calendar
    },
    {
      id: 'performance',
      label: 'تقييم الأداء',
      icon: Award
    },
    {
      id: 'training',
      label: 'التدريب',
      icon: GraduationCap
    },
    {
      id: 'payroll',
      label: 'كشوف الرواتب',
      icon: DollarSign
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
        <h1 className='text-2xl font-bold text-gray-900'>إدارة الموارد البشرية</h1>
      </div>

      {/* التبويبات */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className='mb-6' />

      {/* المحتوى */}
      {activeTab === 'dashboard' && (
        <div className='space-y-6'>
          {/* الإحصائيات */}
          <StatGrid>
            <StatCard title='إجمالي الموظفين' value={stats.totalEmployees} icon={Users} color='blue' />
            <StatCard title='موظفين نشطين' value={stats.activeEmployees} icon={UserCheck} color='green' />
            <StatCard title='موظفين جدد' value={stats.newHires} icon={UserPlus} color='purple' />
            <StatCard title='إجازات معلقة' value={stats.pendingLeaves} icon={Clock} color='orange' />
            <StatCard
              title='متوسط الراتب'
              value={stats.averageSalary}
              format='currency'
              icon={DollarSign}
              color='green'
            />
            <StatCard
              title='معدل الحضور'
              value={stats.attendanceRate.current}
              previousValue={stats.attendanceRate.target}
              format='percentage'
              icon={Activity}
              color='blue'
            />
            <StatCard
              title='التدريبات المكتملة'
              value={stats.completedTrainings}
              previousValue={stats.totalTrainings}
              icon={BookOpen}
              color='indigo'
            />
            <StatCard
              title='إجمالي كشوف الرواتب'
              value={stats.totalPayroll}
              format='currency'
              icon={FileText}
              color='gray'
            />
          </StatGrid>

          {/* الرسوم البيانية */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* توزيع الأداء */}
            <Card>
              <div className='p-6'>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <PieChart className='w-5 h-5 ml-2' />
                  توزيع تقييمات الأداء
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='flex items-center'>
                      <div className='w-3 h-3 bg-green-500 rounded-full ml-2'></div>
                      ممتاز
                    </span>
                    <span className='font-semibold'>{stats.performanceDistribution.excellent}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='flex items-center'>
                      <div className='w-3 h-3 bg-blue-500 rounded-full ml-2'></div>
                      جيد
                    </span>
                    <span className='font-semibold'>{stats.performanceDistribution.good}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='flex items-center'>
                      <div className='w-3 h-3 bg-yellow-500 rounded-full ml-2'></div>
                      مقبول
                    </span>
                    <span className='font-semibold'>{stats.performanceDistribution.satisfactory}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='flex items-center'>
                      <div className='w-3 h-3 bg-red-500 rounded-full ml-2'></div>
                      يحتاج تحسين
                    </span>
                    <span className='font-semibold'>{stats.performanceDistribution.needsImprovement}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* الإجازات الحديثة */}
            <Card>
              <div className='p-6'>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <Calendar className='w-5 h-5 ml-2' />
                  الإجازات الحديثة
                </h3>
                <div className='space-y-3'>
                  {hrData.leaves.slice(0, 5).map(leave => (
                    <div key={leave.id} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                      <div>
                        <p className='font-medium'>{leave.employeeName}</p>
                        <p className='text-sm text-gray-600'>
                          {formatters.date(leave.startDate)} - {formatters.date(leave.endDate)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'
                        }
                      >
                        {leave.status === 'approved'
                          ? 'موافق عليها'
                          : leave.status === 'rejected'
                            ? 'مرفوضة'
                            : 'قيد المراجعة'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* تبويب الموظفين */}
      {activeTab === 'employees' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>إدارة الموظفين</h2>
            <Button onClick={() => handleAdd('employee')} className='flex items-center'>
              <Plus className='w-4 h-4 ml-2' />
              إضافة موظف
            </Button>
          </div>

          <DataTable
            data={hrData.employees}
            columns={employeeColumns}
            actions={employeeActions}
            loading={hrData.loading.employees}
            searchable
            filterable
            sortable
            pagination
            pageSize={10}
            emptyMessage='لا توجد بيانات موظفين'
          />
        </div>
      )}

      {/* تبويب الإجازات */}
      {activeTab === 'leaves' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>إدارة الإجازات</h2>
            <Button onClick={() => handleAdd('leave')} className='flex items-center'>
              <Plus className='w-4 h-4 ml-2' />
              إضافة طلب إجازة
            </Button>
          </div>

          <DataTable
            data={hrData.leaves}
            columns={leaveColumns}
            actions={leaveActions}
            loading={hrData.loading.leaves}
            searchable
            filterable
            sortable
            pagination
            pageSize={10}
            emptyMessage='لا توجد طلبات إجازات'
          />
        </div>
      )}

      {/* تبويب تقييم الأداء */}
      {activeTab === 'performance' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>تقييم الأداء</h2>
            <Button onClick={() => handleAdd('performance')} className='flex items-center'>
              <Plus className='w-4 h-4 ml-2' />
              إضافة تقييم
            </Button>
          </div>

          <DataTable
            data={hrData.performances}
            columns={performanceColumns}
            actions={performanceActions}
            loading={hrData.loading.performances}
            searchable
            filterable
            sortable
            pagination
            pageSize={10}
            emptyMessage='لا توجد تقييمات أداء'
          />
        </div>
      )}

      {/* تبويب التدريب */}
      {activeTab === 'training' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>إدارة التدريب</h2>
            <Button onClick={() => handleAdd('training')} className='flex items-center'>
              <Plus className='w-4 h-4 ml-2' />
              إضافة تدريب
            </Button>
          </div>

          <DataTable
            data={hrData.trainings}
            columns={trainingColumns}
            actions={trainingActions}
            loading={hrData.loading.trainings}
            searchable
            filterable
            sortable
            pagination
            pageSize={10}
            emptyMessage='لا توجد برامج تدريبية'
          />
        </div>
      )}

      {/* تبويب كشوف الرواتب */}
      {activeTab === 'payroll' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>كشوف الرواتب</h2>
            <Button onClick={() => handleAdd('payroll')} className='flex items-center'>
              <Plus className='w-4 h-4 ml-2' />
              إضافة كشف راتب
            </Button>
          </div>

          <DataTable
            data={hrData.payrolls}
            columns={payrollColumns}
            actions={payrollActions}
            loading={hrData.loading.payrolls}
            searchable
            filterable
            sortable
            pagination
            pageSize={10}
            emptyMessage='لا توجد كشوف رواتب'
          />
        </div>
      )}

      {/* نافذة منبثقة للنماذج */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={getModalTitle()} size='lg'>
        <Form
          fields={getFormFields()}
          initialData={selectedItem}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          submitLabel={selectedItem ? 'تحديث' : 'إضافة'}
          cancelLabel='إلغاء'
        />
      </Modal>
    </div>
  );
};

export default HRPage;
