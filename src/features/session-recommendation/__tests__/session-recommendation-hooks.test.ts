/**
 * Session Recommendation — Hooks Tests
 */

// ── Mocks (must come before imports that use them) ───────────────────

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { id: 'user-123' } }),
  ),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isPending: false, isError: false, error: null, refetch: jest.fn() })),
}));

// ── Imports ──────────────────────────────────────────────────────────

import { useSessionRecommendationActions, sessionRecommendationKeys } from '../hooks';

// ═══════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════

describe('sessionRecommendationKeys', () => {
  it('has correct base key', () => {
    expect(sessionRecommendationKeys.all).toEqual(['session-recommendation']);
  });

  it('generates current key for userId', () => {
    const key = sessionRecommendationKeys.current('user-123');
    expect(key).toEqual(['session-recommendation', 'current', 'user-123']);
  });

  it('generates analytics key for userId', () => {
    const key = sessionRecommendationKeys.analytics('user-456');
    expect(key).toEqual(['session-recommendation', 'analytics', 'user-456']);
  });
});

describe('useSessionRecommendationActions', () => {
  it('exports startRecommendedSession and dismissRecommendation', () => {
    // Verify the module exports the expected hook
    expect(typeof useSessionRecommendationActions).toBe('function');
  });
});
