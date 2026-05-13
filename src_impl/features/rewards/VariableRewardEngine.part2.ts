import { z } from "zod";
import * as Sentry from "@sentry/react-native";


export const variableRewardEngine = new VariableRewardEngine();

export function validateVariableRewardServerSide(clientResult: VariableRewardResult, serverModifiers: VariableRewardModifiers, serverSeed: string): { valid: boolean; reason?: string } {
  // Re-create engine with same seed
  const serverEngine = new VariableRewardEngine();

  // Recalculate with server's data
  const serverResult = serverEngine.calculateReward({
    userId: '00000000-0000-4000-8000-000000000000',
    baseCoins: 100, // dummy - we only care about tier validation
    modifiers: serverModifiers,
    seed: serverSeed,
  });

  // Client and server should get same tier (if using seed)
  // Or at least within reasonable probability bounds
  if (clientResult.tier !== serverResult.tier) {
    return {
      valid: false,
      reason: `Tier mismatch: client=${clientResult.tier}, server=${serverResult.tier}`,
    };
  }

  // Validate roll is within expected range
  if (clientResult.rollValue < 0 || clientResult.rollValue > 1) {
    return {
      valid: false,
      reason: `Invalid roll value: ${clientResult.rollValue}`,
    };
  }

  return { valid: true };
}

export function calculateSessionVariableReward(
  userId: string,
  baseCoins: number,
  sessionData: {
    streakDays: number;
    grade: string;
    bossActive: boolean;
    squadMode: boolean;
    isPremium: boolean;
  },
): VariableRewardResult {
  return variableRewardEngine.calculateReward({
    userId,
    baseCoins,
    modifiers: {
      streakDays: sessionData.streakDays,
      isSGrade: sessionData.grade === 'S',
      bossActive: sessionData.bossActive,
      squadSession: sessionData.squadMode,
      isPremium: sessionData.isPremium,
      luckyBonusActive: false, // Set by caller if applicable
    },
  });
}