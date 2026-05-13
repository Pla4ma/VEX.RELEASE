import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function getRewardPreview(day: number, isPremium: boolean): string {
  const config = REWARD_LADDER[day - 1];
  if (!config) {
    return '';
  }

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
  const { day, streakAtRisk, hoursRemaining } = calculateCurrentRewardDay(state.currentStreak, state.lastClaimedAt);

  const config = REWARD_LADDER[day - 1];

  let urgency: 'NONE' | 'LOW' | 'HIGH' = 'NONE';
  if (streakAtRisk) {
    urgency = 'HIGH';
  } else if (state.currentStreak > 0) {
    urgency = 'LOW';
  }

  return {
    title: `Day ${day} Reward`,
    subtitle: streakAtRisk ? `⚠️ Claim in ${Math.floor(hoursRemaining)}h or lose streak!` : config?.bonusDescription || 'Daily bonus ready!',
    urgency,
    dayLabel: day === 7 ? '🎉 BONUS DAY' : `Day ${day} of 7`,
  };
}

export async function processExpiredDailyStreaks(repository: { fetchUsersWithStreaks: () => Promise<Array<{ userId: string; lastClaimedAt: number; currentStreak: number }>>; resetStreak: (userId: string) => Promise<void>; sendNotification: (userId: string, notification: { title: string; body: string }) => Promise<void> }): Promise<string[]> {
  const users = await repository.fetchUsersWithStreaks();
  const resetUsers: string[] = [];
  const now = Date.now();

  for (const user of users) {
    if (!user.lastClaimedAt) {
      continue;
    }

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