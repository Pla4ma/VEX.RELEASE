export interface RewardCalculationResult {
  baseXP: number;
  baseCoins: number;
  baseGems: number;
  streakBonus: { xp: number; coins: number };
  qualityBonus: { xp: number; coins: number };
  difficultyBonus: { xp: number; coins: number };
  dailyModifierBonus: { xp: number; coins: number; modifierId: string | null };
  timeBonus: { xp: number; coins: number };
  perfectSessionBonus: { xp: number; coins: number; gems: number };
  streakMultiplier: number;
  finalMultiplier: number;
  totalXP: number;
  totalCoins: number;
  totalGems: number;
  streakDays: number;
  streakIncreased: boolean;
  achievementsUnlocked: string[];
  challengesProgressed: Array<{ challengeId: string; progress: number }>;
  milestoneReached: string | null;
  socialActivityId: string | null;
}
