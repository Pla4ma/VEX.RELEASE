import {
  BossRewardTypeSchema,
  BossEncounterStatusSchema,
  BossTemplateSchema,
} from '../schemas';

describe('BossRewardTypeSchema', () => {
  it('accepts XP', () => {
    expect(BossRewardTypeSchema.safeParse('XP').success).toBe(true);
  });

  it('rejects other types', () => {
    expect(BossRewardTypeSchema.safeParse('COINS').success).toBe(false);
  });
});

describe('BossEncounterStatusSchema', () => {
  it('accepts ACTIVE', () => {
    expect(BossEncounterStatusSchema.safeParse('ACTIVE').success).toBe(true);
  });

  it('rejects other statuses', () => {
    expect(BossEncounterStatusSchema.safeParse('COMPLETED').success).toBe(false);
  });
});

describe('BossTemplateSchema', () => {
  it('accepts partial objects', () => {
    expect(BossTemplateSchema.safeParse({}).success).toBe(true);
    expect(BossTemplateSchema.safeParse({ id: 'boss-1' }).success).toBe(true);
    expect(BossTemplateSchema.safeParse({ id: 'boss-1', name: 'Boss', tier: 1 }).success).toBe(true);
  });

  it('rejects non-object values', () => {
    expect(BossTemplateSchema.safeParse('string').success).toBe(false);
  });
});
