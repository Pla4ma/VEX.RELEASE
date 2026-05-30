/**
 * Tests for deriveHomeSurface — cold-start vs evidence-backed branching
 */
import { describe, it, expect } from "@jest/globals";
import { deriveHomeSurface } from "../service";
import { ModeHomeSurfaceSchema } from "../schemas";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// Cold-start (completedSessions < 3) — no overclaiming
// ═══════════════════════════════════════════════════════════════════════

describe("deriveHomeSurface — cold-start (completedSessions < 3)", () => {
  it("returns default minimal_normal surface with empty context", () => {
    const surface = deriveHomeSurface({});
    expect(surface.lane).toBe("minimal_normal");
    expect(surface.headline).toBe("One clean action");
    expect(surface.primaryAction).toBe("start_session");
    expect(surface.rhythmLabel).toBeNull();
  });

  it("student cold-start: does not claim VEX knows what to study", () => {
    const surface = deriveHomeSurface({ laneOverride: "student" });
    expect(surface.primaryFeeling).toBe("I want to build a study habit.");
    expect(surface.headline).toBe("Start your next study block");
    expect(surface.body).toContain("VEX will learn");
    expect(surface.body).not.toContain("needs the most attention");
    expect(surface.rhythmLabel).toBeNull();
  });

  it("game_like cold-start: does not claim best momentum", () => {
    const surface = deriveHomeSurface({ laneOverride: "game_like" });
    expect(surface.headline).toBe("Start a clean run");
    expect(surface.body).toContain("VEX will learn");
    expect(surface.body).not.toContain("best momentum");
    expect(surface.rhythmLabel).toBeNull();
  });

  it("deep_creative cold-start: does not claim VEX remembers or project waiting", () => {
    const surface = deriveHomeSurface({ laneOverride: "deep_creative" });
    expect(surface.primaryFeeling).toBe("I want to protect my deep work.");
    expect(surface.headline).toBe("Start a project block");
    expect(surface.body).not.toContain("Your project is waiting");
    expect(surface.body).not.toContain("already saved");
    expect(surface.body).toContain("Name the project");
  });

  it("minimal_normal cold-start: same as evidence (no claims to drop)", () => {
    const surface = deriveHomeSurface({ laneOverride: "minimal_normal" });
    expect(surface.headline).toBe("One clean action");
    expect(surface.rhythmLabel).toBeNull();
  });

  // Cold-start should NOT enrich body with evidence-dependent details
  it("cold-start student: does not enrich with weakTopicCount", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
      weakTopicCount: 3,
      completedSessions: 1,
    });
    expect(surface.body).toBe("Start with one named study target. VEX will learn what needs review.");
    expect(surface.body).not.toContain("Graph algorithms");
  });

  it("cold-start deep_creative: does not enrich with nextMove", () => {
    const surface = deriveHomeSurface({
      laneOverride: "deep_creative",
      hasActiveProject: true,
      nextMove: "Write the welcome screen",
      completedSessions: 2,
    });
    expect(surface.body).toBe("Name the project and save the next move after this block.");
  });

  it("cold-start game_like: does not enrich with cleanStarts", () => {
    const surface = deriveHomeSurface({
      laneOverride: "game_like",
      cleanStartsThisWeek: 5,
      completedSessions: 0,
    });
    expect(surface.body).toBe("Start one clean run. VEX will learn what helps you keep momentum.");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Evidence-backed (completedSessions >= 3)
// ═══════════════════════════════════════════════════════════════════════

describe("deriveHomeSurface — evidence-backed (completedSessions >= 3)", () => {
  it("student evidence: can claim VEX knows", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      completedSessions: 5,
    });
    expect(surface.primaryFeeling).toBe("VEX knows what I should study next.");
    expect(surface.headline).toBe("Your next study block is ready");
  });

  it("student evidence: enriches with weakTopicCount", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
      weakTopicCount: 3,
      completedSessions: 5,
    });
    expect(surface.body).toBe('Review "Graph algorithms" — 3 topics need attention. 20 minutes.');
  });

  it("deep_creative evidence: enriches with nextMove", () => {
    const surface = deriveHomeSurface({
      laneOverride: "deep_creative",
      hasActiveProject: true,
      nextMove: "Write the welcome screen",
      completedSessions: 4,
    });
    expect(surface.body).toBe("Next move: Write the welcome screen. Pick up where you stopped.");
  });

  it("game_like evidence: enriches with cleanStartsThisWeek", () => {
    const surface = deriveHomeSurface({
      laneOverride: "game_like",
      cleanStartsThisWeek: 5,
      completedSessions: 6,
    });
    expect(surface.body).toBe("5 clean starts this week. Keep the momentum going.");
  });

  it("evidence-backed: rhythmLabel present for non-minimal lanes", () => {
    const studentSurface = deriveHomeSurface({ laneOverride: "student", completedSessions: 3 });
    expect(studentSurface.rhythmLabel).toBe("Best study rhythm: mornings");
  });

  it("minimal_normal evidence: same body structure, different provenance", () => {
    const surface = deriveHomeSurface({ laneOverride: "minimal_normal", completedSessions: 4 });
    expect(surface.headline).toBe("One clean action");
    expect(surface.body).not.toContain("VEX will stay quiet");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Boundary & fallback
// ═══════════════════════════════════════════════════════════════════════

describe("deriveHomeSurface — edge cases", () => {
  it("falls back to minimal_normal for invalid laneOverride", () => {
    const surface = deriveHomeSurface({ laneOverride: "invalid_lane" as unknown as Lane });
    expect(surface.lane).toBe("minimal_normal");
  });

  it("falls back to minimal_normal for null laneOverride", () => {
    const surface = deriveHomeSurface({ laneOverride: null });
    expect(surface.lane).toBe("minimal_normal");
  });

  it("returns valid ModeHomeSurface for all lanes", () => {
    for (const lane of ALL_LANES) {
      const surface = deriveHomeSurface({ laneOverride: lane, completedSessions: 5 });
      const result = ModeHomeSurfaceSchema.safeParse(surface);
      expect(result.success).toBe(true);
    }
  });

  it("returns valid ModeHomeSurface for all lanes in cold-start", () => {
    for (const lane of ALL_LANES) {
      const surface = deriveHomeSurface({ laneOverride: lane, completedSessions: 0 });
      const result = ModeHomeSurfaceSchema.safeParse(surface);
      expect(result.success).toBe(true);
    }
  });
});
