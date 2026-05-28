import { toUTC, toLocalTime, formatInTimezone } from "./timezone-core";

export function getStartOfDay(timestamp: number, timezone: string): number {
  const localDate = toLocalTime(timestamp, timezone);
  localDate.setHours(0, 0, 0, 0);
  return toUTC(localDate, timezone).getTime();
}

export function getEndOfDay(timestamp: number, timezone: string): number {
  const localDate = toLocalTime(timestamp, timezone);
  localDate.setHours(23, 59, 59, 999);
  return toUTC(localDate, timezone).getTime();
}

export function isSameDay(
  timestamp1: number,
  timestamp2: number,
  timezone: string,
): boolean {
  const date1 = formatInTimezone(timestamp1, timezone, "yyyy-MM-dd");
  const date2 = formatInTimezone(timestamp2, timezone, "yyyy-MM-dd");
  return date1 === date2;
}

export function isToday(timestamp: number, timezone: string): boolean {
  return isSameDay(timestamp, Date.now(), timezone);
}

export function isYesterday(timestamp: number, timezone: string): boolean {
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  return isSameDay(timestamp, yesterday, timezone);
}

export function countsForTodayStreak(
  sessionTimestamp: number,
  timezone: string,
): boolean {
  return isToday(sessionTimestamp, timezone);
}

export function isStreakActive(
  lastSessionTimestamp: number,
  timezone: string,
): boolean {
  if (isToday(lastSessionTimestamp, timezone)) {
    return true;
  }
  if (isYesterday(lastSessionTimestamp, timezone)) {
    return true;
  }
  return false;
}

export function getHoursUntilStreakBreak(
  lastSessionTimestamp: number,
  timezone: string,
): number {
  if (!lastSessionTimestamp) {
    return 0;
  }
  if (isToday(lastSessionTimestamp, timezone)) {
    const endOfToday = getEndOfDay(Date.now(), timezone);
    return Math.max(0, (endOfToday - Date.now()) / (1000 * 60 * 60));
  }
  if (isYesterday(lastSessionTimestamp, timezone)) {
    const hoursSinceMidnight =
      (Date.now() - getStartOfDay(Date.now(), timezone)) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSinceMidnight);
  }
  return 0;
}

export function scheduleForLocalTime(
  localHour: number,
  localMinute: number,
  timezone: string,
  targetDate?: Date,
): number {
  const now = new Date();
  const baseDate = targetDate || now;
  const localDate = toLocalTime(baseDate.getTime(), timezone);
  localDate.setHours(localHour, localMinute, 0, 0);
  if (localDate.getTime() <= now.getTime()) {
    localDate.setDate(localDate.getDate() + 1);
  }
  return toUTC(localDate, timezone).getTime();
}

export function getOptimalReminderTimes(
  chronotype: "morning" | "evening" | "variable",
  timezone: string,
): number[] {
  const now = Date.now();
  switch (chronotype) {
    case "morning":
      return [
        scheduleForLocalTime(8, 0, timezone),
        scheduleForLocalTime(12, 0, timezone),
      ];
    case "evening":
      return [
        scheduleForLocalTime(14, 0, timezone),
        scheduleForLocalTime(19, 0, timezone),
      ];
    case "variable":
    default:
      return [
        scheduleForLocalTime(10, 0, timezone),
        scheduleForLocalTime(15, 0, timezone),
        scheduleForLocalTime(20, 0, timezone),
      ];
  }
}
