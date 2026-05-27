import { applyCompletionSubsystems } from '../completion-subsystems';
import { createCompletionLedger, createSessionSummary } from './ledger-test-utils';
import { resetCompletionMocks, focusIdentityUpdateMock } from './completion-product-journey-helpers';

describe('focus identity updates once', () => {
  beforeEach(() => { resetCompletionMocks(); });

  it('focus identity update is called exactly once per completion', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    await applyCompletionSubsystems({ ledger, summary });

    expect(focusIdentityUpdateMock).toHaveBeenCalledTimes(1);
  });

  it('focus identity called with correct user id and grade', async () => {
    const ledger = createCompletionLedger({ grade: 'A', qualityScore: 90 });
    const summary = createSessionSummary();

    await applyCompletionSubsystems({ ledger, summary });

    expect(focusIdentityUpdateMock).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        grade: 'A',
        quality: 90,
      }),
    );
  });
});
