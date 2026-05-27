import { resolveVexExperience, profile, stats, baseAvailability } from './persona-integration-helpers';

describe('VexExperience — core profile resolution', () => {
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
});
