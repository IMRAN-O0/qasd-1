export const formatters = {
  currency: (amount, currencySymbol = '$') => {
    const num = Number(amount);
    if (Number.isNaN(num)) return '$0.00';
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}${currencySymbol}${formatted}`;
  },

  number: (num, decimals = 0) => {
    if (!num && num !== 0) {
      return '---';
    }

    return parseFloat(num).toLocaleString('ar-SA', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  date: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return 'Invalid Date';
    // mm/dd/yyyy
    const mm = String(d.getMonth() + 1).padStart(1, '0');
    const dd = String(d.getDate()).padStart(1, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  },

  time: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return 'Invalid Time';
    const hh = String(d.getHours());
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  },

  datetime: (date, dateFormat = 'medium', timeFormat = '24') => {
    if (!date) {
      return '---';
    }

    const formattedDate = formatters.date(date, dateFormat);
    const formattedTime = formatters.time(date, timeFormat);

    return `${formattedDate} - ${formattedTime}`;
  },

  percentage: (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return '0.00%';
    return `${(num * 100).toFixed(2)}%`;
  },

  phone: value => {
    if (value == null) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 10) return String(value);
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  },

  fileSize: bytes => {
    const num = Number(bytes);
    if (!Number.isFinite(num) || num <= 0) return '0 B';
    const units = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(num) / Math.log(1024));
    if (i === 0) return `${num} B`;
    return `${(num / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  },

  duration: seconds => {
    if (!seconds && seconds !== 0) {
      return '---';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${remainingSeconds} ثانية`;
    }
  },

  address: address => {
    if (!address) {
      return '---';
    }

    const parts = [];
    if (address.street) {
      parts.push(address.street);
    }
    if (address.district) {
      parts.push(address.district);
    }
    if (address.city) {
      parts.push(address.city);
    }
    if (address.region) {
      parts.push(address.region);
    }
    if (address.postalCode) {
      parts.push(address.postalCode);
    }

    return parts.join('، ') || '---';
  },

  name: (firstName, lastName) => {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.join(' ') || '---';
  },

  initials: name => {
    if (!name) {
      return '';
    }

    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  truncate: (text, maxLength = 50, suffix = '...') => {
    if (!text) return '';
    if (maxLength <= 0) return suffix;
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
  },

  capitalize: text => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  titleCase: text => {
    if (!text) {
      return '';
    }

    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  nationalId: id => {
    if (!id) {
      return '---';
    }

    const cleaned = id.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
    }

    return id;
  },

  commercialRegistration: cr => {
    if (!cr) {
      return '---';
    }

    const cleaned = cr.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return cr;
  },

  vatNumber: vat => {
    if (!vat) {
      return '---';
    }

    const cleaned = vat.replace(/\D/g, '');

    if (cleaned.length === 15) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9, 12)}-${cleaned.slice(12)}`;
    }

    return vat;
  },

  iban: iban => {
    if (!iban) {
      return '---';
    }

    const cleaned = iban.replace(/\s/g, '').toUpperCase();

    if (cleaned.length === 24 && cleaned.startsWith('SA')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 16)} ${cleaned.slice(16, 20)} ${cleaned.slice(20)}`;
    }

    return iban;
  },

  barcode: code => {
    if (!code) {
      return '---';
    }

    const cleaned = code.replace(/\D/g, '');

    if (cleaned.length === 13) {
      // EAN-13 format
      return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 7)} ${cleaned.slice(7, 13)}`;
    } else if (cleaned.length === 12) {
      // UPC-A format
      return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 6)} ${cleaned.slice(6, 11)} ${cleaned.slice(11)}`;
    }

    return code;
  },

  status: (status, statusMap = {}) => {
    const defaultMap = {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'في الانتظار',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      draft: 'مسودة',
      approved: 'معتمد',
      rejected: 'مرفوض'
    };

    const combinedMap = { ...defaultMap, ...statusMap };

    return combinedMap[status] || status || '---';
  },

  priority: priority => {
    const priorityMap = {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      critical: 'حرج'
    };

    return priorityMap[priority] || priority || '---';
  },

  boolean: (value, trueText = 'نعم', falseText = 'لا') => {
    if (value === null || value === undefined) {
      return '---';
    }
    return value ? trueText : falseText;
  },

  list: (items, separator = '، ', maxItems = null) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return '---';
    }

    let displayItems = items;

    if (maxItems && items.length > maxItems) {
      displayItems = items.slice(0, maxItems);
      return displayItems.join(separator) + ` و ${items.length - maxItems} أخرى`;
    }

    return displayItems.join(separator);
  }
};

export default formatters;
