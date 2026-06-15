import { eventBus } from '../events/EventBus';

export interface EngagementMetrics {
  userId: string;
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  totalFocusMinutes: number;
  avgSessionDuration: number;
  studyPlansCompleted: number;
  studyPlansStarted: number;
  bossBattlesCompleted: number;
  streakDays: number;
  weeklyActive: boolean;
  powerUser: boolean;
}

export const engagementData = new Map<string, EngagementMetrics>();

export function recordEngagementEvent(
  userId: string,
  event: {
    type:
      | 'session_complete'
      | 'plan_start'
      | 'plan_complete'
      | 'boss_defeat'
      | 'streak_milestone';
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
        metrics.avgSessionDuration =
          metrics.totalFocusMinutes / metrics.sessionsLast30Days;
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
  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;
  engagementData.set(userId, metrics);
  eventBus.publish('analytics:engagement', {
    userId,
    event: event.type,
    metrics,
  });
}

export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  return users.reduce((sum, u) => sum + u.sessionsLast7Days, 0) / users.length;
}

export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  const totalStarted = users.reduce((sum, u) => sum + u.studyPlansStarted, 0);
  const totalCompleted = users.reduce(
    (sum, u) => sum + u.studyPlansCompleted,
    0,
  );
  if (totalStarted === 0) {
    return 0;
  }
  return totalCompleted / totalStarted;
}

export function calculatePowerUserPercentage(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  const powerUsers = users.filter((u) => u.powerUser).length;
  return powerUsers / users.length;
}
