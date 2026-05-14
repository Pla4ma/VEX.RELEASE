import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { SessionState, SessionHistoryEntry, SessionSummary } from '../types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:repository');

type MMKVType = any;

const STORAGE_KEYS = {
  activeSession: (userId: string) => `session:active:${userId}`,
  sessionHistory: (userId: string) => `session:history:${userId}`,
  sessionSummaries: (userId: string) => `session:summaries:${userId}`,
  sessionCache: (userId: string, sessionId: string) => `session:cache:${userId}:${sessionId}`,
  syncQueue: (userId: string) => `session:sync:queue:${userId}`,
  lastSync: (userId: string) => `session:lastSync:${userId}`,
};

export class SessionRepository {
  private userId: string | null = null;
  private mmkv: MMKVType | null = null;
  private useMMKV: boolean = false;

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.initializeStorage();
  }

  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('SessionRepository user set: %s', userId);
  }

  private initializeStorage(): void {
    try {
      // In Expo Go, react-native-mmkv is shimmied via metro.config.js
      // We try to use the native MMKV if available, otherwise we'll fall back to our storage adapter
      const { MMKV } = require('react-native-mmkv');
      this.mmkv = new MMKV({
        id: 'session-storage',
        encryptionKey: 'session-encryption-key',
      });
      this.useMMKV = true;
      debug.info('MMKV storage initialized');
    } catch (error) {
      debug.warn('MMKV initialization failed, falling back to storage adapter', error as Error);
      this.useMMKV = false;
    }
  }

  async getActiveSession(): Promise<SessionState | null> {
    if (!this.userId) {return null;}
    try {
      const key = STORAGE_KEYS.activeSession(this.userId);
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        const session = JSON.parse(data) as SessionState;
        debug.debug('Loaded active session: %s', session.id);
        return session;
      }
    } catch (error) {
      debug.error('Failed to load active session', error as Error);
    }
    return null;
  }

  async saveActiveSession(session: SessionState): Promise<void> {
    if (!this.userId) {throw new Error('SessionRepository: No user set');}
    try {
      const key = STORAGE_KEYS.activeSession(this.userId);
      const data = JSON.stringify(session);

      if (this.useMMKV && this.mmkv) {
        this.mmkv.set(key, data);
      } else {
        await getMMKVStorageAdapter().setItem(key, data);
      }
      debug.debug('Saved active session: %s', session.id);
    } catch (error) {
      debug.error('Failed to save active session', error as Error);
      throw error;
    }
  }

  async clearActiveSession(): Promise<void> {
    if (!this.userId) {return;}
    try {
      const key = STORAGE_KEYS.activeSession(this.userId);
      if (this.useMMKV && this.mmkv) {
        this.mmkv.delete(key);
      } else {
        await getMMKVStorageAdapter().removeItem(key);
      }
      debug.debug('Cleared active session');
    } catch (error) {
      debug.error('Failed to clear active session', error as Error);
    }
  }

  async getSessionHistory(limit: number = 100): Promise<SessionHistoryEntry[]> {
    if (!this.userId) {return [];}
    try {
      const key = STORAGE_KEYS.sessionHistory(this.userId);
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        const history = JSON.parse(data) as SessionHistoryEntry[];
        debug.debug('Loaded session history: %d entries', history.length);
        return history.slice(0, limit);
      }
    } catch (error) {
      debug.error('Failed to load session history', error as Error);
    }
    return [];
  }

  async getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> {
    const history = await this.getSessionHistory(1000);
    return history.find((entry) => entry.sessionId === sessionId) ?? null;
  }

  async addToHistory(entry: SessionHistoryEntry): Promise<void> {
    if (!this.userId) {throw new Error('SessionRepository: No user set');}
    try {
      const key = STORAGE_KEYS.sessionHistory(this.userId);
      let history = await this.getSessionHistory(1000);
      history.unshift(entry);

      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }

      const data = JSON.stringify(history);
      if (this.useMMKV && this.mmkv) {
        this.mmkv.set(key, data);
      } else {
        await getMMKVStorageAdapter().setItem(key, data);
      }
      debug.debug('Added session to history: %s', entry.sessionId);
    } catch (error) {
      debug.error('Failed to add to history', error as Error);
      throw error;
    }
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    if (!this.userId) {return null;}
    try {
      const key = STORAGE_KEYS.sessionSummaries(this.userId);
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        const summaries = JSON.parse(data) as Record<string, SessionSummary>;
        return summaries[sessionId] || null;
      }
    } catch (error) {
      debug.error('Failed to load session summary', error as Error);
    }
    return null;
  }

  async saveSessionSummary(summary: SessionSummary): Promise<void> {
    if (!this.userId) {throw new Error('SessionRepository: No user set');}
    try {
      const key = STORAGE_KEYS.sessionSummaries(this.userId);
      let summaries: Record<string, SessionSummary> = {};
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        summaries = JSON.parse(data);
      }

      summaries[summary.sessionId] = summary;
      const saveData = JSON.stringify(summaries);

      if (this.useMMKV && this.mmkv) {
        this.mmkv.set(key, saveData);
      } else {
        await getMMKVStorageAdapter().setItem(key, saveData);
      }
    } catch (error) {
      debug.error('Failed to save session summary', error as Error);
      throw error;
    }
  }

  async getAllSummaries(): Promise<SessionSummary[]> {
    if (!this.userId) {return [];}
    try {
      const key = STORAGE_KEYS.sessionSummaries(this.userId);
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        const summaries = JSON.parse(data) as Record<string, SessionSummary>;
        return Object.values(summaries);
      }
    } catch (error) {
      debug.error('Failed to load session summaries', error as Error);
    }
    return [];
  }

  async addToSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) {return;}
    try {
      const key = STORAGE_KEYS.syncQueue(this.userId);
      let queue: string[] = [];
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        queue = JSON.parse(data);
      }

      if (!queue.includes(sessionId)) {
        queue.push(sessionId);
      }

      const saveData = JSON.stringify(queue);
      if (this.useMMKV && this.mmkv) {
        this.mmkv.set(key, saveData);
      } else {
        await getMMKVStorageAdapter().setItem(key, saveData);
      }
    } catch (error) {
      debug.error('Failed to add to sync queue', error as Error);
    }
  }

  async removeFromSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) {return;}
    try {
      const key = STORAGE_KEYS.syncQueue(this.userId);
      const queue = await this.getSyncQueue();
      const newQueue = queue.filter(id => id !== sessionId);
      const saveData = JSON.stringify(newQueue);

      if (this.useMMKV && this.mmkv) {
        this.mmkv.set(key, saveData);
      } else {
        await getMMKVStorageAdapter().setItem(key, saveData);
      }
    } catch (error) {
      debug.error('Failed to remove from sync queue', error as Error);
    }
  }

  async getSyncQueue(): Promise<string[]> {
    if (!this.userId) {return [];}
    try {
      const key = STORAGE_KEYS.syncQueue(this.userId);
      let data: string | null = null;

      if (this.useMMKV && this.mmkv) {
        data = this.mmkv.getString(key) ?? null;
      } else {
        data = await getMMKVStorageAdapter().getItem(key);
      }

      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      debug.error('Failed to get sync queue', error as Error);
    }
    return [];
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    totalFocusTime: number;
    averageSessionDuration: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    const history = await this.getSessionHistory(1000);
    const summaries = await this.getAllSummaries();

    const completedSessions = history.filter(h => h.status === 'COMPLETED' || h.status === 'PARTIAL');
    const abandonedSessions = history.filter(h => h.status === 'ABANDONED' || h.status === 'FAILED');
    const totalFocusTime = summaries.reduce((sum, s) => sum + s.effectiveDuration, 0);
    const avgDuration = completedSessions.length > 0 ? totalFocusTime / completedSessions.length : 0;

    const { currentStreak, longestStreak } = this.calculateStreaks(history);

    return {
      totalSessions: history.length,
      completedSessions: completedSessions.length,
      abandonedSessions: abandonedSessions.length,
      totalFocusTime,
      averageSessionDuration: avgDuration,
      currentStreak,
      longestStreak,
    };
  }

  private calculateStreaks(history: SessionHistoryEntry[]): { currentStreak: number; longestStreak: number } {
    if (history.length === 0) {return { currentStreak: 0, longestStreak: 0 };}

    const sorted = [...history].sort((a, b) => b.startedAt - a.startedAt);
    const completedDays = new Set(
      sorted
        .filter(h => h.status === 'COMPLETED' || h.status === 'PARTIAL')
        .map(h => new Date(h.startedAt).toDateString())
    );

    const completedDaysArray = Array.from(completedDays);
    if (completedDaysArray.length === 0) {return { currentStreak: 0, longestStreak: 0 };}

    let currentStreak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (completedDaysArray[0] !== today && completedDaysArray[0] !== yesterday) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    for (let i = 1; i < completedDaysArray.length; i++) {
      const prevDate = new Date(completedDaysArray[i - 1]);
      const currDate = new Date(completedDaysArray[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < completedDaysArray.length; i++) {
      const prevDate = new Date(completedDaysArray[i - 1]);
      const currDate = new Date(completedDaysArray[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak };
  }
}

let repositoryInstance: SessionRepository | null = null;

export function getSessionRepository(userId?: string): SessionRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SessionRepository(userId);
  } else if (userId) {
    repositoryInstance.setUserId(userId);
  }
  return repositoryInstance;
}
