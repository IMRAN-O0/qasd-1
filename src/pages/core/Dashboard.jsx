import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import KPIWidget from '../../components/dashboard/KPIWidget';
import DashboardChart from '../../components/dashboard/DashboardChart';
import NotificationCenter from '../../components/dashboard/NotificationCenter';
import QuickActions from '../../components/dashboard/QuickActions';
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  Factory,
  Shield,
  Calendar,
  Activity,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    loadDashboardData();
    const stored = localStorage.getItem('authUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setName(parsed.username);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockData = {
        kpis: {
          totalProduction: { value: 15420, previousValue: 14800, unit: 'كجم' },
          qualityRate: { value: 98.5, previousValue: 97.2, unit: '%' },
          inventoryValue: { value: 2450000, previousValue: 2380000, unit: 'ريال' },
          salesRevenue: { value: 1850000, previousValue: 1720000, unit: 'ريال' },
          activeOrders: { value: 24, previousValue: 28, unit: 'طلب' },
          safetyIncidents: { value: 0, previousValue: 1, unit: 'حادث' }
        },
        charts: {
          productionTrend: {
            data: [
              { name: 'يناير', value: 12000 },
              { name: 'فبراير', value: 13500 },
              { name: 'مارس', value: 14200 },
              { name: 'أبريل', value: 15420 },
              { name: 'مايو', value: 16800 },
              { name: 'يونيو', value: 15200 }
            ]
          },
          qualityMetrics: {
            data: [
              { name: 'ممتاز', value: 85, fill: '#10B981' },
              { name: 'جيد', value: 12, fill: '#F59E0B' },
              { name: 'مقبول', value: 3, fill: '#EF4444' }
            ]
          },
          salesPerformance: {
            data: [
              { name: 'الأسبوع 1', sales: 420000, target: 400000 },
              { name: 'الأسبوع 2', sales: 380000, target: 400000 },
              { name: 'الأسبوع 3', sales: 450000, target: 400000 },
              { name: 'الأسبوع 4', sales: 600000, target: 400000 }
            ]
          }
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Define navigation links based on user role
  const getNavigationLinks = () => {
    const allLinks = [
      {
        title: 'إدارة المستخدمين',
        description: 'إضافة وإدارة المستخدمين',
        icon: Users,
        path: '/settings/users',
        roles: ['admin']
      },
      {
        title: 'المخزون',
        description: 'إدارة المواد والمنتجات',
        icon: Package,
        path: '/inventory',
        roles: ['admin', 'inventory', 'viewer', 'manager']
      },
      {
        title: 'الإنتاج',
        description: 'تسجيل ومتابعة الإنتاج',
        icon: Factory,
        path: '/production',
        roles: ['admin', 'production', 'supervisor', 'manager']
      },
      {
        title: 'الجودة',
        description: 'مراقبة وضمان الجودة',
        icon: ClipboardCheck,
        path: '/quality',
        roles: ['admin', 'quality', 'production', 'manager']
      },
      {
        title: 'السلامة',
        description: 'إدارة السلامة المهنية',
        icon: Shield,
        path: '/safety',
        roles: ['admin', 'safety', 'manager']
      },
      {
        title: 'المبيعات',
        description: 'إدارة العملاء والمبيعات',
        icon: ShoppingCart,
        path: '/sales',
        roles: ['admin', 'sales', 'manager']
      },
      {
        title: 'التقارير',
        description: 'التقارير والإحصائيات',
        icon: BarChart3,
        path: '/reports',
        roles: ['admin', 'viewer', 'production', 'inventory', 'quality', 'safety', 'sales', 'manager']
      },
      {
        title: 'الإعدادات',
        description: 'إعدادات النظام',
        icon: Settings,
        path: '/settings',
        roles: ['admin']
      }
    ];

    return allLinks.filter(link => link.roles.includes(user?.role) || user?.role === 'admin');
  };

  const getKPIsForRole = () => {
    if (!dashboardData) {
      return [];
    }

    const { kpis } = dashboardData;
    const roleKPIs = {
      admin: [
        { title: 'إجمالي الإنتاج', icon: Factory, color: 'blue', ...kpis.totalProduction },
        { title: 'معدل الجودة', icon: ClipboardCheck, color: 'green', format: 'percentage', ...kpis.qualityRate },
        { title: 'قيمة المخزون', icon: Package, color: 'purple', format: 'currency', ...kpis.inventoryValue },
        { title: 'إيرادات المبيعات', icon: DollarSign, color: 'emerald', format: 'currency', ...kpis.salesRevenue },
        { title: 'الطلبات النشطة', icon: ShoppingCart, color: 'orange', ...kpis.activeOrders },
        { title: 'حوادث السلامة', icon: AlertTriangle, color: 'red', ...kpis.safetyIncidents }
      ],
      manager: [
        { title: 'إجمالي الإنتاج', icon: Factory, color: 'blue', ...kpis.totalProduction },
        { title: 'معدل الجودة', icon: ClipboardCheck, color: 'green', format: 'percentage', ...kpis.qualityRate },
        { title: 'إيرادات المبيعات', icon: DollarSign, color: 'emerald', format: 'currency', ...kpis.salesRevenue },
        { title: 'الطلبات النشطة', icon: ShoppingCart, color: 'orange', ...kpis.activeOrders }
      ],
      production: [
        { title: 'إجمالي الإنتاج', icon: Factory, color: 'blue', ...kpis.totalProduction },
        { title: 'معدل الجودة', icon: ClipboardCheck, color: 'green', format: 'percentage', ...kpis.qualityRate },
        { title: 'حوادث السلامة', icon: AlertTriangle, color: 'red', ...kpis.safetyIncidents }
      ],
      inventory: [
        { title: 'قيمة المخزون', icon: Package, color: 'purple', format: 'currency', ...kpis.inventoryValue },
        { title: 'الطلبات النشطة', icon: ShoppingCart, color: 'orange', ...kpis.activeOrders }
      ],
      sales: [
        { title: 'إيرادات المبيعات', icon: DollarSign, color: 'emerald', format: 'currency', ...kpis.salesRevenue },
        { title: 'الطلبات النشطة', icon: ShoppingCart, color: 'orange', ...kpis.activeOrders }
      ],
      quality: [
        { title: 'معدل الجودة', icon: ClipboardCheck, color: 'green', format: 'percentage', ...kpis.qualityRate },
        { title: 'إجمالي الإنتاج', icon: Factory, color: 'blue', ...kpis.totalProduction }
      ],
      safety: [
        { title: 'حوادث السلامة', icon: AlertTriangle, color: 'red', ...kpis.safetyIncidents },
        { title: 'إجمالي الإنتاج', icon: Factory, color: 'blue', ...kpis.totalProduction }
      ]
    };

    return roleKPIs[user?.role] || roleKPIs.admin;
  };

  const getChartsForRole = () => {
    if (!dashboardData) {
      return [];
    }

    const { charts } = dashboardData;
    const roleCharts = {
      admin: [
        { title: 'اتجاه الإنتاج الشهري', type: 'line', data: charts.productionTrend.data, height: 300 },
        { title: 'توزيع جودة المنتجات', type: 'pie', data: charts.qualityMetrics.data, height: 300 },
        { title: 'أداء المبيعات الأسبوعي', type: 'bar', data: charts.salesPerformance.data, height: 300 }
      ],
      manager: [
        { title: 'اتجاه الإنتاج الشهري', type: 'area', data: charts.productionTrend.data, height: 300 },
        { title: 'أداء المبيعات الأسبوعي', type: 'bar', data: charts.salesPerformance.data, height: 300 }
      ],
      production: [
        { title: 'اتجاه الإنتاج الشهري', type: 'line', data: charts.productionTrend.data, height: 300 },
        { title: 'توزيع جودة المنتجات', type: 'pie', data: charts.qualityMetrics.data, height: 300 }
      ],
      sales: [{ title: 'أداء المبيعات الأسبوعي', type: 'bar', data: charts.salesPerformance.data, height: 300 }],
      quality: [{ title: 'توزيع جودة المنتجات', type: 'pie', data: charts.qualityMetrics.data, height: 300 }]
    };

    return roleCharts[user?.role] || [];
  };

  const navigationLinks = getNavigationLinks();
  const kpis = getKPIsForRole();
  const charts = getChartsForRole();

  const filteredLinks = navigationLinks;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Activity className='animate-spin h-8 w-8 mx-auto mb-4 text-blue-600' />
          <p className='text-gray-600'>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>لوحة التحكم</h1>
              <span className='mr-4 text-gray-500'>مرحباً، {name || user?.name}</span>
            </div>
            <div className='flex items-center space-x-4 space-x-reverse'>
              <NotificationCenter />
              <button className='text-red-600 hover:text-red-700 flex items-center gap-2'>
                <LogOut size={18} />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* KPIs Section */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>المؤشرات الرئيسية</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
            {kpis.map((kpi, index) => (
              <KPIWidget key={index} {...kpi} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        {charts.length > 0 && (
          <div className='mb-8'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>الرسوم البيانية</h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
              {charts.map((chart, index) => (
                <DashboardChart key={index} {...chart} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className='mb-8'>
          <QuickActions />
        </div>

        {/* Navigation Links */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>الأقسام الرئيسية</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group'
                >
                  <div className='flex items-center mb-3'>
                    <IconComponent className='h-8 w-8 text-blue-600 group-hover:text-blue-700' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>{link.title}</h3>
                  <p className='text-sm text-gray-600'>{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
