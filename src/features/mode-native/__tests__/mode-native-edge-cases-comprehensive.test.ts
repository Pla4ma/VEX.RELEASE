/**
 * Mode-Native Comprehensive Tests — Edge Cases
 *
 * Covers: deriveHomeSurface with full context, deriveCompletionSurface
 * with all fields, deriveWeeklyIntelligence with zero values,
 * SurfaceIdSchema and PrimaryActionSchema exhaustive coverage.
 */

import { describe, it, expect } from "@jest/globals";

// ── Service functions ─────────────────────────────────────────────────
import { deriveHomeSurface } from "../service";
import type { HomeContext } from "../service";

// ── Service-surface functions ─────────────────────────────────────────
import { deriveCompletionSurface, deriveWeeklyIntelligence } from "../service-surface";
import type { CompletionContext } from "../service-surface";

// ── Schemas ───────────────────────────────────────────────────────────
import {
  SurfaceIdSchema,
  PrimaryActionSchema,
  ModeHomeSurfaceSchema,
} from "../schemas";

// ═══════════════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════════════

describe("Edge cases", () => {
  it("deriveHomeSurface with all context fields populated", () => {
    const ctx: HomeContext = {
      laneOverride: "student",
      hasActiveProject: true,
      projectTitle: "VEX",
      nextMove: "Write tests",
      recentTopic: "Algorithms",
      weakTopicCount: 2,
      cleanStartsThisWeek: 5,
    };
    const surface = deriveHomeSurface(ctx);
    expect(surface.lane).toBe("student");
    expect(ModeHomeSurfaceSchema.safeParse(surface).success).toBe(true);
  });

  it("deriveCompletionSurface with all fields populated for game_like", () => {
    const ctx: CompletionContext = {
      laneOverride: "game_like",
      task: "ship feature",
      completedSessions: 5,
      cleanStarts: 3,
      blockerDetected: true,
      recoveryWin: true,
    };
    const surface = deriveCompletionSurface(ctx);
    expect(surface.lane).toBe("game_like");
    expect(surface.body).toContain("3 clean starts");
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.body).toContain("recovery win");
  });

  it("deriveWeeklyIntelligence with zero values uses defaults", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      completedSessions: 0,
      totalSessions: 0,
      cleanStarts: 0,
    });
    expect(intel.primaryMetricValue).toBe("0 clean starts this week");
  });

  it("SurfaceIdSchema accepts all 9 surface IDs", () => {
    const ids = [
      "home", "quick_contract", "active_session", "pause",
      "completion", "rescue", "day3_memory", "weekly_intelligence", "premium_trigger",
    ];
    expect(ids).toHaveLength(9);
    for (const id of ids) {
      expect(SurfaceIdSchema.safeParse(id).success).toBe(true);
    }
  });

  it("PrimaryActionSchema accepts all 8 actions", () => {
    const actions = [
      "start_session", "resume_project", "review_weak_topics",
      "start_study_block", "start_clean_run", "start_project_block",
      "re_enter_project", "do_mini_session",
    ];
    expect(actions).toHaveLength(8);
    for (const action of actions) {
      expect(PrimaryActionSchema.safeParse(action).success).toBe(true);
    }
  });
});
