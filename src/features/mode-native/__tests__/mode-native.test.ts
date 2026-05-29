/**
 * Comprehensive tests for mode-native feature
 *
 * Covers: service.ts, service-surface.ts, schemas.ts, copy, hooks
 * 14 source files, ~1438 lines — targeting all exported functions, schemas, and copy objects.
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
// SCHEMA TESTS
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native schemas", () => {
  describe("SurfaceIdSchema", () => {
    it("accepts all valid surface IDs", () => {
      const validIds = [
        "home", "quick_contract", "active_session", "pause",
        "completion", "rescue", "day3_memory", "weekly_intelligence", "premium_trigger",
      ];
      for (const id of validIds) {
        expect(SurfaceIdSchema.safeParse(id).success).toBe(true);
      }
    });

    it("rejects an invalid surface ID", () => {
      expect(SurfaceIdSchema.safeParse("invalid_surface").success).toBe(false);
    });
  });

  describe("PrimaryActionSchema", () => {
    it("accepts all valid primary actions", () => {
      const validActions = [
        "start_session", "resume_project", "review_weak_topics",
        "start_study_block", "start_clean_run", "start_project_block",
        "re_enter_project", "do_mini_session",
      ];
      for (const action of validActions) {
        expect(PrimaryActionSchema.safeParse(action).success).toBe(true);
      }
    });

    it("rejects an invalid primary action", () => {
      expect(PrimaryActionSchema.safeParse("do_something_else").success).toBe(false);
    });
  });

  describe("ModeHomeSurfaceSchema", () => {
    it("parses a valid home surface object", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test feeling",
        headline: "Test headline",
        body: "Test body",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start study block",
        suggestedDurationMinutes: 20,
        secondaryHint: "Test hint",
        rhythmLabel: "Morning rhythm",
      });
      expect(result.success).toBe(true);
    });

    it("rejects home surface with missing required fields", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
      });
      expect(result.success).toBe(false);
    });

    it("rejects home surface with duration out of range", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "student",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_study_block",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 2, // below min of 5
        secondaryHint: "hint",
        rhythmLabel: null,
      });
      expect(result.success).toBe(false);
    });

    it("accepts null for nullable fields", () => {
      const result = ModeHomeSurfaceSchema.safeParse({
        lane: "minimal_normal",
        primaryFeeling: "Test",
        headline: "Test",
        body: "Test",
        primaryAction: "start_session",
        primaryActionLabel: "Start",
        suggestedDurationMinutes: 15,
        secondaryHint: null,
        rhythmLabel: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("QuickContractQuestionSchema", () => {
    it("parses a valid question", () => {
      const result = QuickContractQuestionSchema.safeParse({
        key: "topic",
        label: "What are you studying?",
        placeholder: "e.g. Graph traversal",
      });
      expect(result.success).toBe(true);
    });

    it("rejects a question with empty key", () => {
      const result = QuickContractQuestionSchema.safeParse({
        key: "",
        label: "Question?",
        placeholder: "placeholder",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeQuickContractSchema", () => {
    it("parses a valid quick contract", () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: "student",
        title: "Quick contract: Study",
        questions: [
          { key: "topic", label: "What?", placeholder: "e.g. Math" },
        ],
        durationLabel: "Study for",
        suggestedDurationMinutes: 20,
        startLabel: "Start study block",
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(true);
    });

    it("rejects quick contract with zero questions", () => {
      const result = ModeQuickContractSchema.safeParse({
        lane: "student",
        title: "Test",
        questions: [],
        durationLabel: "Duration",
        suggestedDurationMinutes: 20,
        startLabel: "Start",
        showAdvancedSettings: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeActiveIndicatorSchema", () => {
    it("parses a valid active indicator", () => {
      const result = ModeActiveIndicatorSchema.safeParse({
        lane: "student",
        targetLabel: "Studying",
        topLine: "Stay focused",
        showProgressBar: true,
        showCompanion: false,
        allowNotes: true,
        density: "medium",
        quiet: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid density value", () => {
      const result = ModeActiveIndicatorSchema.safeParse({
        lane: "student",
        targetLabel: "Test",
        topLine: "Test",
        showProgressBar: true,
        showCompanion: false,
        allowNotes: true,
        density: "ultra_high",
        quiet: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeCompletionSurfaceSchema", () => {
    it("parses a valid completion surface", () => {
      const result = ModeCompletionSurfaceSchema.safeParse({
        lane: "student",
        headline: "Study block done",
        body: "You studied algorithms.",
        primaryActionLabel: "Mark what needs review",
        secondaryHint: "Next: recall key ideas",
        insightLabel: "VEX tracked your weak spots",
        showRewards: false,
        showStreak: false,
        showXp: false,
      });
      expect(result.success).toBe(true);
    });

    it("accepts null for nullable fields", () => {
      const result = ModeCompletionSurfaceSchema.safeParse({
        lane: "minimal_normal",
        headline: "Done",
        body: "Complete.",
        primaryActionLabel: "Close",
        secondaryHint: null,
        insightLabel: null,
        showRewards: false,
        showStreak: false,
        showXp: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ModeRescueSurfaceSchema", () => {
    it("parses a valid rescue surface", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Review one weak section",
        body: "Just open your notes.",
        suggestedDurationMinutes: 8,
        actionLabel: "Start review",
      });
      expect(result.success).toBe(true);
    });

    it("rejects rescue surface with duration below minimum", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 2, // below min of 3
        actionLabel: "Start",
      });
      expect(result.success).toBe(false);
    });

    it("rejects rescue surface with duration above maximum", () => {
      const result = ModeRescueSurfaceSchema.safeParse({
        lane: "student",
        headline: "Test",
        body: "Test",
        suggestedDurationMinutes: 20, // above max of 15
        actionLabel: "Start",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ModeWeeklyIntelligenceSchema", () => {
    it("parses a valid weekly intelligence", () => {
      const result = ModeWeeklyIntelligenceSchema.safeParse({
        lane: "student",
        headline: "Study week in review",
        body: "Your study rhythm is forming.",
        primaryMetric: "Review consistency",
        primaryMetricValue: "3 of 5 blocks held",
        adjustment: "Start by naming the topic.",
        nextSessionType: "Study block",
      });
      expect(result.success).toBe(true);
    });

    it("accepts null for nullable nextSessionType", () => {
      const result = ModeWeeklyIntelligenceSchema.safeParse({
        lane: "minimal_normal",
        headline: "Test",
        body: "Test",
        primaryMetric: "Metric",
        primaryMetricValue: "Value",
        adjustment: "Adjustment",
        nextSessionType: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

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

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveQuickContract
// ═══════════════════════════════════════════════════════════════════════

describe("deriveQuickContract", () => {
  it("returns student contract when lane is student", () => {
    const contract = deriveQuickContract("student");
    expect(contract.lane).toBe("student");
    expect(contract.title).toBe("Quick contract: Study");
    expect(contract.questions).toHaveLength(2);
    expect(contract.questions[0].key).toBe("topic");
    expect(contract.suggestedDurationMinutes).toBe(20);
    expect(contract.startLabel).toBe("Start study block");
  });

  it("returns game_like contract", () => {
    const contract = deriveQuickContract("game_like");
    expect(contract.lane).toBe("game_like");
    expect(contract.title).toBe("Quick contract: Run");
    expect(contract.startLabel).toBe("Start run");
  });

  it("returns deep_creative contract", () => {
    const contract = deriveQuickContract("deep_creative");
    expect(contract.lane).toBe("deep_creative");
    expect(contract.title).toBe("Quick contract: Project");
    expect(contract.startLabel).toBe("Start project block");
  });

  it("returns minimal_normal contract with 1 question", () => {
    const contract = deriveQuickContract("minimal_normal");
    expect(contract.lane).toBe("minimal_normal");
    expect(contract.title).toBe("Quick contract: Clean");
    expect(contract.questions).toHaveLength(1);
    expect(contract.questions[0].key).toBe("action");
    expect(contract.suggestedDurationMinutes).toBe(15);
  });

  it("falls back to minimal_normal for null lane", () => {
    const contract = deriveQuickContract(null);
    expect(contract.lane).toBe("minimal_normal");
  });

  it("falls back to minimal_normal for undefined lane", () => {
    const contract = deriveQuickContract(undefined);
    expect(contract.lane).toBe("minimal_normal");
  });

  it("falls back to minimal_normal for invalid lane", () => {
    const contract = deriveQuickContract("invalid" as unknown as Lane);
    expect(contract.lane).toBe("minimal_normal");
  });

  it("returns valid ModeQuickContract for all lanes", () => {
    for (const lane of ALL_LANES) {
      const contract = deriveQuickContract(lane);
      const result = ModeQuickContractSchema.safeParse(contract);
      expect(result.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveActiveIndicator
// ═══════════════════════════════════════════════════════════════════════

describe("deriveActiveIndicator", () => {
  it("returns student indicator", () => {
    const indicator = deriveActiveIndicator("student");
    expect(indicator.lane).toBe("student");
    expect(indicator.targetLabel).toBe("Studying");
    expect(indicator.topLine).toBe("Stay focused on the material");
    expect(indicator.density).toBe("medium");
    expect(indicator.quiet).toBe(true);
  });

  it("returns game_like indicator", () => {
    const indicator = deriveActiveIndicator("game_like");
    expect(indicator.targetLabel).toBe("Momentum");
    expect(indicator.topLine).toBe("Clean start — keep moving forward");
  });

  it("returns deep_creative indicator", () => {
    const indicator = deriveActiveIndicator("deep_creative");
    expect(indicator.targetLabel).toBe("Protecting");
    expect(indicator.allowNotes).toBe(true);
  });

  it("returns minimal_normal indicator with low density", () => {
    const indicator = deriveActiveIndicator("minimal_normal");
    expect(indicator.targetLabel).toBe("One action");
    expect(indicator.density).toBe("low");
    expect(indicator.allowNotes).toBe(false);
  });

  it("falls back to minimal_normal for null input", () => {
    const indicator = deriveActiveIndicator(null);
    expect(indicator.lane).toBe("minimal_normal");
  });

  it("returns valid ModeActiveIndicator for all lanes", () => {
    for (const lane of ALL_LANES) {
      const indicator = deriveActiveIndicator(lane);
      const result = ModeActiveIndicatorSchema.safeParse(indicator);
      expect(result.success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SERVICE: deriveRescueSurface
// ═══════════════════════════════════════════════════════════════════════

describe("deriveRescueSurface", () => {
  it("returns student rescue", () => {
    const rescue = deriveRescueSurface("student");
    expect(rescue.lane).toBe("student");
    expect(rescue.headline).toBe("Review one weak section for 8 minutes");
    expect(rescue.suggestedDurationMinutes).toBe(8);
    expect(rescue.actionLabel).toBe("Start review");
  });

  it("returns game_like rescue", () => {
    const rescue = deriveRescueSurface("game_like");
    expect(rescue.headline).toBe("Recovery run: 10 clean minutes");
    expect(rescue.suggestedDurationMinutes).toBe(10);
    expect(rescue.actionLabel).toBe("Start recovery run");
  });

  it("returns deep_creative rescue", () => {
    const rescue = deriveRescueSurface("deep_creative");
    expect(rescue.headline).toBe("Re-enter the project and find the next move");
    expect(rescue.suggestedDurationMinutes).toBe(7);
    expect(rescue.actionLabel).toBe("Re-enter project");
  });

  it("returns minimal_normal rescue with shortest duration", () => {
    const rescue = deriveRescueSurface("minimal_normal");
    expect(rescue.headline).toBe("Do 5 minutes. Stop cleanly.");
    expect(rescue.suggestedDurationMinutes).toBe(5);
    expect(rescue.actionLabel).toBe("Start");
  });

  it("falls back to minimal_normal for undefined input", () => {
    const rescue = deriveRescueSurface(undefined);
    expect(rescue.lane).toBe("minimal_normal");
  });

  it("returns valid ModeRescueSurface for all lanes", () => {
    for (const lane of ALL_LANES) {
      const rescue = deriveRescueSurface(lane);
      const result = ModeRescueSurfaceSchema.safeParse(rescue);
      expect(result.success).toBe(true);
    }
  });
});

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

// ═══════════════════════════════════════════════════════════════════════
// COPY INTEGRITY
// ═══════════════════════════════════════════════════════════════════════

describe("mode-native copy integrity", () => {
  it("HOME_COPY has an entry for every lane", () => {
    expect(Object.keys(HOME_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(HOME_COPY[lane]).toBeDefined();
    }
  });

  it("QUICK_CONTRACT_COPY has an entry for every lane", () => {
    expect(Object.keys(QUICK_CONTRACT_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(QUICK_CONTRACT_COPY[lane]).toBeDefined();
    }
  });

  it("ACTIVE_INDICATOR_COPY has an entry for every lane", () => {
    expect(Object.keys(ACTIVE_INDICATOR_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(ACTIVE_INDICATOR_COPY[lane]).toBeDefined();
    }
  });

  it("COMPLETION_COPY has an entry for every lane", () => {
    expect(Object.keys(COMPLETION_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(COMPLETION_COPY[lane]).toBeDefined();
    }
  });

  it("RESCUE_COPY has an entry for every lane", () => {
    expect(Object.keys(RESCUE_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(RESCUE_COPY[lane]).toBeDefined();
    }
  });

  it("WEEKLY_INTELLIGENCE_COPY has an entry for every lane", () => {
    expect(Object.keys(WEEKLY_INTELLIGENCE_COPY)).toHaveLength(4);
    for (const lane of ALL_LANES) {
      expect(WEEKLY_INTELLIGENCE_COPY[lane]).toBeDefined();
    }
  });

  it("no two HOME_COPY lanes share the same headline", () => {
    const headlines = Object.values(HOME_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("no two RESCUE_COPY lanes share the same headline", () => {
    const headlines = Object.values(RESCUE_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("no two COMPLETION_COPY lanes share the same headline", () => {
    const headlines = Object.values(COMPLETION_COPY).map((c) => c.headline);
    expect(new Set(headlines).size).toBe(headlines.length);
  });

  it("all RESCUE_COPY durations are within schema bounds (3–15 min)", () => {
    for (const lane of ALL_LANES) {
      const duration = RESCUE_COPY[lane].suggestedDurationMinutes;
      expect(duration).toBeGreaterThanOrEqual(3);
      expect(duration).toBeLessThanOrEqual(15);
    }
  });

  it("all HOME_COPY durations are within schema bounds (5–120 min)", () => {
    for (const lane of ALL_LANES) {
      const duration = HOME_COPY[lane].suggestedDurationMinutes;
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThanOrEqual(120);
    }
  });

  it("all QUICK_CONTRACT_COPY have at least 1 question", () => {
    for (const lane of ALL_LANES) {
      expect(QUICK_CONTRACT_COPY[lane].questions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("no copy uses shame-based language", () => {
    const allCopy = JSON.stringify([
      HOME_COPY, QUICK_CONTRACT_COPY, ACTIVE_INDICATOR_COPY,
      COMPLETION_COPY, RESCUE_COPY, WEEKLY_INTELLIGENCE_COPY,
    ]);
    expect(allCopy).not.toMatch(/fail|missed|behind|should have|lazy|stupid/i);
  });

  it("no copy uses gamification reward language", () => {
    // Concatenate all text fields individually for precise matching
    const allTexts: string[] = [];
    for (const copyObj of [HOME_COPY, QUICK_CONTRACT_COPY, ACTIVE_INDICATOR_COPY, COMPLETION_COPY, RESCUE_COPY, WEEKLY_INTELLIGENCE_COPY]) {
      for (const entry of Object.values(copyObj)) {
        for (const value of Object.values(entry)) {
          if (typeof value === "string") allTexts.push(value);
        }
      }
    }
    const banned = /battle|coin|gem|reward.?chest|defeat|loot/i;
    // "boss" is allowed only in the anti-gamification phrase "No boss today"
    for (const text of allTexts) {
      expect(text).not.toMatch(banned);
      if (/\bboss\b/i.test(text)) {
        expect(text).toMatch(/no boss/i);
      }
    }
  });

  it("every ACTIVE_INDICATOR_COPY entry has quiet: true", () => {
    for (const lane of ALL_LANES) {
      expect(ACTIVE_INDICATOR_COPY[lane].quiet).toBe(true);
    }
  });

  it("every COMPLETION_COPY entry has showRewards: false", () => {
    for (const lane of ALL_LANES) {
      expect(COMPLETION_COPY[lane].showRewards).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CROSS-CUTTING: lane resolution consistency
// ═══════════════════════════════════════════════════════════════════════

describe("lane resolution consistency across service functions", () => {
  it("all service functions resolve the same lane for valid input", () => {
    for (const lane of ALL_LANES) {
      expect(deriveHomeSurface({ laneOverride: lane }).lane).toBe(lane);
      expect(deriveQuickContract(lane).lane).toBe(lane);
      expect(deriveActiveIndicator(lane).lane).toBe(lane);
      expect(deriveRescueSurface(lane).lane).toBe(lane);
      expect(deriveCompletionSurface({ laneOverride: lane }).lane).toBe(lane);
      expect(deriveWeeklyIntelligence({ laneOverride: lane }).lane).toBe(lane);
    }
  });

  it("all service functions fall back to minimal_normal for null", () => {
    expect(deriveHomeSurface({ laneOverride: null }).lane).toBe("minimal_normal");
    expect(deriveQuickContract(null).lane).toBe("minimal_normal");
    expect(deriveActiveIndicator(null).lane).toBe("minimal_normal");
    expect(deriveRescueSurface(null).lane).toBe("minimal_normal");
    expect(deriveCompletionSurface({ laneOverride: null }).lane).toBe("minimal_normal");
    expect(deriveWeeklyIntelligence({ laneOverride: null }).lane).toBe("minimal_normal");
  });

  it("all service functions fall back to minimal_normal for undefined", () => {
    expect(deriveHomeSurface({}).lane).toBe("minimal_normal");
    expect(deriveQuickContract(undefined).lane).toBe("minimal_normal");
    expect(deriveActiveIndicator(undefined).lane).toBe("minimal_normal");
    expect(deriveRescueSurface(undefined).lane).toBe("minimal_normal");
    expect(deriveCompletionSurface({}).lane).toBe("minimal_normal");
    expect(deriveWeeklyIntelligence({}).lane).toBe("minimal_normal");
  });
});
