/**
 * Deep Onboarding Tests — ProgressiveOnboarding state machine (sessions)
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(() => false),
    getNumber: jest.fn(() => undefined),
  })),
}));
jest.mock('../../../store', () => ({
  useAuthStore: { getState: jest.fn(() => ({ user: null })) },
}));
jest.mock('../../lane-engine/schemas', () => {
  const { z } = require('zod');
  const LaneSchema = z.string().nullable().optional();
  return { LaneSchema };
});

// ── Imports ────────────────────────────────────────────────────────────────

import {
  initializeOnboarding,
  getOnboardingState,
  skipToFirstSession,
  recordSession,
} from '../onboarding-state';

import type { OnboardingState } from '../onboarding-types';

// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(userId: string): OnboardingState {
  return initializeOnboarding(userId);
}

// ============================================================================
// onboarding-state (ProgressiveOnboarding) — sessions
// ============================================================================

describe('ProgressiveOnboarding state machine', () => {
  describe('skipToFirstSession', () => {
    it('sets step to FIRST_SESSION and marks customization skipped', () => {
      freshState('user-skip');
      const result = skipToFirstSession('user-skip');
      expect(result!.currentStep).toBe('FIRST_SESSION');
      expect(result!.skippedCustomization).toBe(true);
    });

    it('returns null for unknown user', () => {
      expect(skipToFirstSession('no-such')).toBeNull();
    });
  });

  describe('recordSession', () => {
    it('increments session count', () => {
      freshState('user-sess');
      const result = recordSession('user-sess', 15);
      expect(result!.sessionsCompleted).toBe(1);
    });

    it('sets firstSessionAt on first session', () => {
      freshState('user-first');
      recordSession('user-first', 25);
      const state = getOnboardingState('user-first');
      expect(state!.firstSessionAt).not.toBeNull();
      expect(state!.currentStep).toBe('POST_SESSION');
    });

    it('does not overwrite firstSessionAt on subsequent sessions', () => {
      freshState('user-mult');
      recordSession('user-mult', 15);
      const first = getOnboardingState('user-mult')!.firstSessionAt;
      recordSession('user-mult', 25);
      const second = getOnboardingState('user-mult')!.firstSessionAt;
      expect(first).toBe(second);
    });

    it('unlocks features when session threshold met', () => {
      freshState('user-unlk');
      // clean_today_strip requires 2 sessions
      recordSession('user-unlk', 15);
      let state = getOnboardingState('user-unlk')!;
      expect(state.unlockedFeatures).toHaveLength(0);

      recordSession('user-unlk', 15);
      state = getOnboardingState('user-unlk')!;
      expect(state.unlockedFeatures.some((f) => f.featureId === 'clean_today_strip')).toBe(true);
    });

    it('returns null for unknown user', () => {
      expect(recordSession('no-such', 15)).toBeNull();
    });

    it('sets nextFeatureUnlock after unlocking a feature', () => {
      freshState('user-nfu');
      // Unlock 2-session feature
      recordSession('user-nfu', 15);
      recordSession('user-nfu', 15);
      const state = getOnboardingState('user-nfu')!;
      expect(state.nextFeatureUnlock).not.toBeNull();
      expect(state.nextFeatureUnlock!.featureId).not.toBe('clean_today_strip');
    });
  });
});
