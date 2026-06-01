/**
 * Tests for boss schemas
 * Covers: PersonalBlockerBlockSchema, PersonalBossBlockSchema, legacy schemas
 */

import {
  PersonalBlockerBlockSchema,
  PersonalBossBlockSchema,
} from '../types';
import type {
  PersonalBlockerBlock,
  BlockerVisibility,
  BlockerCompletionSignal,
} from '../types';
import {
  BossRewardTypeSchema,
  BossEncounterStatusSchema,
  BossTemplateSchema,
  BossEncounterSummarySchema,
} from '../schemas';

describe('PersonalBlockerBlockSchema', () => {
  it('validates a valid blocker block', () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: 'blocker-1',
      label: 'Procrastination',
      triggerAfterSessions: 3,
    });
    expect(result.id).toBe('blocker-1');
    expect(result.label).toBe('Procrastination');
    expect(result.triggerAfterSessions).toBe(3);
  });

  it('accepts optional motivationStyle', () => {
    const result = PersonalBlockerBlockSchema.parse({
      id: 'b2',
      label: 'Distraction',
      triggerAfterSessions: 0,
      motivationStyle: 'calm',
    });
    expect(result.motivationStyle).toBe('calm');
  });

  it.each(['calm', 'study', 'game_like', 'intense'])(
    "accepts motivationStyle '%s'",
    (style) => {
      const result = PersonalBlockerBlockSchema.parse({
        id: 'b',
        label: 'L',
        triggerAfterSessions: 1,
        motivationStyle: style,
      });
      expect(result.motivationStyle).toBe(style);
    },
  );

  it('rejects invalid motivationStyle', () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: 'b',
        label: 'L',
        triggerAfterSessions: 1,
        motivationStyle: 'invalid',
      }),
    ).toThrow();
  });

  it('rejects negative triggerAfterSessions', () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: 'b',
        label: 'L',
        triggerAfterSessions: -1,
      }),
    ).toThrow();
  });

  it('rejects non-integer triggerAfterSessions', () => {
    expect(() =>
      PersonalBlockerBlockSchema.parse({
        id: 'b',
        label: 'L',
        triggerAfterSessions: 1.5,
      }),
    ).toThrow();
  });
});

describe('PersonalBossBlockSchema (legacy alias)', () => {
  it('is the same schema as PersonalBlockerBlockSchema', () => {
    expect(PersonalBossBlockSchema).toBe(PersonalBlockerBlockSchema);
  });
});

describe('boss schemas (legacy)', () => {
  it('BossRewardTypeSchema accepts XP', () => {
    expect(BossRewardTypeSchema.parse('XP')).toBe('XP');
  });

  it('BossEncounterStatusSchema accepts ACTIVE', () => {
    expect(BossEncounterStatusSchema.parse('ACTIVE')).toBe('ACTIVE');
  });

  it('BossTemplateSchema parses partial object', () => {
    const result = BossTemplateSchema.parse({ id: 't1' });
    expect(result.id).toBe('t1');
  });

  it('BossEncounterSummarySchema parses empty object', () => {
    const result = BossEncounterSummarySchema.parse({});
    expect(result).toEqual({});
  });
});
