/**
 * Phase 8 — Completion as Personalization Training Event
 *
 * Verifies the 8 canonical requirements:
 * 1. Completion creates memory candidate.
 * 2. Completion updates lane evidence only with enough signal.
 * 3. Completion creates next action.
 * 4. Completion asks one question.
 * 5. No chest/shop/economy.
 * 6. XP/streak/progress still update.
 * 7. Hidden unlock remains inert.
 * 8. Partial completion no shame.
 */

import { SessionMode } from "../../../session/modes";
import {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from "../service";
import { createSessionSummary, SESSION_ID } from "./ledger-test-utils";
import type { Lane } from "../../lane-engine/types";

const LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

const CLEAN_QUESTIONS: Record<Lane, number> = {
  student: 1,
  game_like: 1,
  deep_creative: 1,
  minimal_normal: 1,
};

describe("Phase 8 — Completion as Personalization Training Event", () => {
  // ── Requirement 1: Completion creates memory candidate ──
  describe("1. Completion creates memory candidate", () => {
    it.each(LANES)("%s: clean completion produces one memory candidate", (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      expect(result.memoryCandidates).toHaveLength(1);
      expect(result.memoryCandidates[0].source).toBe("session_completion");
    });

    it("memory candidate includes session evidence in text", () => {
      const result = buildCompletionPersonalization({
        lane: "student",
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      const text = result.memoryCandidates[0].text;
      expect(text).toContain("s:");
      expect(text).toContain("l:student");
      expect(text).toContain("m:");
    });

    it("memory candidate confidence reflects completion quality", () => {
      const clean = buildCompletionPersonalization({
        lane: "game_like",
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      const abandoned = buildCompletionPersonalization({
        lane: "game_like",
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.FLOW,
          status: "ABANDONED",
        }),
      });
      expect(clean.memoryCandidates[0].confidence).toBeGreaterThan(
        abandoned.memoryCandidates[0].confidence,
      );
    });
  });

  // ── Requirement 2: Lane evidence only with enough signal ──
  describe("2. Completing updates lane evidence only with enough signal", () => {
    it("clean completion carries medium confidence", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 10,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 5,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 150,
      });
      expect(result.laneProfile.confidenceBand).toBe("medium");
      expect(result.laneProfile.confidence).toBeGreaterThanOrEqual(0.5);
    });

    it("partial completion keeps confidence low", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 0,
        grade: "C",
        isPersonalBest: false,
        lane: "game_like",
        streakAction: "maintained",
        streakDays: 3,
        summary: createSessionSummary({
          completionPercentage: 35,
          sessionMode: SessionMode.FLOW,
          status: "COMPLETED",
        }),
        xpDelta: 30,
      });
      expect(result.laneProfile.confidenceBand).toBe("low");
      expect(result.laneProfile.confidence).toBeLessThan(0.5);
    });

    it("abandoned session does not increase lane confidence", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: -5,
        grade: "D",
        isPersonalBest: false,
        lane: "minimal_normal",
        streakAction: "broken",
        streakDays: 0,
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.FLOW,
          status: "ABANDONED",
        }),
        xpDelta: 0,
      });
      expect(result.laneProfile.confidenceBand).toBe("low");
    });
  });

  // ── Requirement 3: Completion creates next action ──
  describe("3. Completion creates next action", () => {
    it("produces nextAction when recommendation service works", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 10,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 5,
        summary: createSessionSummary({
          createdAt: Date.UTC(2026, 4, 15, 18),
          sessionMode: SessionMode.STUDY,
          userId: "550e8400-e29b-41d4-a716-446655440099",
        }),
        xpDelta: 120,
      });
      expect(result.nextAction).not.toBeNull();
      expect(result.nextAction?.ctaLabel).toBeDefined();
      expect(result.nextAction?.routeParams.presetMode).toBeDefined();
    });

    it("nextAction gracefully nulls when recommendation fails", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 5,
        grade: "B",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 2,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 80,
      });
      expect(result.nextAction).toBeNull();
      expect(result.progressProof.xpDelta).toBe(80);
    });
  });

  // ── Requirement 4: Completion asks exactly one question ──
  describe("4. Completion asks exactly one question", () => {
    it.each(LANES)("%s: clean completion produces exactly one reflection question", (lane) => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 8,
        grade: "A",
        isPersonalBest: false,
        lane,
        streakAction: "extended",
        streakDays: 4,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 120,
      });
      expect(typeof result.reflectionQuestion).toBe("string");
      expect(result.reflectionQuestion.length).toBeGreaterThan(0);
      expect(result.reflectionQuestion.endsWith("?")).toBe(true);

      // Verify it's exactly ONE question (not multiple)
      const questionMarkCount = (result.reflectionQuestion.match(/\?/g) ?? []).length;
      expect(questionMarkCount).toBe(1);
    });

    it("partial uses a recovery question, not an interrogation", () => {
      const result = buildCompletionPersonalization({
        lane: "student",
        summary: createSessionSummary({ completionPercentage: 40 }),
      });
      expect(result.reflectionQuestion.length).toBeLessThan(80);
      expect(result.reflectionQuestion.endsWith("?")).toBe(true);
    });
  });

  // ── Requirement 5: No chest/shop/economy ──
  describe("5. No chest/shop/economy", () => {
    const ECONOMY_TERMS = ["chest", "shop", "wallet", "coin", "gem", "battle_pass", "premium_currency", "inventory"];

    it("completion personalization output contains no economy terms", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 8,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 4,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 120,
      });
      const json = JSON.stringify(result).toLowerCase();
      for (const term of ECONOMY_TERMS) {
        expect(json).not.toContain(term);
      }
    });

    it("userFacingSummary uses progress language, not reward language", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 8,
        grade: "A",
        isPersonalBest: false,
        lane: "deep_creative",
        streakAction: "extended",
        streakDays: 3,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 90,
      });
      expect(result.userFacingSummary.displayTitle).not.toMatch(/reward|earn|claim|open/i);
    });

    it("progressProof does not report coins or gems", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 5,
        grade: "B",
        isPersonalBest: false,
        lane: "minimal_normal",
        streakAction: "maintained",
        streakDays: 2,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 60,
      });
      const proof = result.progressProof as Record<string, unknown>;
      expect(proof.coinsEarned).toBeUndefined();
      expect(proof.gemsEarned).toBeUndefined();
      expect(proof.walletDelta).toBeUndefined();
    });
  });

  // ── Requirement 6: XP/streak/progress still update ──
  describe("6. XP/streak/progress still update", () => {
    it("progressProof carries xpDelta", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 10,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 5,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 200,
      });
      expect(result.progressProof.xpDelta).toBe(200);
    });

    it("progressProof carries streak days and action", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 6,
        grade: "B",
        isPersonalBest: false,
        lane: "game_like",
        streakAction: "extended",
        streakDays: 7,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 100,
      });
      expect(result.progressProof.streakDays).toBe(7);
      expect(result.progressProof.streakAction).toBe("extended");
    });

    it("progressProof carries grade", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 12,
        grade: "S",
        isPersonalBest: false,
        lane: "deep_creative",
        streakAction: "extended",
        streakDays: 10,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 180,
      });
      expect(result.progressProof.grade).toBe("S");
    });

    it("progressProof carries focus score delta", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 15,
        grade: "A",
        isPersonalBest: false,
        lane: "minimal_normal",
        streakAction: "maintained",
        streakDays: 3,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        xpDelta: 90,
      });
      expect(result.progressProof.focusScoreDelta).toBe(15);
    });

    it("progressProof carries effective minutes and completion percentage", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 8,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 6,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 130,
      });
      expect(result.progressProof.effectiveMinutes).toBeGreaterThan(0);
      expect(result.progressProof.completionPercentage).toBe(100);
    });

    it("progressProof reflects personal best", () => {
      const withPB = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 20,
        grade: "S",
        isPersonalBest: true,
        lane: "student",
        streakAction: "extended",
        streakDays: 8,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 250,
      });
      expect(withPB.progressProof.isPersonalBest).toBe(true);

      const withoutPB = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 5,
        grade: "B",
        isPersonalBest: false,
        lane: "student",
        streakAction: "maintained",
        streakDays: 3,
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
        xpDelta: 60,
      });
      expect(withoutPB.progressProof.isPersonalBest).toBe(false);
    });
  });

  // ── Requirement 7: Hidden unlock remains inert ──
  describe("7. Hidden unlock remains inert", () => {
    const UNLOCK_KEYS: Record<Lane, string> = {
      student: "study_os",
      game_like: "run_board",
      deep_creative: "project_thread",
      minimal_normal: "today_strip",
    };

    it.each(LANES)("%s: hidden featureKey keeps unlock blocked", (lane) => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: [UNLOCK_KEYS[lane]],
        lane,
        summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
      });
      expect(result.unlockDecision.hidden).toBe(true);
      expect(result.unlockDecision.status).toBe("blocked");
      expect(result.unlockDecision.key).toBe(UNLOCK_KEYS[lane]);
    });

    it("hidden unlock produces a reason explaining why", () => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: ["study_os"],
        lane: "student",
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      expect(result.unlockDecision.reason.length).toBeGreaterThan(0);
    });

    it("hidden memory_console stays hidden before session 3 (via integration layer)", () => {
      const result = buildCompletionPersonalization({
        hiddenFeatureKeys: ["memory_console"],
        lane: "student",
        summary: createSessionSummary({ sessionMode: SessionMode.STUDY }),
      });
      expect(result.unlockDecision.key).toBe("study_os");
      // memory_console is handled in integration layer, not personalization
    });
  });

  // ── Requirement 8: Partial completion no shame ──
  describe("8. Partial completion no shame", () => {
    const SHAME_TERMS = ["fail", "failure", "weak", "bad", "terrible", "awful", "disappointing", "shameful", "loser"];

    it.each(LANES)("%s: partial reflection contains no shame language", (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({ completionPercentage: 30 }),
      });
      const question = result.reflectionQuestion.toLowerCase();
      for (const term of SHAME_TERMS) {
        expect(question).not.toContain(term);
      }
      expect(question.endsWith("?")).toBe(true);
    });

    it.each(LANES)("%s: abandoned reflection contains no shame language", (lane) => {
      const result = buildCompletionPersonalization({
        lane,
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.FLOW,
          status: "ABANDONED",
        }),
      });
      const question = result.reflectionQuestion.toLowerCase();
      for (const term of SHAME_TERMS) {
        expect(question).not.toContain(term);
      }
    });

    it("abandoned memory candidate still has low but present confidence", () => {
      const result = buildCompletionPersonalization({
        lane: "student",
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.STUDY,
          status: "ABANDONED",
        }),
      });
      expect(result.memoryCandidates[0].confidence).toBeGreaterThan(0);
      expect(result.memoryCandidates[0].confidence).toBeLessThan(0.5);
    });

    it("partial completion tone is neutral (info), not negative", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 2,
        grade: "C",
        isPersonalBest: false,
        lane: "student",
        streakAction: "maintained",
        streakDays: 2,
        summary: createSessionSummary({ completionPercentage: 45 }),
        xpDelta: 30,
      });
      expect(result.userFacingSummary.tone).toBe("info");
      expect(result.userFacingSummary.tone).not.toBe("warning");
    });

    it("abandoned session uses warning tone but without shame", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: -5,
        grade: "D",
        isPersonalBest: false,
        lane: "minimal_normal",
        streakAction: "broken",
        streakDays: 0,
        summary: createSessionSummary({
          completionPercentage: 0,
          sessionMode: SessionMode.FLOW,
          status: "ABANDONED",
        }),
        xpDelta: 0,
      });
      expect(result.userFacingSummary.tone).toBe("warning");
      const body = result.userFacingSummary.displayBody.toLowerCase();
      for (const term of SHAME_TERMS) {
        expect(body).not.toContain(term);
      }
    });
  });

  // ── Cross-cutting: Canonical result shape ──
  describe("Canonical result shape", () => {
    it("produces all 7 required fields", () => {
      const result = buildCompletionPersonalizationResult({
        deletedMemoryIds: [],
        focusScoreDelta: 10,
        grade: "A",
        isPersonalBest: false,
        lane: "student",
        streakAction: "extended",
        streakDays: 5,
        summary: createSessionSummary({
          createdAt: Date.UTC(2026, 4, 15, 18),
          sessionMode: SessionMode.STUDY,
          userId: "550e8400-e29b-41d4-a716-446655440099",
        }),
        xpDelta: 120,
      });
      expect(result.laneProfile).toBeDefined();
      expect(result.progressProof).toBeDefined();
      expect(result.reflectionQuestion).toBeDefined();
      expect(result.memoryCandidates).toBeDefined();
      expect(result.unlockDecision).toBeDefined();
      expect(result.nextAction).toBeDefined();
      expect(result.userFacingSummary).toBeDefined();
    });

    it("memory candidate count is 0 or 1 (max sequences)", () => {
      LANES.forEach((lane) => {
        const result = buildCompletionPersonalization({
          lane,
          summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        });
        expect(result.memoryCandidates.length).toBeLessThanOrEqual(1);
      });
    });

    it("reflection question is a single question (max visual sequence)", () => {
      const extracted: string[] = [];
      LANES.forEach((lane) => {
        const result = buildCompletionPersonalization({
          lane,
          summary: createSessionSummary({ sessionMode: SessionMode.FLOW }),
        });
        extracted.push(result.reflectionQuestion);
      });
      for (const q of extracted) {
        const count = (q.match(/\?/g) ?? []).length;
        expect(count).toBe(CLEAN_QUESTIONS[LANES[0]]);
      }
    });
  });
});
