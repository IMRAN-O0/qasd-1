import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  File,
  Image,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Info,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Lock,
  Globe,
  Settings,
  Plus,
  Minus,
  Search,
  ChevronDown,
  FileText,
  Download
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const EnhancedForm = ({
  steps = [],
  initialData = {},
  onSubmit,
  onSave,
  onCancel,
  validationRules = {},
  enableAutoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  showProgress = true,
  allowStepSkipping = false,
  className = '',
  title = '',
  subtitle = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [dependencies, setDependencies] = useState({});

  const autoSaveTimeoutRef = useRef(null);
  const fileInputRefs = useRef({});

  // Debounced form data for auto-save
  const debouncedFormData = useDebounce(formData, 2000);

  // Auto-save effect
  useEffect(() => {
    if (enableAutoSave && Object.keys(debouncedFormData).length > 0 && onSave) {
      handleAutoSave();
    }
  }, [debouncedFormData, enableAutoSave]);

  // Validation effect
  useEffect(() => {
    validateCurrentStep();
  }, [formData, currentStep]);

  // Handle auto-save
  const handleAutoSave = async () => {
    if (isSaving || isSubmitting) {
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Validation functions
  const validateField = (fieldName, value, rules) => {
    const fieldRules = rules || validationRules[fieldName];
    if (!fieldRules) {
      return null;
    }

    // Required validation
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return 'هذا الحقل مطلوب';
    }

    // Skip other validations if field is empty and not required
    if (!value) {
      return null;
    }

    // Email validation
    if (fieldRules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }

    // Phone validation
    if (fieldRules.phone) {
      const phoneRegex = /^[+]?[0-9]{10,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'يرجى إدخال رقم هاتف صحيح';
      }
    }

    // Min length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return `يجب أن يكون الحد الأدنى ${fieldRules.minLength} أحرف`;
    }

    // Max length validation
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return `يجب أن يكون الحد الأقصى ${fieldRules.maxLength} أحرف`;
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return fieldRules.patternMessage || 'تنسيق غير صحيح';
    }

    // Custom validation
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      return fieldRules.custom(value, formData);
    }

    return null;
  };

  const validateCurrentStep = () => {
    if (!steps[currentStep]) {
      return;
    }

    const stepFields = steps[currentStep].fields || [];
    const stepErrors = {};

    stepFields.forEach(field => {
      const error = validateField(field.name, formData[field.name], field.validation);
      if (error) {
        stepErrors[field.name] = error;
      }
    });

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateAllSteps = () => {
    const allErrors = {};

    steps.forEach(step => {
      const stepFields = step.fields || [];
      stepFields.forEach(field => {
        const error = validateField(field.name, formData[field.name], field.validation);
        if (error) {
          allErrors[field.name] = error;
        }
      });
    });

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Handle field changes
  const handleFieldChange = (fieldName, value, field) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Handle dependencies
    if (field?.dependencies) {
      handleFieldDependencies(fieldName, value, field.dependencies);
    }

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Handle field dependencies
  const handleFieldDependencies = (fieldName, value, deps) => {
    const newDependencies = { ...dependencies };

    Object.entries(deps).forEach(([targetField, condition]) => {
      if (typeof condition === 'function') {
        newDependencies[targetField] = condition(value, formData);
      } else if (typeof condition === 'object') {
        // Handle complex conditions
        newDependencies[targetField] = {
          visible: condition.visible ? condition.visible(value, formData) : true,
          required: condition.required ? condition.required(value, formData) : false,
          options: condition.options ? condition.options(value, formData) : null
        };
      }
    });

    setDependencies(newDependencies);
  };

  // File upload handling
  const handleFileUpload = async (fieldName, files, field) => {
    const file = files[0];
    if (!file) {
      return;
    }

    // Validate file
    if (field.fileValidation) {
      const { maxSize, allowedTypes } = field.fileValidation;

      if (maxSize && file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: `حجم الملف يجب أن يكون أقل من ${maxSize / 1024 / 1024}MB`
        }));
        return;
      }

      if (allowedTypes && !allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: 'نوع الملف غير مدعوم'
        }));
        return;
      }
    }

    try {
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[fieldName] || 0;
          if (currentProgress >= 100) {
            clearInterval(uploadInterval);
            return prev;
          }
          return { ...prev, [fieldName]: currentProgress + 10 };
        });
      }, 100);

      // Create file URL for preview
      const fileUrl = URL.createObjectURL(file);

      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: {
            file,
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type
          }
        }));
        setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }));
        clearInterval(uploadInterval);
      }, 1000);
    } catch (error) {
      setErrors(prev => ({ ...prev, [fieldName]: 'فشل في رفع الملف' }));
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
    }
  };

  // Navigation functions
  const goToStep = stepIndex => {
    if (allowStepSkipping || stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  };

  const goToNextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      // Find first step with errors
      const firstErrorStep = steps.findIndex(step => step.fields?.some(field => errors[field.name]));
      if (firstErrorStep !== -1) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = field => {
    const fieldName = field.name;
    const fieldValue = formData[fieldName] || '';
    const fieldError = touched[fieldName] && errors[fieldName];
    const fieldDeps = dependencies[fieldName];

    // Check if field should be visible
    if (fieldDeps?.visible === false) {
      return null;
    }

    const commonProps = {
      id: fieldName,
      name: fieldName,
      value: fieldValue,
      onChange: e => handleFieldChange(fieldName, e.target.value, field),
      onBlur: () => setTouched(prev => ({ ...prev, [fieldName]: true })),
      className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        fieldError ? 'border-red-300 bg-red-50' : 'border-gray-300'
      }`,
      placeholder: field.placeholder,
      disabled: field.disabled || isSubmitting
    };

    const renderInput = () => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'url':
          return <input type={field.type} {...commonProps} />;

        case 'password':
          return (
            <div className='relative'>
              <input type={showPassword[fieldName] ? 'text' : 'password'} {...commonProps} />
              <button
                type='button'
                onClick={() => setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }))}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                {showPassword[fieldName] ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
          );

        case 'number':
          return <input type='number' {...commonProps} min={field.min} max={field.max} step={field.step} />;

        case 'textarea':
          return (
            <textarea {...commonProps} rows={field.rows || 4} className={`${commonProps.className} resize-vertical`} />
          );

        case 'select':
          const options = fieldDeps?.options || field.options || [];
          return (
            <div className='relative'>
              <select {...commonProps} className={`${commonProps.className} appearance-none`}>
                <option value=''>{field.placeholder || 'اختر...'}</option>
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
            </div>
          );

        case 'checkbox':
          return (
            <div className='flex items-center'>
              <input
                type='checkbox'
                id={fieldName}
                checked={fieldValue}
                onChange={e => handleFieldChange(fieldName, e.target.checked, field)}
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-2'
                disabled={field.disabled || isSubmitting}
              />
              <label htmlFor={fieldName} className='text-sm text-gray-700'>
                {field.label}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className='space-y-2'>
              {field.options?.map(option => (
                <div key={option.value} className='flex items-center'>
                  <input
                    type='radio'
                    id={`${fieldName}_${option.value}`}
                    name={fieldName}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={e => handleFieldChange(fieldName, e.target.value, field)}
                    className='border-gray-300 text-blue-600 focus:ring-blue-500 ml-2'
                    disabled={field.disabled || isSubmitting}
                  />
                  <label htmlFor={`${fieldName}_${option.value}`} className='text-sm text-gray-700'>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );

        case 'date':
          return (
            <div className='relative'>
              <input type='date' {...commonProps} />
              <Calendar className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
            </div>
          );

        case 'time':
          return (
            <div className='relative'>
              <input type='time' {...commonProps} />
              <Clock className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none' />
            </div>
          );

        case 'file':
          return (
            <div className='space-y-3'>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  fieldError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => fileInputRefs.current[fieldName]?.click()}
              >
                <input
                  ref={el => (fileInputRefs.current[fieldName] = el)}
                  type='file'
                  accept={field.accept}
                  onChange={e => handleFileUpload(fieldName, e.target.files, field)}
                  className='hidden'
                  disabled={field.disabled || isSubmitting}
                />

                {fieldValue?.url ? (
                  <div className='space-y-3'>
                    {fieldValue.type?.startsWith('image/') ? (
                      <img
                        src={fieldValue.url}
                        alt={fieldValue.name}
                        className='max-w-32 max-h-32 mx-auto rounded-lg object-cover'
                      />
                    ) : (
                      <File className='w-12 h-12 text-gray-400 mx-auto' />
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{fieldValue.name}</p>
                      <p className='text-xs text-gray-500'>{(fieldValue.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation();
                        handleFieldChange(fieldName, null, field);
                      }}
                      className='text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto'
                    >
                      <Trash2 className='w-4 h-4' />
                      حذف
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                    <p className='text-sm text-gray-600'>اضغط لرفع ملف أو اسحب الملف هنا</p>
                    {field.fileValidation && (
                      <p className='text-xs text-gray-500 mt-1'>
                        الحد الأقصى: {field.fileValidation.maxSize / 1024 / 1024}MB
                      </p>
                    )}
                  </div>
                )}
              </div>

              {uploadProgress[fieldName] > 0 && uploadProgress[fieldName] < 100 && (
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${uploadProgress[fieldName]}%` }}
                  ></div>
                </div>
              )}
            </div>
          );

        default:
          return <input type='text' {...commonProps} />;
      }
    };

    return (
      <div key={fieldName} className={`space-y-2 ${field.className || ''}`}>
        {field.type !== 'checkbox' && (
          <label htmlFor={fieldName} className='block text-sm font-medium text-gray-700'>
            {field.label}
            {(field.validation?.required || fieldDeps?.required) && <span className='text-red-500 mr-1'>*</span>}
          </label>
        )}

        {renderInput()}

        {field.help && (
          <p className='text-xs text-gray-500 flex items-center gap-1'>
            <Info className='w-3 h-3' />
            {field.help}
          </p>
        )}

        {fieldError && (
          <p className='text-xs text-red-600 flex items-center gap-1'>
            <AlertCircle className='w-3 h-3' />
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex justify-between items-start'>
          <div>
            {title && <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>}
            {subtitle && <p className='text-gray-600 mt-1'>{subtitle}</p>}
          </div>

          {enableAutoSave && (
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              {isSaving ? (
                <>
                  <RefreshCw className='w-4 h-4 animate-spin' />
                  جاري الحفظ...
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && steps.length > 1 && (
          <div className='mt-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                الخطوة {currentStep + 1} من {steps.length}
              </span>
              <span className='text-sm text-gray-500'>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>

            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>

            {/* Step indicators */}
            <div className='flex justify-between mt-4'>
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  disabled={!allowStepSkipping && index > currentStep}
                  className={`flex items-center gap-2 text-sm ${
                    index === currentStep
                      ? 'text-blue-600 font-medium'
                      : index < currentStep
                        ? 'text-green-600'
                        : 'text-gray-400'
                  } ${!allowStepSkipping && index > currentStep ? 'cursor-not-allowed' : 'cursor-pointer hover:text-blue-600'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? <Check className='w-3 h-3' /> : index + 1}
                  </div>
                  <span className='hidden sm:inline'>{step.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className='p-6'>
        {currentStepData && (
          <div className='space-y-6'>
            {currentStepData.description && <p className='text-gray-600'>{currentStepData.description}</p>}

            <div
              className={`grid gap-6 ${
                currentStepData.layout === 'two-column'
                  ? 'md:grid-cols-2'
                  : currentStepData.layout === 'three-column'
                    ? 'md:grid-cols-3'
                    : 'grid-cols-1'
              }`}
            >
              {currentStepData.fields?.map(renderField)}
            </div>

            {currentStepData.customContent && <div>{currentStepData.customContent}</div>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-6 border-t border-gray-200 flex justify-between items-center'>
        <div className='flex gap-3'>
          {!isFirstStep && (
            <button
              type='button'
              onClick={goToPreviousStep}
              disabled={isSubmitting}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              <ChevronRight className='w-4 h-4' />
              السابق
            </button>
          )}

          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              إلغاء
            </button>
          )}
        </div>

        <div className='flex gap-3'>
          {onSave && !enableAutoSave && (
            <button
              type='button'
              onClick={() => handleAutoSave()}
              disabled={isSaving || isSubmitting}
              className='px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSaving ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
              حفظ
            </button>
          )}

          {isLastStep ? (
            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting || !validateCurrentStep()}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              {isSubmitting ? <RefreshCw className='w-4 h-4 animate-spin' /> : <Check className='w-4 h-4' />}
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          ) : (
            <button
              type='button'
              onClick={goToNextStep}
              disabled={!validateCurrentStep() || isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              التالي
              <ChevronLeft className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedForm;
