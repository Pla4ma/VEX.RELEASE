/**
 * Daily Login Rewards System
 * Progressive D1-D7 ladder with escalating rewards
 * Break streak = reset to Day 1 (creates urgency)
 * Core retention mechanic for 10/10 product
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const DailyRewardTierSchema = z.enum([
  'DAY_1',
  'DAY_2',
  'DAY_3',
  'DAY_4',
  'DAY_5',
  'DAY_6',
  'DAY_7',
]);

export const DailyRewardItemSchema = z.object({
  type: z.enum(['COINS', 'GEMS', 'ITEM', 'XP_BOOST', 'STREAK_SHIELD', 'CHEST']),
  amount: z.number().int().min(0),
  itemId: z.string().nullable(),
  chestType: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).nullable(),
});

export const DailyRewardDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  tier: DailyRewardTierSchema,
  items: z.array(DailyRewardItemSchema),
  bonusDescription: z.string(),
  isPremium: z.boolean().default(false),
  claimableAt: z.number(),
  expiresAt: z.number(),
});

export const UserDailyRewardsStateSchema = z.object({
  userId: z.string().uuid(),
  currentStreak: z.number().int().min(0),
  lastClaimedAt: z.number().nullable(),
  lastClaimedDay: z.number().int().min(0).max(7),
  todaysReward: DailyRewardDaySchema.nullable(),
  hasClaimedToday: z.boolean(),
  canClaimToday: z.boolean(),
  streakAtRisk: z.boolean(),
  nextResetInHours: z.number(),
});

// ============================================================================
// Reward Configuration
// ============================================================================

const REWARD_LADDER: Array<{
  day: number;
  tier: string;
  freeRewards: Array<{ type: string; amount: number }>;
  premiumRewards: Array<{ type: string; amount: number }>;
  bonusDescription: string;
}> = [
  {
    day: 1,
    tier: 'DAY_1',
    freeRewards: [{ type: 'COINS', amount: 100 }],
    premiumRewards: [{ type: 'COINS', amount: 200 }, { type: 'GEMS', amount: 5 }],
    bonusDescription: 'Welcome back!',
  },
  {
    day: 2,
    tier: 'DAY_2',
    freeRewards: [{ type: 'COINS', amount: 200 }],
    premiumRewards: [{ type: 'COINS', amount: 400 }, { type: 'GEMS', amount: 10 }],
    bonusDescription: 'Building momentum!',
  },
  {
    day: 3,
    tier: 'DAY_3',
    freeRewards: [{ type: 'COINS', amount: 300 }, { type: 'STREAK_SHIELD', amount: 1 }],
    premiumRewards: [{ type: 'COINS', amount: 600 }, { type: 'GEMS', amount: 15 }, { type: 'STREAK_SHIELD', amount: 2 }],
    bonusDescription: 'Halfway to weekly bonus!',
  },
  {
    day: 4,
    tier: 'DAY_4',
    freeRewards: [{ type: 'COINS', amount: 400 }],
    premiumRewards: [{ type: 'COINS', amount: 800 }, { type: 'GEMS', amount: 20 }],
    bonusDescription: 'So close!',
  },
  {
    day: 5,
    tier: 'DAY_5',
    freeRewards: [{ type: 'COINS', amount: 500 }, { type: 'CHEST', amount: 1 }],
    premiumRewards: [{ type: 'COINS', amount: 1000 }, { type: 'GEMS', amount: 25 }, { type: 'CHEST', amount: 2 }],
    bonusDescription: 'Weekend warrior bonus!',
  },
  {
    day: 6,
    tier: 'DAY_6',
    freeRewards: [{ type: 'COINS', amount: 600 }],
    premiumRewards: [{ type: 'COINS', amount: 1200 }, { type: 'GEMS', amount: 30 }],
    bonusDescription: 'One more day!',
  },
  {
    day: 7,
    tier: 'DAY_7',
    freeRewards: [
      { type: 'COINS', amount: 1000 },
      { type: 'GEMS', amount: 50 },
      { type: 'CHEST', amount: 1 },
    ],
    premiumRewards: [
      { type: 'COINS', amount: 2000 },
      { type: 'GEMS', amount: 100 },
      { type: 'CHEST', amount: 3 },
      { type: 'ITEM', amount: 1 },
    ],
    bonusDescription: '🎉 WEEKLY BONUS UNLOCKED!',
  },
];

const STREAK_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours to claim before streak resets
const CLAIM_WINDOW_MS = 24 * 60 * 60 * 1000; // Must claim within 24 hours of it becoming available

// ============================================================================
// Types
// ============================================================================

export type DailyRewardTier = z.infer<typeof DailyRewardTierSchema>;
export type DailyRewardItem = z.infer<typeof DailyRewardItemSchema>;
export type DailyRewardDay = z.infer<typeof DailyRewardDaySchema>;
export type UserDailyRewardsState = z.infer<typeof UserDailyRewardsStateSchema>;

// ============================================================================
// Reward State Management
// ============================================================================

export function calculateCurrentRewardDay(
  currentStreak: number,
  lastClaimedAt: number | null,
  now: number = Date.now()
): { day: number; streakAtRisk: boolean; hoursRemaining: number } {
  // If never claimed, start at day 1
  if (!lastClaimedAt) {
    return { day: 1, streakAtRisk: false, hoursRemaining: 48 };
  }

  const timeSinceLastClaim = now - lastClaimedAt;
  
  // Check if streak is broken (> 48 hours since last claim)
  if (timeSinceLastClaim > STREAK_WINDOW_MS) {
    return { day: 1, streakAtRisk: false, hoursRemaining: 48 };
  }

  // Check if within streak window but late
  const hoursSinceLastClaim = timeSinceLastClaim / (60 * 60 * 1000);
  const hoursRemaining = Math.max(0, 48 - hoursSinceLastClaim);
  const streakAtRisk = hoursRemaining < 12;

  // Calculate next day (1-7 cycle)
  const nextDay = Math.min(7, currentStreak + 1);
  
  return { day: nextDay, streakAtRisk, hoursRemaining };
}

export function buildDailyRewardDay(
  day: number,
  isPremium: boolean,
  claimableAt: number,
  expiresAt: number
): DailyRewardDay {
  const config = REWARD_LADDER[day - 1];
  if (!config) {
    throw new Error(`Invalid reward day: ${day}`);
  }

  const items: DailyRewardItem[] = [
    ...config.freeRewards.map((reward) =>
      DailyRewardItemSchema.parse({
        type: reward.type as DailyRewardItem['type'],
        amount: reward.amount,
        itemId: null,
        chestType: reward.type === 'CHEST' ? 'COMMON' : null,
      })
    ),
  ];

  if (isPremium) {
    items.push(
      ...config.premiumRewards.map((reward) =>
        DailyRewardItemSchema.parse({
          type: reward.type as DailyRewardItem['type'],
          amount: reward.amount,
          itemId: null,
          chestType: reward.type === 'CHEST' ? 'RARE' : null,
        })
      )
    );
  }

  return DailyRewardDaySchema.parse({
    day,
    tier: config.tier as DailyRewardTier,
    items,
    bonusDescription: config.bonusDescription,
    isPremium,
    claimableAt,
    expiresAt,
  });
}

// ============================================================================
// Claim Logic
// ============================================================================

export async function claimDailyReward(
  userId: string,
  state: UserDailyRewardsState,
  isPremium: boolean,
  repository: {
    saveRewardState: (state: UserDailyRewardsState) => Promise<void>;
    recordRewardClaim: (claim: {
      userId: string;
      day: number;
      items: DailyRewardItem[];
      claimedAt: number;
    }) => Promise<void>;
  }
): Promise<{
  success: boolean;
  rewards: DailyRewardItem[];
  newStreak: number;
  nextDay: number;
  streakReset: boolean;
  error?: string;
}> {
  try {
    // Check if already claimed today
    if (state.hasClaimedToday) {
      return {
        success: false,
        rewards: [],
        newStreak: state.currentStreak,
        nextDay: state.lastClaimedDay,
        streakReset: false,
        error: 'Already claimed today',
      };
    }

    // Check if can claim
    if (!state.canClaimToday) {
      return {
        success: false,
        rewards: [],
        newStreak: state.currentStreak,
        nextDay: state.lastClaimedDay,
        streakReset: false,
        error: 'Not eligible to claim yet',
      };
    }

    // Build reward for today
    const { day } = calculateCurrentRewardDay(
      state.currentStreak,
      state.lastClaimedAt
    );
    
    const rewardDay = buildDailyRewardDay(
      day,
      isPremium,
      Date.now(),
      Date.now() + CLAIM_WINDOW_MS
    );

    // Update state
    const newStreak = day === 7 ? 0 : day; // Reset after day 7
    const updatedState: UserDailyRewardsState = {
      ...state,
      currentStreak: newStreak,
      lastClaimedAt: Date.now(),
      lastClaimedDay: day,
      hasClaimedToday: true,
      canClaimToday: false,
      todaysReward: rewardDay,
    };

    await repository.saveRewardState(updatedState);
    await repository.recordRewardClaim({
      userId,
      day,
      items: rewardDay.items,
      claimedAt: Date.now(),
    });

    // Publish events
    eventBus.publish('daily_reward:claimed', {
      userId,
      day,
      items: rewardDay.items,
      isPremium,
      newStreak,
    });

    // Day 7 celebration
    if (day === 7) {
      eventBus.publish('daily_reward:weekly_completed', {
        userId,
        weekNumber: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),
      });
    }

    Sentry.addBreadcrumb({
      category: 'daily_rewards',
      message: `Day ${day} reward claimed`,
      data: { userId, day, isPremium, items: rewardDay.items.length },
    });

    return {
      success: true,
      rewards: rewardDay.items,
      newStreak,
      nextDay: day === 7 ? 1 : day + 1,
      streakReset: day === 7,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'daily_rewards', action: 'claim' },
    });
    return {
      success: false,
      rewards: [],
      newStreak: state.currentStreak,
      nextDay: state.lastClaimedDay,
      streakReset: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// UI Helpers
// ============================================================================

export function getRewardPreview(day: number, isPremium: boolean): string {
  const config = REWARD_LADDER[day - 1];
  if (!config) return '';

  const freeTotal = config.freeRewards.reduce((sum, r) => sum + r.amount, 0);
  const premiumTotal = config.premiumRewards.reduce((sum, r) => sum + r.amount, 0);

  if (isPremium) {
    return `+${freeTotal + premiumTotal} coins, +${premiumTotal} gems`;
  }
  return `+${freeTotal} coins`;
}

export function formatDailyRewardUI(state: UserDailyRewardsState): {
  title: string;
  subtitle: string;
  urgency: 'NONE' | 'LOW' | 'HIGH';
  dayLabel: string;
} {
  const { day, streakAtRisk, hoursRemaining } = calculateCurrentRewardDay(
    state.currentStreak,
    state.lastClaimedAt
  );

  const config = REWARD_LADDER[day - 1];
  
  let urgency: 'NONE' | 'LOW' | 'HIGH' = 'NONE';
  if (streakAtRisk) urgency = 'HIGH';
  else if (state.currentStreak > 0) urgency = 'LOW';

  return {
    title: `Day ${day} Reward`,
    subtitle: streakAtRisk
      ? `⚠️ Claim in ${Math.floor(hoursRemaining)}h or lose streak!`
      : config?.bonusDescription || 'Daily bonus ready!',
    urgency,
    dayLabel: day === 7 ? '🎉 BONUS DAY' : `Day ${day} of 7`,
  };
}

// ============================================================================
// Background Job: Streak Reset Check
// ============================================================================

export async function processExpiredDailyStreaks(
  repository: {
    fetchUsersWithStreaks: () => Promise<Array<{ userId: string; lastClaimedAt: number; currentStreak: number }>>;
    resetStreak: (userId: string) => Promise<void>;
    sendNotification: (userId: string, notification: { title: string; body: string }) => Promise<void>;
  }
): Promise<string[]> {
  const users = await repository.fetchUsersWithStreaks();
  const resetUsers: string[] = [];
  const now = Date.now();

  for (const user of users) {
    if (!user.lastClaimedAt) continue;

    const timeSinceLastClaim = now - user.lastClaimedAt;
    
    if (timeSinceLastClaim > STREAK_WINDOW_MS && user.currentStreak > 0) {
      // Streak expired - reset to day 1
      await repository.resetStreak(user.userId);
      resetUsers.push(user.userId);

      // Send notification
      await repository.sendNotification(user.userId, {
        title: '💔 Daily Streak Reset',
        body: `Your ${user.currentStreak}-day login streak ended. Start fresh today!`,
      });

      eventBus.publish('daily_reward:streak_reset', {
        userId: user.userId,
        previousStreak: user.currentStreak,
        reason: 'TIMEOUT',
      });
    }
  }

  return resetUsers;
}
