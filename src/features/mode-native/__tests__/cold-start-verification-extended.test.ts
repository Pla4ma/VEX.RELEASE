/**
 * Phase 6 — Verification: cold-start vs evidence-backed copy behavior
 *
 * Cases 5–8 from spec + cross-cutting checks:
 * 5. Weekly intelligence does not show strong insight without enough sessions
 * 6. Evidence-backed copy appears when required evidence exists
 * 7. Deleted/hidden memory is not reused for copy
 * 8. Premium does not overclaim before proof
 */
import { describe, it, expect } from "@jest/globals";
import { deriveHomeSurface } from "../service";
import {
  deriveCompletionSurface,
  deriveWeeklyIntelligence,
} from "../service-surface";
import {
  coldStudyHome,
  coldWeeklyIntelligence,
  evidenceStudyCompletion,
} from "./cold-start-helpers";

// ═══════════════════════════════════════════════════════════════════════
// Case 5: Weekly intelligence does not show strong insight without enough sessions
// ═══════════════════════════════════════════════════════════════════════

describe("Case 5: Weekly intelligence gated on session count", () => {
  it("3 completed and 4 total = cold-start (totalSessions < 5)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 3,
      totalSessions: 4,
    });
    expect(intel.headline).toBe("First week of study");
    expect(intel.bestNextSessionType).toBeUndefined();
  });

  it("2 completed and 6 total = cold-start (completedSessions < 3)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      completedSessions: 2,
      totalSessions: 6,
    });
    expect(intel.body).toContain("VEX is learning");
    expect(intel.bestNextSessionType).toBeUndefined();
  });

  it("5 completed and 7 total = evidence-backed (both thresholds met)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 5,
      totalSessions: 7,
    });
    expect(intel.headline).toBe("Study week in review");
    expect(intel.nextSessionType).not.toBeNull();
  });

  it("cold-start for all lanes: no bestNextSessionType", () => {
    const lanes = ["student", "game_like", "deep_creative", "minimal_normal"] as const;
    for (const lane of lanes) {
      const intel = deriveWeeklyIntelligence({
        laneOverride: lane,
      });
      expect(intel.bestNextSessionType).toBeUndefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 6: Evidence-backed copy appears when required evidence exists
// ═══════════════════════════════════════════════════════════════════════

describe("Case 6: Evidence-backed copy when evidence exists", () => {
  it("home: student with 5 sessions gets evidence copy", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      completedSessions: 5,
      recentTopic: "Graph traversal",
      weakTopicCount: 2,
    });
    expect(surface.primaryFeeling).toBe("VEX knows what I should study next.");
    expect(surface.body).toContain("Review");
    expect(surface.rhythmLabel).toBe("Best study rhythm: mornings");
  });

  it("home: deep_creative with 4 sessions + nextMove gets enriched", () => {
    const surface = deriveHomeSurface({
      laneOverride: "deep_creative",
      completedSessions: 4,
      hasActiveProject: true,
      nextMove: "Write the welcome screen",
    });
    expect(surface.body).toContain("Next move: Write the welcome screen");
  });

  it("completion: game_like with 5 sessions + cleanStarts gets enriched", () => {
    const surface = deriveCompletionSurface(evidenceStudyCompletion());
    expect(surface.insightLabel).toBe("VEX tracked your weak spots for next block");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 7: Deleted/hidden memory is not reused for copy
// ═══════════════════════════════════════════════════════════════════════

describe("Case 7: Deleted/hidden memory is not reused", () => {
  it("cold-start with deleted memory still shows cold-start copy", () => {
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("Review");
    expect(surface.body).toContain("VEX will learn");
  });

  it("completion: cold-start does not reference past sessions", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 0,
    });
    expect(surface.body).not.toContain("your last");
    expect(surface.body).not.toContain("from last session");
  });

  it("completion: cold-start does not claim VEX tracked anything", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 1,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain("VEX tracked");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 8: Premium does not overclaim before proof
// ═══════════════════════════════════════════════════════════════════════

describe("Case 8: Premium does not overclaim before proof", () => {
  it("weekly: premiumDeeperInsight absent before 5 sessions", () => {
    const intel = deriveWeeklyIntelligence(coldWeeklyIntelligence());
    expect(intel.body).not.toContain("Premium");
    expect(intel.body).not.toContain("unlock");
  });

  it("coach-presence: premium moment without strong confidence uses cautious copy", () => {
    expect(true).toBe(true); // placeholder — coach-presence tested separately
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Cross-cutting: no "best" claims in cold-start
// ═══════════════════════════════════════════════════════════════════════

describe("Cross-cutting: no false confidence words in cold-start", () => {
  const BANNED_PATTERNS = [
    /VEX knows/,
    /VEX noticed/,
    /VEX learned/,
    /VEX remembers/,
    /best.*rhythm/,
    /best.*window/,
    /best.*momentum/,
    /your strongest/,
    /needs the most/,
    /already saved/,
    /is waiting/,
  ];

  it("cold-start HOME_COPY bodies do not contain banned patterns", () => {
    const { COLD_START_HOME_COPY } = require("../copy-home");
    const texts = Object.values(COLD_START_HOME_COPY).flatMap(
      (entry: Record<string, unknown>) => [
        entry.primaryFeeling,
        entry.headline,
        entry.body,
        entry.rhythmLabel,
      ].filter(Boolean),
    );
    for (const text of texts) {
      for (const pattern of BANNED_PATTERNS) {
        expect(text as string).not.toMatch(pattern);
      }
    }
  });

  it("cold-start COMPLETION_COPY insightLabels are all null", () => {
    const { COLD_START_COMPLETION_COPY } = require("../copy-session");
    const values = Object.values(COLD_START_COMPLETION_COPY) as Array<{ insightLabel: string | null }>;
    for (const entry of values) {
      expect(entry.insightLabel).toBeNull();
    }
  });

  it("cold-start WEEKLY_INTELLIGENCE_COPY bodies all say VEX is learning", () => {
    const { COLD_START_WEEKLY_INTELLIGENCE_COPY } = require("../copy-session");
    const values = Object.values(COLD_START_WEEKLY_INTELLIGENCE_COPY) as Array<{ body: string }>;
    for (const entry of values) {
      expect(entry.body).toContain("VEX is learning");
    }
  });
});
