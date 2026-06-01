import type { CalendarGap } from './types';

export type CalendarProvider = 'GOOGLE' | 'APPLE';

export interface CalendarConfig {
  google?: import('./GoogleCalendarAdapter').GoogleCalendarConfig;
  apple?: boolean;
}

export type DeadlineAnalysis = Array<{
  title: string;
  deadline: Date;
  suggestedStudyTimes: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}>;

export function mergeBusySlots(
  slots: Array<{ start: Date; end: Date }>,
): Array<{ start: Date; end: Date }> {
  if (slots.length === 0) {
    return [];
  }
  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: Array<{ start: Date; end: Date }> = [slots[0]!];
  for (let i = 1; i < slots.length; i++) {
    const last = merged[merged.length - 1]!;
    const current = slots[i]!;
    if (current.start <= last.end) {
      last.end = new Date(
        Math.max(last.end.getTime(), current.end.getTime()),
      );
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function calculateFreeSlots(
  busySlots: Array<{ start: Date; end: Date }>,
  timeMin: Date,
  timeMax: Date,
): Array<{ start: Date; end: Date; duration: number }> {
  const free: Array<{ start: Date; end: Date; duration: number }> = [];
  let currentTime = new Date(timeMin);
  for (const busy of busySlots) {
    if (currentTime < busy.start) {
      free.push({
        start: new Date(currentTime),
        end: new Date(busy.start),
        duration: Math.floor(
          (busy.start.getTime() - currentTime.getTime()) / 60000,
        ),
      });
    }
    currentTime = new Date(
      Math.max(currentTime.getTime(), busy.end.getTime()),
    );
  }
  if (currentTime < timeMax) {
    free.push({
      start: new Date(currentTime),
      end: new Date(timeMax),
      duration: Math.floor(
        (timeMax.getTime() - currentTime.getTime()) / 60000,
      ),
    });
  }
  return free.filter((slot) => slot.duration >= 15);
}

export function getSmartSessionSuggestionFromGaps(
  gaps: CalendarGap[],
): {
  suggested: boolean;
  startTime?: Date;
  duration?: number;
  reason?: string;
  action: 'START_NOW' | 'SCHEDULE' | 'NO_SUITABLE_TIME';
} {
  if (gaps.length === 0) {
    return { suggested: false, action: 'NO_SUITABLE_TIME' };
  }
  const bestGap = gaps[0]!;
  const now = new Date();
  const gapStart = new Date(bestGap.startTime);
  const minutesUntil = Math.floor(
    (gapStart.getTime() - now.getTime()) / 60000,
  );
  if (minutesUntil <= 30 && minutesUntil >= -5) {
    return {
      suggested: true,
      startTime: gapStart,
      duration: Math.min(bestGap.duration, 60),
      reason: bestGap.reason,
      action: 'START_NOW',
    };
  }
  return {
    suggested: true,
    startTime: gapStart,
    duration: Math.min(bestGap.duration, 60),
    reason: bestGap.reason,
    action: 'SCHEDULE',
  };
}
