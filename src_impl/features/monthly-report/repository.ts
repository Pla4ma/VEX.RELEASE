import { supabase } from '../../config/supabase';
import { MonthlyFocusReportInputSchema, MonthlyFocusReportSummarySchema } from './schemas';
import type { MonthlyFocusReportInput, MonthlyFocusReportSummary } from './types';
import * as z from 'zod';

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

  const { data, error } = await supabase
    .from('focus_score_history')
    .select('score, created_at')
    .eq('user_id', validated.userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw new MonthlyReportRepositoryError('fetchHistory', error);
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

  const startScore = data[0]?.score ?? 550;
  const endScore = data[data.length - 1]?.score ?? startScore;
  const sessionCount = sessions?.length ?? 0;
  const totalFocusedTime = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) ?? 0;
  const bestGrade = sessions?.reduce<'S' | 'A' | 'B' | 'C' | 'D'>((best, s) => {
    const grades = ['S', 'A', 'B', 'C', 'D'];
    return grades.indexOf(s.grade) < grades.indexOf(best) ? s.grade : best;
  }, 'D') ?? 'D';

  const result: MonthlyFocusReportSummary = {
    monthStartScore: startScore,
    monthEndScore: endScore,
    scoreDelta: endScore - startScore,
    bestFocusWindow: 'Evening',
    strongestPattern: 'Consistency',
    weakestPattern: 'Session Length',
    sessionCount,
    totalFocusedTime,
    bestGrade,
    nextMonthTarget: Math.min(850, endScore + 25),
  };

  return z.array(MonthlyFocusReportSummarySchema).parse(result);
}
