import { 
  AnalyticsMetric, 
  TimeRange, 
  TrendAnalysis, 
  TrendAnalysisSchema, 
  ComparativeStats, 
  ComparativeStatsSchema, 
  getTimeRangeDates 
} from './schemas';
import * as repository from './repository';

/**
 * Analytics Service - Calculations
 * Handles statistical analysis, trend detection, and correlation mapping.
 */

export async function calculateTrend(
  userId: string, 
  metric: AnalyticsMetric, 
  timeRange: TimeRange, 
  _lookbackPeriods: number = 3
): Promise<TrendAnalysis> {
  const data = await repository.fetchTimeSeriesData(userId, metric, timeRange, 'day');
  const points = data.points;
  
  if (points.length < 2) {
    return TrendAnalysisSchema.parse({
      metric,
      direction: 'flat',
      strength: 0,
      changePercent: 0,
      confidence: 0,
      points,
      projectedNext: points[0]?.value ?? 0,
      seasonalityDetected: false,
      outliers: []
    });
  }

  const n = points.length;
  const sumX = points.reduce((sum, _, i) => sum + i, 0);
  const sumY = points.reduce((sum, p) => sum + p.value, 0);
  const sumXY = points.reduce((sum, p, i) => sum + i * p.value, 0);
  const sumX2 = points.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const yMean = sumY / n;
  const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.value - yMean, 2), 0);
  const ssResidual = points.reduce((sum, p, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(p.value - predicted, 2);
  }, 0);
  
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;
  
  let direction: TrendAnalysis['direction'] = 'flat';
  if (Math.abs(slope) > 0.01) {
    direction = slope > 0 ? 'up' : 'down';
  }

  const seasonalityDetected = detectSeasonality(points);
  
  const values = points.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const outliers = points.filter(p => Math.abs(p.value - mean) > 2 * stdDev);

  const firstValue = points[0]?.value ?? 0;
  const lastValue = points[points.length - 1]?.value ?? 0;
  const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  const projectedNext = slope * n + intercept;

  return TrendAnalysisSchema.parse({
    metric,
    direction,
    strength: Math.min(Math.abs(slope) * 10, 1),
    changePercent,
    confidence: rSquared,
    points,
    projectedNext: Math.max(0, projectedNext),
    seasonalityDetected,
    outliers
  });
}

function detectSeasonality(points: any[]): boolean {
  if (points.length < 14) return false;
  
  const dayOfWeekValues: Record<number, number[]> = {};
  for (const point of points) {
    const dayOfWeek = new Date(point.timestamp).getDay();
    if (!dayOfWeekValues[dayOfWeek]) dayOfWeekValues[dayOfWeek] = [];
    dayOfWeekValues[dayOfWeek].push(point.value);
  }

  const dayMeans = Object.values(dayOfWeekValues).map(values => 
    values.reduce((a, b) => a + b, 0) / values.length
  );
  
  const overallMean = dayMeans.reduce((a, b) => a + b, 0) / dayMeans.length;
  const dayVariance = dayMeans.reduce((sum, m) => sum + Math.pow(m - overallMean, 2), 0) / dayMeans.length;
  
  return dayVariance > overallMean * 0.1;
}

export function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const sumX = xSlice.reduce((a, b) => a + b, 0);
  const sumY = ySlice.reduce((a, b) => a + b, 0);
  const sumXY = xSlice.reduce((sum, xi, i) => sum + xi * ySlice[i], 0);
  const sumX2 = xSlice.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = ySlice.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

export async function getComparativeStats(
  userId: string, 
  metric: AnalyticsMetric, 
  currentRange: TimeRange
): Promise<ComparativeStats> {
  const { start: currentStart, end: currentEnd } = getTimeRangeDates(currentRange);
  const periodLength = currentEnd - currentStart;
  const previousStart = currentStart - periodLength;
  const previousEnd = currentStart;

  const [currentData, previousData] = await Promise.all([
    repository.fetchTimeSeriesData(userId, metric, currentRange, 'day'),
    repository.fetchTimeSeriesData(userId, metric, 'custom' as TimeRange, 'day')
  ]);

  const currentValue = currentData.summary.total;
  const previousValue = previousData.summary.total;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isSignificant = Math.abs(changePercent) > 10;

  return ComparativeStatsSchema.parse({
    metric,
    currentPeriod: { value: currentValue, startDate: currentStart, endDate: currentEnd },
    previousPeriod: { value: previousValue, startDate: previousStart, endDate: previousEnd },
    change,
    changePercent,
    isSignificant
  });
}
