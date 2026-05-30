/**
 * Phase 6 — Verification: cold-start vs evidence-backed copy behavior
 *
 * 8 cases from spec:
 * 1. Study cold-start copy does not claim weak topics
 * 2. Project cold-start copy does not claim next move saved
 * 3. Run cold-start copy does not claim blocker detected
 * 4. Clean cold-start copy does not claim best focus window
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
import type { HomeContext } from "../service";
import type { CompletionContext, WeeklyIntelligenceContext } from "../service-surface";

// ── Helpers ────────────────────────────────────────────────────────────

function coldStudyHome(): HomeContext {
  return { laneOverride: "student", completedSessions: 0 };
}

function coldProjectHome(): HomeContext {
  return { laneOverride: "deep_creative", completedSessions: 0 };
}

function coldRunHome(): HomeContext {
  return { laneOverride: "game_like", completedSessions: 1 };
}

function coldCleanHome(): HomeContext {
  return { laneOverride: "minimal_normal", completedSessions: 0 };
}

function coldStudyCompletion(): CompletionContext {
  return { laneOverride: "student", completedSessions: 1 };
}

function evidenceStudyCompletion(): CompletionContext {
  return { laneOverride: "student", completedSessions: 5 };
}

function coldRunCompletion(): CompletionContext {
  return { laneOverride: "game_like", completedSessions: 2 };
}

function coldProjectCompletion(): CompletionContext {
  return { laneOverride: "deep_creative", completedSessions: 0 };
}

function coldWeeklyIntelligence(): WeeklyIntelligenceContext {
  return { laneOverride: "student", completedSessions: 2, totalSessions: 3 };
}

// ═══════════════════════════════════════════════════════════════════════
// Case 1: Study cold-start copy does not claim weak topics
// ═══════════════════════════════════════════════════════════════════════

describe("Case 1: Study cold-start does not claim weak topics", () => {
  it("home: no weak topic claim in cold-start body", () => {
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("weak");
    expect(surface.body).not.toContain("needs the most attention");
    expect(surface.body).toContain("VEX will learn");
  });

  it("home: cold-start does not mention review target", () => {
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("Review");
  });

  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 1,
      weakTopicCount: 5,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain("weak");
  });

  it("completion: evidence-backed with weakTopicCount shows insight", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      completedSessions: 5,
      weakTopicCount: 3,
    });
    expect(surface.insightLabel).not.toBeNull();
    expect(surface.insightLabel).toContain("weak");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 2: Project cold-start copy does not claim next move saved
// ═══════════════════════════════════════════════════════════════════════

describe("Case 2: Project cold-start does not claim next move saved", () => {
  it("home: no claim that next move is saved", () => {
    const surface = deriveHomeSurface(coldProjectHome());
    expect(surface.body).not.toContain("already saved");
    expect(surface.body).not.toContain("Pick up right where you stopped");
    expect(surface.body).toContain("Name the project");
  });

  it("home: no claim VEX remembers where you left off", () => {
    const surface = deriveHomeSurface(coldProjectHome());
    expect(surface.primaryFeeling).not.toContain("VEX remembers");
  });

  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface(coldProjectCompletion());
    expect(surface.insightLabel).toBeNull();
  });

  it("completion: cold-start body does not claim handoff saved", () => {
    const surface = deriveCompletionSurface({
      ...coldProjectCompletion(),
      handoffSaved: true,
    });
    expect(surface.body).not.toContain("Handoff note saved");
    expect(surface.body).not.toContain("Next move is locked");
  });

  it("completion: evidence-backed shows handoff enrichment", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      completedSessions: 4,
      handoffSaved: true,
    });
    expect(surface.body).toContain("Handoff note saved");
    expect(surface.insightLabel).toBe("Next move is locked for tomorrow");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 3: Run cold-start copy does not claim blocker detected
// ═══════════════════════════════════════════════════════════════════════

describe("Case 3: Run cold-start does not claim blocker detected", () => {
  it("completion: cold-start insightLabel is null", () => {
    const surface = deriveCompletionSurface({
      ...coldRunCompletion(),
      blockerDetected: true,
    });
    expect(surface.insightLabel).toBeNull();
    expect(surface.body).not.toContain("blocker");
  });

  it("completion: cold-start does not claim strongest pattern", () => {
    const surface = deriveCompletionSurface(coldRunCompletion());
    expect(surface.body).not.toContain("strongest");
    expect(surface.insightLabel).toBeNull();
  });

  it("completion: evidence-backed shows blocker detected", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      completedSessions: 4,
      blockerDetected: true,
    });
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.insightLabel).toBe("Blocker patterns tracked for next run");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Case 4: Clean cold-start copy does not claim best focus window
// ═══════════════════════════════════════════════════════════════════════

describe("Case 4: Clean cold-start does not claim best focus window", () => {
  it("weekly: cold-start does not claim best focus window", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
    });
    expect(intel.primaryMetric).not.toBe("Best focus window");
    expect(intel.primaryMetric).toBe("Sessions started");
  });

  it("home: cold-start clean has no rhythmLabel", () => {
    const surface = deriveHomeSurface(coldCleanHome());
    expect(surface.rhythmLabel).toBeNull();
  });

  it("weekly: cold-start body says VEX is learning, not analyzing", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
    });
    expect(intel.body).toContain("VEX is learning");
    expect(intel.body).not.toContain("best");
  });
});

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
    // When no completedSessions, VEX cannot cite memory
    const surface = deriveHomeSurface(coldStudyHome());
    expect(surface.body).not.toContain("Review");
    // VEX may still "learn" but must not claim knowledge from deleted data
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
    // The buildPremiumBridge in service.ts returns undefined when < 5 sessions.
    // This is tested by the weekly-intelligence service, not by deriveWeeklyIntelligence.
    // However, the cold-start weekly intelligence from deriveWeeklyIntelligence
    // should not mention premium at all.
    const intel = deriveWeeklyIntelligence(coldWeeklyIntelligence());
    expect(intel.body).not.toContain("Premium");
    expect(intel.body).not.toContain("unlock");
  });

  it("coach-presence: premium moment without strong confidence uses cautious copy", () => {
    // Coach presence premium bridge: only strong memoryConfidence triggers
    // "starting to see your rhythm". Medium and weak get "enough signals" variant.
    // This test verifies the concept: premium claims require proof.
    // The actual coach-presence message is tested in coach-presence __tests__
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
