/**
 * Combat Economy Service
 * 
 * Integrates combat rewards with the economy system.
 * Handles currency distribution, reward calculations, and economy transactions.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, CombatXPBreakdown } from '../types';

const debug = createDebugger('session:v2:combat-economy');

// ============================================================================
// Types
// ============================================================================

export interface CombatReward {
  coins: number;
  gems: number;
  seasonalCurrency: number;
  items: RewardItem[];
}

export interface RewardItem {
  id: string;
  name: string;
  type: 'ABILITY_UPGRADE' | 'BOSS_SKIN' | 'COMBAT_EFFECT' | 'ENERGY_BOOST';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value: number;
}

export interface EconomyTransaction {
  id: string;
  userId: string;
  type: 'COMBAT_REWARD' | 'ABILITY_PURCHASE' | 'UPGRADE_PURCHASE';
  amount: number;
  currency: 'COINS' | 'GEMS' | 'SEASONAL';
  description: string;
  timestamp: number;
  relatedSessionId?: string;
}

export interface RewardMultiplier {
  type: 'STREAK' | 'PERFECT_SESSION' | 'BOSS_TIER' | 'COMBO_MASTER' | 'FIRST_TIME';
  multiplier: number;
  description: string;
}

// ============================================================================
// Combat Economy Service
// ============================================================================

export class CombatEconomyService {
  private userId: string | null = null;
  private userBalance: UserBalance = {
    coins: 0,
    gems: 0,
    seasonalCurrency: 0,
  };

  // Reward multipliers
  private activeMultipliers: Map<string, RewardMultiplier> = new Map();

  // Transaction history
  private transactionHistory: EconomyTransaction[] = [];

  constructor() {
    debug.info('CombatEconomyService initialized');
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }

    this.userId = userId;
    this.loadUserBalance();
    debug.info('CombatEconomyService user set: %s', userId);
  }

  // ============================================================================
  // Reward Calculation
  // ============================================================================

  calculateCombatRewards(
    session: SessionV2State,
    xpBreakdown: CombatXPBreakdown,
    userLevel: number
  ): CombatReward {
    let baseCoins = 0;
    let baseGems = 0;
    let baseSeasonal = 0;

    // Base coin rewards
    baseCoins += Math.floor(xpBreakdown.totalXP * 0.1); // 10% of XP as coins
    baseCoins += session.combatState.abilitiesUsed * 2; // 2 coins per ability
    baseCoins += Math.floor(session.combatState.damageDealt * 0.05); // 5% of damage as coins

    // Base gem rewards (rare)
    baseGems += this.calculateBaseGems(session, userLevel);

    // Seasonal currency
    baseSeasonal += this.calculateSeasonalCurrency(session);

    // Apply multipliers
    const multipliers = this.getActiveMultipliers(session, xpBreakdown);
    let totalMultiplier = 1;

    for (const multiplier of multipliers) {
      totalMultiplier *= multiplier.multiplier;
    }

    // Apply multiplier to coins and seasonal currency (gems are not multiplied)
    const finalCoins = Math.floor(baseCoins * totalMultiplier);
    const finalSeasonal = Math.floor(baseSeasonal * totalMultiplier);

    // Generate reward items
    const items = this.generateRewardItems(session, userLevel);

    const reward: CombatReward = {
      coins: finalCoins,
      gems: baseGems,
      seasonalCurrency: finalSeasonal,
      items,
    };

    debug.info('Combat rewards calculated: %d coins, %d gems, %d seasonal', 
      reward.coins, reward.gems, reward.seasonalCurrency);

    return reward;
  }

  private calculateBaseGems(session: SessionV2State, userLevel: number): number {
    let gems = 0;

    // Gem rewards are rare and based on exceptional performance
    if (session.completionPercentage >= 100) {
      gems += 1;
    }

    // Bonus gems for high-level players
    if (userLevel >= 10 && session.comboCount >= 5) {
      gems += 1;
    }

    // Boss tier bonus
    if (session.currentEncounter?.tier === 'LEGENDARY') {
      gems += 2;
    } else if (session.currentEncounter?.tier === 'EPIC') {
      gems += 1;
    }

    // Perfect session bonus
    if (session.interruptions === 0 && session.pauses === 0) {
      gems += 1;
    }

    return gems;
  }

  private calculateSeasonalCurrency(session: SessionV2State): number {
    let seasonal = 0;

    // Base seasonal currency
    seasonal += Math.floor(session.elapsedTime / (1000 * 60)); // 1 per minute

    // Bonus for boss defeats
    if (session.currentEncounter?.status === 'VICTORY') {
      seasonal += 10;
    }

    // Combo bonus
    if (session.comboCount >= 3) {
      seasonal += session.comboCount * 2;
    }

    return seasonal;
  }

  private getActiveMultipliers(session: SessionV2State, xpBreakdown: CombatXPBreakdown): RewardMultiplier[] {
    const multipliers: RewardMultiplier[] = [];

    // Streak multiplier
    if (xpBreakdown.streakXP > 0) {
      multipliers.push({
        type: 'STREAK',
        multiplier: 1.5,
        description: 'Streak bonus: 50% extra rewards',
      });
    }

    // Perfect session multiplier
    if (session.interruptions === 0 && session.pauses === 0) {
      multipliers.push({
        type: 'PERFECT_SESSION',
        multiplier: 1.2,
        description: 'Perfect session: 20% extra rewards',
      });
    }

    // Boss tier multiplier
    if (session.currentEncounter) {
      const tierMultipliers: Record<string, number> = {
        'COMMON': 1.0,
        'UNCOMMON': 1.1,
        'RARE': 1.2,
        'EPIC': 1.3,
        'LEGENDARY': 1.5,
      };

      const tierMultiplier = tierMultipliers[session.currentEncounter.tier];
      if (tierMultiplier > 1.0) {
        multipliers.push({
          type: 'BOSS_TIER',
          multiplier: tierMultiplier,
          description: `${session.currentEncounter.tier} boss: ${Math.round((tierMultiplier - 1) * 100)}% extra rewards`,
        });
      }
    }

    // Combo master multiplier
    if (session.comboCount >= 10) {
      multipliers.push({
        type: 'COMBO_MASTER',
        multiplier: 1.3,
        description: 'Combo master: 30% extra rewards',
      });
    }

    // First time bonus
    if (xpBreakdown.firstTimeXP > 0) {
      multipliers.push({
        type: 'FIRST_TIME',
        multiplier: 2.0,
        description: 'First time bonus: 100% extra rewards',
      });
    }

    return multipliers;
  }

  private generateRewardItems(session: SessionV2State, userLevel: number): RewardItem[] {
    const items: RewardItem[] = [];

    // Chance for ability upgrade items
    if (session.completionPercentage >= 100 && Math.random() < 0.1) {
      items.push({
        id: 'ability_upgrade_common',
        name: 'Ability Upgrade (Common)',
        type: 'ABILITY_UPGRADE',
        rarity: 'COMMON',
        value: 1,
      });
    }

    // Chance for boss skins (rare)
    if (session.currentEncounter?.status === 'VICTORY' && Math.random() < 0.05) {
      items.push({
        id: `boss_skin_${session.currentEncounter.bossId}`,
        name: `${session.currentEncounter.bossName} Skin`,
        type: 'BOSS_SKIN',
        rarity: 'RARE',
        value: 1,
      });
    }

    // Energy boost items for high performance
    if (session.comboCount >= 5 && Math.random() < 0.15) {
      items.push({
        id: 'energy_boost_small',
        name: 'Energy Boost (Small)',
        type: 'ENERGY_BOOST',
        rarity: 'COMMON',
        value: 25,
      });
    }

    return items;
  }

  // ============================================================================
  // Transaction Processing
  // ============================================================================

  async grantCombatRewards(
    reward: CombatReward,
    sessionId: string
  ): Promise<EconomyTransaction[]> {
    if (!this.userId) {
      throw new Error('No user set for economy service');
    }

    const transactions: EconomyTransaction[] = [];

    // Create coin transaction
    if (reward.coins > 0) {
      const coinTransaction = this.createTransaction(
        'COMBAT_REWARD',
        reward.coins,
        'COINS',
        `Combat rewards from session ${sessionId}`,
        sessionId
      );

      transactions.push(coinTransaction);
      this.userBalance.coins += reward.coins;
    }

    // Create gem transaction
    if (reward.gems > 0) {
      const gemTransaction = this.createTransaction(
        'COMBAT_REWARD',
        reward.gems,
        'GEMS',
        `Combat rewards from session ${sessionId}`,
        sessionId
      );

      transactions.push(gemTransaction);
      this.userBalance.gems += reward.gems;
    }

    // Create seasonal currency transaction
    if (reward.seasonalCurrency > 0) {
      const seasonalTransaction = this.createTransaction(
        'COMBAT_REWARD',
        reward.seasonalCurrency,
        'SEASONAL',
        `Combat rewards from session ${sessionId}`,
        sessionId
      );

      transactions.push(seasonalTransaction);
      this.userBalance.seasonalCurrency += reward.seasonalCurrency;
    }

    // Add items to inventory (would integrate with inventory system)
    for (const item of reward.items) {
      // This would add items to user's inventory
      debug.info('Item granted: %s (%s)', item.name, item.rarity);
    }

    // Save balance and transactions
    await this.saveUserBalance();
    await this.saveTransactionHistory();

    // Emit rewards granted event
    eventBus.publish('combat:rewards_granted', {
      userId: this.userId,
      sessionId,
      reward,
      transactions,
    });

    debug.info('Combat rewards granted: %d transactions', transactions.length);
    return transactions;
  }

  private createTransaction(
    type: EconomyTransaction['type'],
    amount: number,
    currency: EconomyTransaction['currency'],
    description: string,
    relatedSessionId?: string
  ): EconomyTransaction {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId!,
      type,
      amount,
      currency,
      description,
      timestamp: Date.now(),
      relatedSessionId,
    };
  }

  // ============================================================================
  // Shop Integration
  // ============================================================================

  async purchaseAbilityUpgrade(
    abilityId: string,
    cost: number,
    currency: 'COINS' | 'GEMS'
  ): Promise<boolean> {
    if (!this.userId) {
      throw new Error('No user set for economy service');
    }

    // Check balance
    const currentBalance = currency === 'COINS' ? this.userBalance.coins : this.userBalance.gems;
    if (currentBalance < cost) {
      return false;
    }

    // Deduct cost
    if (currency === 'COINS') {
      this.userBalance.coins -= cost;
    } else {
      this.userBalance.gems -= cost;
    }

    // Create transaction
    const transaction = this.createTransaction(
      'ABILITY_PURCHASE',
      -cost,
      currency,
      `Purchased upgrade for ${abilityId}`
    );

    this.transactionHistory.push(transaction);

    // Save balance
    await this.saveUserBalance();

    // Emit purchase event
    eventBus.publish('combat:ability_purchased', {
      userId: this.userId,
      abilityId,
      cost,
      currency,
      transaction,
    });

    debug.info('Ability upgrade purchased: %s for %d %s', abilityId, cost, currency);
    return true;
  }

  // ============================================================================
  // Data Persistence
  // ============================================================================

  private async loadUserBalance(): Promise<void> {
    if (!this.userId) return;

    // This would load from database/storage
    // For now, we'll use defaults
    this.userBalance = {
      coins: 100,
      gems: 5,
      seasonalCurrency: 0,
    };

    debug.info('User balance loaded for: %s', this.userId);
  }

  private async saveUserBalance(): Promise<void> {
    if (!this.userId) return;

    // This would save to database/storage
    const balanceData = {
      userId: this.userId,
      balance: this.userBalance,
      updatedAt: Date.now(),
    };

    // Emit balance saved event
    eventBus.publish('combat:balance_saved', {
      userId: this.userId,
      balanceData,
    });

    debug.info('User balance saved for: %s', this.userId);
  }

  private async saveTransactionHistory(): Promise<void> {
    if (!this.userId) return;

    // This would save to database/storage
    // Keep only last 100 transactions
    if (this.transactionHistory.length > 100) {
      this.transactionHistory = this.transactionHistory.slice(-100);
    }

    debug.info('Transaction history saved for: %s', this.userId);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getUserBalance(): UserBalance {
    return { ...this.userBalance };
  }

  getTransactionHistory(limit?: number): EconomyTransaction[] {
    const history = [...this.transactionHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  canAfford(cost: number, currency: 'COINS' | 'GEMS'): boolean {
    const balance = currency === 'COINS' ? this.userBalance.coins : this.userBalance.gems;
    return balance >= cost;
  }

  getTotalEarned(currency: 'COINS' | 'GEMS' | 'SEASONAL', timeframe?: number): number {
    const now = Date.now();
    const cutoff = timeframe ? now - timeframe : 0;

    return this.transactionHistory
      .filter(txn => 
        txn.currency === currency && 
        txn.amount > 0 && 
        txn.timestamp >= cutoff
      )
      .reduce((total, txn) => total + txn.amount, 0);
  }

  getActiveMultipliers(): RewardMultiplier[] {
    return Array.from(this.activeMultipliers.values());
  }
}

// ============================================================================
// Types
// ============================================================================

interface UserBalance {
  coins: number;
  gems: number;
  seasonalCurrency: number;
}
