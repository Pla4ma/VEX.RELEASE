/**
 * Focus Contract Service — CompletionSignal, ContractForSession, ReflectionCopy Tests
 */

import * as repository from '../repository';
import {
  getCompletionSignal,
  getContractForSession,
  getReflectionCopy,
} from '../service';

jest.mock('../repository');
jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));

const userId = '123e4567-e89b-12d3-a456-426614174000';
const sessionId = '123e4567-e89b-12d3-a456-426614174111';

function makeContract(overrides: Partial<{
  id: string;
  sessionId: string;
  userId: string;
  taskDescription: string;
  completionStatus: 'done' | 'partial' | 'not_done' | null;
  reflectionAt: string | null;
  createdAt: string;
}> = {}) {
  return {
    id: 'contract-1',
    sessionId,
    userId,
    taskDescription: 'Test task',
    completionStatus: null,
    reflectionAt: null,
    createdAt: '2026-05-14T12:00:00.000Z',
    ...overrides,
  };
}

describe('getCompletionSignal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns neutral rate 0.5 when no contracts exist', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBe(0.5);
    expect(result.completedContractCount).toBe(0);
  });

  it('returns neutral rate 0.5 when no contracts are reflected', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: null }),
      makeContract({ id: 'c-2', completionStatus: null }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBe(0.5);
    expect(result.completedContractCount).toBe(0);
  });

  it('calculates 100% rate when all reflected contracts are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }),
      makeContract({ id: 'c-2', completionStatus: 'done' }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBe(1);
    expect(result.completedContractCount).toBe(2);
  });

  it('calculates 0% rate when no reflected contracts are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'not_done' }),
      makeContract({ id: 'c-2', completionStatus: 'partial' }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBe(0);
    expect(result.completedContractCount).toBe(2);
  });

  it('calculates 50% rate when half of reflected contracts are done', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }),
      makeContract({ id: 'c-2', completionStatus: 'not_done' }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBe(0.5);
    expect(result.completedContractCount).toBe(2);
  });

  it('ignores unreported contracts in completedContractCount', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }),
      makeContract({ id: 'c-2', completionStatus: null }),
      makeContract({ id: 'c-3', completionStatus: 'partial' }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.completedContractCount).toBe(2);
    expect(result.rate).toBe(0.5);
  });

  it('clamps rate between 0 and 1', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([
      makeContract({ completionStatus: 'done' }),
    ]);
    const result = await getCompletionSignal(userId, 7);
    expect(result.rate).toBeGreaterThanOrEqual(0);
    expect(result.rate).toBeLessThanOrEqual(1);
  });

  it('requests enough contracts based on windowDays', async () => {
    jest.mocked(repository.getRecentContracts).mockResolvedValue([]);
    await getCompletionSignal(userId, 14);
    expect(repository.getRecentContracts).toHaveBeenCalledWith(
      userId,
      Math.max(3, 14 * 3),
    );
  });
});

describe('getContractForSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns contract for given session', async () => {
    const contract = makeContract();
    jest.mocked(repository.getContractForSession).mockResolvedValue(contract);
    const result = await getContractForSession(sessionId, userId);
    expect(result).toEqual(contract);
    expect(repository.getContractForSession).toHaveBeenCalledWith(
      sessionId,
      userId,
    );
  });

  it('returns null when no contract exists', async () => {
    jest.mocked(repository.getContractForSession).mockResolvedValue(null);
    const result = await getContractForSession(sessionId, userId);
    expect(result).toBeNull();
  });
});

describe('getReflectionCopy', () => {
  it('returns positive copy for done status', () => {
    expect(getReflectionCopy('done')).toBe(
      "That's focus. Your companion noticed.",
    );
  });

  it('returns encouraging copy for partial status', () => {
    expect(getReflectionCopy('partial')).toBe(
      'Partial is honest. Keep showing up.',
    );
  });

  it('returns gentle copy for not_done status', () => {
    expect(getReflectionCopy('not_done')).toBe(
      'That happens. Next session, try again.',
    );
  });
});
