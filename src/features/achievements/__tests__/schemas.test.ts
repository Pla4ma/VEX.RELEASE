import {
  AchievementCategorySchema,
  AchievementRaritySchema,
  UserAchievementRowSchema,
} from '../schemas';

describe('AchievementCategorySchema', () => {
  it('accepts valid categories', () => {
    for (const cat of ['SESSION', 'STREAK', 'BOSS', 'SOCIAL', 'PROGRESSION', 'ECONOMY']) {
      expect(AchievementCategorySchema.safeParse(cat).success).toBe(true);
    }
  });

  it('rejects invalid categories', () => {
    expect(AchievementCategorySchema.safeParse('INVALID').success).toBe(false);
  });
});

describe('AchievementRaritySchema', () => {
  it('accepts valid rarities', () => {
    for (const r of ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']) {
      expect(AchievementRaritySchema.safeParse(r).success).toBe(true);
    }
  });

  it('rejects invalid rarities', () => {
    expect(AchievementRaritySchema.safeParse('MYTHIC').success).toBe(false);
  });
});

describe('UserAchievementRowSchema', () => {
  const validRow = {
    user_id: 'user-1',
    achievement_id: 'ach-1',
    progress: 5,
    max_progress: 10,
    is_unlocked: false,
    progress_history: [],
  };

  it('validates correct row', () => {
    expect(UserAchievementRowSchema.safeParse(validRow).success).toBe(true);
  });

  it('requires user_id', () => {
    const { user_id: _, ...rest } = validRow;
    expect(UserAchievementRowSchema.safeParse(rest).success).toBe(false);
  });

  it('requires achievement_id', () => {
    const { achievement_id: _, ...rest } = validRow;
    expect(UserAchievementRowSchema.safeParse(rest).success).toBe(false);
  });

  it('accepts unlocked_at nullable', () => {
    expect(UserAchievementRowSchema.safeParse({ ...validRow, unlocked_at: null }).success).toBe(true);
    expect(UserAchievementRowSchema.safeParse({ ...validRow, unlocked_at: '2024-01-01' }).success).toBe(true);
  });

  it('defaults progress_history to empty array', () => {
    const result = UserAchievementRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.progress_history).toEqual([]);
    }
  });

  it('validates progress_history entries', () => {
    const row = {
      ...validRow,
      progress_history: [{ timestamp: 1234, progress: 5, source: 'session' }],
    };
    expect(UserAchievementRowSchema.safeParse(row).success).toBe(true);
  });
});
