# اختبارات وظائف المساعدة

هذا المجلد يحتوي على اختبارات وحدة للوظائف المساعدة المستخدمة في التطبيق.

## بنية المجلد

```
utils/
├── auth.test.js       # اختبارات وظائف المصادقة
├── storage.test.js    # اختبارات وظائف التخزين
├── permissions.test.js # اختبارات وظائف الصلاحيات
├── validation.test.js # اختبارات وظائف التحقق
└── formatters.test.js # اختبارات وظائف التنسيق
```

## أمثلة على اختبارات الوظائف المساعدة

```javascript
import { passwordUtils } from '../../utils/auth';

describe('Password Utilities', () => {
  describe('validatePasswordStrength', () => {
    test('should return weak for short passwords', () => {
      const result = passwordUtils.validatePasswordStrength('abc123');
      expect(result.strength).toBe('ضعيف');
      expect(result.score).toBeLessThan(3);
    });

    test('should return medium for passwords with mixed characters', () => {
      const result = passwordUtils.validatePasswordStrength('Abcdef123');
      expect(result.strength).toBe('متوسط');
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    test('should return strong for complex passwords', () => {
      const result = passwordUtils.validatePasswordStrength('Abcdef123!@#');
      expect(result.strength).toBe('قوي');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });
  });

  describe('hashPassword', () => {
    test('should hash password consistently', () => {
      const password = 'mySecurePassword123';
      const hash1 = passwordUtils.hashPassword(password);
      const hash2 = passwordUtils.hashPassword(password);
      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different passwords', () => {
      const hash1 = passwordUtils.hashPassword('password1');
      const hash2 = passwordUtils.hashPassword('password2');
      expect(hash1).not.toBe(hash2);
    });
  });
});
```
