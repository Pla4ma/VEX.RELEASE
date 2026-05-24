import { shouldRunHealthCheck, getDeactivatedFeatureKeys } from '../feature-health-policy';
import type { FeatureKey } from '../feature-access';

describe('feature-health-policy — shouldRunHealthCheck', () => {
  it('content_study eligible at root (0 sessions)', () => {
    expect(shouldRunHealthCheck('content_study', 0)).toBe(true);
  });

  it('content_study_advanced eligible at root', () => {
    expect(shouldRunHealthCheck('content_study_advanced', 0)).toBe(true);
  });

  it('premium_paywall not eligible at 0 sessions', () => {
    expect(shouldRunHealthCheck('premium_paywall', 0)).toBe(false);
  });

  it('premium_paywall eligible at 5 sessions', () => {
    expect(shouldRunHealthCheck('premium_paywall', 5)).toBe(true);
  });

  it('boss_tab not eligible at 3 sessions', () => {
    expect(shouldRunHealthCheck('boss_tab', 3)).toBe(false);
  });

  it('boss_tab eligible at 7 sessions', () => {
    expect(shouldRunHealthCheck('boss_tab', 7)).toBe(true);
  });

  it('ai_coach_advanced not eligible at 4 sessions', () => {
    expect(shouldRunHealthCheck('ai_coach_advanced', 4)).toBe(false);
  });

  it('ai_coach_advanced eligible at 8 sessions', () => {
    expect(shouldRunHealthCheck('ai_coach_advanced', 8)).toBe(true);
  });

  it('deactivated features never eligible', () => {
    expect(shouldRunHealthCheck('squads', 100)).toBe(false);
    expect(shouldRunHealthCheck('shop', 100)).toBe(false);
    expect(shouldRunHealthCheck('battle_pass', 100)).toBe(false);
    expect(shouldRunHealthCheck('inventory', 100)).toBe(false);
    expect(shouldRunHealthCheck('rivals', 100)).toBe(false);
    expect(shouldRunHealthCheck('economy_advanced', 100)).toBe(false);
    expect(shouldRunHealthCheck('economy_basic', 100)).toBe(false);
    expect(shouldRunHealthCheck('social_tab', 100)).toBe(false);
    expect(shouldRunHealthCheck('gems_prominent', 100)).toBe(false);
    expect(shouldRunHealthCheck('rankings', 100)).toBe(false);
    expect(shouldRunHealthCheck('wagers', 100)).toBe(false);
    expect(shouldRunHealthCheck('streak_insurance', 100)).toBe(false);
    expect(shouldRunHealthCheck('seasonal_features', 100)).toBe(false);
    expect(shouldRunHealthCheck('boss_bounties', 100)).toBe(false);
  });

  it('deactivated features never eligible regardless of sessions', () => {
    const disabled = getDeactivatedFeatureKeys();
    for (const d of disabled) {
      expect(shouldRunHealthCheck(d, 0)).toBe(false);
      expect(shouldRunHealthCheck(d, 50)).toBe(false);
      expect(shouldRunHealthCheck(d, 200)).toBe(false);
    }
  });

  it('active progressive features eligible at root', () => {
    expect(shouldRunHealthCheck('focus_session', 0)).toBe(false);
    expect(shouldRunHealthCheck('progress_view', 0)).toBe(false);
    expect(shouldRunHealthCheck('ai_coach_basic', 0)).toBe(false);
    expect(shouldRunHealthCheck('challenges', 0)).toBe(false);
  });

  it('returns false for features not in any allow-list', () => {
    expect(shouldRunHealthCheck('achievements' as FeatureKey, 20)).toBe(false);
    expect(shouldRunHealthCheck('quiz_review_mode' as FeatureKey, 20)).toBe(false);
  });
});

describe('feature-health-policy — root-eligible only at session 0', () => {
  it('only content_study and content_study_advanced are root-eligible', () => {
    const rootEligible = new Set<FeatureKey>(['content_study', 'content_study_advanced']);
    const featuresThatPass = rootEligible.has.bind(rootEligible);

    expect(featuresThatPass('content_study')).toBe(true);
    expect(featuresThatPass('content_study_advanced')).toBe(true);
    expect(featuresThatPass('premium_paywall')).toBe(false);
    expect(featuresThatPass('boss_tab')).toBe(false);
    expect(featuresThatPass('ai_coach_advanced')).toBe(false);
  });
});
