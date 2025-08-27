import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  parseDate,
  isOverdue,
  isToday,
  startOfDay,
  endOfDay,
  addDays,
  formatRelativeDate,
} from './dateHelpers';

describe('dateHelpers', () => {
  beforeEach(() => {
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('should handle different months correctly', () => {
      expect(formatDate(new Date('2024-12-25'))).toBe('2024-12-25');
      expect(formatDate(new Date('2024-01-01'))).toBe('2024-01-01');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // January is 0
      expect(result?.getDate()).toBe(15);
    });

    it('should return undefined for empty string', () => {
      expect(parseDate('')).toBeUndefined();
    });

    it('should return undefined for invalid date', () => {
      expect(parseDate('invalid')).toBeUndefined();
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2024-01-10');
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2024-01-20');
      expect(isOverdue(futureDate)).toBe(false);
    });

    it('should return false for today', () => {
      const today = new Date('2024-01-15');
      expect(isOverdue(today)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isOverdue(undefined)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date('2024-01-15T08:00:00');
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isToday(new Date('2024-01-14'))).toBe(false);
      expect(isToday(new Date('2024-01-16'))).toBe(false);
    });
  });

  describe('startOfDay', () => {
    it('should set time to start of day', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = startOfDay(date);

      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('endOfDay', () => {
    it('should set time to end of day', () => {
      const date = new Date('2024-01-15T14:30:45.123');
      const result = endOfDay(date);

      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);

      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0);
    });

    it('should subtract negative days correctly', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);

      expect(result.getDate()).toBe(10);
      expect(result.getMonth()).toBe(0);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-30');
      const result = addDays(date, 5);

      expect(result.getDate()).toBe(4);
      expect(result.getMonth()).toBe(1); // February
    });
  });

  describe('formatRelativeDate', () => {
    it('should format today correctly', () => {
      const today = new Date('2024-01-15T08:00:00');
      expect(formatRelativeDate(today)).toBe('Today');
    });

    it('should format tomorrow correctly', () => {
      const tomorrow = new Date('2024-01-16T08:00:00');
      expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
    });

    it('should format yesterday correctly', () => {
      const yesterday = new Date('2024-01-14T08:00:00');
      expect(formatRelativeDate(yesterday)).toBe('Yesterday');
    });

    it('should format near future dates', () => {
      const futureDate = new Date('2024-01-19');
      expect(formatRelativeDate(futureDate)).toBe('In 4 days');
    });

    it('should format near past dates', () => {
      const pastDate = new Date('2024-01-11');
      expect(formatRelativeDate(pastDate)).toBe('4 days ago');
    });

    it('should format distant dates with full date', () => {
      const distantDate = new Date('2024-02-15');
      expect(formatRelativeDate(distantDate)).toBe('2024-02-15');
    });
  });
});
