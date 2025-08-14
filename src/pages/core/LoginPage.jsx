
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { username, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('فشل في الحصول على رمز المصادقة');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error?.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  // Old mock authentication code (commented out)
  /*
    try {
      // قاعدة بيانات مستخدمين وهمية
      const users = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'المدير العام',
          email: 'admin@company.com',
          role: 'admin',
          department: 'الإدارة',
          phone: '0501234567'
        },
        {
          id: '2',
          username: 'inventory',
          password: 'inventory123',
          name: 'مدير المخزون',
          email: 'inventory@company.com',
          role: 'inventory',
          department: 'المخزون',
          phone: '0502345678'
        },
        {
          id: '3',
          username: 'production',
          password: 'production123',
          name: 'مدير الإنتاج',
          email: 'production@company.com',
          role: 'production',
          department: 'الإنتاج',
          phone: '0503456789'
        },
        {
          id: '4',
          username: 'quality',
          password: 'quality123',
          name: 'مدير الجودة',
          email: 'quality@company.com',
          role: 'quality',
          department: 'الجودة',
          phone: '0504567890'
        },
        {
          id: '5',
          username: 'sales',
          password: 'sales123',
          name: 'مدير المبيعات',
          email: 'sales@company.com',
          role: 'sales',
          department: 'المبيعات',
          phone: '0505678901'
        },
        {
          id: '6',
          username: 'viewer',
          password: 'viewer123',
          name: 'مراقب النظام',
          email: 'viewer@company.com',
          role: 'viewer',
          department: 'المراقبة',
          phone: '0506789012'
        }
      ];

      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        login(userWithoutPassword);
        navigate('/dashboard');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError(err.message || 'خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  */

  // بيانات تجريبية للمساعدة
  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'مدير عام' },
    { username: 'inventory', password: 'inventory123', role: 'مدير المخزون' },
    { username: 'production', password: 'production123', role: 'مدير الإنتاج' },
    { username: 'quality', password: 'quality123', role: 'مدير الجودة' },
    { username: 'sales', password: 'sales123', role: 'مدير المبيعات' },
    { username: 'viewer', password: 'viewer123', role: 'مراقب النظام' }
  ];

  const fillDemoCredentials = credentials => {
    setUsername(credentials.username);
    setPassword(credentials.password);
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden'
      dir='rtl'
    >
      {/* خلفية زخرفية */}
      <div className='absolute inset-0 opacity-10 pointer-events-none'>
        <div className='absolute top-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse'></div>
        <div className='absolute top-40 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000'></div>
        <div className='absolute bottom-10 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000'></div>
      </div>

      <div className='w-full max-w-md relative z-10'>
        {/* شعار النظام */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg'>
            <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>نظام إدارة الصنائع المتكامل</h1>
          <p className='text-gray-600 text-sm'>حلول شاملة لإدارة العمليات الصناعية والتصنيعية</p>
        </div>

        <Card className='backdrop-blur-sm bg-white/80 shadow-2xl border-0'>
          <div className='p-8'>
            <div className='flex items-center justify-center mb-6'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
            </div>
            <h2 className='text-xl font-bold text-center text-gray-800 mb-6'>تسجيل الدخول</h2>

            {/* بيانات تجريبية */}
            <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
              <div className='flex items-center mb-3'>
                <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2'>
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
                <h3 className='text-sm font-semibold text-blue-800'>بيانات تجريبية</h3>
              </div>
              <div className='grid gap-2'>
                {demoCredentials.map((cred, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center p-2 bg-white/60 rounded-lg hover:bg-white/80 transition-all duration-200'
                  >
                    <div className='flex items-center'>
                      <div className='w-2 h-2 bg-blue-400 rounded-full ml-2'></div>
                      <span className='text-xs text-blue-700 font-medium'>{cred.role}</span>
                      <span className='text-xs text-gray-500 mr-2'>({cred.username})</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => fillDemoCredentials(cred)}
                      className='px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 shadow-sm'
                    >
                      استخدام
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-xl flex items-center'>
                <div className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center ml-2 flex-shrink-0'>
                  <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='text-sm'>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className='mb-4'>
                <Input
                  label='اسم المستخدم'
                  type='text'
                  placeholder='admin'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className='mb-6'>
                <Input
                  label='كلمة المرور'
                  type='password'
                  placeholder='********'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                disabled={isLoading}
              >
                <div className='flex items-center justify-center'>
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                      </svg>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                        />
                      </svg>
                      تسجيل الدخول
                    </>
                  )}
                </div>
              </Button>
            </form>
          </div>
        </Card>

        {/* تذييل الصفحة */}
        <div className='text-center mt-8'>
          <p className='text-gray-500 text-sm mb-2'>© 2024 جميع الحقوق محفوظة - نظام إدارة الصنائع المتكامل</p>
          <div className='flex items-center justify-center space-x-4 text-xs text-gray-400'>
            <span>الإصدار 1.0.0</span>
            <span>•</span>
            <span>دعم فني: support@company.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

