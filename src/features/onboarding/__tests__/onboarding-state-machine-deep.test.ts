/**
 * Deep Onboarding Tests — ProgressiveOnboarding state machine (init & advance)
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
  advanceStep,
} from '../onboarding-state';

import {
  FEATURE_UNLOCK_GATES,
  STEP_ORDER,
} from '../onboarding-gates';

import type { OnboardingState } from '../onboarding-types';

// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(userId: string): OnboardingState {
  return initializeOnboarding(userId);
}

// ============================================================================
// onboarding-state (ProgressiveOnboarding)
// ============================================================================

describe('ProgressiveOnboarding state machine', () => {
  describe('initializeOnboarding', () => {
    it('creates state at WELCOME step with 0 sessions', () => {
      const state = freshState('user-1');
      expect(state.currentStep).toBe('WELCOME');
      expect(state.sessionsCompleted).toBe(0);
      expect(state.firstSessionAt).toBeNull();
      expect(state.completedAt).toBeNull();
      expect(state.skippedCustomization).toBe(false);
      expect(state.unlockedFeatures).toHaveLength(0);
    });

    it('sets userId correctly', () => {
      const state = freshState('user-abc');
      expect(state.userId).toBe('user-abc');
    });

    it('sets first feature unlock gate as nextFeatureUnlock', () => {
      const state = freshState('user-2');
      expect(state.nextFeatureUnlock).not.toBeNull();
      expect(state.nextFeatureUnlock!.featureId).toBe(
        FEATURE_UNLOCK_GATES[0]!.featureId,
      );
    });
  });

  describe('getOnboardingState', () => {
    it('returns null for unknown user', () => {
      expect(getOnboardingState('unknown-user')).toBeNull();
    });

    it('returns state for initialized user', () => {
      freshState('user-get');
      const state = getOnboardingState('user-get');
      expect(state).not.toBeNull();
      expect(state!.currentStep).toBe('WELCOME');
    });
  });

  describe('advanceStep', () => {
    it('advances from WELCOME to QUICK_START', () => {
      freshState('user-adv');
      const result = advanceStep('user-adv');
      expect(result!.currentStep).toBe('QUICK_START');
    });

    it('advances through all steps to COMPLETE', () => {
      freshState('user-full');
      for (let i = 0; i < STEP_ORDER.length - 1; i++) {
        advanceStep('user-full');
      }
      const state = getOnboardingState('user-full');
      expect(state!.currentStep).toBe('COMPLETE');
      expect(state!.completedAt).not.toBeNull();
    });

    it('returns null for unknown user', () => {
      expect(advanceStep('no-such-user')).toBeNull();
    });

    it('does not advance past COMPLETE', () => {
      freshState('user-end');
      for (let i = 0; i < STEP_ORDER.length + 3; i++) {
        advanceStep('user-end');
      }
      const state = getOnboardingState('user-end');
      expect(state!.currentStep).toBe('COMPLETE');
    });
  });
});
