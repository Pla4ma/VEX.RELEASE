import { supabase } from '../../config/supabase';
import {
  MonthlyFocusReportInputSchema,
  MonthlyFocusReportSummarySchema,
} from './schemas';
import type {
  MonthlyFocusReportInput,
  MonthlyFocusReportSummary,
} from './types';

export class MonthlyReportRepositoryError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`MonthlyReportRepository ${operation} failed`);
  }
}

interface FocusFactors {
  consistency?: { score: number };
  streakStability?: { score: number };
  sessionQuality?: { score: number };
  intentionalDifficulty?: { score: number };
  recency?: { score: number };
  [key: string]: { score: number } | undefined;
}

interface SessionRow {
  grade: string;
  duration_seconds: number | null;
  started_at: string;
}

function computeBestFocusWindow(sessions: SessionRow[]): string {
  if (sessions.length === 0) {
    return 'No data';
  }

  const hourBuckets = new Map<number, { count: number; gradeSum: number }>();
  const gradeValues: Record<string, number> = {
    S: 6,
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    F: 1,
  };

  for (const session of sessions) {
    const hour = new Date(session.started_at).getHours();
    const gradeVal = gradeValues[session.grade] ?? 3;
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

  const period =
    bestHour < 12 ? 'Morning' : bestHour < 17 ? 'Afternoon' : 'Evening';
  const startHour = bestHour % 12 === 0 ? 12 : bestHour % 12;
  const amPm = bestHour < 12 ? 'AM' : 'PM';
  return `${period} (${startHour}:00 ${amPm})`;
}

function computePatterns(factors: FocusFactors): {
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
    .map(([key, v]) => ({
      key,
      name: patternMap[key] ?? key,
      score: v!.score,
    }));

  if (entries.length === 0) {
    return { strongestPattern: 'No data', weakestPattern: 'No data' };
  }

  entries.sort((a, b) => b.score - a.score);
  return {
    strongestPattern: entries[0]!.name,
    weakestPattern: entries[entries.length - 1]!.name,
  };
}

export async function fetchMonthlyFocusReportInput(
  input: MonthlyFocusReportInput,
): Promise<MonthlyFocusReportSummary> {
  const validated = MonthlyFocusReportInputSchema.parse(input);
  const startDate = new Date(validated.year, validated.month - 1, 1);
  const endDate = new Date(validated.year, validated.month, 0, 23, 59, 59);

  const { data: scoreData, error: scoreError } = await supabase
    .from('focus_score_history')
    .select('score, created_at')
    .eq('user_id', validated.userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (scoreError) {
    throw new MonthlyReportRepositoryError('fetchHistory', scoreError);
  }

  const { data: sessions, error: sessionError } = await supabase
    .from('session_ledgers')
    .select('grade, duration_seconds, started_at')
    .eq('user_id', validated.userId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (sessionError) {
    throw new MonthlyReportRepositoryError('fetchSessions', sessionError);
  }

  const { data: currentScore, error: factorsError } = await supabase
    .from('focus_score_current')
    .select('factors')
    .eq('user_id', validated.userId)
    .single();

  if (factorsError && factorsError.code !== 'PGRST116') {
    throw new MonthlyReportRepositoryError('fetchFactors', factorsError);
  }

  const typedSessions = (sessions ?? []) as SessionRow[];
  const startScore = scoreData?.[0]?.score ?? 550;
  const endScore = scoreData?.[scoreData.length - 1]?.score ?? startScore;
  const sessionCount = typedSessions.length;
  const totalFocusedTime = typedSessions.reduce(
    (acc, s) => acc + (s.duration_seconds ?? 0),
    0,
  );

  const gradeOrder = ['S', 'A', 'B', 'C', 'D'] as const;
  let bestGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  for (const s of typedSessions) {
    if (
      gradeOrder.indexOf(s.grade as (typeof gradeOrder)[number]) <
      gradeOrder.indexOf(bestGrade)
    ) {
      bestGrade = s.grade as typeof bestGrade;
    }
  }

  const bestFocusWindow = computeBestFocusWindow(typedSessions);

  const factors = (currentScore?.factors ?? {}) as FocusFactors;
  const { strongestPattern, weakestPattern } = computePatterns(factors);

  const result: MonthlyFocusReportSummary = {
    monthStartScore: startScore,
    monthEndScore: endScore,
    scoreDelta: endScore - startScore,
    bestFocusWindow,
    strongestPattern,
    weakestPattern,
    sessionCount,
    totalFocusedTime,
    bestGrade,
    nextMonthTarget: Math.min(850, endScore + 25),
  };

  return MonthlyFocusReportSummarySchema.parse(result);
}
