/**
 * Tests for deriveWeeklyIntelligence — cold-start vs evidence-backed
 */
import { describe, it, expect } from "@jest/globals";
import { deriveWeeklyIntelligence } from "../service-surface";
import { ModeWeeklyIntelligenceSchema } from "../schemas";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// Cold-start (completedSessions < 3 or totalSessions < 5)
// ═══════════════════════════════════════════════════════════════════════

describe("deriveWeeklyIntelligence — cold-start (insufficient data)", () => {
  it("returns cold-start student when totalSessions < 5", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 3,
      totalSessions: 3,
    });
    expect(intel.headline).toBe("First week of study");
    expect(intel.body).toContain("VEX is learning");
    expect(intel.primaryMetric).toBe("Sessions started");
  });

  it("returns cold-start for all lanes without evidence", () => {
    for (const lane of ALL_LANES) {
      const intel = deriveWeeklyIntelligence({
        laneOverride: lane,
        completedSessions: 1,
        totalSessions: 2,
      });
      expect(intel.body).toContain("VEX is learning");
      expect(intel.nextSessionType).toBeDefined();
      expect(intel.primaryMetric).toBe("Sessions started");
    }
  });

  it("cold-start: minimal_normal — no best focus window claim", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
    });
    expect(intel.headline).toBe("First week of clean sessions");
    expect(intel.body).toContain("VEX is learning your quiet rhythm");
    expect(intel.primaryMetricValue).not.toContain("best sessions");
    // Replaced "best" metric with neutral "sessions completed"
    expect(intel.primaryMetric).not.toBe("Best focus window");
  });

  it("cold-start: does not enrich with reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 2,
      totalSessions: 4,
      reviewItemsDue: 5,
    });
    expect(intel.adjustment).not.toContain("review item");
  });

  it("cold-start: does not enrich with blockerPatternsFound", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      completedSessions: 1,
      totalSessions: 3,
      blockerPatternsFound: 3,
    });
    expect(intel.adjustment).not.toContain("blocker pattern");
  });

  it("cold-start: does not enrich with staleProjects", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      completedSessions: 2,
      totalSessions: 4,
      staleProjects: 2,
      activeProjects: 0,
    });
    expect(intel.adjustment).not.toContain("went stale");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Evidence-backed (completedSessions >= 3 AND totalSessions >= 5)
// ═══════════════════════════════════════════════════════════════════════

describe("deriveWeeklyIntelligence — evidence-backed", () => {
  it("student evidence: headline is Study week in review", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 4,
      totalSessions: 6,
    });
    expect(intel.headline).toBe("Study week in review");
    expect(intel.primaryMetric).toBe("Review consistency");
  });

  it("student evidence: enriches with reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 4,
      totalSessions: 5,
      reviewItemsDue: 4,
    });
    expect(intel.adjustment).toContain("4 review items waiting.");
  });

  it("game_like evidence: enriches with blockerPatternsFound", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      completedSessions: 5,
      totalSessions: 7,
      blockerPatternsFound: 1,
    });
    expect(intel.adjustment).toContain("1 blocker pattern surfaced.");
  });

  it("deep_creative evidence: enriches with staleProjects", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      completedSessions: 4,
      totalSessions: 5,
      staleProjects: 2,
      activeProjects: 0,
    });
    expect(intel.adjustment).toContain("2 projects went stale.");
  });

  it("deep_creative evidence: enriches with activeProjects (none stale)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      completedSessions: 4,
      totalSessions: 6,
      staleProjects: 0,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain("3 active projects. Continuity is holding.");
  });

  it("minimal_normal evidence: sessions completed metric", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
      completedSessions: 4,
      totalSessions: 6,
      duration: 20,
    });
    expect(intel.headline).toBe("Clean week in review");
    expect(intel.primaryMetricValue).toBe("4 of 6 sessions this week");
    expect(intel.bestNextSessionType).not.toBeNull();
  });

  it("evidence: valid schema for all lanes", () => {
    for (const lane of ALL_LANES) {
      const intel = deriveWeeklyIntelligence({
        laneOverride: lane,
        completedSessions: 5,
        totalSessions: 7,
      });
      const result = ModeWeeklyIntelligenceSchema.safeParse(intel);
      expect(result.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Boundary
// ═══════════════════════════════════════════════════════════════════════

describe("deriveWeeklyIntelligence — boundary", () => {
  it("completedSessions 3, totalSessions 5 = evidence-backed (threshold met)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 3,
      totalSessions: 5,
    });
    expect(intel.headline).toBe("Study week in review");
  });

  it("completedSessions 4, totalSessions 4 = cold-start (totalSessions < 5)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 4,
      totalSessions: 4,
    });
    expect(intel.headline).toBe("First week of study");
  });

  it("falls back to minimal_normal for null laneOverride", () => {
    const intel = deriveWeeklyIntelligence({ laneOverride: null, completedSessions: 4, totalSessions: 6 });
    expect(intel.lane).toBe("minimal_normal");
  });
});
