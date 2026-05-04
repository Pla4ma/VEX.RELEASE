/**
 * Anticipation Engine - Drives Retention Through Dopamine Loops
 *
 * Core insight: The brain releases more dopamine ANTICIPATING a reward
 * than receiving it. We engineer anticipation into every interaction.
 */

import { eventBus } from '../events';

// ============================================================================
// Variable Reward Schedule (The Slot Machine Effect)
// ============================================================================

export interface VariableReward {
  type: 'COINS' | 'ITEM' | 'XP_BOOST' | 'CHEST' | 'COSMETIC' | 'TITLE';
  minAmount: number;
  maxAmount: number;
  rarityWeights: Record<'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY', number>;
  message: string;
}

export const VARIABLE_REWARDS: Record<string, VariableReward> = {
  SESSION_COMPLETE: {
    type: 'COINS',
    minAmount: 50,
    maxAmount: 500,
    rarityWeights: { COMMON: 60, UNCOMMON: 25, RARE: 10, EPIC: 4, LEGENDARY: 1 },
    message: 'Focus Bonus!',
  },
  STREAK_MILESTONE: {
    type: 'CHEST',
    minAmount: 1,
    maxAmount: 1,
    rarityWeights: { COMMON: 0, UNCOMMON: 40, RARE: 35, EPIC: 20, LEGENDARY: 5 },
    message: 'Streak Chest!',
  },
  BOSS_DEFEAT: {
    type: 'ITEM',
    minAmount: 1,
    maxAmount: 3,
    rarityWeights: { COMMON: 50, UNCOMMON: 30, RARE: 15, EPIC: 4, LEGENDARY: 1 },
    message: 'Boss Drop!',
  },
};

export function calculateVariableReward(
  rewardType: keyof typeof VARIABLE_REWARDS,
  userLuckModifier: number = 1
): { amount: number; rarity: string; surprise: boolean } {
  const config = VARIABLE_REWARDS[rewardType];

  // Base amount with variance
  const baseAmount = Math.floor(
    config.minAmount + Math.random() * (config.maxAmount - config.minAmount)
  );

  // Rarity roll with luck modifier
  const roll = Math.random() / userLuckModifier;
  let rarity: string = 'COMMON';
  let surprise = false;

  const weights = config.rarityWeights;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let cumulative = 0;

  for (const [r, w] of Object.entries(weights)) {
    cumulative += w / total;
    if (roll <= cumulative) {
      rarity = r;
      // If rare+ drop, it's a "surprise" (dopamine hit)
      surprise = ['RARE', 'EPIC', 'LEGENDARY'].includes(r);
      break;
    }
  }

  return {
    amount: baseAmount * (rarity === 'LEGENDARY' ? 5 : rarity === 'EPIC' ? 3 : 1),
    rarity,
    surprise,
  };
}

// ============================================================================
// Anticipation Builder (Countdown Psychology)
// ============================================================================

export interface AnticipationEvent {
  id: string;
  type: 'DAILY_REWARD' | 'RAID_START' | 'DUNGEON_RESET' | 'STREAK_DEADLINE';
  targetTime: number;
  previewReward: string;
  urgencyMessages: string[];
}

export function buildAnticipation(event: AnticipationEvent): {
  timeRemaining: string;
  urgencyLevel: 'NONE' | 'BUILDING' | 'HIGH' | 'CRITICAL';
  message: string;
  progressPercent: number;
} {
  const now = Date.now();
  const remaining = event.targetTime - now;
  const totalDuration = 24 * 60 * 60 * 1000; // 24 hours baseline
  const progressPercent = 100 - (remaining / totalDuration) * 100;

  let urgencyLevel: 'NONE' | 'BUILDING' | 'HIGH' | 'CRITICAL' = 'NONE';
  let message = '';

  if (remaining > 12 * 60 * 60 * 1000) {
    // > 12 hours
    urgencyLevel = 'NONE';
    message = `${event.previewReward} coming soon...`;
  } else if (remaining > 2 * 60 * 60 * 1000) {
    // 2-12 hours
    urgencyLevel = 'BUILDING';
    message = event.urgencyMessages[0] || 'Almost there!';
  } else if (remaining > 30 * 60 * 1000) {
    // 30 min - 2 hours
    urgencyLevel = 'HIGH';
    message = event.urgencyMessages[1] || 'Get ready!';
  } else {
    // < 30 min
    urgencyLevel = 'CRITICAL';
    message = event.urgencyMessages[2] || 'NOW NOW NOW!';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  return {
    timeRemaining: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    urgencyLevel,
    message,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
  };
}

// ============================================================================
// Loss Aversion Engine (FOMO)
// ============================================================================

export interface LossAversionTrigger {
  type: 'STREAK_AT_RISK' | 'DUNGEON_EXPIRING' | 'RAID_MISSED' | 'REWARD_FORFEIT';
  potentialLoss: string;
  preventAction: string;
  urgency: number; // 0-100
}

export function generateLossAversion(userState: {
  streakDays: number;
  lastSessionAt: number;
  activeInsurance: boolean;
  comebackTokens: number;
}): LossAversionTrigger | null {
  const hoursSinceSession = (Date.now() - userState.lastSessionAt) / (60 * 60 * 1000);

  // Critical: Streak about to break
  if (userState.streakDays > 3 && hoursSinceSession > 20) {
    return {
      type: 'STREAK_AT_RISK',
      potentialLoss: `${userState.streakDays} day streak`,
      preventAction: userState.activeInsurance
        ? 'Insurance will activate automatically'
        : userState.comebackTokens > 0
        ? 'Use Comeback Token'
        : 'Start session NOW',
      urgency: Math.min(100, (hoursSinceSession - 20) * 10),
    };
  }

  return null;
}

// ============================================================================
// Investment Loop (Sunk Cost Psychology)
// ============================================================================

export interface InvestmentDisplay {
  timeInvested: string;
  sessionsCompleted: number;
  bossesDefeated: number;
  streakRecord: number;
  masteryProgress: number;
  message: string;
}

export function calculateInvestment(userStats: {
  totalSessions: number;
  totalMinutes: number;
  bossesDefeated: number;
  maxStreak: number;
  masteryLevel: number;
}): InvestmentDisplay {
  const hours = Math.floor(userStats.totalMinutes / 60);
  const days = Math.floor(hours / 24);

  let timeInvested = '';
  if (days > 0) {
    timeInvested = `${days} days, ${hours % 24} hours`;
  } else if (hours > 0) {
    timeInvested = `${hours} hours`;
  } else {
    timeInvested = `${userStats.totalMinutes} minutes`;
  }

  // Investment message (sunk cost + pride)
  let message = '';
  if (days > 30) {
    message = `You've invested ${days} days. You're a Focus Master!`;
  } else if (days > 7) {
    message = `${days} days of focus. You're building something special.`;
  } else {
    message = 'Every session builds your focus muscle. Keep going!';
  }

  return {
    timeInvested,
    sessionsCompleted: userStats.totalSessions,
    bossesDefeated: userStats.bossesDefeated,
    streakRecord: userStats.maxStreak,
    masteryProgress: userStats.masteryLevel,
    message,
  };
}

// ============================================================================
// Social Proof Engine
// ============================================================================

export interface SocialProof {
  type: 'FRIENDS_ACTIVE' | 'SQUAD_PROGRESS' | 'GLOBAL_COMPARISON' | 'RECENT_WINS';
  message: string;
  comparison: string;
  motivation: string;
}

export function generateSocialProof(
  userContext: {
    friendsActive: number;
    squadMatesProgressing: boolean;
    userPercentile: number;
    recentFriendWins: string[];
  }
): SocialProof | null {
  // Priority: Friends active > Squad progress > Global comparison

  if (userContext.friendsActive > 0) {
    return {
      type: 'FRIENDS_ACTIVE',
      message: `${userContext.friendsActive} friend${userContext.friendsActive > 1 ? 's are' : ' is'} focusing right now`,
      comparison: 'Join them!',
      motivation: 'Social accountability boosts focus by 65%',
    };
  }

  if (userContext.squadMatesProgressing) {
    return {
      type: 'SQUAD_PROGRESS',
      message: 'Your squad is climbing the ranks',
      comparison: 'You\'re falling behind!',
      motivation: 'Help your squad reach the next tier',
    };
  }

  if (userContext.userPercentile < 50) {
    return {
      type: 'GLOBAL_COMPARISON',
      message: `You're in the top ${userContext.userPercentile}% of focus warriors`,
      comparison: 'Top 10% unlocks exclusive rewards',
      motivation: 'Push harder to join the elite',
    };
  }

  return null;
}

// ============================================================================
// Perfect Timing Engine (When to notify)
// ============================================================================

export interface NotificationTiming {
  shouldNotify: boolean;
  channel: 'PUSH' | 'IN_APP' | 'SMS' | 'NONE';
  message: string;
  urgency: number;
  optimalTime: number; // timestamp
}

export function calculateOptimalNotification(
  userPatterns: {
    avgSessionTime: number; // hour of day
    lastNotificationAt: number;
    notificationResponseRate: number;
    currentStreak: number;
  },
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): NotificationTiming {
  const now = Date.now();
  const hour = new Date().getHours();

  // Don't spam - respect cooldown
  if (now - userPatterns.lastNotificationAt < 2 * 60 * 60 * 1000) {
    return { shouldNotify: false, channel: 'NONE', message: '', urgency: 0, optimalTime: 0 };
  }

  // Find optimal time based on user's pattern
  const optimalHour = userPatterns.avgSessionTime;
  const hoursUntilOptimal = (optimalHour - hour + 24) % 24;
  const optimalTime = now + hoursUntilOptimal * 60 * 60 * 1000;

  // Determine channel based on urgency and response rate
  let channel: 'PUSH' | 'IN_APP' | 'SMS' | 'NONE' = 'PUSH';

  if (urgency === 'CRITICAL' && userPatterns.notificationResponseRate > 0.3) {
    channel = 'PUSH';
  } else if (urgency === 'HIGH') {
    channel = 'IN_APP';
  } else {
    channel = 'NONE'; // Wait for optimal time
  }

  const messages: Record<string, string[]> = {
    LOW: ['Ready for a session?', 'Your streak is waiting'],
    MEDIUM: ['Time to focus!', 'Don\'t break the chain'],
    HIGH: ['⚠️ Streak ends in 2 hours!', 'URGENT: Focus now'],
    CRITICAL: ['🚨 STREAK ABOUT TO BREAK!', 'START NOW OR LOSE EVERYTHING'],
  };

  return {
    shouldNotify: urgency !== 'LOW',
    channel,
    message: messages[urgency][Math.floor(Math.random() * messages[urgency].length)],
    urgency: urgency === 'CRITICAL' ? 100 : urgency === 'HIGH' ? 75 : urgency === 'MEDIUM' ? 50 : 25,
    optimalTime,
  };
}

// ============================================================================
// Habit Stacking Integration
// ============================================================================

export function suggestHabitStack(userContext: {
  lastSessionTime: number;
  typicalSessionDuration: number;
  currentLocation?: string;
}): { trigger: string; action: string; timing: string } | null {
  const hour = new Date().getHours();

  // Morning routine
  if (hour >= 6 && hour <= 9) {
    return {
      trigger: 'After coffee',
      action: '25-min Deep Work session',
      timing: 'Right now - morning focus is 3x more effective',
    };
  }

  // Lunch break
  if (hour >= 11 && hour <= 13) {
    return {
      trigger: 'Before lunch',
      action: 'Quick Sprint session',
      timing: 'Knock out a task before you eat',
    };
  }

  // Evening
  if (hour >= 18 && hour <= 21) {
    return {
      trigger: 'After dinner',
      action: 'Study session to lock in learning',
      timing: 'Evening review improves retention by 40%',
    };
  }

  return null;
}
