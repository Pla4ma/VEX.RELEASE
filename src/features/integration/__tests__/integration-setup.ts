/// <reference types="jest" />

/**
 * Shared test setup for integration tests.
 * Mocks, mock retrieval, and helpers.
 */

/* ─── Mocks (must be inline factories, no external const refs) ── */

// Track subscribers for event-driven tests
export const mockActiveSubscribers: Array<{
  event: string;
  handler: (...args: unknown[]) => void;
}> = [];

jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(
      (event: string, handler: (...args: unknown[]) => void) => {
        mockActiveSubscribers.push({ event, handler });
        return jest.fn(() => {
          const idx = mockActiveSubscribers.findIndex(
            (s) => s.event === event && s.handler === handler,
          );
          if (idx >= 0) {mockActiveSubscribers.splice(idx, 1);}
        });
      },
    ),
  },
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }),
}));

jest.mock('../../rewards/service', () => ({
  createReward: jest.fn().mockResolvedValue({ id: 'reward-1' }),
}));

jest.mock('../../progression/service-xp-core', () => ({
  addXpEnhanced: jest.fn().mockResolvedValue({ xpAdded: 10 }),
  calculateXpBreakdown: jest.fn((input: { baseAmount: number }) => ({
    total: input.baseAmount,
    base: input.baseAmount,
    streakBonus: 0,
    difficultyBonus: 0,
  })),
}));

jest.mock('../../streaks/service', () => ({
  recordSession: jest
    .fn()
    .mockResolvedValue({ action: 'recorded', milestoneReached: null }),
  checkMilestone: jest.fn().mockReturnValue(null),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../focus-identity/integration-focus-score', () => ({
  initializeFocusScoreIntegration: jest.fn(() => jest.fn()),
}));

/* ─── Retrieve mocks ──────────────────────────────────────────── */

export const mockEventBus = jest.requireMock('../../../events/EventBus') as {
  eventBus: { publish: jest.Mock; subscribe: jest.Mock };
};
export const mockRewards = jest.requireMock('../../rewards/service') as {
  createReward: jest.Mock;
};
export const mockProgression = jest.requireMock(
  '../../progression/service-xp-core',
) as {
  addXpEnhanced: jest.Mock;
  calculateXpBreakdown: jest.Mock;
};
export const mockStreaks = jest.requireMock('../../streaks/service') as {
  recordSession: jest.Mock;
  checkMilestone: jest.Mock;
};
export const mockSentry = jest.requireMock('@sentry/react-native') as {
  addBreadcrumb: jest.Mock;
  captureException: jest.Mock;
};
export const mockFocusIdentity = jest.requireMock(
  '../../focus-identity/integration-focus-score',
) as { initializeFocusScoreIntegration: jest.Mock };

/* ─── Helpers ─────────────────────────────────────────────────── */

export function fireEvent(event: string, data: unknown): void {
  for (const sub of mockActiveSubscribers.filter((s) => s.event === event)) {
    sub.handler(data);
  }
}

export function activeEvents(): string[] {
  return [...new Set(mockActiveSubscribers.map((s) => s.event))];
}
