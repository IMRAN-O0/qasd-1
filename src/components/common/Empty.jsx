import React from 'react';
import { FileX, Package, Users, ShoppingCart, Search, Database, Inbox, AlertCircle } from 'lucide-react';

export const Empty = ({
  icon: Icon = FileX,
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي بيانات لعرضها',
  action,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: {
      icon: 'w-8 h-8',
      title: 'text-base',
      description: 'text-sm',
      padding: 'p-6'
    },
    md: {
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-base',
      padding: 'p-12'
    },
    lg: {
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-lg',
      padding: 'p-16'
    }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeConfig.padding} ${className}`}>
      <Icon className={`${sizeConfig.icon} text-gray-400 mb-4`} />
      <h3 className={`${sizeConfig.title} font-medium text-gray-900 mb-2`}>{title}</h3>
      <p className={`${sizeConfig.description} text-gray-500 mb-6 max-w-sm`}>{description}</p>
      {action}
    </div>
  );
};

export const EmptyProducts = ({ onAddProduct }) => (
  <Empty
    icon={Package}
    title='لا توجد منتجات'
    description='ابدأ بإضافة منتج جديد لبناء كتالوج منتجاتك'
    action={
      onAddProduct && (
        <button
          onClick={onAddProduct}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          إضافة منتج جديد
        </button>
      )
    }
  />
);

export const EmptyCustomers = ({ onAddCustomer }) => (
  <Empty
    icon={Users}
    title='لا توجد عملاء'
    description='قم بإضافة عملاء جدد لبدء إدارة قاعدة بيانات العملاء'
    action={
      onAddCustomer && (
        <button
          onClick={onAddCustomer}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          إضافة عميل جديد
        </button>
      )
    }
  />
);

export const EmptyOrders = ({ onCreateOrder }) => (
  <Empty
    icon={ShoppingCart}
    title='لا توجد طلبات'
    description='لم يتم إنشاء أي طلبات بعد. ابدأ بإنشاء طلب جديد'
    action={
      onCreateOrder && (
        <button
          onClick={onCreateOrder}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
        >
          إنشاء طلب جديد
        </button>
      )
    }
  />
);

export const EmptySearch = ({ searchTerm, onClearSearch }) => (
  <Empty
    icon={Search}
    title='لا توجد نتائج'
    description={`لم يتم العثور على نتائج للبحث عن "${searchTerm}"`}
    action={
      onClearSearch && (
        <button onClick={onClearSearch} className='text-blue-600 hover:text-blue-700 font-medium'>
          مسح البحث
        </button>
      )
    }
  />
);

export const EmptyInventory = ({ onAddItem }) => (
  <Empty
    icon={Database}
    title='المخزون فارغ'
    description='لا توجد مواد في المخزون. ابدأ بإضافة مواد جديدة'
    action={
      onAddItem && (
        <button
          onClick={onAddItem}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          إضافة مادة جديدة
        </button>
      )
    }
  />
);

export const EmptyInbox = () => (
  <Empty icon={Inbox} title='صندوق الوارد فارغ' description='لا توجد رسائل أو إشعارات جديدة' size='sm' />
);

export const EmptyError = ({ onRetry }) => (
  <Empty
    icon={AlertCircle}
    title='حدث خطأ'
    description='لم نتمكن من تحميل البيانات. يرجى المحاولة مرة أخرى'
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
        >
          إعادة المحاولة
        </button>
      )
    }
  />
);

export default Empty;
