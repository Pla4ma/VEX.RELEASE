/**
 * Streak Insurance & Gamble System - VEX 10/10 Transformation
 *
 * Replaces passive shields with active risk/reward mechanics:
 * - Insurance: Pay coins to protect streak (guaranteed but expensive)
 * - Gamble: Bet your streak on a high-quality session (skill-based)
 * - Comeback Tokens: Earned from broken streaks, used for partial restores
 *
 * @phase 1C - Core Loop Surgery
 */

import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

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

export type StreakInsurance = z.infer<typeof StreakInsuranceSchema>;
export type StreakGamble = z.infer<typeof StreakGambleSchema>;
export type ComebackToken = z.infer<typeof ComebackTokenSchema>;

// ============================================================================
// Insurance Configuration
// ============================================================================

export interface InsurancePricing {
  baseCost: number;
  perDayMultiplier: number;
  maxDays: number;
  minDays: number;
}

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

// ============================================================================
// Gamble Configuration
// ============================================================================

export interface GambleConfig {
  requiredGrade: 'S' | 'A' | 'B';
  timeWindowHours: number;
  bonusXpMultiplier: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
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

// ============================================================================
// Comeback Token System
// ============================================================================

export function calculateComebackTokensEarned(brokenStreakDays: number): number {
  // Tokens = 1 per 10 days of broken streak (rounded up)
  return Math.max(1, Math.ceil(brokenStreakDays / 10));
}

export function calculateTokenRestoreValue(tokenCount: number): number {
  // Each token restores 5 days of streak
  return tokenCount * 5;
}

// ============================================================================
// Insurance Purchase Logic
// ============================================================================

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
  hasActiveInsurance: boolean
): { allowed: boolean; reason: string | null; cost: number } {
  const cost = calculateInsuranceCost(streakDays);

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

// ============================================================================
// Gamble Settlement Logic
// ============================================================================

export interface SettleGambleResult {
  success: boolean;
  won: boolean;
  streakSaved: boolean;
  newStreakDays: number;
  xpAwarded: number;
  message: string;
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

// ============================================================================
// Streak Risk Assessment (Replaces shield availability check)
// ============================================================================

export interface StreakRiskAssessment {
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hoursRemaining: number;
  insuranceAvailable: boolean;
  insuranceCost: number;
  gambleAvailable: boolean;
  gambleOptions: ReturnType<typeof getGambleOptions>;
  comebackTokensAvailable: number;
  recommendedAction: 'NONE' | 'INSURANCE' | 'GAMBLE' | 'SESSION_NOW';
}

export function assessStreakRisk(
  streakDays: number,
  lastSessionAt: number | null,
  timezone: string,
  userBalance: number,
  hasActiveInsurance: boolean,
  comebackTokens: number
): StreakRiskAssessment {
  const now = Date.now();
  const lastDay = lastSessionAt ? new Date(lastSessionAt).getDate() : null;
  const currentDay = new Date(now).getDate();

  // Calculate hours until streak break (assume midnight timezone)
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursRemaining = Math.max(0, (midnight.getTime() - now) / (1000 * 60 * 60));

  let riskLevel: StreakRiskAssessment['riskLevel'] = 'NONE';

  if (!lastSessionAt || lastDay !== currentDay) {
    if (hoursRemaining > 12) {
      riskLevel = 'LOW';
    } else if (hoursRemaining > 6) {
      riskLevel = 'MEDIUM';
    } else if (hoursRemaining > 3) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'CRITICAL';
    }
  }

  const insuranceCost = calculateInsuranceCost(streakDays);
  const canAffordInsurance = userBalance >= insuranceCost && !hasActiveInsurance;
  const gambleOpts = getGambleOptions(streakDays, hoursRemaining);

  // Recommend action based on risk
  let recommendedAction: StreakRiskAssessment['recommendedAction'] = 'NONE';

  if (riskLevel === 'CRITICAL') {
    recommendedAction = comebackTokens > 0 ? 'SESSION_NOW' : 'INSURANCE';
  } else if (riskLevel === 'HIGH') {
    recommendedAction = gambleOpts.available ? 'GAMBLE' : 'INSURANCE';
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'SESSION_NOW';
  }

  return {
    riskLevel,
    hoursRemaining,
    insuranceAvailable: canAffordInsurance,
    insuranceCost,
    gambleAvailable: gambleOpts.available,
    gambleOptions: gambleOpts,
    comebackTokensAvailable: comebackTokens,
    recommendedAction,
  };
}

// ============================================================================
// Migration from Old Shield System
// ============================================================================

export function convertShieldsToInsurance(
  shieldCount: number,
  streakDays: number
): { insurance: StreakInsurance[]; tokens: ComebackToken[]; message: string } {
  const insurance: StreakInsurance[] = [];
  const tokens: ComebackToken[] = [];

  // First shield becomes insurance for current streak
  if (shieldCount > 0) {
    insurance.push(createInsurance('migrated_user', streakDays, 0));
  }

  // Additional shields become comeback tokens
  for (let i = 1; i < shieldCount; i++) {
    tokens.push({
      id: `token_${Date.now()}_${i}`,
      userId: 'migrated_user',
      sourceStreak: streakDays,
      earnedAt: Date.now(),
      used: false,
      restoreValue: 5,
    });
  }

  return {
    insurance,
    tokens,
    message: `Converted ${shieldCount} shields to ${insurance.length} insurance policy and ${tokens.length} comeback tokens`,
  };
}

// ============================================================================
// Analytics Events
// ============================================================================

export const StreakInsuranceEvents = {
  INSURANCE_PURCHASED: 'streak:insurance_purchased',
  INSURANCE_USED: 'streak:insurance_used',
  GAMBLE_STARTED: 'streak:gamble_started',
  GAMBLE_WON: 'streak:gamble_won',
  GAMBLE_LOST: 'streak:gamble_lost',
  TOKEN_EARNED: 'streak:token_earned',
  TOKEN_USED: 'streak:token_used',
} as const;
