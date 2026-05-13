import * as repository from "./repository";
import * as analytics from "./analytics";
import { eventBus } from "../../events";
import { AddCurrencyInputSchema, CalculateEarningsInputSchema, type Wallet, type WalletTransaction, type AddCurrencyInput, type CalculateEarningsInput, type CurrencyType } from "./schemas";


export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  let wallet = await repository.fetchWallet(userId);

  if (!wallet) {
    wallet = await repository.createWallet(userId);
    analytics.trackWalletCreated(userId);
  }

  return wallet;
}

export async function getWalletSummary(userId: string): Promise<{
  coins: number;
  gems: number;
} | null> {
  const wallet = await repository.fetchWallet(userId);

  if (!wallet) {
    return null;
  }

  return {
    coins: wallet.coins,
    gems: wallet.gems,
  };
}

export async function getBalance(userId: string, currency: CurrencyType): Promise<number> {
  const wallet = await getOrCreateWallet(userId);

  switch (currency) {
    case 'COINS':
      return wallet.coins;
    case 'GEMS':
      return wallet.gems;
  }
}

export function hasEnoughBalance(wallet: Wallet, currency: CurrencyType, amount: number): boolean {
  switch (currency) {
    case 'COINS':
      return wallet.coins >= amount;
    case 'GEMS':
      return wallet.gems >= amount;
  }
}

export function calculateEarningsMultiplier(input: CalculateEarningsInput): number {
  const validated = CalculateEarningsInputSchema.parse(input);

  let multiplier = 1;
  for (const [level, mult] of Object.entries(LEVEL_MULTIPLIERS)) {
    if (validated.userLevel >= parseInt(level, 10)) {
      multiplier = mult;
    }
  }

  if (validated.streakDays) {
    if (validated.streakDays >= 30) {
      multiplier += 0.5;
    } else if (validated.streakDays >= 14) {
      multiplier += 0.35;
    } else if (validated.streakDays >= 7) {
      multiplier += 0.25;
    } else if (validated.streakDays >= 3) {
      multiplier += 0.1;
    }
  }

  if (validated.squadMultiplier && validated.squadMultiplier > 1) {
    multiplier += validated.squadMultiplier - 1;
  }

  if (validated.eventMultiplier && validated.eventMultiplier > 1) {
    multiplier += validated.eventMultiplier - 1;
  }

  return Math.round(multiplier * 100) / 100;
}

export async function addCurrency(input: AddCurrencyInput): Promise<{
  newBalance: number;
  earnedAmount: number;
  transaction: WalletTransaction;
}> {
  const validated = AddCurrencyInputSchema.parse(input);
  const wallet = await getOrCreateWallet(validated.userId);

  const multiplier = validated.metadata?.skipMultiplier
    ? 1
    : calculateEarningsMultiplier({
        userId: validated.userId,
        source: validated.source,
        baseAmount: validated.amount,
        currency: validated.currency,
        userLevel: (validated.metadata?.userLevel as number) ?? 1,
        streakDays: validated.metadata?.streakDays as number,
        squadMultiplier: validated.metadata?.squadMultiplier as number,
        eventMultiplier: validated.metadata?.eventMultiplier as number,
      });

  const finalAmount = Math.floor(validated.amount * multiplier);

  let newBalance = 0;
  switch (validated.currency) {
    case 'COINS': {
      newBalance = wallet.coins + finalAmount;
      break;
    }
    case 'GEMS': {
      newBalance = wallet.gems + finalAmount;
      break;
    }
  }

  const updateData: Parameters<typeof repository.updateWalletBalance>[1] = {};
  switch (validated.currency) {
    case 'COINS': {
      updateData.coins = newBalance;
      updateData.totalCoinsEarned = wallet.totalCoinsEarned + finalAmount;
      break;
    }
    case 'GEMS': {
      updateData.gems = newBalance;
      updateData.totalGemsEarned = wallet.totalGemsEarned + finalAmount;
      break;
    }
  }

  await repository.updateWalletBalance(validated.userId, updateData);

  const balanceBefore = validated.currency === 'COINS' ? wallet.coins : wallet.gems;
  const transaction = await repository.createTransaction({
    walletId: wallet.id,
    userId: validated.userId,
    type: 'EARN',
    currency: validated.currency,
    amount: finalAmount,
    balanceBefore,
    balanceAfter: newBalance,
    source: validated.source,
    sourceId: validated.sourceId ?? null,
    description: validated.description,
    metadata: {
      ...validated.metadata,
      multiplier,
      baseAmount: validated.amount,
    },
  });

  analytics.trackCurrencyEarned(validated.userId, validated.currency, finalAmount, validated.source, multiplier);

  if (!validated.skipEvents) {
    eventBus.publish('economy:currency_added', {
      userId: validated.userId,
      currency: validated.currency,
      amount: finalAmount,
      source: validated.source,
      newBalance,
    });
  }

  return {
    newBalance,
    earnedAmount: finalAmount,
    transaction,
  };
}