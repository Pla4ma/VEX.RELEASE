/**
 * Tests for deriveWeeklyIntelligence from service-surface.ts
 */

import { describe, it, expect } from "@jest/globals";

import { deriveWeeklyIntelligence } from "../service-surface";
import { ModeWeeklyIntelligenceSchema } from "../schemas";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE-SURFACE: deriveWeeklyIntelligence
// ═══════════════════════════════════════════════════════════════════════

describe("deriveWeeklyIntelligence", () => {
  it("returns student weekly intelligence with defaults", () => {
    const intel = deriveWeeklyIntelligence({ laneOverride: "student" });
    expect(intel.lane).toBe("student");
    expect(intel.headline).toBe("Study week in review");
    expect(intel.primaryMetric).toBe("Review consistency");
    expect(intel.primaryMetricValue).toBe("0 of 0 blocks held");
  });

  it("fills completedSessions and totalSessions for student", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 3,
      totalSessions: 5,
    });
    expect(intel.primaryMetricValue).toBe("3 of 5 blocks held");
  });

  it("enriches student adjustment with singular reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      reviewItemsDue: 1,
    });
    expect(intel.adjustment).toContain("1 review item waiting.");
  });

  it("enriches student adjustment with plural reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      reviewItemsDue: 4,
    });
    expect(intel.adjustment).toContain("4 review items waiting.");
  });

  it("does not enrich student adjustment when reviewItemsDue is 0", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      reviewItemsDue: 0,
    });
    expect(intel.adjustment).not.toContain("review item");
  });

  it("returns game_like weekly intelligence with clean starts", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      cleanStarts: 5,
    });
    expect(intel.primaryMetricValue).toBe("5 clean starts this week");
  });

  it("enriches game_like adjustment with singular blocker pattern", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      blockerPatternsFound: 1,
    });
    expect(intel.adjustment).toContain("1 blocker pattern surfaced.");
  });

  it("enriches game_like adjustment with plural blocker patterns", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      blockerPatternsFound: 3,
    });
    expect(intel.adjustment).toContain("3 blocker patterns surfaced.");
  });

  it("returns deep_creative weekly intelligence", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      completedSessions: 4,
      totalSessions: 6,
    });
    expect(intel.headline).toBe("Project week in review");
    expect(intel.primaryMetricValue).toBe("4 of 6 blocks held");
  });

  it("enriches deep_creative adjustment with stale projects", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 2,
      activeProjects: 0,
    });
    expect(intel.adjustment).toContain("2 projects went stale.");
  });

  it("enriches deep_creative adjustment with singular stale project", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 1,
      activeProjects: 0,
    });
    expect(intel.adjustment).toContain("1 project went stale.");
  });

  it("enriches deep_creative adjustment with active projects (none stale)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 0,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain("3 active projects. Continuity is holding.");
  });

  it("enriches deep_creative adjustment with singular active project", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 0,
      activeProjects: 1,
    });
    expect(intel.adjustment).toContain("1 active project. Continuity is holding.");
  });

  it("prefers stale message over active when both present", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 2,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain("2 projects went stale.");
    expect(intel.adjustment).not.toContain("Continuity is holding");
  });

  it("returns minimal_normal weekly intelligence with duration template", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
      duration: 20,
    });
    expect(intel.headline).toBe("Clean week in review");
    expect(intel.primaryMetricValue).toBe("Your best sessions were 20-minute quiet blocks");
  });

  it("uses default duration of 15 when not provided", () => {
    const intel = deriveWeeklyIntelligence({ laneOverride: "minimal_normal" });
    expect(intel.primaryMetricValue).toBe("Your best sessions were 15-minute quiet blocks");
  });

  it("falls back to minimal_normal for null laneOverride", () => {
    const intel = deriveWeeklyIntelligence({ laneOverride: null });
    expect(intel.lane).toBe("minimal_normal");
  });

  it("returns valid ModeWeeklyIntelligence for all lanes", () => {
    for (const lane of ALL_LANES) {
      const intel = deriveWeeklyIntelligence({ laneOverride: lane });
      const result = ModeWeeklyIntelligenceSchema.safeParse(intel);
      expect(result.success).toBe(true);
    }
  });
});
