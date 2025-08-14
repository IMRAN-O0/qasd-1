import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Loading, Notification } from '../../components/common';
import { useAuth } from '../../hooks';
import { passwordUtils } from '../../utils/auth';
import { Eye, EyeOff, Lock, User, Building, Shield, CheckCircle, AlertCircle, Mail } from 'lucide-react';

const LoginSetup = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  // إعادة توجيه إذا كان المستخدم مسجل الدخول بالفعل
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  // إدارة قفل تسجيل الدخول
  useEffect(() => {
    if (lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(lockTimeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [lockTimeRemaining, isLocked]);

  // مراقبة قوة كلمة المرور
  useEffect(() => {
    if (formData.password) {
      const strength = passwordUtils.validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async e => {
    e.preventDefault();

    if (isLocked) {
      Notification.error('تم قفل تسجيل الدخول', `يرجى الانتظار ${lockTimeRemaining} ثانية`);
      return;
    }

    if (!formData.username.trim() || !formData.password.trim()) {
      Notification.warning('بيانات ناقصة', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    try {
      await login(formData);
      Notification.success('تم تسجيل الدخول بنجاح', 'مرحباً بك في نظام إدارة المصانع');
    } catch (error) {
      setLoginAttempts(prev => prev + 1);

      if (loginAttempts >= 4) {
        // 5 محاولات إجمالية
        setIsLocked(true);
        setLockTimeRemaining(300); // 5 دقائق
        Notification.error('تم قفل الحساب', 'تم تجاوز عدد محاولات تسجيل الدخول المسموحة');
      } else {
        const remainingAttempts = 4 - loginAttempts;
        Notification.error('خطأ في تسجيل الدخول', `${error.message}. المحاولات المتبقية: ${remainingAttempts}`);
      }
    }
  };

  const handleForgotPassword = async e => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      Notification.warning('البريد الإلكتروني مطلوب', 'يرجى إدخال بريدك الإلكتروني');
      return;
    }

    try {
      // محاكاة إرسال رابط إعادة تعيين كلمة المرور
      await new Promise(resolve => setTimeout(resolve, 2000));

      Notification.success('تم الإرسال بنجاح', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      Notification.error('خطأ في الإرسال', 'حدث خطأ أثناء إرسال رابط إعادة التعيين');
    }
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'مدير عام' },
    { username: 'manager', password: 'manager123', role: 'مدير قسم' },
    { username: 'employee', password: 'employee123', role: 'موظف' }
  ];

  const fillDemoCredentials = credentials => {
    setFormData({
      username: credentials.username,
      password: credentials.password,
      rememberMe: false
    });
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) {
      return '';
    }
    switch (passwordStrength.strength) {
      case 'قوي':
        return 'text-green-600';
      case 'متوسط':
        return 'text-yellow-600';
      case 'ضعيف':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatLockTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showForgotPassword) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Mail className='text-blue-600' size={32} />
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-2'>نسيت كلمة المرور؟</h1>
            <p className='text-gray-600'>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          <form onSubmit={handleForgotPassword} className='space-y-4'>
            <Input
              label='البريد الإلكتروني'
              type='email'
              value={forgotPasswordEmail}
              onChange={e => setForgotPasswordEmail(e.target.value)}
              placeholder='name@company.com'
              icon={Mail}
              required
            />

            <div className='flex gap-2'>
              <Button type='submit' color='primary' className='flex-1' loading={isLoading}>
                إرسال الرابط
              </Button>
              <Button type='button' variant='outline' onClick={() => setShowForgotPassword(false)}>
                رجوع
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
        {/* جانب المعلومات */}
        <div className='text-center lg:text-right'>
          <div className='w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6'>
            <Building className='text-white' size={40} />
          </div>

          <h1 className='text-4xl font-bold text-gray-800 mb-4'>نظام إدارة المصانع المتكامل</h1>

          <p className='text-xl text-gray-600 mb-8'>حلول شاملة لإدارة العمليات الصناعية والتصنيعية</p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
            <div className='flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm'>
              <Shield className='text-blue-600' size={24} />
              <div className='text-right'>
                <div className='font-semibold'>أمان عالي</div>
                <div className='text-sm text-gray-600'>حماية متقدمة للبيانات</div>
              </div>
            </div>

            <div className='flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm'>
              <CheckCircle className='text-green-600' size={24} />
              <div className='text-right'>
                <div className='font-semibold'>سهولة الاستخدام</div>
                <div className='text-sm text-gray-600'>واجهة بسيطة وفعالة</div>
              </div>
            </div>
          </div>

          {/* بيانات تجريبية */}
          <Card className='p-4 bg-white/80 backdrop-blur-sm'>
            <h3 className='font-semibold text-gray-800 mb-3'>حسابات تجريبية:</h3>
            <div className='space-y-2 text-sm'>
              {demoCredentials.map((cred, index) => (
                <div key={index} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                  <div>
                    <span className='font-medium'>{cred.role}:</span> {cred.username} / {cred.password}
                  </div>
                  <Button size='sm' variant='outline' onClick={() => fillDemoCredentials(cred)}>
                    استخدام
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* نموذج تسجيل الدخول */}
        <Card className='p-8'>
          <div className='text-center mb-6'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Lock className='text-blue-600' size={32} />
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>تسجيل الدخول</h2>
            <p className='text-gray-600'>أدخل بياناتك للوصول إلى النظام</p>
          </div>

          {isLocked && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2'>
              <AlertCircle className='text-red-600' size={16} />
              <span className='text-red-700 text-sm'>تم قفل تسجيل الدخول لمدة {formatLockTime(lockTimeRemaining)}</span>
            </div>
          )}

          {loginAttempts > 0 && !isLocked && (
            <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <span className='text-yellow-700 text-sm'>محاولة خاطئة. المحاولات المتبقية: {5 - loginAttempts}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-4'>
            <Input
              label='اسم المستخدم'
              value={formData.username}
              onChange={e => handleInputChange('username', e.target.value)}
              placeholder='أدخل اسم المستخدم'
              icon={User}
              disabled={isLocked}
              required
            />

            <div className='relative'>
              <Input
                label='كلمة المرور'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder='أدخل كلمة المرور'
                icon={Lock}
                disabled={isLocked}
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute left-3 top-9 text-gray-400 hover:text-gray-600'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {passwordStrength && (
              <div className='text-xs'>
                <div className={`font-medium ${getPasswordStrengthColor()}`}>
                  قوة كلمة المرور: {passwordStrength.strength}
                </div>
                <div className='mt-1 space-y-1'>
                  {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                    <div key={key} className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-red-600'}`}>
                      {met ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      <span>
                        {key === 'minLength' && 'على الأقل 8 أحرف'}
                        {key === 'hasUpper' && 'حرف كبير'}
                        {key === 'hasLower' && 'حرف صغير'}
                        {key === 'hasNumber' && 'رقم'}
                        {key === 'hasSpecial' && 'رمز خاص'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.rememberMe}
                  onChange={e => handleInputChange('rememberMe', e.target.checked)}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  disabled={isLocked}
                />
                <span className='text-sm text-gray-600'>تذكرني</span>
              </label>

              <button
                type='button'
                onClick={() => setShowForgotPassword(true)}
                className='text-sm text-blue-600 hover:text-blue-800'
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <Button type='submit' color='primary' size='lg' className='w-full' disabled={isLocked} loading={isLoading}>
              {isLocked ? `مقفل لمدة ${formatLockTime(lockTimeRemaining)}` : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-500'>
            <p>© 2024 نظام إدارة المصانع المتكامل. جميع الحقوق محفوظة.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginSetup;
