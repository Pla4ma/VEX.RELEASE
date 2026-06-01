import { describe, expect, it, beforeEach } from '@jest/globals';
import { getHomePromiseState } from '../service';

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

// ── service: getHomePromiseState ───────────────────────────────────────
describe('service: getHomePromiseState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.getPendingPromise.mockResolvedValue(null);
    repository.getRecentPromises.mockResolvedValue([]);
  });

  it('returns hidden when online with no promises', async () => {
    const state = await getHomePromiseState('user-123', true, 'UTC');
    expect(state.kind).toBe('hidden');
  });

  it('returns offline when offline with no promises', async () => {
    const state = await getHomePromiseState('user-123', false, 'UTC');
    expect(state.kind).toBe('offline');
    expect(state.showOfflineBanner).toBe(true);
  });

  it('returns pending when a pending promise exists for today', async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    // Use a now that matches targetDate "2026-05-21" in UTC
    const state = await getHomePromiseState(
      'user-123',
      true,
      'UTC',
      Date.parse('2026-05-21T12:00:00.000Z'),
    );
    expect(state.kind).toBe('pending');
    if ('promise' in state) {
      expect(state.promise.id).toBe(basePromise.id);
    }
  });

  it('returns fulfilled when latest promise is fulfilled', async () => {
    const fulfilled = { ...basePromise, status: 'fulfilled' as const };
    repository.getRecentPromises.mockResolvedValue([fulfilled]);
    const state = await getHomePromiseState('user-123', true, 'UTC');
    expect(state.kind).toBe('fulfilled');
  });

  it('returns missed when latest promise is missed', async () => {
    const missed = { ...basePromise, status: 'missed' as const };
    repository.getRecentPromises.mockResolvedValue([missed]);
    const state = await getHomePromiseState('user-123', true, 'UTC');
    expect(state.kind).toBe('missed');
  });

  it('shows offline banner when offline with pending promise', async () => {
    repository.getPendingPromise.mockResolvedValue(basePromise);
    const state = await getHomePromiseState('user-123', false, 'UTC');
    expect(state.showOfflineBanner).toBe(true);
  });
});
