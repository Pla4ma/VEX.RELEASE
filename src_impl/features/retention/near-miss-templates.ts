export interface InterventionTemplate {
  headline: string;
  body: string;
  primaryAction: string;
  incentive?: { type: string; amount: number };
  urgency: string;
}

export interface NearMissContext {
  sessionProgress?: number;
  streakHoursRemaining?: number;
  minutesBackgrounded?: number;
  challengeProgress?: number;
  bossFleeHours?: number;
  daysSinceLastLogin?: number;
}

export interface NearMissPersonalization {
  userName?: string;
  streakDays?: number;
  sessionCount?: number;
  lastInterventionTime?: number;
}

export interface AbandonmentCheck {
  shouldIntervene: boolean;
  intervention: import('./near-miss-hooks').NearMissIntervention | null;
  progressPercent: number;
}

export interface StreakEmergencyCheck {
  isEmergency: boolean;
  intervention: import('./near-miss-hooks').NearMissIntervention | null;
  minutesRemaining: number;
}

export interface BackgroundReturnCheck {
  shouldReward: boolean;
  xpBonusMultiplier: number;
  message: string;
}

export interface NearMissRepository {
  fetchUsersWithAtRiskStreaks: () => Promise<
    Array<{ userId: string; hoursRemaining: number; streakDays: number }>
  >;
  fetchUsersWithAbandonedSessions: () => Promise<
    Array<{ userId: string; sessionId: string; progress: number }>
  >;
}

export const INTERVENTION_TEMPLATES: Record<string, InterventionTemplate[]> = {
  SESSION_ABANDON_80_PERCENT: [
    {
      headline: 'So close!',
      body: "You're at 80% completion. Finish now for a 2x XP Comeback Bonus!",
      primaryAction: 'Complete Session',
      incentive: { type: 'XP_BONUS', amount: 2.0 },
      urgency: 'HIGH',
    },
    {
      headline: "Don't let it slip!",
      body: 'Only a few minutes left. Your streak thanks you for finishing!',
      primaryAction: 'Push Through',
      urgency: 'MEDIUM',
    },
  ],
  STREAK_ABOUT_TO_BREAK: [
    {
      headline: 'STREAK EMERGENCY!',
      body: 'Your streak expires in 30 minutes! Start a 5-minute Sprint Save now!',
      primaryAction: 'Sprint Save (5 min)',
      incentive: { type: 'STREAK_SAVE', amount: 1 },
      urgency: 'CRITICAL',
    },
    {
      headline: 'Your streak needs you!',
      body: 'Hours left to save your streak. One quick session is all it takes!',
      primaryAction: 'Quick Session',
      urgency: 'HIGH',
    },
  ],
  APP_BACKGROUND_LONG: [
    {
      headline: 'Missed you!',
      body: "You left mid-session. Come back and we'll add +50% XP as a welcome back bonus!",
      primaryAction: 'Resume Session',
      incentive: { type: 'XP_BONUS', amount: 1.5 },
      urgency: 'MEDIUM',
    },
  ],
  CHALLENGE_ABANDON: [
    {
      headline: 'Challenge slipping away!',
      body: "You're so close to completing your challenge. Finish it now for bonus gems!",
      primaryAction: 'Complete Challenge',
      incentive: { type: 'GEM_BONUS', amount: 10 },
      urgency: 'HIGH',
    },
  ],
  BOSS_FLEE_WARNING: [
    {
      headline: 'Boss is escaping!',
      body: 'The boss flees in 2 hours! One more hit defeats it. +25 gems if you win!',
      primaryAction: 'Defeat Boss',
      incentive: { type: 'GEM_BONUS', amount: 25 },
      urgency: 'CRITICAL',
    },
  ],
  DAILY_REWARD_MISSED: [
    {
      headline: 'Comeback Bonus!',
      body: "You missed a day, but we're giving you 2x rewards today to catch up!",
      primaryAction: 'Claim 2x Reward',
      incentive: { type: 'COMEBACK_BOOST', amount: 2.0 },
      urgency: 'MEDIUM',
    },
  ],
};
