import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Shield,
  Award,
  UserCheck,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Factory,
  Warehouse,
  TrendingUp,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  DollarSign,
  Target,
  Activity,
  Layers,
  Database,
  Lock,
  Bell,
  HelpCircle,
  Bookmark,
  Star,
  Clock,
  Filter,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Navigation menu structure
const navigationMenu = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: Home,
    path: '/dashboard',
    permission: 'dashboard.view'
  },
  {
    id: 'production',
    label: 'الإنتاج',
    icon: Factory,
    permission: 'production.view',
    children: [
      {
        id: 'production-overview',
        label: 'نظرة عامة',
        path: '/production',
        icon: BarChart3,
        permission: 'production.view'
      },
      {
        id: 'production-planning',
        label: 'تخطيط الإنتاج',
        path: '/production/planning',
        icon: Calendar,
        permission: 'production.plan'
      },
      {
        id: 'production-monitoring',
        label: 'مراقبة الإنتاج',
        path: '/production/monitoring',
        icon: Activity,
        permission: 'production.monitor'
      },
      {
        id: 'production-orders',
        label: 'أوامر الإنتاج',
        path: '/production/orders',
        icon: ClipboardCheck,
        permission: 'production.orders'
      }
    ]
  },
  {
    id: 'inventory',
    label: 'المخزون',
    icon: Package,
    permission: 'inventory.view',
    children: [
      {
        id: 'inventory-overview',
        label: 'نظرة عامة',
        path: '/inventory',
        icon: Warehouse,
        permission: 'inventory.view'
      },
      {
        id: 'inventory-items',
        label: 'الأصناف',
        path: '/inventory/items',
        icon: Package,
        permission: 'inventory.items'
      },
      {
        id: 'inventory-movements',
        label: 'حركات المخزون',
        path: '/inventory/movements',
        icon: TrendingUp,
        permission: 'inventory.movements'
      },
      {
        id: 'inventory-warehouses',
        label: 'المستودعات',
        path: '/inventory/warehouses',
        icon: Warehouse,
        permission: 'inventory.warehouses'
      }
    ]
  },
  {
    id: 'sales',
    label: 'المبيعات',
    icon: ShoppingCart,
    permission: 'sales.view',
    children: [
      {
        id: 'sales-overview',
        label: 'نظرة عامة',
        path: '/sales',
        icon: TrendingUp,
        permission: 'sales.view'
      },
      {
        id: 'sales-orders',
        label: 'طلبات المبيعات',
        path: '/sales/orders',
        icon: ShoppingCart,
        permission: 'sales.orders'
      },
      {
        id: 'sales-customers',
        label: 'العملاء',
        path: '/sales/customers',
        icon: Users,
        permission: 'sales.customers'
      },
      {
        id: 'sales-invoices',
        label: 'الفواتير',
        path: '/sales/invoices',
        icon: FileText,
        permission: 'sales.invoices'
      }
    ]
  },
  {
    id: 'procurement',
    label: 'المشتريات',
    icon: Truck,
    permission: 'procurement.view',
    children: [
      {
        id: 'procurement-overview',
        label: 'نظرة عامة',
        path: '/procurement',
        icon: BarChart3,
        permission: 'procurement.view'
      },
      {
        id: 'procurement-orders',
        label: 'طلبات الشراء',
        path: '/procurement/orders',
        icon: Truck,
        permission: 'procurement.orders'
      },
      {
        id: 'procurement-suppliers',
        label: 'الموردين',
        path: '/procurement/suppliers',
        icon: Users,
        permission: 'procurement.suppliers'
      },
      {
        id: 'procurement-rfq',
        label: 'طلبات الأسعار',
        path: '/procurement/rfq',
        icon: DollarSign,
        permission: 'procurement.rfq'
      }
    ]
  },
  {
    id: 'quality',
    label: 'الجودة',
    icon: Award,
    permission: 'quality.view',
    children: [
      {
        id: 'quality-overview',
        label: 'نظرة عامة',
        path: '/quality',
        icon: Target,
        permission: 'quality.view'
      },
      {
        id: 'quality-inspections',
        label: 'الفحوصات',
        path: '/quality/inspections',
        icon: ClipboardCheck,
        permission: 'quality.inspections'
      },
      {
        id: 'quality-standards',
        label: 'المعايير',
        path: '/quality/standards',
        icon: Award,
        permission: 'quality.standards'
      },
      {
        id: 'quality-audits',
        label: 'التدقيق',
        path: '/quality/audits',
        icon: Shield,
        permission: 'quality.audits'
      }
    ]
  },
  {
    id: 'safety',
    label: 'السلامة',
    icon: Shield,
    permission: 'safety.view',
    children: [
      {
        id: 'safety-overview',
        label: 'نظرة عامة',
        path: '/safety',
        icon: Shield,
        permission: 'safety.view'
      },
      {
        id: 'safety-incidents',
        label: 'الحوادث',
        path: '/safety/incidents',
        icon: AlertTriangle,
        permission: 'safety.incidents'
      },
      {
        id: 'safety-training',
        label: 'التدريب',
        path: '/safety/training',
        icon: UserCheck,
        permission: 'safety.training'
      },
      {
        id: 'safety-equipment',
        label: 'المعدات',
        path: '/safety/equipment',
        icon: Package,
        permission: 'safety.equipment'
      }
    ]
  },
  {
    id: 'hr',
    label: 'الموارد البشرية',
    icon: UserCheck,
    permission: 'hr.view',
    children: [
      {
        id: 'hr-overview',
        label: 'نظرة عامة',
        path: '/hr',
        icon: Users,
        permission: 'hr.view'
      },
      {
        id: 'hr-employees',
        label: 'الموظفين',
        path: '/hr/employees',
        icon: Users,
        permission: 'hr.employees'
      },
      {
        id: 'hr-attendance',
        label: 'الحضور',
        path: '/hr/attendance',
        icon: Clock,
        permission: 'hr.attendance'
      },
      {
        id: 'hr-payroll',
        label: 'الرواتب',
        path: '/hr/payroll',
        icon: DollarSign,
        permission: 'hr.payroll'
      }
    ]
  },
  {
    id: 'reports',
    label: 'التقارير',
    icon: FileText,
    permission: 'reports.view',
    children: [
      {
        id: 'reports-dashboard',
        label: 'لوحة التقارير',
        path: '/reports',
        icon: BarChart3,
        permission: 'reports.view'
      },
      {
        id: 'reports-production',
        label: 'تقارير الإنتاج',
        path: '/reports/production',
        icon: Factory,
        permission: 'reports.production'
      },
      {
        id: 'reports-sales',
        label: 'تقارير المبيعات',
        path: '/reports/sales',
        icon: TrendingUp,
        permission: 'reports.sales'
      },
      {
        id: 'reports-financial',
        label: 'التقارير المالية',
        path: '/reports/financial',
        icon: DollarSign,
        permission: 'reports.financial'
      }
    ]
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: Settings,
    permission: 'settings.view',
    children: [
      {
        id: 'settings-users',
        label: 'إدارة المستخدمين',
        path: '/settings/users',
        icon: Users,
        permission: 'users.manage'
      },
      {
        id: 'settings-roles',
        label: 'الأدوار والصلاحيات',
        path: '/settings/roles',
        icon: Lock,
        permission: 'roles.manage'
      },
      {
        id: 'settings-company',
        label: 'إعدادات الشركة',
        path: '/settings/company',
        icon: Settings,
        permission: 'company.manage'
      },
      {
        id: 'settings-security',
        label: 'الأمان',
        path: '/settings/security',
        icon: Shield,
        permission: 'security.manage'
      }
    ]
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [recentPages, setRecentPages] = useState([]);

  // Filter menu items based on user permissions
  const filterMenuByPermissions = menuItems => {
    return menuItems.filter(item => {
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }

      if (item.children) {
        item.children = filterMenuByPermissions(item.children);
        return item.children.length > 0;
      }

      return true;
    });
  };

  const filteredMenu = filterMenuByPermissions(navigationMenu);

  // Handle menu expansion
  const toggleMenu = menuId => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Auto-expand menu if current path is within it
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedMenus = { ...expandedMenus };

    filteredMenu.forEach(menu => {
      if (menu.children) {
        const hasActiveChild = menu.children.some(child => currentPath.startsWith(child.path));
        if (hasActiveChild) {
          newExpandedMenus[menu.id] = true;
        }
      }
    });

    setExpandedMenus(newExpandedMenus);
  }, [location.pathname]);

  // Track recent pages
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== '/dashboard') {
      setRecentPages(prev => {
        const filtered = prev.filter(page => page.path !== currentPath);
        return [{ path: currentPath, timestamp: Date.now() }, ...filtered].slice(0, 5);
      });
    }
  }, [location.pathname]);

  // Check if menu item is active
  const isActive = path => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Toggle favorites
  const toggleFavorite = item => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.path === item.path);
      if (exists) {
        return prev.filter(fav => fav.path !== item.path);
      } else {
        return [...prev, item].slice(0, 10); // Limit to 10 favorites
      }
    });
  };

  const isFavorite = path => {
    return favorites.some(fav => fav.path === path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden' onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-80 bg-white shadow-xl h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
        dir='rtl'
      >
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-bold text-gray-800'>نظام QASD</h2>
              <p className='text-sm text-gray-600'>نظام إدارة الجودة والسلامة</p>
            </div>
            <button onClick={onClose} className='lg:hidden p-2 rounded-md hover:bg-gray-100'>
              <MoreHorizontal className='h-5 w-5' />
            </button>
          </div>

          {/* Quick Search */}
          <div className='mt-4 relative'>
            <Search className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='البحث السريع...'
              className='w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Navigation Content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className='p-4 border-b border-gray-100'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                <Star className='h-3 w-3' />
                المفضلة
              </h3>
              <ul className='space-y-1'>
                {favorites.slice(0, 5).map(fav => (
                  <li key={fav.path}>
                    <Link
                      to={fav.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(fav.path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <fav.icon className='h-4 w-4' />
                      {fav.label}
                      <button
                        onClick={e => {
                          e.preventDefault();
                          toggleFavorite(fav);
                        }}
                        className='mr-auto p-1 hover:bg-gray-200 rounded'
                      >
                        <Star className='h-3 w-3 fill-current text-yellow-500' />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Pages */}
          {recentPages.length > 0 && (
            <div className='p-4 border-b border-gray-100'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                <Clock className='h-3 w-3' />
                الصفحات الأخيرة
              </h3>
              <ul className='space-y-1'>
                {recentPages.slice(0, 3).map((page, index) => {
                  const menuItem = filteredMenu.find(
                    menu =>
                      menu.path === page.path ||
                      (menu.children && menu.children.find(child => child.path === page.path))
                  );
                  const item =
                    menuItem?.path === page.path
                      ? menuItem
                      : menuItem?.children?.find(child => child.path === page.path);

                  if (!item) {
                    return null;
                  }

                  return (
                    <li key={index}>
                      <Link
                        to={page.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(page.path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className='h-4 w-4' />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Main Navigation */}
          <div className='p-4'>
            <nav>
              <ul className='space-y-2'>
                {filteredMenu.map(menu => (
                  <li key={menu.id}>
                    {menu.children ? (
                      <div>
                        <button
                          onClick={() => toggleMenu(menu.id)}
                          className='flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors group'
                        >
                          <div className='flex items-center gap-3'>
                            <menu.icon className='h-5 w-5 text-gray-500 group-hover:text-gray-700' />
                            {menu.label}
                          </div>
                          {expandedMenus[menu.id] ? (
                            <ChevronDown className='h-4 w-4 text-gray-400' />
                          ) : (
                            <ChevronRight className='h-4 w-4 text-gray-400' />
                          )}
                        </button>
                        {expandedMenus[menu.id] && (
                          <ul className='mr-6 mt-1 space-y-1'>
                            {menu.children.map(child => (
                              <li key={child.id}>
                                <div className='flex items-center'>
                                  <Link
                                    to={child.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
                                      isActive(child.path)
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    <child.icon className='h-4 w-4' />
                                    {child.label}
                                  </Link>
                                  <button
                                    onClick={() => toggleFavorite(child)}
                                    className='p-1 hover:bg-gray-200 rounded ml-1'
                                    title={isFavorite(child.path) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                  >
                                    <Star
                                      className={`h-3 w-3 ${
                                        isFavorite(child.path) ? 'fill-current text-yellow-500' : 'text-gray-400'
                                      }`}
                                    />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className='flex items-center'>
                        <Link
                          to={menu.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
                            isActive(menu.path) ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <menu.icon className='h-5 w-5' />
                          {menu.label}
                        </Link>
                        <button
                          onClick={() => toggleFavorite(menu)}
                          className='p-1 hover:bg-gray-200 rounded ml-1'
                          title={isFavorite(menu.path) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                        >
                          <Star
                            className={`h-3 w-3 ${
                              isFavorite(menu.path) ? 'fill-current text-yellow-500' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200'>
          <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
            <span>الإصدار 2.1.0</span>
            <div className='flex items-center gap-2'>
              <button className='p-1 hover:bg-gray-100 rounded' title='المساعدة'>
                <HelpCircle className='h-4 w-4' />
              </button>
              <button className='p-1 hover:bg-gray-100 rounded' title='الإعدادات'>
                <Settings className='h-4 w-4' />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className='flex items-center gap-3 p-2 bg-gray-50 rounded-lg'>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>{user.name || 'مستخدم'}</p>
                <p className='text-xs text-gray-500 truncate'>{user.role || 'دور غير محدد'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
