import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Loading } from './index';
import { validators, formatters } from '../../utils';
import { MESSAGES } from '../../constants';

/**
 * مكون النموذج المتقدم
 * يوفر إدارة شاملة للنماذج مع التحقق من صحة البيانات
 */
const Form = ({
  fields = [],
  initialData = {},
  validationRules = {},
  onSubmit,
  onCancel,
  submitText = 'حفظ',
  cancelText = 'إلغاء',
  loading = false,
  disabled = false,
  layout = 'vertical', // vertical, horizontal, inline
  columns = 1,
  showRequiredIndicator = true,
  validateOnChange = true,
  validateOnBlur = true,
  className = '',
  children
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث البيانات عند تغيير البيانات الأولية
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // التحقق من صحة حقل واحد
  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) {
        return null;
      }

      const fieldErrors = validators.validateForm({ [name]: value }, { [name]: rules });
      return fieldErrors[name] || null;
    },
    [validationRules]
  );

  // التحقق من صحة النموذج كاملاً
  const validateForm = useCallback(() => {
    const formErrors = validators.validateForm(formData, validationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData, validationRules]);

  // معالج تغيير القيم
  const handleChange = useCallback(
    (name, value) => {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (validateOnChange && touched[name]) {
        const fieldError = validateField(name, value);
        setErrors(prev => ({
          ...prev,
          [name]: fieldError
        }));
      }
    },
    [validateOnChange, touched, validateField]
  );

  // معالج فقدان التركيز
  const handleBlur = useCallback(
    name => {
      setTouched(prev => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const fieldError = validateField(name, formData[name]);
        setErrors(prev => ({
          ...prev,
          [name]: fieldError
        }));
      }
    },
    [validateOnBlur, formData, validateField]
  );

  // معالج إرسال النموذج
  const handleSubmit = async e => {
    e.preventDefault();

    if (disabled || isSubmitting) {
      return;
    }

    // تحديد جميع الحقول كمُلمسة
    const allTouched = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // التحقق من صحة النموذج
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error('خطأ في إرسال النموذج:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // معالج الإلغاء
  const handleCancel = () => {
    if (disabled || isSubmitting) {
      return;
    }
    onCancel?.();
  };

  // رندر حقل النموذج
  const renderField = field => {
    const {
      name,
      label,
      type = 'text',
      placeholder,
      options = [],
      required = false,
      disabled: fieldDisabled = false,
      hidden = false,
      readOnly = false,
      multiline = false,
      rows = 3,
      prefix,
      suffix,
      format,
      mask,
      min,
      max,
      step,
      accept,
      multiple = false,
      className: fieldClassName = '',
      style = {},
      ...fieldProps
    } = field;

    if (hidden) {
      return null;
    }

    const value = formData[name] || '';
    const error = errors[name];
    const hasError = touched[name] && error;

    // تنسيق القيمة للعرض
    const displayValue = format ? formatters[format]?.(value) || value : value;

    const fieldElement = (() => {
      switch (type) {
        case 'select':
          return (
            <Select
              value={value}
              onChange={val => handleChange(name, val)}
              onBlur={() => handleBlur(name)}
              placeholder={placeholder}
              options={options}
              disabled={disabled || fieldDisabled}
              error={hasError}
              className={fieldClassName}
              {...fieldProps}
            />
          );

        case 'textarea':
          return (
            <textarea
              value={displayValue}
              onChange={e => handleChange(name, e.target.value)}
              onBlur={() => handleBlur(name)}
              placeholder={placeholder}
              disabled={disabled || fieldDisabled}
              readOnly={readOnly}
              rows={rows}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              } ${fieldClassName}`}
              style={style}
              {...fieldProps}
            />
          );

        case 'checkbox':
          return (
            <label className='flex items-center space-x-2 space-x-reverse'>
              <input
                type='checkbox'
                checked={value}
                onChange={e => handleChange(name, e.target.checked)}
                onBlur={() => handleBlur(name)}
                disabled={disabled || fieldDisabled}
                className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${fieldClassName}`}
                {...fieldProps}
              />
              <span className='text-sm text-gray-700'>{label}</span>
            </label>
          );

        case 'radio':
          return (
            <div className='space-y-2'>
              {options.map(option => (
                <label key={option.value} className='flex items-center space-x-2 space-x-reverse'>
                  <input
                    type='radio'
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={e => handleChange(name, e.target.value)}
                    onBlur={() => handleBlur(name)}
                    disabled={disabled || fieldDisabled}
                    className={`border-gray-300 text-blue-600 focus:ring-blue-500 ${fieldClassName}`}
                    {...fieldProps}
                  />
                  <span className='text-sm text-gray-700'>{option.label}</span>
                </label>
              ))}
            </div>
          );

        case 'file':
          return (
            <input
              type='file'
              onChange={e => handleChange(name, multiple ? e.target.files : e.target.files[0])}
              onBlur={() => handleBlur(name)}
              disabled={disabled || fieldDisabled}
              accept={accept}
              multiple={multiple}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                hasError ? 'border-red-500' : 'border-gray-300'
              } ${fieldClassName}`}
              {...fieldProps}
            />
          );

        default:
          return (
            <Input
              type={type}
              value={displayValue}
              onChange={val => handleChange(name, val)}
              onBlur={() => handleBlur(name)}
              placeholder={placeholder}
              disabled={disabled || fieldDisabled}
              readOnly={readOnly}
              error={hasError}
              prefix={prefix}
              suffix={suffix}
              min={min}
              max={max}
              step={step}
              className={fieldClassName}
              style={style}
              {...fieldProps}
            />
          );
      }
    })();

    return (
      <div key={name} className={`form-field ${type === 'checkbox' ? '' : 'space-y-1'}`}>
        {type !== 'checkbox' && label && (
          <label className='block text-sm font-medium text-gray-700'>
            {label}
            {required && showRequiredIndicator && <span className='text-red-500 mr-1'>*</span>}
          </label>
        )}

        {fieldElement}

        {hasError && <p className='text-sm text-red-600'>{error}</p>}
      </div>
    );
  };

  // تحديد تخطيط الأعمدة
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4',
    inline: 'flex flex-wrap gap-4'
  };

  return (
    <form onSubmit={handleSubmit} className={`form ${className}`}>
      <div className={`${layoutClasses[layout]} ${columns > 1 ? `grid ${gridCols[columns]} gap-4` : ''}`}>
        {fields.map(renderField)}
      </div>

      {children}

      <div className='flex justify-end space-x-3 space-x-reverse mt-6 pt-4 border-t'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={handleCancel} disabled={disabled || isSubmitting}>
            {cancelText}
          </Button>
        )}

        <Button type='submit' variant='primary' disabled={disabled || isSubmitting} loading={loading || isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};

/**
 * مكون النموذج السريع
 * لإنشاء نماذج بسيطة بسرعة
 */
const QuickForm = ({ fields, onSubmit, submitText = 'حفظ', ...props }) => {
  const [data, setData] = useState({});

  const handleSubmit = formData => {
    onSubmit?.(formData);
  };

  return <Form fields={fields} initialData={data} onSubmit={handleSubmit} submitText={submitText} {...props} />;
};

/**
 * مكون النموذج المتدرج
 * لإنشاء نماذج متعددة الخطوات
 */
const StepForm = ({ steps = [], onComplete, onCancel, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleStepSubmit = data => {
    const newStepData = { ...stepData, ...data };
    setStepData(newStepData);
    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (isLastStep) {
      onComplete?.(newStepData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = stepIndex => {
    if (completedSteps.has(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className={`step-form ${className}`}>
      {/* مؤشر الخطوات */}
      <div className='flex items-center justify-center mb-8'>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                index === currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : completedSteps.has(index)
                    ? 'bg-green-600 border-green-600 text-white'
                    : index < currentStep
                      ? 'bg-gray-300 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-400'
              }`}
              onClick={() => handleStepClick(index)}
            >
              {completedSteps.has(index) ? (
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <span className='text-sm font-medium'>{index + 1}</span>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${completedSteps.has(index) ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* عنوان الخطوة */}
      <div className='text-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-900'>{currentStepConfig?.title}</h2>
        {currentStepConfig?.description && <p className='text-gray-600 mt-2'>{currentStepConfig.description}</p>}
      </div>

      {/* محتوى الخطوة */}
      <Form
        fields={currentStepConfig?.fields || []}
        validationRules={currentStepConfig?.validationRules || {}}
        initialData={stepData}
        onSubmit={handleStepSubmit}
        onCancel={isFirstStep ? onCancel : handlePrevious}
        submitText={isLastStep ? 'إنهاء' : 'التالي'}
        cancelText={isFirstStep ? 'إلغاء' : 'السابق'}
      />
    </div>
  );
};

export { Form, QuickForm, StepForm };
export default Form;
