import type { FreeBusyInfo, CalendarGap } from './types';

export interface UserPatterns {
  preferredStartTimes: number[];
  preferredDays: number[];
  averageSessionDuration: number;
  peakPerformanceHours: Array<{ hour: number; quality: number }>;
}

export function scoreGapQuality(
  patterns: UserPatterns,
  slot: { start: Date; end: Date; duration: number },
): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
  const startHour = slot.start.getHours();
  const dayOfWeek = slot.start.getDay();
  let score = 0;
  if (patterns.preferredStartTimes.includes(startHour)) {
    score += 3;
  }
  if (patterns.preferredDays.includes(dayOfWeek)) {
    score += 2;
  }
  if (slot.duration >= 30 && slot.duration <= 60) {
    score += 2;
  } else if (slot.duration >= 25) {
    score += 1;
  }
  const peakHour = patterns.peakPerformanceHours.find(
    (p) => p.hour === startHour && p.quality > 80,
  );
  if (peakHour) {
    score += 2;
  }
  if (score >= 6) {
    return 'EXCELLENT';
  }
  if (score >= 4) {
    return 'GOOD';
  }
  if (score >= 2) {
    return 'FAIR';
  }
  return 'POOR';
}

export function generateGapReason(
  slot: { start: Date; duration: number },
  quality: string,
): string {
  const hour = slot.start.getHours();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = dayNames[slot.start.getDay()];
  const timeLabels: Record<number, string> = {
    6: 'Early morning',
    9: 'Morning',
    12: 'Midday',
    14: 'Afternoon',
    17: 'Late afternoon',
    20: 'Evening',
    22: 'Night',
  };
  const timeLabel = timeLabels[hour] || `${hour}:00`;
  if (quality === 'EXCELLENT') {
    return `Your peak performance time (${day} ${timeLabel})`;
  } else if (quality === 'GOOD') {
    return `Good focus time (${day} ${timeLabel})`;
  } else if (quality === 'FAIR') {
    return `Available slot (${day} ${timeLabel})`;
  } else {
    return `Short window (${day} ${timeLabel})`;
  }
}

export function calculateConfidence(gap: CalendarGap, userLevel: string): number {
  let confidence = 0.5;
  const qualityBoosts: Record<string, number> = {
    EXCELLENT: 0.3,
    GOOD: 0.2,
    FAIR: 0.1,
    POOR: 0,
  };
  confidence += qualityBoosts[gap.quality] || 0;
  const idealDuration =
    userLevel === 'beginner' ? 25 : userLevel === 'advanced' ? 45 : 30;
  const durationDiff = Math.abs(gap.duration - idealDuration);
  if (durationDiff <= 5) {
    confidence += 0.2;
  } else if (durationDiff <= 15) {
    confidence += 0.1;
  }
  return Math.min(0.95, confidence);
}
