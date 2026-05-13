import { supabase } from '../../config/supabase';
import { MonthlyFocusReportInputSchema, MonthlyFocusReportSummarySchema } from './schemas';
import type { MonthlyFocusReportInput, MonthlyFocusReportSummary } from './types';
import { computeBestFocusWindow, computePatterns } from './monthly-report-transformers';
import type { FocusFactors, SessionRow } from './monthly-report-transformers';

export class MonthlyReportRepositoryError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`MonthlyReportRepository ${operation} failed`);
  }
}

export async function fetchMonthlyFocusReportInput(
  input: MonthlyFocusReportInput
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
    0
  );

  const gradeOrder = ['S', 'A', 'B', 'C', 'D'] as const;
  let bestGrade: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  for (const s of typedSessions) {
    if (gradeOrder.indexOf(s.grade as typeof gradeOrder[number]) < gradeOrder.indexOf(bestGrade)) {
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
