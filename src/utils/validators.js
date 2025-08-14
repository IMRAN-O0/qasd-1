// Validation utilities

export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = phone => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = value => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateNumber = value => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

export const validatePositiveNumber = value => {
  return validateNumber(value) && parseFloat(value) > 0;
};

export const validateDate = date => {
  return date instanceof Date && !isNaN(date);
};

export const validateDateString = dateString => {
  const date = new Date(dateString);
  return validateDate(date);
};

export const validatePassword = password => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
      } else if (rule.type === 'email' && value && !validateEmail(value)) {
        errors[field] = rule.message || `${field} must be a valid email`;
      } else if (rule.type === 'phone' && value && !validatePhone(value)) {
        errors[field] = rule.message || `${field} must be a valid phone number`;
      } else if (rule.type === 'minLength' && value && !validateMinLength(value, rule.value)) {
        errors[field] = rule.message || `${field} must be at least ${rule.value} characters`;
      } else if (rule.type === 'maxLength' && value && !validateMaxLength(value, rule.value)) {
        errors[field] = rule.message || `${field} must be no more than ${rule.value} characters`;
      } else if (rule.type === 'number' && value && !validateNumber(value)) {
        errors[field] = rule.message || `${field} must be a valid number`;
      } else if (rule.type === 'positiveNumber' && value && !validatePositiveNumber(value)) {
        errors[field] = rule.message || `${field} must be a positive number`;
      } else if (rule.type === 'password' && value && !validatePassword(value)) {
        errors[field] = rule.message || `${field} must be at least 8 characters with uppercase, lowercase, and number`;
      }
    });
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const email = value => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(value));
};

export const phone = value => {
  if (!value) return false;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith('1')) return true;
  return false;
};

export const required = value => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const minLength = (value, min) => {
  if (value === null || value === undefined) return false;
  return String(value).length >= min;
};

export const maxLength = (value, max) => {
  if (value === null || value === undefined) return true;
  return String(value).length <= max;
};

export const number = value => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(Number(value));
};

export const url = value => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const date = value => {
  if (!value) return false;
  const d = value instanceof Date ? value : new Date(value);
  return !isNaN(d.getTime());
};

export const password = value => {
  if (!value) return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(value));
};
