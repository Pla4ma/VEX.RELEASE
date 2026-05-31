import type {
  StreakGamble,
  StreakInsurance,
  ComebackToken,
} from './streak-insurance';
import {
  calculateInsuranceCost,
  createInsurance,
  getGambleOptions,
} from './streak-insurance';

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
  sessionQuality: number,
): SettleGambleResult {
  const gradeRank: Record<string, number> = {
    S: 3,
    A: 2,
    B: 1,
    C: 0,
    D: 0,
    F: 0,
  };
  const requiredRank = gradeRank[gamble.requiredGrade]!;
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
  comebackTokens: number,
): StreakRiskAssessment {
  const now = Date.now();
  const lastDay = lastSessionAt ? new Date(lastSessionAt).getDate() : null;
  const currentDay = new Date(now).getDate();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursRemaining = Math.max(
    0,
    (midnight.getTime() - now) / (1000 * 60 * 60),
  );
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
  const canAffordInsurance =
    userBalance >= insuranceCost && !hasActiveInsurance;
  const gambleOpts = getGambleOptions(streakDays, hoursRemaining);
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

export function convertShieldsToInsurance(
  shieldCount: number,
  streakDays: number,
): { insurance: StreakInsurance[]; tokens: ComebackToken[]; message: string } {
  const insurance: StreakInsurance[] = [];
  const tokens: ComebackToken[] = [];
  if (shieldCount > 0) {
    insurance.push(createInsurance('migrated_user', streakDays, 0));
  }
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

export const StreakInsuranceEvents = {
  INSURANCE_PURCHASED: 'streak:insurance_purchased',
  INSURANCE_USED: 'streak:insurance_used',
  GAMBLE_STARTED: 'streak:gamble_started',
  GAMBLE_WON: 'streak:gamble_won',
  GAMBLE_LOST: 'streak:gamble_lost',
  TOKEN_EARNED: 'streak:token_earned',
  TOKEN_USED: 'streak:token_used',
} as const;
