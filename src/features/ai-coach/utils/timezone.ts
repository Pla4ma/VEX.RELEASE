import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * AI Coach Timezone Utilities
 *
 * Timezone-aware scheduling and streak calculations
 */

// ============================================================================
// User Timezone Management
// ============================================================================

/**
 * Get user's timezone from device or profile
 */
export function getUserTimezone(userId: string): string {
  // Try to get from device first
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Could also fetch from user profile if stored
  // For now, use device timezone
  return deviceTimezone || 'UTC';
}

/**
 * Check if timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) { captureSilentFailure(error, { feature: 'ai-coach', operation: 'safe-fallback', type: 'data' });
    return false;
  }
}

function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
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

// ============================================================================
// Date/Time Conversion
// ============================================================================

/**
 * Convert local time to UTC for storage
 */
export function toUTC(date: Date, timezone: string): Date {
  const offsetMinutes = getTimezoneOffsetMinutes(date, timezone);
  return new Date(date.getTime() - offsetMinutes * 60 * 1000);
}

/**
 * Convert UTC to local time for display
 */
export function toLocalTime(date: Date | number, timezone: string): Date {
  const d = typeof date === 'number' ? new Date(date) : date;
  const offsetMinutes = getTimezoneOffsetMinutes(d, timezone);
  return new Date(d.getTime() + offsetMinutes * 60 * 1000);
}

/**
 * Format date in user's timezone
 */
export function formatInTimezone(
  date: Date | number,
  timezone: string,
  format: string
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

// ============================================================================
// Day Boundaries (Critical for Streaks)
// ============================================================================

/**
 * Get the start of "today" in user's timezone
 * This is critical for streak calculations
 */
export function getStartOfDay(timestamp: number, timezone: string): number {
  const localDate = toLocalTime(timestamp, timezone);

  // Reset to start of day in local time
  localDate.setHours(0, 0, 0, 0);

  // Convert back to UTC timestamp
  return toUTC(localDate, timezone).getTime();
}

/**
 * Get the end of "today" in user's timezone
 */
export function getEndOfDay(timestamp: number, timezone: string): number {
  const localDate = toLocalTime(timestamp, timezone);

  // Set to end of day in local time
  localDate.setHours(23, 59, 59, 999);

  // Convert back to UTC timestamp
  return toUTC(localDate, timezone).getTime();
}

/**
 * Check if two timestamps are on the same day in user's timezone
 */
export function isSameDay(
  timestamp1: number,
  timestamp2: number,
  timezone: string
): boolean {
  const date1 = formatInTimezone(timestamp1, timezone, 'yyyy-MM-dd');
  const date2 = formatInTimezone(timestamp2, timezone, 'yyyy-MM-dd');
  return date1 === date2;
}

/**
 * Check if timestamp is "today" in user's timezone
 */
export function isToday(timestamp: number, timezone: string): boolean {
  return isSameDay(timestamp, Date.now(), timezone);
}

/**
 * Check if timestamp is "yesterday" in user's timezone
 */
export function isYesterday(timestamp: number, timezone: string): boolean {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  return isSameDay(timestamp, yesterday, timezone);
}

// ============================================================================
// Streak Calculations
// ============================================================================

/**
 * Check if a session counts toward today's streak
 * Accounts for timezone boundaries
 */
export function countsForTodayStreak(
  sessionTimestamp: number,
  timezone: string
): boolean {
  return isToday(sessionTimestamp, timezone);
}

/**
 * Check if streak is still active
 * (Session was completed "yesterday" or "today")
 */
export function isStreakActive(
  lastSessionTimestamp: number,
  timezone: string
): boolean {
  if (isToday(lastSessionTimestamp, timezone)) {return true;}
  if (isYesterday(lastSessionTimestamp, timezone)) {return true;}
  return false;
}

/**
 * Get hours remaining until streak breaks
 * Based on user's local midnight
 */
export function getHoursUntilStreakBreak(
  lastSessionTimestamp: number,
  timezone: string
): number {
  if (!lastSessionTimestamp) {return 0;}

  // If already completed today, streak is safe
  if (isToday(lastSessionTimestamp, timezone)) {
    // Calculate hours until end of today
    const endOfToday = getEndOfDay(Date.now(), timezone);
    return Math.max(0, (endOfToday - Date.now()) / (1000 * 60 * 60));
  }

  // If completed yesterday, check if still within grace period
  if (isYesterday(lastSessionTimestamp, timezone)) {
    const hoursSinceMidnight = (Date.now() - getStartOfDay(Date.now(), timezone)) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSinceMidnight);
  }

  // Streak already broken
  return 0;
}

// ============================================================================
// Scheduling
// ============================================================================

/**
 * Schedule a reminder for a specific local time
 */
export function scheduleForLocalTime(
  localHour: number,
  localMinute: number,
  timezone: string,
  targetDate?: Date
): number {
  const now = new Date();
  const baseDate = targetDate || now;

  // Create date in user's timezone
  const localDate = toLocalTime(baseDate.getTime(), timezone);
  localDate.setHours(localHour, localMinute, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (localDate.getTime() <= now.getTime()) {
    localDate.setDate(localDate.getDate() + 1);
  }

  // Convert to UTC timestamp
  return toUTC(localDate, timezone).getTime();
}

/**
 * Get optimal reminder times based on user's chronotype
 */
export function getOptimalReminderTimes(
  chronotype: 'morning' | 'evening' | 'variable',
  timezone: string
): number[] {
  const now = Date.now();

  switch (chronotype) {
    case 'morning':
      return [
        scheduleForLocalTime(8, 0, timezone),
        scheduleForLocalTime(12, 0, timezone),
      ];
    case 'evening':
      return [
        scheduleForLocalTime(14, 0, timezone),
        scheduleForLocalTime(19, 0, timezone),
      ];
    case 'variable':
    default:
      return [
        scheduleForLocalTime(10, 0, timezone),
        scheduleForLocalTime(15, 0, timezone),
        scheduleForLocalTime(20, 0, timezone),
      ];
  }
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format relative time (e.g., "2 hours ago", "in 3 hours")
 */
export function formatRelativeTime(
  timestamp: number,
  timezone: string
): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {return diff > 0 ? 'just now' : 'just now';}
  if (minutes < 60) {return diff > 0 ? `in ${minutes} min` : `${minutes} min ago`;}
  if (hours < 24) {return diff > 0 ? `in ${hours} hr` : `${hours} hr ago`;}
  return diff > 0 ? `in ${days} days` : `${days} days ago`;
}

/**
 * Format "time of day" for display
 */
export function formatTimeOfDay(
  timestamp: number,
  timezone: string
): string {
  const hour = parseInt(formatInTimezone(timestamp, timezone, 'H'), 10);

  if (hour >= 5 && hour < 12) {return 'morning';}
  if (hour >= 12 && hour < 17) {return 'afternoon';}
  if (hour >= 17 && hour < 21) {return 'evening';}
  return 'night';
}

// ============================================================================
// Testing Helpers
// ============================================================================

/**
 * Mock timezone for testing
 */
export function mockTimezone(timezone: string): void {
  // In tests, you can mock Intl.DateTimeFormat
  // This is a placeholder for the actual implementation
}

/**
 * Generate test timestamps across timezone boundaries
 */
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
