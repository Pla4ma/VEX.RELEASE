import { ChestResultSchema, ChestRollInputSchema } from './schemas';

export type ChestRollInput = {
  sessionDurationSeconds: number;
  focusPurityScore: number;
  currentStreakDays: number;
  userLevel: number;
  isFirstSessionToday: boolean;
  lootMultiplier?: number;
  guaranteedTier?: ChestTier;
};

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary';

export type ChestResult = {
  tier: ChestTier;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  bonusItemId: string | null;
  nearMissSymbols: [string, string, string];
  isNearMiss: boolean;
};

export const SLOT_SYMBOLS = ['⚡', '🔥', '💎', '🌟', '👑', '⚔️'] as const;

const BONUS_ITEM_POOLS: Record<Exclude<ChestTier, 'common'>, string[]> = {
  rare: [
    '4d0e7934-3525-4ef8-a70f-3440a7b9a101',
    '785ea3be-86a8-4911-a4d2-1d97de7d0a12',
    'b4623552-8fc0-4be9-bb9a-7622c1267a23',
  ],
  epic: [
    'd2d643f5-e689-47cf-99bb-c55bc4eb5d31',
    'dcb4bf95-7db8-45ab-b5c5-9ed977708542',
    'baf253e3-c9a7-496b-97d5-4b3222a30853',
  ],
  legendary: [
    '74d89ef2-66d8-4d89-9af0-c6a257f83f61',
    'de42eb14-f5c6-4f71-a963-28dc6b08d172',
  ],
};

const TIER_REWARDS: Record<
  ChestTier,
  {
    xpMultiplier: number;
    coinRange: [number, number];
    gemRange: [number, number];
  }
> = {
  common: {
    xpMultiplier: 0.8,
    coinRange: [10, 30],
    gemRange: [0, 0],
  },
  rare: {
    xpMultiplier: 1.2,
    coinRange: [40, 80],
    gemRange: [1, 3],
  },
  epic: {
    xpMultiplier: 1.8,
    coinRange: [100, 200],
    gemRange: [5, 10],
  },
  legendary: {
    xpMultiplier: 3,
    coinRange: [300, 500],
    gemRange: [20, 50],
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSymbol(): (typeof SLOT_SYMBOLS)[number] {
  return SLOT_SYMBOLS[randomInt(0, SLOT_SYMBOLS.length - 1)]!;
}

function randomDifferentSymbol(excluded: string[]): (typeof SLOT_SYMBOLS)[number] {
  const choices = SLOT_SYMBOLS.filter((symbol) => !excluded.includes(symbol));
  return choices[randomInt(0, choices.length - 1)]!;
}

function rollTier(input: ChestRollInput): ChestTier {
  const baseRoll = randomInt(0, 100);
  const bountyBoost = Math.round((Math.max(1, input.lootMultiplier ?? 1) - 1) * 4);
  const adjustedRoll =
    input.focusPurityScore > 90 && input.currentStreakDays > 7
      ? Math.min(100, baseRoll + 15 + bountyBoost)
      : Math.min(100, baseRoll + bountyBoost);

  if (adjustedRoll >= 98) {
    return 'legendary';
  }

  if (adjustedRoll >= 90) {
    return 'epic';
  }

  if (adjustedRoll >= 70) {
    return 'rare';
  }

  return 'common';
}

function rollBonusItemId(tier: ChestTier, input: ChestRollInput): string | null {
  if (tier === 'common') {
    return null;
  }

  const pool = BONUS_ITEM_POOLS[tier];
  const seed =
    input.userLevel +
    input.currentStreakDays +
    (input.isFirstSessionToday ? 3 : 0) +
    Math.round(input.focusPurityScore / 10);

  return pool[seed % pool.length] ?? null;
}

function rollSlotOutcome(tier: ChestTier): {
  symbols: [string, string, string];
  isNearMiss: boolean;
} {
  if (tier === 'legendary') {
    const symbol = randomSymbol();
    return {
      symbols: [symbol, symbol, symbol],
      isNearMiss: false,
    };
  }

  if (tier === 'epic') {
    const matchSymbol = randomSymbol();
    const missSymbol = randomDifferentSymbol([matchSymbol]);
    return {
      symbols: [matchSymbol, matchSymbol, missSymbol],
      isNearMiss: true,
    };
  }

  if (tier === 'rare') {
    const epicSeed = randomSymbol();
    const matchSymbol = randomDifferentSymbol([epicSeed]);
    const missSymbol = randomDifferentSymbol([matchSymbol]);
    return {
      symbols: [matchSymbol, matchSymbol, missSymbol],
      isNearMiss: true,
    };
  }

  const first = randomSymbol();
  const second = randomDifferentSymbol([first]);
  const third = randomDifferentSymbol([first, second]);

  return {
    symbols: [first, second, third],
    isNearMiss: false,
  };
}

export function rollChest(input: ChestRollInput): ChestResult {
  const normalizedInput: ChestRollInput = {
    ...input,
    sessionDurationSeconds: Math.max(1, Math.round(input.sessionDurationSeconds)),
    focusPurityScore: Math.max(0, Math.min(100, Math.round(input.focusPurityScore))),
    currentStreakDays: Math.max(0, Math.floor(input.currentStreakDays)),
    userLevel: Math.max(1, Math.floor(input.userLevel)),
    lootMultiplier: Math.max(1, Math.min(8, input.lootMultiplier ?? 1)),
  };
  const { guaranteedTier, ...inputForValidation } = normalizedInput;
  const validatedInput = ChestRollInputSchema.parse(inputForValidation);
  const tier = guaranteedTier ?? rollTier(validatedInput);
  const rewardConfig = TIER_REWARDS[tier];
  const { symbols, isNearMiss } = rollSlotOutcome(tier);

  const result: ChestResult = {
    tier,
    xpReward: Math.round(validatedInput.sessionDurationSeconds * rewardConfig.xpMultiplier),
    coinReward: randomInt(rewardConfig.coinRange[0], rewardConfig.coinRange[1]),
    gemReward:
      rewardConfig.gemRange[0] === rewardConfig.gemRange[1]
        ? rewardConfig.gemRange[0]
        : randomInt(rewardConfig.gemRange[0], rewardConfig.gemRange[1]),
    bonusItemId: rollBonusItemId(tier, validatedInput),
    nearMissSymbols: symbols,
    isNearMiss,
  };
  ChestResultSchema.parse(result);

  return result;
}
