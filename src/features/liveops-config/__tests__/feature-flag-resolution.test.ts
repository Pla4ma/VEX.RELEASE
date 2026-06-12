/**
 * LiveOps Config — Feature Flag Resolution Tests
 *
 * Tests for threshold resolution, visibility resolution, and dependency checking.
 */

import {
  resolveEffectiveThreshold,
  resolveFeatureVisibility,
} from '../feature-flag-resolution';
import type { MotivationProfileConfig } from '../feature-flag-resolution';

describe('feature-flag-resolution', () => {
  describe('resolveEffectiveThreshold', () => {
    const baseProfiles: Partial<Record<string, MotivationProfileConfig>> = {
      boss_tab: {
        accelerate: ['game_like', 'competitive'],
        accelerateOffset: 2,
        restrict: ['calm', 'study_focused'],
        restrictOffset: 3,
      },
      challenges: {
        accelerate: ['worker'],
        accelerateOffset: 1,
        restrict: ['student'],
        restrictOffset: 2,
        restrictVisibility: true,
        restrictVisibilityMin: 5,
      },
    };

    it('should return base threshold when no profile matches', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        undefined,
        baseProfiles,
      );
      expect(result).toBe(7);
    });

    it('should return base threshold when feature has no config', () => {
      const result = resolveEffectiveThreshold(
        'unknown_feature' as const,
        10,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(10);
    });

    it('should accelerate for matching primary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(5);
    });

    it('should restrict for matching primary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'calm', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(10);
    });

    it('should accelerate for matching secondary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'friendly', secondary: ['competitive'] },
        baseProfiles,
      );
      expect(result).toBe(5);
    });

    it('should not go below 0 when accelerating', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        1,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(0);
    });

    it('should handle restrictVisibility with min sessions', () => {
      const result = resolveEffectiveThreshold(
        'challenges',
        5,
        { primary: 'student', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(7);
    });
  });

  describe('resolveFeatureVisibility', () => {
    const baseProfiles: Partial<Record<string, MotivationProfileConfig>> = {
      boss_tab: {
        accelerate: [],
        accelerateOffset: 0,
        restrict: ['calm'],
        restrictOffset: 0,
        restrictVisibility: true,
        restrictVisibilityMin: 5,
      },
      challenges: {
        accelerate: [],
        accelerateOffset: 0,
        restrict: ['student'],
        restrictOffset: 0,
      },
    };

    it('should return false when baseVisible is false', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        false,
        undefined,
        baseProfiles,
        10,
      );
      expect(result).toBe(false);
    });

    it('should return true when no profile matches', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        undefined,
        baseProfiles,
        10,
      );
      expect(result).toBe(true);
    });

    it('should return true for non-restricted profile', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
        10,
      );
      expect(result).toBe(true);
    });

    it('should return false for restricted profile below min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        3,
        baseProfiles,
      );
      expect(result).toBe(false);
    });

    it('should return true for restricted profile at min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        5,
        baseProfiles,
      );
      expect(result).toBe(true);
    });

    it('should return true for restricted profile above min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        10,
        baseProfiles,
      );
      expect(result).toBe(true);
    });

    it('should return true when restrictVisibility is not set', () => {
      const result = resolveFeatureVisibility(
        'challenges',
        true,
        { primary: 'student', secondary: [] },
        baseProfiles,
        1,
      );
      expect(result).toBe(true);
    });
  });

});
