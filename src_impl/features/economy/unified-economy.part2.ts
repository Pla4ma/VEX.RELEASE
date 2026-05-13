import { z } from "zod";


export function createInitialWallet(userId: string): Wallet {
  return {
    userId,
    coins: 1000, // Starting coins
    tokens: 0,
    totalEarnedCoins: 1000,
    totalEarnedTokens: 0,
    totalSpentCoins: 0,
    totalSpentTokens: 0,
    lastUpdated: Date.now(),
  };
}