/**
 * Mode-Native Comprehensive Tests — deriveCompletionSurface
 *
 * Covers: deriveCompletionSurface service function with all lane
 * enrichment paths, template filling, and schema validation.
 */

import { describe, it, expect } from "@jest/globals";

// ── Service-surface functions ─────────────────────────────────────────
import { deriveCompletionSurface } from "../service-surface";

// ── Schemas ───────────────────────────────────────────────────────────
import { ModeCompletionSurfaceSchema } from "../schemas";

// ── Lane types ────────────────────────────────────────────────────────
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveCompletionSurface
// ═══════════════════════════════════════════════════════════════════════

describe("deriveCompletionSurface", () => {
  it("returns default completion surface for empty context", () => {
    const surface = deriveCompletionSurface({});
    expect(surface.lane).toBe("minimal_normal");
    expect(surface.headline).toBe("Done");
    expect(surface.showRewards).toBe(false);
  });

  it("fills template placeholders with context values", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "algorithms",
    });
    expect(surface.body).toContain("algorithms");
    expect(surface.body).not.toContain("{topic}");
  });

  it("uses default placeholder text when context is missing", () => {
    const surface = deriveCompletionSurface({ laneOverride: "student" });
    expect(surface.body).toContain("your material");
  });

  it("enriches student body with weakTopicCount (singular)", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "math",
      completedSessions: 5,
      weakTopicCount: 1,
    });
    expect(surface.body).toContain("1 topic may need review");
    expect(surface.insightLabel).toContain("1 weak area");
  });

  it("enriches student body with weakTopicCount (plural)", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "math",
      completedSessions: 5,
      weakTopicCount: 5,
    });
    expect(surface.body).toContain("5 topics may need review");
    expect(surface.insightLabel).toContain("5 weak areas");
  });

  it("does not enrich student body when weakTopicCount is 0", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "math",
      weakTopicCount: 0,
    });
    expect(surface.body).not.toContain("may need review");
  });

  it("enriches game_like body with clean starts", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "ship feature",
      completedSessions: 5,
      cleanStarts: 3,
    });
    expect(surface.body).toContain("3 clean starts confirmed");
  });

  it("enriches game_like body with blocker signal", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "ship feature",
      completedSessions: 5,
      blockerDetected: true,
    });
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.insightLabel).toContain("Blocker patterns");
  });

  it("enriches game_like body with recovery win", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "ship feature",
      completedSessions: 5,
      recoveryWin: true,
    });
    expect(surface.body).toContain("recovery win");
    expect(surface.insightLabel).toContain("Recovery runs");
  });

  it("enriches deep_creative body with handoffSaved", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX",
      completedSessions: 5,
      handoffSaved: true,
    });
    expect(surface.body).toContain("Handoff note saved");
    expect(surface.insightLabel).toContain("Next move is locked");
  });

  it("enriches deep_creative body with staleRisk", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX",
      completedSessions: 5,
      staleRisk: "high",
    });
    expect(surface.body).toContain("high risk of going stale");
  });

  it("does not add stale risk when staleRisk is none", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX",
      staleRisk: "none",
    });
    expect(surface.body).not.toContain("risk of going stale");
  });

  it("returns valid schema output for all lanes", () => {
    for (const lane of ALL_LANES) {
      const surface = deriveCompletionSurface({ laneOverride: lane });
      expect(ModeCompletionSurfaceSchema.safeParse(surface).success).toBe(true);
    }
  });
});
