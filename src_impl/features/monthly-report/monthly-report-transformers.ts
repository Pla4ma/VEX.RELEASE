export const GRADE_VALUES: Record<string, number> = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

export interface FocusFactors {
  consistency?: { score: number };
  streakStability?: { score: number };
  sessionQuality?: { score: number };
  intentionalDifficulty?: { score: number };
  recency?: { score: number };
  [key: string]: { score: number } | undefined;
}

export interface SessionRow {
  grade: string;
  duration_seconds: number | null;
  started_at: string;
}

export function computeBestFocusWindow(sessions: SessionRow[]): string {
  if (sessions.length === 0) return 'No data';

  const hourBuckets = new Map<number, { count: number; gradeSum: number }>();

  for (const session of sessions) {
    const hour = new Date(session.started_at).getHours();
    const gradeVal = GRADE_VALUES[session.grade] ?? 3;
    const existing = hourBuckets.get(hour) ?? { count: 0, gradeSum: 0 };
    hourBuckets.set(hour, {
      count: existing.count + 1,
      gradeSum: existing.gradeSum + gradeVal,
    });
  }

  let bestHour = 0;
  let bestScore = -1;

  for (const [hour, data] of hourBuckets.entries()) {
    const avgGrade = data.gradeSum / data.count;
    const weightedScore = avgGrade * Math.log2(data.count + 1);
    if (weightedScore > bestScore) {
      bestScore = weightedScore;
      bestHour = hour;
    }
  }

  const period = bestHour < 12 ? 'Morning' : bestHour < 17 ? 'Afternoon' : 'Evening';
  const startHour = bestHour % 12 === 0 ? 12 : bestHour % 12;
  const amPm = bestHour < 12 ? 'AM' : 'PM';
  return `${period} (${startHour}:00 ${amPm})`;
}

export function computePatterns(factors: FocusFactors): {
  strongestPattern: string;
  weakestPattern: string;
} {
  const patternMap: Record<string, string> = {
    consistency: 'Consistency',
    streakStability: 'Streak Stability',
    sessionQuality: 'Session Quality',
    intentionalDifficulty: 'Challenge Level',
    recency: 'Recency',
  };

  const entries = Object.entries(factors)
    .filter(([, v]) => v !== undefined && typeof v.score === 'number')
    .map(([key, v]) => ({ key, name: patternMap[key] ?? key, score: v!.score }));

  if (entries.length === 0) {
    return { strongestPattern: 'No data', weakestPattern: 'No data' };
  }

  entries.sort((a, b) => b.score - a.score);
  return {
    strongestPattern: entries[0]!.name,
    weakestPattern: entries[entries.length - 1]!.name,
  };
}
