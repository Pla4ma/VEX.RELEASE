import type { XPTransaction, ValidationResult } from './types';
import { MAX_XP_PER_HOUR } from './types';
import { validateXPTransaction } from './xp-validation';
import { validateLevelUp, validatePrestige } from './level-validation';

export function validateXPBatch(
  transactions: XPTransaction[],
  userHistory: {
    recentTransactions: XPTransaction[];
    currentLevel: number;
    currentXP: number;
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
): ValidationResult<{ valid: XPTransaction[]; rejected: XPTransaction[] }> {
  const result: ValidationResult<{
    valid: XPTransaction[];
    rejected: XPTransaction[];
  }> = {
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

  result.riskScore =
    transactions.length > 0 ? totalRiskScore / transactions.length : 0;

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

// ── Barrel Export ────────────────────────────────────────────────────────────

export { validateXPTransaction } from './xp-validation';
export { validateLevelUp, validatePrestige } from './level-validation';

export const ProgressionValidation = {
  validateXPTransaction,
  validateLevelUp,
  validatePrestige,
  validateXPBatch,
};

export default ProgressionValidation;
