import { CacheManager } from "../persistence";
import type { StudyContent, StudyGeneration } from "../types";
import { mockStorage } from "./persistence.test.helpers";

jest.mock("../../../persistence", () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

const makeTestContent = (overrides: Partial<StudyContent> = {}): StudyContent => ({
  id: "content-123",
  userId: "user-1",
  sourceType: "PASTE",
  extractedText: "Test content",
  extractedLength: 12,
  language: "en",
  isUserEdited: false,
  status: "READY",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  generationCount: 0,
  ...overrides,
});

const makeTestGeneration = (
  overrides: Partial<StudyGeneration> = {},
): StudyGeneration => ({
  id: "gen-123",
  contentId: "content-123",
  userId: "user-1",
  summary: {
    overview: "Test",
    keyPoints: [],
    targetAudience: [],
    prerequisites: [],
  },
  keyConcepts: [],
  tasks: [],
  quizItems: [],
  sessionPlan: {
    recommendedDuration: 30,
    recommendedSessions: 1,
    breakIntervalMinutes: 5,
    suggestedDifficulty: "NORMAL",
    focusAreas: [],
  },
  metadata: {
    contentLength: 12,
    processingTimeMs: 1000,
    modelVersion: "v1",
    confidenceScore: 0.9,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  accessCount: 0,
  isArchived: false,
  ...overrides,
});

describe("CacheManager", () => {
  let cacheManager: CacheManager;
  beforeEach(() => {
    mockStorage.clear();
    CacheManager.resetForTests();
    cacheManager = CacheManager.getInstance();
  });
  it("should cache and retrieve data", async () => {
    const data = { id: "test", value: "test data" };
    await cacheManager.set("test-key", data);
    const retrieved = await cacheManager.get("test-key");
    expect(retrieved).toEqual(data);
  });
  it("should return null for expired cache", async () => {
    const data = { id: "test", value: "test data" };
    await cacheManager.set("expired-key", data, { ttlMs: -1 });
    const retrieved = await cacheManager.get("expired-key");
    expect(retrieved).toBeNull();
  });
  it("should return null for non-existent key", async () => {
    const retrieved = await cacheManager.get("non-existent");
    expect(retrieved).toBeNull();
  });
  it("should delete cached data", async () => {
    const data = { id: "test", value: "test data" };
    await cacheManager.set("delete-key", data);
    await cacheManager.delete("delete-key");
    const retrieved = await cacheManager.get("delete-key");
    expect(retrieved).toBeNull();
  });
  it("should cache content", async () => {
    const content = makeTestContent();
    await cacheManager.cacheContent(content);
    const retrieved = await cacheManager.getContentWithCache("content-123");
    expect(retrieved).toEqual(content);
  });
  it("should cache generation", async () => {
    const generation = makeTestGeneration();
    await cacheManager.cacheGeneration(generation);
    const retrieved = await cacheManager.getGenerationWithCache("gen-123");
    expect(retrieved).toEqual(generation);
  });
});
