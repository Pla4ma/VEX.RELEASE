import { z } from 'zod';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';
import { enqueue } from '../sync/OfflineSyncService';

const debug = createDebugger('economy');

export const CurrencyTypeSchema = z.enum(['COINS', 'GEMS', 'SEASONAL']);
export type CurrencyType = z.infer<typeof CurrencyTypeSchema>;

export const WalletSchema = z.object({
  coins: z.number().min(0).default(0),
  gems: z.number().min(0).default(0),
  seasonal: z.record(z.number().min(0)).default({}),
  totalEarned: z.record(z.number().min(0)).default({}),
  totalSpent: z.record(z.number().min(0)).default({}),
  lastUpdated: z.number().default(Date.now),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['EARN', 'SPEND', 'GIFT', 'TRADE', 'CONVERT', 'REFUND']),
  currency: CurrencyTypeSchema,
  amount: z.number(),
  balanceAfter: z.number(),
  description: z.string(),
  metadata: z.record(z.unknown()).optional(),
  relatedUserId: z.string().optional(),
  createdAt: z.number(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

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

function isNetworkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  return ['network', 'fetch', 'offline', 'timed out', 'socket'].some((token) =>
    message.includes(token),
  );
}

export class EconomyService {
  private userId: string | null = null;
  private wallet: Wallet;
  private transactions: Transaction[] = [];
  private userLevel = 1;
  private transactionQueue: Transaction[] = [];
  private processingTransactions = false;

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.wallet = WalletSchema.parse({});
    this.setupEventListeners();
    void this.loadState();
  }

  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }

    if (this.userId) {
      this.clearLocalState(this.userId);
    }

    if (!userId) {
      this.userId = null;
      return;
    }

    this.userId = userId;
    void this.loadState();
    debug.info('EconomyService user set: %s', userId);
  }

  private clearLocalState(userId: string): void {
    this.wallet = WalletSchema.parse({});
    this.transactions = [];
    this.transactionQueue = [];
    this.processingTransactions = false;
    this.userLevel = 1;

    const storage = getMMKVStorageAdapter();
    void Promise.all([
      storage.removeItem(`economy:wallet:${userId}`),
      storage.removeItem(`economy:transactions:${userId}`),
    ]).catch((error: unknown) => {
      debug.error('Failed to clear economy local state', error as Error);
    });
  }

  private setupEventListeners(): void {
    eventBus.subscribe(
      'economy:add_currency',
      (payload: {
        userId: string;
        type: CurrencyType;
        amount: number;
        source: string;
      }) => {
        if (payload.userId === this.userId) {
          void this.addCurrency(payload.type, payload.amount, payload.source);
        }
      },
    );

    eventBus.subscribe(
      'progression:level_up',
      (payload: { userId: string; newLevel: number }) => {
        if (payload.userId === this.userId) {
          this.userLevel = payload.newLevel;
          debug.info(
            'Level up detected, new multiplier: %dx',
            this.getLevelMultiplier(),
          );
        }
      },
    );

    eventBus.subscribe(
      'shop:purchase',
      (payload: {
        userId: string;
        itemId: string;
        price: { currency: CurrencyType; amount: number };
      }) => {
        if (payload.userId === this.userId) {
          void this.spendCurrency(
            payload.price.currency,
            payload.price.amount,
            `Purchased ${payload.itemId}`,
          );
        }
      },
    );

    eventBus.subscribe(
      'social:gift_currency',
      (payload: {
        fromUserId: string;
        toUserId: string;
        currency: CurrencyType;
        amount: number;
      }) => {
        if (payload.toUserId === this.userId) {
          void this.receiveGift(
            payload.fromUserId,
            payload.currency,
            payload.amount,
          );
        }

        if (payload.fromUserId === this.userId) {
          void this.sendGift(
            payload.toUserId,
            payload.currency,
            payload.amount,
          );
        }
      },
    );
  }

  async addCurrency(
    currency: CurrencyType,
    amount: number,
    source: string,
    metadata?: Record<string, unknown>,
  ): Promise<Wallet> {
    if (!this.userId) {
      throw new Error('EconomyService: No user set');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const exactAmount =
      typeof metadata?.exactAmount === 'number'
        ? metadata.exactAmount
        : undefined;
    const multiplier =
      typeof exactAmount === 'number' ? 1 : this.getLevelMultiplier();
    const finalAmount =
      typeof exactAmount === 'number'
        ? Math.floor(exactAmount)
        : Math.floor(amount * multiplier);

    switch (currency) {
      case 'COINS':
        this.wallet.coins += finalAmount;
        break;
      case 'GEMS':
        this.wallet.gems += finalAmount;
        break;
      case 'SEASONAL': {
        const seasonId = (metadata?.seasonId as string) || 'current';
        this.wallet.seasonal[seasonId] =
          (this.wallet.seasonal[seasonId] || 0) + finalAmount;
        break;
      }
    }

    this.wallet.totalEarned[currency] =
      (this.wallet.totalEarned[currency] || 0) + finalAmount;
    this.wallet.lastUpdated = Date.now();

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId: this.userId,
      type: 'EARN',
      currency,
      amount: finalAmount,
      balanceAfter: this.getBalance(currency),
      description: `Earned from ${source}`,
      metadata: { ...metadata, multiplier },
      createdAt: Date.now(),
    };

    await this.queueTransaction(transaction);
    try {
      throw new Error('network sync unavailable');
    } catch (error) {
      if (isNetworkError(error)) {
        await enqueue('reward_claim', {
          userId: this.userId,
          currency,
          amount: finalAmount,
          source,
          description: transaction.description,
        });
      }
    }

    eventBus.publish('economy:currency_added', {
      userId: this.userId,
      currency,
      amount: finalAmount,
      source,
      newBalance: this.getBalance(currency),
    });

    const analytics = getAnalyticsService();
    analytics.track('currency_earned', {
      user_id: this.userId,
      currency_type: currency,
      amount: finalAmount,
      source,
      level: this.userLevel,
    });

    debug.info(
      'Added %d %s from %s (multiplier: %dx)',
      finalAmount,
      currency,
      source,
      multiplier,
    );

    await this.saveState();
    return this.wallet;
  }

  async spendCurrency(
    currency: CurrencyType,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<Wallet> {
    if (!this.userId) {
      throw new Error('EconomyService: No user set');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (this.getBalance(currency) < amount) {
      throw new Error(
        `Insufficient ${currency}. Required: ${amount}, Available: ${this.getBalance(currency)}`,
      );
    }

    switch (currency) {
      case 'COINS':
        this.wallet.coins -= amount;
        break;
      case 'GEMS':
        this.wallet.gems -= amount;
        break;
      case 'SEASONAL': {
        const seasonId = (metadata?.seasonId as string) || 'current';
        this.wallet.seasonal[seasonId] =
          (this.wallet.seasonal[seasonId] || 0) - amount;
        if (this.wallet.seasonal[seasonId] < 0) {
          this.wallet.seasonal[seasonId] = 0;
        }
        break;
      }
    }

    this.wallet.totalSpent[currency] =
      (this.wallet.totalSpent[currency] || 0) + amount;
    this.wallet.lastUpdated = Date.now();

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId: this.userId,
      type: 'SPEND',
      currency,
      amount: -amount,
      balanceAfter: this.getBalance(currency),
      description,
      metadata,
      createdAt: Date.now(),
    };

    await this.queueTransaction(transaction);
    try {
      throw new Error('network sync unavailable');
    } catch (error) {
      if (isNetworkError(error)) {
        await enqueue('reward_claim', {
          userId: this.userId,
          currency,
          amount,
          description,
        });
      }
    }

    eventBus.publish('economy:currency_spent', {
      userId: this.userId,
      currency,
      amount,
      description,
      newBalance: this.getBalance(currency),
    });

    const analytics = getAnalyticsService();
    analytics.track('currency_spent', {
      user_id: this.userId,
      currency_type: currency,
      amount,
      description,
    });

    debug.info('Spent %d %s for %s', amount, currency, description);

    await this.saveState();
    return this.wallet;
  }

  async sendGift(
    toUserId: string,
    currency: CurrencyType,
    amount: number,
  ): Promise<void> {
    if (!this.userId) {
      throw new Error('EconomyService: No user set');
    }

    await this.spendCurrency(currency, amount, `Gift to ${toUserId}`, {
      recipient: toUserId,
    });

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId: this.userId,
      type: 'GIFT',
      currency,
      amount: -amount,
      balanceAfter: this.getBalance(currency),
      description: `Gifted to ${toUserId}`,
      relatedUserId: toUserId,
      createdAt: Date.now(),
    };

    await this.queueTransaction(transaction);

    eventBus.publish('social:gift_currency', {
      fromUserId: this.userId,
      toUserId,
      currency,
      amount,
    });

    debug.info('Sent gift: %d %s to %s', amount, currency, toUserId);
  }

  async receiveGift(
    fromUserId: string,
    currency: CurrencyType,
    amount: number,
  ): Promise<void> {
    if (!this.userId) {
      throw new Error('EconomyService: No user set');
    }

    switch (currency) {
      case 'COINS':
        this.wallet.coins += amount;
        break;
      case 'GEMS':
        this.wallet.gems += amount;
        break;
      case 'SEASONAL':
        this.wallet.seasonal.gift = (this.wallet.seasonal.gift || 0) + amount;
        break;
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId: this.userId,
      type: 'GIFT',
      currency,
      amount,
      balanceAfter: this.getBalance(currency),
      description: `Gift from ${fromUserId}`,
      relatedUserId: fromUserId,
      createdAt: Date.now(),
    };

    await this.queueTransaction(transaction);

    eventBus.publish('notification:send', {
      userId: this.userId,
      type: 'gift_received',
      title: 'Gift Received!',
      body: `You received ${amount} ${currency} from a friend!`,
      data: { fromUserId, currency, amount },
    });

    debug.info('Received gift: %d %s from %s', amount, currency, fromUserId);
    await this.saveState();
  }

  async convertCurrency(
    fromCurrency: CurrencyType,
    toCurrency: CurrencyType,
    amount: number,
  ): Promise<number> {
    if (!this.userId) {
      throw new Error('EconomyService: No user set');
    }

    if (fromCurrency === toCurrency) {
      throw new Error('Cannot convert currency to itself');
    }

    if (this.getBalance(fromCurrency) < amount) {
      throw new Error(`Insufficient ${fromCurrency}`);
    }

    const rates: Record<string, number> = {
      'COINS-GEMS': 0.001,
      'GEMS-COINS': 800,
      'COINS-SEASONAL': 0.01,
      'SEASONAL-COINS': 50,
    };

    const rate = rates[`${fromCurrency}-${toCurrency}`];
    if (!rate) {
      throw new Error(
        `Conversion not supported: ${fromCurrency} to ${toCurrency}`,
      );
    }

    const convertedAmount = Math.floor(amount * rate);

    await this.spendCurrency(
      fromCurrency,
      amount,
      `Converted to ${toCurrency}`,
    );
    await this.addCurrency(toCurrency, convertedAmount, 'Currency conversion');

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      userId: this.userId,
      type: 'CONVERT',
      currency: toCurrency,
      amount: convertedAmount,
      balanceAfter: this.getBalance(toCurrency),
      description: `Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`,
      metadata: { fromCurrency, fromAmount: amount, rate },
      createdAt: Date.now(),
    };

    await this.queueTransaction(transaction);
    return convertedAmount;
  }

  private async queueTransaction(transaction: Transaction): Promise<void> {
    this.transactionQueue.push(transaction);

    if (!this.processingTransactions) {
      await this.processTransactionQueue();
    }
  }

  private async processTransactionQueue(): Promise<void> {
    if (this.processingTransactions || this.transactionQueue.length === 0) {
      return;
    }

    this.processingTransactions = true;

    try {
      while (this.transactionQueue.length > 0) {
        const transaction = this.transactionQueue.shift();
        if (!transaction) {
          continue;
        }

        TransactionSchema.parse(transaction);
        this.transactions.push(transaction);

        if (this.transactions.length > 1000) {
          this.transactions = this.transactions.slice(-1000);
        }

        debug.debug('Processed transaction: %s', transaction.id);
      }

      await this.saveTransactions();
    } finally {
      this.processingTransactions = false;
    }
  }

  private getLevelMultiplier(): number {
    let multiplier = 1;

    for (const [level, value] of Object.entries(LEVEL_MULTIPLIERS)) {
      if (this.userLevel >= parseInt(level, 10)) {
        multiplier = value;
      }
    }

    return multiplier;
  }

  getBalance(currency: CurrencyType): number {
    switch (currency) {
      case 'COINS':
        return this.wallet.coins;
      case 'GEMS':
        return this.wallet.gems;
      case 'SEASONAL':
        return Object.values(this.wallet.seasonal).reduce(
          (sum, value) => sum + value,
          0,
        );
      default:
        return 0;
    }
  }

  getWallet(): Wallet {
    return { ...this.wallet };
  }

  getTransactions(limit = 100): Transaction[] {
    return this.transactions.slice(-limit);
  }

  getTotalEarned(currency: CurrencyType): number {
    return this.wallet.totalEarned[currency] || 0;
  }

  getTotalSpent(currency: CurrencyType): number {
    return this.wallet.totalSpent[currency] || 0;
  }

  getNetEarnings(currency: CurrencyType): number {
    return this.getTotalEarned(currency) - this.getTotalSpent(currency);
  }

  hasEnough(currency: CurrencyType, amount: number): boolean {
    return this.getBalance(currency) >= amount;
  }

  private async loadState(): Promise<void> {
    if (!this.userId) {
      return;
    }

    try {
      const walletKey = `economy:wallet:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      const walletData = await storage.getItem(walletKey);
      if (walletData) {
        this.wallet = WalletSchema.parse(JSON.parse(walletData));
      }

      const txKey = `economy:transactions:${this.userId}`;
      const txData = await storage.getItem(txKey);
      if (txData) {
        this.transactions = JSON.parse(txData);
      }

      debug.info(
        'Loaded economy state: %d coins, %d gems',
        this.wallet.coins,
        this.wallet.gems,
      );
    } catch (error) {
      debug.error('Failed to load economy state', error as Error);
    }
  }

  private async saveState(): Promise<void> {
    if (!this.userId) {
      return;
    }

    try {
      const walletKey = `economy:wallet:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      await storage.setItem(walletKey, JSON.stringify(this.wallet));
    } catch (error) {
      debug.error('Failed to save economy state', error as Error);
    }
  }

  private async saveTransactions(): Promise<void> {
    if (!this.userId) {
      return;
    }

    try {
      const txKey = `economy:transactions:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      await storage.setItem(txKey, JSON.stringify(this.transactions));
    } catch (error) {
      debug.error('Failed to save transactions', error as Error);
    }
  }

  private generateTransactionId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

let economyServiceInstance: EconomyService | null = null;

export function getEconomyService(userId?: string): EconomyService {
  if (!economyServiceInstance) {
    economyServiceInstance = new EconomyService(userId);
  } else if (userId) {
    economyServiceInstance.setUserId(userId);
  }

  return economyServiceInstance;
}
