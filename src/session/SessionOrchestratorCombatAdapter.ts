/**
 * Session Orchestrator Combat Adapter
 *
 * Phase 1: Core Loop Revolution
 * Integrates real-time boss combat into the session flow.
 *
 * This adapter bridges the SessionOrchestrator with the RealTimeBossService,
 * enabling damage calculation every 3-5 seconds based on live purity scores.
 *
 * Dependencies:
 * - session/SessionOrchestrator (parent)
 * - features/boss-realtime/service (combat logic)
 * - feature-flags (gradual rollout)
 */

import { RealTimeBossService, createBossEncounter } from '../features/boss-realtime/service';
import type { RealTimeBossEncounter, CombatEvent } from '../features/boss-realtime/types';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';
import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('combat-adapter');

interface CombatAdapterConfig {
  userId: string;
  sessionId: string;
  bossId: string;
  bossName: string;
  bossAvatar: string;
  sessionDurationMinutes: number;
  userLevel: number;
  tickIntervalMs: number;
}

interface CombatTickResult {
  damageDealt: number;
  bossDefeated: boolean;
  combatStateChanged: boolean;
  newCombatState?: string;
  event?: CombatEvent;
}

/**
 * Combat Adapter for Session Orchestrator
 * Manages real-time boss combat during focus sessions
 */
export class SessionCombatAdapter {
  private bossService: RealTimeBossService | null = null;
  private encounter: RealTimeBossEncounter | null = null;
  private config: CombatAdapterConfig;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private currentPurity = 100;
  private elapsedSeconds = 0;
  private isPaused = false;
  private eventUnsubscribe: (() => void) | null = null;
  private lastTickTime = 0;

  constructor(config: CombatAdapterConfig) {
    this.config = config;
  }

  /**
   * Check if real-time combat is enabled for this session
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('real_time_boss_combat');
  }

  /**
   * Initialize boss combat for the session
   */
  initialize(): RealTimeBossEncounter | null {
    if (!SessionCombatAdapter.isEnabled()) {
      debug.info('Real-time combat disabled via feature flag');
      return null;
    }

    // Create the encounter
    this.encounter = createBossEncounter(
      this.config.bossId,
      this.config.bossName,
      this.config.bossAvatar,
      this.config.userId,
      this.config.sessionId,
      this.config.sessionDurationMinutes,
      this.config.userLevel
    );

    // Initialize the boss service
    this.bossService = new RealTimeBossService(this.encounter);

    // Subscribe to combat events
    this.eventUnsubscribe = this.bossService.onEvent((event) => {
      this.handleCombatEvent(event);
    });

    // Emit initialization event
    eventBus.publish('session:combat_initialized', {
      encounterId: this.encounter.id,
      bossId: this.config.bossId,
      bossName: this.config.bossName,
      maxHealth: this.encounter.maxHealth,
    });

    debug.info(
      'Initialized boss combat: %s %d %s',
      this.config.bossName,
      this.encounter.maxHealth,
      this.config.sessionId
    );

    return this.encounter;
  }

  /**
   * Start the combat tick loop
   */
  start(): void {
    if (!this.bossService || !SessionCombatAdapter.isEnabled()) {
      return;
    }

    this.lastTickTime = Date.now();

    // Tick every 3 seconds for combat calculations
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.config.tickIntervalMs || 3000);

    debug.info('Combat tick loop started');
  }

  /**
   * Stop the combat tick loop
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    // Unsubscribe from events
    if (this.eventUnsubscribe) {
      this.eventUnsubscribe();
      this.eventUnsubscribe = null;
    }

    debug.info('Combat tick loop stopped');
  }

  /**
   * Process a single combat tick
   */
  tick(): CombatTickResult {
    if (!this.bossService || !this.encounter || this.isPaused) {
      return {
        damageDealt: 0,
        bossDefeated: false,
        combatStateChanged: false,
      };
    }

    const now = Date.now();
    const deltaTime = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    // Update elapsed time
    this.elapsedSeconds += deltaTime;

    // Process combat tick
    const result = this.bossService.tick(
      this.elapsedSeconds,
      this.encounter.sessionDuration,
      this.currentPurity,
      this.isPaused
    );

    // Get updated encounter state
    this.encounter = this.bossService.getEncounter();

    // Log significant events
    if (result.bossDefeated) {
      debug.info('Boss defeated');
      this.handleBossDefeat();
    }

    return {
      damageDealt: result.damageDealt,
      bossDefeated: result.bossDefeated,
      combatStateChanged: result.stateChanged,
      newCombatState: result.newState,
    };
  }

  /**
   * Update current purity score from the session
   */
  updatePurity(purity: number): void {
    this.currentPurity = Math.max(0, Math.min(100, purity));
  }

  /**
   * Pause combat (when user pauses session)
   */
  pause(): void {
    this.isPaused = true;
    debug.info('Combat paused');
  }

  /**
   * Resume combat (when user resumes session)
   */
  resume(): void {
    this.isPaused = false;
    this.lastTickTime = Date.now(); // Reset tick time to avoid jump
    debug.info('Combat resumed');
  }

  /**
   * Get current encounter state
   */
  getEncounter(): RealTimeBossEncounter | null {
    return this.encounter;
  }

  /**
   * Get combat rewards (call at session end)
   */
  getFinalRewards(): {
    xp: number;
    coins: number;
    gems: number;
    bonusReward: boolean;
    totalDamage: number;
    longestCombo: number;
    criticalHits: number;
  } | null {
    if (!this.bossService) {
      return null;
    }

    const rewards = this.bossService.calculateFinalRewards();
    const encounter = this.bossService.getEncounter();

    return {
      ...rewards,
      totalDamage: encounter?.damageDealtThisSession || 0,
      longestCombo: encounter?.longestCombo || 0,
      criticalHits: encounter?.criticalHits || 0,
    };
  }

  /**
   * Check if boss was defeated
   */
  isBossDefeated(): boolean {
    if (!this.encounter) return false;
    return this.encounter.currentHealth <= 0;
  }

  /**
   * Get current health percentage
   */
  getHealthPercent(): number {
    if (!this.encounter) return 100;
    return (this.encounter.currentHealth / this.encounter.maxHealth) * 100;
  }

  /**
   * Handle combat events for analytics and side effects
   */
  private handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'ATTACK_LANDED':
        // Emit to session event bus for UI updates
        eventBus.publish('session:combat_attack', {
          sessionId: this.encounter?.id || '',
          userId: this.config.userId,
          damage: event.data.damage || 0,
          target: 'boss',
        });
        break;

      case 'COMBO_BONUS':
        eventBus.publish('session:combat_combo', {
          sessionId: this.encounter?.id || '',
          userId: this.config.userId,
          comboCount: event.data.comboCount || 0,
          damage: 0,
        });
        break;

      case 'PHASE_CHANGE':
        if (this.encounter) {
          eventBus.publish('session:combat_phase_change', {
            sessionId: this.encounter.id,
            previousPhase: 'previous',
            newPhase: event.data.message || 'unknown',
          });
        }
        break;

      case 'NEAR_DEATH':
        if (this.encounter) {
          eventBus.publish('session:combat_near_death', {
            sessionId: this.encounter.id,
            userId: this.config.userId,
            healthPercentage: event.data.healthPercent || 10,
          });
        }
        break;

      case 'VICTORY':
        if (this.encounter) {
          eventBus.publish('session:combat_victory', {
            sessionId: this.encounter.id,
            userId: this.config.userId,
            bossId: this.config.bossId,
            duration: Date.now() - (this as any).startTime,
          });
        }
        break;
    }

    // Track analytics
    const analytics = getAnalyticsService();
    if (analytics) {
      analytics.track('combat_event', {
        eventType: event.type,
        damage: event.data.damage,
        healthPercent: event.data.healthPercent,
        sessionId: this.config.sessionId,
      });
    }
  }

  /**
   * Handle boss defeat
   */
  private handleBossDefeat(): void {
    const rewards = this.getFinalRewards();
    if (!rewards) return;

    // Emit defeat event with rewards
    eventBus.publish('session:boss_defeated', {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      bossId: this.config.bossId,
      rewards,
    });

    // Track analytics
    const analytics = getAnalyticsService();
    if (analytics) {
      analytics.track('boss_defeated', {
        bossId: this.config.bossId,
        sessionDuration: this.elapsedSeconds,
        totalDamage: rewards.totalDamage,
        longestCombo: rewards.longestCombo,
        criticalHits: rewards.criticalHits,
        bonusReward: rewards.bonusReward,
      });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stop();
    this.bossService = null;
    this.encounter = null;
  }
}

/**
 * Factory function for creating combat adapter
 */
export function createCombatAdapter(config: CombatAdapterConfig): SessionCombatAdapter {
  return new SessionCombatAdapter(config);
}

/**
 * Hook for checking if combat should be shown
 */
export function shouldShowRealTimeCombat(): boolean {
  return SessionCombatAdapter.isEnabled();
}
