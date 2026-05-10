/**
 * Engagement Analytics
 *
 * User engagement tracking and metrics
 */

import { EngagementMetrics } from './types';
import { eventBus } from '../events';

const engagementData = new Map<string, EngagementMetrics>();

/**
 * Record engagement event
 */
export function recordEngagementEvent(
  userId: string,
  event: {
    type: 'session_complete' | 'plan_start' | 'plan_complete' | 'boss_defeat' | 'streak_milestone';
    value?: number;
  },
): void {
  let metrics = engagementData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      sessionsLast7Days: 0,
      sessionsLast30Days: 0,
      totalFocusMinutes: 0,
      avgSessionDuration: 0,
      averageSessionDuration: 0,
      studyPlansCompleted: 0,
      studyPlansStarted: 0,
      completionRate: 0,
      lastActiveDate: new Date().toISOString(),
      bossBattlesCompleted: 0,
      streakDays: 0,
      weeklyActive: false,
      powerUser: false,
    };
  }

  switch (event.type) {
    case 'session_complete':
      metrics.sessionsLast7Days++;
      metrics.sessionsLast30Days++;
      if (event.value) {
        metrics.totalFocusMinutes += event.value;
        metrics.avgSessionDuration = metrics.totalFocusMinutes / metrics.sessionsLast30Days;
        metrics.averageSessionDuration = metrics.avgSessionDuration;
      }
      break;
    case 'plan_start':
      metrics.studyPlansStarted++;
      break;
    case 'plan_complete':
      metrics.studyPlansCompleted++;
      break;
    case 'boss_defeat':
      metrics.bossBattlesCompleted++;
      break;
    case 'streak_milestone':
      if (event.value) {
        metrics.streakDays = event.value;
      }
      break;
  }

  // Recalculate segments
  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;
  metrics.completionRate = metrics.studyPlansStarted > 0
    ? metrics.studyPlansCompleted / metrics.studyPlansStarted
    : 0;
  metrics.lastActiveDate = new Date().toISOString();

  engagementData.set(userId, metrics);

  eventBus.publish('analytics:engagement', {
    userId,
    event: event.type,
    metrics,
  });
}

/**
 * Get average sessions per week
 */
export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  return users.reduce((sum, u) => sum + u.sessionsLast7Days, 0) / users.length;
}

/**
 * Get study plan completion rate
 */
export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }

  const totalStarted = users.reduce((sum, u) => sum + u.studyPlansStarted, 0);
  const totalCompleted = users.reduce((sum, u) => sum + u.studyPlansCompleted, 0);

  if (totalStarted === 0) {
    return 0;
  }
  return totalCompleted / totalStarted;
}

/**
 * Get engagement metrics for a specific user
 */
export function getUserEngagementMetrics(userId: string): EngagementMetrics | undefined {
  return engagementData.get(userId);
}

/**
 * Get all engagement metrics
 */
export function getAllEngagementMetrics(): EngagementMetrics[] {
  return Array.from(engagementData.values());
}
