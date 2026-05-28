export interface Reward {
  id: string;
  type: "DAILY_LOGIN" | "STREAK_BONUS" | "ACHIEVEMENT" | "LEVEL_UP" | "SPECIAL";
  title: string;
  description: string;
  rewards: { coins?: number; gems?: number; special?: number; xp?: number };
  requirements?: {
    minLevel?: number;
    minStreak?: number;
    achievementId?: string;
  };
  expiresAt?: string;
  claimedAt?: string;
}

export interface ClaimableReward {
  reward: Reward;
  isAvailable: boolean;
  isClaimed: boolean;
  timeUntilAvailable?: number;
}

export function generateRewards(): Reward[] {
  const rewards: Reward[] = [];
  rewards.push({
    id: "daily_login",
    type: "DAILY_LOGIN",
    title: "Daily Login Bonus",
    description: "Claim your daily reward for logging in!",
    rewards: { coins: 50, xp: 25 },
  });
  rewards.push(
    {
      id: "streak_3",
      type: "STREAK_BONUS",
      title: "3-Day Streak Bonus",
      description: "Maintain a 3-day streak for bonus rewards!",
      rewards: { coins: 100, gems: 5 },
      requirements: { minStreak: 3 },
    },
    {
      id: "streak_7",
      type: "STREAK_BONUS",
      title: "7-Day Streak Bonus",
      description: "One week streak! Excellent consistency!",
      rewards: { coins: 300, gems: 15, special: 1 },
      requirements: { minStreak: 7 },
    },
    {
      id: "streak_30",
      type: "STREAK_BONUS",
      title: "30-Day Streak Master",
      description: "Incredible dedication! You're a focus master!",
      rewards: { coins: 1000, gems: 50, special: 5 },
      requirements: { minStreak: 30 },
    },
  );
  for (let level = 5; level <= 50; level += 5) {
    rewards.push({
      id: `level_${level}`,
      type: "LEVEL_UP",
      title: `Level ${level} Milestone`,
      description: `Congratulations on reaching level ${level}!`,
      rewards: { coins: level * 20, gems: Math.floor(level / 5) },
      requirements: { minLevel: level },
    });
  }
  return rewards;
}
