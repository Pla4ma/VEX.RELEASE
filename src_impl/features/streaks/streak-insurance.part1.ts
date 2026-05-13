import { z } from "zod";


export const StreakInsuranceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  streakDaysProtected: z.number(),
  cost: z.number(),
  purchasedAt: z.number(),
  expiresAt: z.number(),
  used: z.boolean(),
  usedAt: z.number().optional(),
});

export const StreakGambleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  streakDaysAtRisk: z.number(),
  startedAt: z.number(),
  sessionId: z.string(),
  status: z.enum(['ACTIVE', 'WON', 'LOST', 'CANCELLED']),
  requiredGrade: z.enum(['S', 'A', 'B']),
  actualGrade: z.string().optional(),
  bonusXpIfWon: z.number(),
  settledAt: z.number().optional(),
});

export const ComebackTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceStreak: z.number(), // How many days were lost
  earnedAt: z.number(),
  used: z.boolean(),
  restoreValue: z.number(), // How many days it can restore
});

export const INSURANCE_PRICING: InsurancePricing = {
  baseCost: 500, // 500 coins
  perDayMultiplier: 50, // +50 coins per streak day
  maxDays: 30,
  minDays: 3,
};

export function calculateInsuranceCost(streakDays: number): number {
  const clampedDays = Math.max(
    INSURANCE_PRICING.minDays,
    Math.min(INSURANCE_PRICING.maxDays, streakDays)
  );
  return INSURANCE_PRICING.baseCost + clampedDays * INSURANCE_PRICING.perDayMultiplier;
}

export function calculateInsurancePayout(
  streakDays: number,
  userLevel: number
): { restoredDays: number; xpBonus: number } {
  // Insurance doesn't restore full streak - it softens the blow
  const restorePercent = 0.5 + userLevel * 0.01; // 50% + 1% per level
  const restoredDays = Math.max(3, Math.floor(streakDays * restorePercent));
  const xpBonus = restoredDays * 10;

  return { restoredDays, xpBonus };
}

export const GAMBLE_CONFIGS: Record<string, GambleConfig> = {
  conservative: {
    requiredGrade: 'B',
    timeWindowHours: 24,
    bonusXpMultiplier: 1.5,
    riskLevel: 'LOW',
  },
  moderate: {
    requiredGrade: 'A',
    timeWindowHours: 12,
    bonusXpMultiplier: 2.0,
    riskLevel: 'MEDIUM',
  },
  aggressive: {
    requiredGrade: 'S',
    timeWindowHours: 6,
    bonusXpMultiplier: 3.0,
    riskLevel: 'HIGH',
  },
};

export function getGambleOptions(streakDays: number, hoursRemaining: number): {
  available: boolean;
  options: Array<{ type: string; config: GambleConfig; available: boolean; reason?: string }>;
} {
  const options = Object.entries(GAMBLE_CONFIGS).map(([type, config]) => {
    const available = hoursRemaining <= config.timeWindowHours;
    return {
      type,
      config,
      available,
      reason: available ? undefined : `Requires ${config.timeWindowHours}h or less remaining`,
    };
  });

  return {
    available: options.some((o) => o.available),
    options,
  };
}

export function calculateComebackTokensEarned(brokenStreakDays: number): number {
  // Tokens = 1 per 10 days of broken streak (rounded up)
  return Math.max(1, Math.ceil(brokenStreakDays / 10));
}

export function calculateTokenRestoreValue(tokenCount: number): number {
  // Each token restores 5 days of streak
  return tokenCount * 5;
}

export function canPurchaseInsurance(
  userId: string,
  streakDays: number,
  currentBalance: number,
  hasActiveInsurance: boolean,
  protectionDisabledUntil: number | null = null
): { allowed: boolean; reason: string | null; cost: number } {
  const cost = calculateInsuranceCost(streakDays);

  if (protectionDisabledUntil && Date.now() < protectionDisabledUntil) {
    const hours = Math.ceil((protectionDisabledUntil - Date.now()) / (60 * 60 * 1000));
    return { 
      allowed: false, 
      reason: `Protection disabled for ${hours}h due to Squad Pact failure`, 
      cost 
    };
  }

  if (hasActiveInsurance) {
    return { allowed: false, reason: 'Already have active insurance', cost };
  }

  if (streakDays < INSURANCE_PRICING.minDays) {
    return {
      allowed: false,
      reason: `Need ${INSURANCE_PRICING.minDays} day streak minimum`,
      cost,
    };
  }

  if (currentBalance < cost) {
    return { allowed: false, reason: `Need ${cost} coins`, cost };
  }

  return { allowed: true, reason: null, cost };
}

export function createInsurance(
  userId: string,
  streakDays: number,
  cost: number
): StreakInsurance {
  return {
    id: `ins_${Date.now()}_${userId.slice(0, 8)}`,
    userId,
    streakDaysProtected: streakDays,
    cost,
    purchasedAt: Date.now(),
    expiresAt: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
    used: false,
  };
}

export function settleGamble(
  gamble: StreakGamble,
  sessionGrade: string,
  sessionQuality: number
): SettleGambleResult {
  const gradeRank: Record<string, number> = { S: 3, A: 2, B: 1, C: 0, D: 0, F: 0 };
  const requiredRank = gradeRank[gamble.requiredGrade];
  const actualRank = gradeRank[sessionGrade] || 0;

  const won = actualRank >= requiredRank;

  if (won) {
    return {
      success: true,
      won: true,
      streakSaved: true,
      newStreakDays: gamble.streakDaysAtRisk,
      xpAwarded: Math.floor(gamble.bonusXpIfWon * (sessionQuality / 100)),
      message: `GAMBLE WON! Your ${gamble.requiredGrade} grade session saved your ${gamble.streakDaysAtRisk} day streak!`,
    };
  } else {
    return {
      success: true,
      won: false,
      streakSaved: false,
      newStreakDays: 1,
      xpAwarded: 0,
      message: `Gamble lost. Needed ${gamble.requiredGrade}, got ${sessionGrade}. Streak reset to 1.`,
    };
  }
}