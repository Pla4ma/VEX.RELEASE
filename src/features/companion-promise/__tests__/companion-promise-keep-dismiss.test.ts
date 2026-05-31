import { describe, expect, it, beforeEach } from '@jest/globals';
import { keepPromise, dismissRecovery } from '../service';

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

// ── service: keepPromise / dismissRecovery ─────────────────────────────
describe('service: keepPromise', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: 'replaced' });
  });

  it('calls dismissRecoveryPromise and returns result', async () => {
    const result = await keepPromise(basePromise);
    expect(result.status).toBe('replaced');
    expect(repository.dismissRecoveryPromise).toHaveBeenCalledWith(basePromise.id);
  });
});

describe('service: dismissRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.dismissRecoveryPromise.mockResolvedValue({ ...basePromise, status: 'replaced' });
  });

  it('delegates to dismissRecoveryPromise', async () => {
    await dismissRecovery(basePromise.id);
    expect(repository.dismissRecoveryPromise).toHaveBeenCalledWith(basePromise.id);
  });
});
