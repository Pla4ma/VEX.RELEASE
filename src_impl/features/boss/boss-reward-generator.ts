import type { BossReward, BossRewardType } from './types';
import { getRandomInsight } from './elite-insights';

/**
 * Generates variable rewards for boss defeats.
 * Pivots from fixed rewards to unpredictable "high-performance" unlocks.
 */
export function generateVariableReward(userId: string): BossReward[] {
  const roll = Math.random();
  
  // 70% chance of standard high-performance bonus
  if (roll < 0.7) {
    return [{
      userId,
      type: 'COINS' as BossRewardType,
      amount: 500,
      itemId: null,
    }];
  }
  
  // 15% chance of a "Big Win" focus bonus
  if (roll < 0.85) {
    return [{
      userId,
      type: 'GEMS' as BossRewardType,
      amount: 10,
      itemId: null,
    }];
  }
  
  // 10% chance of an "Elite Insight" (Knowledge Moat)
  if (roll < 0.95) {
    const insight = getRandomInsight();
    return [{
      userId,
      type: 'INSIGHT' as BossRewardType,
      amount: 1,
      itemId: insight.id,
      metadata: { 
        insightTitle: insight.title,
        insightBody: insight.body,
        insightCategory: insight.category
      }
    }];
  }
  
  // 5% chance of a "Focus Artifact" (Aesthetic Moat)
  return [{
    userId,
    type: 'AESTHETIC' as BossRewardType,
    amount: 1,
    itemId: 'elite-theme-token',
  }];
}
