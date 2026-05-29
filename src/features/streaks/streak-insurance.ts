import { z } from "zod";

/**
 * Momentum Protection (formerly Streak Insurance).
 * Protects accumulated momentum — not gamified streaks.
 * Intelligence: VEX learns recovery patterns, not just day counts.
 */

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

/** @deprecated Gamification — gamble mechanic removed. Use recovery proof instead. */
export const StreakGambleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  streakDaysAtRisk: z.number(),
  startedAt: z.number(),
  sessionId: z.string(),
  status: z.enum(["ACTIVE", "WON", "LOST", "CANCELLED"]),
  requiredGrade: z.enum(["S", "A", "B"]),
  actualGrade: z.string().optional(),
  bonusXpIfWon: z.number(),
  settledAt: z.number().optional(),
});

/**
 * Recovery Proof (formerly Comeback Token).
 * Proof that you can restart after a pause — VEX records the pattern.
 */
export const ComebackTokenSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceStreak: z.number(),
  earnedAt: z.number(),
  used: z.boolean(),
  restoreValue: z.number(),
});

export type StreakInsurance = z.infer<typeof StreakInsuranceSchema>;
export type StreakGamble = z.infer<typeof StreakGambleSchema>;
export type ComebackToken = z.infer<typeof ComebackTokenSchema>;

export interface InsurancePricing {
  baseCost: number;
  perDayMultiplier: number;
  maxDays: number;
  minDays: number;
}

export const INSURANCE_PRICING: InsurancePricing = {
  baseCost: 500,
  perDayMultiplier: 50,
  maxDays: 30,
  minDays: 3,
};

export function calculateInsuranceCost(streakDays: number): number {
  const clampedDays = Math.max(
    INSURANCE_PRICING.minDays,
    Math.min(INSURANCE_PRICING.maxDays, streakDays),
  );
  return (
    INSURANCE_PRICING.baseCost +
    clampedDays * INSURANCE_PRICING.perDayMultiplier
  );
}

export function calculateInsurancePayout(
  streakDays: number,
  userLevel: number,
): { restoredDays: number; xpBonus: number } {
  const restorePercent = 0.5 + userLevel * 0.01;
  const restoredDays = Math.max(3, Math.floor(streakDays * restorePercent));
  const xpBonus = restoredDays * 10;
  return { restoredDays, xpBonus };
}

export interface GambleConfig {
  requiredGrade: "S" | "A" | "B";
  timeWindowHours: number;
  bonusXpMultiplier: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export const GAMBLE_CONFIGS: Record<string, GambleConfig> = {
  conservative: {
    requiredGrade: "B",
    timeWindowHours: 24,
    bonusXpMultiplier: 1.5,
    riskLevel: "LOW",
  },
  moderate: {
    requiredGrade: "A",
    timeWindowHours: 12,
    bonusXpMultiplier: 2.0,
    riskLevel: "MEDIUM",
  },
  aggressive: {
    requiredGrade: "S",
    timeWindowHours: 6,
    bonusXpMultiplier: 3.0,
    riskLevel: "HIGH",
  },
};

export function getGambleOptions(
  streakDays: number,
  hoursRemaining: number,
): {
  available: boolean;
  options: Array<{
    type: string;
    config: GambleConfig;
    available: boolean;
    reason?: string;
  }>;
} {
  const options = Object.entries(GAMBLE_CONFIGS).map(([type, config]) => {
    const available = hoursRemaining <= config.timeWindowHours;
    return {
      type,
      config,
      available,
      reason: available
        ? undefined
        : `Requires ${config.timeWindowHours}h or less remaining`,
    };
  });
  return { available: options.some((o) => o.available), options };
}

export function calculateComebackTokensEarned(
  brokenStreakDays: number,
): number {
  return Math.max(1, Math.ceil(brokenStreakDays / 10));
}

export function calculateTokenRestoreValue(tokenCount: number): number {
  return tokenCount * 5;
}

export interface PurchaseInsuranceResult {
  success: boolean;
  insurance: StreakInsurance | null;
  error: string | null;
  remainingBalance: number;
}

export function canPurchaseInsurance(
  userId: string,
  streakDays: number,
  currentBalance: number,
  hasActiveInsurance: boolean,
): { allowed: boolean; reason: string | null; cost: number } {
  const cost = calculateInsuranceCost(streakDays);
  if (hasActiveInsurance) {
    return { allowed: false, reason: "Already have active momentum protection", cost };
  }
  if (streakDays < INSURANCE_PRICING.minDays) {
    return {
      allowed: false,
      reason: `Need ${INSURANCE_PRICING.minDays} day momentum minimum`,
      cost,
    };
  }
  if (currentBalance < cost) {
    return { allowed: false, reason: "Not enough saved progress", cost };
  }
  return { allowed: true, reason: null, cost };
}

export function createInsurance(
  userId: string,
  streakDays: number,
  cost: number,
): StreakInsurance {
  return {
    id: `ins_${Date.now()}_${userId.slice(0, 8)}`,
    userId,
    streakDaysProtected: streakDays,
    cost,
    purchasedAt: Date.now(),
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    used: false,
  };
}

export {
  type SettleGambleResult,
  type StreakRiskAssessment,
  settleGamble,
  assessStreakRisk,
  convertShieldsToInsurance,
  StreakInsuranceEvents,
} from "./streak-risk-assessment";
