/**
 * Tests for rewards index exports
 */

import * as rewardsIndex from '../index';

describe('rewards index exports', () => {
  it('exports RewardTypeSchema', () => {
    expect(rewardsIndex.RewardTypeSchema).toBeDefined();
  });

  it('exports RewardTriggerSchema', () => {
    expect(rewardsIndex.RewardTriggerSchema).toBeDefined();
  });

  it('exports calculateXpReward', () => {
    expect(typeof rewardsIndex.calculateXpReward).toBe('function');
  });

  it('exports createReward', () => {
    expect(typeof rewardsIndex.createReward).toBe('function');
  });

  it('exports claimReward', () => {
    expect(typeof rewardsIndex.claimReward).toBe('function');
  });
});
