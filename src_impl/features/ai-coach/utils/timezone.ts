import { captureSilentFailure } from '../../../utils/silent-failure';

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
// ============================================================================
// Day Boundaries (Critical for Streaks)
// ============================================================================
// ============================================================================
// Streak Calculations
// ============================================================================
// ============================================================================
// Scheduling
// ============================================================================
// ============================================================================
// Formatting
// ============================================================================
// ============================================================================
// Testing Helpers
// ============================================================================
export * from "./timezone.part1";
export * from "./timezone.part2";
