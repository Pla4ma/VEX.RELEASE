import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { SessionState, SessionHistoryEntry, SessionSummary } from '../types';
import { createDebugger } from '../../utils/debug';
import { calculateSessionStreaks } from './SessionStreakCalculator';
const debug = createDebugger('session:repository');

interface MMKVInstance { getString(key: string): string | undefined; set(key: string, value: string): void; delete(key: string): void; }

const STORAGE_KEYS = {
  activeSession: (userId: string) => `session:active:${userId}`,
  sessionHistory: (userId: string) => `session:history:${userId}`,
  sessionSummaries: (userId: string) => `session:summaries:${userId}`,
  syncQueue: (userId: string) => `session:sync:queue:${userId}`,
};

export class SessionRepository {
  private userId: string | null = null;
  private mmkv: MMKVInstance | null = null;
  private useMMKV = false;

  constructor(userId?: string) { this.userId = userId ?? null; this.initStorage(); }
  setUserId(userId: string): void { this.userId = userId; debug.info('SessionRepository user set: %s', userId); }

  private initStorage(): void {
    try {
      const { MMKV } = require('react-native-mmkv');
      this.mmkv = new MMKV({ id: 'session-storage', encryptionKey: 'session-encryption-key' }); this.useMMKV = true;
    } catch (error) { debug.warn('MMKV init failed', error instanceof Error ? error : new Error(String(error))); this.useMMKV = false; }
  }

  private async getString(key: string): Promise<string | null> {
    if (this.useMMKV && this.mmkv) return this.mmkv.getString(key) ?? null;
    return getMMKVStorageAdapter().getItem(key);
  }

  private async setString(key: string, value: string): Promise<void> {
    if (this.useMMKV && this.mmkv) this.mmkv.set(key, value); else await getMMKVStorageAdapter().setItem(key, value);
  }

  private async removeString(key: string): Promise<void> {
    if (this.useMMKV && this.mmkv) this.mmkv.delete(key); else await getMMKVStorageAdapter().removeItem(key);
  }

  private requireUserId(): string {
    if (!this.userId) throw new Error('SessionRepository: No user set');
    return this.userId;
  }

  async getActiveSession(): Promise<SessionState | null> {
    if (!this.userId) return null;
    try {
      const data = await this.getString(STORAGE_KEYS.activeSession(this.userId));
      if (data) { const session = JSON.parse(data) as SessionState; return session; }
    } catch (error) { debug.error('Failed to load active session', error instanceof Error ? error : new Error(String(error))); }
    return null;
  }

  async saveActiveSession(session: SessionState): Promise<void> {
    const uid = this.requireUserId();
    try { await this.setString(STORAGE_KEYS.activeSession(uid), JSON.stringify(session)); }
    catch (error) { debug.error('Failed to save', error instanceof Error ? error : new Error(String(error))); throw error; }
  }

  async clearActiveSession(): Promise<void> {
    if (!this.userId) return;
    try { await this.removeString(STORAGE_KEYS.activeSession(this.userId)); } catch { /* ignore */ }
  }

  async getSessionHistory(limit = 100): Promise<SessionHistoryEntry[]> {
    if (!this.userId) return [];
    try {
      const data = await this.getString(STORAGE_KEYS.sessionHistory(this.userId));
      if (data) return (JSON.parse(data) as SessionHistoryEntry[]).slice(0, limit);
    } catch (error) { debug.error('Failed to load history', error instanceof Error ? error : new Error(String(error))); }
    return [];
  }

  async getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> {
    const history = await this.getSessionHistory(1000);
    return history.find((e) => e.sessionId === sessionId) ?? null;
  }

  async addToHistory(entry: SessionHistoryEntry): Promise<void> {
    const uid = this.requireUserId();
    try {
      let history = await this.getSessionHistory(1000);
      history.unshift(entry); if (history.length > 1000) history = history.slice(0, 1000);
      await this.setString(STORAGE_KEYS.sessionHistory(uid), JSON.stringify(history));
    } catch (error) { debug.error('Failed to add to history', error instanceof Error ? error : new Error(String(error))); throw error; }
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    if (!this.userId) return null;
    try {
      const data = await this.getString(STORAGE_KEYS.sessionSummaries(this.userId));
      if (data) { const summaries = JSON.parse(data) as Record<string, SessionSummary>; return summaries[sessionId] || null; }
    } catch (error) { debug.error('Failed to load summary', error instanceof Error ? error : new Error(String(error))); }
    return null;
  }

  async saveSessionSummary(summary: SessionSummary): Promise<void> {
    const uid = this.requireUserId();
    try {
      const data = await this.getString(STORAGE_KEYS.sessionSummaries(uid));
      const summaries: Record<string, SessionSummary> = data ? JSON.parse(data) : {};
      summaries[summary.sessionId] = summary;
      await this.setString(STORAGE_KEYS.sessionSummaries(uid), JSON.stringify(summaries));
    } catch (error) { debug.error('Failed to save summary', error instanceof Error ? error : new Error(String(error))); throw error; }
  }

  async getAllSummaries(): Promise<SessionSummary[]> {
    if (!this.userId) return [];
    try {
      const data = await this.getString(STORAGE_KEYS.sessionSummaries(this.userId));
      if (data) return Object.values(JSON.parse(data) as Record<string, SessionSummary>);
    } catch (error) { debug.error('Failed to load summaries', error instanceof Error ? error : new Error(String(error))); }
    return [];
  }

  async addToSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) return;
    try {
      const data = await this.getString(STORAGE_KEYS.syncQueue(this.userId));
      const queue: string[] = data ? JSON.parse(data) : [];
      if (!queue.includes(sessionId)) { queue.push(sessionId); await this.setString(STORAGE_KEYS.syncQueue(this.userId), JSON.stringify(queue)); }
    } catch (error) { debug.error('Failed to add to sync queue', error instanceof Error ? error : new Error(String(error))); }
  }

  async removeFromSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) return;
    try {
      const queue = await this.getSyncQueue();
      await this.setString(STORAGE_KEYS.syncQueue(this.userId), JSON.stringify(queue.filter((id) => id !== sessionId)));
    } catch (error) { debug.error('Failed to remove from sync queue', error instanceof Error ? error : new Error(String(error))); }
  }

  async getSyncQueue(): Promise<string[]> {
    if (!this.userId) return [];
    try { const data = await this.getString(STORAGE_KEYS.syncQueue(this.userId)); return data ? JSON.parse(data) : []; }
    catch (error) { debug.error('Failed to get sync queue', error instanceof Error ? error : new Error(String(error))); return []; }
  }

  async getSessionStats(): Promise<{
    totalSessions: number; completedSessions: number; abandonedSessions: number;
    totalFocusTime: number; averageSessionDuration: number; currentStreak: number; longestStreak: number;
  }> {
    const history = await this.getSessionHistory(1000);
    const summaries = await this.getAllSummaries();
    const completed = history.filter((h) => h.status === 'COMPLETED' || h.status === 'PARTIAL');
    const abandoned = history.filter((h) => h.status === 'ABANDONED' || h.status === 'FAILED');
    const totalFocus = summaries.reduce((s, v) => s + v.effectiveDuration, 0);
    const avg = completed.length > 0 ? totalFocus / completed.length : 0;
    const { currentStreak, longestStreak } = calculateSessionStreaks(history);
    return { totalSessions: history.length, completedSessions: completed.length, abandonedSessions: abandoned.length, totalFocusTime: totalFocus, averageSessionDuration: avg, currentStreak, longestStreak };
  }
}

let repositoryInstance: SessionRepository | null = null;

export function getSessionRepository(userId?: string): SessionRepository {
  if (!repositoryInstance) { repositoryInstance = new SessionRepository(userId); }
  else if (userId) { repositoryInstance.setUserId(userId); }
  return repositoryInstance;
}
