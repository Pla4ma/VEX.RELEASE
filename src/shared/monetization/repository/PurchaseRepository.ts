/**
 * Purchase Repository
 *
 * Data access layer for purchase/subscription data.
 *
 * @phase 6 - Deepening: Repository layer
 */

import { MMKV } from "react-native-mmkv";
import { createDebugger } from "../../../utils/debug";

const debug = createDebugger("monetization:repository");

const storage = new MMKV({ id: "monetization-repo" });

const KEYS = {
  purchases: (userId: string) => `purchases:${userId}`,
  subscriptions: (userId: string) => `subscriptions:${userId}`,
  receiptCache: (transactionId: string) => `receipt:${transactionId}`,
};

export interface Purchase {
  transactionId: string;
  productId: string;
  price: number;
  currency: string;
  platform: "ios" | "android" | "stripe";
  purchasedAt: number;
  receipt: string;
  userId: string;
}

export interface Subscription {
  id: string;
  productId: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startedAt: number;
  expiresAt: number;
  platform: "ios" | "android" | "stripe";
  userId: string;
}

export class PurchaseRepository {
  async getPurchases(userId: string): Promise<Purchase[]> {
    try {
      const data = storage.getString(KEYS.purchases(userId));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      debug.error("Failed to get purchases", error as Error);
      return [];
    }
  }

  async savePurchase(userId: string, purchase: Purchase): Promise<void> {
    try {
      const purchases = await this.getPurchases(userId);
      const existingIndex = purchases.findIndex(
        (p) => p.transactionId === purchase.transactionId,
      );

      if (existingIndex >= 0) {
        purchases[existingIndex] = purchase;
      } else {
        purchases.push(purchase);
      }

      storage.set(KEYS.purchases(userId), JSON.stringify(purchases));
      debug.info("Purchase saved", {
        userId,
        transactionId: purchase.transactionId,
      });
    } catch (error) {
      debug.error("Failed to save purchase", error as Error);
      throw new PurchaseRepositoryError("Failed to save purchase", {
        cause: error,
      });
    }
  }

  async getSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const data = storage.getString(KEYS.subscriptions(userId));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      debug.error("Failed to get subscriptions", error as Error);
      return [];
    }
  }

  async saveSubscription(
    userId: string,
    subscription: Subscription,
  ): Promise<void> {
    try {
      const subscriptions = await this.getSubscriptions(userId);
      const existingIndex = subscriptions.findIndex(
        (s) => s.id === subscription.id,
      );

      if (existingIndex >= 0) {
        subscriptions[existingIndex] = subscription;
      } else {
        subscriptions.push(subscription);
      }

      storage.set(KEYS.subscriptions(userId), JSON.stringify(subscriptions));
      debug.info("Subscription saved", {
        userId,
        subscriptionId: subscription.id,
      });
    } catch (error) {
      debug.error("Failed to save subscription", error as Error);
      throw new PurchaseRepositoryError("Failed to save subscription", {
        cause: error,
      });
    }
  }

  async cacheReceipt(transactionId: string, receipt: string): Promise<void> {
    storage.set(KEYS.receiptCache(transactionId), receipt);
  }

  async getCachedReceipt(transactionId: string): Promise<string | null> {
    return storage.getString(KEYS.receiptCache(transactionId)) ?? null;
  }
}

export class PurchaseRepositoryError extends Error {
  constructor(
    message: string,
    public details?: { cause?: unknown },
  ) {
    super(message);
    this.name = "PurchaseRepositoryError";
  }
}

export const purchaseRepository = new PurchaseRepository();
export default purchaseRepository;
