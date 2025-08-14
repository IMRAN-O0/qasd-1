import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  Plus,
  Search,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';
import { useApi } from '../../hooks/useApi';
import { formatters } from '../../utils';

const ReportsPage = () => {
  const { get } = useApi();
  const [reportsData, setReportsData] = useState({
    overview: {
      totalReports: 45,
      scheduledReports: 12,
      recentReports: 8,
      automatedReports: 15
    },
    recentReports: [],
    reportCategories: [],
    scheduledReports: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockRecentReports = [
        {
          id: 1,
          name: 'تقرير المبيعات الشهري',
          type: 'مبيعات',
          generatedDate: '2024-01-15',
          status: 'مكتمل',
          size: '2.5 MB',
          format: 'PDF'
        },
        {
          id: 2,
          name: 'تقرير المخزون الأسبوعي',
          type: 'مخزون',
          generatedDate: '2024-01-14',
          status: 'مكتمل',
          size: '1.8 MB',
          format: 'Excel'
        },
        {
          id: 3,
          name: 'تقرير الإنتاج اليومي',
          type: 'إنتاج',
          generatedDate: '2024-01-13',
          status: 'جاري المعالجة',
          size: '3.2 MB',
          format: 'PDF'
        }
      ];

      const mockReportCategories = [
        {
          name: 'تقارير المبيعات',
          count: 12,
          icon: ShoppingCart,
          color: 'bg-blue-500',
          description: 'تقارير المبيعات والعملاء والإيرادات'
        },
        {
          name: 'تقارير المخزون',
          count: 8,
          icon: Package,
          color: 'bg-green-500',
          description: 'تقارير المواد والمنتجات والمخزون'
        },
        {
          name: 'تقارير الإنتاج',
          count: 10,
          icon: Target,
          color: 'bg-purple-500',
          description: 'تقارير الإنتاج والجودة والكفاءة'
        },
        {
          name: 'تقارير الموارد البشرية',
          count: 6,
          icon: Users,
          color: 'bg-orange-500',
          description: 'تقارير الموظفين والحضور والرواتب'
        },
        {
          name: 'التقارير المالية',
          count: 9,
          icon: DollarSign,
          color: 'bg-yellow-500',
          description: 'تقارير الأرباح والخسائر والميزانية'
        }
      ];

      const mockScheduledReports = [
        {
          id: 1,
          name: 'تقرير المبيعات الشهري',
          schedule: 'شهرياً - أول كل شهر',
          nextRun: '2024-02-01',
          recipients: 'الإدارة العليا، مدير المبيعات',
          status: 'نشط'
        },
        {
          id: 2,
          name: 'تقرير المخزون الأسبوعي',
          schedule: 'أسبوعياً - كل يوم اثنين',
          nextRun: '2024-01-22',
          recipients: 'مدير المخازن، مدير الإنتاج',
          status: 'نشط'
        },
        {
          id: 3,
          name: 'تقرير الجودة اليومي',
          schedule: 'يومياً - 6:00 مساءً',
          nextRun: '2024-01-16',
          recipients: 'مدير الجودة',
          status: 'معلق'
        }
      ];

      setReportsData(prev => ({
        ...prev,
        recentReports: mockRecentReports,
        reportCategories: mockReportCategories,
        scheduledReports: mockScheduledReports
      }));
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'إنشاء تقرير جديد',
      description: 'إنشاء تقرير مخصص جديد',
      icon: Plus,
      path: '/reports/create',
      color: 'bg-blue-500'
    },
    {
      title: 'جدولة تقرير',
      description: 'جدولة تقرير دوري تلقائي',
      icon: Calendar,
      path: '/reports/schedule',
      color: 'bg-green-500'
    },
    {
      title: 'لوحة المعلومات',
      description: 'عرض لوحة المعلومات التفاعلية',
      icon: BarChart3,
      path: '/reports/dashboard',
      color: 'bg-purple-500'
    },
    {
      title: 'أرشيف التقارير',
      description: 'استعراض التقارير المحفوظة',
      icon: FileText,
      path: '/reports/archive',
      color: 'bg-orange-500'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'مكتمل': { color: 'green', text: 'مكتمل' },
      'جاري المعالجة': { color: 'blue', text: 'جاري المعالجة' },
      'معلق': { color: 'yellow', text: 'معلق' },
      'فشل': { color: 'red', text: 'فشل' },
      'نشط': { color: 'green', text: 'نشط' }
    };
    
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const getFormatBadge = (format) => {
    const formatConfig = {
      'PDF': { color: 'red', text: 'PDF' },
      'Excel': { color: 'green', text: 'Excel' },
      'CSV': { color: 'blue', text: 'CSV' },
      'Word': { color: 'blue', text: 'Word' }
    };
    
    const config = formatConfig[format] || { color: 'gray', text: format };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              إدارة التقارير والتحليلات
            </h1>
            <p className="text-gray-600 mt-2">إنشاء وإدارة التقارير والتحليلات المتقدمة</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">يومي</option>
              <option value="weekly">أسبوعي</option>
              <option value="monthly">شهري</option>
              <option value="yearly">سنوي</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              تصدير الكل
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              تقرير جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي التقارير</p>
              <p className="text-2xl font-bold text-gray-900">{reportsData.overview.totalReports}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقارير المجدولة</p>
              <p className="text-2xl font-bold text-gray-900">{reportsData.overview.scheduledReports}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقارير الأخيرة</p>
              <p className="text-2xl font-bold text-gray-900">{reportsData.overview.recentReports}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">هذا الأسبوع</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التقارير التلقائية</p>
              <p className="text-2xl font-bold text-gray-900">{reportsData.overview.automatedReports}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Link key={index} to={action.path}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className={`h-12 w-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Report Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">فئات التقارير</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportsData.reportCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <Badge color="blue">{category.count}</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports and Scheduled Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">التقارير الأخيرة</h2>
            <Link to="/reports/all">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                عرض الكل
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {reportsData.recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.type} • {report.generatedDate}</p>
                  <p className="text-xs text-gray-500">{report.size}</p>
                </div>
                <div className="text-left space-y-1">
                  {getFormatBadge(report.format)}
                  {getStatusBadge(report.status)}
                  <div className="flex gap-1 mt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Scheduled Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">التقارير المجدولة</h2>
            <Link to="/reports/scheduled">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                إدارة الجدولة
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {reportsData.scheduledReports.map((report) => (
              <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">{report.schedule}</p>
                <p className="text-xs text-gray-500 mb-2">التشغيل التالي: {report.nextRun}</p>
                <p className="text-xs text-gray-500">المستلمون: {report.recipients}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;