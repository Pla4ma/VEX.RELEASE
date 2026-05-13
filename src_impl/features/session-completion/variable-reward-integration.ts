import { calculateSessionVariableReward, VariableRewardTier } from '../rewards/VariableRewardEngine';

export type VariableRewardSummary = {
  coinBonus: number;
  isNearMiss: boolean;
  rewardId: string | null;
  tier: VariableRewardTier;
  xpBonus: number;
};

export function rollSessionVariableReward(input: {
  baseCoins: number;
  grade: string;
  isPremium: boolean;
  sessionId: string;
  streakDays: number;
  userId: string;
}): VariableRewardSummary {
  const result = calculateSessionVariableReward(input.userId, input.baseCoins, {
    streakDays: input.streakDays,
    grade: input.grade,
    bossActive: false,
    isPremium: input.isPremium,
    squadMode: false,
  });
  const coinBonus = result.items
    .filter((item) => item.type === 'COINS')
    .reduce((sum, item) => sum + item.amount, 0);
  const xpBonus = result.items
    .filter((item) => item.type === 'XP_BOOST')
    .reduce((sum, item) => sum + item.amount * 20, 0);
  const isNearMiss = result.tier === VariableRewardTier.NONE && result.rollValue >= 0.55 && result.rollValue <= 0.72;

  return {
    coinBonus,
    isNearMiss,
    rewardId: result.tier === VariableRewardTier.NONE ? null : `variable:${input.sessionId}:${result.tier.toLowerCase()}`,
    tier: result.tier,
    xpBonus,
  };
}
