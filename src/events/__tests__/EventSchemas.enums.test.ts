import {
  EventTypeSchema,
  EventStatusSchema,
  ChallengeTypeSchema,
  ChallengeStatusSchema,
} from '../EventSchemas';

describe('EventTypeSchema', () => {
  it('accepts valid event types', () => {
    expect(EventTypeSchema.safeParse('DAILY').success).toBe(true);
    expect(EventTypeSchema.safeParse('WEEKLY').success).toBe(true);
    expect(EventTypeSchema.safeParse('WEEKEND').success).toBe(true);
    expect(EventTypeSchema.safeParse('SEASONAL').success).toBe(true);
    expect(EventTypeSchema.safeParse('SPECIAL').success).toBe(true);
    expect(EventTypeSchema.safeParse('COMPETITION').success).toBe(true);
    expect(EventTypeSchema.safeParse('COMMUNITY').success).toBe(true);
  });

  it('rejects invalid event types', () => {
    expect(EventTypeSchema.safeParse('INVALID').success).toBe(false);
    expect(EventTypeSchema.safeParse('').success).toBe(false);
    expect(EventTypeSchema.safeParse(123).success).toBe(false);
  });
});

describe('EventStatusSchema', () => {
  it('accepts valid event statuses', () => {
    expect(EventStatusSchema.safeParse('UPCOMING').success).toBe(true);
    expect(EventStatusSchema.safeParse('ACTIVE').success).toBe(true);
    expect(EventStatusSchema.safeParse('ENDING_SOON').success).toBe(true);
    expect(EventStatusSchema.safeParse('ENDED').success).toBe(true);
  });

  it('rejects invalid event statuses', () => {
    expect(EventStatusSchema.safeParse('RUNNING').success).toBe(false);
    expect(EventStatusSchema.safeParse('').success).toBe(false);
  });
});

describe('ChallengeTypeSchema', () => {
  it('accepts valid challenge types', () => {
    expect(ChallengeTypeSchema.safeParse('SESSION_COUNT').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('SESSION_DURATION').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('STREAK_DAYS').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('XP_EARNED').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('CURRENCY_EARNED').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('SOCIAL_SHARES').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('LEVEL_REACHED').success).toBe(true);
    expect(ChallengeTypeSchema.safeParse('ACHIEVEMENT_UNLOCKED').success).toBe(true);
  });

  it('rejects invalid challenge types', () => {
    expect(ChallengeTypeSchema.safeParse('INVALID').success).toBe(false);
  });
});

describe('ChallengeStatusSchema', () => {
  it('accepts valid challenge statuses', () => {
    expect(ChallengeStatusSchema.safeParse('LOCKED').success).toBe(true);
    expect(ChallengeStatusSchema.safeParse('ACTIVE').success).toBe(true);
    expect(ChallengeStatusSchema.safeParse('COMPLETED').success).toBe(true);
    expect(ChallengeStatusSchema.safeParse('CLAIMED').success).toBe(true);
    expect(ChallengeStatusSchema.safeParse('EXPIRED').success).toBe(true);
  });

  it('rejects invalid challenge statuses', () => {
    expect(ChallengeStatusSchema.safeParse('DONE').success).toBe(false);
  });
});