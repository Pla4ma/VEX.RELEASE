import { z } from 'zod';
import * as repository from '../repository';
import {
  ComparativeStatsSchema,
  InsightSchema,
  CreateInsightInputSchema,
  getTimeRangeDates,
  type TimeRange,
  type AnalyticsMetric,
  type Insight,
  type ComparativeStats,
} from '../schemas';
import { eventBus } from '../../../events';

export async function getComparativeStats(
  userId: string,
  metric: AnalyticsMetric,
  currentRange: TimeRange,
): Promise<ComparativeStats> {
  const { start: currentStart, end: currentEnd } =
    getTimeRangeDates(currentRange);
  const periodLength = currentEnd - currentStart;
  const previousStart = currentStart - periodLength;
  const previousEnd = currentStart;
  const [currentData, previousData] = await Promise.all([
    repository.fetchTimeSeriesData(userId, metric, currentRange, 'day'),
    repository.fetchTimeSeriesData(
      userId,
      metric,
      'custom' as TimeRange,
      'day',
    ),
  ]);
  const currentValue = currentData.summary.total;
  const previousValue = previousData.summary.total;
  const change = currentValue - previousValue;
  const changePercent =
    previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isSignificant = Math.abs(changePercent) > 10;
  return ComparativeStatsSchema.parse({
    metric,
    currentPeriod: {
      value: currentValue,
      startDate: currentStart,
      endDate: currentEnd,
    },
    previousPeriod: {
      value: previousValue,
      startDate: previousStart,
      endDate: previousEnd,
    },
    change,
    changePercent,
    isSignificant,
  });
}

async function createInsight(
  input: Omit<z.infer<typeof CreateInsightInputSchema>, 'relatedMetrics'> & {
    relatedMetrics?: string[];
  },
): Promise<Insight> {
  const validated = CreateInsightInputSchema.parse({
    ...input,
    relatedMetrics: input.relatedMetrics ?? [],
  });
  const now = Date.now();
  const insight = InsightSchema.parse({
    id: crypto.randomUUID(),
    userId: validated.userId,
    type: validated.type,
    severity: validated.severity,
    title: validated.title,
    description: validated.description,
    metric: validated.metric,
    detectedAt: now,
    expiresAt: now + validated.expiresInDays * 24 * 60 * 60 * 1000,
    isRead: false,
    isActioned: false,
    actionType: validated.actionType,
    actionPayload: validated.actionPayload,
    relatedMetrics: validated.relatedMetrics,
  });
  await repository.createInsight(insight);
  eventBus.publish('analytics:insight_generated', {
    userId: validated.userId,
    insightId: insight.id,
    type: insight.type,
  });
  return insight;
}

export async function generateInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];
  const streakData = await repository.fetchTimeSeriesData(
    userId,
    'streak_days',
    'last_7_days',
    'day',
  );
  const currentStreak =
    streakData.points[streakData.points.length - 1]?.value ?? 0;
  if (currentStreak > 0 && [3, 7, 14, 30, 60, 100].includes(currentStreak)) {
    insights.push(
      await createInsight({
        userId,
        type: 'streak_achieved',
        severity: 'celebration',
        title: `${currentStreak} Day Streak`,
        description: `Amazing! You've maintained focus for ${currentStreak} consecutive days. Keep the momentum going!`,
        metric: 'streak_days',
        expiresInDays: 7,
      }),
    );
  }
  const todaysSession = await repository.fetchTimeSeriesData(
    userId,
    'sessions_completed',
    'today',
    'hour',
  );
  if (
    currentStreak > 0 &&
    todaysSession.summary.total === 0 &&
    new Date().getHours() > 18
  ) {
    insights.push(
      await createInsight({
        userId,
        type: 'streak_at_risk',
        severity: 'warning',
        title: 'Streak at Risk',
        description: `You haven't completed a focus session today. Start one now to keep your ${currentStreak} day streak alive!`,
        metric: 'sessions_completed',
        expiresInDays: 1,
        actionType: 'start_session',
      }),
    );
  }
  const xpData = await repository.fetchTimeSeriesData(
    userId,
    'xp_earned',
    'last_30_days',
    'day',
  );
  const totalXp = xpData.summary.total;
  const xpMilestones = [100, 500, 1000, 5000, 10000];
  const lastXpPoint = xpData.points[xpData.points.length - 1];
  const nextMilestone = xpMilestones.find(
    (m) => totalXp >= m && lastXpPoint && totalXp - lastXpPoint.value < m,
  );
  if (nextMilestone && xpData.points.length > 1) {
    const lastPoint = xpData.points[xpData.points.length - 1];
    if (lastPoint) {
      const previousTotal = totalXp - lastPoint.value;
      if (previousTotal < nextMilestone) {
        insights.push(
          await createInsight({
            userId,
            type: 'milestone_reached',
            severity: 'celebration',
            title: `${nextMilestone} XP Milestone! 🎉`,
            description: `Incredible! You've earned ${nextMilestone} total XP. You're leveling up fast!`,
            metric: 'xp_earned',
            expiresInDays: 14,
          }),
        );
      }
    }
  }
  return insights;
}
