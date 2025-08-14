export const validators = {
  required: value => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'هذا الحقل مطلوب';
    }
    return null;
  },

  email: value => {
    if (!value) {
      return null;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'يرجى إدخال بريد إلكتروني صالح';
    }
    return null;
  },

  phone: value => {
    if (!value) {
      return null;
    }
    // Saudi phone number validation
    const phoneRegex = /^(\+966|0)?[5-9]\d{8}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
      return 'يرجى إدخال رقم جوال صالح (05xxxxxxxx)';
    }
    return null;
  },

  number: (value, min, max) => {
    if (!value && value !== 0) {
      return null;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'يرجى إدخال رقم صالح';
    }
    if (min !== undefined && num < min) {
      return `القيمة يجب أن تكون أكبر من أو تساوي ${min}`;
    }
    if (max !== undefined && num > max) {
      return `القيمة يجب أن تكون أصغر من أو تساوي ${max}`;
    }
    return null;
  },

  positiveNumber: value => {
    if (!value && value !== 0) {
      return null;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'يرجى إدخال رقم صالح';
    }
    if (num < 0) {
      return 'القيمة يجب أن تكون موجبة';
    }
    return null;
  },

  integer: value => {
    if (!value && value !== 0) {
      return null;
    }
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(parseFloat(value))) {
      return 'يرجى إدخال رقم صحيح';
    }
    return null;
  },

  minLength: (value, length) => {
    if (!value) {
      return null;
    }
    if (value.toString().length < length) {
      return `يجب أن يكون النص أطول من ${length} أحرف`;
    }
    return null;
  },

  maxLength: (value, length) => {
    if (!value) {
      return null;
    }
    if (value.toString().length > length) {
      return `يجب أن يكون النص أقصر من ${length} أحرف`;
    }
    return null;
  },

  exactLength: (value, length) => {
    if (!value) {
      return null;
    }
    if (value.toString().length !== length) {
      return `يجب أن يكون النص بطول ${length} أحرف بالضبط`;
    }
    return null;
  },

  arabicText: value => {
    if (!value) {
      return null;
    }
    const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?()-]+$/;
    if (!arabicRegex.test(value)) {
      return 'يرجى إدخال نص باللغة العربية فقط';
    }
    return null;
  },

  englishText: value => {
    if (!value) {
      return null;
    }
    const englishRegex = /^[a-zA-Z\s\d.,!?()-]+$/;
    if (!englishRegex.test(value)) {
      return 'يرجى إدخال نص باللغة الإنجليزية فقط';
    }
    return null;
  },

  url: value => {
    if (!value) {
      return null;
    }
    try {
      new URL(value);
      return null;
    } catch {
      return 'يرجى إدخال رابط صالح';
    }
  },

  date: value => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'يرجى إدخال تاريخ صالح';
    }
    return null;
  },

  futureDate: value => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date <= today) {
      return 'التاريخ يجب أن يكون في المستقبل';
    }
    return null;
  },

  pastDate: value => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date >= today) {
      return 'التاريخ يجب أن يكون في الماضي';
    }
    return null;
  },

  password: value => {
    if (!value) {
      return null;
    }

    const errors = [];

    if (value.length < 8) {
      errors.push('8 أحرف على الأقل');
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('حرف كبير واحد على الأقل');
    }

    if (!/[a-z]/.test(value)) {
      errors.push('حرف صغير واحد على الأقل');
    }

    if (!/\d/.test(value)) {
      errors.push('رقم واحد على الأقل');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('رمز خاص واحد على الأقل');
    }

    if (errors.length > 0) {
      return `كلمة المرور يجب أن تحتوي على: ${errors.join('، ')}`;
    }

    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) {
      return null;
    }
    if (value !== originalPassword) {
      return 'كلمات المرور غير متطابقة';
    }
    return null;
  },

  nationalId: value => {
    if (!value) {
      return null;
    }
    // Saudi National ID validation
    const cleanValue = value.replace(/\s/g, '');

    if (!/^\d{10}$/.test(cleanValue)) {
      return 'رقم الهوية يجب أن يكون 10 أرقام';
    }

    // Check if it starts with 1 or 2 (Saudi nationals)
    if (!cleanValue.startsWith('1') && !cleanValue.startsWith('2')) {
      return 'رقم الهوية يجب أن يبدأ بـ 1 أو 2';
    }

    return null;
  },

  commercialRegistration: value => {
    if (!value) {
      return null;
    }
    const cleanValue = value.replace(/\s/g, '');

    if (!/^\d{10}$/.test(cleanValue)) {
      return 'رقم السجل التجاري يجب أن يكون 10 أرقام';
    }

    return null;
  },

  vatNumber: value => {
    if (!value) {
      return null;
    }
    const cleanValue = value.replace(/\s/g, '');

    if (!/^\d{15}$/.test(cleanValue)) {
      return 'الرقم الضريبي يجب أن يكون 15 رقم';
    }

    return null;
  },

  iban: value => {
    if (!value) {
      return null;
    }
    const cleanValue = value.replace(/\s/g, '').toUpperCase();

    if (!/^SA\d{22}$/.test(cleanValue)) {
      return 'رقم الآيبان يجب أن يبدأ بـ SA ويحتوي على 24 حرف/رقم';
    }

    return null;
  },

  barcode: value => {
    if (!value) {
      return null;
    }

    // EAN-13 or UPC-A validation
    if (!/^\d{12,13}$/.test(value)) {
      return 'الباركود يجب أن يكون 12 أو 13 رقم';
    }

    return null;
  }
};

// Validation helper functions
export const validateField = (value, rules) => {
  if (!rules || rules.length === 0) {
    return null;
  }

  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule;
    if (error) {
      return error;
    }
  }

  return null;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const error = validateField(formData[field], rules);

    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};

// Common validation rule combinations
export const commonRules = {
  requiredText: [validators.required],
  requiredEmail: [validators.required, validators.email],
  requiredPhone: [validators.required, validators.phone],
  requiredNumber: [validators.required, validators.positiveNumber],
  requiredInteger: [validators.required, validators.integer],
  requiredDate: [validators.required, validators.date],
  optionalEmail: [validators.email],
  optionalPhone: [validators.phone],
  optionalNumber: [validators.positiveNumber],
  strongPassword: [validators.required, validators.password],
  requiredNationalId: [validators.required, validators.nationalId],
  requiredCommercialReg: [validators.required, validators.commercialRegistration],
  requiredVatNumber: [validators.required, validators.vatNumber]
};

export default validators;
