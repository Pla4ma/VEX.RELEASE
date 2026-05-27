// Rewards stub — economy reward systems (chest/loot/coins/daily-login/premium-chest)
// archived to archive/features/rewards/.
// Active runtime: reward-ledger (XP/progress/streak receipt only).
export type { RewardType, RewardTrigger } from "./schemas";
export { RewardTypeSchema, RewardTriggerSchema } from "./schemas";
export { calculateXpReward, createReward, claimReward } from "./service";
