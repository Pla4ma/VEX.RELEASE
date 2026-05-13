import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export const DailyRewardTierSchema = z.enum(['DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5', 'DAY_6', 'DAY_7']);

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

export function calculateCurrentRewardDay(currentStreak: number, lastClaimedAt: number | null, now: number = Date.now()): { day: number; streakAtRisk: boolean; hoursRemaining: number } {
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

export function buildDailyRewardDay(day: number, isPremium: boolean, claimableAt: number, expiresAt: number): DailyRewardDay {
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
      }),
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
        }),
      ),
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

export async function claimDailyReward(
  userId: string,
  state: UserDailyRewardsState,
  isPremium: boolean,
  repository: {
    saveRewardState: (state: UserDailyRewardsState) => Promise<void>;
    recordRewardClaim: (claim: { userId: string; day: number; items: DailyRewardItem[]; claimedAt: number }) => Promise<void>;
  },
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
    const { day } = calculateCurrentRewardDay(state.currentStreak, state.lastClaimedAt);

    const rewardDay = buildDailyRewardDay(day, isPremium, Date.now(), Date.now() + CLAIM_WINDOW_MS);

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