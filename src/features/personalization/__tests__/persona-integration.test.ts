import { resolveVexExperience } from '../service';
import type { BehaviorStats, VexPersonalizationProfile } from '../schemas';

const baseAvailability = { boss: true, challenges: true, premium: false, study: true };

function profile(style: string): VexPersonalizationProfile {
  return {
    primaryGoal: style === 'study_focused' ? 'study' : style === 'calm' ? 'personal' : 'work',
    motivationStyle: style as VexPersonalizationProfile['motivationStyle'],
    preferredTone: style === 'intense' ? 'direct' : style === 'coach_led' ? 'strategic' : 'soft',
    gamificationIntensity: style === 'game_like' || style === 'intense' ? 'strong' : 'medium',
    coachMode: 'reflection',
    studyLayerName: style === 'study_focused' ? 'Study OS' : 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: 'FOCUS',
    userStage: 'new',
  };
}

function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    totalCompletedSessions: 0,
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
    ...overrides,
  };
}

describe('VexExperience — resolved experience integration tests', () => {
  describe('Calm work user', () => {
    const exp = resolveVexExperience(profile('calm'), stats(), baseAvailability);

    it('has subtle boss intensity', () => {
      expect(exp.bossIntensity).toBe('subtle');
    });

    it('boss is not visible on day 0', () => {
      expect(exp.boss.isVisible).toBe(false);
    });

    it('home does not include boss', () => {
      expect(exp.homeSections).not.toContain('boss_teaser');
      expect(exp.homeSections).not.toContain('boss_compact');
    });

    it('study layer is not prominent', () => {
      expect(exp.studyLayerProminence).toBe('supporting');
    });

    it('does not allow boss notification', () => {
      expect(exp.allowedNotificationTypes).not.toContain('boss_momentum');
    });

    it('completion has no boss effect', () => {
      expect(exp.completionSequence).not.toContain('boss_effect');
    });
  });

  describe('Study-focused student', () => {
    const exp = resolveVexExperience(profile('study_focused'), stats({ studyUsageRatio: 0.6 }), baseAvailability);

    it('has subtle boss intensity', () => {
      expect(exp.bossIntensity).toBe('subtle');
    });

    it('study layer is prominent', () => {
      expect(exp.studyLayerProminence).toBe('spotlight');
    });

    it('home includes study layer', () => {
      expect(exp.homeSections).toContain('study_layer');
    });

    it('study layer label is Study OS', () => {
      expect(exp.studyLayerLabel).toBe('Study OS');
    });

    it('completion includes study progress', () => {
      expect(exp.completionSequence).toContain('study_progress');
    });

    it('primary CTA is continue study path', () => {
      expect(exp.primaryHomeCTA.intent).toBe('CONTINUE_STUDY_PATH');
    });
  });

  describe('Game-like focus user', () => {
    const exp = resolveVexExperience(
      profile('game_like'),
      stats({ totalCompletedSessions: 3, bossChallengeEngagement: 'high' }),
      baseAvailability,
    );

    it('has game-like boss intensity', () => {
      expect(exp.bossIntensity).toBe('game-like');
    });

    it('boss is visible', () => {
      expect(exp.boss.isVisible).toBe(true);
    });

    it('home includes boss compact', () => {
      expect(exp.homeSections).toContain('boss_compact');
    });

    it('completion has boss effect', () => {
      expect(exp.completionSequence).toContain('boss_effect');
    });

    it('boss route is allowed', () => {
      expect(exp.allowedRoutes).toContain('Boss');
    });
  });

  describe('Coach-led user', () => {
    const exp = resolveVexExperience(
      profile('coach_led'),
      stats({ totalCompletedSessions: 3, coachInteractions: 5 }),
      baseAvailability,
    );

    it('home layout is coach_first', () => {
      expect(exp.homeLayoutVariant).toBe('coach_first');
    });

    it('has strategic coach tone', () => {
      expect(exp.coachTone).toBe('strategic');
    });

    it('boss is subtle for coach-led', () => {
      expect(exp.bossIntensity).toBe('subtle');
    });
  });

  describe('Creative/project user', () => {
    const exp = resolveVexExperience(
      { ...profile('coach_led'), primaryGoal: 'creative', studyLayerName: 'Project Focus Path', defaultSessionMode: 'CREATIVE' },
      stats({ totalCompletedSessions: 2 }),
      baseAvailability,
    );

    it('study layer label is Project Focus Path', () => {
      expect(exp.studyLayerLabel).toBe('Project Focus Path');
    });

    it('default session mode is CREATIVE', () => {
      expect(exp.sessionDefaults.mode).toBe('CREATIVE');
    });
  });

  describe('Learning non-student', () => {
    const exp = resolveVexExperience(
      { ...profile('coach_led'), primaryGoal: 'learning', studyLayerName: 'Learning OS' },
      stats({ studyUsageRatio: 0.5 }),
      baseAvailability,
    );

    it('study layer label is Learning OS', () => {
      expect(exp.studyLayerLabel).toBe('Learning OS');
    });

    it('study layer is prominent', () => {
      expect(exp.studyLayerProminence).toBe('spotlight');
    });
  });

  describe('User who ignores boss', () => {
    const exp = resolveVexExperience(
      profile('game_like'),
      stats({
        totalCompletedSessions: 8,
        bossChallengeEngagement: 'none',
        ignoredFeatures: ['boss_tab'],
        completedSessionDurations: [25, 25, 25],
      }),
      baseAvailability,
    );

    it('boss is marked in teased systems', () => {
      expect(exp.teasedSystems).toContain('boss_tab');
    });

    it('behavior adaptations include boss_ignored', () => {
      expect(exp.behaviorAdaptations).toContain('boss_ignored');
    });

    it('boss intensity remains game-like', () => {
      expect(exp.bossIntensity).toBe('game-like');
    });
  });

  describe('User who uses Study heavily', () => {
    const exp = resolveVexExperience(
      profile('coach_led'),
      stats({ totalCompletedSessions: 6, studyUsageRatio: 0.8 }),
      baseAvailability,
    );

    it('study layer is prominent', () => {
      expect(exp.studyLayerProminence).toBe('spotlight');
    });

    it('primary CTA is continue study path', () => {
      expect(exp.primaryHomeCTA.intent).toBe('CONTINUE_STUDY_PATH');
    });

    it('premium moment triggers advanced study', () => {
      expect(exp.premiumMoment).toBe('advanced_study');
    });
  });

  describe('Premium unavailable', () => {
    const noPremium = { ...baseAvailability, premium: false };
    const exp = resolveVexExperience(profile('coach_led'), stats({ totalCompletedSessions: 10 }), noPremium);

    it('premium is not teased', () => {
      expect(exp.premium.shouldTease).toBe(false);
    });

    it('premium trigger is none', () => {
      expect(exp.premium.trigger).toBe('none');
    });
  });

  describe('Content Study degraded', () => {
    const noStudy = { ...baseAvailability, study: false };
    const exp = resolveVexExperience(profile('study_focused'), stats({ totalCompletedSessions: 5 }), noStudy);

    it('study layer stays visible for study users even when content_study is unavailable', () => {
      expect(exp.studyLayerProminence).toBe('spotlight');
    });

    it('study route is not allowed when feature unavailable', () => {
      expect(exp.allowedRoutes).not.toContain('ContentStudy');
    });
  });
});
