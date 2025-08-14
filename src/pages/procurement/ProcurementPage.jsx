import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  FileText,
  DollarSign,
  TrendingDown,
  Calendar,
  Package,
  Users,
  Plus,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/common';
import { useApi } from '../../hooks/useApi';
import { formatters } from '../../utils';

const ProcurementPage = () => {
  const { get } = useApi();
  const [procurementData, setProcurementData] = useState({
    overview: {
      totalSpending: 1850000,
      monthlyChange: -8.2,
      totalSuppliers: 45,
      activePOs: 18,
      pendingApprovals: 7,
      deliveriesThisMonth: 32
    },
    recentPurchases: [],
    topSuppliers: [],
    pendingOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcurementData();
  }, []);

  const loadProcurementData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockRecentPurchases = [
        {
          id: 1,
          supplierName: 'شركة المواد الخام المتقدمة',
          amount: 125000,
          status: 'مستلم',
          date: '2024-01-15',
          poNumber: 'PO-2024-001',
          items: 'مواد خام كيميائية'
        },
        {
          id: 2,
          supplierName: 'مؤسسة التوريدات الصناعية',
          amount: 89000,
          status: 'في الطريق',
          date: '2024-01-14',
          poNumber: 'PO-2024-002',
          items: 'معدات تصنيع'
        },
        {
          id: 3,
          supplierName: 'شركة التغليف المتطورة',
          amount: 45000,
          status: 'معلق',
          date: '2024-01-13',
          poNumber: 'PO-2024-003',
          items: 'مواد تغليف'
        }
      ];

      const mockTopSuppliers = [
        { name: 'شركة المواد الخام المتقدمة', totalPurchases: 850000, orders: 24, rating: 4.8 },
        { name: 'مؤسسة التوريدات الصناعية', totalPurchases: 650000, orders: 18, rating: 4.6 },
        { name: 'شركة التغليف المتطورة', totalPurchases: 420000, orders: 15, rating: 4.5 }
      ];

      const mockPendingOrders = [
        {
          id: 1,
          poNumber: 'PO-2024-004',
          supplier: 'شركة الكيماويات الحديثة',
          amount: 95000,
          requestedDate: '2024-01-20',
          status: 'في انتظار الموافقة',
          priority: 'عالية'
        },
        {
          id: 2,
          poNumber: 'PO-2024-005',
          supplier: 'مؤسسة المعدات الطبية',
          amount: 67000,
          requestedDate: '2024-01-22',
          status: 'في انتظار الموافقة',
          priority: 'متوسطة'
        }
      ];

      setProcurementData(prev => ({
        ...prev,
        recentPurchases: mockRecentPurchases,
        topSuppliers: mockTopSuppliers,
        pendingOrders: mockPendingOrders
      }));
    } catch (error) {
      console.error('Error loading procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'إضافة مورد جديد',
      description: 'إضافة مورد جديد إلى قاعدة البيانات',
      icon: Users,
      path: '/procurement/suppliers',
      color: 'bg-blue-500'
    },
    {
      title: 'إنشاء طلب شراء',
      description: 'إنشاء طلب شراء جديد',
      icon: FileText,
      path: '/procurement/purchase-orders',
      color: 'bg-green-500'
    },
    {
      title: 'استلام البضائع',
      description: 'تسجيل استلام البضائع الواردة',
      icon: Truck,
      path: '/procurement/receiving',
      color: 'bg-purple-500'
    },
    {
      title: 'إدارة العقود',
      description: 'إدارة عقود الموردين',
      icon: FileText,
      path: '/procurement/contracts',
      color: 'bg-orange-500'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'مستلم': { color: 'green', text: 'مستلم' },
      'في الطريق': { color: 'blue', text: 'في الطريق' },
      'معلق': { color: 'yellow', text: 'معلق' },
      'ملغي': { color: 'red', text: 'ملغي' },
      'في انتظار الموافقة': { color: 'orange', text: 'في انتظار الموافقة' }
    };
    
    const config = statusConfig[status] || { color: 'gray', text: status };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'عالية': { color: 'red', text: 'عالية' },
      'متوسطة': { color: 'yellow', text: 'متوسطة' },
      'منخفضة': { color: 'green', text: 'منخفضة' }
    };
    
    const config = priorityConfig[priority] || { color: 'gray', text: priority };
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المشتريات...</p>
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
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              إدارة المشتريات والتوريد
            </h1>
            <p className="text-gray-600 mt-2">إدارة شاملة للمشتريات والموردين وطلبات الشراء</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatters.currency(procurementData.overview.totalSpending)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">{Math.abs(procurementData.overview.monthlyChange)}%</span>
            <span className="text-sm text-gray-500 mr-2">توفير من الشهر الماضي</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الموردين</p>
              <p className="text-2xl font-bold text-gray-900">{procurementData.overview.totalSuppliers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">طلبات الشراء النشطة</p>
              <p className="text-2xl font-bold text-gray-900">{procurementData.overview.activePOs}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">في انتظار الموافقة</p>
              <p className="text-2xl font-bold text-gray-900">{procurementData.overview.pendingApprovals}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">التسليمات هذا الشهر</p>
              <p className="text-2xl font-bold text-gray-900">{procurementData.overview.deliveriesThisMonth}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط قيمة الطلب</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatters.currency(procurementData.overview.totalSpending / procurementData.overview.activePOs)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
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

      {/* Recent Purchases and Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Purchases */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">المشتريات الأخيرة</h2>
            <Link to="/procurement/purchase-orders">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                عرض الكل
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {procurementData.recentPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{purchase.supplierName}</h3>
                  <p className="text-sm text-gray-600">{purchase.poNumber} • {purchase.items}</p>
                  <p className="text-xs text-gray-500">{purchase.date}</p>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{formatters.currency(purchase.amount)}</p>
                  {getStatusBadge(purchase.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">الطلبات المعلقة</h2>
            <Link to="/procurement/approvals">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                عرض الكل
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {procurementData.pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{order.supplier}</h3>
                  <p className="text-sm text-gray-600">{order.poNumber}</p>
                  <p className="text-xs text-gray-500">مطلوب: {order.requestedDate}</p>
                </div>
                <div className="text-left space-y-1">
                  <p className="font-semibold text-gray-900">{formatters.currency(order.amount)}</p>
                  {getPriorityBadge(order.priority)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">أفضل الموردين</h2>
          <Link to="/procurement/suppliers">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              عرض الكل
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {procurementData.topSuppliers.map((supplier, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-sm mr-1">★</span>
                  <span className="text-sm text-gray-600">{supplier.rating}</span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">{supplier.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{supplier.orders} طلبات</p>
                <p className="font-semibold text-gray-900">{formatters.currency(supplier.totalPurchases)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProcurementPage;