import { getCompletionLedgerBySessionId } from '../repository';
import { recoverSessionCompletion } from '../recovery-service';
import { createCompletionLedger, SESSION_ID, USER_ID } from './ledger-test-utils';

jest.mock('../repository', () => ({
  getCompletionLedgerBySessionId: jest.fn(),
}));

describe('recoverSessionCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rebuilds the saved completion for its owning user', async () => {
    jest.mocked(getCompletionLedgerBySessionId).mockResolvedValue(
      createCompletionLedger({ userId: USER_ID }),
    );

    const result = await recoverSessionCompletion(SESSION_ID, USER_ID);

    expect(result.sessionId).toBe(SESSION_ID);
    expect(result.summary.userId).toBe(USER_ID);
  });

  it('rejects a completion ledger owned by another user', async () => {
    jest.mocked(getCompletionLedgerBySessionId).mockResolvedValue(
      createCompletionLedger({ userId: '22222222-2222-4222-8222-222222222222' }),
    );

    await expect(recoverSessionCompletion(SESSION_ID, USER_ID)).rejects.toThrow(
      'another user',
    );
  });
});
