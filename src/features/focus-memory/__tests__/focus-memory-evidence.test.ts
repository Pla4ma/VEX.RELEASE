/**
 * Tests for focus-memory evidence helpers
 */
import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  hashEvidence,
  isImportSourceMemory,
  generateRecommendationEvidence,
  buildMemoryEvidence,
} from "./helpers";

describe("focus-memory evidence tests", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("hashEvidence", () => {
    it("produces deterministic hashes", () => {
      const hash1 = hashEvidence("test evidence string");
      const hash2 = hashEvidence("test evidence string");
      expect(hash1).toBe(hash2);
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = hashEvidence("morning sessions");
      const hash2 = hashEvidence("evening sessions");
      expect(hash1).not.toBe(hash2);
    });

    it("returns a string prefixed with ev-", () => {
      const hash = hashEvidence("some evidence");
      expect(hash).toMatch(/^ev-/);
    });

    it("handles empty string", () => {
      const hash = hashEvidence("");
      expect(hash).toMatch(/^ev-/);
    });
  });

  describe("isImportSourceMemory", () => {
    it("returns true for import source", async () => {
      const m = await createMemoryCandidate({
        userId: "user-imp",
        type: "project_continuity",
        summary: "Draft outline.",
        source: "import",
        confidence: 0.9,
        createdAt: currentTime,
      });
      expect(isImportSourceMemory(m)).toBe(true);
    });

    it("returns false for non-import source", async () => {
      const m = await createMemoryCandidate({
        userId: "user-imp2",
        type: "best_time_window",
        summary: "Best at 9am.",
        source: "behavior",
        confidence: 0.8,
        createdAt: currentTime,
      });
      expect(isImportSourceMemory(m)).toBe(false);
    });
  });

  describe("generateRecommendationEvidence edge cases", () => {
    it("returns cold_start when sessionCount < 3 even with memories", () => {
      const evidence = generateRecommendationEvidence(
        [
          {
            id: "m1",
            userId: "u",
            type: "best_time_window",
            summary: "Test",
            source: "behavior",
            confidence: 0.9,
            accepted: true,
            deletedAt: null,
            expiresAt: null,
            evidenceHash: null,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        ],
        2,
      );
      expect(evidence.source).toBe("cold_start");
      expect(evidence.fallbackReason).toBe("cold_start");
    });

    it("defaults lane to minimal_normal when not provided", () => {
      const evidence = generateRecommendationEvidence([], 0);
      expect(evidence.lane).toBe("minimal_normal");
    });
  });

  describe("buildMemoryEvidence with empty memories", () => {
    it("returns insufficient_data fallback", () => {
      const evidence = buildMemoryEvidence([]);
      expect(evidence.fallbackReason).toBe("insufficient_data");
      expect(evidence.source).toBe("cold_start");
    });
  });
});
