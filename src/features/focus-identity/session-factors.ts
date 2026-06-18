import type { FocusScoreFactors } from './FocusIdentityEngine-types';

export function calculateSessionQualityFactorForInput(
  sessions: Array<{
    focusPurity: number;
    grade: string;
    duration: number;
    wasAbandoned: boolean;
  }>,
): FocusScoreFactors['sessionQuality'] {
  if (sessions.length === 0) {
    return {
      score: 0,
      averageFocusPurity: 0,
      averageGrade: 'D',
      perfectSessionsCount: 0,
      averageSessionDuration: 0,
    };
  }
  const completed = sessions.filter((s) => !s.wasAbandoned);
  const avgPurity =
    completed.reduce((sum, s) => sum + s.focusPurity, 0) / completed.length;
  const avgDuration =
    completed.reduce((sum, s) => sum + s.duration, 0) / completed.length;
  const perfectCount = completed.filter(
    (s) => s.grade === 'S' && s.focusPurity >= 95 && s.duration >= 45,
  ).length;
  const gradeCounts = completed.reduce(
    (acc, s) => {
      acc[s.grade] = (acc[s.grade] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const total = completed.length;
  const avgGradeScore =
    ((gradeCounts.S ?? 0) * 100 +
      (gradeCounts.A ?? 0) * 85 +
      (gradeCounts.B ?? 0) * 70 +
      (gradeCounts.C ?? 0) * 55 +
      (gradeCounts.D ?? 0) * 40) /
    total;
  let score = 0;
  score += (avgPurity / 100) * 30;
  score += (avgGradeScore / 100) * 40;
  score += Math.min(perfectCount / 5, 1) * 20;
  score += Math.min(avgDuration / 60, 1) * 10;
  const gradeOrder = ['S', 'A', 'B', 'C', 'D'] as const;
  let dominantGrade: (typeof gradeOrder)[number] = 'D';
  for (const grade of gradeOrder) {
    if ((gradeCounts[grade] ?? 0) > 0) {
      dominantGrade = grade;
      break;
    }
  }
  return {
    score: Math.round(score),
    averageFocusPurity: Math.round(avgPurity),
    averageGrade: dominantGrade,
    perfectSessionsCount: perfectCount,
    averageSessionDuration: Math.round(avgDuration),
  };
}

export function calculateDiversityFactorForInput(
  sessions: Array<{
    mode: string;
    hour: number;
    dayOfWeek: number;
    context?: string;
  }>,
): FocusScoreFactors['diversity'] {
  if (sessions.length === 0) {
    return {
      score: 0,
      uniqueSessionModes: 0,
      uniqueTimeSlots: 0,
      uniqueDaysOfWeek: 0,
      weekendSessions: 0,
      contextVariety: 0,
    };
  }
  const uniqueModes = new Set(sessions.map((s) => s.mode)).size;
  const timeSlots = new Set(
    sessions.map((s) => {
      if (s.hour >= 5 && s.hour < 12) {return 'morning';}
      if (s.hour >= 12 && s.hour < 17) {return 'afternoon';}
      if (s.hour >= 17 && s.hour < 22) {return 'evening';}
      return 'night';
    }),
  ).size;
  const uniqueDays = new Set(sessions.map((s) => s.dayOfWeek)).size;
  const weekendCount = sessions.filter(
    (s) => s.dayOfWeek === 0 || s.dayOfWeek === 6,
  ).length;
  const uniqueContexts = new Set(
    sessions.map((s) => s.context ?? 'default'),
  ).size;
  let score = 0;
  score += Math.min(uniqueModes / 3, 1) * 25;
  score += Math.min(timeSlots / 3, 1) * 20;
  score += Math.min(uniqueDays / 5, 1) * 20;
  score += Math.min(weekendCount / 4, 1) * 15;
  score += Math.min(uniqueContexts / 2, 1) * 20;
  return {
    score: Math.round(score),
    uniqueSessionModes: uniqueModes,
    uniqueTimeSlots: timeSlots,
    uniqueDaysOfWeek: uniqueDays,
    weekendSessions: weekendCount,
    contextVariety: uniqueContexts,
  };
}

export function calculateRecencyFactorForInput(
  daysSinceLastSession: number,
  last7Days: number,
  last30Days: number,
  scoreHistory: Array<{ date: string; score: number }>,
): FocusScoreFactors['recency'] {
  let score = 100;
  if (daysSinceLastSession === 1) {
    score -= 10;
  } else if (daysSinceLastSession === 2) {
    score -= 25;
  } else if (daysSinceLastSession >= 3) {
    score -= 50;
  }
  score += Math.min(last7Days / 5, 1) * 20;
  score += Math.min(last30Days / 20, 1) * 15;

  let trend: 'UP' | 'STABLE' | 'DOWN' | 'CONCERNING' = 'STABLE';
  let velocity = 0;
  if (scoreHistory.length >= 7) {
    const recent = scoreHistory.slice(-7);
    const first = recent[0]?.score ?? 0; // ponytail: asserted non-null by scoreHistory.length >= 7 guard
    const last = recent[recent.length - 1]?.score ?? 0; // ponytail: asserted non-null by scoreHistory.length >= 7 guard
    velocity = last - first;
    if (velocity > 10) {trend = 'UP';}
    else if (velocity < -10) {trend = 'CONCERNING';}
    else if (velocity < -5) {trend = 'DOWN';}
  }
  if (trend === 'CONCERNING') {score -= 20;}

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    daysSinceLastSession,
    last7DayActivity: last7Days,
    last30DayActivity: last30Days,
    trendDirection: trend,
    velocity,
  };
}
