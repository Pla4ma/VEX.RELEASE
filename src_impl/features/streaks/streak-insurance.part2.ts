import { z } from "zod";


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

export const StreakInsuranceEvents = {
  INSURANCE_PURCHASED: 'streak:insurance_purchased',
  INSURANCE_USED: 'streak:insurance_used',
  GAMBLE_STARTED: 'streak:gamble_started',
  GAMBLE_WON: 'streak:gamble_won',
  GAMBLE_LOST: 'streak:gamble_lost',
  TOKEN_EARNED: 'streak:token_earned',
  TOKEN_USED: 'streak:token_used',
} as const;