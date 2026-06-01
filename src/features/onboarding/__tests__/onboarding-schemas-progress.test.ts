/**
 * Comprehensive Onboarding Feature Tests — Schema Tests (Progress)
 */

import './onboarding-mock-setup';

import {
  OnboardingProgressSchema,
} from '../schemas';

// ── Schema Tests ──────────────────────────────────────────────────────────────

describe('Onboarding Schemas', () => {
  describe('OnboardingProgressSchema', () => {
    it('accepts valid progress state', () => {
      const progress = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'IN_PROGRESS',
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
      };
      expect(() => OnboardingProgressSchema.parse(progress)).not.toThrow();
    });

    it('rejects progress with invalid userId', () => {
      const progress = {
        userId: 'not-a-uuid',
        status: 'IN_PROGRESS',
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
      };
      expect(() => OnboardingProgressSchema.parse(progress)).toThrow();
    });

    it('rejects progress with extra fields (strict)', () => {
      const progress = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'IN_PROGRESS',
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
        extraField: true,
      };
      expect(() => OnboardingProgressSchema.parse(progress)).toThrow();
    });
  });
});
