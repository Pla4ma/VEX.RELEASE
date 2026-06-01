/**
 * Tests for rewards schemas
 */

import {
  RewardTypeSchema,
  RewardTriggerSchema,
} from '../schemas';

describe('RewardTypeSchema', () => {
  it('accepts XP', () => {
    expect(RewardTypeSchema.parse('XP')).toBe('XP');
  });

  it('rejects invalid reward types', () => {
    expect(() => RewardTypeSchema.parse('COINS')).toThrow();
    expect(() => RewardTypeSchema.parse('GEMS')).toThrow();
    expect(() => RewardTypeSchema.parse('')).toThrow();
  });
});

describe('RewardTriggerSchema', () => {
  it.each(['SESSION', 'STREAK', 'ACHIEVEMENT', 'COMEBACK', 'SESSION_COMPLETE', 'CHALLENGE_COMPLETE'])(
    "accepts valid trigger '%s'",
    (trigger) => {
      expect(RewardTriggerSchema.parse(trigger)).toBe(trigger);
    },
  );

  it('rejects unknown triggers', () => {
    expect(() => RewardTriggerSchema.parse('INVALID')).toThrow();
    expect(() => RewardTriggerSchema.parse('')).toThrow();
  });
});
