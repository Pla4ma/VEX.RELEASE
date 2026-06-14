import {
  SignalTypeSchema,
  CompositeScoreSchema,
  FeatureUnlockStateSchema,
  DEFAULT_WEIGHTS,
  FEATURE_SCORE_THRESHOLDS,
  TEASER_STARTS,
} from '../schemas';

describe('unlock-system schemas', () => {
  describe('SignalTypeSchema', () => {
    it('accepts all valid signal types', () => {
      const validTypes = [
        'session_completed',
        'plan_item_created',
        'plan_item_completed',
        'capture_created',
        'coach_interaction',
        'streak_maintained',
        'project_created',
        'study_plan_created',
      ];
      for (const type of validTypes) {
        expect(SignalTypeSchema.safeParse(type).success).toBe(true);
      }
    });

    it('rejects invalid signal types', () => {
      expect(SignalTypeSchema.safeParse('invalid_signal').success).toBe(false);
    });
  });

  describe('CompositeScoreSchema', () => {
    it('accepts valid composite score', () => {
      const score = {
        total: 10,
        sessionScore: 4,
        planScore: 2,
        captureScore: 1,
        coachScore: 2,
        streakScore: 1,
        signalsUsed: 5,
      };
      const result = CompositeScoreSchema.safeParse(score);
      expect(result.success).toBe(true);
    });

    it('applies defaults for optional fields', () => {
      const result = CompositeScoreSchema.safeParse({ total: 5 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionScore).toBe(0);
        expect(result.data.planScore).toBe(0);
        expect(result.data.captureScore).toBe(0);
        expect(result.data.coachScore).toBe(0);
        expect(result.data.streakScore).toBe(0);
        expect(result.data.signalsUsed).toBe(0);
      }
    });

    it('rejects negative values', () => {
      expect(CompositeScoreSchema.safeParse({ total: -1 }).success).toBe(false);
      expect(CompositeScoreSchema.safeParse({ total: 0, sessionScore: -1 }).success).toBe(false);
    });
  });

  describe('FeatureUnlockStateSchema', () => {
    it('accepts valid unlock state', () => {
      const state = {
        featureId: 'focus_run',
        unlocked: true,
        progress: 100,
        requiredScore: 4,
        currentScore: 5,
        remainingScore: 0,
        teaser: false,
      };
      const result = FeatureUnlockStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('applies default teaser', () => {
      const { teaser, ...state } = {
        featureId: 'test',
        unlocked: false,
        progress: 50,
        requiredScore: 10,
        currentScore: 5,
        remainingScore: 5,
        teaser: false,
      };
      const result = FeatureUnlockStateSchema.safeParse(state);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teaser).toBe(false);
      }
    });

    it('rejects progress over 100', () => {
      const state = {
        featureId: 'test',
        unlocked: false,
        progress: 101,
        requiredScore: 10,
        currentScore: 5,
        remainingScore: 5,
        teaser: false,
      };
      expect(FeatureUnlockStateSchema.safeParse(state).success).toBe(false);
    });
  });
});