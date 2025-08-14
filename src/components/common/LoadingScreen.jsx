import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center' dir='rtl'>
      <div className='text-center'>
        <div className='mb-4'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto' />
        </div>
        <h2 className='text-xl font-semibold text-gray-700 mb-2'>جاري تحميل النظام</h2>
        <p className='text-gray-500'>الرجاء الانتظار...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
