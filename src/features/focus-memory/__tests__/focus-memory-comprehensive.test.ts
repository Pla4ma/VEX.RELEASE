/**
 * Comprehensive tests for focus-memory feature
 * Covers: expiry.ts, evidence.ts, memory-operations.ts, events.ts, memory-panel-types.ts
 */
import {
  mockStore,
  currentTime,
  createMemoryCandidate,
  listActiveMemories,
  listDeletedMemoryHashes,
  findMemoriesForRecommendation,
  acceptMemory,
  deleteMemory,
  hasEvidenceConflict,
  hashEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  generateRecommendationEvidence,
  canClaimStrongPattern,
  scopeMessageForSource,
  isImportSourceMemory,
  filterImportMemories,
  contentScopeForSource,
} from "./helpers";
import { expiryForType, isSensitiveMemory } from "../expiry";
import {
  FocusMemoryEventSchema,
} from "../events";
import {
  MemoryPanelItemSchema,
  WHAT_VEX_LEARNED_MIN_SESSIONS,
} from "../memory-panel-types";

describe("focus-memory comprehensive tests", () => {
  beforeEach(() => {
    mockStore.clear();
    jest.spyOn(Date, "now").mockReturnValue(currentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ──────────────────── expiry.ts ────────────────────

  describe("expiryForType", () => {
    it("returns null for persistent types (preferred_tone, project_continuity, friction_preference)", () => {
      expect(expiryForType("preferred_tone", currentTime)).toBeNull();
      expect(expiryForType("project_continuity", currentTime)).toBeNull();
      expect(expiryForType("friction_preference", currentTime)).toBeNull();
    });

    it("returns 45-day expiry for successful_session_pattern", () => {
      const result = expiryForType("successful_session_pattern", currentTime);
      expect(result).toBe(currentTime + 45 * 24 * 60 * 60 * 1000);
    });

    it("returns 60-day expiry for lane_evidence", () => {
      const result = expiryForType("lane_evidence", currentTime);
      expect(result).toBe(currentTime + 60 * 24 * 60 * 60 * 1000);
    });

    it("returns 7-day expiry for study_deadline", () => {
      const result = expiryForType("study_deadline", currentTime);
      expect(result).toBe(currentTime + 7 * 24 * 60 * 60 * 1000);
    });

    it("returns 30-day expiry for default types", () => {
      const types30 = [
        "best_time_window",
        "avoidance_trigger",
        "failed_session_pattern",
        "notification_preference",
      ] as const;
      for (const type of types30) {
        const result = expiryForType(type, currentTime);
        expect(result).toBe(currentTime + 30 * 24 * 60 * 60 * 1000);
      }
    });
  });

  describe("isSensitiveMemory", () => {
    it("returns true for study_deadline and project_continuity", () => {
      expect(isSensitiveMemory("study_deadline")).toBe(true);
      expect(isSensitiveMemory("project_continuity")).toBe(true);
    });

    it("returns false for non-sensitive types", () => {
      expect(isSensitiveMemory("best_time_window")).toBe(false);
      expect(isSensitiveMemory("preferred_tone")).toBe(false);
      expect(isSensitiveMemory("avoidance_trigger")).toBe(false);
      expect(isSensitiveMemory("lane_evidence")).toBe(false);
    });
  });

  // ──────────────────── hashEvidence ────────────────────

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

  // ──────────────────── evidence.ts helpers ────────────────────

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

  // ──────────────────── memory-operations.ts ────────────────────

  describe("listDeletedMemoryHashes", () => {
    it("returns evidence hashes of deleted memories", async () => {
      const m = await createMemoryCandidate({
        userId: "user-del",
        type: "best_time_window",
        summary: "Morning.",
        source: "behavior",
        confidence: 0.8,
        evidenceHash: "ev-abc",
        createdAt: currentTime,
      });
      await deleteMemory(m.id, "user-del");
      const hashes = await listDeletedMemoryHashes("user-del");
      expect(hashes).toContain("ev-abc");
    });

    it("returns empty array when no memories are deleted", async () => {
      await createMemoryCandidate({
        userId: "user-del2",
        type: "best_time_window",
        summary: "Morning.",
        source: "behavior",
        confidence: 0.8,
        createdAt: currentTime,
      });
      const hashes = await listDeletedMemoryHashes("user-del2");
      expect(hashes).toHaveLength(0);
    });
  });

  describe("hasEvidenceConflict", () => {
    it("returns false for empty evidenceHash", async () => {
      const result = await hasEvidenceConflict("user-ec", "");
      expect(result).toBe(false);
    });

    it("returns true when evidence hash matches a deleted memory", async () => {
      const m = await createMemoryCandidate({
        userId: "user-ec2",
        type: "best_time_window",
        summary: "Pattern.",
        source: "behavior",
        confidence: 0.7,
        evidenceHash: "ev-conflict",
        createdAt: currentTime,
      });
      await deleteMemory(m.id, "user-ec2");
      const result = await hasEvidenceConflict("user-ec2", "ev-conflict");
      expect(result).toBe(true);
    });

    it("returns false when evidence hash does not match any deleted memory", async () => {
      const result = await hasEvidenceConflict("user-ec3", "ev-nope");
      expect(result).toBe(false);
    });
  });

  describe("findMemoriesForRecommendation", () => {
    it("filters by type when types array is provided", async () => {
      await createMemoryCandidate({
        userId: "user-rec",
        type: "best_time_window",
        summary: "Morning.",
        source: "behavior",
        confidence: 0.8,
        createdAt: currentTime,
      });
      await createMemoryCandidate({
        userId: "user-rec",
        type: "avoidance_trigger",
        summary: "Avoid evening.",
        source: "behavior",
        confidence: 0.8,
        createdAt: currentTime,
      });
      await acceptMemory(
        (
          await listActiveMemories("user-rec")
        )[0]!.id,
        "user-rec",
      );
      await acceptMemory(
        (
          await listActiveMemories("user-rec")
        )[1]!.id,
        "user-rec",
      );

      const result = await findMemoriesForRecommendation({
        userId: "user-rec",
        types: ["best_time_window"],
      });
      expect(result.every((m) => m.type === "best_time_window")).toBe(true);
    });

    it("returns only accepted memories", async () => {
      const m = await createMemoryCandidate({
        userId: "user-acc",
        type: "best_time_window",
        summary: "Morning.",
        source: "behavior",
        confidence: 0.5,
        createdAt: currentTime,
      });
      // not accepted (confidence < 0.7 and not sensitive)
      const result = await findMemoriesForRecommendation({
        userId: "user-acc",
        minConfidence: 0.3,
      });
      expect(result).toHaveLength(0);

      await acceptMemory(m.id, "user-acc");
      const result2 = await findMemoriesForRecommendation({
        userId: "user-acc",
        minConfidence: 0.3,
      });
      expect(result2).toHaveLength(1);
    });
  });

  // ──────────────────── events.ts ────────────────────

  describe("FocusMemoryEventSchema", () => {
    it("validates a memory_candidate_created event", () => {
      const event = FocusMemoryEventSchema.parse({
        type: "memory_candidate_created",
        memory: {
          id: "mem-1",
          userId: "user-1",
          type: "best_time_window",
          summary: "Morning focus",
          source: "behavior",
          confidence: 0.8,
          accepted: false,
          deletedAt: null,
          expiresAt: currentTime + 30 * 86400000,
          evidenceHash: null,
          createdAt: currentTime,
          updatedAt: currentTime,
        },
      });
      expect(event.type).toBe("memory_candidate_created");
    });

    it("rejects unknown event types", () => {
      expect(() =>
        FocusMemoryEventSchema.parse({
          type: "unknown_event",
          memory: {
            id: "mem-1",
            userId: "user-1",
            type: "best_time_window",
            summary: "Morning focus",
            source: "behavior",
            confidence: 0.8,
            accepted: false,
            deletedAt: null,
            expiresAt: null,
            evidenceHash: null,
            createdAt: currentTime,
            updatedAt: currentTime,
          },
        }),
      ).toThrow();
    });
  });

  // ──────────────────── memory-panel-types.ts ────────────────────

  describe("MemoryPanelItemSchema", () => {
    it("validates a valid panel item", () => {
      const item = MemoryPanelItemSchema.parse({
        id: "panel-1",
        observation: "You focus better in the morning.",
        evidence: "session_completion",
        confidence: 0.85,
        source: "session_completion",
        type: "best_time_window",
        isHidden: false,
        createdAt: currentTime,
      });
      expect(item.id).toBe("panel-1");
      expect(item.isHidden).toBe(false);
    });

    it("rejects panel item with empty observation", () => {
      expect(() =>
        MemoryPanelItemSchema.parse({
          id: "panel-1",
          observation: "",
          evidence: "session_completion",
          confidence: 0.85,
          source: "session_completion",
          type: "best_time_window",
          isHidden: false,
          createdAt: currentTime,
        }),
      ).toThrow();
    });
  });

  describe("WHAT_VEX_LEARNED_MIN_SESSIONS", () => {
    it("equals 3", () => {
      expect(WHAT_VEX_LEARNED_MIN_SESSIONS).toBe(3);
    });
  });

  // ──────────────────── generateRecommendationEvidence edge cases ────────────────────

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
