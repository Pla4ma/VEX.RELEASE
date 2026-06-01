import type { SessionMilestoneReachedEvent } from './types';
import { generateEventId, createEventMetadata } from './event-helpers';

export function createSessionMilestoneReachedEvent(
  userId: string,
  sessionId: string,
  milestoneId: string,
  milestoneType:
    | 'score'
    | 'streak'
    | 'accuracy'
    | 'speed'
    | 'completion'
    | 'special',
  milestoneName: string,
  value: number,
  target: number,
  previousRecord: number,
  significance: 'personal' | 'session' | 'daily' | 'weekly' | 'all_time',
): SessionMilestoneReachedEvent {
  return {
    id: generateEventId(),
    type: 'session_milestone_reached',
    userId,
    sessionId,
    timestamp: new Date(),
    data: {
      milestoneId,
      milestoneType,
      milestoneName,
      achievedAt: new Date(),
      value,
      target,
      previousRecord,
      improvement: value - previousRecord,
      significance,
      recognition: {
        badge: `${milestoneId}_badge`,
        title: `${milestoneName} Achiever`,
        celebration: true,
        shareable: true,
      },
      rewards: {
        experience: Math.floor((value / target) * 100),
        currency: Math.floor((value / target) * 50),
        items: [],
        unlocks: [],
      },
    },
    metadata: createEventMetadata('session-completion'),
  };
}
