import { RewardTypeSchema, RewardTriggerSchema } from '../schemas';

describe('RewardTypeSchema', () => {
  it('accepts XP', () => {
    expect(RewardTypeSchema.safeParse('XP').success).toBe(true);
  });

  it('rejects other types', () => {
    expect(RewardTypeSchema.safeParse('COINS').success).toBe(false);
    expect(RewardTypeSchema.safeParse('GEMS').success).toBe(false);
  });
});

describe('RewardTriggerSchema', () => {
  it('accepts valid triggers', () => {
    for (const t of ['SESSION', 'STREAK', 'ACHIEVEMENT', 'COMEBACK', 'SESSION_COMPLETE', 'CHALLENGE_COMPLETE']) {
      expect(RewardTriggerSchema.safeParse(t).success).toBe(true);
    }
  });

  it('rejects invalid triggers', () => {
    expect(RewardTriggerSchema.safeParse('INVALID').success).toBe(false);
  });
});
