/**
 * Boss engagement signals tests — verifies boss intensity responds to real
 * user engagement, not default/hardcoded values.
 */
import { describe, it, expect } from '@jest/globals';
import {
  deriveBossEngagementLevel,
  type BossEngagementInputs,
} from '../../../features/boss/boss-engagement-signals';
import { resolveBossIntensity } from '../../../features/personalization/experience-service-helpers';
import type { BehaviorStats, VexPersonalizationProfile } from '../../../features/personalization/schemas';

const calmProfile: VexPersonalizationProfile = {
  primaryGoal: 'study',
  motivationStyle: 'calm',
  preferredTone: 'soft',
  gamificationIntensity: 'minimal',
  coachMode: 'reflection',
  studyLayerName: 'Study OS',
  defaultSessionDuration: 25,
  defaultSessionMode: 'FOCUS',
  userStage: 'new',
};

const gameLikeProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'game_like',
  preferredTone: 'direct',
  gamificationIntensity: 'strong',
  coachMode: 'game_guide',
};

const intenseProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'intense',
  preferredTone: 'direct',
  gamificationIntensity: 'strong',
  coachMode: 'tactical',
};

const studyFocusedProfile: VexPersonalizationProfile = {
  ...calmProfile,
  motivationStyle: 'study_focused',
  preferredTone: 'strategic',
  coachMode: 'study_tutor',
};

const baseStats: BehaviorStats = {
  abandonedSessionDurations: [],
  bossChallengeEngagement: 'none',
  coachInteractions: 0,
  comebackSessions: 0,
  completedSessionDurations: [],
  completionStreak: 0,
  ignoredFeatures: [],
  mostSuccessfulTimeOfDay: null,
  preferredSessionMode: null,
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 3,
};

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

  it('returns low with one engagement signal', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 1,
      bossCTAClickedCount: 0,
      bossDamageEventsCount: 0,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('low');
  });

  it('returns medium with four total signals', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 2,
      bossCTAClickedCount: 1,
      bossDamageEventsCount: 1,
      recentSessionsWithBossProgress: 0,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('medium');
  });

  it('returns high with eight or more total signals', () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 3,
      bossCTAClickedCount: 3,
      bossDamageEventsCount: 2,
      recentSessionsWithBossProgress: 1,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe('high');
  });
});

describe('boss intensity with real engagement signals', () => {
  it('game-like + high boss engagement = game-like intensity', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'high',
    };
    expect(resolveBossIntensity(gameLikeProfile, stats)).toBe('game-like');
  });

  it('game-like + low boss engagement = game-like (profile driven)', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'low',
    };
    expect(resolveBossIntensity(gameLikeProfile, stats)).toBe('game-like');
  });

  it('calm + any boss engagement = subtle', () => {
    const highEngagement: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'high',
    };
    expect(resolveBossIntensity(calmProfile, highEngagement)).toBe('subtle');
  });

  it('intense + high boss engagement = intense (full boss)', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'high',
    };
    expect(resolveBossIntensity(intenseProfile, stats)).toBe('intense');
  });

  it('ignored boss is reflected via bossChallengeEngagement none', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'none',
      ignoredFeatures: ['boss_tab'],
    };
    const result = resolveBossIntensity(gameLikeProfile, stats);
    expect(result).toBe('game-like');
  });

  it('study-heavy user defaults to subtle regardless of engagement', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'high',
      studyUsageRatio: 0.8,
    };
    expect(resolveBossIntensity(studyFocusedProfile, stats)).toBe('subtle');
  });

  it('calm with ignored boss stays subtle', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'none',
      ignoredFeatures: ['boss_tab'],
    };
    expect(resolveBossIntensity(calmProfile, stats)).toBe('subtle');
  });

  it('medium engagement on friendly profile returns standard (engagement-driven)', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'medium',
    };
    const friendlyProfile: VexPersonalizationProfile = {
      ...calmProfile,
      motivationStyle: 'friendly',
    };
    expect(resolveBossIntensity(friendlyProfile, stats)).toBe('standard');
  });

  it('high engagement on coach_led profile returns game-like', () => {
    const stats: BehaviorStats = {
      ...baseStats,
      bossChallengeEngagement: 'high',
    };
    const coachProfile: VexPersonalizationProfile = {
      ...calmProfile,
      motivationStyle: 'coach_led',
      preferredTone: 'strategic',
      coachMode: 'mentor',
    };
    expect(resolveBossIntensity(coachProfile, stats)).toBe('game-like');
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
});
