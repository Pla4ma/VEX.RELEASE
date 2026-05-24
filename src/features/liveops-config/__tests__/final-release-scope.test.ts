/**
 * Final Release Scope Test
 *
 * Verifies:
 * - Archived/deactivated features are properly gated
 * - Feature map correctly classifies all features
 * - No archived feature bypasses the FeatureAvailability gates
 */

import {
  PUBLIC_V1_FEATURE_MAP,
  isPublicV1Hidden,
  isPublicV1Included,
  getPublicV1Status,
} from '../../features/liveops-config/public-v1-feature-map';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES } from '../../features/liveops-config/feature-access-config';
import type { FeatureKey } from '../../features/liveops-config/feature-access';

const ARCHIVED_FEATURES: FeatureKey[] = [
  'shop',
  'inventory',
  'battle_pass',
  'wagers',
  'rivals',
  'squads',
  'rankings',
  'economy_advanced',
  'gems_prominent',
  'social_tab',
  'boss_bounties',
  'streak_insurance',
  'seasonal_features',
];

const FINAL_RELEASE_ACTIVE: FeatureKey[] = [
  'focus_session',
  'progress_view',
  'home_tab',
  'focus_tab',
  'profile_tab',
  'ai_coach_basic',
  'economy_basic',
  'companion_detail',
  'content_study',
  'advanced_settings',
];

const PROGRESSIVELY_UNLOCKED: FeatureKey[] = [
  'boss_tab',
  'achievements',
  'challenges',
  'ai_coach_advanced',
  'content_study_advanced',
  'quiz_review_mode',
  'premium_paywall',
];

describe('Final Release Scope — Feature Classification', () => {
  it('all features have an entry in PUBLIC_V1_FEATURE_MAP', () => {
    const allKeys = [
      ...ARCHIVED_FEATURES,
      ...FINAL_RELEASE_ACTIVE,
      ...PROGRESSIVELY_UNLOCKED,
    ];
    for (const key of allKeys) {
      expect(PUBLIC_V1_FEATURE_MAP[key]).toBeDefined();
    }
  });

  it('archived features are hidden in feature map', () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(isPublicV1Hidden(feature)).toBe(true);
      expect(isPublicV1Included(feature)).toBe(false);
    }
  });

  it('active features are included in feature map', () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      expect(isPublicV1Included(feature)).toBe(true);
      expect(isPublicV1Hidden(feature)).toBe(false);
    }
  });

  it('progressive features are not hidden (progressive or premium_gated)', () => {
    for (const feature of PROGRESSIVELY_UNLOCKED) {
      expect(isPublicV1Hidden(feature)).toBe(false);
      const status = getPublicV1Status(feature);
      expect(['progressive', 'premium_gated']).toContain(status);
    }
  });

  it('archived features are in DISABLED_FEATURES array', () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(DISABLED_FEATURES).toContain(feature);
    }
  });

  it('archived features have disabled_beta release state', () => {
    for (const feature of ARCHIVED_FEATURES) {
      expect(FEATURE_RELEASE_STATES[feature]).toBe('disabled_beta');
    }
  });

  it('active features have core or progressive release state', () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      const state = FEATURE_RELEASE_STATES[feature];
      expect(['core', 'progressive', 'premium_gated']).toContain(state);
    }
  });
});

describe('Final Release Scope — Feature Map Integrity', () => {
  it('every feature key in DISABLED_FEATURES is hidden in feature map', () => {
    for (const feature of DISABLED_FEATURES) {
      expect(isPublicV1Hidden(feature)).toBe(true);
    }
  });

  it('no final-release active feature is in DISABLED_FEATURES', () => {
    for (const feature of FINAL_RELEASE_ACTIVE) {
      expect(DISABLED_FEATURES).not.toContain(feature);
    }
  });

  it('premium_paywall is progressive not hidden', () => {
    expect(isPublicV1Hidden('premium_paywall')).toBe(false);
    expect(getPublicV1Status('premium_paywall')).toBe('progressive');
  });

  it('streak_insurance is hidden', () => {
    expect(isPublicV1Hidden('streak_insurance')).toBe(true);
  });
});
