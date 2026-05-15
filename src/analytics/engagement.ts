/**
 * Engagement Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Tracks and calculates user engagement metrics.
 */

import { eventBus } from '../events';
import type { EngagementMetrics } from './types';

const engagementData = new Map<string, EngagementMetrics>();

export function recordEngagementEvent(
  userId: string,
  event: {
    type: 'session_complete' | 'plan_start' | 'plan_complete' | 'boss_defeat' | 'streak_milestone';
    value?: number;
  }
): void {
  let metrics = engagementData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      sessionsLast7Days: 0,
      sessionsLast30Days: 0,
      totalFocusMinutes: 0,
      avgSessionDuration: 0,
      studyPlansCompleted: 0,
      studyPlansStarted: 0,
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
      if (event.value) { metrics.streakDays = event.value; }
      break;
  }

  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;

  engagementData.set(userId, metrics);

  eventBus.publish('analytics:engagement', { userId, event: event.type, metrics });
}

export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) { return 0; }
  return users.reduce((sum, user) => sum + user.sessionsLast7Days, 0) / users.length;
}

export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) { return 0; }

  const usersWithPlans = users.filter((user) => user.studyPlansStarted > 0);
  if (usersWithPlans.length === 0) { return 0; }

  const totalStarted = usersWithPlans.reduce((sum, user) => sum + user.studyPlansStarted, 0);
  const totalCompleted = usersWithPlans.reduce((sum, user) => sum + user.studyPlansCompleted, 0);

  return totalCompleted / totalStarted;
}
