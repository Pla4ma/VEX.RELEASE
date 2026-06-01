/**
 * Integration Event Definitions
 *
 * Event interfaces for cross-system integration: session rewards,
 * session challenges, session social, and economy-progression bridges.
 */

export type IntegrationEventType =
  | 'integration:session_rewards'
  | 'integration:session_challenges'
  | 'integration:session_social'
  | 'integration:economy_progression';

export interface IntegrationSessionRewardsEvent {
  sessionId: string;
  userId: string;
  rewards: {
    xp: number;
    coins: number;
    gems: number;
    chestTier?: string;
    bonusItemId?: string;
  };
  streak: { days: number; multiplier: number; increased: boolean };
  purity: { score: number; label: string; perfectFocus: boolean };
  timestamp: number;
}

export interface IntegrationSessionChallengesEvent {
  sessionId: string;
  userId: string;
  challengesProgressed: Array<{
    challengeId: string;
    progressDelta: number;
    completed: boolean;
  }>;
  achievementsUnlocked: string[];
  milestonesReached: string[];
}

export interface IntegrationSessionSocialEvent {
  sessionId: string;
  userId: string;
  activityId: string;
  squadNotified: boolean;
  guildNotified: boolean;
  feedPosted: boolean;
  notificationsSent: string[];
}

export interface IntegrationEconomyProgressionEvent {
  userId: string;
  transaction: {
    type: 'earn' | 'spend';
    currency: string;
    amount: number;
    source: string;
  };
  levelImpact?: { previousLevel: number; newLevel: number; xpGained: number };
}
