/**
 * Mode-Native Comprehensive Tests
 *
 * Covers: schemas, service (deriveHomeSurface, deriveQuickContract,
 * deriveActiveIndicator, deriveRescueSurface), service-surface
 * (deriveCompletionSurface, deriveWeeklyIntelligence), copy objects,
 * and index exports.
 *
 * Source: 14 files, ~1438 lines
 */

import { describe, it, expect } from "@jest/globals";

// ── Service functions ─────────────────────────────────────────────────
import {
  deriveHomeSurface,
  deriveQuickContract,
  deriveActiveIndicator,
  deriveRescueSurface,
} from "../service";
import type { HomeContext } from "../service";

// ── Service-surface functions ─────────────────────────────────────────
import {
  deriveCompletionSurface,
  deriveWeeklyIntelligence,
} from "../service-surface";
import type { CompletionContext, WeeklyIntelligenceContext } from "../service-surface";

// ── Schemas ───────────────────────────────────────────────────────────
import {
  SurfaceIdSchema,
  PrimaryActionSchema,
  ModeHomeSurfaceSchema,
  QuickContractQuestionSchema,
  ModeQuickContractSchema,
  ModeActiveIndicatorSchema,
  ModeCompletionSurfaceSchema,
  ModeRescueSurfaceSchema,
  ModeWeeklyIntelligenceSchema,
} from "../schemas";

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
// 1. COPY OBJECTS — complete coverage
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
      expect(WEEKLY_INTELLIGENCE_COPY.minimal_normal.primaryMetricValue).toContain("{duration}");
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. SCHEMAS — exhaustive boundary tests
// ═══════════════════════════════════════════════════════════════════════

describe("Schema boundary tests", () => {
  describe("ModeHomeSurfaceSchema", () => {
    it("rejects extra fields (strict mode)", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 20,
        secondaryHint: null,
        rhythmLabel: null,
        extraField: "not allowed",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty string for primaryFeeling", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 20,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });

    it("accepts max duration of 120", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 120,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects duration of 121", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 121,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeQuickContractSchema", () => {
    it("rejects more than 3 questions", () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: "student",
        title: "Test",
        questions: [
          { key: "a", label: "A", placeholder: "a" },
          { key: "b", label: "B", placeholder: "b" },
          { key: "c", label: "C", placeholder: "c" },
          { key: "d", label: "D", placeholder: "d" },
        ],
        durationLabel: "Duration",
        suggestedDurationMinutes: 20,
        startLabel: "Start",
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeRescueSurfaceSchema", () => {
    it("accepts exact min duration of 3", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 3,
        actionLabel: "Start",
      });
      expect(result.success).toBe(true);
    });

    it("accepts exact max duration of 15", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 15,
        actionLabel: "Start",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ModeActiveIndicatorSchema", () => {
    it("accepts all valid density values", () => {
      for (const density of ["low", "medium", "medium_high"]) {
        const result = ModeActiveIndicatorSchema.safeParse({
          lane: "student",
          targetLabel: "Test",
          topLine: "Test",
          showProgressBar: true,
          showCompanion: false,
          allowNotes: false,
          density,
          quiet: true,
        });
        expect(result.success).toBe(true);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. SERVICE: deriveCompletionSurface
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
      weakTopicCount: 1,
    });
    expect(surface.body).toContain("1 topic may need review");
    expect(surface.insightLabel).toContain("1 weak area");
  });

  it("enriches student body with weakTopicCount (plural)", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "student",
      topic: "math",
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
      cleanStarts: 3,
    });
    expect(surface.body).toContain("3 clean starts confirmed");
  });

  it("enriches game_like body with blocker signal", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "ship feature",
      blockerDetected: true,
    });
    expect(surface.body).toContain("blocker signal saved");
    expect(surface.insightLabel).toContain("Blocker patterns");
  });

  it("enriches game_like body with recovery win", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "game_like",
      task: "ship feature",
      recoveryWin: true,
    });
    expect(surface.body).toContain("recovery win");
    expect(surface.insightLabel).toContain("Recovery runs");
  });

  it("enriches deep_creative body with handoffSaved", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX",
      handoffSaved: true,
    });
    expect(surface.body).toContain("Handoff note saved");
    expect(surface.insightLabel).toContain("Next move is locked");
  });

  it("enriches deep_creative body with staleRisk", () => {
    const surface = deriveCompletionSurface({
      laneOverride: "deep_creative",
      project: "VEX",
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

// ═══════════════════════════════════════════════════════════════════════
// 4. SERVICE: deriveWeeklyIntelligence
// ═══════════════════════════════════════════════════════════════════════

describe("deriveWeeklyIntelligence", () => {
  it("returns default minimal_normal intelligence for empty context", () => {
    const intel = deriveWeeklyIntelligence({});
    expect(intel.lane).toBe("minimal_normal");
    expect(intel.headline).toBe("Clean week in review");
  });

  it("fills template with completedSessions and totalSessions", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      completedSessions: 3,
      totalSessions: 5,
    });
    expect(intel.primaryMetricValue).toBe("3 of 5 blocks held");
  });

  it("fills template with cleanStarts for game_like", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      cleanStarts: 7,
    });
    expect(intel.primaryMetricValue).toBe("7 clean starts this week");
  });

  it("fills template with duration for minimal_normal", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "minimal_normal",
      duration: 25,
    });
    expect(intel.primaryMetricValue).toContain("25-minute");
  });

  it("enriches student adjustment with reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      reviewItemsDue: 3,
    });
    expect(intel.adjustment).toContain("3 review items waiting");
  });

  it("enriches student adjustment with singular reviewItemsDue", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "student",
      reviewItemsDue: 1,
    });
    expect(intel.adjustment).toContain("1 review item waiting");
  });

  it("enriches game_like adjustment with blockerPatternsFound", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "game_like",
      blockerPatternsFound: 2,
    });
    expect(intel.adjustment).toContain("2 blocker patterns surfaced");
  });

  it("enriches deep_creative with stale projects", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 2,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain("2 projects went stale");
  });

  it("enriches deep_creative with active projects (no stale)", () => {
    const intel = deriveWeeklyIntelligence({
      laneOverride: "deep_creative",
      staleProjects: 0,
      activeProjects: 3,
    });
    expect(intel.adjustment).toContain("3 active projects");
    expect(intel.adjustment).toContain("Continuity is holding");
  });

  it("returns valid schema output for all lanes", () => {
    for (const lane of ALL_LANES) {
      const intel = deriveWeeklyIntelligence({ laneOverride: lane });
      expect(ModeWeeklyIntelligenceSchema.safeParse(intel).success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 5. INDEX EXPORTS
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native index exports", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const indexExports = require("../index");

  it("exports all service functions", () => {
    expect(typeof indexExports.deriveHomeSurface).toBe("function");
    expect(typeof indexExports.deriveQuickContract).toBe("function");
    expect(typeof indexExports.deriveActiveIndicator).toBe("function");
    expect(typeof indexExports.deriveRescueSurface).toBe("function");
    expect(typeof indexExports.deriveCompletionSurface).toBe("function");
    expect(typeof indexExports.deriveWeeklyIntelligence).toBe("function");
  });

  it("exports all schemas", () => {
    expect(indexExports.SurfaceIdSchema).toBeDefined();
    expect(indexExports.ModeHomeSurfaceSchema).toBeDefined();
    expect(indexExports.ModeQuickContractSchema).toBeDefined();
    expect(indexExports.ModeActiveIndicatorSchema).toBeDefined();
    expect(indexExports.ModeCompletionSurfaceSchema).toBeDefined();
    expect(indexExports.ModeRescueSurfaceSchema).toBeDefined();
    expect(indexExports.ModeWeeklyIntelligenceSchema).toBeDefined();
  });

  it("exports all copy objects", () => {
    expect(indexExports.HOME_COPY).toBeDefined();
    expect(indexExports.QUICK_CONTRACT_COPY).toBeDefined();
    expect(indexExports.ACTIVE_INDICATOR_COPY).toBeDefined();
    expect(indexExports.COMPLETION_COPY).toBeDefined();
    expect(indexExports.RESCUE_COPY).toBeDefined();
    expect(indexExports.WEEKLY_INTELLIGENCE_COPY).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. CONSISTENCY: copy entries validate through schemas
// ═══════════════════════════════════════════════════════════════════════

describe("Copy-to-schema consistency", () => {
  it("all HOME_COPY entries pass ModeHomeSurfaceSchema when combined with lane", () => {
    for (const lane of ALL_LANES) {
      const result = ModeHomeSurfaceSchema.safeParse({ ...HOME_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all QUICK_CONTRACT_COPY entries pass ModeQuickContractSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeQuickContractSchema.safeParse({ ...QUICK_CONTRACT_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all ACTIVE_INDICATOR_COPY entries pass ModeActiveIndicatorSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeActiveIndicatorSchema.safeParse({ ...ACTIVE_INDICATOR_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all RESCUE_COPY entries pass ModeRescueSurfaceSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeRescueSurfaceSchema.safeParse({ ...RESCUE_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });

  it("all WEEKLY_INTELLIGENCE_COPY entries pass ModeWeeklyIntelligenceSchema", () => {
    for (const lane of ALL_LANES) {
      const result = ModeWeeklyIntelligenceSchema.safeParse({ ...WEEKLY_INTELLIGENCE_COPY[lane], lane });
      expect(result.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 7. EDGE CASES
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
