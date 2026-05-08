/**
 * Basic Solo Boss Constants
 */

export interface BasicBossConfig {
  soloBossId: string;
  baseHealth: number;
  timeLimitHours: number;
  rewardXp: number;
  rewardCoins: number;
}

export const BASIC_BOSS_CONFIG: BasicBossConfig = {
  soloBossId: "basic-solo-boss-001",
  baseHealth: 1000,
  timeLimitHours: 24,
  rewardXp: 50,
  rewardCoins: 25,
};
