import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex' dir='rtl'>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col lg:mr-80'>
        {/* Top Navigation */}
        <Navigation onToggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className='flex-1 overflow-auto'>
          <div className='container mx-auto px-4 py-6'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
