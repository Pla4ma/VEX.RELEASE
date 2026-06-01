/**
 * Tests for home-spine priority and tomorrow-preview schemas
 * (HomePriorityTypeSchema, HomePriorityCTAActionSchema, HomePrimaryPrioritySchema,
 *  HomeStakesSchema, HomeProgressSchema, HomePrioritySchema,
 *  TomorrowPreviewTypeSchema, TomorrowPreviewDataSchema)
 */

import {
  HomePriorityTypeSchema,
  HomePriorityCTAActionSchema,
  HomePrimaryPrioritySchema,
  HomeStakesSchema,
  HomeProgressSchema,
  HomePrioritySchema,
} from '../priority-core-schemas';

import {
  TomorrowPreviewTypeSchema,
  TomorrowPreviewDataSchema,
} from '../tomorrow-preview-schemas';

// ---------------------------------------------------------------------------
// Priority schema validation tests
// ---------------------------------------------------------------------------
describe('home-spine: priority & preview schemas', () => {
  describe('Priority schemas', () => {
    it('HomePriorityTypeSchema validates all priority types', () => {
      const types = [
        'STREAK_CRITICAL',
        'COMPANION_PROMISE',
        'PROMISE_RECOVERY',
        'STREAK_AT_RISK',
        'RECOMMENDED_SESSION',
        'CHALLENGE_NEAR_DONE',
        'BOSS_ACTIVE',
        'DEFAULT_SESSION',
      ];
      for (const t of types) {
        expect(HomePriorityTypeSchema.safeParse(t).success).toBe(true);
      }
      expect(HomePriorityTypeSchema.safeParse('INVALID').success).toBe(false);
    });

    it('HomePriorityCTAActionSchema validates all actions', () => {
      expect(HomePriorityCTAActionSchema.safeParse('OPEN_BOSS').success).toBe(true);
      expect(HomePriorityCTAActionSchema.safeParse('OPEN_CHALLENGES').success).toBe(true);
      expect(HomePriorityCTAActionSchema.safeParse('OPEN_SESSION_SETUP').success).toBe(true);
    });

    it('HomePrimaryPrioritySchema validates a complete priority', () => {
      const result = HomePrimaryPrioritySchema.safeParse({
        type: 'STREAK_CRITICAL',
        urgency: 100,
        reason: 'test',
        cta: { action: 'OPEN_SESSION_SETUP', text: 'Save' },
      });
      expect(result.success).toBe(true);
    });

    it('HomeProgressSchema validates correctly', () => {
      const result = HomeProgressSchema.safeParse({
        dailyGoalMinutes: 60,
        streakDays: 5,
        todayMinutes: 30,
      });
      expect(result.success).toBe(true);
    });

    it('HomeStakesSchema validates correctly', () => {
      const result = HomeStakesSchema.safeParse({
        what: 'Focus session',
        potentialGain: 'XP',
      });
      expect(result.success).toBe(true);
    });

    it('HomePrioritySchema validates a full priority object', () => {
      const result = HomePrioritySchema.safeParse({
        primary: {
          type: 'DEFAULT_SESSION',
          urgency: 10,
          reason: 'test',
          cta: { action: 'OPEN_SESSION_SETUP', text: 'Start' },
        },
        progress: { dailyGoalMinutes: 60, streakDays: 0, todayMinutes: 0 },
        secondary: [],
        stakes: { what: 'Focus' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Tomorrow preview schemas', () => {
    it('TomorrowPreviewTypeSchema validates all types', () => {
      const types = [
        'STREAK_MILESTONE',
        'BOSS_NEAR_DEATH',
        'RIVAL_GAP',
        'POWER_HOUR',
        'CHALLENGE_RESET',
        'GENERIC',
      ];
      for (const t of types) {
        expect(TomorrowPreviewTypeSchema.safeParse(t).success).toBe(true);
      }
    });

    it('TomorrowPreviewDataSchema validates a complete preview', () => {
      const result = TomorrowPreviewDataSchema.safeParse({
        type: 'GENERIC',
        emoji: '✨',
        headline: 'New Day',
        subtext: 'Fresh start',
        priority: 6,
      });
      expect(result.success).toBe(true);
    });

    it('TomorrowPreviewDataSchema rejects empty headline', () => {
      const result = TomorrowPreviewDataSchema.safeParse({
        type: 'GENERIC',
        emoji: '✨',
        headline: '',
        subtext: 'text',
        priority: 6,
      });
      expect(result.success).toBe(false);
    });
  });
});
