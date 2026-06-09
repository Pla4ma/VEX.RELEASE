import { captureSilentFailure } from '../../../utils/silent-failure';

export function getUserTimezone(_userId: string): string {
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return deviceTimezone || 'UTC';
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-coach',
      operation: 'safe-fallback',
      type: 'data',
    });
    return false;
  }
}

export function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const year = Number(values.get('year'));
  const month = Number(values.get('month'));
  const day = Number(values.get('day'));
  const hour = Number(values.get('hour'));
  const minute = Number(values.get('minute'));
  const second = Number(values.get('second'));
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return (asUtc - date.getTime()) / (60 * 1000);
}

export function toUTC(date: Date, timezone: string): Date {
  const offsetMinutes = getTimezoneOffsetMinutes(date, timezone);
  return new Date(date.getTime() - offsetMinutes * 60 * 1000);
}

export function toLocalTime(date: Date | number, timezone: string): Date {
  const d = typeof date === 'number' ? new Date(date) : date;
  const offsetMinutes = getTimezoneOffsetMinutes(d, timezone);
  return new Date(d.getTime() + offsetMinutes * 60 * 1000);
}

export function formatInTimezone(
  date: Date | number,
  timezone: string,
  format: string,
): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  if (format === 'yyyy-MM-dd') {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  }
  if (format === 'H') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(d);
  }
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(d);
}
