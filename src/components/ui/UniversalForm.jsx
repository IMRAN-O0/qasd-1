import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, Card } from '../common';
// Fix import path
import useUnifiedDataStore from '../../hooks/useUnifiedDataStore';

/**
 * مكون نموذج عالمي يدعم جميع أنواع الحقول مع التحقق والتكامل
 * يتكامل مع نظام إدارة البيانات الموحد
 */
// Fix initial state to prevent undefined values
const UniversalForm = ({
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  onFieldChange,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  className = '',
  disabled = false,
  loading = false,
  showCancelButton = true,
  validateOnChange = true,
  validateOnBlur = true,
  resetOnSubmit = false,
  autoFocus = true,
  direction = 'rtl',
  layout = 'vertical', // 'vertical', 'horizontal', 'grid'
  gridCols = 2,
  spacing = 'normal', // 'tight', 'normal', 'loose'
  showRequiredIndicator = true,
  showErrorSummary = false,
  customValidation,
  beforeSubmit,
  afterSubmit,
  title,
  subtitle,
  ...props
}) => {
  // Initialize form data with proper defaults
  const [formData, setFormData] = useState(() => {
    const initialFormData = {};
    fields.forEach(field => {
      const fieldName = field.name || field.key;
      initialFormData[fieldName] = initialData[fieldName] || field.defaultValue || '';
    });
    return initialFormData;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const formRef = useRef(null);
  const fieldRefs = useRef({});

  // Get data from unified store
  const { showNotification, loading: storeLoading } = useUnifiedDataStore();

  // تحديث البيانات عند تغيير البيانات الأولية
  useEffect(() => {
    const initialFormState = {};
    fields.forEach(field => {
      initialFormState[field.name] = initialData[field.name] || (field.multiple ? [] : '');
    });
    setFormData(initialFormState);
    setErrors({});
    setTouched({});
  }, [initialData, fields]);

  // التركيز على أول حقل عند التحميل
  useEffect(() => {
    if (autoFocus && fields.length > 0) {
      const firstField = fields.find(field => !field.disabled && field.type !== 'hidden');
      if (firstField && fieldRefs.current[firstField.name]) {
        setTimeout(() => {
          fieldRefs.current[firstField.name]?.focus();
        }, 100);
      }
    }
  }, [autoFocus, fields]);

  // التحقق من صحة حقل واحد
  const validateField = useCallback(
    (fieldName, value, fieldConfig) => {
      const errors = [];

      // التحقق المطلوب
      if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${fieldConfig.label} مطلوب`);
      }

      // التحقق من الطول
      if (value && typeof value === 'string') {
        if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
          errors.push(`يجب أن يكون النص ${fieldConfig.minLength} أحرف على الأقل`);
        }
        if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
          errors.push(`يجب أن يكون النص ${fieldConfig.maxLength} أحرف كحد أقصى`);
        }
      }

      // التحقق من النمط
      if (value && fieldConfig.pattern && !new RegExp(fieldConfig.pattern).test(value)) {
        errors.push(fieldConfig.patternMessage || 'تنسيق البيانات غير صحيح');
      }

      // التحقق المخصص للحقل
      if (fieldConfig.validation && typeof fieldConfig.validation === 'function') {
        const customError = fieldConfig.validation(value, formData);
        if (customError) {
          errors.push(customError);
        }
      }

      // التحقق حسب النوع
      if (value && typeof value === 'string') {
        switch (fieldConfig.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push('البريد الإلكتروني غير صحيح');
            }
            break;
          case 'tel':
          case 'phone':
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
              errors.push('رقم الهاتف غير صحيح');
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              errors.push('رابط غير صحيح');
            }
            break;
          case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) {
              errors.push('يجب إدخال رقم صحيح');
            } else {
              if (fieldConfig.min !== undefined && num < fieldConfig.min) {
                errors.push(`القيمة يجب أن تكون ${fieldConfig.min} أو أكثر`);
              }
              if (fieldConfig.max !== undefined && num > fieldConfig.max) {
                errors.push(`القيمة يجب أن تكون ${fieldConfig.max} أو أقل`);
              }
            }
            break;
        }
      }

      return errors.length > 0 ? errors[0] : null;
    },
    [formData]
  );

  // التحقق من صحة النموذج بالكامل
  const validateForm = useCallback(() => {
    const newErrors = {};

    fields.forEach(field => {
      if (field.type === 'hidden') {
        return;
      }

      const value = formData[field.name];
      const error = validateField(field.name, value, field);

      if (error) {
        newErrors[field.name] = error;
      }
    });

    // التحقق المخصص للنموذج
    if (customValidation && typeof customValidation === 'function') {
      const customErrors = customValidation(formData);
      if (customErrors && typeof customErrors === 'object') {
        Object.assign(newErrors, customErrors);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField, customValidation]);

  // معالج تغيير قيمة الحقل
  const handleFieldChange = useCallback(
    (fieldName, value, fieldConfig) => {
      const newFormData = { ...formData, [fieldName]: value };
      setFormData(newFormData);

      // التحقق عند التغيير
      if (validateOnChange && (touched[fieldName] || submitAttempted)) {
        const error = validateField(fieldName, value, fieldConfig);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }

      // استدعاء معالج التغيير الخارجي
      if (onFieldChange) {
        onFieldChange(fieldName, value, newFormData);
      }
    },
    [formData, touched, submitAttempted, validateOnChange, validateField, onFieldChange]
  );

  // معالج فقدان التركيز
  const handleFieldBlur = useCallback(
    (fieldName, value, fieldConfig) => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      // التحقق عند فقدان التركيز
      if (validateOnBlur) {
        const error = validateField(fieldName, value, fieldConfig);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    },
    [validateOnBlur, validateField]
  );

  // معالج إرسال النموذج
  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitAttempted(true);

    // التحقق من صحة النموذج
    const isValid = validateForm();
    if (!isValid) {
      // التركيز على أول حقل خطأ
      const firstErrorField = fields.find(field => errors[field.name]);
      if (firstErrorField && fieldRefs.current[firstErrorField.name]) {
        fieldRefs.current[firstErrorField.name].focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // تنفيذ معالج ما قبل الإرسال
      if (beforeSubmit) {
        const shouldContinue = await beforeSubmit(formData);
        if (shouldContinue === false) {
          setIsSubmitting(false);
          return;
        }
      }

      // إرسال النموذج
      if (onSubmit) {
        await onSubmit(formData);
      }

      // تنفيذ معالج ما بعد الإرسال
      if (afterSubmit) {
        await afterSubmit(formData);
      }

      // إعادة تعيين النموذج إذا طُلب ذلك
      if (resetOnSubmit) {
        setFormData(initialData);
        setErrors({});
        setTouched({});
        setSubmitAttempted(false);
      }
    } catch (error) {
      console.error('خطأ في إرسال النموذج:', error);
      // يمكن إضافة معالجة أخطاء مخصصة هنا
    } finally {
      setIsSubmitting(false);
    }
  };

  // معالج الإلغاء
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // معالج تحميل الملف
  const handleFileUpload = (fieldName, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        handleFieldChange(fieldName, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // الحصول على خيارات حقل الاختيار الديناميق
  const getDynamicOptions = field => {
    switch (field.dataSource) {
      case 'materials':
        return unifiedStore.getAvailableMaterials().map(item => ({
          value: item.id,
          label: `${item.nameAr} (${item.code})`
        }));
      case 'products':
        return unifiedStore.getAvailableProducts().map(item => ({
          value: item.id,
          label: `${item.nameAr} (${item.code})`
        }));
      case 'customers':
        return unifiedStore.getActiveCustomers().map(item => ({
          value: item.id,
          label: `${item.nameAr} (${item.code || item.phone})`
        }));
      default:
        return field.options || [];
    }
  };

  // عرض حقل واحد
  const renderField = field => {
    const {
      name,
      type = 'text',
      label,
      placeholder,
      required = false,
      disabled: fieldDisabled = false,
      options = [],
      dataType,
      searchFields,
      displayField,
      valueField,
      multiple = false,
      clearable = true,
      searchable = true,
      className: fieldClassName = '',
      ...fieldProps
    } = field;

    const value = formData[name] || (multiple ? [] : '');
    const error = errors[name];
    const isDisabled = disabled || fieldDisabled || isSubmitting;

    const commonProps = {
      value,
      error,
      disabled: isDisabled,
      required,
      className: fieldClassName,
      ref: el => {
        fieldRefs.current[name] = el;
      },
      ...fieldProps
    };

    // حقول الاختيار
    if (type === 'select' || dataType) {
      return (
        <Select
          key={name}
          options={getDynamicOptions(field)}
          placeholder={placeholder || `اختر ${label || name}...`}
          onChange={newValue => handleFieldChange(name, newValue, field)}
          onBlur={() => handleFieldBlur(name, value, field)}
          {...commonProps}
        />
      );
    }

    // حقول النص والإدخال الأخرى
    return (
      <Input
        key={name}
        type={type}
        label={label}
        placeholder={placeholder}
        onChange={event => handleFieldChange(name, event.target.value, field)}
        onBlur={() => handleFieldBlur(name, value, field)}
        {...commonProps}
      />
    );
  };

  // تحديد فئات CSS للتخطيط
  const getLayoutClasses = () => {
    const spacingClasses = {
      tight: 'space-y-2',
      normal: 'space-y-4',
      loose: 'space-y-6'
    };

    const baseClasses = spacingClasses[spacing] || spacingClasses.normal;

    if (layout === 'grid') {
      return `grid grid-cols-1 md:grid-cols-${gridCols} gap-4`;
    }

    return baseClasses;
  };

  // الحصول على ملخص الأخطاء
  const getErrorSummary = () => {
    const errorFields = Object.keys(errors).filter(key => errors[key]);
    if (errorFields.length === 0) {
      return null;
    }

    return (
      <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-4'>
        <div className='flex items-center mb-2'>
          <ExclamationTriangleIcon className='h-5 w-5 text-red-400 ml-2' />
          <h3 className='text-sm font-medium text-red-800'>يرجى تصحيح الأخطاء التالية:</h3>
        </div>
        <ul className='text-sm text-red-700 space-y-1'>
          {errorFields.map(fieldName => {
            const field = fields.find(f => f.name === fieldName);
            const fieldLabel = field?.label || fieldName;
            return (
              <li key={fieldName} className='flex items-center'>
                <span className='font-medium ml-1'>{fieldLabel}:</span>
                <span>{errors[fieldName]}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // فلترة الخصائص غير المناسبة للـ DOM
  const { validation, isLoading, formFields, ...domProps } = props;

  return (
    <Card className={`${className}`} dir={direction}>
      {title && <h2 className='text-lg font-medium mb-2'>{title}</h2>}
      {subtitle && <p className='text-gray-600 mb-4'>{subtitle}</p>}
      <form ref={formRef} onSubmit={handleSubmit} className={`${className}`} dir={direction} noValidate {...domProps}>
        {/* ملخص الأخطاء */}
        {showErrorSummary && submitAttempted && getErrorSummary()}

        {/* الحقول */}
        <div className={getLayoutClasses()}>
          {fields.map(field => {
            if (field.type === 'hidden') {
              return <input key={field.name} type='hidden' name={field.name} value={formData[field.name] || ''} />;
            }

            return (
              <div key={field.name} className={field.containerClassName || ''}>
                {renderField(field)}
              </div>
            );
          })}
        </div>

        {/* أزرار الإجراءات */}
        <div className='flex items-center justify-end space-x-3 space-x-reverse mt-6 pt-4 border-t border-gray-200'>
          {showCancelButton && (
            <Button type='button' onClick={handleCancel} disabled={isSubmitting} variant='secondary'>
              {cancelLabel}
            </Button>
          )}

          <Button type='submit' disabled={disabled || isSubmitting || loading} variant='primary'>
            {(isSubmitting || loading) && <ArrowPathIcon className='animate-spin h-4 w-4 mr-2' />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UniversalForm;
