import {
  featuresAt,
  buildHomeFeatureRuntime,
  getFeatureAvailability,
  HIDDEN_BOOT_FEATURES,
} from './runtime-inert.helpers';

describe('Day 0 runtime inert', () => {
  it('does not query boss, challenges, battle pass, social, or economy at session 0', () => {
    const features = featuresAt(0);
    const runtime = buildHomeFeatureRuntime({ features, totalSessions: 0 });
    expect(runtime.canQueryBoss).toBe(false);
    expect(runtime.canQueryChallenges).toBe(false);
    expect(runtime.canQueryBattlePass).toBe(false);
    expect(runtime.canQueryEconomy).toBe(false);
    expect(runtime.canQuerySquads).toBe(false);
    expect(runtime.canQueryNotifications).toBe(false);
    expect(runtime.canQuerySeasons).toBe(false);
    expect(runtime.canQueryCoach).toBe(false);
  });

  it('allows only core included features to query at day 0', () => {
    const features = featuresAt(0);
    const runtime = buildHomeFeatureRuntime({ features, totalSessions: 0 });
    const focusAvail = getFeatureAvailability(features.focus_session);
    expect(focusAvail.canQuery).toBe(true);
    const progressionAvail = getFeatureAvailability(features.progress_view);
    expect(progressionAvail.canQuery).toBe(true);
  });

  it('hidden features never query at day 0 regardless of degraded override', () => {
    const features = featuresAt(0);
    for (const key of HIDDEN_BOOT_FEATURES) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
    }
  });
});

describe('Hidden battle pass subscription', () => {
  it('cannot subscribe to events', () => {
    const features = featuresAt(0);
    const avail = getFeatureAvailability(features.battle_pass);
    expect(avail.canSubscribeToEvents).toBe(false);
  });

  it('cannot subscribe even at high session counts (hidden permanently)', () => {
    const features = featuresAt(50);
    const avail = getFeatureAvailability(features.battle_pass);
    expect(avail.canSubscribeToEvents).toBe(false);
    expect(avail.canQuery).toBe(false);
  });

  it('cannot show notifications', () => {
    const features = featuresAt(0);
    const avail = getFeatureAvailability(features.battle_pass);
    expect(avail.canShowNotification).toBe(false);
  });
});

describe('Hidden economy inert', () => {
  it('economy_advanced cannot use backend or query at any session count', () => {
    for (const sessions of [0, 3, 10, 50]) {
      const features = featuresAt(sessions);
      const avail = getFeatureAvailability(features.economy_advanced);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canQuery).toBe(false);
    }
  });

  it('spendable economy stays blocked for final release', () => {
    const features = featuresAt(50);
    const basicAvail = getFeatureAvailability(features.economy_basic);
    expect(basicAvail.canQuery).toBe(false);
    const advancedAvail = getFeatureAvailability(features.economy_advanced);
    expect(advancedAvail.canQuery).toBe(false);
  });

  it('cannot subscribe to events for economy_advanced', () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.economy_advanced);
    expect(avail.canSubscribeToEvents).toBe(false);
  });
});

describe('Hidden squads inert', () => {
  it('cannot show notifications', () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.squads);
    expect(avail.canShowNotification).toBe(false);
  });

  it('cannot subscribe to events', () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.squads);
    expect(avail.canSubscribeToEvents).toBe(false);
  });

  it('cannot register route', () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.squads);
    expect(avail.canRegisterRoute).toBe(false);
  });

  it('cannot navigate', () => {
    const features = featuresAt(10);
    const avail = getFeatureAvailability(features.squads);
    expect(avail.canNavigate).toBe(false);
  });
});

describe('Hidden content study inert', () => {
  it('content_study cannot use backend at day 0', () => {
    const features = featuresAt(0);
    const avail = getFeatureAvailability(features.content_study);
    expect(avail.canUseBackend).toBe(false);
  });

  it('content_study locked before minimum sessions', () => {
    const features = featuresAt(3);
    const avail = getFeatureAvailability(features.content_study);
    expect(avail.canQuery).toBe(false);
  });

  it('content_study unlocks at required session count', () => {
    const features = featuresAt(12);
    const avail = getFeatureAvailability(features.content_study);
    expect(avail.canQuery).toBe(true);
    expect(avail.canUseBackend).toBe(true);
  });

  it('degraded content_study blocks backend', () => {
    const features = featuresAt(12, ['content_study']);
    const avail = getFeatureAvailability(features.content_study);
    expect(avail.canUseBackend).toBe(false);
    expect(avail.canQuery).toBe(false);
    expect(avail.state).toBe('degraded');
  });
});
