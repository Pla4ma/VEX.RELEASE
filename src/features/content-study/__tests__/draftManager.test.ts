import { DraftManager } from "../persistence";
import type { PersistedDraft } from "../types";
import { mockStorage } from "./persistence.test.helpers";

jest.mock("../../../persistence", () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

describe("DraftManager", () => {
  let draftManager: DraftManager;
  beforeEach(() => {
    mockStorage.clear();
    DraftManager.resetForTests();
    draftManager = DraftManager.getInstance();
  });
  it("should save a draft", async () => {
    const draft = await draftManager.saveDraft({
      type: "PASTE",
      content: "Test content",
    });
    expect(draft.id).toBeDefined();
    expect(draft.type).toBe("PASTE");
    expect(draft.content).toBe("Test content");
    expect(draft.autoSaveVersion).toBe(1);
  });
  it("should update a draft", async () => {
    const draft = await draftManager.saveDraft({
      type: "PASTE",
      content: "Original content",
    });
    const updated = await draftManager.updateDraft(draft.id, {
      content: "Updated content",
    });
    expect(updated).not.toBeNull();
    expect(updated?.content).toBe("Updated content");
    expect(updated?.autoSaveVersion).toBe(2);
  });
  it("should get a draft by id", async () => {
    const draft = await draftManager.saveDraft({
      type: "YOUTUBE",
      content: "https://youtube.com/watch?v=123",
    });
    const retrieved = await draftManager.getDraft(draft.id);
    expect(retrieved).toEqual(draft);
  });
  it("should return null for non-existent draft", async () => {
    const retrieved = await draftManager.getDraft("non-existent-id");
    expect(retrieved).toBeNull();
  });
  it("should get all drafts", async () => {
    await draftManager.saveDraft({ type: "PASTE", content: "Draft 1" });
    await draftManager.saveDraft({ type: "PDF", content: "Draft 2" });
    const drafts = await draftManager.getAllDrafts();
    expect(drafts).toHaveLength(2);
  });
  it("should filter drafts by type", async () => {
    await draftManager.saveDraft({ type: "PASTE", content: "Draft 1" });
    await draftManager.saveDraft({ type: "PASTE", content: "Draft 2" });
    await draftManager.saveDraft({ type: "YOUTUBE", content: "Draft 3" });
    const pasteDrafts = await draftManager.getDraftsByType("PASTE");
    expect(pasteDrafts).toHaveLength(2);
  });
  it("should delete a draft", async () => {
    const draft = await draftManager.saveDraft({
      type: "PASTE",
      content: "Draft to delete",
    });
    const deleted = await draftManager.deleteDraft(draft.id);
    const retrieved = await draftManager.getDraft(draft.id);
    expect(deleted).toBe(true);
    expect(retrieved).toBeNull();
  });
  it("should auto-save draft", async () => {
    const draft = await draftManager.autoSave("PASTE", "Auto-saved content");
    expect(draft.content).toBe("Auto-saved content");
  });
  it("should update existing draft on auto-save", async () => {
    const draft = await draftManager.saveDraft({
      type: "PASTE",
      content: "Original",
    });
    const autoSaved = await draftManager.autoSave(
      "PASTE",
      "Updated content",
      draft.id,
    );
    expect(autoSaved.id).toBe(draft.id);
    expect(autoSaved.autoSaveVersion).toBe(2);
  });
  it("should filter expired drafts", async () => {
    const oldDraft: PersistedDraft = {
      id: "old-draft",
      type: "PASTE",
      content: "Old content",
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      autoSaveVersion: 1,
    };
    await mockStorage.setItem(
      "content-study:drafts",
      JSON.stringify([oldDraft]),
    );
    const drafts = await draftManager.getAllDrafts();
    expect(drafts).toHaveLength(0);
  });
});
