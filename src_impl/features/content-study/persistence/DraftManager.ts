import { captureSilentFailure } from '../../../utils/silent-failure';
import type { PersistedDraft } from '../types';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { getStorage, STORAGE_KEYS } from '../persistence';

export class DraftManager {
  private static instance: DraftManager;
  private memoryCache: Map<string, PersistedDraft> = new Map();

  static getInstance(): DraftManager {
    if (!DraftManager.instance) {
      DraftManager.instance = new DraftManager();
    }
    return DraftManager.instance;
  }

  static resetForTests(): void {
    DraftManager.instance = new DraftManager();
  }

  async saveDraft(
    draft: Omit<PersistedDraft, 'id' | 'createdAt' | 'updatedAt' | 'autoSaveVersion'>,
  ): Promise<PersistedDraft> {
    const now = Date.now();
    const id = `draft-${now}-${Math.random().toString(36).substr(2, 9)}`;
    const fullDraft: PersistedDraft = {
      ...draft,
      id,
      createdAt: now,
      updatedAt: now,
      autoSaveVersion: 1,
    };

    this.memoryCache.set(id, fullDraft);

    const existingDrafts = await this.getAllDrafts();
    const updatedDrafts = [...existingDrafts.filter((d) => d.id !== id), fullDraft];
    const validDrafts = this.filterExpiredDrafts(updatedDrafts);

    await getStorage().setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(validDrafts));
    return fullDraft;
  }

  async updateDraft(
    id: string,
    updates: Partial<Omit<PersistedDraft, 'id' | 'createdAt'>>,
  ): Promise<PersistedDraft | null> {
    const drafts = await this.getAllDrafts();
    const draftIndex = drafts.findIndex((d) => d.id === id);
    if (draftIndex === -1) return null;

    const existing = drafts[draftIndex];
    if (!existing) return null;

    const updatedDraft: PersistedDraft = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      autoSaveVersion: existing.autoSaveVersion + 1,
    };

    drafts[draftIndex] = updatedDraft;
    this.memoryCache.set(id, updatedDraft);
    await getStorage().setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    return updatedDraft;
  }

  async getDraft(id: string): Promise<PersistedDraft | null> {
    const cached = this.memoryCache.get(id);
    if (cached) return cached;

    const drafts = await this.getAllDrafts();
    return drafts.find((d) => d.id === id) || null;
  }

  async getAllDrafts(): Promise<PersistedDraft[]> {
    try {
      const data = await getStorage().getItem(STORAGE_KEYS.DRAFTS);
      if (!data) return [];

      const drafts: PersistedDraft[] = JSON.parse(data);
      return this.filterExpiredDrafts(drafts);
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'safe-fallback',
        type: 'data',
      });
      return [];
    }
  }

  async getDraftsByType(type: PersistedDraft['type']): Promise<PersistedDraft[]> {
    const drafts = await this.getAllDrafts();
    return drafts.filter((d) => d.type === type);
  }

  async deleteDraft(id: string): Promise<boolean> {
    const drafts = await this.getAllDrafts();
    const filtered = drafts.filter((d) => d.id !== id);

    if (filtered.length === drafts.length) return false;

    this.memoryCache.delete(id);
    await getStorage().setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
    return true;
  }

  async clearAllDrafts(): Promise<void> {
    this.memoryCache.clear();
    await getStorage().removeItem(STORAGE_KEYS.DRAFTS);
  }

  private filterExpiredDrafts(drafts: PersistedDraft[]): PersistedDraft[] {
    const now = Date.now();
    const expiryMs = CONTENT_STUDY_CONSTANTS.DRAFT_EXPIRY_MS;
    return drafts.filter((draft) => now - draft.updatedAt < expiryMs);
  }

  async autoSave(
    type: PersistedDraft['type'],
    content: string,
    existingDraftId?: string,
  ): Promise<PersistedDraft> {
    if (existingDraftId) {
      const updates =
        type === 'paste'
          ? { pastedText: content }
          : type === 'youtube'
            ? { youtubeUrl: content }
            : {};
      const updated = await this.updateDraft(existingDraftId, updates);
      if (updated) return updated;
    }

    const draftData =
      type === 'paste'
        ? { type, activeTab: type, pastedText: content, youtubeUrl: '', selectedFile: null }
        : type === 'youtube'
          ? { type, activeTab: type, pastedText: '', youtubeUrl: content, selectedFile: null }
          : { type, activeTab: type, pastedText: '', youtubeUrl: '', selectedFile: null };

    return this.saveDraft(
      draftData as Omit<PersistedDraft, 'id' | 'createdAt' | 'updatedAt' | 'autoSaveVersion'>,
    );
  }
}
