import * as Sentry from '@sentry/react-native';
import type { SessionNarrative } from './SessionNarrator';
import {
  SessionNarrativeDBSchema,
  toDBFormat,
  fromDBFormat,
} from './narrative-db-mapper';
import {
  persistNarrativeToDB,
  loadNarrativeFromDB,
  loadUserNarrativesFromDB,
} from './NarrativeQueries';

export interface RepositoryError {
  code: 'NOT_FOUND' | 'SAVE_FAILED' | 'LOAD_FAILED' | 'VALIDATION_ERROR' | 'NETWORK_ERROR';
  message: string;
  retryable: boolean;
}

interface CacheEntry {
  data: SessionNarrative;
  timestamp: number;
}

export class NarrativeRepository {
  private cache: Map<string, CacheEntry> = new Map();
  private userNarratives: Map<string, string[]> = new Map();
  private CACHE_TTL = 10 * 60 * 1000;

  async saveNarrative(
    narrative: SessionNarrative,
  ): Promise<{ success: boolean; error?: RepositoryError }> {
    try {
      const dbNarrative = toDBFormat(narrative);
      SessionNarrativeDBSchema.parse(dbNarrative);
      await persistNarrativeToDB(dbNarrative);

      this.cache.set(narrative.sessionId, {
        data: narrative,
        timestamp: Date.now(),
      });

      const userSessions = this.userNarratives.get(narrative.userId) || [];
      if (!userSessions.includes(narrative.sessionId)) {
        userSessions.push(narrative.sessionId);
        this.userNarratives.set(narrative.userId, userSessions);
      }

      return { success: true };
    } catch (error) {
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        { tags: { feature: 'session-story', operation: 'saveNarrative' } },
      );
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

  async loadNarrative(
    sessionId: string,
  ): Promise<{ success: boolean; data?: SessionNarrative; error?: RepositoryError }> {
    const cached = this.cache.get(sessionId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, data: cached.data };
    }

    try {
      const dbData = await loadNarrativeFromDB(sessionId);
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
      const narrative = fromDBFormat(validated);
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

  async loadUserNarratives(
    userId: string,
    limit: number = 50,
  ): Promise<{ success: boolean; data?: SessionNarrative[]; error?: RepositoryError }> {
    try {
      const rows = await loadUserNarrativesFromDB(userId, limit);
      const narratives: SessionNarrative[] = [];

      for (const row of rows) {
        const parsed = SessionNarrativeDBSchema.safeParse(row);
        if (parsed.success) {
          const narrative = fromDBFormat(parsed.data);
          narratives.push(narrative);
          this.cache.set(row.sessionId, {
            data: narrative,
            timestamp: Date.now(),
          });
        }
      }

      return { success: true, data: narratives };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load narratives',
          retryable: true,
        },
      };
    }
  }

  async getUserNarrativeStats(
    userId: string,
  ): Promise<{
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

    const quoteCounts: Record<string, number> = {};
    for (const n of narratives) {
      quoteCounts[n.heroQuote] = (quoteCounts[n.heroQuote] || 0) + 1;
    }

    const favoriteQuote =
      Object.entries(quoteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

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

  clearCache(): void {
    this.cache.clear();
    this.userNarratives.clear();
  }
}

let repository: NarrativeRepository | null = null;

export function getNarrativeRepository(): NarrativeRepository {
  if (!repository) {
    repository = new NarrativeRepository();
  }
  return repository;
}
