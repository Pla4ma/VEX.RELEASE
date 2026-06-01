import { captureSilentFailure } from '../../../utils/silent-failure';
import type { PersistedStudySession } from '../types';
import { getStorage, STORAGE_KEYS } from '../persistence';

export class StudySessionManager {
  private static instance: StudySessionManager;

  static getInstance(): StudySessionManager {
    if (!StudySessionManager.instance) {
      StudySessionManager.instance = new StudySessionManager();
    }
    return StudySessionManager.instance;
  }

  static resetForTests(): void {
    StudySessionManager.instance = new StudySessionManager();
  }

  async saveSession(session: PersistedStudySession): Promise<void> {
    const sessions = await this.getAllSessions();
    const existingIndex = sessions.findIndex(
      (s) => s.generationId === session.generationId && !s.endTime,
    );

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    await getStorage().setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  async getAllSessions(): Promise<PersistedStudySession[]> {
    try {
      const data = await getStorage().getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'safe-fallback',
        type: 'data',
      });
      return [];
    }
  }

  async getActiveSession(
    generationId: string,
  ): Promise<PersistedStudySession | null> {
    const sessions = await this.getAllSessions();
    return (
      sessions.find((s) => s.generationId === generationId && !s.endTime) ||
      null
    );
  }

  async getSessionsForGeneration(
    generationId: string,
  ): Promise<PersistedStudySession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter((s) => s.generationId === generationId);
  }

  async completeSession(
    generationId: string,
    updates: Partial<PersistedStudySession>,
  ): Promise<boolean> {
    const sessions = await this.getAllSessions();
    const index = sessions.findIndex(
      (s) => s.generationId === generationId && !s.endTime,
    );

    if (index === -1) {return false;}

    sessions[index] = {
      ...sessions[index]!,
      ...updates,
      endTime: Date.now(),
      synced: false,
    };

    await getStorage().setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return true;
  }

  async getUnsyncedSessions(): Promise<PersistedStudySession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter((s) => !s.synced);
  }

  async markSessionsSynced(ids: string[]): Promise<void> {
    const sessions = await this.getAllSessions();
    sessions.forEach((s) => {
      if (ids.includes(s.generationId)) {
        s.synced = true;
      }
    });
    await getStorage().setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }

  async clearOldSessions(olderThanDays: number = 30): Promise<number> {
    const sessions = await this.getAllSessions();
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const filtered = sessions.filter((s) => s.startTime > cutoff || !s.endTime);
    const removed = sessions.length - filtered.length;

    if (removed > 0) {
      await getStorage().setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(filtered),
      );
    }

    return removed;
  }
}
