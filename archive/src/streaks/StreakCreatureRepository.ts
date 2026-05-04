/**
 * Streak Creature Repository
 *
 * Persistence layer for Streak Creature System
 * Handles database operations, caching, and error recovery
 */

import { z } from 'zod';
import { StreakCreatureState } from './StreakCreatureSystem';

// Database schema validation
const CreatureStateDBSchema = z.object({
  userId: z.string(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  currentStage: z.enum(['FLAME', 'SAPLING', 'TREE', 'DRAGON']),
  daysInCurrentStage: z.number(),
  healthPercent: z.number().min(0).max(100),
  happinessPercent: z.number().min(0).max(100),
  energyPercent: z.number().min(0).max(100),
  hoursSinceLastSession: z.number(),
  isAtRisk: z.boolean(),
  riskLevel: z.enum(['NONE', 'WARNING', 'DANGER', 'CRITICAL']),
  isDead: z.boolean(),
  diedAt: z.number().nullable(),
  revivalCost: z.number(),
  canRevive: z.boolean(),
  isSick: z.boolean(),
  isCrying: z.boolean(),
  isCelebrating: z.boolean(),
  lastFedAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

type CreatureStateDB = z.infer<typeof CreatureStateDBSchema>;

export interface RepositoryError {
  code: 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

export class StreakCreatureRepository {
  private cache: Map<string, { data: StreakCreatureState; timestamp: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  /**
   * Save creature state to persistence
   */
  async saveCreatureState(state: StreakCreatureState): Promise<{
    success: boolean;
    error?: RepositoryError;
  }> {
    try {
      // Validate before saving
      const dbState = this.toDBFormat(state);
      CreatureStateDBSchema.parse(dbState);

      // Simulate API call (replace with actual Supabase/DB call)
      await this.persistToDatabase(dbState);

      // Update cache
      this.cache.set(state.userId, {
        data: state,
        timestamp: Date.now(),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save creature state',
          retryable: true,
        },
      };
    }
  }

  /**
   * Load creature state with retry logic
   */
  async loadCreatureState(userId: string): Promise<{
    success: boolean;
    data?: StreakCreatureState;
    error?: RepositoryError;
    fromCache?: boolean;
  }> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, data: cached.data, fromCache: true };
    }

    // Attempt to load with retry
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const dbState = await this.loadFromDatabase(userId);

        if (!dbState) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Creature state not found',
              retryable: false,
            },
          };
        }

        // Validate loaded data
        const validated = CreatureStateDBSchema.parse(dbState);
        const state = this.fromDBFormat(validated);

        // Update cache
        this.cache.set(userId, {
          data: state,
          timestamp: Date.now(),
        });

        return { success: true, data: state, fromCache: false };
      } catch (error) {
        if (attempt === this.retryAttempts) {
          // Return stale cache if available
          if (cached) {
            console.warn(`[CreatureRepository] Returning stale cache for ${userId}`);
            return { success: true, data: cached.data, fromCache: true };
          }

          return {
            success: false,
            error: {
              code: 'LOAD_FAILED',
              message: error instanceof Error ? error.message : 'Failed to load creature state',
              retryable: true,
            },
          };
        }

        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: {
        code: 'LOAD_FAILED',
        message: 'Max retry attempts exceeded',
        retryable: true,
      },
    };
  }

  /**
   * Batch save for offline sync
   */
  async batchSave(states: StreakCreatureState[]): Promise<{
    success: string[];
    failed: { userId: string; error: RepositoryError }[];
  }> {
    const success: string[] = [];
    const failed: { userId: string; error: RepositoryError }[] = [];

    await Promise.all(
      states.map(async (state) => {
        const result = await this.saveCreatureState(state);
        if (result.success) {
          success.push(state.userId);
        } else if (result.error) {
          failed.push({ userId: state.userId, error: result.error });
        }
      })
    );

    return { success, failed };
  }

  /**
   * Clear cache for user
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.loadFromDatabase('health-check');
      return { healthy: true, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: Date.now() - start };
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async persistToDatabase(state: CreatureStateDB): Promise<void> {
    // TODO: Replace with actual Supabase/DB implementation
    // Example:
    // await supabase.from('creature_states').upsert(state);

    // Simulate network delay
    await this.delay(50);

    // Store in localStorage as fallback for MVP
    try {
      localStorage.setItem(`creature_${state.userId}`, JSON.stringify(state));
    } catch {
      // localStorage unavailable
    }
  }

  private async loadFromDatabase(userId: string): Promise<CreatureStateDB | null> {
    // TODO: Replace with actual Supabase/DB implementation
    // Example:
    // const { data } = await supabase.from('creature_states').select('*').eq('userId', userId).single();

    // Simulate network delay
    await this.delay(50);

    // Try localStorage fallback
    try {
      const stored = localStorage.getItem(`creature_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // localStorage unavailable
    }

    return null;
  }

  private toDBFormat(state: StreakCreatureState): CreatureStateDB {
    return {
      userId: state.userId,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      currentStage: state.currentStage,
      daysInCurrentStage: state.daysInCurrentStage,
      healthPercent: state.healthPercent,
      happinessPercent: state.happinessPercent,
      energyPercent: state.energyPercent,
      hoursSinceLastSession: state.hoursSinceLastSession,
      isAtRisk: state.isAtRisk,
      riskLevel: state.riskLevel,
      isDead: state.isDead,
      diedAt: state.diedAt,
      revivalCost: state.revivalCost,
      canRevive: state.canRevive,
      isSick: state.isSick,
      isCrying: state.isCrying,
      isCelebrating: state.isCelebrating,
      lastFedAt: state.lastFedAt,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }

  private fromDBFormat(db: CreatureStateDB): StreakCreatureState {
    return { ...db };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Singleton Factory
// ============================================================================

let repository: StreakCreatureRepository | null = null;

export function getStreakCreatureRepository(): StreakCreatureRepository {
  if (!repository) {
    repository = new StreakCreatureRepository();
  }
  return repository;
}
