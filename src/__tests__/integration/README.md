# اختبارات التكامل

هذا المجلد يحتوي على اختبارات التكامل للتطبيق، والتي تختبر تفاعل المكونات والوظائف مع بعضها البعض.

## بنية المجلد

```
integration/
├── auth/           # اختبارات تكامل المصادقة
├── production/     # اختبارات تكامل الإنتاج
├── inventory/      # اختبارات تكامل المخزون
└── sales/          # اختبارات تكامل المبيعات
```

## أمثلة على اختبارات التكامل

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/auth/LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';

describe('Login Flow', () => {
  test('should navigate to dashboard after successful login', async () => {
    // تجهيز محاكاة للتنقل
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    // تقديم صفحة تسجيل الدخول مع مزود المصادقة
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // إدخال بيانات تسجيل الدخول
    fireEvent.change(screen.getByLabelText(/اسم المستخدم/i), {
      target: { value: 'admin' }
    });
    fireEvent.change(screen.getByLabelText(/كلمة المرور/i), {
      target: { value: 'admin123' }
    });

    // النقر على زر تسجيل الدخول
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/i }));

    // التحقق من التنقل إلى لوحة التحكم بعد تسجيل الدخول
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```
