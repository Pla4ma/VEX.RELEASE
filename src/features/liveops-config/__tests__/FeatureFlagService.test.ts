/**
 * LiveOps Config — FeatureFlagService Tests
 *
 * Tests for stage/tier resolution, feature availability, degraded surfaces,
 * and release map classification.
 */

import {
  getStage,
  getProductTier,
  getFeatureAvailability,
} from '../FeatureFlagService';
import type { FeatureAccess } from '../feature-access-types';

describe('FeatureFlagService', () => {
  describe('getStage', () => {
    it('should return NEW_USER for 0 sessions', () => {
      expect(getStage(0)).toBe('NEW_USER');
    });

    it('should return NEW_USER for negative sessions', () => {
      expect(getStage(-1)).toBe('NEW_USER');
    });

    it('should return ACTIVATING for 1-2 sessions', () => {
      expect(getStage(1)).toBe('ACTIVATING');
      expect(getStage(2)).toBe('ACTIVATING');
    });

    it('should return ENGAGED for 3-9 sessions', () => {
      expect(getStage(3)).toBe('ENGAGED');
      expect(getStage(9)).toBe('ENGAGED');
    });

    it('should return POWER_USER for 10+ sessions', () => {
      expect(getStage(10)).toBe('POWER_USER');
      expect(getStage(100)).toBe('POWER_USER');
    });
  });

  describe('getProductTier', () => {
    it('should return CORE_EXECUTION for NEW_USER stage', () => {
      expect(getProductTier('NEW_USER', 0)).toBe('CORE_EXECUTION');
    });

    it('should return COACHING for ENGAGED stage below 10 sessions', () => {
      expect(getProductTier('ENGAGED', 5)).toBe('COACHING');
    });

    it('should return STUDY_OS for 10-19 sessions', () => {
      expect(getProductTier('ENGAGED', 10)).toBe('STUDY_OS');
      expect(getProductTier('POWER_USER', 15)).toBe('STUDY_OS');
    });

    it('should return RPG_DEPTH for 20-39 sessions', () => {
      expect(getProductTier('POWER_USER', 20)).toBe('RPG_DEPTH');
      expect(getProductTier('POWER_USER', 39)).toBe('RPG_DEPTH');
    });

    it('should return SOCIAL_DEPTH for 40+ sessions', () => {
      expect(getProductTier('POWER_USER', 40)).toBe('SOCIAL_DEPTH');
      expect(getProductTier('POWER_USER', 100)).toBe('SOCIAL_DEPTH');
    });
  });

  describe('getFeatureAvailability', () => {
    const baseFeature: FeatureAccess = {
      isUnlocked: false,
      isVisible: true,
      lockedDescription: 'Locked',
      recommendedUnlockMoment: 'Keep going',
      unlockReason: 'Unlocks soon',
      releaseState: 'final_release_core',
    };

    it('should return disabled for invisible feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        isVisible: false,
      });
      expect(result.state).toBe('disabled');
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it('should return disabled for archived feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        releaseState: 'archived',
      });
      expect(result.state).toBe('disabled');
    });

    it('should return disabled for deactivated feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        releaseState: 'final_release_deactivated',
      });
      expect(result.state).toBe('disabled');
    });

    it('should return unlocked for unlocked non-degraded feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        isUnlocked: true,
      });
      expect(result.state).toBe('unlocked');
      expect(result.canNavigate).toBe(true);
      expect(result.canQuery).toBe(true);
      expect(result.canUseBackend).toBe(true);
      expect(result.canRegisterRoute).toBe(true);
      expect(result.canSubscribeToEvents).toBe(true);
      expect(result.canShowNotification).toBe(true);
    });

    it('should return degraded for unlocked degraded feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        isUnlocked: true,
        isDegraded: true,
      });
      expect(result.state).toBe('degraded');
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it('should return disabled for degraded feature with disableOnDegraded', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        isUnlocked: true,
        isDegraded: true,
        disableOnDegraded: true,
      });
      expect(result.state).toBe('disabled');
    });

    it('should return teased for teased feature', () => {
      const result = getFeatureAvailability({
        ...baseFeature,
        isTeased: true,
      });
      expect(result.state).toBe('teased');
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
    });

    it('should return disabled for locked non-teased feature', () => {
      const result = getFeatureAvailability(baseFeature);
      expect(result.state).toBe('disabled');
    });

    it('should return disabled for undefined feature', () => {
      const result = getFeatureAvailability(undefined as FeatureAccess | undefined);
      expect(result.state).toBe('disabled');
    });
  });

});
