import {
  availabilityFor,
  GAMER_PROFILE,
  CALM_PROFILE,
  buildFeatureAccess,
  buildRootExposureFlags,
  buildHomeFeatureRuntime,
  getFeatureAvailability,
  allFlagsOn,
} from './helpers';

// ============================================================================
// 0.10 — First 7 days journey: the critical path must be clean
// ============================================================================

describe('first 7 days journey', () => {
  it('day 0: only core features visible, nothing else registered', () => {
    const { features, productTier, stage } = buildFeatureAccess({
      totalCompletedSessions: 0,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    expect(stage).toBe('NEW_USER');
    expect(productTier).toBe('CORE_EXECUTION');
    expect(features.focus_session.isUnlocked).toBe(true);
    expect(features.home_tab.isUnlocked).toBe(true);
    expect(features.focus_tab.isUnlocked).toBe(true);
    expect(features.progress_view.isUnlocked).toBe(true);
    expect(features.ai_coach_basic.isUnlocked).toBe(true);

    expect(show.challenges).toBe(false);
    expect(show.boss).toBe(false);
    expect(show.study).toBe(false);
    expect(show.coach).toBe(false);
    expect(show.companion).toBe(false);
  });

  it('day 1-2: companion teases, nothing else unlocks', () => {
    const { features, stage } = buildFeatureAccess({
      totalCompletedSessions: 2,
    });
    expect(stage).toBe('ACTIVATING');
    expect(features.companion_detail.isTeased).toBe(true);
    expect(features.companion_detail.isUnlocked).toBe(false);
    expect(features.challenges.isUnlocked).toBe(false);
    expect(features.boss_tab.isUnlocked).toBe(false);
  });

  it('day 3: companion detail unlocks', () => {
    const avail = availabilityFor(3, 'companion_detail');
    expect(avail.state).toBe('unlocked');
  });

  it('day 5: challenges unlock for default profile', () => {
    const avail = availabilityFor(5, 'challenges');
    expect(avail.state).toBe('unlocked');
  });

  it('day 7: boss unlocks for game_like profile, but not for calm', () => {
    const gamerBoss = availabilityFor(7, 'boss_tab', GAMER_PROFILE);
    expect(gamerBoss.state).toBe('unlocked');

    const calmBoss = availabilityFor(7, 'boss_tab', CALM_PROFILE);
    expect(calmBoss.state).toBe('disabled');
  });

  it('full 20-session progression: all progressive features unlocked for gamer', () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 20,
      motivationProfile: GAMER_PROFILE,
    });
    expect(features.challenges.isUnlocked).toBe(true);
    expect(features.companion_detail.isUnlocked).toBe(true);
    expect(features.boss_tab.isUnlocked).toBe(true);
    expect(features.economy_basic.isUnlocked).toBe(false);
    expect(features.achievements.isUnlocked).toBe(true);
    expect(features.ai_coach_advanced.isUnlocked).toBe(true);
    expect(features.content_study.isUnlocked).toBe(true);
    expect(features.quiz_review_mode.isUnlocked).toBe(true);
    expect(features.advanced_settings.isUnlocked).toBe(true);
    expect(features.seasonal_features.isUnlocked).toBe(false);

    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.shop.isUnlocked).toBe(false);
  });
});

// ============================================================================
// 0.8 — Single source of truth: every system uses getFeatureAvailability
// ============================================================================

describe('single source of truth', () => {
  it('FeatureAvailability contract is consumed by home feature runtime', () => {
    const { features, productTier } = buildFeatureAccess({
      totalCompletedSessions: 10,
      motivationProfile: GAMER_PROFILE,
    });
    const runtime = buildHomeFeatureRuntime({
      features,
      productTier,
      totalSessions: 10,
    });

    const bossAvail = getFeatureAvailability(features.boss_tab);
    expect(runtime.canQueryBoss).toBe(bossAvail.canQuery);

    const challengesAvail = getFeatureAvailability(features.challenges);
    expect(runtime.canQueryChallenges).toBe(challengesAvail.canQuery);

    const studyAvail = getFeatureAvailability(features.content_study);
    expect(runtime.canQueryStudy).toBe(studyAvail.canQuery);
  });

  it('FeatureAvailability contract is consumed by route exposure', () => {
    const { features } = buildFeatureAccess({
      totalCompletedSessions: 10,
      motivationProfile: GAMER_PROFILE,
    });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });

    const bossAvail = getFeatureAvailability(features.boss_tab);
    expect(show.boss).toBe(bossAvail.canNavigate && bossAvail.canRegisterRoute);

    const challengesAvail = getFeatureAvailability(features.challenges);
    expect(show.challenges).toBe(
      challengesAvail.canNavigate && challengesAvail.canRegisterRoute,
    );
  });

  it('does not leak disabled feature access through any path', () => {
    const { features } = buildFeatureAccess({ totalCompletedSessions: 999 });
    const show = buildRootExposureFlags({ features, isEnabled: allFlagsOn });
    const runtime = buildHomeFeatureRuntime(features, 'RPG_DEPTH');

    expect(show.battlePass).toBe(false);
    expect(runtime.canQueryBattlePass).toBe(false);
    expect(features.battle_pass.isUnlocked).toBe(false);
    expect(features.battle_pass.isVisible).toBe(false);

    const avail = getFeatureAvailability(features.battle_pass);
    expect(avail.canRegisterRoute).toBe(false);
    expect(avail.canSubscribeToEvents).toBe(false);
    expect(avail.canShowNotification).toBe(false);
  });
});
