/**
 * Mode-Native Comprehensive Tests — Copy Objects
 *
 * Covers: HOME_COPY, QUICK_CONTRACT_COPY, ACTIVE_INDICATOR_COPY,
 * COMPLETION_COPY, RESCUE_COPY, WEEKLY_INTELLIGENCE_COPY.
 */

import { describe, it, expect } from "@jest/globals";

// ── Schemas ───────────────────────────────────────────────────────────
import { PrimaryActionSchema } from "../schemas";

// ── Copy objects ──────────────────────────────────────────────────────
import {
  HOME_COPY,
  QUICK_CONTRACT_COPY,
  ACTIVE_INDICATOR_COPY,
  COMPLETION_COPY,
  RESCUE_COPY,
  WEEKLY_INTELLIGENCE_COPY,
} from "../copy";

// ── Lane types ────────────────────────────────────────────────────────
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// COPY OBJECTS — complete coverage
// ═══════════════════════════════════════════════════════════════════════

describe("Copy objects", () => {
  describe("HOME_COPY", () => {
    it("has entries for all four lanes", () => {
      for (const lane of ALL_LANES) {
        expect(HOME_COPY[lane]).toBeDefined();
        expect(HOME_COPY[lane].headline.length).toBeGreaterThan(0);
      }
    });

    it("each lane has a non-empty primaryFeeling", () => {
      for (const lane of ALL_LANES) {
        expect(HOME_COPY[lane].primaryFeeling.length).toBeGreaterThan(0);
      }
    });

    it("each lane has a valid primaryAction", () => {
      for (const lane of ALL_LANES) {
        const action = HOME_COPY[lane].primaryAction;
        expect(PrimaryActionSchema.safeParse(action).success).toBe(true);
      }
    });

    it("student suggests 20 min study block", () => {
      expect(HOME_COPY.student.suggestedDurationMinutes).toBe(20);
      expect(HOME_COPY.student.primaryAction).toBe("start_study_block");
    });

    it("game_like suggests 25 min run", () => {
      expect(HOME_COPY.game_like.suggestedDurationMinutes).toBe(25);
      expect(HOME_COPY.game_like.primaryAction).toBe("start_clean_run");
    });

    it("deep_creative suggests 30 min project block", () => {
      expect(HOME_COPY.deep_creative.suggestedDurationMinutes).toBe(30);
      expect(HOME_COPY.deep_creative.primaryAction).toBe("resume_project");
    });

    it("minimal_normal suggests 15 min and has null rhythmLabel", () => {
      expect(HOME_COPY.minimal_normal.suggestedDurationMinutes).toBe(15);
      expect(HOME_COPY.minimal_normal.rhythmLabel).toBeNull();
      expect(HOME_COPY.minimal_normal.secondaryHint).not.toBeNull();
    });
  });

  describe("QUICK_CONTRACT_COPY", () => {
    it("has entries for all four lanes", () => {
      for (const lane of ALL_LANES) {
        expect(QUICK_CONTRACT_COPY[lane]).toBeDefined();
      }
    });

    it("minimal_normal has exactly 1 question", () => {
      expect(QUICK_CONTRACT_COPY.minimal_normal.questions).toHaveLength(1);
    });

    it("all other lanes have exactly 2 questions", () => {
      const twoQ: Lane[] = ["student", "game_like", "deep_creative"];
      for (const lane of twoQ) {
        expect(QUICK_CONTRACT_COPY[lane].questions).toHaveLength(2);
      }
    });

    it("all questions have non-empty key, label, placeholder", () => {
      for (const lane of ALL_LANES) {
        for (const q of QUICK_CONTRACT_COPY[lane].questions) {
          expect(q.key.length).toBeGreaterThan(0);
          expect(q.label.length).toBeGreaterThan(0);
          expect(q.placeholder.length).toBeGreaterThan(0);
        }
      }
    });

    it("all contracts have showAdvancedSettings: false", () => {
      for (const lane of ALL_LANES) {
        expect(QUICK_CONTRACT_COPY[lane].showAdvancedSettings).toBe(false);
      }
    });
  });

  describe("ACTIVE_INDICATOR_COPY", () => {
    it("has entries for all lanes", () => {
      for (const lane of ALL_LANES) {
        expect(ACTIVE_INDICATOR_COPY[lane]).toBeDefined();
      }
    });

    it("all lanes show progress bar and are quiet", () => {
      for (const lane of ALL_LANES) {
        expect(ACTIVE_INDICATOR_COPY[lane].showProgressBar).toBe(true);
        expect(ACTIVE_INDICATOR_COPY[lane].quiet).toBe(true);
      }
    });

    it("all lanes have a non-null targetLabel", () => {
      for (const lane of ALL_LANES) {
        expect(ACTIVE_INDICATOR_COPY[lane].targetLabel).not.toBeNull();
        expect(ACTIVE_INDICATOR_COPY[lane].targetLabel!.length).toBeGreaterThan(0);
      }
    });
  });

  describe("COMPLETION_COPY", () => {
    it("has entries for all lanes", () => {
      for (const lane of ALL_LANES) {
        expect(COMPLETION_COPY[lane]).toBeDefined();
      }
    });

    it("all lanes show showRewards: false, showStreak: false, showXp: false", () => {
      for (const lane of ALL_LANES) {
        expect(COMPLETION_COPY[lane].showRewards).toBe(false);
        expect(COMPLETION_COPY[lane].showStreak).toBe(false);
        expect(COMPLETION_COPY[lane].showXp).toBe(false);
      }
    });

    it("minimal_normal has null insightLabel", () => {
      expect(COMPLETION_COPY.minimal_normal.insightLabel).toBeNull();
    });

    it("body templates contain placeholders for context variables", () => {
      expect(COMPLETION_COPY.student.body).toContain("{topic}");
      expect(COMPLETION_COPY.game_like.body).toContain("{task}");
      expect(COMPLETION_COPY.deep_creative.body).toContain("{project}");
      expect(COMPLETION_COPY.minimal_normal.body).toContain("{action}");
    });
  });

  describe("RESCUE_COPY", () => {
    it("has entries for all lanes", () => {
      for (const lane of ALL_LANES) {
        expect(RESCUE_COPY[lane]).toBeDefined();
      }
    });

    it("all durations are within 3-15 minutes", () => {
      for (const lane of ALL_LANES) {
        const dur = RESCUE_COPY[lane].suggestedDurationMinutes;
        expect(dur).toBeGreaterThanOrEqual(3);
        expect(dur).toBeLessThanOrEqual(15);
      }
    });

    it("minimal_normal has shortest rescue (5 min)", () => {
      expect(RESCUE_COPY.minimal_normal.suggestedDurationMinutes).toBe(5);
    });
  });

  describe("WEEKLY_INTELLIGENCE_COPY", () => {
    it("has entries for all lanes", () => {
      for (const lane of ALL_LANES) {
        expect(WEEKLY_INTELLIGENCE_COPY[lane]).toBeDefined();
      }
    });

    it("all lanes have non-empty primaryMetric", () => {
      for (const lane of ALL_LANES) {
        expect(WEEKLY_INTELLIGENCE_COPY[lane].primaryMetric.length).toBeGreaterThan(0);
      }
    });

    it("primaryMetricValue templates contain placeholders", () => {
      expect(WEEKLY_INTELLIGENCE_COPY.student.primaryMetricValue).toContain("{completedSessions}");
      expect(WEEKLY_INTELLIGENCE_COPY.game_like.primaryMetricValue).toContain("{cleanStarts}");
      expect(WEEKLY_INTELLIGENCE_COPY.minimal_normal.primaryMetricValue).toContain("{completedSessions}");
    });
  });
});
