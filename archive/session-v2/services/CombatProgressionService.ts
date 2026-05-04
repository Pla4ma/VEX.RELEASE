/**
 * Combat Progression Service
 * 
 * Integrates combat XP, levels, and achievements with the progression system.
 * Handles XP calculation, level ups, ability unlocks, and progression tracking.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, CombatAction } from '../types';

const debug = createDebugger('session:v2:combat-progression');

// ============================================================================
// Types
// ============================================================================

export interface CombatXPBreakdown {
  baseXP: number;
  completionXP: number;
  combatXP: number;
  comboXP: number;
  dodgeXP: number;
  timeXP: number;
  firstTimeXP: number;
  streakXP: number;
  totalXP: number;
}

export interface LevelUpReward {
  level: number;
  xpEarned: number;
  abilitiesUnlocked: string[];
  coinsBonus: number;
  gemsBonus: number;
  title?: string;
}

export interface CombatAchievement {
  id: string;
  name: string;
  description: string;
  condition: AchievementCondition;
  reward: AchievementReward;
  isUnlocked: boolean;
  unlockedAt?: number;
}

export interface AchievementCondition {
  type: 'TOTAL_SESSIONS' | 'BOSS_DEFEATS' | 'COMBO_ACHIEVED' | 'PERFECT_DODGE' | 'DAMAGE_DEALT' | 'SESSION_STREAK';
  value: number;
  operator: '=' | '>' | '<' | '>=' | '<=';
}

export interface AchievementReward {
  xp: number;
  coins: number;
  gems?: number;
  ability?: string;
  title?: string;
}

// ============================================================================
// Combat Progression Service
// ============================================================================

export class CombatProgressionService {
  private userId: string | null = null;
  private currentLevel: number = 1;
  private currentXP: number = 0;
  private xpToNextLevel: number = 100;
  private totalCombatXP: number = 0;
  private combatStats: CombatStats = {
    totalSessions: 0,
    bossDefeats: 0,
    maxCombo: 0,
    perfectDodges: 0,
    totalDamageDealt: 0,
    currentStreak: 0,
    maxStreak: 0,
  };

  // Achievement tracking
  private achievements: Map<string, CombatAchievement> = new Map();
  private unlockedAchievements: Set<string> = new Set();

  constructor() {
    this.initializeAchievements();
    debug.info('CombatProgressionService initialized');
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }

    this.userId = userId;
    this.loadUserProgression();
    debug.info('CombatProgressionService user set: %s', userId);
  }

  // ============================================================================
  // XP Calculation
  // ============================================================================

  calculateCombatXP(session: SessionV2State): CombatXPBreakdown {
    const breakdown: CombatXPBreakdown = {
      baseXP: 0,
      completionXP: 0,
      combatXP: 0,
      comboXP: 0,
      dodgeXP: 0,
      timeXP: 0,
      firstTimeXP: 0,
      streakXP: 0,
      totalXP: 0,
    };

    // Base XP for session completion
    breakdown.baseXP = Math.floor(session.completionPercentage * 10);

    // Completion bonus
    if (session.completionPercentage >= 100) {
      breakdown.completionXP = 50;
    } else if (session.completionPercentage >= 90) {
      breakdown.completionXP = 25;
    }

    // Combat XP from abilities and damage
    breakdown.combatXP = Math.floor(
      session.combatState.damageDealt * 0.5 +
      session.combatState.abilitiesUsed * 5
    );

    // Combo XP
    if (session.comboCount > 1) {
      breakdown.comboXP = Math.floor((session.comboCount - 1) * 10 * session.comboMultiplier);
    }

    // Dodge XP
    const dodgeSuccessRate = session.dodgeAttempts > 0 
      ? session.successfulDodges / session.dodgeAttempts 
      : 0;
    breakdown.dodgeXP = Math.floor(dodgeSuccessRate * 30);

    // Time XP (bonus for longer focused sessions)
    const sessionMinutes = session.elapsedTime / (1000 * 60);
    if (sessionMinutes >= 25) {
      breakdown.timeXP = 20;
    } else if (sessionMinutes >= 15) {
      breakdown.timeXP = 10;
    }

    // First time bonus
    if (this.combatStats.totalSessions === 0) {
      breakdown.firstTimeXP = 100;
    }

    // Streak XP
    if (session.comboCount > 5) {
      breakdown.streakXP = 25;
    }

    // Calculate total
    breakdown.totalXP = Object.values(breakdown).reduce((sum, xp) => sum + xp, 0);

    debug.info('Combat XP calculated: %d total', breakdown.totalXP);
    return breakdown;
  }

  async grantCombatXP(xpBreakdown: CombatXPBreakdown): Promise<LevelUpReward | null> {
    if (!this.userId) {
      throw new Error('No user set for progression service');
    }

    const previousLevel = this.currentLevel;
    this.currentXP += xpBreakdown.totalXP;
    this.totalCombatXP += xpBreakdown.totalXP;

    // Check for level ups
    let levelUpReward: LevelUpReward | null = null;
    let levelsGained = 0;

    while (this.currentXP >= this.xpToNextLevel) {
      this.currentXP -= this.xpToNextLevel;
      this.currentLevel++;
      levelsGained++;
      
      // Update XP requirement for next level
      this.xpToNextLevel = this.calculateXPForLevel(this.currentLevel + 1);
    }

    if (levelsGained > 0) {
      levelUpReward = this.generateLevelUpReward(previousLevel, this.currentLevel, levelsGained);
      
      // Emit level up event
      eventBus.publish('combat:level_up', {
        userId: this.userId,
        previousLevel,
        newLevel: this.currentLevel,
        levelsGained,
        reward: levelUpReward,
      });

      debug.info('User leveled up: %d -> %d', previousLevel, this.currentLevel);
    }

    // Update combat stats
    this.updateCombatStats();

    // Check for new achievements
    this.checkAchievements();

    // Save progression
    await this.saveUserProgression();

    return levelUpReward;
  }

  private calculateXPForLevel(level: number): number {
    // Exponential XP curve: 100 * (1.5 ^ (level - 1))
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  private generateLevelUpReward(fromLevel: number, toLevel: number, levelsGained: number): LevelUpReward {
    const abilitiesUnlocked: string[] = [];
    
    // Check for ability unlocks
    for (let level = fromLevel + 1; level <= toLevel; level++) {
      const ability = this.getAbilityUnlockForLevel(level);
      if (ability) {
        abilitiesUnlocked.push(ability);
      }
    }

    // Calculate rewards
    const coinsBonus = levelsGained * 50;
    const gemsBonus = levelsGained >= 3 ? 1 : 0; // 1 gem per 3 levels gained

    return {
      level: toLevel,
      xpEarned: this.totalCombatXP,
      abilitiesUnlocked,
      coinsBonus,
      gemsBonus,
      title: this.getTitleForLevel(toLevel),
    };
  }

  private getAbilityUnlockForLevel(level: number): string | null {
    const abilityUnlocks: Record<number, string> = {
      2: 'DEEP_WORK_PUNCH',
      3: 'SPRINT_SLASH',
      5: 'CREATIVE_BURST',
      7: 'STUDY_SMASH',
      10: 'MASTER_STRIKE',
    };

    return abilityUnlocks[level] || null;
  }

  private getTitleForLevel(level: number): string | undefined {
    const titles: Record<number, string> = {
      5: 'Focus Novice',
      10: 'Combat Adept',
      15: 'Boss Slayer',
      20: 'Focus Master',
      25: 'Legend',
      30: 'Immortal',
    };

    return titles[level];
  }

  // ============================================================================
  // Combat Stats Tracking
  // ============================================================================

  private updateCombatStats(): void {
    // This would be updated based on actual session results
    // For now, we'll increment basic stats
    this.combatStats.totalSessions++;
    
    // Update streak
    this.combatStats.currentStreak++;
    this.combatStats.maxStreak = Math.max(this.combatStats.maxStreak, this.combatStats.currentStreak);
  }

  updateSessionStats(session: SessionV2State): void {
    this.combatStats.bossDefeats += session.currentEncounter?.status === 'VICTORY' ? 1 : 0;
    this.combatStats.maxCombo = Math.max(this.combatStats.maxCombo, session.comboCount);
    this.combatStats.totalDamageDealt += session.combatState.damageDealt;
    
    // Check for perfect dodge (100% success rate with at least 1 attempt)
    if (session.dodgeAttempts > 0 && session.successfulDodges === session.dodgeAttempts) {
      this.combatStats.perfectDodges++;
    }

    debug.info('Combat stats updated: %o', this.combatStats);
  }

  // ============================================================================
  // Achievement System
  // ============================================================================

  private initializeAchievements(): void {
    const achievements: CombatAchievement[] = [
      {
        id: 'FIRST_VICTORY',
        name: 'First Victory',
        description: 'Defeat your first boss',
        condition: { type: 'BOSS_DEFEATS', value: 1, operator: '>=' },
        reward: { xp: 50, coins: 25 },
        isUnlocked: false,
      },
      {
        id: 'COMBO_MASTER',
        name: 'Combo Master',
        description: 'Achieve a 5x combo',
        condition: { type: 'COMBO_ACHIEVED', value: 5, operator: '>=' },
        reward: { xp: 100, coins: 50 },
        isUnlocked: false,
      },
      {
        id: 'PERFECT_DODGE',
        name: 'Perfect Dodge',
        description: 'Complete a session with 100% dodge success rate',
        condition: { type: 'PERFECT_DODGE', value: 1, operator: '>=' },
        reward: { xp: 75, coins: 40 },
        isUnlocked: false,
      },
      {
        id: 'DAMAGE_DEALER',
        name: 'Damage Dealer',
        description: 'Deal 1000 total damage across all sessions',
        condition: { type: 'DAMAGE_DEALT', value: 1000, operator: '>=' },
        reward: { xp: 150, coins: 75, gems: 1 },
        isUnlocked: false,
      },
      {
        id: 'STREAK_WARRIOR',
        name: 'Streak Warrior',
        description: 'Maintain a 7-day session streak',
        condition: { type: 'SESSION_STREAK', value: 7, operator: '>=' },
        reward: { xp: 200, coins: 100, gems: 2 },
        isUnlocked: false,
      },
      {
        id: 'VETERAN',
        name: 'Combat Veteran',
        description: 'Complete 50 combat sessions',
        condition: { type: 'TOTAL_SESSIONS', value: 50, operator: '>=' },
        reward: { xp: 500, coins: 250, gems: 5, title: 'Veteran' },
        isUnlocked: false,
      },
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });

    debug.info('Initialized %d achievements', achievements.length);
  }

  private checkAchievements(): void {
    for (const [id, achievement] of this.achievements) {
      if (achievement.isUnlocked) {
        continue;
      }

      if (this.checkAchievementCondition(achievement.condition)) {
        this.unlockAchievement(id);
      }
    }
  }

  private checkAchievementCondition(condition: AchievementCondition): boolean {
    const value = this.getStatValue(condition.type);
    
    switch (condition.operator) {
      case '=':
        return value === condition.value;
      case '>':
        return value > condition.value;
      case '<':
        return value < condition.value;
      case '>=':
        return value >= condition.value;
      case '<=':
        return value <= condition.value;
      default:
        return false;
    }
  }

  private getStatValue(type: AchievementCondition['type']): number {
    switch (type) {
      case 'TOTAL_SESSIONS':
        return this.combatStats.totalSessions;
      case 'BOSS_DEFEATS':
        return this.combatStats.bossDefeats;
      case 'COMBO_ACHIEVED':
        return this.combatStats.maxCombo;
      case 'PERFECT_DODGE':
        return this.combatStats.perfectDodges;
      case 'DAMAGE_DEALT':
        return this.combatStats.totalDamageDealt;
      case 'SESSION_STREAK':
        return this.combatStats.currentStreak;
      default:
        return 0;
    }
  }

  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.isUnlocked) {
      return;
    }

    achievement.isUnlocked = true;
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.add(achievementId);

    // Emit achievement unlocked event
    eventBus.publish('combat:achievement_unlocked', {
      userId: this.userId!,
      achievementId,
      achievement,
    });

    debug.info('Achievement unlocked: %s', achievementId);
  }

  // ============================================================================
  // Data Persistence
  // ============================================================================

  private async loadUserProgression(): Promise<void> {
    if (!this.userId) return;

    // This would load from database/storage
    // For now, we'll use defaults
    this.currentLevel = 1;
    this.currentXP = 0;
    this.xpToNextLevel = this.calculateXPForLevel(2);
    this.totalCombatXP = 0;
    
    // Load unlocked achievements
    this.unlockedAchievements.clear();
    for (const [id, achievement] of this.achievements) {
      achievement.isUnlocked = this.unlockedAchievements.has(id);
    }

    debug.info('User progression loaded for: %s', this.userId);
  }

  private async saveUserProgression(): Promise<void> {
    if (!this.userId) return;

    // This would save to database/storage
    const progressionData = {
      userId: this.userId,
      currentLevel: this.currentLevel,
      currentXP: this.currentXP,
      totalCombatXP: this.totalCombatXP,
      combatStats: this.combatStats,
      unlockedAchievements: Array.from(this.unlockedAchievements),
    };

    // Emit progression saved event
    eventBus.publish('combat:progression_saved', {
      userId: this.userId,
      progressionData,
    });

    debug.info('User progression saved for: %s', this.userId);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getCurrentXP(): number {
    return this.currentXP;
  }

  getXPToNextLevel(): number {
    return this.xpToNextLevel;
  }

  getCombatStats(): CombatStats {
    return { ...this.combatStats };
  }

  getUnlockedAchievements(): CombatAchievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.isUnlocked);
  }

  getAvailableAchievements(): CombatAchievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => !achievement.isUnlocked);
  }

  getProgressPercentage(): number {
    return (this.currentXP / this.xpToNextLevel) * 100;
  }

  isAbilityUnlocked(abilityId: string): boolean {
    const requiredLevel = this.getRequiredLevelForAbility(abilityId);
    return this.currentLevel >= requiredLevel;
  }

  private getRequiredLevelForAbility(abilityId: string): number {
    const requirements: Record<string, number> = {
      'FOCUS_STRIKE': 1,
      'DEEP_WORK_PUNCH': 2,
      'SPRINT_SLASH': 3,
      'CREATIVE_BURST': 5,
      'STUDY_SMASH': 7,
      'MASTER_STRIKE': 10,
    };

    return requirements[abilityId] || 1;
  }
}

// ============================================================================
// Types
// ============================================================================

interface CombatStats {
  totalSessions: number;
  bossDefeats: number;
  maxCombo: number;
  perfectDodges: number;
  totalDamageDealt: number;
  currentStreak: number;
  maxStreak: number;
}
