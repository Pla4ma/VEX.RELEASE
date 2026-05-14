import { 
  Insight, 
  InsightSchema, 
  CreateInsightInputSchema, 
  DetectedPattern, 
  DetectedPatternSchema, 
  TimeRange 
} from './schemas';
import * as repository from './repository';
import { eventBus } from '../../events';
import { calculateCorrelation, calculateTrend } from './service.calculations';

/**
 * Analytics Service - Insights
 * Generates actionable insights and detects behavioral patterns.
 */

export async function createInsight(input: any): Promise<Insight> {
  const validated = CreateInsightInputSchema.parse({ 
    ...input, 
    relatedMetrics: input.relatedMetrics || [] 
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
    relatedMetrics: validated.relatedMetrics
  });

  await repository.createInsight(insight);
  eventBus.publish('analytics:insight_generated', { 
    userId: validated.userId, 
    insightId: insight.id, 
    type: insight.type 
  });
  
  return insight;
}

export async function generateInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Streak Insights
  const streakData = await repository.fetchTimeSeriesData(userId, 'streak_days', 'last_7_days', 'day');
  const currentStreak = streakData.points[streakData.points.length - 1]?.value ?? 0;

  if (currentStreak > 0 && [3, 7, 14, 30, 60, 100].includes(currentStreak)) {
    insights.push(await createInsight({
      userId,
      type: 'streak_achieved',
      severity: 'celebration',
      title: `${currentStreak} Day Streak! 🔥`,
      description: `Amazing! You've maintained focus for ${currentStreak} consecutive days.`,
      metric: 'streak_days',
      expiresInDays: 7
    }));
  }

  // XP Insights
  const xpData = await repository.fetchTimeSeriesData(userId, 'xp_earned', 'last_30_days', 'day');
  const totalXp = xpData.summary.total;
  const xpMilestones = [100, 500, 1000, 5000, 10000];
  const lastSessionXp = xpData.points[xpData.points.length - 1]?.value ?? 0;
  const previousTotal = totalXp - lastSessionXp;

  const nextMilestone = xpMilestones.find(m => totalXp >= m && previousTotal < m);

  if (nextMilestone) {
    insights.push(await createInsight({
      userId,
      type: 'milestone_reached',
      severity: 'celebration',
      title: `${nextMilestone} XP Milestone! 🎉`,
      description: `Incredible! You've earned ${nextMilestone} total XP.`,
      metric: 'xp_earned',
      expiresInDays: 14
    }));
  }

  return insights;
}

export async function detectPatterns(userId: string, timeRange: TimeRange): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];
  const [sessionsData, xpData] = await Promise.all([
    repository.fetchTimeSeriesData(userId, 'sessions_completed', timeRange, 'day'),
    repository.fetchTimeSeriesData(userId, 'xp_earned', timeRange, 'day'),
  ]);

  if (sessionsData.points.length > 3 && xpData.points.length > 3) {
    const xValues = sessionsData.points.map(p => p.value);
    const yValues = xpData.points.map(p => p.value);
    const correlation = calculateCorrelation(xValues, yValues);
    
    if (correlation > 0.7) {
      patterns.push(DetectedPatternSchema.parse({
        id: crypto.randomUUID(),
        type: 'correlation',
        metric: 'sessions_completed',
        description: 'Strong correlation detected between daily sessions and XP earned.',
        confidence: correlation,
        detectedAt: Date.now(),
        startDate: sessionsData.points[0].timestamp,
        endDate: sessionsData.points[sessionsData.points.length - 1].timestamp,
        relatedEvents: [],
        recommendations: ['Increase daily sessions for more XP']
      }));
    }
  }

  const trend = await calculateTrend(userId, 'sessions_completed', timeRange);
  if (trend.direction === 'up' && trend.strength > 0.5) {
    patterns.push(DetectedPatternSchema.parse({
      id: crypto.randomUUID(),
      type: 'milestone',
      metric: 'sessions_completed',
      description: `Focus time trending upward with ${trend.changePercent.toFixed(1)}% improvement!`,
      confidence: trend.confidence,
      detectedAt: Date.now(),
      startDate: trend.points[0].timestamp,
      endDate: trend.points[trend.points.length - 1].timestamp,
      relatedEvents: [],
      recommendations: ['Keep up the momentum']
    }));
  }

  for (const pattern of patterns) {
    await repository.storeDetectedPattern(pattern);
  }
  
  return patterns;
}
