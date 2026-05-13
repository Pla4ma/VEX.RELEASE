/**
 * Wallet Service
 * Core wallet management functions for the economy system
 */

import * as repository from './repository';
import * as analytics from './analytics';
import { eventBus } from '../../events';
import { AddCurrencyInputSchema, CalculateEarningsInputSchema, type Wallet, type WalletTransaction, type AddCurrencyInput, type CalculateEarningsInput, type CurrencyType } from './schemas';

// Level-based multipliers for earnings
const LEVEL_MULTIPLIERS: Record<number, number> = {
  1: 1,
  10: 1.1,
  20: 1.2,
  30: 1.3,
  40: 1.4,
  50: 1.5,
  75: 1.75,
  100: 2,
};

export * from "./wallet-service.part1";
