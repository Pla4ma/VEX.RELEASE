import { rollChest } from '../chest-engine';

function mockRandomSequence(values: number[]) {
  const sequence = [...values];
  return jest.spyOn(Math, 'random').mockImplementation(() => sequence.shift() ?? 0);
}

describe('rollChest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a common chest with three different symbols for low rolls', () => {
    mockRandomSequence([
      0, // base roll => common
      0, // coins => minimum
      0, // first symbol => ⚡
      0, // second symbol => 🔥
      0, // third symbol => 💎
    ]);

    const result = rollChest({
      sessionDurationSeconds: 300,
      focusPurityScore: 55,
      currentStreakDays: 2,
      userLevel: 3,
      isFirstSessionToday: false,
    });

    expect(result.tier).toBe('common');
    expect(result.xpReward).toBe(240);
    expect(result.coinReward).toBe(10);
    expect(result.gemReward).toBe(0);
    expect(result.bonusItemId).toBeNull();
    expect(result.nearMissSymbols[0]).not.toBe(result.nearMissSymbols[1]);
    expect(result.nearMissSymbols[1]).not.toBe(result.nearMissSymbols[2]);
    expect(result.isNearMiss).toBe(false);
  });

  it('shifts odds upward for elite purity and long streaks', () => {
    mockRandomSequence([
      0.75, // base roll => 75, shifted to 90 => epic
      0, // coins => minimum
      0, // gems => minimum
      0, // epic match symbol => ⚡
      0, // epic miss symbol => 🔥
    ]);

    const result = rollChest({
      sessionDurationSeconds: 600,
      focusPurityScore: 96,
      currentStreakDays: 8,
      userLevel: 12,
      isFirstSessionToday: true,
    });

    expect(result.tier).toBe('epic');
    expect(result.xpReward).toBe(1080);
    expect(result.coinReward).toBe(100);
    expect(result.gemReward).toBe(5);
    expect(result.bonusItemId).not.toBeNull();
    expect(result.nearMissSymbols[0]).toBe(result.nearMissSymbols[1]);
    expect(result.nearMissSymbols[2]).not.toBe(result.nearMissSymbols[0]);
    expect(result.isNearMiss).toBe(true);
  });

  it('uses boss bounty loot multiplier to improve chest tier odds', () => {
    mockRandomSequence([
      0.62, // base roll => 62, bounty x4 shifts to 74 => rare
      0, // coins => minimum
      0, // rare match symbol
      0, // rare miss symbol
    ]);

    const result = rollChest({
      sessionDurationSeconds: 600,
      focusPurityScore: 70,
      currentStreakDays: 1,
      userLevel: 8,
      isFirstSessionToday: false,
      lootMultiplier: 4,
    });

    expect(result.tier).toBe('rare');
    expect(result.bonusItemId).not.toBeNull();
  });

  it('returns matching symbols for legendary rolls', () => {
    mockRandomSequence([
      0.999, // base roll => legendary
      0, // coins
      0, // gems
      0, // symbol => ⚡
    ]);

    const result = rollChest({
      sessionDurationSeconds: 900,
      focusPurityScore: 100,
      currentStreakDays: 14,
      userLevel: 25,
      isFirstSessionToday: true,
    });

    expect(result.tier).toBe('legendary');
    expect(result.nearMissSymbols).toEqual(['⚡', '⚡', '⚡']);
    expect(result.isNearMiss).toBe(false);
    expect(result.bonusItemId).not.toBeNull();
  });

  it('honors a guaranteed legendary tier from weekly quest completion', () => {
    mockRandomSequence([
      0, // coins
      0, // gems
      0, // symbol
    ]);

    const result = rollChest({
      sessionDurationSeconds: 900,
      focusPurityScore: 50,
      currentStreakDays: 0,
      userLevel: 3,
      isFirstSessionToday: false,
      guaranteedTier: 'legendary',
    });

    expect(result.tier).toBe('legendary');
    expect(result.nearMissSymbols[0]).toBe(result.nearMissSymbols[1]);
    expect(result.nearMissSymbols[1]).toBe(result.nearMissSymbols[2]);
  });
});
