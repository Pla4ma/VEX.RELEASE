/**
 * Date Utility Tests
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  formatRelativeTime,
  formatDistanceToNow,
  formatDate,
  formatTime,
  formatDateTime,
  isToday,
  isYesterday,
  addDays,
  startOfDay,
  endOfDay,
  parseISO,
  toISO,
} from '../date';

describe('formatRelativeTime / formatDistanceToNow', () => {
  let now: Date;

  beforeEach(() => {
    now = new Date('2024-06-15T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "just now" for dates less than 60 seconds ago', () => {
    const recent = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(recent)).toBe('just now');
  });

  it('returns minutes ago for dates 1-59 minutes ago', () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago for dates 1-23 hours ago', () => {
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('returns days ago for dates 1-6 days ago', () => {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('returns weeks ago for dates 7-29 days ago', () => {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoWeeksAgo)).toBe('2w ago');
  });

  it('returns formatted date for dates 30+ days ago', () => {
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(fortyDaysAgo);
    // Should return a formatted date string, not a relative time
    expect(result).not.toMatch(/ago$/);
    expect(result.length).toBeGreaterThan(0);
  });

  it('formatDistanceToNow is the same as formatRelativeTime', () => {
    const recent = new Date(now.getTime() - 30 * 1000);
    expect(formatDistanceToNow(recent)).toBe(formatRelativeTime(recent));
  });

  it('accepts a timestamp number', () => {
    const tsMs = now.getTime() - 10 * 1000;
    expect(formatRelativeTime(tsMs)).toBe('just now');
  });

  it('accepts an ISO string', () => {
    const isoStr = new Date(now.getTime() - 3 * 60 * 1000).toISOString();
    expect(formatRelativeTime(isoStr)).toBe('3m ago');
  });
});

describe('formatDate', () => {
  const testDate = new Date('2024-06-15T12:00:00Z');

  it('formats in short format', () => {
    const result = formatDate(testDate, 'short');
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/15/);
  });

  it('formats in medium format (default)', () => {
    const result = formatDate(testDate, 'medium');
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/2024/);
  });

  it('formats in long format', () => {
    const result = formatDate(testDate, 'long');
    expect(result).toMatch(/June/i);
    expect(result).toMatch(/2024/);
  });

  it('formats in full format', () => {
    const result = formatDate(testDate, 'full');
    expect(result).toMatch(/Saturday/i);
    expect(result).toMatch(/June/i);
    expect(result).toMatch(/2024/);
  });

  it('uses medium as default format', () => {
    const withDefault = formatDate(testDate);
    const withMedium = formatDate(testDate, 'medium');
    expect(withDefault).toBe(withMedium);
  });

  it('accepts a timestamp number', () => {
    const result = formatDate(testDate.getTime(), 'short');
    expect(result).toMatch(/Jun/i);
  });

  it('accepts an ISO string', () => {
    const result = formatDate(testDate.toISOString(), 'short');
    expect(result).toMatch(/Jun/i);
  });
});

describe('formatTime', () => {
  const testDate = new Date('2024-06-15T14:30:00Z');

  it('formats in short format', () => {
    const result = formatTime(testDate, 'short');
    expect(result).toMatch(/:/);
  });

  it('formats in medium format', () => {
    const result = formatTime(testDate, 'medium');
    expect(result).toMatch(/:/);
  });

  it('defaults to short format', () => {
    const withDefault = formatTime(testDate);
    const withShort = formatTime(testDate, 'short');
    expect(withDefault).toBe(withShort);
  });
});

describe('formatDateTime', () => {
  const testDate = new Date('2024-06-15T14:30:00Z');

  it('includes both date and time', () => {
    const result = formatDateTime(testDate);
    expect(result).toMatch(/Jun/i);
    expect(result).toMatch(/:/);
    expect(result).toContain(' at ');
  });

  it('uses short format', () => {
    const result = formatDateTime(testDate, 'short');
    expect(result).toMatch(/Jun/i);
  });

  it('uses medium as default format', () => {
    const withDefault = formatDateTime(testDate);
    const withMedium = formatDateTime(testDate, 'medium');
    expect(withDefault).toBe(withMedium);
  });
});

describe('isToday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for today', () => {
    expect(isToday(new Date('2024-06-15T08:00:00Z'))).toBe(true);
  });

  it('returns false for yesterday', () => {
    expect(isToday(new Date('2024-06-14T12:00:00Z'))).toBe(false);
  });

  it('returns false for tomorrow', () => {
    expect(isToday(new Date('2024-06-16T12:00:00Z'))).toBe(false);
  });

  it('accepts a timestamp', () => {
    const todayTs = new Date('2024-06-15T10:00:00Z').getTime();
    expect(isToday(todayTs)).toBe(true);
  });
});

describe('isYesterday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for yesterday', () => {
    expect(isYesterday(new Date('2024-06-14T08:00:00Z'))).toBe(true);
  });

  it('returns false for today', () => {
    expect(isYesterday(new Date('2024-06-15T12:00:00Z'))).toBe(false);
  });

  it('returns false for two days ago', () => {
    expect(isYesterday(new Date('2024-06-13T12:00:00Z'))).toBe(false);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const base = new Date('2024-06-15');
    const result = addDays(base, 5);
    expect(result.getDate()).toBe(20);
  });

  it('subtracts days when negative', () => {
    const base = new Date('2024-06-15');
    const result = addDays(base, -3);
    expect(result.getDate()).toBe(12);
  });

  it('does not mutate the original date', () => {
    const base = new Date('2024-06-15');
    addDays(base, 5);
    expect(base.getDate()).toBe(15);
  });

  it('handles month boundaries', () => {
    const base = new Date('2024-06-30');
    const result = addDays(base, 2);
    expect(result.getMonth()).toBe(6); // July (0-indexed)
    expect(result.getDate()).toBe(2);
  });
});

describe('startOfDay', () => {
  it('sets time to midnight', () => {
    const date = new Date('2024-06-15T14:30:45.123');
    const result = startOfDay(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('preserves the date', () => {
    const date = new Date('2024-06-15T14:30:00');
    const result = startOfDay(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5); // June (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  it('does not mutate the original date', () => {
    const date = new Date('2024-06-15T14:30:00');
    startOfDay(date);
    expect(date.getHours()).toBe(14);
  });
});

describe('endOfDay', () => {
  it('sets time to 23:59:59.999', () => {
    const date = new Date('2024-06-15T08:00:00');
    const result = endOfDay(date);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it('preserves the date', () => {
    const date = new Date('2024-06-15T08:00:00');
    const result = endOfDay(date);
    expect(result.getDate()).toBe(15);
  });

  it('does not mutate the original date', () => {
    const date = new Date('2024-06-15T08:00:00');
    endOfDay(date);
    expect(date.getHours()).toBe(8);
  });
});

describe('parseISO', () => {
  it('parses a valid ISO string to a Date', () => {
    const result = parseISO('2024-06-15T12:00:00Z');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });

  it('returns an invalid Date for malformed string', () => {
    const result = parseISO('not-a-date');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('toISO', () => {
  it('converts a Date to an ISO string', () => {
    const date = new Date('2024-06-15T12:00:00.000Z');
    expect(toISO(date)).toBe('2024-06-15T12:00:00.000Z');
  });

  it('round-trips with parseISO', () => {
    const original = new Date('2024-06-15T12:00:00.000Z');
    const iso = toISO(original);
    const roundTripped = parseISO(iso);
    expect(roundTripped.getTime()).toBe(original.getTime());
  });
});
