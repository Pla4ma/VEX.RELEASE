import { captureSilentFailure } from "../../../utils/silent-failure";


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

export function mockTimezone(timezone: string): void {
  // In tests, you can mock Intl.DateTimeFormat
  // This is a placeholder for the actual implementation
}

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