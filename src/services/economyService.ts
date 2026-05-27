import { createDebugger } from "../utils/debug";
import { capture } from "../shared/analytics/analytics-service";
import { EconomyEvents } from "../shared/analytics/analytics-events";
const debug = createDebugger("economy-service");
export interface CurrencyGrant {
  userId: string;
  amount: number;
  currency: "COINS" | "GEMS" | "SPECIAL";
  source:
    | "SESSION_COMPLETE"
    | "DAILY_LOGIN"
    | "ACHIEVEMENT"
    | "PURCHASE"
    | "STREAK_BONUS";
  metadata?: Record<string, unknown>;
}
export interface Transaction {
  id: string;
  userId: string;
  type: "GRANT" | "SPEND" | "PURCHASE";
  amount: number;
  currency: "COINS" | "GEMS" | "SPECIAL";
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
export interface Wallet {
  userId: string;
  coins: number;
  gems: number;
  special: number;
  lastUpdated: string;
}
class EconomyService {
  private userId: string = "";
  private wallet: Wallet = {
    userId: "",
    coins: 0,
    gems: 0,
    special: 0,
    lastUpdated: new Date().toISOString(),
  };
  setUserId(userId: string): void {
    this.userId = userId;
    this.wallet.userId = userId;
    debug.info("Economy service initialized for user:", userId);
  }
  getWallet(): Wallet {
    return { ...this.wallet };
  }
  async addCurrency(grant: CurrencyGrant): Promise<boolean> {
    if (!this.userId) {
      debug.error("No user ID set for economy service");
      return false;
    }
    try {
      const oldBalance = this.wallet[
        grant.currency.toLowerCase() as keyof Wallet
      ] as number;
      switch (grant.currency) {
        case "COINS":
          this.wallet.coins += grant.amount;
          break;
        case "GEMS":
          this.wallet.gems += grant.amount;
          break;
        case "SPECIAL":
          this.wallet.special += grant.amount;
          break;
        default:
          debug.error("Invalid currency type:", grant.currency);
          return false;
      }
      this.wallet.lastUpdated = new Date().toISOString();
      capture(EconomyEvents.CURRENCY_GRANTED, {
        user_id: grant.userId,
        currency: grant.currency,
        amount: grant.amount,
        source: grant.source,
        old_balance: oldBalance,
        new_balance: this.wallet[
          grant.currency.toLowerCase() as keyof Wallet
        ] as number,
      });
      debug.info("Currency granted successfully", {
        currency: grant.currency,
        amount: grant.amount,
        source: grant.source,
        newBalance: this.wallet[grant.currency.toLowerCase() as keyof Wallet],
      });
      return true;
    } catch (error) {
      debug.error("Failed to grant currency:", error);
      return false;
    }
  }
  async spendCurrency(
    userId: string,
    amount: number,
    currency: "COINS" | "GEMS" | "SPECIAL",
    source: string,
  ): Promise<boolean> {
    if (!this.userId) {
      debug.error("No user ID set for economy service");
      return false;
    }
    try {
      const currentBalance = this.wallet[
        currency.toLowerCase() as keyof Wallet
      ] as number;
      if (currentBalance < amount) {
        debug.warn("Insufficient funds", {
          currency,
          required: amount,
          available: currentBalance,
        });
        return false;
      }
      const oldBalance = currentBalance;
      switch (currency) {
        case "COINS":
          this.wallet.coins -= amount;
          break;
        case "GEMS":
          this.wallet.gems -= amount;
          break;
        case "SPECIAL":
          this.wallet.special -= amount;
          break;
        default:
          debug.error("Invalid currency type:", currency);
          return false;
      }
      this.wallet.lastUpdated = new Date().toISOString();
      capture(EconomyEvents.CURRENCY_SPENT, {
        user_id: userId,
        currency,
        amount,
        source,
        old_balance: oldBalance,
        new_balance: this.wallet[
          currency.toLowerCase() as keyof Wallet
        ] as number,
      });
      debug.info("Currency spent successfully", {
        currency,
        amount,
        source,
        newBalance: this.wallet[currency.toLowerCase() as keyof Wallet],
      });
      return true;
    } catch (error) {
      debug.error("Failed to spend currency:", error);
      return false;
    }
  }
  canAfford(amount: number, currency: "COINS" | "GEMS" | "SPECIAL"): boolean {
    const balance = this.wallet[
      currency.toLowerCase() as keyof Wallet
    ] as number;
    return balance >= amount;
  }
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  reset(): void {
    this.userId = "";
    this.wallet = {
      userId: "",
      coins: 0,
      gems: 0,
      special: 0,
      lastUpdated: new Date().toISOString(),
    };
    debug.info("Economy service reset");
  }
}
export const economyService = new EconomyService();
