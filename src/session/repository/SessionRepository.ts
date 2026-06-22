import type {
  SessionState,
  SessionHistoryEntry,
  SessionSummary,
} from '../types';
import { createDebugger } from '../../utils/debug';
import { captureSilentFailure } from '../../utils/silent-failure';
import { parseSessionStateJson } from './SessionRepositoryParsers';
import {
  calculateSessionStats,
  type SessionStatsResult,
} from './session-repository-stats';
import {
  getSessionHistoryFromStorage,
  getSessionByIdFromStorage,
  addToHistoryInStorage,
} from './session-repository-history';
import {
  getSessionSummary as getSummary,
  saveSessionSummary as saveSummary,
  getAllSummaries as getAllSum,
} from './session-repository-summaries';
import {
  addToSyncQueue as addToQueue,
  removeFromSyncQueue as removeFromQueue,
  getSyncQueue as getQueue,
} from './session-repository-sync-queue';
import {
  STORAGE_KEYS,
  SessionStorageHelper,
} from './session-repository-storage';

const debug = createDebugger('session:repository');

export type { SessionStatsResult };

export class SessionRepository {
  private userId: string | null = null;
  private storage = new SessionStorageHelper();

  constructor(userId?: string) {
    this.userId = userId ?? null;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('SessionRepository user set: %s', userId);
  }

  private requireUserId(): string {
    if (!this.userId) {throw new Error('SessionRepository: No user set');}
    return this.userId;
  }

  async getActiveSession(): Promise<SessionState | null> {
    if (!this.userId) {return null;}
    try {
      const data = await this.storage.getString(
        STORAGE_KEYS.activeSession(this.userId),
      );
      if (data) {return parseSessionStateJson(data);}
    } catch (error) {
      debug.error(
        'Failed to load active session',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
    return null;
  }

  async saveActiveSession(session: SessionState): Promise<void> {
    const uid = this.requireUserId();
    try {
      await this.storage.setString(
        STORAGE_KEYS.activeSession(uid),
        JSON.stringify(session),
      );
    } catch (error) {
      debug.error(
        'Failed to save',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  async clearActiveSession(): Promise<void> {
    if (!this.userId) {return;}
    try {
      await this.storage.removeString(STORAGE_KEYS.activeSession(this.userId));
    } catch (error: unknown) {
      debug.error('Failed to clear active session', error instanceof Error ? error : new Error(String(error)));
      captureSilentFailure(error, {
        feature: 'session:repository',
        operation: 'clearActiveSession',
        type: 'data',
      });
    }
  }

  async getSessionHistory(limit = 100): Promise<SessionHistoryEntry[]> {
    if (!this.userId) {return [];}
    return getSessionHistoryFromStorage(
      (key) => this.storage.getString(key),
      STORAGE_KEYS.sessionHistory(this.userId),
      limit,
    );
  }

  async getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> {
    if (!this.userId) {return null;}
    return getSessionByIdFromStorage(
      (key) => this.storage.getString(key),
      STORAGE_KEYS.sessionHistory(this.userId),
      sessionId,
    );
  }

  async addToHistory(entry: SessionHistoryEntry): Promise<void> {
    const uid = this.requireUserId();
    return addToHistoryInStorage(
      entry,
      (key) => this.storage.getString(key),
      (key, val) => this.storage.setString(key, val),
      STORAGE_KEYS.sessionHistory(uid),
    );
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    if (!this.userId) {return null;}
    return getSummary(
      sessionId,
      this.userId,
      (key) => this.storage.getString(key),
      STORAGE_KEYS.sessionSummaries(this.userId),
    );
  }

  async saveSessionSummary(summary: SessionSummary): Promise<void> {
    const uid = this.requireUserId();
    return saveSummary(
      summary,
      (key) => this.storage.getString(key),
      (key, val) => this.storage.setString(key, val),
      STORAGE_KEYS.sessionSummaries(uid),
    );
  }

  async getAllSummaries(): Promise<SessionSummary[]> {
    if (!this.userId) {return [];}
    return getAllSum(
      (key) => this.storage.getString(key),
      STORAGE_KEYS.sessionSummaries(this.userId),
    );
  }

  async addToSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) {return;}
    return addToQueue(
      sessionId,
      (key) => this.storage.getString(key),
      (key, val) => this.storage.setString(key, val),
      STORAGE_KEYS.syncQueue(this.userId),
    );
  }

  async removeFromSyncQueue(sessionId: string): Promise<void> {
    if (!this.userId) {return;}
    const queue = await this.getSyncQueue();
    return removeFromQueue(
      sessionId,
      queue,
      (key, val) => this.storage.setString(key, val),
      STORAGE_KEYS.syncQueue(this.userId),
    );
  }

  async getSyncQueue(): Promise<string[]> {
    if (!this.userId) {return [];}
    return getQueue(
      (key) => this.storage.getString(key),
      STORAGE_KEYS.syncQueue(this.userId),
    );
  }

  async getSessionStats(): Promise<SessionStatsResult> {
    const [history, summaries] = await Promise.all([
      this.getSessionHistory(1000),
      this.getAllSummaries(),
    ]);
    return calculateSessionStats(history, summaries);
  }
}

export function getSessionRepository(userId?: string): SessionRepository {
  return new SessionRepository(userId);
}
