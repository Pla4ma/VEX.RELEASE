import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export function validatePrestige(currentLevel: number, currentPrestige: number, minLevelForPrestige: number = 100): ValidationResult<{ canPrestige: boolean; prestigeLevel: number }> {
  const result: ValidationResult<{ canPrestige: boolean; prestigeLevel: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
  };

  if (currentLevel < minLevelForPrestige) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'currentLevel',
      message: `Must be level ${minLevelForPrestige} to prestige (currently ${currentLevel})`,
      severity: 'MEDIUM',
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  const MAX_PRESTIGE = 10;
  if (currentPrestige >= MAX_PRESTIGE) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'currentPrestige',
      message: `Maximum prestige level (${MAX_PRESTIGE}) already reached`,
      severity: 'MEDIUM',
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  result.data = {
    canPrestige: true,
    prestigeLevel: currentPrestige + 1,
  };

  return result;
}

export function validateXPBatch(
  transactions: XPTransaction[],
  userHistory: {
    recentTransactions: XPTransaction[];
    currentLevel: number;
    currentXP: number;
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
): ValidationResult<{ valid: XPTransaction[]; rejected: XPTransaction[] }> {
  const result: ValidationResult<{ valid: XPTransaction[]; rejected: XPTransaction[] }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
    data: { valid: [], rejected: [] },
  };

  let totalRiskScore = 0;

  for (const transaction of transactions) {
    const validation = validateXPTransaction(transaction, userHistory);

    if (validation.valid && validation.riskScore < 30) {
      result.data!.valid.push(transaction);
    } else {
      result.data!.rejected.push(transaction);
    }

    totalRiskScore += validation.riskScore;
  }

  // Average risk score
  result.riskScore = transactions.length > 0 ? totalRiskScore / transactions.length : 0;

  // Batch-level checks
  const totalXP = result.data!.valid.reduce((sum, t) => sum + t.amount, 0);
  if (totalXP > MAX_XP_PER_HOUR * 2) {
    result.violations.push({
      type: 'RATE_LIMIT',
      field: 'batch',
      message: `Batch total XP ${totalXP} exceeds safe threshold`,
      severity: 'HIGH',
      details: { totalXP, threshold: MAX_XP_PER_HOUR * 2 },
    });
    result.riskScore = Math.min(100, result.riskScore + 20);
  }

  if (result.riskScore > 50) {
    result.valid = false;
  }

  return result;
}

export const ProgressionValidation = {
  validateXPTransaction,
  validateLevelUp,
  validatePrestige,
  validateXPBatch,
};