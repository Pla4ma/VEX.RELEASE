/**
 * Seasons Schema Validation Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  SeasonSchema,
  UserSeasonProgressSchema,
  SeasonRowSchema,
  UserSeasonProgressRowSchema,
} from '../schemas';

const validSeason = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Season One',
  description: null,
  theme: null,
  startAt: 1000,
  endAt: 2000,
  tierCount: 30,
  xpPerTier: 100,
  premiumPriceGems: 0,
  isActive: true,
  createdAt: 999,
};

const validProgress = {
  id: '00000000-0000-0000-0000-000000000002',
  userId: '00000000-0000-0000-0000-000000000003',
  seasonId: '00000000-0000-0000-0000-000000000001',
  currentTier: 5,
  tierXp: 50,
  totalSeasonXp: 550,
  isPremium: false,
  premiumPurchasedAt: null,
  claimedTiers: [],
  createdAt: 999,
  updatedAt: 1000,
};

describe('SeasonSchema', () => {
  it('parses a valid season object', () => {
    expect(() => SeasonSchema.parse(validSeason)).not.toThrow();
  });

  it('rejects a missing required field', () => {
    const { name: _name, ...withoutName } = validSeason;
    expect(() => SeasonSchema.parse(withoutName)).toThrow();
  });

  it('rejects a non-uuid id', () => {
    expect(() => SeasonSchema.parse({ ...validSeason, id: 'not-a-uuid' })).toThrow();
  });

  it('rejects a non-positive tierCount', () => {
    expect(() => SeasonSchema.parse({ ...validSeason, tierCount: 0 })).toThrow();
  });

  it('rejects a non-positive xpPerTier', () => {
    expect(() => SeasonSchema.parse({ ...validSeason, xpPerTier: -1 })).toThrow();
  });

  it('rejects a negative premiumPriceGems', () => {
    expect(() => SeasonSchema.parse({ ...validSeason, premiumPriceGems: -5 })).toThrow();
  });

  it('allows null description', () => {
    const result = SeasonSchema.parse({ ...validSeason, description: null });
    expect(result.description).toBeNull();
  });

  it('rejects extra fields (strict mode)', () => {
    expect(() => SeasonSchema.parse({ ...validSeason, extraField: 'oops' })).toThrow();
  });
});

describe('UserSeasonProgressSchema', () => {
  it('parses a valid progress object', () => {
    expect(() => UserSeasonProgressSchema.parse(validProgress)).not.toThrow();
  });

  it('rejects negative currentTier', () => {
    expect(() =>
      UserSeasonProgressSchema.parse({ ...validProgress, currentTier: -1 })
    ).toThrow();
  });

  it('rejects negative tierXp', () => {
    expect(() =>
      UserSeasonProgressSchema.parse({ ...validProgress, tierXp: -1 })
    ).toThrow();
  });

  it('rejects negative totalSeasonXp', () => {
    expect(() =>
      UserSeasonProgressSchema.parse({ ...validProgress, totalSeasonXp: -1 })
    ).toThrow();
  });

  it('allows claimedTiers array with string entries', () => {
    const result = UserSeasonProgressSchema.parse({
      ...validProgress,
      claimedTiers: ['tier-1', 'tier-2'],
    });
    expect(result.claimedTiers).toEqual(['tier-1', 'tier-2']);
  });

  it('allows null premiumPurchasedAt', () => {
    const result = UserSeasonProgressSchema.parse(validProgress);
    expect(result.premiumPurchasedAt).toBeNull();
  });

  it('rejects non-uuid userId', () => {
    expect(() =>
      UserSeasonProgressSchema.parse({ ...validProgress, userId: 'not-a-uuid' })
    ).toThrow();
  });
});

describe('SeasonRowSchema', () => {
  it('parses a valid DB row', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Season One',
      description: null,
      theme: null,
      start_at: '2024-01-01T00:00:00Z',
      end_at: '2024-03-31T23:59:59Z',
      tier_count: 30,
      xp_per_tier: 100,
      premium_price_gems: 0,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(() => SeasonRowSchema.parse(row)).not.toThrow();
  });

  it('allows extra fields in passthrough mode', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Season One',
      description: null,
      theme: null,
      start_at: '2024-01-01',
      end_at: '2024-03-31',
      tier_count: 30,
      xp_per_tier: 100,
      premium_price_gems: 0,
      is_active: null,
      created_at: null,
      extra_col: 'ignored',
    };
    expect(() => SeasonRowSchema.parse(row)).not.toThrow();
  });
});

describe('UserSeasonProgressRowSchema', () => {
  it('parses a valid DB row', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000003',
      season_id: '00000000-0000-0000-0000-000000000001',
      current_tier: 5,
      tier_xp: 50,
      total_season_xp: 550,
      is_premium: false,
      premium_purchased_at: null,
      claimed_tiers: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    };
    expect(() => UserSeasonProgressRowSchema.parse(row)).not.toThrow();
  });

  it('allows all nullable fields to be null', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000003',
      season_id: '00000000-0000-0000-0000-000000000001',
      current_tier: null,
      tier_xp: null,
      total_season_xp: null,
      is_premium: null,
      premium_purchased_at: null,
      claimed_tiers: null,
      created_at: null,
      updated_at: null,
    };
    expect(() => UserSeasonProgressRowSchema.parse(row)).not.toThrow();
  });
});
