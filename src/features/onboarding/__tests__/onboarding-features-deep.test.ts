/**
 * Deep Onboarding Tests — onboarding-features
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
  recordSession,
} from '../onboarding-state';

import {
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
} from '../onboarding-progress';

import { FEATURE_UNLOCK_GATES } from '../onboarding-gates';

import type { OnboardingState } from '../onboarding-types';

// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(userId: string): OnboardingState {
  return initializeOnboarding(userId);
}

describe('onboarding-progress', () => {
  describe('isFeatureAvailable', () => {
    it('returns false for unknown user with no default', () => {
      expect(isFeatureAvailable('nobody', 'clean_today_strip')).toBe(false);
    });

    it('returns default for unknown user when specified', () => {
      expect(isFeatureAvailable('nobody', 'x', true)).toBe(true);
    });

    it('returns true for unlocked feature', () => {
      freshState('user-ifa');
      recordSession('user-ifa', 15);
      recordSession('user-ifa', 15);
      expect(
        isFeatureAvailable('user-ifa', 'clean_today_strip'),
      ).toBe(true);
    });

    it('returns false for not-yet-unlocked feature', () => {
      freshState('user-ifa2');
      expect(
        isFeatureAvailable('user-ifa2', 'coach_evolution'),
      ).toBe(false);
    });
  });

  describe('getAvailableFeatures', () => {
    it('returns empty array for unknown user', () => {
      expect(getAvailableFeatures('nobody')).toEqual([]);
    });

    it('returns unlocked features', () => {
      freshState('user-gaf');
      recordSession('user-gaf', 15);
      recordSession('user-gaf', 15);
      const features = getAvailableFeatures('user-gaf');
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('getNextFeatureUnlock', () => {
    it('returns first gate for unknown user', () => {
      const next = getNextFeatureUnlock('nobody');
      expect(next).not.toBeNull();
      expect(next!.featureId).toBe(FEATURE_UNLOCK_GATES[0]!.featureId);
    });

    it('returns next gate after unlocking one', () => {
      freshState('user-gnfu');
      recordSession('user-gnfu', 15);
      recordSession('user-gnfu', 15);
      const next = getNextFeatureUnlock('user-gnfu');
      expect(next).not.toBeNull();
      expect(next!.featureId).not.toBe('clean_today_strip');
    });
  });
});
