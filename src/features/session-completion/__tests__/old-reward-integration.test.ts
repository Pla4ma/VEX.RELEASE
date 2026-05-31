import { applyCompletionSubsystems } from '../completion-subsystems';
import {
  createCompletionLedger,
  createSessionSummary,
} from './ledger-test-utils';
import { resetCompletionMocks } from './completion-product-journey-helpers';

describe('old reward integration disabled', () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it('completion rewards only XP, not coins or gems', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result = await applyCompletionSubsystems({ ledger, summary });

    const rewardIds = (result.ledger.rewardIds as string[]).join(' ');
    expect(rewardIds).toContain('session-xp:');
    expect(rewardIds).not.toContain('currency');
    expect(rewardIds).not.toContain('coin');
    expect(rewardIds).not.toContain('gem');
    expect(rewardIds).not.toContain('COINS');
    expect(rewardIds).not.toContain('GEMS');
  });

  it('no premium currency is awarded', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    await applyCompletionSubsystems({ ledger, summary });

    const { getRewardService } = require('../../../rewards/RewardService');
    const rewardService = getRewardService();
    const grantCalls = (rewardService.grantReward?.mock?.calls ?? []) as Array<
      [string, ...unknown[]]
    >;
    for (const call of grantCalls) {
      if (call[0]) {
        expect(call[0]).not.toBe('COINS');
        expect(call[0]).not.toBe('GEMS');
        expect(call[0]).not.toBe('CURRENCY');
      }
    }
  });
});
