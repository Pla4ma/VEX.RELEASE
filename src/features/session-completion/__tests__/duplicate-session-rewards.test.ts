import { applyCompletionSubsystems } from '../completion-subsystems';
import {
  createCompletionLedger,
  createSessionSummary,
} from './ledger-test-utils';
import { resetCompletionMocks } from './completion-product-journey-helpers';

describe('duplicate session event does not duplicate rewards', () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it('completion subsystems produce idempotent reward ledger', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result1 = await applyCompletionSubsystems({ ledger, summary });
    const result2 = await applyCompletionSubsystems({ ledger, summary });

    expect(result1.ledger.rewardIds).toEqual(result2.ledger.rewardIds);
    expect(result1.ledger.xpDelta).toEqual(result2.ledger.xpDelta);
  });

  it('XP reward ids are deterministic for same session', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result = await applyCompletionSubsystems({ ledger, summary });

    const rewardIds = result.ledger.rewardIds as string[];
    expect(rewardIds).toHaveLength(1);
    expect(rewardIds[0]).toBe(`session-xp:${ledger.sessionId}`);
  });
});
