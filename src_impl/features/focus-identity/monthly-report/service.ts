/**
 * Monthly Focus Report Service
 *
 * Business logic for generating and managing monthly focus reports.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import {
  MonthlyFocusReportSchema,
  MonthlyReportPreviewSchema,
  type MonthlyFocusReport,
  type MonthlyReportPreview,
  type SessionData
} from './schemas';
import { analyzeSessionData, generateNextMonthTarget } from './report-analysis';

const debug = createDebugger('focus-identity:monthly-report');

/**
 * Generate a comprehensive monthly focus report
 */
export async function generateMonthlyReport(
  userId: string,
  year: number,
  month: number,
  isPremium: boolean = false
): Promise<MonthlyFocusReport | null> {
  try {
    debug.info('Generating monthly report', { userId, year, month, isPremium });

    // Get the first and last day of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Fetch user's focus score at start and end of month
    const { data: startScore, error: startError } = await getSupabaseClient()
      .from('focus_scores')
      .select('score')
      .eq('user_id', userId)
      .lte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: endScore, error: endError } = await getSupabaseClient()
      .from('focus_scores')
      .select('score')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (startError || endError) {
      debug.error('Failed to fetch score data', { startError, endError });
      return null;
    }

    const startingScore = startScore?.score || 0;
    const endingScore = endScore?.score || 0;
    const scoreDelta = endingScore - startingScore;

    // Fetch session data for the month
    const { data: sessions, error: sessionError } = await getSupabaseClient()
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .eq('status', 'COMPLETED');

    if (sessionError) {
      debug.error('Failed to fetch session data', sessionError);
      return null;
    }

    // Analyze session data
    const sessionAnalysis = analyzeSessionData(sessions || []);

    // Generate AI insights for premium users
    const aiInsight = isPremium ? await generateAIInsight(userId, sessions || [], scoreDelta) : undefined;

    // Determine unlocked sections based on premium status
    const unlockedSections = isPremium
      ? ['SCORE_OVERVIEW', 'SESSION_ANALYSIS', 'STREAK_HIGHLIGHTS', 'BEST_PERFORMANCE', 'WEEKLY_PATTERNS', 'AI_INSIGHTS', 'NEXT_TARGETS']
      : ['SCORE_OVERVIEW', 'SESSION_ANALYSIS'];

    const report = MonthlyFocusReportSchema.parse({
      id: `report-${userId}-${year}-${month}`,
      userId,
      year,
      month,
      generatedAt: Date.now(),
      startingScore,
      endingScore,
      scoreDelta,
      grade: calculateGrade(endingScore),
      sessionCount: sessionAnalysis.sessionCount,
      totalFocusedMinutes: sessionAnalysis.totalFocusedMinutes,
      averageSessionLength: sessionAnalysis.averageSessionLength,
      bestGrade: sessionAnalysis.bestGrade,
      bestFocusWindow: sessionAnalysis.bestFocusWindow,
      strongestPattern: sessionAnalysis.strongestPattern,
      weakestPattern: sessionAnalysis.weakestPattern,
      aiInsight,
      nextMonthTarget: generateNextMonthTarget(scoreDelta, sessionAnalysis),
      isPremium,
      unlockedSections,
    });

    debug.info('Monthly report generated successfully', { reportId: report.id });
    return report;

  } catch (error) {
    debug.error('Error generating monthly report', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Generate a preview of the monthly report for free users
 */
export async function generateMonthlyReportPreview(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyReportPreview | null> {
  try {
    const fullReport = await generateMonthlyReport(userId, year, month, false);

    if (!fullReport) {
      return null;
    }

    return MonthlyReportPreviewSchema.parse({
      month: `${year}-${month.toString().padStart(2, '0')}`,
      scoreDelta: fullReport.scoreDelta,
      sessionCount: fullReport.sessionCount,
      hasPremiumInsights: fullReport.isPremium,
    });
  } catch (error) {
    debug.error('Error generating monthly report preview', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Calculate grade based on score
 */
function calculateGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate AI insights for premium users
 */
async function generateAIInsight(
  userId: string,
  sessions: SessionData[],
  scoreDelta: number
): Promise<string> {
  // This would integrate with the AI Coach system
  // For now, return a placeholder insight
  if (scoreDelta > 10) {
    return 'Excellent progress! Your consistency is paying off. Consider maintaining your current routine while gradually increasing session duration.';
  } else if (scoreDelta > 0) {
    return 'Steady improvement detected. Focus on maintaining your current schedule and consider adding one extra session per week.';
  } else if (scoreDelta < -10) {
    return 'Significant score decline detected. Let\'s prioritize rebuilding your foundation with shorter, more frequent sessions.';
  } else {
    return 'Your score is stable. This is a good foundation to build upon. Try experimenting with different session times to find your optimal focus window.';
  }
}
