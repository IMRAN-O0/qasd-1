import * as validators from '../validators';

describe('Validators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name@domain.co.uk')).toBe(true);
      expect(validators.email('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validators.email('invalid-email')).toBe(false);
      expect(validators.email('test@')).toBe(false);
      expect(validators.email('@example.com')).toBe(false);
      expect(validators.email('')).toBe(false);
      expect(validators.email(null)).toBe(false);
    });
  });

  describe('phone', () => {
    it('should validate correct phone numbers', () => {
      expect(validators.phone('(123) 456-7890')).toBe(true);
      expect(validators.phone('123-456-7890')).toBe(true);
      expect(validators.phone('1234567890')).toBe(true);
      expect(validators.phone('+1 123 456 7890')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validators.phone('123')).toBe(false);
      expect(validators.phone('abc-def-ghij')).toBe(false);
      expect(validators.phone('')).toBe(false);
      expect(validators.phone(null)).toBe(false);
    });
  });

  describe('required', () => {
    it('should validate required fields', () => {
      expect(validators.required('test')).toBe(true);
      expect(validators.required('0')).toBe(true);
      expect(validators.required(0)).toBe(true);
      expect(validators.required(false)).toBe(true);
    });

    it('should reject empty required fields', () => {
      expect(validators.required('')).toBe(false);
      expect(validators.required('   ')).toBe(false);
      expect(validators.required(null)).toBe(false);
      expect(validators.required(undefined)).toBe(false);
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      expect(validators.minLength('hello', 3)).toBe(true);
      expect(validators.minLength('hello', 5)).toBe(true);
      expect(validators.minLength('test', 4)).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(validators.minLength('hi', 3)).toBe(false);
      expect(validators.minLength('', 1)).toBe(false);
      expect(validators.minLength(null, 1)).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      expect(validators.maxLength('hello', 10)).toBe(true);
      expect(validators.maxLength('test', 4)).toBe(true);
      expect(validators.maxLength('', 5)).toBe(true);
    });

    it('should reject strings above maximum length', () => {
      expect(validators.maxLength('hello world', 5)).toBe(false);
      expect(validators.maxLength('test', 3)).toBe(false);
    });
  });

  describe('number', () => {
    it('should validate numbers', () => {
      expect(validators.number(123)).toBe(true);
      expect(validators.number('123')).toBe(true);
      expect(validators.number('123.45')).toBe(true);
      expect(validators.number(0)).toBe(true);
      expect(validators.number(-123)).toBe(true);
    });

    it('should reject non-numbers', () => {
      expect(validators.number('abc')).toBe(false);
      expect(validators.number('')).toBe(false);
      expect(validators.number(null)).toBe(false);
      expect(validators.number(undefined)).toBe(false);
      expect(validators.number('123abc')).toBe(false);
    });
  });

  describe('url', () => {
    it('should validate URLs', () => {
      expect(validators.url('https://example.com')).toBe(true);
      expect(validators.url('http://test.org')).toBe(true);
      expect(validators.url('https://sub.domain.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validators.url('not-a-url')).toBe(false);
      expect(validators.url('ftp://example.com')).toBe(false);
      expect(validators.url('')).toBe(false);
      expect(validators.url(null)).toBe(false);
    });
  });

  describe('date', () => {
    it('should validate dates', () => {
      expect(validators.date('2024-01-15')).toBe(true);
      expect(validators.date('01/15/2024')).toBe(true);
      expect(validators.date(new Date())).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(validators.date('invalid-date')).toBe(false);
      expect(validators.date('2024-13-01')).toBe(false);
      expect(validators.date('')).toBe(false);
      expect(validators.date(null)).toBe(false);
    });
  });

  describe('password', () => {
    it('should validate strong passwords', () => {
      expect(validators.password('Password123!')).toBe(true);
      expect(validators.password('MyStr0ng@Pass')).toBe(true);
      expect(validators.password('C0mplex#Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validators.password('password')).toBe(false);
      expect(validators.password('12345678')).toBe(false);
      expect(validators.password('Password')).toBe(false);
      expect(validators.password('Pass123')).toBe(false);
      expect(validators.password('')).toBe(false);
    });
  });
});
