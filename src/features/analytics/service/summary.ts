import * as repository from '../repository';
import {
  type TimeRange,
  type AnalyticsMetric,
  type TrendDirection,
} from '../schemas';
import { generateInsights } from './insights';

export async function getAnalyticsSummary(
  userId: string,
  timeRange: TimeRange,
) {
  const [stats, insights, patterns] = await Promise.all([
    repository.fetchAggregatedStats(userId, timeRange),
    repository.fetchInsights(userId, { unreadOnly: false, limit: 10 }),
    repository.fetchDetectedPatterns(userId, {
      since: Date.now() - 30 * 24 * 60 * 60 * 1000,
    }),
  ]);
  const freshInsights =
    insights.length === 0 ? await generateInsights(userId) : [];
  return {
    stats: stats ?? (await generateAggregatedStats(userId, timeRange)),
    insights: [...insights, ...freshInsights],
    patterns,
  };
}

async function generateAggregatedStats(userId: string, period: TimeRange) {
  const now = Date.now();
  const metrics = [
    'sessions_completed',
    'total_focus_time',
    'xp_earned',
    'streak_days',
  ] as AnalyticsMetric[];
  const metricData = await Promise.all(
    metrics.map(async (metric) => {
      const data = await repository.fetchTimeSeriesData(
        userId,
        metric,
        period,
        'day',
      );
      return {
        metric,
        value: data.summary.total,
        previousValue: 0,
        changePercent: data.summary.changePercent,
        trend: (data.summary.changePercent > 5
          ? 'up'
          : data.summary.changePercent < -5
            ? 'down'
            : 'flat') as TrendDirection,
      };
    }),
  );
  const stats = {
    userId,
    period,
    generatedAt: now,
    metrics: Object.fromEntries(metricData.map((m) => [m.metric, m])),
    insights: [],
    patterns: [],
    topPerforming: { dayOfWeek: 1, hourOfDay: 9, category: 'work' },
  };
  await repository.storeAggregatedStats(stats);
  return stats;
}
