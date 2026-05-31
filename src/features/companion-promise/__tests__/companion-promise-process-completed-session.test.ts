import { describe, expect, it, beforeEach } from '@jest/globals';
import { processCompletedSessionPromise } from '../service';

// ── Mocks ──────────────────────────────────────────────────────────────
jest.mock('../repository', () => ({
  createPromise: jest.fn(),
  dismissRecoveryPromise: jest.fn(),
  fulfillPromise: jest.fn(),
  getPendingPromise: jest.fn(),
  getRecentPromises: jest.fn(),
  markPromiseMissed: jest.fn(),
  replacePromise: jest.fn(),
}));
jest.mock('../analytics', () => ({
  trackPromiseCreated: jest.fn(),
  trackPromiseFulfilled: jest.fn(),
  trackPromiseMissed: jest.fn(),
  trackPromiseRecovered: jest.fn(),
}));
jest.mock('../events', () => ({
  publishPromiseCreated: jest.fn(),
  publishPromiseFulfilled: jest.fn(),
  publishPromiseMissed: jest.fn(),
  publishPromiseRecovered: jest.fn(),
}));

const repository = jest.requireMock('../repository') as Record<string, jest.Mock>;

const basePromise = {
  createdAt: '2026-05-20T10:00:00.000Z',
  fulfilledAt: null,
  id: '550e8400-e29b-41d4-a716-446655440001',
  missedAt: null,
  sourceSessionId: '550e8400-e29b-41d4-a716-446655440002',
  status: 'pending' as const,
  targetDate: '2026-05-21',
  targetDurationMinutes: 25,
  targetMode: 'FOCUS' as const,
  userId: 'user-123',
};

// ── service: processCompletedSessionPromise ────────────────────────────
describe('service: processCompletedSessionPromise', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.createPromise.mockResolvedValue(basePromise);
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: 'replaced' });
    repository.getPendingPromise.mockResolvedValue(null);
    repository.getRecentPromises.mockResolvedValue([]);
    repository.markPromiseMissed.mockResolvedValue({
      ...basePromise,
      status: 'missed',
      missedAt: '2026-05-22T10:00:00.000Z',
    });
    repository.replacePromise.mockResolvedValue({ ...basePromise, status: 'replaced' });
    repository.fulfillPromise.mockResolvedValue({
      ...basePromise,
      status: 'fulfilled',
      fulfilledAt: '2026-05-21T12:00:00.000Z',
    });
  });

  it('creates a new promise for a qualifying session (>= 5 minutes)', async () => {
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse('2026-05-20T10:00:00.000Z'),
        durationMinutes: 25,
        sessionId: basePromise.sourceSessionId,
        sessionMode: 'FLOW',
        userId: basePromise.userId,
      },
      'UTC',
    );
    expect(result.createdPromise).not.toBeNull();
    expect(result.createdPromise?.targetMode).toBe('FOCUS');
    expect(repository.createPromise).toHaveBeenCalledTimes(1);
  });

  it('skips promise creation for short sessions (< 5 minutes)', async () => {
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse('2026-05-20T10:00:00.000Z'),
        durationMinutes: 3,
        sessionId: basePromise.sourceSessionId,
        sessionMode: 'FLOW',
        userId: basePromise.userId,
      },
      'UTC',
    );
    expect(result.createdPromise).toBeNull();
    expect(repository.createPromise).not.toHaveBeenCalled();
  });

  it('replaces an older pending promise from a different session', async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    await processCompletedSessionPromise(
      {
        completedAt: Date.parse('2026-05-20T11:00:00.000Z'),
        durationMinutes: 30,
        sessionId: '550e8400-e29b-41d4-a716-446655440099',
        sessionMode: 'FLOW',
        userId: basePromise.userId,
      },
      'UTC',
    );
    expect(repository.replacePromise).toHaveBeenCalledWith(basePromise.id);
  });

  it('fulfills a matching promise on the target date', async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse('2026-05-21T14:00:00.000Z'),
        durationMinutes: 30,
        sessionId: '550e8400-e29b-41d4-a716-446655440098',
        sessionMode: 'FLOW',
        userId: basePromise.userId,
      },
      'UTC',
    );
    expect(result.fulfilledPromise?.status).toBe('fulfilled');
  });

  it('marks expired promise as missed', async () => {
    repository.getPendingPromise.mockResolvedValue({
      ...basePromise,
      targetDate: '2026-05-19',
    });
    const result = await processCompletedSessionPromise(
      {
        completedAt: Date.parse('2026-05-20T10:00:00.000Z'),
        durationMinutes: 30,
        sessionId: '550e8400-e29b-41d4-a716-446655440098',
        sessionMode: 'FLOW',
        userId: basePromise.userId,
      },
      'UTC',
    );
    expect(result.missedPromise).not.toBeNull();
    expect(repository.markPromiseMissed).toHaveBeenCalled();
  });
});
