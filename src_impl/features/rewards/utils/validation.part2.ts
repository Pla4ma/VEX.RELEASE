import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export function validateLedgerBalance(
  userId: string,
  ledger: {
    transactions: { type: 'EARN' | 'SPEND'; amount: number; timestamp: number }[];
    currentBalance: number;
  },
): ValidationResult<{ expectedBalance: number; discrepancy: number }> {
  const result: ValidationResult<{ expectedBalance: number; discrepancy: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    manipulationRisk: 'NONE',
  };

  // Calculate expected balance
  const earned = ledger.transactions.filter((t) => t.type === 'EARN').reduce((sum, t) => sum + t.amount, 0);

  const spent = ledger.transactions.filter((t) => t.type === 'SPEND').reduce((sum, t) => sum + t.amount, 0);

  const expectedBalance = earned - spent;
  const discrepancy = Math.abs(expectedBalance - ledger.currentBalance);

  result.data = { expectedBalance, discrepancy };

  if (discrepancy > 0) {
    result.violations.push({
      type: 'VALUE_MISMATCH',
      field: 'balance',
      message: `Ledger discrepancy: expected ${expectedBalance}, found ${ledger.currentBalance}`,
      severity: discrepancy > 1000 ? 'CRITICAL' : 'HIGH',
    });
    result.manipulationRisk = discrepancy > 1000 ? 'HIGH' : 'MEDIUM';
    result.valid = false;

    eventBus.publish('analytics:track', {
      event: 'reward_ledger_discrepancy',
      properties: {
        userId,
        expectedBalance,
        actualBalance: ledger.currentBalance,
        discrepancy,
      },
    });
  }

  return result;
}

export const RewardsValidation = {
  validateChestReward,
  validateDailyLogin,
  validateLedgerBalance,
  ChestTierSchema,
  RewardItemSchema,
  TIER_VALUE_RANGES,
  TIER_DROP_RATES,
};