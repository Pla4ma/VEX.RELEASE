import { DraftManager } from '../persistence';
import type { PersistedDraft } from '../types';
import { mockStorage } from './persistence.test.helpers';

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

describe('DraftManager', () => {
  let draftManager: DraftManager;
  beforeEach(() => {
    mockStorage.clear();
    DraftManager.resetForTests();
    draftManager = DraftManager.getInstance();
  });
  it('should save a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Test content',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    expect(draft.id).toBeDefined();
    expect(draft.type).toBe('paste');
    expect(draft.pastedText).toBe('Test content');
    expect(draft.autoSaveVersion).toBe(1);
  });
  it('should update a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Original content',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    const updated = await draftManager.updateDraft(draft.id, {
      pastedText: 'Updated content',
    });
    expect(updated).not.toBeNull();
    expect(updated?.pastedText).toBe('Updated content');
    expect(updated?.autoSaveVersion).toBe(2);
  });
  it('should get a draft by id', async () => {
    const draft = await draftManager.saveDraft({
      type: 'youtube',
      activeTab: 'youtube',
      pastedText: '',
      youtubeUrl: 'https://youtube.com/watch?v=123',
      selectedFile: null,
      userId: 'test-user',
    });
    const retrieved = await draftManager.getDraft(draft.id);
    expect(retrieved).toEqual(draft);
  });
  it('should return null for non-existent draft', async () => {
    const retrieved = await draftManager.getDraft('non-existent-id');
    expect(retrieved).toBeNull();
  });
  it('should get all drafts', async () => {
    await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Draft 1',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    await draftManager.saveDraft({
      type: 'pdf',
      activeTab: 'pdf',
      pastedText: '',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    const drafts = await draftManager.getAllDrafts();
    expect(drafts).toHaveLength(2);
  });
  it('should filter drafts by type', async () => {
    await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Draft 1',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Draft 2',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    await draftManager.saveDraft({
      type: 'youtube',
      activeTab: 'youtube',
      pastedText: '',
      youtubeUrl: 'Draft 3',
      selectedFile: null,
      userId: 'test-user',
    });
    const pasteDrafts = await draftManager.getDraftsByType('paste');
    expect(pasteDrafts).toHaveLength(2);
  });
  it('should delete a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Draft to delete',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    const deleted = await draftManager.deleteDraft(draft.id);
    const retrieved = await draftManager.getDraft(draft.id);
    expect(deleted).toBe(true);
    expect(retrieved).toBeNull();
  });
  it('should auto-save draft', async () => {
    const draft = await draftManager.autoSave('paste', 'Auto-saved content');
    expect(draft.pastedText).toBe('Auto-saved content');
  });
  it('should update existing draft on auto-save', async () => {
    const draft = await draftManager.saveDraft({
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Original',
      youtubeUrl: '',
      selectedFile: null,
      userId: 'test-user',
    });
    const autoSaved = await draftManager.autoSave(
      'paste',
      'Updated content',
      draft.id,
    );
    expect(autoSaved.id).toBe(draft.id);
    expect(autoSaved.autoSaveVersion).toBe(2);
  });
  it('should filter expired drafts', async () => {
    const oldDraft: PersistedDraft = {
      id: 'old-draft',
      userId: 'test-user',
      type: 'paste',
      activeTab: 'paste',
      pastedText: 'Old content',
      youtubeUrl: '',
      selectedFile: null,
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      autoSaveVersion: 1,
    };
    await mockStorage.setItem(
      'vex:content-study:drafts',
      JSON.stringify([oldDraft]),
    );
    const drafts = await draftManager.getAllDrafts();
    expect(drafts).toHaveLength(0);
  });
});
