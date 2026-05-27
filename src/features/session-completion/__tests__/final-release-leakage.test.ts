import { applyCompletionSubsystems } from '../completion-subsystems';
import { createCompletionLedger, createSessionSummary } from './ledger-test-utils';
import { resetCompletionMocks } from './completion-product-journey-helpers';

describe('final release no hidden feature leakage from completion', () => {
  beforeEach(() => { resetCompletionMocks(); });

  it('no shop/inventory/battle_pass CTA in completion rewards', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result = await applyCompletionSubsystems({ ledger, summary });

    const allIds = (result.ledger.rewardIds as string[]).join(' ');
    expect(allIds).not.toContain('shop');
    expect(allIds).not.toContain('inventory');
    expect(allIds).not.toContain('battle-pass');
    expect(allIds).not.toContain('battle_pass');
    expect(allIds).not.toContain('social');
    expect(allIds).not.toContain('squads');
    expect(allIds).not.toContain('rivals');
  });
});
