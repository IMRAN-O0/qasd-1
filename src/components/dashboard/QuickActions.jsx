import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  FileText,
  Users,
  Package,
  ShoppingCart,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  Download,
  Upload,
  Calendar,
  Bell,
  Search
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Define actions based on user roles
  const getActionsForRole = () => {
    const baseActions = [
      {
        id: 'search',
        title: 'بحث سريع',
        description: 'البحث في النظام',
        icon: Search,
        color: 'bg-gray-500 hover:bg-gray-600',
        action: () => {
          /* Implement global search */
        }
      },
      {
        id: 'reports',
        title: 'التقارير',
        description: 'عرض التقارير',
        icon: BarChart3,
        color: 'bg-purple-500 hover:bg-purple-600',
        action: () => navigate('/reports')
      }
    ];

    const roleSpecificActions = {
      admin: [
        {
          id: 'add-user',
          title: 'إضافة مستخدم',
          description: 'إنشاء حساب جديد',
          icon: Users,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/settings/users/new')
        },
        {
          id: 'system-settings',
          title: 'إعدادات النظام',
          description: 'تكوين النظام',
          icon: Settings,
          color: 'bg-gray-600 hover:bg-gray-700',
          action: () => navigate('/settings/system')
        },
        {
          id: 'backup',
          title: 'نسخ احتياطي',
          description: 'إنشاء نسخة احتياطية',
          icon: Download,
          color: 'bg-green-500 hover:bg-green-600',
          action: () => {
            /* Implement backup */
          }
        }
      ],
      manager: [
        {
          id: 'new-order',
          title: 'طلب جديد',
          description: 'إنشاء طلب عميل',
          icon: Plus,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/sales/customer-orders/new')
        },
        {
          id: 'production-plan',
          title: 'خطة الإنتاج',
          description: 'جدولة الإنتاج',
          icon: Calendar,
          color: 'bg-orange-500 hover:bg-orange-600',
          action: () => navigate('/production/production-planning')
        },
        {
          id: 'inventory-check',
          title: 'فحص المخزون',
          description: 'مراجعة المستويات',
          icon: Package,
          color: 'bg-indigo-500 hover:bg-indigo-600',
          action: () => navigate('/inventory/view')
        }
      ],
      production: [
        {
          id: 'new-batch',
          title: 'دفعة جديدة',
          description: 'بدء دفعة إنتاج',
          icon: Plus,
          color: 'bg-green-500 hover:bg-green-600',
          action: () => navigate('/production/batch-record/new')
        },
        {
          id: 'quality-check',
          title: 'فحص الجودة',
          description: 'تسجيل فحص جودة',
          icon: ClipboardCheck,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/quality/final-product/new')
        },
        {
          id: 'maintenance',
          title: 'صيانة المعدات',
          description: 'جدولة الصيانة',
          icon: AlertTriangle,
          color: 'bg-yellow-500 hover:bg-yellow-600',
          action: () => navigate('/production/equipment-maintenance')
        }
      ],
      inventory: [
        {
          id: 'receive-materials',
          title: 'استلام مواد',
          description: 'تسجيل استلام',
          icon: Upload,
          color: 'bg-green-500 hover:bg-green-600',
          action: () => navigate('/inventory/receiving/new')
        },
        {
          id: 'stock-adjustment',
          title: 'تعديل المخزون',
          description: 'تصحيح الكميات',
          icon: Package,
          color: 'bg-orange-500 hover:bg-orange-600',
          action: () => navigate('/inventory/adjustments/new')
        },
        {
          id: 'purchase-request',
          title: 'طلب شراء',
          description: 'إنشاء طلب شراء',
          icon: ShoppingCart,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/inventory/purchase-requests/new')
        }
      ],
      sales: [
        {
          id: 'new-customer',
          title: 'عميل جديد',
          description: 'إضافة عميل',
          icon: Users,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/sales/customers/new')
        },
        {
          id: 'new-quote',
          title: 'عرض سعر',
          description: 'إنشاء عرض سعر',
          icon: FileText,
          color: 'bg-green-500 hover:bg-green-600',
          action: () => navigate('/sales/quotations/new')
        },
        {
          id: 'follow-up',
          title: 'متابعة العملاء',
          description: 'مراجعة المتابعات',
          icon: Bell,
          color: 'bg-purple-500 hover:bg-purple-600',
          action: () => navigate('/sales/follow-up')
        }
      ],
      quality: [
        {
          id: 'quality-test',
          title: 'اختبار جودة',
          description: 'تسجيل اختبار',
          icon: ClipboardCheck,
          color: 'bg-blue-500 hover:bg-blue-600',
          action: () => navigate('/quality/final-product/new')
        },
        {
          id: 'calibration',
          title: 'معايرة الأجهزة',
          description: 'جدولة المعايرة',
          icon: Settings,
          color: 'bg-orange-500 hover:bg-orange-600',
          action: () => navigate('/quality/calibration')
        }
      ],
      safety: [
        {
          id: 'incident-report',
          title: 'تقرير حادث',
          description: 'تسجيل حادث سلامة',
          icon: AlertTriangle,
          color: 'bg-red-500 hover:bg-red-600',
          action: () => navigate('/safety/incident/new')
        },
        {
          id: 'safety-inspection',
          title: 'تفتيش السلامة',
          description: 'جولة تفتيش',
          icon: ClipboardCheck,
          color: 'bg-yellow-500 hover:bg-yellow-600',
          action: () => navigate('/safety/inspection/new')
        }
      ]
    };

    const userRole = user?.role || 'viewer';
    const actions = [...baseActions];

    if (roleSpecificActions[userRole]) {
      actions.unshift(...roleSpecificActions[userRole]);
    }

    return actions.slice(0, 6); // Limit to 6 actions
  };

  const actions = getActionsForRole();

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>الإجراءات السريعة</h3>
        <span className='text-sm text-gray-500'>
          {user?.role === 'admin'
            ? 'مدير النظام'
            : user?.role === 'manager'
              ? 'مدير عام'
              : user?.role === 'production'
                ? 'مدير الإنتاج'
                : user?.role === 'inventory'
                  ? 'مدير المخزون'
                  : user?.role === 'sales'
                    ? 'مدير المبيعات'
                    : user?.role === 'quality'
                      ? 'مراقب الجودة'
                      : user?.role === 'safety'
                        ? 'مسؤول السلامة'
                        : 'مستخدم'}
        </span>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md group`}
            >
              <div className='flex flex-col items-center text-center space-y-2'>
                <Icon className='w-6 h-6 group-hover:scale-110 transition-transform' />
                <div>
                  <div className='font-medium text-sm'>{action.title}</div>
                  <div className='text-xs opacity-90'>{action.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Quick Stats */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-blue-600'>12</div>
            <div className='text-xs text-gray-500'>مهام اليوم</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-green-600'>5</div>
            <div className='text-xs text-gray-500'>مكتملة</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-orange-600'>3</div>
            <div className='text-xs text-gray-500'>معلقة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
