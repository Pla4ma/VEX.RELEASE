import {
  SessionCompletedEvent,
  SessionPerformanceCalculatedEvent,
  SessionMilestoneReachedEvent,
  SessionRewardsCalculatedEvent,
  SessionAchievementUnlockedEvent,
  SessionCompletionEventType,
} from './types';

export function validateSessionCompletionEvent(
  event: SessionCompletionEventType,
): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }
  if (!event.type || !event.data || !event.metadata) {
    return false;
  }
  switch (event.type) {
    case 'session_completed':
      return validateSessionCompletedEvent(event as SessionCompletedEvent);
    case 'session_performance_calculated':
      return validateSessionPerformanceCalculatedEvent(
        event as SessionPerformanceCalculatedEvent,
      );
    case 'session_rewards_calculated':
      return validateSessionRewardsCalculatedEvent(
        event as SessionRewardsCalculatedEvent,
      );
    case 'session_achievement_unlocked':
      return validateSessionAchievementUnlockedEvent(
        event as SessionAchievementUnlockedEvent,
      );
    case 'session_milestone_reached':
      return validateSessionMilestoneReachedEvent(
        event as SessionMilestoneReachedEvent,
      );
    default:
      return true;
  }
}
function validateSessionCompletedEvent(event: SessionCompletedEvent): boolean {
  const { data } = event;
  return !!(
    data.completionType &&
    data.completionTime &&
    typeof data.duration === 'number' &&
    data.objectives &&
    data.performance &&
    data.conditions
  );
}
function validateSessionPerformanceCalculatedEvent(
  event: SessionPerformanceCalculatedEvent,
): boolean {
  const { data } = event;
  return !!(data.performanceMetrics && data.benchmarks && data.analysis);
}
function validateSessionRewardsCalculatedEvent(
  event: SessionRewardsCalculatedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.baseRewards &&
    data.performanceBonus &&
    data.completionBonus &&
    data.specialRewards &&
    data.totalRewards
  );
}
function validateSessionAchievementUnlockedEvent(
  event: SessionAchievementUnlockedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.achievementId &&
    data.achievementName &&
    data.achievementType &&
    data.progress &&
    data.criteria &&
    data.rarity &&
    typeof data.points === 'number' &&
    data.rewards &&
    data.recognition
  );
}
function validateSessionMilestoneReachedEvent(
  event: SessionMilestoneReachedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.milestoneId &&
    data.milestoneType &&
    data.milestoneName &&
    typeof data.value === 'number' &&
    typeof data.target === 'number' &&
    typeof data.previousRecord === 'number' &&
    data.significance &&
    data.recognition &&
    data.rewards
  );
}
export function serializeSessionCompletionEvent(
  event: SessionCompletionEventType,
): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}
export function deserializeSessionCompletionEvent(
  data: string,
): SessionCompletionEventType {
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}
