import {
  deriveBossEngagementLevel,
  type BossEngagementInputs,
} from './boss-helpers';

describe('boss engagement level derivation', () => {
  it('returns none when boss is ignored', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: true,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 10,
      bossCTAClickedCount: 10,
      bossDamageEventsCount: 5,
      recentSessionsWithBossProgress: 3,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('returns none when boss is not unlocked', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: false,
      canQueryBoss: false,
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('returns none regardless of engagement signals (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 1,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('stays none with many signals (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 2,
      bossCTAClickedCount: 1,
      bossDamageEventsCount: 1,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('stays none with high signal count (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 3,
      bossCTAClickedCount: 3,
      bossDamageEventsCount: 2,
      recentSessionsWithBossProgress: 1,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });
});

describe('engagement signals reset on ignored', () => {
  it('ignored boss yields none engagement regardless of signal count', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: true,
      bossUnlocked: true,
      canQueryBoss: false,
      bossRouteOpenedCount: 20,
      bossCTAClickedCount: 15,
      bossDamageEventsCount: 10,
      recentSessionsWithBossProgress: 5,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('returns none when boss is not unlocked (boss system deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: false,
      canQueryBoss: false,
      bossRouteOpenedCount: 0,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('returns none regardless of engagement signals (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 1,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('stays none even with many signals (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 2,
      bossCTAClickedCount: 2,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });

  it('stays none with high signal count (boss deactivated)', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 5,
      bossCTAClickedCount: 5,
      bossDamageEventsCount: 2,
      recentSessionsWithBossProgress: 1,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('none');
  });
});
