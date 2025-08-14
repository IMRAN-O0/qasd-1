import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name, value) => {
      const rules = validationRules[name];
      if (!rules) {
        return null;
      }

      for (const rule of rules) {
        const error = rule(value);
        if (error) {
          return error;
        }
      }
      return null;
    },
    [validationRules]
  );

  const setValue = useCallback(
    (name, value) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback(
    (name, isTouched = true) => {
      setTouched(prev => ({ ...prev, [name]: isTouched }));

      // Validate on blur if field is touched
      if (isTouched) {
        const error = validateField(name, values[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [values, validateField]
  );

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    return isValid;
  }, [values, validationRules, validateField]);

  const handleSubmit = useCallback(
    onSubmit => {
      return async e => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);

        try {
          const isValid = validateForm();
          if (isValid && onSubmit) {
            await onSubmit(values);
          }
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values, validateForm]
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const setFieldValues = useCallback(newValues => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const handleChange = useCallback(
    (name, value) => {
      if (typeof name === 'object' && name.target) {
        // Handle event object
        const { name: fieldName, value: fieldValue, type, checked } = name.target;
        setValue(fieldName, type === 'checkbox' ? checked : fieldValue);
      } else {
        // Handle direct name/value
        setValue(name, value);
      }
    },
    [setValue]
  );

  const getFieldProps = useCallback(
    name => {
      return {
        name,
        value: values[name] || '',
        error: touched[name] ? errors[name] : null,
        onChange: e => {
          const value = e.target ? e.target.value : e;
          setValue(name, value);
        },
        onBlur: () => setFieldTouched(name, true)
      };
    },
    [values, errors, touched, setValue, setFieldTouched]
  );

  const hasErrors = Object.keys(errors).some(key => errors[key]);
  const isValid = !hasErrors && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    setFieldError,
    setFieldValues,
    validateForm,
    handleChange,
    handleSubmit,
    reset,
    getFieldProps,
    isValid,
    hasErrors
  };
};

export default useForm;
