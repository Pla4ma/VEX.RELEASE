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
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
  getDegradedBlockedSurfaces,
  shouldBlockFullSurface,
  getDegradedFallbackSurface,
  FINAL_RELEASE_INCLUDED_SYSTEMS,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
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
      const result = getFeatureAvailability(undefined as unknown as FeatureAccess);
      expect(result.state).toBe('disabled');
    });
  });

  describe('isFeatureHidden', () => {
    it('should return true for hidden features', () => {
      expect(isFeatureHidden('shop')).toBe(true);
      expect(isFeatureHidden('inventory')).toBe(true);
      expect(isFeatureHidden('battle_pass')).toBe(true);
    });

    it('should return false for non-hidden features', () => {
      expect(isFeatureHidden('boss_tab')).toBe(false);
      expect(isFeatureHidden('challenges')).toBe(false);
    });
  });

  describe('isFeatureIncluded', () => {
    it('should return false for hidden features', () => {
      expect(isFeatureIncluded('shop')).toBe(false);
    });

    it('should return true for included features', () => {
      expect(isFeatureIncluded('focus_session')).toBe(true);
    });

    it('should return false for progressive features', () => {
      expect(isFeatureIncluded('boss_tab')).toBe(false);
    });

    it('should return false for premium_gated features', () => {
      expect(isFeatureIncluded('ai_coach_advanced')).toBe(false);
    });
  });

  describe('getFeatureStatus', () => {
    it('should return hidden status for hidden features', () => {
      expect(getFeatureStatus('shop')).toBe('hidden');
    });

    it('should return included for included features', () => {
      expect(getFeatureStatus('focus_session')).toBe('included');
    });

    it('should return progressive for progressive features', () => {
      expect(getFeatureStatus('boss_tab')).toBe('progressive');
    });

    it('should return premium_gated for premium_gated features', () => {
      expect(getFeatureStatus('ai_coach_advanced')).toBe('premium_gated');
    });
  });

  describe('getDegradedBlockedSurfaces', () => {
    it('should return blocked surfaces for degraded features', () => {
      const result = getDegradedBlockedSurfaces(['premium_paywall']);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty input', () => {
      expect(getDegradedBlockedSurfaces([])).toEqual([]);
    });
  });

  describe('shouldBlockFullSurface', () => {
    it('should return true for degraded feature with surface config', () => {
      expect(shouldBlockFullSurface('premium_paywall', true)).toBe(true);
    });

    it('should return false for non-degraded feature', () => {
      expect(shouldBlockFullSurface('premium_paywall', false)).toBe(false);
    });
  });

  describe('getDegradedFallbackSurface', () => {
    it('should return fallback surface for known degraded feature', () => {
      const result = getDegradedFallbackSurface('premium_paywall');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return start_session for unknown feature', () => {
      const result = getDegradedFallbackSurface('content_study');
      expect(result).toBe('start_session');
    });
  });

  describe('Final release constants', () => {
    it('should have non-empty included systems list', () => {
      expect(FINAL_RELEASE_INCLUDED_SYSTEMS.length).toBeGreaterThan(0);
    });

    it('should have non-empty hidden systems list', () => {
      expect(FINAL_RELEASE_HIDDEN_SYSTEMS.length).toBeGreaterThan(0);
    });

    it('should include core systems in included list', () => {
      const included = FINAL_RELEASE_INCLUDED_SYSTEMS as readonly string[];
      expect(included).toContain('start_session');
      expect(included).toContain('session_completion');
    });
  });
});
