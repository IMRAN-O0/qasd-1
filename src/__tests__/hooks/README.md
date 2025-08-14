# اختبارات الهوكس المخصصة

هذا المجلد يحتوي على اختبارات وحدة للهوكس المخصصة المستخدمة في التطبيق.

## بنية المجلد

```
hooks/
├── useAuth.test.js       # اختبارات هوك المصادقة
├── useForm.test.js       # اختبارات هوك النماذج
├── useLocalStorage.test.js # اختبارات هوك التخزين المحلي
└── useNotifications.test.js # اختبارات هوك الإشعارات
```

## أمثلة على اختبارات الهوكس

```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // تنظيف التخزين المحلي قبل كل اختبار
    localStorage.clear();
  });

  test('should return initial value if no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  test('should return stored value if it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current[0]).toBe('stored value');
  });

  test('should update stored value when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(JSON.parse(localStorage.getItem('test-key'))).toBe('new value');
  });
});
```
