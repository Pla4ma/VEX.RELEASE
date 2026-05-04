import { z } from 'zod';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';
import { getEconomyService } from '../economy/EconomyService';
import { recordRewardLedgerEntry } from '../features/rewards/ledger-service';
import type { User } from '../types/models';
const debug = createDebugger('rewards');
export const RewardTypeSchema = z.enum([
  'XP',
  'CURRENCY',
  'PREMIUM',
  'ITEM',
  'BADGE',
  'STREAK_BONUS',
  'BOOST',
]);
export const RewardRaritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
export const RewardSourceSchema = z.enum([
  'SESSION_COMPLETE',
  'STREAK_MILESTONE',
  'LEVEL_UP',
  'CHALLENGE_COMPLETE',
  'ACHIEVEMENT_UNLOCK',
  'SEASON_REWARD',
  'SOCIAL_BONUS',
  'COMEBACK_BONUS',
  'DAILY_BONUS',
  'EVENT_PARTICIPATION',
  'AI_COACH_GOAL',
  'DUEL_WIN',
  'DUEL_COMPLETED',
]);
export const RewardSchema = z.object({
  id: z.string().uuid(),
  type: RewardTypeSchema,
  source: RewardSourceSchema,
  rarity: RewardRaritySchema,
  amount: z.number().positive(),
  metadata: z.record(z.unknown()).optional(),
  userId: z.string(),
  createdAt: z.number(),
  claimedAt: z.number().optional(),
  expiresAt: z.number().optional(),
  multiplier: z.number().default(1),
  streakBonus: z.number().default(0),
  seasonId: z.string().optional(),
  challengeId: z.string().optional(),
});
export type Reward = z.infer<typeof RewardSchema>;
export type RewardType = z.infer<typeof RewardTypeSchema>;
export type RewardRarity = z.infer<typeof RewardRaritySchema>;
export type RewardSource = z.infer<typeof RewardSourceSchema>;
export const RewardCalculationSchema = z.object({
  baseAmount: z.number().positive(),
  streakMultiplier: z.number().min(1).max(5).default(1),
  levelMultiplier: z.number().min(1).max(3).default(1),
  eventMultiplier: z.number().min(1).max(10).default(1),
  seasonMultiplier: z.number().min(1).max(2).default(1),
  comebackBonus: z.number().min(0).max(100).default(0),
  socialBonus: z.number().min(0).max(50).default(0),
});
export type RewardCalculation = z.infer<typeof RewardCalculationSchema>;
export const RewardConfigSchema = z.record(
  RewardSourceSchema,
  z.object({
    baseXP: z.number(),
    baseCurrency: z.number(),
    streakMultiplierEnabled: z.boolean(),
    levelMultiplierEnabled: z.boolean(),
    rarityWeights: z.record(z.number()),
  }),
);
export interface RewardGrantedEvent {
  reward: Reward;
  userId: string;
  totalXP: number;
  totalCurrency: number;
  newLevel?: number;
  streakBonus: number;
  challengeProgress?: string[];
}
export interface RewardClaimedEvent {
  rewardId: string;
  userId: string;
  claimedAt: number;
  actualValue: number;
  appliedBoosts: string[];
}
export interface RewardExpiredEvent {
  rewardId: string;
  userId: string;
  expiredAt: number;
  unclaimedValue: number;
}
export class RewardService {
  private userId: string | null = null;
  private pendingRewards: Map<string, Reward> = new Map();
  private claimQueue: string[] = [];
  private processingClaims = false;
  private readonly REWARD_CONFIG: z.infer<typeof RewardConfigSchema> = {
    SESSION_COMPLETE: {
      baseXP: 100,
      baseCurrency: 50,
      streakMultiplierEnabled: true,
      levelMultiplierEnabled: true,
      rarityWeights: { COMMON: 70, UNCOMMON: 20, RARE: 8, EPIC: 2 },
    },
    STREAK_MILESTONE: {
      baseXP: 200,
      baseCurrency: 100,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: true,
      rarityWeights: { COMMON: 50, UNCOMMON: 30, RARE: 15, EPIC: 5 },
    },
    LEVEL_UP: {
      baseXP: 0,
      baseCurrency: 500,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: false,
      rarityWeights: { RARE: 60, EPIC: 35, LEGENDARY: 5 },
    },
    CHALLENGE_COMPLETE: {
      baseXP: 500,
      baseCurrency: 250,
      streakMultiplierEnabled: true,
      levelMultiplierEnabled: true,
      rarityWeights: { UNCOMMON: 40, RARE: 35, EPIC: 20, LEGENDARY: 5 },
    },
    ACHIEVEMENT_UNLOCK: {
      baseXP: 300,
      baseCurrency: 150,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: false,
      rarityWeights: { RARE: 50, EPIC: 40, LEGENDARY: 10 },
    },
    SEASON_REWARD: {
      baseXP: 1000,
      baseCurrency: 500,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: false,
      rarityWeights: { EPIC: 70, LEGENDARY: 30 },
    },
    SOCIAL_BONUS: {
      baseXP: 50,
      baseCurrency: 25,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: false,
      rarityWeights: { COMMON: 90, UNCOMMON: 10 },
    },
    COMEBACK_BONUS: {
      baseXP: 300,
      baseCurrency: 200,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: false,
      rarityWeights: { UNCOMMON: 50, RARE: 40, EPIC: 10 },
    },
    DAILY_BONUS: {
      baseXP: 75,
      baseCurrency: 50,
      streakMultiplierEnabled: true,
      levelMultiplierEnabled: false,
      rarityWeights: { COMMON: 80, UNCOMMON: 15, RARE: 5 },
    },
    EVENT_PARTICIPATION: {
      baseXP: 150,
      baseCurrency: 100,
      streakMultiplierEnabled: false,
      levelMultiplierEnabled: true,
      rarityWeights: { UNCOMMON: 60, RARE: 30, EPIC: 10 },
    },
    AI_COACH_GOAL: {
      baseXP: 250,
      baseCurrency: 125,
      streakMultiplierEnabled: true,
      levelMultiplierEnabled: true,
      rarityWeights: { UNCOMMON: 50, RARE: 35, EPIC: 15 },
    },
  };
  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.loadPendingRewards();
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
    this.loadPendingRewards();
    debug.info('RewardService user set: %s', userId);
  }
  private clearLocalState(userId: string): void {
    this.pendingRewards.clear();
    this.claimQueue = [];
    this.processingClaims = false;
    const storage = getMMKVStorageAdapter();
    void storage.removeItem(`rewards:pending:${userId}`).catch((error: unknown) => {
      debug.error('Failed to clear reward local state', error as Error);
    });
  }
  async grantReward(
    type: RewardType,
    source: RewardSource,
    calculation: Partial<RewardCalculation>,
    metadata?: Record<string, unknown>,
  ): Promise<Reward> {
    if (!this.userId) {
      throw new Error('RewardService: No user set');
    }
    const userId = this.userId;
    const config = this.REWARD_CONFIG[source];
    if (!config) {
      throw new Error(`RewardService: Unknown source ${source}`);
    }
    const fullCalculation = RewardCalculationSchema.parse({ baseAmount: 1, ...calculation });
    const exactAmount =
      typeof metadata?.exactAmount === 'number' ? metadata.exactAmount : undefined;
    const finalAmount = this.calculateFinalAmount(
      type,
      source,
      fullCalculation,
      config,
      exactAmount,
    );
    const rarity = this.determineRarity(config.rarityWeights, fullCalculation);
    const reward: Reward = {
      id: this.generateRewardId(),
      type,
      source,
      rarity,
      amount: Math.floor(finalAmount),
      metadata: { ...metadata, calculation: fullCalculation, config: config },
      userId,
      createdAt: Date.now(),
      multiplier:
        fullCalculation.streakMultiplier *
        fullCalculation.levelMultiplier *
        fullCalculation.eventMultiplier,
      streakBonus: this.calculateStreakBonus(fullCalculation),
    };
    RewardSchema.parse(reward);
    this.pendingRewards.set(reward.id, reward);
    await this.savePendingRewards();
    debug.info('Granted reward', {
      rewardId: reward.id,
      userId: userId,
      type: reward.type,
      source: reward.source,
      amount: reward.amount,
      streakBonus: reward.streakBonus,
    });
    const analytics = getAnalyticsService();
    analytics.track('reward_granted', {
      reward_type: type,
      reward_source: source,
      user_id: userId,
      reward_rarity: rarity,
      reward_amount: reward.amount,
      reward_multiplier: reward.multiplier,
    });
    debug.info('Reward granted: %s %s from %s', reward.amount, type, source);
    if (type === 'XP' || type === 'CURRENCY' || type === 'PREMIUM') {
      await this.claimReward(reward.id);
    }
    return reward;
  }
  async grantRewards(
    rewards: Array<{
      type: RewardType;
      source: RewardSource;
      calculation: Partial<RewardCalculation>;
      metadata?: Record<string, unknown>;
    }>,
  ): Promise<Reward[]> {
    const granted: Reward[] = [];
    for (const reward of rewards) {
      try {
        const grantedReward = await this.grantReward(
          reward.type,
          reward.source,
          reward.calculation,
          reward.metadata,
        );
        granted.push(grantedReward);
      } catch (error) {
        debug.warn('Failed to grant reward batch item', {
          rewardType: reward.type,
          rewardSource: reward.source,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    if (granted.length > 0 && this.userId) {
      debug.info('Batch granted rewards', {
        userId: this.userId,
        count: granted.length,
        totalXP: granted.filter((r) => r.type === 'XP').reduce((sum, r) => sum + r.amount, 0),
        totalCurrency: granted
          .filter((r) => r.type === 'CURRENCY')
          .reduce((sum, r) => sum + r.amount, 0),
      });
    }
    return granted;
  }
  async claimReward(rewardId: string): Promise<Reward> {
    const reward = this.pendingRewards.get(rewardId);
    if (!reward) {
      throw new Error(`Reward not found: ${rewardId}`);
    }
    if (reward.claimedAt) {
      throw new Error(`Reward already claimed: ${rewardId}`);
    }
    if (reward.expiresAt && reward.expiresAt < Date.now()) {
      throw new Error(`Reward expired: ${rewardId}`);
    }
    this.claimQueue.push(rewardId);
    if (!this.processingClaims) {
      await this.processClaimQueue();
    }
    return reward;
  }
  private async processClaimQueue(): Promise<void> {
    if (this.processingClaims || this.claimQueue.length === 0) {
      return;
    }
    this.processingClaims = true;
    const appliedBoosts: string[] = [];
    try {
      while (this.claimQueue.length > 0) {
        const rewardId = this.claimQueue.shift();
        if (!rewardId) {continue;}
        const reward = this.pendingRewards.get(rewardId);
        if (!reward || reward.claimedAt) {continue;}
        reward.claimedAt = Date.now();
        await this.applyReward(reward);

        // Record in reward ledger for user visibility
        try {
          const ledgerType = this.mapRewardTypeToLedgerType(reward.type);
          await recordRewardLedgerEntry({
            userId: reward.userId,
            type: ledgerType,
            amount: reward.amount,
            source: reward.source,
            description: `${reward.type} reward claimed (${reward.source})`,
            earnedAt: reward.claimedAt,
            sessionId: reward.metadata?.sessionId as string | undefined,
          });
        } catch (ledgerError) {
          debug.warn('Failed to record reward ledger entry', ledgerError as Error);
        }

        this.pendingRewards.delete(rewardId);
        await this.savePendingRewards();
        const claimedEvent: RewardClaimedEvent = {
          rewardId: reward.id,
          userId: reward.userId,
          claimedAt: reward.claimedAt,
          actualValue: reward.amount,
          appliedBoosts,
        };
        eventBus.publish('reward:claimed', claimedEvent);
        const analytics = getAnalyticsService();
        analytics.track('reward_claimed', {
          reward_id: reward.id,
          reward_type: reward.type,
          reward_amount: reward.amount,
          user_id: reward.userId,
        });
        debug.info('Reward claimed: %s', reward.id);
      }
    } finally {
      this.processingClaims = false;
    }
  }
  private async applyReward(reward: Reward): Promise<void> {
    switch (reward.type) {
      case 'XP':
        eventBus.publish('progression:add_xp', {
          userId: reward.userId,
          amount: reward.amount,
          source: reward.source,
        });
        break;
      case 'CURRENCY':
        await getEconomyService(reward.userId).addCurrency('COINS', reward.amount, reward.source, {
          rewardId: reward.id,
          rewardType: reward.type,
          ...reward.metadata,
        });
        break;
      case 'PREMIUM':
        await getEconomyService(reward.userId).addCurrency('GEMS', reward.amount, reward.source, {
          rewardId: reward.id,
          rewardType: reward.type,
          ...reward.metadata,
        });
        break;
      case 'ITEM':
        eventBus.publish('inventory:add_item', {
          userId: reward.userId,
          itemId: reward.metadata?.itemId as string,
          rarity: reward.rarity,
          source: reward.source,
        });
        break;
      case 'BADGE':
        eventBus.publish('achievements:unlock_badge', {
          userId: reward.userId,
          badgeId: reward.metadata?.badgeId as string,
          rarity: reward.rarity,
        });
        break;
      case 'BOOST':
        eventBus.publish('boosts:activate', {
          userId: reward.userId,
          boostType: reward.metadata?.boostType as string,
          duration: reward.metadata?.duration as number,
          multiplier: reward.amount,
        });
        break;
      case 'STREAK_BONUS':
        eventBus.publish('streak:apply_bonus', { userId: reward.userId, bonus: reward.amount });
        break;
    }
  }
  private calculateFinalAmount(
    type: RewardType,
    source: RewardSource,
    calculation: RewardCalculation,
    config?: z.infer<typeof RewardConfigSchema>[RewardSource],
    exactAmount?: number,
  ): number {
    if (typeof exactAmount === 'number' && exactAmount > 0) {
      return exactAmount;
    }
    if (!config) {
      return calculation.baseAmount;
    }
    let base = 0;
    switch (type) {
      case 'XP':
        base = config.baseXP;
        break;
      case 'CURRENCY':
      case 'PREMIUM':
        base = config.baseCurrency;
        break;
      default:
        base = calculation.baseAmount;
    }
    let final = base;
    if (config.streakMultiplierEnabled) {
      final *= calculation.streakMultiplier;
    }
    if (config.levelMultiplierEnabled) {
      final *= calculation.levelMultiplier;
    }
    final *= calculation.eventMultiplier;
    final *= calculation.seasonMultiplier;
    final += calculation.comebackBonus;
    final += calculation.socialBonus;
    return Math.floor(final);
  }
  private calculateStreakBonus(calculation: RewardCalculation): number {
    if (calculation.streakMultiplier > 1) {
      return Math.floor((calculation.streakMultiplier - 1) * 100);
    }
    return 0;
  }
  private determineRarity(
    weights: Record<string, number>,
    calculation: RewardCalculation,
  ): RewardRarity {
    const adjustedWeights = { ...weights };
    if (calculation.eventMultiplier > 2) {
      adjustedWeights.EPIC = (adjustedWeights.EPIC || 0) + 10;
      adjustedWeights.LEGENDARY = (adjustedWeights.LEGENDARY || 0) + 5;
    }
    if (calculation.comebackBonus > 0) {
      adjustedWeights.RARE = (adjustedWeights.RARE || 0) + 15;
      adjustedWeights.EPIC = (adjustedWeights.EPIC || 0) + 5;
    }
    const total = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
    const random = Math.random() * total;
    let cumulative = 0;
    for (const [rarity, weight] of Object.entries(adjustedWeights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return rarity as RewardRarity;
      }
    }
    return 'COMMON';
  }
  private mapRewardTypeToLedgerType(type: RewardType): 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'BADGE' {
    const map: Record<RewardType, 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'BADGE'> = {
      XP: 'XP',
      CURRENCY: 'COINS',
      PREMIUM: 'GEMS',
      ITEM: 'ITEM',
      BADGE: 'BADGE',
      STREAK_BONUS: 'XP',
      BOOST: 'XP',
    };
    return map[type];
  }
  getPendingRewards(): Reward[] {
    return Array.from(this.pendingRewards.values()).filter(
      (r) => !r.claimedAt && (!r.expiresAt || r.expiresAt > Date.now()),
    );
  }
  getPendingRewardsByType(type: RewardType): Reward[] {
    return this.getPendingRewards().filter((r) => r.type === type);
  }
  getExpiredRewards(): Reward[] {
    return Array.from(this.pendingRewards.values()).filter(
      (r) => r.expiresAt && r.expiresAt < Date.now() && !r.claimedAt,
    );
  }
  getRewardById(id: string): Reward | undefined {
    return this.pendingRewards.get(id);
  }
  private async loadPendingRewards(): Promise<void> {
    if (!this.userId) {return;}
    try {
      const key = `rewards:pending:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      const data = await storage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this.pendingRewards = new Map(Object.entries(parsed));
        const expired = this.getExpiredRewards();
        for (const reward of expired) {
          eventBus.publish('reward:expired', {
            rewardId: reward.id,
            userId: reward.userId,
            expiredAt: Date.now(),
            unclaimedValue: reward.amount,
          } as RewardExpiredEvent);
          this.pendingRewards.delete(reward.id);
        }
        debug.info('Loaded %d pending rewards', this.pendingRewards.size);
      }
    } catch (error) {
      debug.error('Failed to load pending rewards', error as Error);
    }
  }
  private async savePendingRewards(): Promise<void> {
    if (!this.userId) {return;}
    try {
      const key = `rewards:pending:${this.userId}`;
      const data = Object.fromEntries(this.pendingRewards);
      const storage = getMMKVStorageAdapter();
      await storage.setItem(key, JSON.stringify(data));
    } catch (error) {
      debug.error('Failed to save pending rewards', error as Error);
    }
  }
  private generateRewardId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
let rewardServiceInstance: RewardService | null = null;
export function getRewardService(userId?: string): RewardService {
  if (!rewardServiceInstance) {
    rewardServiceInstance = new RewardService(userId);
  } else if (userId) {
    rewardServiceInstance.setUserId(userId);
  }
  return rewardServiceInstance;
}
