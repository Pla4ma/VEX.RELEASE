/**
 * Boss Critical Hit System
 *
 * Variable damage mechanic that adds excitement to boss encounters.
 * - 10% chance per session for critical hit (2x damage)
 * - Near-crit (11-20%): creates "almost got it" tension
 * - Crit tracking: "X crits this week" displayed in boss detail
 * - Overlay during session when crit is active
 *
 * This is a VARIABLE MOMENT - keeps users engaged during sessions.
 */

import { z } from 'zod';
import * as Sentry from '@sentry/react-native';
import { MMKV } from 'react-native-mmkv';

// ============================================================================
// Storage Setup
// ============================================================================

const storage = new MMKV({
  id: 'boss-crit-storage',
});

// ============================================================================
// Types
// ============================================================================

export enum CritStatus {
  /** No crit this session */
  NONE = 'NONE',
  /** Crit is active - will trigger at completion */
  ACTIVE = 'ACTIVE',
  /** Near-miss (11-20%) - almost got crit */
  NEAR_MISS = 'NEAR_MISS',
}

export interface CriticalHitResult {
  /** Whether crit triggered */
  triggered: boolean;
  /** Damage multiplier (2x if crit) */
  damageMultiplier: number;
  /** Status for UI overlay */
  status: CritStatus;
  /** Roll value (0-1) for analytics */
  roll: number;
  /** For near-miss: how close they were */
  nearMissPercent?: number;
  /** Whether this was a near-miss (rolled 11-20%) */
  wasNearMiss: boolean;
}

export interface CritSessionState {
  sessionId: string;
  bossEncounterId: string;
  critStatus: CritStatus;
  roll: number;
  hasShownOverlay: boolean;
}

export interface WeeklyCritStats {
  totalCrits: number;
  nearMisses: number;
  totalSessions: number;
  critRate: number; // percentage
  weekStarting: string; // ISO date
}

// ============================================================================
// Configuration
// ============================================================================

const CRIT_CONFIG = {
  /** Base chance for critical hit (10%) */
  BASE_CHANCE: 0.10,
  /** Range for near-miss (11-20%) */
  NEAR_MISS_MIN: 0.11,
  NEAR_MISS_MAX: 0.20,
  /** Damage multiplier when crit triggers */
  DAMAGE_MULTIPLIER: 2,
  /** Normal damage multiplier */
  NORMAL_MULTIPLIER: 1,
  /** Streak > 7 days adds crit chance */
  STREAK_BONUS: 0.02, // +2%
  /** S grade sessions have higher crit chance */
  S_GRADE_BONUS: 0.03, // +3%
} as const;

// ============================================================================
// Validation Schemas
// ============================================================================

export const CalculateCritChanceInputSchema = z.object({
  userId: z.string().uuid(),
  streakDays: z.number().int().min(0).default(0),
  currentGrade: z.enum(['S', 'A', 'B', 'C', 'D', 'N/A']).default('N/A'),
  seed: z.string().optional(),
});

export type CalculateCritChanceInput = z.infer<typeof CalculateCritChanceInputSchema>;

// ============================================================================
// Core Service
// ============================================================================

class BossCriticalHitService {
  private activeSessions: Map<string, CritSessionState> = new Map();

  /**
   * Calculate if critical hit triggers for a session
   * Called at session START to determine if crit is active
   */
  calculateCritChance(input: CalculateCritChanceInput): CriticalHitResult {
    const validated = CalculateCritChanceInputSchema.parse(input);

    try {
      // Calculate modified chance
      let critChance = CRIT_CONFIG.BASE_CHANCE;

      if (validated.streakDays >= 7) {
        critChance += CRIT_CONFIG.STREAK_BONUS;
      }

      if (validated.currentGrade === 'S') {
        critChance += CRIT_CONFIG.S_GRADE_BONUS;
      }

      // Roll for crit
      const roll = this.generateRoll(validated.seed);

      let result: CriticalHitResult;

      if (roll < critChance) {
        // Crit triggered!
        result = {
          triggered: true,
          damageMultiplier: CRIT_CONFIG.DAMAGE_MULTIPLIER,
          status: CritStatus.ACTIVE,
          roll,
          wasNearMiss: false,
        };
      } else if (roll >= CRIT_CONFIG.NEAR_MISS_MIN && roll <= CRIT_CONFIG.NEAR_MISS_MAX) {
        // Near-miss!
        const nearMissPercent = Math.round(((roll - CRIT_CONFIG.NEAR_MISS_MIN) / (CRIT_CONFIG.NEAR_MISS_MAX - CRIT_CONFIG.NEAR_MISS_MIN)) * 100);
        result = {
          triggered: false,
          damageMultiplier: CRIT_CONFIG.NORMAL_MULTIPLIER,
          status: CritStatus.NEAR_MISS,
          roll,
          nearMissPercent: 95 + nearMissPercent, // Map to 95-99%
          wasNearMiss: true,
        };
      } else {
        // No crit
        result = {
          triggered: false,
          damageMultiplier: CRIT_CONFIG.NORMAL_MULTIPLIER,
          status: CritStatus.NONE,
          roll,
          wasNearMiss: false,
        };
      }

      // Track analytics
      Sentry.addBreadcrumb({
        category: 'boss-crit',
        message: `Crit calculated: ${result.status}`,
        level: result.triggered ? 'info' : 'debug',
        data: {
          userId: validated.userId,
          status: result.status,
          roll,
          chance: critChance,
        },
      });

      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'boss-crit', operation: 'calculate' },
      });

      // Return no crit on error (graceful)
      return {
        triggered: false,
        damageMultiplier: 1,
        status: CritStatus.NONE,
        roll: 0,
        wasNearMiss: false,
      };
    }
  }

  /**
   * Store active session crit state
   * Call this when session starts with boss active
   */
  registerSession(
    sessionId: string,
    bossEncounterId: string,
    critResult: CriticalHitResult
  ): void {
    const state: CritSessionState = {
      sessionId,
      bossEncounterId,
      critStatus: critResult.status,
      roll: critResult.roll,
      hasShownOverlay: false,
    };

    this.activeSessions.set(sessionId, state);

    // Persist for recovery
    storage.set(`crit_session_${sessionId}`, JSON.stringify(state));
  }

  /**
   * Get session crit state
   */
  getSessionState(sessionId: string): CritSessionState | null {
    // Check memory first
    const memoryState = this.activeSessions.get(sessionId);
    if (memoryState) {return memoryState;}

    // Check storage
    const stored = storage.getString(`crit_session_${sessionId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return null;
  }

  /**
   * Mark overlay as shown
   */
  markOverlayShown(sessionId: string): void {
    const state = this.activeSessions.get(sessionId);
    if (state) {
      state.hasShownOverlay = true;
      this.activeSessions.set(sessionId, state);
      storage.set(`crit_session_${sessionId}`, JSON.stringify(state));
    }
  }

  /**
   * Should show crit overlay?
   */
  shouldShowOverlay(sessionId: string): boolean {
    const state = this.getSessionState(sessionId);
    return state?.critStatus === CritStatus.ACTIVE && !state.hasShownOverlay;
  }

  /**
   * Apply crit damage multiplier
   * Call at session completion
   */
  applyCritDamage(sessionId: string, baseDamage: number): {
    finalDamage: number;
    wasCrit: boolean;
    wasNearMiss: boolean;
    nearMissPercent?: number;
  } {
    const state = this.getSessionState(sessionId);

    if (!state) {
      return {
        finalDamage: baseDamage,
        wasCrit: false,
        wasNearMiss: false,
      };
    }

    // Clean up
    this.activeSessions.delete(sessionId);
    storage.delete(`crit_session_${sessionId}`);

    // Record stats
    this.recordCritAttempt(state.bossEncounterId, state.critStatus);

    if (state.critStatus === CritStatus.ACTIVE) {
      // Crit hit!
      return {
        finalDamage: Math.floor(baseDamage * CRIT_CONFIG.DAMAGE_MULTIPLIER),
        wasCrit: true,
        wasNearMiss: false,
      };
    }

    if (state.critStatus === CritStatus.NEAR_MISS) {
      // Calculate how close
      const nearMissPercent = 95 + Math.round((state.roll - CRIT_CONFIG.NEAR_MISS_MIN) / (CRIT_CONFIG.NEAR_MISS_MAX - CRIT_CONFIG.NEAR_MISS_MIN) * 4);

      return {
        finalDamage: baseDamage,
        wasCrit: false,
        wasNearMiss: true,
        nearMissPercent,
      };
    }

    return {
      finalDamage: baseDamage,
      wasCrit: false,
      wasNearMiss: false,
    };
  }

  /**
   * Record a crit attempt for weekly stats
   */
  private recordCritAttempt(bossEncounterId: string, status: CritStatus): void {
    const weekKey = this.getWeekKey();
    const storageKey = `crit_stats_${weekKey}`;

    const stored = storage.getString(storageKey);
    const stats: WeeklyCritStats = stored
      ? JSON.parse(stored)
      : {
          totalCrits: 0,
          nearMisses: 0,
          totalSessions: 0,
          critRate: 0,
          weekStarting: weekKey,
        };

    stats.totalSessions++;
    if (status === CritStatus.ACTIVE) {
      stats.totalCrits++;
    } else if (status === CritStatus.NEAR_MISS) {
      stats.nearMisses++;
    }
    stats.critRate = (stats.totalCrits / stats.totalSessions) * 100;

    storage.set(storageKey, JSON.stringify(stats));

    // Clean up old weeks
    this.cleanupOldStats(weekKey);
  }

  /**
   * Get weekly crit stats
   */
  getWeeklyStats(userId: string): WeeklyCritStats {
    const weekKey = this.getWeekKey();
    const storageKey = `crit_stats_${weekKey}`;

    const stored = storage.getString(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      totalCrits: 0,
      nearMisses: 0,
      totalSessions: 0,
      critRate: 0,
      weekStarting: weekKey,
    };
  }

  /**
   * Get crits this week display text
   */
  getCritsThisWeekText(userId: string): string {
    const stats = this.getWeeklyStats(userId);
    if (stats.totalCrits === 0) {
      return 'No crits yet this week';
    }
    return `${stats.totalCrits} crit${stats.totalCrits > 1 ? 's' : ''} this week`;
  }

  /**
   * Generate random roll
   */
  private generateRoll(seed?: string): number {
    if (seed) {
      return this.seededRandom(seed);
    }
    return Math.random();
  }

  /**
   * Simple seeded random
   */
  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Get current week key (YYYY-W##)
   */
  private getWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
  }

  /**
   * Clean up stats older than 4 weeks
   */
  private cleanupOldStats(currentWeekKey: string): void {
    // Implementation would iterate storage and remove old keys
    // Simplified for this implementation
  }

  /**
   * Reset all stats (for testing)
   */
  resetStats(userId: string): void {
    const keys = storage.getAllKeys();
    for (const key of keys) {
      if (key.startsWith('crit_')) {
        storage.delete(key);
      }
    }
    this.activeSessions.clear();
  }

  /**
   * Simulate crit distribution
   */
  simulateCritDistribution(
    rollCount: number,
    streakDays: number = 0,
    currentGrade: string = 'N/A'
  ): { crits: number; nearMisses: number; normal: number } {
    let crits = 0;
    let nearMisses = 0;
    let normal = 0;

    // Calculate modified chance
    let critChance = CRIT_CONFIG.BASE_CHANCE;
    if (streakDays >= 7) {critChance += CRIT_CONFIG.STREAK_BONUS;}
    if (currentGrade === 'S') {critChance += CRIT_CONFIG.S_GRADE_BONUS;}

    for (let i = 0; i < rollCount; i++) {
      const roll = Math.random();

      if (roll < critChance) {
        crits++;
      } else if (roll >= CRIT_CONFIG.NEAR_MISS_MIN && roll <= CRIT_CONFIG.NEAR_MISS_MAX) {
        nearMisses++;
      } else {
        normal++;
      }
    }

    return { crits, nearMisses, normal };
  }
}

// Export class and singleton
export { BossCriticalHitService };
export const bossCritService = new BossCriticalHitService();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick check if crit is active for session
 */
export function isCritActive(sessionId: string): boolean {
  const state = bossCritService.getSessionState(sessionId);
  return state?.critStatus === CritStatus.ACTIVE;
}

/**
 * Get crit status text for UI
 */
export function getCritStatusText(sessionId: string): {
  showOverlay: boolean;
  statusText: string;
  icon: string;
} {
  const state = bossCritService.getSessionState(sessionId);

  if (!state || state.critStatus === CritStatus.NONE) {
    return {
      showOverlay: false,
      statusText: '',
      icon: '',
    };
  }

  if (state.critStatus === CritStatus.ACTIVE) {
    return {
      showOverlay: !state.hasShownOverlay,
      statusText: '⚡ CRITICAL HIT CHANCE ACTIVE!',
      icon: '⚡',
    };
  }

  if (state.critStatus === CritStatus.NEAR_MISS) {
    return {
      showOverlay: false,
      statusText: 'Almost a critical hit!',
      icon: '💫',
    };
  }

  return {
    showOverlay: false,
    statusText: '',
    icon: '',
  };
}

// ============================================================================
// Export
// ============================================================================

export { CRIT_CONFIG };
export default bossCritService;
