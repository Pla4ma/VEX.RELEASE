import * as Sentry from '@sentry/react-native';
import {
  fetchLatestFocusScore,
  fetchPreviousWeekFocusScore,
  fetchStreak,
  fetchWeeklySessions,
} from './repository';
import {
  BestSessionSchema,
  WeeklyFocusDataSchema,
  WeeklyFocusSummaryInputSchema,
  WeeklyFocusSummarySchema,
  type WeeklyFocusData,
  type WeeklyFocusSummary,
  type WeeklyFocusSummaryInput,
} from './schemas';

function getWeekRange(weekOffset: number): { weekStartDate: string; weekEndDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff - weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    weekStartDate: monday.toISOString().split('T')[0],
    weekEndDate: sunday.toISOString().split('T')[0],
  };
}

function computeBand(score: number): 'Legendary' | 'Elite' | 'Exceptional' | 'Strong' | 'Good' | 'Fair' | 'Building' {
  if (score >= 800) return 'Legendary';
  if (score >= 750) return 'Elite';
  if (score >= 700) return 'Exceptional';
  if (score >= 650) return 'Strong';
  if (score >= 600) return 'Good';
  if (score >= 550) return 'Fair';
  return 'Building';
}

function extractFocusScore(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  if (!('current_score' in metadata) && !('score' in metadata)) {
    return null;
  }
  const currentScore = 'current_score' in metadata ? metadata.current_score : undefined;
  const score = 'score' in metadata ? metadata.score : undefined;
  if (typeof currentScore === 'number') return currentScore;
  if (typeof score === 'number') return score;
  return null;
}

function computeInsight(
  sessionsCompleted: number,
  totalMinutes: number,
  scoreDelta: number | null,
  currentStreakDays: number
): 'consistency_king' | 'quality_over_quantity' | 'streak_master' | 'gradual_improver' | 'comeback_kid' | 'nothing_yet' {
  if (sessionsCompleted === 0) return 'nothing_yet';
  if (scoreDelta !== null && scoreDelta > 30) return 'comeback_kid';
  if (currentStreakDays >= 5) return 'streak_master';
  if (totalMinutes / sessionsCompleted >= 25) return 'quality_over_quantity';
  if (sessionsCompleted >= 4) return 'consistency_king';
  if (scoreDelta !== null && scoreDelta > 0) return 'gradual_improver';
  return 'nothing_yet';
}

export function buildWeeklyFocusSummary(data: WeeklyFocusData): WeeklyFocusSummary {
  const parsed = WeeklyFocusDataSchema.parse(data);
  const totalMinutes = parsed.sessions.reduce(
    (sum, session) => sum + Math.round(session.durationSeconds / 60),
    0,
  );
  const sessionsCompleted = parsed.sessions.length;
  const currentScore = parsed.currentFocusScore?.score ?? null;
  const previousScore = parsed.previousFocusScore?.score ?? null;
  const scoreDelta = currentScore !== null && previousScore !== null ? currentScore - previousScore : null;
  const currentBand = currentScore !== null ? computeBand(currentScore) : null;
  const best = parsed.sessions.reduce<WeeklyFocusData['sessions'][number] | null>(
    (current, session) =>
      !current || session.durationSeconds > current.durationSeconds ? session : current,
    null,
  );
  const bestSession = best
    ? BestSessionSchema.parse({
        date: best.completedAt ?? '',
        durationMinutes: Math.round(best.durationSeconds / 60),
        mode: best.mode,
        qualityScore: best.qualityScore,
      })
    : null;
  const insight = computeInsight(sessionsCompleted, totalMinutes, scoreDelta, parsed.currentStreakDays);

  return WeeklyFocusSummarySchema.parse({
    bestSession,
    currentBand,
    currentStreakDays: parsed.currentStreakDays,
    currentWeekScore: currentScore,
    insight,
    isEmpty: sessionsCompleted === 0 && totalMinutes === 0,
    previousWeekScore: previousScore,
    scoreDelta,
    sessionsCompleted,
    totalMinutes,
    userId: parsed.userId,
    weekEndDate: parsed.weekEndDate,
    weekStartDate: parsed.weekStartDate,
  });
}

export async function computeWeeklySummary(input: WeeklyFocusSummaryInput): Promise<WeeklyFocusSummary> {
  const { userId, weekOffset } = WeeklyFocusSummaryInputSchema.parse(input);
  const { weekStartDate, weekEndDate } = getWeekRange(weekOffset);

  try {
    const [sessions, streak, currentFocusScore, previousFocusScore] = await Promise.all([
      fetchWeeklySessions(userId, weekOffset),
      fetchStreak(userId),
      fetchLatestFocusScore(userId),
      weekOffset === 0 ? fetchPreviousWeekFocusScore(userId, 0) : Promise.resolve(null),
    ]);

    const currentScore = currentFocusScore ? extractFocusScore(currentFocusScore.metadata) : null;
    const previousScore = previousFocusScore ? extractFocusScore(previousFocusScore.metadata) : null;

    return buildWeeklyFocusSummary({
      currentFocusScore: currentScore === null ? null : { score: currentScore },
      currentStreakDays: streak?.current_days ?? 0,
      previousFocusScore: previousScore === null ? null : { score: previousScore },
      sessions: sessions.map((session) => ({
        completedAt: session.completed_at,
        durationSeconds: session.effective_duration ?? session.duration,
        mode: session.mode,
        qualityScore: session.quality_score,
      })),
      userId,
      weekEndDate,
      weekStartDate,
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: { userId, weekOffset },
      tags: { feature: 'weekly-focus-card' },
    });
    throw error;
  }
}
