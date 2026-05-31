/**
 * Liveops Config Feature — computeFeatureAccess Tests
 */

import { computeFeatureAccess } from '../feature-resolution';
import type { FeatureKey } from '../feature-access-types';

describe('computeFeatureAccess', () => {
  it('unlocks feature when threshold met and deps satisfied', () => {
    const result = computeFeatureAccess({
      feature: 'focus_session',
      sessions: 0,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(true);
    expect(result.isVisible).toBe(true);
  });

  it('locks feature when threshold not met', () => {
    const result = computeFeatureAccess({
      feature: 'challenges',
      sessions: 0,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(false);
  });

  it('disables deactivated features regardless of sessions', () => {
    const result = computeFeatureAccess({
      feature: 'battle_pass',
      sessions: 1000,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isUnlocked).toBe(false);
    expect(result.isVisible).toBe(false);
  });

  it('shows teaser when sessions >= teaserStart', () => {
    const result = computeFeatureAccess({
      feature: 'companion_detail',
      sessions: 2,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isTeased).toBe(true);
    expect(result.isUnlocked).toBe(false);
  });

  it('does not show teaser below teaserStart', () => {
    const result = computeFeatureAccess({
      feature: 'companion_detail',
      sessions: 1,
      profile: undefined,
      unlockedFeatures: new Set(),
    });
    expect(result.isTeased).toBe(false);
  });

  it('locks feature when dependencies not met', () => {
    // content_study depends on ai_coach_basic, focus_session, progress_view
    const result = computeFeatureAccess({
      feature: 'content_study',
      sessions: 100,
      profile: undefined,
      unlockedFeatures: new Set<FeatureKey>(['focus_session', 'progress_view']),
      // missing ai_coach_basic
    });
    expect(result.isUnlocked).toBe(false);
  });

  it('returns correct releaseState', () => {
    const result = computeFeatureAccess({
      feature: 'focus_session',
      sessions: 0,
      profile: undefined,
    });
    expect(result.releaseState).toBe('final_release_core');
  });
});
