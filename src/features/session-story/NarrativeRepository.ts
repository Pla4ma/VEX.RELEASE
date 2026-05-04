/**
 * Narrative Repository
 *
 * Persistence layer for Session Narrator
 * Stores session narratives for history and analytics
 */

import { z } from 'zod';
import { SessionNarrative, NarrativeBeat } from './SessionNarrator';

const NarrativeBeatDBSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  type: z.string(),
  data: z.record(z.unknown()),
  narrativeText: z.string(),
  intensity: z.number(),
});

const SessionNarrativeDBSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  createdAt: z.number(),
  beats: z.array(NarrativeBeatDBSchema),
  openingLine: z.string(),
  closingLine: z.string(),
  theme: z.enum(['triumph', 'struggle', 'comeback', 'mastery', 'learning']),
  totalInterruptions: z.number(),
  longestPureStreak: z.number(),
  comboCount: z.number(),
  criticalHits: z.number(),
  nearDeathMoments: z.number(),
  tensionGraph: z.array(z.number()),
  climaxMoment: z.number(),
  shareableSummary: z.string(),
  heroQuote: z.string(),
});

export interface RepositoryError {
  code: 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

export class NarrativeRepository {
  private cache: Map<string, { data: SessionNarrative; timestamp: number }> = new Map();
  private userNarratives: Map<string, string[]> = new Map(); // userId -> sessionIds
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Save narrative to persistence
   */
  async saveNarrative(narrative: SessionNarrative): Promise<{
    success: boolean;
    error?: RepositoryError;
  }> {
    try {
      const dbNarrative = this.toDBFormat(narrative);
      SessionNarrativeDBSchema.parse(dbNarrative);

      await this.persistToDatabase(dbNarrative);

      // Update cache
      this.cache.set(narrative.sessionId, {
        data: narrative,
        timestamp: Date.now(),
      });

      // Track user's narratives
      const userSessions = this.userNarratives.get(narrative.userId) || [];
      if (!userSessions.includes(narrative.sessionId)) {
        userSessions.push(narrative.sessionId);
        this.userNarratives.set(narrative.userId, userSessions);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SAVE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to save narrative',
          retryable: true,
        },
      };
    }
  }

  /**
   * Load narrative by session ID
   */
  async loadNarrative(sessionId: string): Promise<{
    success: boolean;
    data?: SessionNarrative;
    error?: RepositoryError;
  }> {
    const cached = this.cache.get(sessionId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, data: cached.data };
    }

    try {
      const dbData = await this.loadFromDatabase(sessionId);
      if (!dbData) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Narrative not found',
            retryable: false,
          },
        };
      }

      const validated = SessionNarrativeDBSchema.parse(dbData);
      const narrative = this.fromDBFormat(validated);

      this.cache.set(sessionId, { data: narrative, timestamp: Date.now() });

      return { success: true, data: narrative };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load narrative',
          retryable: true,
        },
      };
    }
  }

  /**
   * Load all narratives for a user
   */
  async loadUserNarratives(userId: string, limit: number = 50): Promise<{
    success: boolean;
    data?: SessionNarrative[];
    error?: RepositoryError;
  }> {
    try {
      const sessionIds = this.userNarratives.get(userId) || [];
      const recentIds = sessionIds.slice(-limit);

      const narratives: SessionNarrative[] = [];
      for (const sessionId of recentIds) {
        const result = await this.loadNarrative(sessionId);
        if (result.success && result.data) {
          narratives.push(result.data);
        }
      }

      return { success: true, data: narratives.sort((a, b) => b.createdAt - a.createdAt) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load user narratives',
          retryable: true,
        },
      };
    }
  }

  /**
   * Get narrative stats for a user
   */
  async getUserNarrativeStats(userId: string): Promise<{
    success: boolean;
    data?: {
      totalSessions: number;
      themes: Record<string, number>;
      averageInterruptions: number;
      longestStreak: number;
      favoriteQuote: string;
    };
    error?: RepositoryError;
  }> {
    const result = await this.loadUserNarratives(userId, 100);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const narratives = result.data;
    const themes: Record<string, number> = {};
    let totalInterruptions = 0;
    let longestStreak = 0;

    for (const n of narratives) {
      themes[n.theme] = (themes[n.theme] || 0) + 1;
      totalInterruptions += n.totalInterruptions;
      longestStreak = Math.max(longestStreak, n.longestPureStreak);
    }

    // Most common hero quote
    const quoteCounts: Record<string, number> = {};
    for (const n of narratives) {
      quoteCounts[n.heroQuote] = (quoteCounts[n.heroQuote] || 0) + 1;
    }
    const favoriteQuote = Object.entries(quoteCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      success: true,
      data: {
        totalSessions: narratives.length,
        themes,
        averageInterruptions: totalInterruptions / narratives.length || 0,
        longestStreak,
        favoriteQuote,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async persistToDatabase(narrative: z.infer<typeof SessionNarrativeDBSchema>): Promise<void> {
    await this.delay(50);
    try {
      localStorage.setItem(`narrative_${narrative.sessionId}`, JSON.stringify(narrative));
    } catch {
      // localStorage unavailable
    }
  }

  private async loadFromDatabase(sessionId: string): Promise<z.infer<typeof SessionNarrativeDBSchema> | null> {
    await this.delay(50);
    try {
      const stored = localStorage.getItem(`narrative_${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private toDBFormat(narrative: SessionNarrative): z.infer<typeof SessionNarrativeDBSchema> {
    return {
      ...narrative,
      beats: narrative.beats.map(b => ({
        ...b,
        type: b.type.toString(),
      })),
    };
  }

  private fromDBFormat(db: z.infer<typeof SessionNarrativeDBSchema>): SessionNarrative {
    return {
      ...db,
      beats: db.beats.map(b => ({
        ...b,
        type: b.type as NarrativeBeat['type'],
      })),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

let repository: NarrativeRepository | null = null;

export function getNarrativeRepository(): NarrativeRepository {
  if (!repository) {
    repository = new NarrativeRepository();
  }
  return repository;
}
