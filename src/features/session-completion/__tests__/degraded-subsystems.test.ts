// Helper must be imported FIRST so its jest.mock() calls register before source modules load
import { resetCompletionMocks } from './completion-product-journey-helpers';
import { applyCompletionSubsystems } from '../completion-subsystems';
import {
  createCompletionLedger,
  createSessionSummary,
} from './ledger-test-utils';

describe('degraded subsystems are tracked', () => {
  beforeEach(() => {
    resetCompletionMocks();
  });

  it('no degraded systems for normal completion', async () => {
    const ledger = createCompletionLedger();
    const summary = createSessionSummary();

    const result = await applyCompletionSubsystems({ ledger, summary });

    expect(result.degradedSystems).toEqual([]);
  });
});
