/**
 * Conversion Service
 * Currency conversion between different types
 */

import * as repository from './repository';
import * as analytics from './analytics';
import {
  ConvertCurrencyInputSchema,
  type ConvertCurrencyInput,
  type CurrencyType,
} from './schemas';
import { getOrCreateWallet, hasEnoughBalance } from './wallet-service';
import { spendCurrency } from './spending-service';
import { addCurrency } from './wallet-service';

const CONVERSION_RATES: Record<string, number> = {
  'COINS_GEMS': 0.01,
  'GEMS_COINS': 80,
};

const CONVERSION_FEE = 0.1;

/**
 * Get conversion rate between currencies
 */
export function getConversionRate(from: CurrencyType, to: CurrencyType): number {
  if (from === to) {return 1;}
  const key = `${from}_${to}`;
  return CONVERSION_RATES[key] ?? 0;
}

/**
 * Calculate conversion with fees
 */
export function calculateConversion(
  fromCurrency: CurrencyType,
  fromAmount: number,
  toCurrency: CurrencyType
): { toAmount: number; fee: number; exchangeRate: number } {
  const rate = getConversionRate(fromCurrency, toCurrency);
  const rawAmount = Math.floor(fromAmount * rate);
  const fee = Math.floor(rawAmount * CONVERSION_FEE);
  const toAmount = rawAmount - fee;

  return { toAmount, fee, exchangeRate: rate };
}

/**
 * Convert currency from one type to another
 */
export async function convertCurrency(input: ConvertCurrencyInput): Promise<{
  conversion: Awaited<ReturnType<typeof repository.createCurrencyConversion>>;
  fromBalance: number;
  toBalance: number;
}> {
  const validated = ConvertCurrencyInputSchema.parse(input);
  const wallet = await getOrCreateWallet(validated.userId);

  if (!hasEnoughBalance(wallet, validated.fromCurrency, validated.fromAmount)) {
    throw new Error(`Insufficient ${validated.fromCurrency.toLowerCase()}`);
  }

  const { toAmount, fee, exchangeRate } = calculateConversion(
    validated.fromCurrency,
    validated.fromAmount,
    validated.toCurrency
  );

  if (toAmount <= 0) {
    throw new Error('Conversion amount too small');
  }

  const spendResult = await spendCurrency({
    userId: validated.userId,
    currency: validated.fromCurrency,
    amount: validated.fromAmount,
    sink: 'CONVERT',
    description: `Convert to ${validated.toCurrency}`,
  });

  if (!spendResult.success) {
    throw new Error('Failed to spend currency for conversion');
  }

  const addResult = await addCurrency({
    userId: validated.userId,
    currency: validated.toCurrency,
    amount: toAmount,
    source: 'REWARD',
    description: `Converted from ${validated.fromCurrency}`,
    skipEvents: false,
    metadata: {
      fromCurrency: validated.fromCurrency,
      fromAmount: validated.fromAmount,
      exchangeRate,
      fee,
    },
  });

  const conversion = await repository.createCurrencyConversion({
    userId: validated.userId,
    fromCurrency: validated.fromCurrency,
    fromAmount: validated.fromAmount,
    toCurrency: validated.toCurrency,
    toAmount,
    exchangeRate,
    fee,
  });

  analytics.trackCurrencyConverted(
    validated.userId,
    validated.fromCurrency,
    validated.toCurrency,
    validated.fromAmount,
    toAmount
  );

  return {
    conversion,
    fromBalance: spendResult.newBalance,
    toBalance: addResult.newBalance,
  };
}
