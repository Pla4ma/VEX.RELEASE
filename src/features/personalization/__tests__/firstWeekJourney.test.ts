/**
 * TASK 3 — FirstWeekExperience product journey tests
 *
 * Verifies first-week arc across all user types and stages.
 */
import { computeFirstWeekRuntime } from '../useFirstWeekExperienceRuntime';
import type { FirstWeekRuntimeInput } from '../useFirstWeekExperienceRuntime';

function baseInput(overrides: Partial<FirstWeekRuntimeInput> = {}): FirstWeekRuntimeInput {
  return {
    completedSessions: 0,
    daysSinceOnboarding: 0,
    daysSinceLastSession: null,
    motivationStyle: 'calm',
    primaryGoal: 'focus',
    bossEngagement: 'none',
    studyUsageRatio: 0,
    isPremium: false,
    featureAvailable: { boss: true, premium: true, social: false, study: true },
    ...overrides,
  };
}

describe('FirstWeekExperience product journey', () => {
  describe('Day 0', () => {
    it('Day 0 calm user — Start First Session primary, boss hidden', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'calm',
        completedSessions: 0,
      }));

      expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
      expect(result.primaryCTA.label).toBe('Start first session');
      expect(result.bossIntensity).toBe('hidden');
      expect(result.premiumMoment).toBe('none');
      expect(result.spotlightSurface).toBe('none');
    });

    it('Day 0 study user — study focus, no premium', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
        completedSessions: 0,
        studyUsageRatio: 0,
      }));

      expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
      expect(result.primaryCTA.intent).toBe('CONTINUE_STUDY_PATH');
      expect(result.studyLayerLabel).toBe('Study OS');
      expect(result.premiumMoment).toBe('none');
    });

    it('Day 0 game-like user — boss teaser allowed in surfaces', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'game_like',
        completedSessions: 0,
        featureAvailable: { boss: true, premium: true, social: false, study: true },
      }));

      expect(result.currentDayStage).toBe('DAY_0_NOT_STARTED');
      expect(result.allowedHomeSurfaces).toContain('tiny_boss_teaser');
      expect(result.bossIntensity).toBe('tiny_tease');
    });
  });

  describe('Day 1 return', () => {
    it('Day 1 — progress proof + next session', () => {
      const result = computeFirstWeekRuntime(baseInput({
        completedSessions: 1,
        daysSinceOnboarding: 1,
        daysSinceLastSession: 0,
      }));

      expect(result.currentDayStage).toBe('DAY_1_RETURN');
      expect(result.spotlightSurface).toBe('progress_proof');
      expect(result.primaryMessage).toBe('Your rhythm is forming. Start the next clean block.');
    });
  });

  describe('Day 3 companion connection', () => {
    it('Day 3 — companion surfaces appear', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'friendly',
        completedSessions: 3,
        daysSinceOnboarding: 3,
        daysSinceLastSession: 0,
      }));

      expect(result.currentDayStage).toBe('DAY_3_COMPANION_CONNECTION');
      expect(result.allowedHomeSurfaces).toContain('companion_continuity');
    });
  });

  describe('Day 5 path forming', () => {
    it('Day 5 — study path + soft premium tease', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'study_focused',
        primaryGoal: 'study',
        completedSessions: 5,
        daysSinceOnboarding: 5,
        daysSinceLastSession: 0,
        studyUsageRatio: 0.4,
      }));

      expect(result.currentDayStage).toBe('DAY_5_PATH_FORMING');
      expect(result.premiumMoment).toBe('soft_tease');
      expect(result.allowedHomeSurfaces).toContain('study_deep_work_path');
    });
  });

  describe('Day 7 deeper mode', () => {
    it('Day 7 — weekly insight + premium value moment', () => {
      const result = computeFirstWeekRuntime(baseInput({
        completedSessions: 7,
        daysSinceOnboarding: 7,
        daysSinceLastSession: 0,
        featureAvailable: { boss: true, premium: true, social: false, study: true },
      }));

      expect(result.currentDayStage).toBe('DAY_7_DEEPER_MODE');
      expect(result.premiumMoment).toBe('weekly_value');
    });
  });

  describe('Comeback user', () => {
    it('missed several days — comeback state activated', () => {
      const result = computeFirstWeekRuntime(baseInput({
        completedSessions: 3,
        daysSinceOnboarding: 10,
        daysSinceLastSession: 5,
      }));

      expect(result.comebackState).toBe('missed_week');
      expect(result.coachMessageType).toBe('comeback');
      expect(result.allowedHomeSurfaces).toContain('recovery_cta');
    });
  });

  describe('Premium gating', () => {
    it('premium unavailable — premiumMoment is none', () => {
      const result = computeFirstWeekRuntime(baseInput({
        completedSessions: 7,
        daysSinceOnboarding: 7,
        featureAvailable: { boss: true, premium: false, social: false, study: true },
      }));

      expect(result.premiumMoment).toBe('none');
    });

    it('premium configured but not active — premium moment follows stage', () => {
      const result = computeFirstWeekRuntime(baseInput({
        completedSessions: 5,
        daysSinceOnboarding: 5,
        isPremium: false,
        featureAvailable: { boss: true, premium: true, social: false, study: true },
      }));

      expect(result.premiumMoment).toBe('soft_tease');
    });
  });

  describe('Boss gating', () => {
    it('boss unavailable — bossIntensity hidden', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'game_like',
        completedSessions: 5,
        featureAvailable: { boss: false, premium: true, social: false, study: true },
      }));

      expect(result.bossIntensity).toBe('hidden');
    });

    it('minimal user — boss stays hidden', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'calm',
        completedSessions: 5,
        featureAvailable: { boss: true, premium: true, social: false, study: true },
      }));

      expect(result.bossIntensity).toBe('hidden');
    });
  });

  describe('Content study gating', () => {
    it('study degraded — study surfaces may be limited', () => {
      const result = computeFirstWeekRuntime(baseInput({
        motivationStyle: 'study_focused',
        completedSessions: 5,
        featureAvailable: { boss: true, premium: true, social: false, study: false },
      }));

      expect(result.currentDayStage).toBe('DAY_5_PATH_FORMING');
    });
  });
});
