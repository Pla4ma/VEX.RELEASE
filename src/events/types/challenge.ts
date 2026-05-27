/**
 * @deprecated BLOCKED by VEX Phase 14. Old economy event definitions.
 * Kept for event payload type compatibility only. No new code should publish these events.
 */
/**
 * Challenge Events
 */

export interface ChallengeEventDefinitions {
  "event:created": { eventId: string; title: string; type: string };
  "event:joined": { userId: string; eventId: string; joinedAt: number };
  "event:left": { userId: string; eventId: string };
  "event:all_challenges_complete": {
    userId?: string;
    eventId: string;
    completedAt: number;
  };
  "challenge:assigned": {
    userId: string;
    challengeId: string;
    type: string;
    assignedAt: number;
  };
  "challenge:completed": {
    userId: string;
    challengeId: string;
    completedAt: number;
  };
  "challenge:weekly_completed": {
    userId: string;
    challengeId: string;
    completedAt: number;
  };
  "challenge:progress": {
    userId: string;
    challengeId: string;
    progress: number;
    target: number;
    percent: number;
  };
  "challenge:reward_claimed": {
    userId?: string;
    challengeId: string;
    claimedAt: number;
  };
  "challenge:rerolled": {
    userId: string;
    oldChallengeId: string;
    newChallengeId: string;
    wasPaid: boolean;
    gemsSpent: number;
  };
  "challenges:check_level": { userId?: string; level: number };
  "challenges:check_progress": {
    userId: string;
    challengeIds: string[];
    progress: {
      sessionsCompleted: number;
      duration: number;
      xpEarned: number;
    };
  };
  "challenges:check_economy": {
    userId: string;
    currency: string;
    amount: number;
    type: string;
  };
  "challenges:check_crafting": {
    userId: string;
    itemType: string;
    rarity: string;
  };
  "challenges:completed": {
    userId: string;
    challengeId: string;
    challengeType: string;
    rewards: {
      xp: number;
      coins: number;
      gems?: number;
      items?: string[];
    };
    completedAt: number;
  };
}
