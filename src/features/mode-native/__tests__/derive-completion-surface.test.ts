/**
 * Tests for deriveCompletionSurface from service-surface.ts
 */

import { describe, it, expect } from "@jest/globals";

import { deriveCompletionSurface } from "../service-surface";
import { ModeCompletionSurfaceSchema } from "../schemas";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE-SURFACE: deriveCompletionSurface
// ═══════════════════════════════════════════════════════════════════════

describe("deriveCompletionSurface", () => {
  it("returns student completion with default template fill", () => {
    const surface = deriveCompletionSurface({ laneOverride: "student" });
    expect(surface.lane).toBe("student");
    expect(surface.headline).toBe("Study block done");
    expect(surface.body).toContain("your material");
    expect(surface.showRewards).toBe(false);
    expect(surface.showXp).toBe(false);
  });

  it("fills topic template for student lane", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Graph traversal",
    });
    expect(surface.body).toContain("Graph traversal");
    expect(surface.body).not.toContain("{topic}");
  });

  it("fills task template for game_like lane", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship the onboarding flow",
    });
    expect(surface.body).toContain("Ship the onboarding flow");
  });

  it("fills project template for deep_creative lane", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX redesign",
    });
    expect(surface.body).toContain("VEX redesign");
  });

  it("fills action template for minimal_normal lane", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "minimal_normal",
      action: "Clear inbox",
    });
    expect(surface.body).toContain("Clear inbox");
  });

  it("enriches student body with singular weakTopicCount", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Algorithms",
      weakTopicCount: 1,
    });
    expect(surface.body).toContain("1 topic may need review.");
    expect(surface.insightLabel).toBe("VEX found 1 weak area");
  });

  it("enriches student body with plural weakTopicCount", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Algorithms",
      weakTopicCount: 3,
    });
    expect(surface.body).toContain("3 topics may need review.");
    expect(surface.insightLabel).toBe("VEX found 3 weak areas");
  });

  it("does not enrich student body when weakTopicCount is 0", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "Algorithms",
      weakTopicCount: 0,
    });
    expect(surface.body).not.toContain("may need review");
    expect(surface.insightLabel).toBe("VEX tracked your weak spots for next block");
  });

  it("enriches game_like body with clean starts", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship feature",
      cleanStarts: 3,
    });
    expect(surface.body).toContain("3 clean starts confirmed");
    expect(surface.insightLabel).toBe("Clean starts are your strongest pattern");
  });

  it("enriches game_like body with singular clean start", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship feature",
      cleanStarts: 1,
    });
    expect(surface.body).toContain("1 clean start confirmed");
  });

  it("enriches game_like body with blockerDetected", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship feature",
      blockerDetected: true,
    });
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.insightLabel).toBe("Blocker patterns tracked for next run");
  });

  it("enriches game_like body with recoveryWin", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship feature",
      recoveryWin: true,
    });
    expect(surface.body).toContain("recovery win");
    expect(surface.insightLabel).toBe("Recovery runs build durable momentum");
  });

  it("enriches game_like body with all signals combined", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "Ship feature",
      cleanStarts: 2,
      blockerDetected: true,
      recoveryWin: true,
    });
    expect(surface.body).toContain("2 clean starts confirmed");
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.body).toContain("recovery win");
  });

  it("enriches deep_creative body with handoffSaved", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX redesign",
      handoffSaved: true,
    });
    expect(surface.body).toContain("Handoff note saved.");
    expect(surface.insightLabel).toBe("Next move is locked for tomorrow");
  });

  it("enriches deep_creative body with stale risk", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX redesign",
      staleRisk: "high",
    });
    expect(surface.body).toContain("Thread at high risk of going stale — protect it soon.");
  });

  it("does not append stale risk when it is none", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX redesign",
      staleRisk: "none",
    });
    expect(surface.body).not.toContain("risk of going stale");
  });

  it("enriches deep_creative body with both handoffSaved and staleRisk", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX redesign",
      handoffSaved: true,
      staleRisk: "medium",
    });
    expect(surface.body).toContain("Handoff note saved.");
    expect(surface.body).toContain("medium risk of going stale");
  });

  it("returns default minimal_normal completion surface", () => {
    const surface = deriveCompletionSurface({});
    expect(surface.lane).toBe("minimal_normal");
    expect(surface.headline).toBe("Done");
    expect(surface.insightLabel).toBeNull();
  });

  it("returns valid ModeCompletionSurface for all lanes", () => {
    for (const lane of ALL_LANES) {
      const surface = deriveCompletionSurface({ laneOverride: lane });
      const result = ModeCompletionSurfaceSchema.safeParse(surface);
      expect(result.success).toBe(true);
    }
  });
});
