# اختبارات المكونات

هذا المجلد يحتوي على اختبارات وحدة للمكونات المستخدمة في التطبيق.

## بنية المجلد

```
components/
├── common/       # اختبارات المكونات المشتركة
├── layout/       # اختبارات مكونات التخطيط
└── [module]/     # اختبارات مكونات خاصة بوحدة معينة
```

## أمثلة على اختبارات المكونات

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/common/Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>اضغط هنا</Button>);
    expect(screen.getByText('اضغط هنا')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>اضغط هنا</Button>);
    fireEvent.click(screen.getByText('اضغط هنا'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
