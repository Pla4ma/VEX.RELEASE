import { fetchTimeSeriesData } from '../repository/time-series';
import { storeDetectedPattern } from '../repository/stats';
import {
  DetectedPatternSchema,
  type TimeRange,
  type DetectedPattern,
} from '../schemas';
import { calculateTrend } from './trends';

function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  const sumX = xSlice.reduce((a, b) => a + b, 0);
  const sumY = ySlice.reduce((a, b) => a + b, 0);
  const sumXY = xSlice.reduce((sum, xi, i) => {
    const yi = ySlice[i];
    return sum + xi * (yi ?? 0);
  }, 0);
  const sumX2 = xSlice.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = ySlice.reduce((sum, yi) => sum + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );
  return denominator === 0 ? 0 : numerator / denominator;
}

export async function detectPatterns(
  userId: string,
  timeRange: TimeRange,
): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];
  const [sessionsData, xpData] = await Promise.all([
    fetchTimeSeriesData(
      userId,
      'sessions_completed',
      timeRange,
      'day',
    ),
    fetchTimeSeriesData(userId, 'xp_earned', timeRange, 'day'),
  ]);
  if (sessionsData.points.length > 3 && xpData.points.length > 3) {
    const correlation = calculateCorrelation(
      sessionsData.points.map((p) => p.value),
      xpData.points.map((p) => p.value),
    );
    if (correlation > 0.7) {
      const firstSessionPoint = sessionsData.points[0];
      const lastSessionPoint =
        sessionsData.points[sessionsData.points.length - 1];
      if (firstSessionPoint && lastSessionPoint) {
        patterns.push(
          DetectedPatternSchema.parse({
            id: crypto.randomUUID(),
            type: 'correlation',
            metric: 'sessions_completed',
            description:
              'Strong correlation detected between daily sessions and XP earned. More sessions = more XP!',
            confidence: correlation,
            detectedAt: Date.now(),
            startDate: firstSessionPoint.timestamp,
            endDate: lastSessionPoint.timestamp,
            relatedEvents: [],
            recommendations: [
              'Try increasing your daily session count for more XP',
              'Focus on consistency',
            ],
          }),
        );
      }
    }
  }
  const trend = await calculateTrend(userId, 'sessions_completed', timeRange);
  if (trend.direction === 'up' && trend.strength > 0.5) {
    const firstTrendPoint = trend.points[0];
    const lastTrendPoint = trend.points[trend.points.length - 1];
    if (firstTrendPoint && lastTrendPoint) {
      patterns.push(
        DetectedPatternSchema.parse({
          id: crypto.randomUUID(),
          type: 'milestone',
          metric: 'sessions_completed',
          description: `Your focus time is trending upward with ${trend.changePercent.toFixed(1)}% improvement!`,
          confidence: trend.confidence,
          detectedAt: Date.now(),
          startDate: firstTrendPoint.timestamp,
          endDate: lastTrendPoint.timestamp,
          relatedEvents: [],
          recommendations: [
            'Keep up the great work!',
            'Your consistency is paying off',
          ],
        }),
      );
    }
  }
  for (const pattern of patterns) {
    await storeDetectedPattern(pattern);
  }
  return patterns;
}
