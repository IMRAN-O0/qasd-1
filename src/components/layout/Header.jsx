import React from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../../App';
import Button from '../common/Button';

const Header = () => {
  const { user, tenantConfig, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    // The navigation to /login will be handled by the ProtectedRoute component
  };

  return (
    <header className='bg-white shadow-sm p-4 flex items-center justify-between' dir='rtl'>
      <div className='flex items-center gap-4'>
        {tenantConfig?.logo && <img src={tenantConfig.logo} alt='Logo' className='h-10 w-auto' />}
        <div>
          <h1 className='text-xl font-bold text-gray-800'>{tenantConfig?.companyName || 'نظام إدارة المصانع'}</h1>
          <p className='text-sm text-gray-500'>مرحباً، {user?.name || 'المستخدم'}</p>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon'>
          <Bell size={20} />
        </Button>
        <Button variant='ghost' size='icon'>
          <Settings size={20} />
        </Button>
        <Button variant='outline' size='sm' onClick={handleLogout}>
          <LogOut size={16} className='ml-2' />
          خروج
        </Button>
      </div>
    </header>
  );
};

export default Header;
