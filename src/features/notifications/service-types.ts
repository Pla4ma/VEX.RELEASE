export type UrgencyNotificationType =
  | 'STREAK_AT_RISK'
  | 'BOSS_ESCAPE_IMMINENT'
  | 'SQUAD_STREAK_AT_RISK'
  | 'RIVAL_PULLING_AHEAD'
  | 'CHEST_INVENTORY_FULL'
  | 'CHALLENGE_EXPIRING'
  | 'SEASON_ENDING_UNCLAIMED';

export type SocialNotificationType =
  | 'RIVAL_COMPLETED_SESSION'
  | 'SQUAD_MEMBER_NUDGE'
  | 'SQUAD_MILESTONE'
  | 'FEED_REACTION';

export interface NotificationContext {
  userId: string;
  streakRisk?: {
    hoursRemaining: number;
    streakDays: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  bossEscape?: {
    bossName: string;
    hoursRemaining: number;
    healthPercent: number;
  };
  squadStreak?: {
    squadName: string;
    streakDays: number;
    atRiskMemberName: string;
  };
  rivalUpdate?: {
    rivalName: string;
    theirNewSessionMinutes: number;
    myScore: number;
    theirScore: number;
  };
  chestStatus?: { unopenedCount: number; maxCapacity: number };
  challengeExpiry?: {
    challengeName: string;
    hoursRemaining: number;
    progressPercent: number;
  };
  seasonEnding?: { hoursRemaining: number; unclaimedTiers: number };
}

export interface NotificationMessage {
  title: string;
  body: string;
}

export interface NotificationRuleResult {
  shouldSend: boolean;
  priority: number;
  message: NotificationMessage;
}
