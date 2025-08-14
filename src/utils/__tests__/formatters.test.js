import { formatters } from '../formatters';

describe('Formatters', () => {
  describe('date', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatters.date(date);
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should handle invalid date', () => {
      const result = formatters.date('invalid-date');
      expect(result).toBe('Invalid Date');
    });

    it('should handle null/undefined', () => {
      expect(formatters.date(null)).toBe('Invalid Date');
      expect(formatters.date(undefined)).toBe('Invalid Date');
    });
  });

  describe('time', () => {
    it('should format time correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatters.time(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle invalid time', () => {
      const result = formatters.time('invalid-time');
      expect(result).toBe('Invalid Time');
    });
  });

  describe('currency', () => {
    it('should format currency correctly', () => {
      expect(formatters.currency(1234.56)).toBe('$1,234.56');
      expect(formatters.currency(0)).toBe('$0.00');
      expect(formatters.currency(-500)).toBe('-$500.00');
    });

    it('should handle invalid numbers', () => {
      expect(formatters.currency('invalid')).toBe('$0.00');
      expect(formatters.currency(null)).toBe('$0.00');
    });
  });

  describe('percentage', () => {
    it('should format percentage correctly', () => {
      expect(formatters.percentage(0.1234)).toBe('12.34%');
      expect(formatters.percentage(1)).toBe('100.00%');
      expect(formatters.percentage(0)).toBe('0.00%');
    });

    it('should handle invalid numbers', () => {
      expect(formatters.percentage('invalid')).toBe('0.00%');
      expect(formatters.percentage(null)).toBe('0.00%');
    });
  });

  describe('fileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatters.fileSize(0)).toBe('0 B');
      expect(formatters.fileSize(1024)).toBe('1.0 KB');
      expect(formatters.fileSize(1048576)).toBe('1.0 MB');
      expect(formatters.fileSize(1073741824)).toBe('1.0 GB');
    });

    it('should handle invalid sizes', () => {
      expect(formatters.fileSize('invalid')).toBe('0 B');
      expect(formatters.fileSize(null)).toBe('0 B');
      expect(formatters.fileSize(-100)).toBe('0 B');
    });
  });

  describe('phone', () => {
    it('should format phone numbers correctly', () => {
      expect(formatters.phone('1234567890')).toBe('(123) 456-7890');
      expect(formatters.phone('123-456-7890')).toBe('(123) 456-7890');
    });

    it('should handle invalid phone numbers', () => {
      expect(formatters.phone('123')).toBe('123');
      expect(formatters.phone('')).toBe('');
      expect(formatters.phone(null)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize strings correctly', () => {
      expect(formatters.capitalize('hello world')).toBe('Hello World');
      expect(formatters.capitalize('HELLO WORLD')).toBe('Hello World');
      expect(formatters.capitalize('hello')).toBe('Hello');
    });

    it('should handle edge cases', () => {
      expect(formatters.capitalize('')).toBe('');
      expect(formatters.capitalize(null)).toBe('');
      expect(formatters.capitalize(undefined)).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate strings correctly', () => {
      expect(formatters.truncate('Hello World', 5)).toBe('Hello...');
      expect(formatters.truncate('Hi', 10)).toBe('Hi');
      expect(formatters.truncate('Exactly Ten', 10)).toBe('Exactly Te...');
    });

    it('should handle edge cases', () => {
      expect(formatters.truncate('', 5)).toBe('');
      expect(formatters.truncate(null, 5)).toBe('');
      expect(formatters.truncate('Hello', 0)).toBe('...');
    });
  });
});
