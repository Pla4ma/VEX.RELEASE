import { formatInTimezone } from './timezone-core';
import { getStartOfDay, getEndOfDay } from './timezone-day';

export function formatRelativeTime(
  timestamp: number,
  _timezone: string,
): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  if (minutes < 1) {
    return diff > 0 ? 'just now' : 'just now';
  }
  if (minutes < 60) {
    return diff > 0 ? `in ${minutes} min` : `${minutes} min ago`;
  }
  if (hours < 24) {
    return diff > 0 ? `in ${hours} hr` : `${hours} hr ago`;
  }
  return diff > 0 ? `in ${days} days` : `${days} days ago`;
}

export function formatTimeOfDay(timestamp: number, timezone: string): string {
  const hour = parseInt(formatInTimezone(timestamp, timezone, 'H'), 10);
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  if (hour >= 17 && hour < 21) {
    return 'evening';
  }
  return 'night';
}

export function mockTimezone(_timezone: string): void {}

export function generateTestTimestamps(timezone: string): {
  startOfDay: number;
  midday: number;
  endOfDay: number;
  nextDayStart: number;
} {
  const now = Date.now();
  return {
    startOfDay: getStartOfDay(now, timezone),
    midday: getStartOfDay(now, timezone) + 12 * 60 * 60 * 1000,
    endOfDay: getEndOfDay(now, timezone),
    nextDayStart: getStartOfDay(now, timezone) + 24 * 60 * 60 * 1000,
  };
}
