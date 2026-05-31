import './orchestrator-test-mocks';
import { orchestrateSessionCompletion } from '../completion-orchestrator';
import {
  createCompletionLedger,
  createSessionSummary,
  SESSION_ID,
  USER_ID,
} from './ledger-test-utils';

describe('orchestrateSessionCompletion flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../idempotency').resetCompletionIdempotencyForTests();
    require('../../../lib/repository/base').getConnectionState.mockReturnValue(
      'online',
    );
  });

  it('creates ledger and updates all systems for normal completion', async () => {
    const {
      createCompletionLedger: persist,
      getCompletionLedgerByIdempotencyKey,
    } = require('../repository');
    const { applyCompletionSubsystems } = require('../completion-subsystems');
    const {
      generateStoryForCompletedSession,
    } = require('../../session-story/StoryGenerator');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    persist.mockResolvedValue(createCompletionLedger());
    applyCompletionSubsystems.mockResolvedValue({
      degradedSystems: [],
      ledger: createCompletionLedger(),
    });

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(persist).toHaveBeenCalled();
    expect(applyCompletionSubsystems).toHaveBeenCalled();
    expect(generateStoryForCompletedSession).not.toHaveBeenCalled();
  });

  it('skips processing for duplicate idempotency key', async () => {
    const {
      createCompletionLedger: persist,
      getCompletionLedgerByIdempotencyKey,
    } = require('../repository');
    const { useSessionUIStore } = require('../../../store/session-state');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(
      createCompletionLedger({
        idempotencyKey: `${SESSION_ID}:1000000`,
      }),
    );

    await orchestrateSessionCompletion({
      timestamp: 1000000,
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(persist).not.toHaveBeenCalled();
    expect(
      useSessionUIStore.getState().setCompletionSyncState,
    ).toHaveBeenCalledWith(expect.objectContaining({ status: 'synced' }));
  });

  it('handles offline mode by queuing ledger', async () => {
    const { getConnectionState } = require('../../../lib/repository/base');
    const { enqueue } = require('../../../lib/offline/queue');
    const { getCompletionLedgerByIdempotencyKey } = require('../repository');

    getConnectionState.mockReturnValue('offline');
    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);

    await orchestrateSessionCompletion({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'sessions',
        operation: 'CREATE',
      }),
    );
  });

  it('does not run subsystems twice for concurrent duplicate completions', async () => {
    const {
      createCompletionLedger: persist,
      getCompletionLedgerByIdempotencyKey,
    } = require('../repository');
    const { applyCompletionSubsystems } = require('../completion-subsystems');

    getCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    persist.mockResolvedValue(createCompletionLedger());
    applyCompletionSubsystems.mockResolvedValue({
      degradedSystems: [],
      ledger: createCompletionLedger(),
    });

    await Promise.all([
      orchestrateSessionCompletion({
        timestamp: 2000000,
        sessionId: SESSION_ID,
        summary: createSessionSummary(),
        userId: USER_ID,
      }),
      orchestrateSessionCompletion({
        timestamp: 2000000,
        sessionId: SESSION_ID,
        summary: createSessionSummary(),
        userId: USER_ID,
      }),
    ]);

    expect(persist).toHaveBeenCalledTimes(1);
    expect(applyCompletionSubsystems).toHaveBeenCalledTimes(1);
  });
});
