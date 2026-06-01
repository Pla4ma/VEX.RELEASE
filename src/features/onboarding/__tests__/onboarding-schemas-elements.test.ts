/**
 * Comprehensive Onboarding Feature Tests — Schema Tests (Elements & Motivation)
 */

import './onboarding-mock-setup';

import {
  OnboardingElementSchema,
  MotivationProfileTypeSchema,
  MotivationProfileSchema,
} from '../schemas';

// ── Schema Tests ──────────────────────────────────────────────────────────────

describe('Onboarding Schemas', () => {
  describe('OnboardingElementSchema', () => {
    it('accepts all valid elements', () => {
      const elements = [
        'FLAME',
        'WAVE',
        'TERRA',
        'ZEPHYR',
        'VOID',
        'LUMINA',
      ];
      elements.forEach((el) => {
        expect(OnboardingElementSchema.parse(el)).toBe(el);
      });
    });

    it('rejects invalid element', () => {
      expect(() => OnboardingElementSchema.parse('FIRE')).toThrow();
    });
  });

  describe('MotivationProfileTypeSchema', () => {
    it('accepts valid profile types', () => {
      const types = [
        'calm',
        'friendly',
        'game_like',
        'coach_led',
        'competitive',
        'intense',
        'study_focused',
        'student',
        'creator',
        'worker',
      ];
      types.forEach((t) => {
        expect(MotivationProfileTypeSchema.parse(t)).toBe(t);
      });
    });

    it('rejects invalid profile type', () => {
      expect(() => MotivationProfileTypeSchema.parse('relaxed')).toThrow();
    });
  });

  describe('MotivationProfileSchema', () => {
    it('accepts valid motivation profile', () => {
      const profile = { primary: 'calm', secondary: ['friendly'] };
      expect(() => MotivationProfileSchema.parse(profile)).not.toThrow();
    });
  });
});
