/**
 * Tests for deriveHomeSurface from service.ts
 */

import { describe, it, expect } from "@jest/globals";

import { deriveHomeSurface } from "../service";
import { ModeHomeSurfaceSchema } from "../schemas";
import type { Lane } from "../../lane-engine/types";

const ALL_LANES: Lane[] = ["student", "game_like", "deep_creative", "minimal_normal"];

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveHomeSurface
// ═══════════════════════════════════════════════════════════════════════

describe("deriveHomeSurface", () => {
  it("returns default minimal_normal surface with empty context", () => {
    const surface = deriveHomeSurface({});
    expect(surface.lane).toBe("minimal_normal");
    expect(surface.headline).toBe("One clean action");
    expect(surface.primaryAction).toBe("start_session");
    expect(surface.suggestedDurationMinutes).toBe(15);
  });

  it("returns student surface when laneOverride is student", () => {
    const surface = deriveHomeSurface({ laneOverride: "student" });
    expect(surface.lane).toBe("student");
    expect(surface.headline).toBe("Your next study block is ready");
    expect(surface.primaryAction).toBe("start_study_block");
    expect(surface.suggestedDurationMinutes).toBe(20);
  });

  it("returns game_like surface when laneOverride is game_like", () => {
    const surface = deriveHomeSurface({ laneOverride: "game_like" });
    expect(surface.lane).toBe("game_like");
    expect(surface.headline).toBe("Start a clean run");
    expect(surface.primaryAction).toBe("start_clean_run");
  });

  it("returns deep_creative surface when laneOverride is deep_creative", () => {
    const surface = deriveHomeSurface({ laneOverride: "deep_creative" });
    expect(surface.lane).toBe("deep_creative");
    expect(surface.headline).toBe("Your project is waiting");
    expect(surface.primaryAction).toBe("resume_project");
  });

  it("falls back to minimal_normal for invalid laneOverride", () => {
    const surface = deriveHomeSurface({ laneOverride: "invalid_lane" as unknown as Lane });
    expect(surface.lane).toBe("minimal_normal");
  });

  it("falls back to minimal_normal for null laneOverride", () => {
    const surface = deriveHomeSurface({ laneOverride: null });
    expect(surface.lane).toBe("minimal_normal");
  });

  it("returns default body for deep_creative without active project", () => {
    const surface = deriveHomeSurface({ laneOverride: "deep_creative" });
    expect(surface.body).toBe("Pick up right where you stopped. The next move is already saved — just resume.");
  });

  it("enriches deep_creative body when hasActiveProject and nextMove present", () => {
    const surface = deriveHomeSurface({
      laneOverride: "deep_creative",
      hasActiveProject: true,
      nextMove: "Write the welcome screen",
    });
    expect(surface.body).toBe("Next move: Write the welcome screen. Pick up where you stopped.");
  });

  it("returns default student body when no recentTopic", () => {
    const surface = deriveHomeSurface({ laneOverride: "student" });
    expect(surface.body).toContain("Review the topic that needs the most attention");
  });

  it("enriches student body with recentTopic only (no weak topics)", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
    });
    expect(surface.body).toBe('Your next study block: "Graph algorithms" for 20 minutes.');
  });

  it("enriches student body with recentTopic and singular weak topic count", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
      weakTopicCount: 1,
    });
    expect(surface.body).toBe('Review "Graph algorithms" — 1 topic needs attention. 20 minutes.');
  });

  it("enriches student body with recentTopic and plural weak topic count", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
      weakTopicCount: 3,
    });
    expect(surface.body).toBe('Review "Graph algorithms" — 3 topics need attention. 20 minutes.');
  });

  it("ignores weakTopicCount when it is 0", () => {
    const surface = deriveHomeSurface({
      laneOverride: "student",
      recentTopic: "Graph algorithms",
      weakTopicCount: 0,
    });
    expect(surface.body).toBe('Your next study block: "Graph algorithms" for 20 minutes.');
  });

  it("enriches game_like body with cleanStartsThisWeek (singular)", () => {
    const surface = deriveHomeSurface({
      laneOverride: "game_like",
      cleanStartsThisWeek: 1,
    });
    expect(surface.body).toBe("1 clean start this week. Keep the momentum going.");
  });

  it("enriches game_like body with cleanStartsThisWeek (plural)", () => {
    const surface = deriveHomeSurface({
      laneOverride: "game_like",
      cleanStartsThisWeek: 5,
    });
    expect(surface.body).toBe("5 clean starts this week. Keep the momentum going.");
  });

  it("returns default game_like body when cleanStartsThisWeek is 0", () => {
    const surface = deriveHomeSurface({
      laneOverride: "game_like",
      cleanStartsThisWeek: 0,
    });
    expect(surface.body).toBe("Your best momentum comes from naming the task first. No boss today — just forward motion.");
  });

  it("returns valid ModeHomeSurface for all lanes", () => {
    for (const lane of ALL_LANES) {
      const surface = deriveHomeSurface({ laneOverride: lane });
      const result = ModeHomeSurfaceSchema.safeParse(surface);
      expect(result.success).toBe(true);
    }
  });
});
