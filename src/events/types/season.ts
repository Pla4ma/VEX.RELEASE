/**
 * Season Events
 */

export interface SeasonEventDefinitions {
  'season:activated': {
    seasonId: string;
    name: string;
  };
  'season:progress:initialized': {
    userId: string;
    seasonId: string;
    timestamp?: number;
  };
  'season:tier_unlocked': {
    userId: string;
    seasonId: string;
    tier: number;
    tierXp?: number;
    totalXp?: number;
    isPremium?: boolean;
    timestamp?: number;
    source?: string;
  };
  'season:tier:claimed': {
    userId: string;
    seasonId: string;
    tier?: number;
    tierId?: string;
    rewards?: Array<{
      type: string;
      amount?: number;
      itemId?: string;
    }>;
    timestamp?: number;
  };
  'season:premium:purchased': {
    userId: string;
    seasonId: string;
    tier?: number;
    gemsSpent?: number;
    gemsDeducted?: number;
    timestamp?: number;
    paymentMethod?: string;
  };
  'season:completed': {
    userId: string;
    seasonId: string;
    finalTier: number;
    finalRank: number;
    timestamp: number;
  };
  'season:check_objectives': {
    userId: string;
    eventType: string;
    data: Record<string, unknown>;
  };
  'season:currency_earned': {
    userId: string;
    currency: string;
    amount: number;
  };
  'season:ended': {
    userId?: string;
    seasonId: string;
    name?: string;
    finalTier?: number;
    gracePeriodEnds?: number;
  };
  'season:almost_ending': {
    seasonId: string;
    daysRemaining: number;
  };
  'season:created': {
    seasonId: string;
    name: string;
    startAt: number;
    endAt?: number;
  };
  'season:updated': {
    seasonId: string;
    changes: Record<string, unknown>;
  };
  'season:archived': {
    seasonId: string;
    name: string;
  };
  'seasons:health_check': {
    status?: string;
    timestamp?: number;
  };
  'seasons:challenge_progress': {
    userId: string;
    challengeId: string;
    progress: number;
    completed: boolean;
  };
}
