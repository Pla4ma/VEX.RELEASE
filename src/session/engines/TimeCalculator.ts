import type { TimeBreakdown } from '../types';
import {
  TIME_CONSTANTS,
  calculateElapsedTime,
  calculateRemainingTime,
  calculateCompletionPercentage,
  calculateEffectiveTime,
  calculateProgressMetrics,
  shouldTriggerWarning,
  getTimeStatus,
  calculateCurrentInterval,
} from './time-calculations';

export { TIME_CONSTANTS } from './time-calculations';
export {
  calculateElapsedTime,
  calculateRemainingTime,
  calculateCompletionPercentage,
  calculateEffectiveTime,
  calculateProgressMetrics,
  shouldTriggerWarning,
  getTimeStatus,
  calculateCurrentInterval,
} from './time-calculations';

export function breakdownDuration(totalSeconds: number): TimeBreakdown {
  const hours = Math.floor(
    totalSeconds /
      (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR),
  );
  const remainingAfterHours =
    totalSeconds %
    (TIME_CONSTANTS.SECONDS_PER_MINUTE * TIME_CONSTANTS.MINUTES_PER_HOUR);
  const minutes = Math.floor(
    remainingAfterHours / TIME_CONSTANTS.SECONDS_PER_MINUTE,
  );
  const seconds = remainingAfterHours % TIME_CONSTANTS.SECONDS_PER_MINUTE;
  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted: formatDuration(hours, minutes, seconds),
  };
}
export function formatDuration(
  hours: number,
  minutes: number,
  seconds: number,
): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
export function formatDurationLong(totalSeconds: number): string {
  const breakdown = breakdownDuration(totalSeconds);
  const parts: string[] = [];
  if (breakdown.hours > 0) {
    parts.push(`${breakdown.hours}h`);
  }
  if (breakdown.minutes > 0) {
    parts.push(`${breakdown.minutes}m`);
  }
  if (breakdown.seconds > 0 || parts.length === 0) {
    parts.push(`${breakdown.seconds}s`);
  }
  return parts.join(' ');
}
export function validateDuration(duration: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isFinite(duration)) {
    return { valid: false, error: 'Duration must be a finite number' };
  }
  if (duration < TIME_CONSTANTS.MIN_SESSION_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Duration must be at least ${TIME_CONSTANTS.MIN_SESSION_DURATION_SECONDS} seconds`,
    };
  }
  if (duration > TIME_CONSTANTS.MAX_SESSION_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Duration cannot exceed ${TIME_CONSTANTS.MAX_SESSION_DURATION_SECONDS} seconds (8 hours)`,
    };
  }
  return { valid: true };
}
export function validateTimestamp(timestamp: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isFinite(timestamp)) {
    return { valid: false, error: 'Timestamp must be a finite number' };
  }
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
  if (timestamp < oneYearAgo) {
    return { valid: false, error: 'Timestamp is too far in the past' };
  }
  if (timestamp > oneYearFromNow) {
    return { valid: false, error: 'Timestamp is too far in the future' };
  }
  return { valid: true };
}
export const TimeCalculator = {
  calculateElapsedTime,
  calculateRemainingTime,
  calculateCompletionPercentage,
  calculateEffectiveTime,
  breakdownDuration,
  formatDuration,
  formatDurationLong,
  calculateProgressMetrics,
  shouldTriggerWarning,
  getTimeStatus,
  validateDuration,
  validateTimestamp,
  calculateCurrentInterval,
  constants: TIME_CONSTANTS,
};
export { TimeCalculator }