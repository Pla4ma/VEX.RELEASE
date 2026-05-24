/**
 * Battle Pass Events
 */

export interface BattlePassEventDefinitions {
  'battle_pass:reward_claimed': {
    userId: string;
    tier: number;
    rewardId: string;
    rewardType: string;
    timestamp: number;
  };
  'battle_pass:premium_purchased': {
    userId: string;
    purchaseId: string;
    price: number;
    timestamp: number;
  };
  'battle_pass:season_ended': {
    seasonId: string;
    userId: string;
    finalTier: number;
    timestamp: number;
  };
}
