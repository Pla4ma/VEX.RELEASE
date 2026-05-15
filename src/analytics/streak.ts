/**
 * Streak Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Tracks and calculates streak survival metrics.
 */

import { eventBus } from '../events';
import type { StreakSurvivalMetrics } from './types';

const streakData = new Map<number, StreakSurvivalMetrics>();

export function trackStreakEvent(
  userId: string,
  event: {
    type: 'streak_start' | 'streak_extend' | 'streak_break' | 'streak_milestone';
    streakLength: number;
    sessionsToday?: number;
    completedToday?: boolean;
  }
): void {
  let metrics = streakData.get(event.streakLength);
  if (!metrics) {
    metrics = { streakLength: event.streakLength, userCount: 0, survivalRate: 0, averageSessionsPerDay: 0, completionRate: 0 };
  }

  switch (event.type) {
    case 'streak_start':
    case 'streak_extend':
      metrics.userCount++;
      break;
    case 'streak_break':
      metrics.userCount--;
      break;
    case 'streak_milestone':
      break;
  }

  const totalUsers = Array.from(streakData.values()).reduce((sum, m) => sum + m.userCount, 0);
  if (totalUsers > 0) {metrics.survivalRate = metrics.userCount / totalUsers;}

  streakData.set(event.streakLength, metrics);

  eventBus.publish('analytics:streak', { userId, event: event.type, data: { streakLength: event.streakLength, metrics } });
}

export function getStreakSurvivalMetrics(): StreakSurvivalMetrics[] {
  return Array.from(streakData.values()).sort((a, b) => a.streakLength - b.streakLength);
}
