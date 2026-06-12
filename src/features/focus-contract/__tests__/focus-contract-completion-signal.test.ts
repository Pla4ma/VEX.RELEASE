import * as repository from '../repository';
import { getCompletionSignal, getContractForSession, getReflectionCopy } from '../service';

jest.mock('../repository');
jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));

const userId = '123e4567-e89b-12d3-a456-426614174000';
const sessionId = '123e4567-e89b-12d3-a456-426614174111';

function makeContract(overrides: Partial<{
  id: string; sessionId: string; userId: string; taskDescription: string;
  completionStatus: 'done' | 'partial' | 'not_done' | null; reflectionAt: string | null; createdAt: string;
}> = {}) {
  return {
    id: 'contract-1', sessionId, userId, taskDescription: 'Test task',
    completionStatus: null, reflectionAt: null, createdAt: '2026-05-14T12:00:00.000Z', ...overrides,
  };
}

describe('getCompletionSignal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns neutral rate 0.5 when no contracts', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([]);
    const r = await getCompletionSignal(userId, 7);
    expect(r.rate).toBe(0.5);
    expect(r.completedContractCount).toBe(0);
  });

  it('returns 1.0 when all reflected are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }), makeContract({ id: 'c-2', completionStatus: 'done' }),
    ]);
    const r = await getCompletionSignal(userId, 7);
    expect(r.rate).toBe(1);
    expect(r.completedContractCount).toBe(2);
  });

  it('returns 0 when none reflected are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'not_done' }), makeContract({ id: 'c-2', completionStatus: 'partial' }),
    ]);
    const r = await getCompletionSignal(userId, 7);
    expect(r.rate).toBe(0);
  });

  it('returns 0.5 when half reflected are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }), makeContract({ id: 'c-2', completionStatus: 'not_done' }),
    ]);
    const r = await getCompletionSignal(userId, 7);
    expect(r.rate).toBe(0.5);
  });

  it('ignores unreported contracts in count', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }), makeContract({ id: 'c-2', completionStatus: null }),
    ]);
    const r = await getCompletionSignal(userId, 7);
    expect(r.completedContractCount).toBe(1);
  });

  it('passes correct limit based on windowDays', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([]);
    await getCompletionSignal(userId, 14);
    expect(repository.getRecentContracts).toHaveBeenCalledWith(userId, 42);
  });
});

describe('getContractForSession', () => {
  beforeEach(() => jest.clearAllMocks());
  it('returns contract for session', async () => {
    jest.mocked(repository.getContractForSession).mockResolvedValue(makeContract());
    expect(await getContractForSession(sessionId, userId)).not.toBeNull();
  });
  it('returns null when no contract', async () => {
    jest.mocked(repository.getContractForSession).mockResolvedValue(null);
    expect(await getContractForSession(sessionId, userId)).toBeNull();
  });
});

describe('getReflectionCopy', () => {
  it('returns positive for done', () => {
    expect(getReflectionCopy('done')).toBe("That's focus. Your companion noticed.");
  });
  it('returns encouraging for partial', () => {
    expect(getReflectionCopy('partial')).toBe('Partial is honest. Keep showing up.');
  });
  it('returns gentle for not_done', () => {
    expect(getReflectionCopy('not_done')).toBe('That happens. Next session, try again.');
  });
});
