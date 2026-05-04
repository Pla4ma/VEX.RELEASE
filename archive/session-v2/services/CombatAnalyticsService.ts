/**
 * Combat Analytics Service
 * 
 * Tracks and analyzes combat performance metrics.
 * Provides insights for user improvement and game balancing.
 */

import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import type { SessionV2State, CombatAction } from '../types';

const debug = createDebugger('session:v2:combat-analytics');

// ============================================================================
// Types
// ============================================================================

export interface CombatMetrics {
  sessionId: string;
  userId: string;
  timestamp: number;
  
  // Performance metrics
  totalDamage: number;
  damagePerMinute: number;
  abilitiesUsed: number;
  averageAbilityCooldown: number;
  
  // Combat skill metrics
  dodgeSuccessRate: number;
  comboAchieved: number;
  maxComboStreak: number;
  perfectDodges: number;
  
  // Session quality metrics
  completionPercentage: number;
  interruptions: number;
  pauses: number;
  backgroundTime: number;
  
  // Boss encounter metrics
  bossTier: string;
  bossDefeated: boolean;
  timeToDefeat?: number;
  damageEfficiency: number;
  
  // Energy management
  energyRegenerationRate: number;
  energyWasted: number;
  energyEfficiency: number;
}

export interface CombatAnalyticsSummary {
  totalSessions: number;
  averageDamagePerMinute: number;
  averageDodgeSuccessRate: number;
  averageComboAchieved: number;
  winRate: number;
  favoriteAbility: string;
  improvementTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  recommendations: string[];
}

export interface AbilityUsageStats {
  abilityId: string;
  name: string;
  uses: number;
  totalDamage: number;
  averageDamage: number;
  successRate: number;
  efficiency: number;
}

export interface BossPerformanceStats {
  bossId: string;
  bossName: string;
  tier: string;
  encounters: number;
  victories: number;
  winRate: number;
  averageTimeToDefeat: number;
  bestTimeToDefeat: number;
  totalDamageDealt: number;
}

// ============================================================================
// Combat Analytics Service
// ============================================================================

export class CombatAnalyticsService {
  private userId: string | null = null;
  private sessionMetrics: CombatMetrics[] = [];
  private abilityUsageStats: Map<string, AbilityUsageStats> = new Map();
  private bossPerformanceStats: Map<string, BossPerformanceStats> = new Map();

  constructor() {
    debug.info('CombatAnalyticsService initialized');
  }

  // ============================================================================
  // Lifecycle Methods
  // ============================================================================

  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }

    this.userId = userId;
    this.loadUserAnalytics();
    debug.info('CombatAnalyticsService user set: %s', userId);
  }

  // ============================================================================
  // Session Tracking
  // ============================================================================

  trackSession(session: SessionV2State): CombatMetrics {
    if (!this.userId) {
      throw new Error('No user set for analytics service');
    }

    const metrics: CombatMetrics = {
      sessionId: session.id,
      userId: this.userId,
      timestamp: Date.now(),
      
      // Performance metrics
      totalDamage: session.combatState.damageDealt,
      damagePerMinute: this.calculateDamagePerMinute(session),
      abilitiesUsed: session.combatState.abilitiesUsed,
      averageAbilityCooldown: this.calculateAverageCooldown(session),
      
      // Combat skill metrics
      dodgeSuccessRate: this.calculateDodgeSuccessRate(session),
      comboAchieved: session.comboCount,
      maxComboStreak: session.comboCount, // Would track max during session
      perfectDodges: this.calculatePerfectDodges(session),
      
      // Session quality metrics
      completionPercentage: session.completionPercentage,
      interruptions: session.interruptions,
      pauses: session.pauses,
      backgroundTime: session.backgroundTime,
      
      // Boss encounter metrics
      bossTier: session.currentEncounter?.tier || 'NONE',
      bossDefeated: session.currentEncounter?.status === 'VICTORY',
      timeToDefeat: this.calculateTimeToDefeat(session),
      damageEfficiency: this.calculateDamageEfficiency(session),
      
      // Energy management
      energyRegenerationRate: this.calculateEnergyRegenRate(session),
      energyWasted: this.calculateEnergyWasted(session),
      energyEfficiency: this.calculateEnergyEfficiency(session),
    };

    // Store metrics
    this.sessionMetrics.push(metrics);
    
    // Update ability usage stats
    this.updateAbilityUsageStats(session);
    
    // Update boss performance stats
    this.updateBossPerformanceStats(session, metrics);
    
    // Emit analytics event
    eventBus.publish('combat:session_tracked', {
      userId: this.userId,
      sessionId: session.id,
      metrics,
    });

    // Save analytics data
    this.saveUserAnalytics();

    debug.info('Session tracked: %d damage, %.1f DPM', metrics.totalDamage, metrics.damagePerMinute);
    return metrics;
  }

  private calculateDamagePerMinute(session: SessionV2State): number {
    const sessionMinutes = session.elapsedTime / (1000 * 60);
    return sessionMinutes > 0 ? session.combatState.damageDealt / sessionMinutes : 0;
  }

  private calculateAverageCooldown(session: SessionV2State): number {
    const cooldowns = Object.values(session.abilityCooldowns);
    return cooldowns.length > 0 ? cooldowns.reduce((sum, cd) => sum + cd, 0) / cooldowns.length : 0;
  }

  private calculateDodgeSuccessRate(session: SessionV2State): number {
    return session.dodgeAttempts > 0 ? (session.successfulDodges / session.dodgeAttempts) * 100 : 0;
  }

  private calculatePerfectDodges(session: SessionV2State): number {
    return session.dodgeAttempts > 0 && session.successfulDodges === session.dodgeAttempts ? 1 : 0;
  }

  private calculateTimeToDefeat(session: SessionV2State): number | undefined {
    if (!session.currentEncounter || session.currentEncounter.status !== 'VICTORY') {
      return undefined;
    }
    
    return session.elapsedTime;
  }

  private calculateDamageEfficiency(session: SessionV2State): number {
    const totalPossibleDamage = session.combatState.abilitiesUsed * 50; // Assuming 50 avg damage per ability
    return totalPossibleDamage > 0 ? (session.combatState.damageDealt / totalPossibleDamage) * 100 : 0;
  }

  private calculateEnergyRegenRate(session: SessionV2State): number {
    const sessionMinutes = session.elapsedTime / (1000 * 60);
    const energyRegenerated = session.userResources.maxFocusEnergy; // Assuming full regen
    return sessionMinutes > 0 ? energyRegenerated / sessionMinutes : 0;
  }

  private calculateEnergyWasted(session: SessionV2State): number {
    // Energy wasted = max energy - ending energy - energy used
    const energyUsed = session.combatState.energyConsumed;
    const energyRemaining = session.userResources.focusEnergy;
    const maxEnergy = session.userResources.maxFocusEnergy;
    
    return Math.max(0, maxEnergy - energyRemaining - energyUsed);
  }

  private calculateEnergyEfficiency(session: SessionV2State): number {
    const totalEnergyAvailable = session.userResources.maxFocusEnergy + 
      (session.elapsedTime / 1000) * session.userResources.energyRegenRate;
    const energyUsed = session.combatState.energyConsumed;
    
    return totalEnergyAvailable > 0 ? (energyUsed / totalEnergyAvailable) * 100 : 0;
  }

  private updateAbilityUsageStats(session: SessionV2State): void {
    // This would analyze combat history to track individual ability usage
    // For now, we'll update based on session summary
    for (const ability of session.activeAbilities) {
      const existing = this.abilityUsageStats.get(ability.id);
      
      if (existing) {
        existing.uses += 1;
        // Would update with actual session data
      } else {
        this.abilityUsageStats.set(ability.id, {
          abilityId: ability.id,
          name: ability.name,
          uses: 1,
          totalDamage: 0,
          averageDamage: 0,
          successRate: 100,
          efficiency: 100,
        });
      }
    }
  }

  private updateBossPerformanceStats(session: SessionV2State, metrics: CombatMetrics): void {
    if (!session.currentEncounter) return;

    const bossId = session.currentEncounter.bossId;
    const existing = this.bossPerformanceStats.get(bossId);

    const newStats: BossPerformanceStats = {
      bossId,
      bossName: session.currentEncounter.bossName,
      tier: session.currentEncounter.tier,
      encounters: (existing?.encounters || 0) + 1,
      victories: (existing?.victories || 0) + (metrics.bossDefeated ? 1 : 0),
      winRate: 0,
      averageTimeToDefeat: 0,
      bestTimeToDefeat: 0,
      totalDamageDealt: (existing?.totalDamageDealt || 0) + metrics.totalDamage,
    };

    // Calculate derived stats
    newStats.winRate = (newStats.victories / newStats.encounters) * 100;
    
    if (metrics.timeToDefeat) {
      const totalTime = (existing?.averageTimeToDefeat || 0) * (existing?.encounters || 0) + metrics.timeToDefeat;
      newStats.averageTimeToDefeat = totalTime / newStats.encounters;
      
      newStats.bestTimeToDefeat = existing?.bestTimeToDefeat 
        ? Math.min(existing.bestTimeToDefeat, metrics.timeToDefeat)
        : metrics.timeToDefeat;
    }

    this.bossPerformanceStats.set(bossId, newStats);
  }

  // ============================================================================
  // Analytics Summary
  // ============================================================================

  generateAnalyticsSummary(timeframe?: number): CombatAnalyticsSummary {
    const now = Date.now();
    const cutoff = timeframe ? now - timeframe : 0;
    
    const recentMetrics = this.sessionMetrics.filter(m => m.timestamp >= cutoff);
    
    if (recentMetrics.length === 0) {
      return this.getDefaultSummary();
    }

    const totalSessions = recentMetrics.length;
    const averageDamagePerMinute = this.calculateAverage(recentMetrics, m => m.damagePerMinute);
    const averageDodgeSuccessRate = this.calculateAverage(recentMetrics, m => m.dodgeSuccessRate);
    const averageComboAchieved = this.calculateAverage(recentMetrics, m => m.comboAchieved);
    const winRate = this.calculateWinRate(recentMetrics);
    const favoriteAbility = this.getFavoriteAbility();
    const improvementTrend = this.calculateImprovementTrend(recentMetrics);
    const skillLevel = this.determineSkillLevel(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics);

    return {
      totalSessions,
      averageDamagePerMinute,
      averageDodgeSuccessRate,
      averageComboAchieved,
      winRate,
      favoriteAbility,
      improvementTrend,
      skillLevel,
      recommendations,
    };
  }

  private calculateAverage(metrics: CombatMetrics[], accessor: (m: CombatMetrics) => number): number {
    const sum = metrics.reduce((total, m) => total + accessor(m), 0);
    return sum / metrics.length;
  }

  private calculateWinRate(metrics: CombatMetrics[]): number {
    const victories = metrics.filter(m => m.bossDefeated).length;
    return (victories / metrics.length) * 100;
  }

  private getFavoriteAbility(): string {
    let maxUses = 0;
    let favoriteAbility = 'None';
    
    for (const [abilityId, stats] of this.abilityUsageStats) {
      if (stats.uses > maxUses) {
        maxUses = stats.uses;
        favoriteAbility = stats.name;
      }
    }
    
    return favoriteAbility;
  }

  private calculateImprovementTrend(metrics: CombatMetrics[]): 'IMPROVING' | 'DECLINING' | 'STABLE' {
    if (metrics.length < 5) return 'STABLE';
    
    const recent = metrics.slice(-3);
    const older = metrics.slice(-6, -3);
    
    const recentAvg = this.calculateAverage(recent, m => m.damagePerMinute);
    const olderAvg = this.calculateAverage(older, m => m.damagePerMinute);
    
    const difference = (recentAvg - olderAvg) / olderAvg;
    
    if (difference > 0.1) return 'IMPROVING';
    if (difference < -0.1) return 'DECLINING';
    return 'STABLE';
  }

  private determineSkillLevel(metrics: CombatMetrics[]): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' {
    const avgDPM = this.calculateAverage(metrics, m => m.damagePerMinute);
    const avgDodgeRate = this.calculateAverage(metrics, m => m.dodgeSuccessRate);
    const avgCombo = this.calculateAverage(metrics, m => m.comboAchieved);
    const winRate = this.calculateWinRate(metrics);
    
    // Scoring system for skill level
    let score = 0;
    
    // Damage per minute scoring
    if (avgDPM >= 100) score += 3;
    else if (avgDPM >= 60) score += 2;
    else if (avgDPM >= 30) score += 1;
    
    // Dodge rate scoring
    if (avgDodgeRate >= 80) score += 3;
    else if (avgDodgeRate >= 60) score += 2;
    else if (avgDodgeRate >= 40) score += 1;
    
    // Combo scoring
    if (avgCombo >= 5) score += 2;
    else if (avgCombo >= 3) score += 1;
    
    // Win rate scoring
    if (winRate >= 80) score += 2;
    else if (winRate >= 60) score += 1;
    
    // Determine skill level
    if (score >= 8) return 'EXPERT';
    if (score >= 6) return 'ADVANCED';
    if (score >= 4) return 'INTERMEDIATE';
    return 'BEGINNER';
  }

  private generateRecommendations(metrics: CombatMetrics[]): string[] {
    const recommendations: string[] = [];
    
    const avgDodgeRate = this.calculateAverage(metrics, m => m.dodgeSuccessRate);
    const avgEnergyEfficiency = this.calculateAverage(metrics, m => m.energyEfficiency);
    const avgCombo = this.calculateAverage(metrics, m => m.comboAchieved);
    const avgInterruptions = this.calculateAverage(metrics, m => m.interruptions);
    
    if (avgDodgeRate < 50) {
      recommendations.push('Practice timing your dodges - try to dodge when the boss attacks');
    }
    
    if (avgEnergyEfficiency < 70) {
      recommendations.push('Manage your energy better - use abilities more efficiently');
    }
    
    if (avgCombo < 3) {
      recommendations.push('Build combos by using abilities quickly in succession');
    }
    
    if (avgInterruptions > 2) {
      recommendations.push('Minimize interruptions for better session quality');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great performance! Keep up the excellent work');
    }
    
    return recommendations;
  }

  private getDefaultSummary(): CombatAnalyticsSummary {
    return {
      totalSessions: 0,
      averageDamagePerMinute: 0,
      averageDodgeSuccessRate: 0,
      averageComboAchieved: 0,
      winRate: 0,
      favoriteAbility: 'None',
      improvementTrend: 'STABLE',
      skillLevel: 'BEGINNER',
      recommendations: ['Complete more sessions to see analytics'],
    };
  }

  // ============================================================================
  // Data Persistence
  // ============================================================================

  private async loadUserAnalytics(): Promise<void> {
    if (!this.userId) return;

    // This would load from database/storage
    // For now, we'll use empty data
    this.sessionMetrics = [];
    this.abilityUsageStats.clear();
    this.bossPerformanceStats.clear();

    debug.info('User analytics loaded for: %s', this.userId);
  }

  private async saveUserAnalytics(): Promise<void> {
    if (!this.userId) return;

    // Keep only last 1000 sessions to prevent memory bloat
    if (this.sessionMetrics.length > 1000) {
      this.sessionMetrics = this.sessionMetrics.slice(-1000);
    }

    // This would save to database/storage
    const analyticsData = {
      userId: this.userId,
      sessionMetrics: this.sessionMetrics,
      abilityUsageStats: Array.from(this.abilityUsageStats.entries()),
      bossPerformanceStats: Array.from(this.bossPerformanceStats.entries()),
      updatedAt: Date.now(),
    };

    // Emit analytics saved event
    eventBus.publish('combat:analytics_saved', {
      userId: this.userId,
      analyticsData,
    });

    debug.info('User analytics saved for: %s', this.userId);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getSessionMetrics(limit?: number): CombatMetrics[] {
    const metrics = [...this.sessionMetrics].reverse(); // Most recent first
    return limit ? metrics.slice(0, limit) : metrics;
  }

  getAbilityUsageStats(): AbilityUsageStats[] {
    return Array.from(this.abilityUsageStats.values())
      .sort((a, b) => b.uses - a.uses);
  }

  getBossPerformanceStats(): BossPerformanceStats[] {
    return Array.from(this.bossPerformanceStats.values())
      .sort((a, b) => b.encounters - a.encounters);
  }

  getPersonalBests(): {
    highestDamagePerMinute: number;
    longestCombo: number;
    bestDodgeRate: number;
    fastestDefeat: number;
  } {
    const highestDamagePerMinute = Math.max(...this.sessionMetrics.map(m => m.damagePerMinute), 0);
    const longestCombo = Math.max(...this.sessionMetrics.map(m => m.comboAchieved), 0);
    const bestDodgeRate = Math.max(...this.sessionMetrics.map(m => m.dodgeSuccessRate), 0);
    const fastestDefeat = Math.min(...this.sessionMetrics
      .filter(m => m.timeToDefeat)
      .map(m => m.timeToDefeat!), Infinity);

    return {
      highestDamagePerMinute,
      longestCombo,
      bestDodgeRate,
      fastestDefeat: fastestDefeat === Infinity ? 0 : fastestDefeat,
    };
  }
}
