/**
 * Comprehensive Onboarding Feature Tests
 * Covers: schemas, validators, step navigation, language tier, reward alignment,
 * store helpers, service functions, onboarding state machine, progress tracking,
 * gates, and constants.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
  handleSupabaseError: jest.fn((e: unknown) => e),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(() => false),
    getNumber: jest.fn(() => undefined),
  })),
}));

jest.mock("../../../store", () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ user: { id: "test-user-id" } })),
  },
}));

jest.mock("../../../constants/haptics", () => ({
  triggerHapticEvent: jest.fn(),
  HapticEvents: { WARNING: "warning" },
}));

jest.mock("@theme/tokens/launch-colors", () => ({
  launchColors: {
    hex_48bb78: "#48bb78",
    hex_4299e1: "#4299e1",
    hex_9f7aea: "#9f7aea",
    hex_e53e3e: "#e53e3e",
    hex_38b2ac: "#38b2ac",
    hex_ed8936: "#ed8936",
  },
}));

jest.mock("../../lane-engine/schemas", () => {
  const { z } = require("zod");
  return {
    LaneSchema: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]),
  };
});

// ── Imports ────────────────────────────────────────────────────────────────────

import {
  FocusGoalSchema,
  FocusDurationSchema,
  OnboardingStepSchema,
  OnboardingStateSchema,
  GoalOptionSchema,
  DurationOptionSchema,
  TooltipStateSchema,
  CoachPersonaSchema,
  OnboardingElementSchema,
  MotivationProfileTypeSchema,
  MotivationProfileSchema,
  OnboardingProgressSchema,
} from "../schemas";

import {
  OnboardingNameSchema,
} from "../utils/schemas";

import {
  GoalValidators,
  type ValidationResult,
} from "../utils/goal-validators";
import { DurationValidators } from "../utils/duration-validators";
import { NameValidators } from "../utils/name-validators";
import {
  getNextRecommendedStep,
  canSkipStep,
} from "../utils/step-navigation";
import {
  validateOnboardingStep,
  validateCompleteOnboarding,
} from "../utils/validation";

import {
  getLanguageTier,
  getActiveLanguage,
  GENTLE_LANGUAGE,
  INTENSE_LANGUAGE,
} from "../language-tier";

import {
  getRewardAlignment,
  getRewardWhy,
  REWARD_ALIGNMENTS,
} from "../reward-alignment";

import {
  mergeOnboardingCompletion,
  isCompletionValidForUser,
  deriveMotivationProfile,
} from "../store-helpers";

import {
  getStepName,
  canGoBack,
  canSkip,
  saveDisplayName,
  getFirstSessionConfig,
  isOnboardingStalled,
  getEstimatedTimeRemaining,
  OnboardingError,
} from "../service";

import {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  skipToFirstSession,
  recordSession,
} from "../onboarding-state";

import {
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
} from "../onboarding-progress";

import {
  STEP_ORDER,
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
} from "../onboarding-gates";

import { ONBOARDING_GOALS } from "../constants";

import {
  initialState,
  advanceStepWithCompletionCheck,
} from "../store-action-types";

// ── Schema Tests ──────────────────────────────────────────────────────────────

describe("Onboarding Schemas", () => {
  describe("FocusGoalSchema", () => {
    it("accepts valid goals", () => {
      expect(FocusGoalSchema.parse("WORK")).toBe("WORK");
      expect(FocusGoalSchema.parse("STUDY")).toBe("STUDY");
      expect(FocusGoalSchema.parse("CREATIVE")).toBe("CREATIVE");
      expect(FocusGoalSchema.parse("PERSONAL")).toBe("PERSONAL");
    });

    it("rejects invalid goals", () => {
      expect(() => FocusGoalSchema.parse("INVALID")).toThrow();
      expect(() => FocusGoalSchema.parse("")).toThrow();
      expect(() => FocusGoalSchema.parse(null)).toThrow();
    });
  });

  describe("FocusDurationSchema", () => {
    it("accepts valid durations", () => {
      expect(FocusDurationSchema.parse(10)).toBe(10);
      expect(FocusDurationSchema.parse(15)).toBe(15);
      expect(FocusDurationSchema.parse(25)).toBe(25);
      expect(FocusDurationSchema.parse(45)).toBe(45);
      expect(FocusDurationSchema.parse(60)).toBe(60);
    });

    it("rejects invalid durations", () => {
      expect(() => FocusDurationSchema.parse(20)).toThrow();
      expect(() => FocusDurationSchema.parse(0)).toThrow();
      expect(() => FocusDurationSchema.parse("25")).toThrow();
    });
  });

  describe("OnboardingNameSchema", () => {
    it("accepts valid names", () => {
      expect(OnboardingNameSchema.parse("Alice")).toBe("Alice");
      expect(OnboardingNameSchema.parse("Bob_123")).toBe("Bob_123");
      expect(OnboardingNameSchema.parse("  trimmed  ")).toBe("trimmed");
    });

    it("rejects names that are too short", () => {
      expect(() => OnboardingNameSchema.parse("A")).toThrow();
    });

    it("rejects names that are too long", () => {
      expect(() => OnboardingNameSchema.parse("A".repeat(31))).toThrow();
    });

    it("rejects names with invalid characters", () => {
      expect(() => OnboardingNameSchema.parse("Alice@!")).toThrow();
    });
  });

  describe("OnboardingStepSchema", () => {
    it("accepts valid steps", () => {
      expect(OnboardingStepSchema.parse("WELCOME")).toBe("WELCOME");
      expect(OnboardingStepSchema.parse("GOAL_SETTING")).toBe("GOAL_SETTING");
      expect(OnboardingStepSchema.parse("FOCUS_TIME")).toBe("FOCUS_TIME");
      expect(OnboardingStepSchema.parse("NAME_SETUP")).toBe("NAME_SETUP");
      expect(OnboardingStepSchema.parse("FIRST_SESSION_CTA")).toBe(
        "FIRST_SESSION_CTA",
      );
    });

    it("rejects invalid steps", () => {
      expect(() => OnboardingStepSchema.parse("INVALID")).toThrow();
    });
  });

  describe("OnboardingStateSchema", () => {
    it("accepts valid state", () => {
      const validState = {
        isOnboarded: false,
        currentStep: 0,
        goal: null,
        focusDuration: null,
        displayName: null,
        startedAt: null,
        completedAt: null,
        completedForUserId: null,
        persona: null,
        element: null,
        motivationProfile: null,
        explicitMotivationStyle: null,
        profileStepsCompleted: false,
        firstSessionStarted: false,
        firstSessionCompleted: false,
        homePreviewEntered: false,
        chosenLane: null,
      };
      expect(() => OnboardingStateSchema.parse(validState)).not.toThrow();
    });

    it("rejects state with out-of-range currentStep", () => {
      const invalidState = {
        isOnboarded: false,
        currentStep: 10,
        goal: null,
        focusDuration: null,
        displayName: null,
        startedAt: null,
        completedAt: null,
        completedForUserId: null,
        persona: null,
        element: null,
        motivationProfile: null,
        explicitMotivationStyle: null,
        profileStepsCompleted: false,
        firstSessionStarted: false,
        firstSessionCompleted: false,
        homePreviewEntered: false,
        chosenLane: null,
      };
      expect(() => OnboardingStateSchema.parse(invalidState)).toThrow();
    });
  });

  describe("GoalOptionSchema", () => {
    it("accepts valid goal option", () => {
      const option = {
        key: "WORK",
        label: "Work",
        emoji: "💼",
        description: "Meetings and deep work",
      };
      expect(() => GoalOptionSchema.parse(option)).not.toThrow();
    });

    it("rejects goal option with empty label", () => {
      const option = { key: "WORK", label: "", emoji: "💼", description: "x" };
      expect(() => GoalOptionSchema.parse(option)).toThrow();
    });
  });

  describe("DurationOptionSchema", () => {
    it("accepts valid duration option", () => {
      const option = { value: 25, label: "25 min", emoji: "🍅" };
      expect(() => DurationOptionSchema.parse(option)).not.toThrow();
    });

    it("rejects duration option with invalid value", () => {
      const option = { value: 20, label: "20 min", emoji: "🍅" };
      expect(() => DurationOptionSchema.parse(option)).toThrow();
    });
  });

  describe("TooltipStateSchema", () => {
    it("accepts valid tooltip state", () => {
      const state = {
        currentTooltip: 0,
        hasShownStreakTooltip: false,
        hasShownBossTooltip: false,
        hasShownChallengeTooltip: false,
      };
      expect(() => TooltipStateSchema.parse(state)).not.toThrow();
    });
  });

  describe("CoachPersonaSchema", () => {
    it("accepts valid personas", () => {
      expect(CoachPersonaSchema.parse("cheerleader")).toBe("cheerleader");
      expect(CoachPersonaSchema.parse("mentor")).toBe("mentor");
      expect(CoachPersonaSchema.parse("drill-sergeant")).toBe(
        "drill-sergeant",
      );
    });

    it("rejects invalid persona", () => {
      expect(() => CoachPersonaSchema.parse("coach")).toThrow();
    });
  });

  describe("OnboardingElementSchema", () => {
    it("accepts all valid elements", () => {
      const elements = [
        "FLAME",
        "WAVE",
        "TERRA",
        "ZEPHYR",
        "VOID",
        "LUMINA",
      ];
      elements.forEach((el) => {
        expect(OnboardingElementSchema.parse(el)).toBe(el);
      });
    });

    it("rejects invalid element", () => {
      expect(() => OnboardingElementSchema.parse("FIRE")).toThrow();
    });
  });

  describe("MotivationProfileTypeSchema", () => {
    it("accepts valid profile types", () => {
      const types = [
        "calm",
        "friendly",
        "game_like",
        "coach_led",
        "competitive",
        "intense",
        "study_focused",
        "student",
        "creator",
        "worker",
      ];
      types.forEach((t) => {
        expect(MotivationProfileTypeSchema.parse(t)).toBe(t);
      });
    });

    it("rejects invalid profile type", () => {
      expect(() => MotivationProfileTypeSchema.parse("relaxed")).toThrow();
    });
  });

  describe("MotivationProfileSchema", () => {
    it("accepts valid motivation profile", () => {
      const profile = { primary: "calm", secondary: ["friendly"] };
      expect(() => MotivationProfileSchema.parse(profile)).not.toThrow();
    });
  });

  describe("OnboardingProgressSchema", () => {
    it("accepts valid progress state", () => {
      const progress = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        status: "IN_PROGRESS",
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
      };
      expect(() => OnboardingProgressSchema.parse(progress)).not.toThrow();
    });

    it("rejects progress with invalid userId", () => {
      const progress = {
        userId: "not-a-uuid",
        status: "IN_PROGRESS",
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
      };
      expect(() => OnboardingProgressSchema.parse(progress)).toThrow();
    });

    it("rejects progress with extra fields (strict)", () => {
      const progress = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        status: "IN_PROGRESS",
        steps: {
          profileStarted: false,
          goalSelected: false,
          firstSessionStarted: false,
          firstSessionCompleted: false,
          rewardSeen: false,
        },
        firstSession: {},
        permissions: {
          notificationAsked: false,
          notificationGranted: false,
        },
        extraField: true,
      };
      expect(() => OnboardingProgressSchema.parse(progress)).toThrow();
    });
  });
});

// ── Goal Validators ───────────────────────────────────────────────────────────

describe("GoalValidators", () => {
  describe("validate", () => {
    it("accepts valid goal", () => {
      const result = GoalValidators.validate("WORK");
      expect(result.success).toBe(true);
      expect(result.data).toBe("WORK");
      expect(result.errors).toHaveLength(0);
    });

    it("rejects non-string goal", () => {
      const result = GoalValidators.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.code).toBe("INVALID_GOAL");
    });

    it("rejects unknown goal string", () => {
      const result = GoalValidators.validate("INVALID");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_GOAL");
    });

    it("rejects null goal", () => {
      const result = GoalValidators.validate(null);
      expect(result.success).toBe(false);
    });
  });

  describe("getSuggestions", () => {
    it("returns suggestions for partial match", () => {
      const suggestions = GoalValidators.getSuggestions("wor");
      expect(suggestions).toContain("WORK");
    });

    it("returns empty for no match", () => {
      const suggestions = GoalValidators.getSuggestions("zzz");
      expect(suggestions).toHaveLength(0);
    });

    it("returns multiple suggestions for broad match", () => {
      const suggestions = GoalValidators.getSuggestions("o");
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});

// ── Duration Validators ───────────────────────────────────────────────────────

describe("DurationValidators", () => {
  describe("validate", () => {
    it("accepts valid duration", () => {
      const result = DurationValidators.validate(25);
      expect(result.success).toBe(true);
      expect(result.data).toBe(25);
    });

    it("rejects non-number duration", () => {
      const result = DurationValidators.validate("25");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_TYPE");
    });

    it("rejects NaN", () => {
      const result = DurationValidators.validate(NaN);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_TYPE");
    });

    it("rejects invalid number with suggestion", () => {
      const result = DurationValidators.validate(20);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_DURATION_VALUE");
      expect(result.suggestions).toBeDefined();
    });

    it("warns on short duration (15 min)", () => {
      const result = DurationValidators.validate(15);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe("SHORT_DURATION_WARNING");
    });

    it("warns on long duration (60 min)", () => {
      const result = DurationValidators.validate(60);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe("LONG_DURATION_WARNING");
    });

    it("has no warnings for medium duration (25 min)", () => {
      const result = DurationValidators.validate(25);
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("recommendForGoal", () => {
    it("returns recommendations for WORK", () => {
      const recs = DurationValidators.recommendForGoal("WORK");
      expect(recs).toContain(25);
      expect(recs).toContain(45);
      expect(recs).toContain(60);
    });

    it("returns recommendations for STUDY", () => {
      const recs = DurationValidators.recommendForGoal("STUDY");
      expect(recs).toContain(25);
    });

    it("returns recommendations for CREATIVE", () => {
      const recs = DurationValidators.recommendForGoal("CREATIVE");
      expect(recs).toContain(45);
    });

    it("returns recommendations for PERSONAL", () => {
      const recs = DurationValidators.recommendForGoal("PERSONAL");
      expect(recs).toContain(25);
    });
  });
});

// ── Name Validators ───────────────────────────────────────────────────────────

describe("NameValidators", () => {
  describe("validate", () => {
    it("accepts valid name", () => {
      const result = NameValidators.validate("Alice");
      expect(result.success).toBe(true);
      expect(result.data).toBe("Alice");
    });

    it("trims whitespace", () => {
      const result = NameValidators.validate("  Alice  ");
      expect(result.success).toBe(true);
      expect(result.data).toBe("Alice");
    });

    it("rejects non-string", () => {
      const result = NameValidators.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("INVALID_NAME_TYPE");
    });

    it("rejects empty string", () => {
      const result = NameValidators.validate("");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("NAME_REQUIRED");
    });

    it("rejects whitespace-only string", () => {
      const result = NameValidators.validate("   ");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("NAME_REQUIRED");
    });

    it("rejects name shorter than 2 characters", () => {
      const result = NameValidators.validate("A");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("NAME_TOO_SHORT");
    });

    it("rejects name longer than 30 characters", () => {
      const result = NameValidators.validate("A".repeat(31));
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("NAME_TOO_LONG");
    });

    it("rejects name with invalid characters", () => {
      const result = NameValidators.validate("Alice@#");
      expect(result.success).toBe(false);
      expect(result.errors[0]!.code).toBe("NAME_INVALID_CHARACTERS");
    });

    it("warns on very short names", () => {
      const result = NameValidators.validate("Ab");
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]!.code).toBe("NAME_VERY_SHORT");
    });

    it("warns on test-like names", () => {
      const result = NameValidators.validate("testuser");
      expect(result.success).toBe(true);
      const testWarning = result.warnings.find(
        (w) => w.code === "NAME_LIKE_TEST_DATA",
      );
      expect(testWarning).toBeDefined();
    });

    it("accepts names with hyphens and underscores", () => {
      const result = NameValidators.validate("Alice_Bob-123");
      expect(result.success).toBe(true);
    });
  });

  describe("generateSuggestions", () => {
    it("generates suggestions for short names", () => {
      const suggestions = NameValidators.generateSuggestions("Al");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes("Pro"))).toBe(true);
    });

    it("capitalizes lowercase names", () => {
      const suggestions = NameValidators.generateSuggestions("alice");
      expect(suggestions.some((s) => s.startsWith("A"))).toBe(true);
    });

    it("returns max 3 suggestions", () => {
      const suggestions = NameValidators.generateSuggestions("a");
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });
});

// ── Step Navigation ───────────────────────────────────────────────────────────

describe("Step Navigation", () => {
  describe("getNextRecommendedStep", () => {
    it("returns GOAL_SETTING after WELCOME", () => {
      const next = getNextRecommendedStep("WELCOME", {});
      expect(next).not.toBeNull();
      expect(next!.step).toBe("GOAL_SETTING");
    });

    it("returns FOCUS_TIME after GOAL_SETTING with goal set", () => {
      const next = getNextRecommendedStep("GOAL_SETTING", { goal: "WORK" });
      expect(next).not.toBeNull();
      expect(next!.step).toBe("FOCUS_TIME");
    });

    it("returns null after GOAL_SETTING without goal", () => {
      const next = getNextRecommendedStep("GOAL_SETTING", {});
      expect(next).toBeNull();
    });

    it("returns NAME_SETUP after FOCUS_TIME with duration set", () => {
      const next = getNextRecommendedStep("FOCUS_TIME", {
        focusDuration: 25,
      });
      expect(next).not.toBeNull();
      expect(next!.step).toBe("NAME_SETUP");
    });

    it("skips NAME_SETUP when skipName is set", () => {
      const next = getNextRecommendedStep("FOCUS_TIME", {
        focusDuration: 25,
        skipName: true,
      });
      expect(next).not.toBeNull();
      expect(next!.step).toBe("FIRST_SESSION_CTA");
    });

    it("returns FIRST_SESSION_CTA after NAME_SETUP", () => {
      const next = getNextRecommendedStep("NAME_SETUP", {});
      expect(next).not.toBeNull();
      expect(next!.step).toBe("FIRST_SESSION_CTA");
    });

    it("returns null after FIRST_SESSION_CTA", () => {
      const next = getNextRecommendedStep("FIRST_SESSION_CTA", {});
      expect(next).toBeNull();
    });

    it("returns null for unknown step", () => {
      const next = getNextRecommendedStep("UNKNOWN", {});
      expect(next).toBeNull();
    });
  });

  describe("canSkipStep", () => {
    it("allows skipping WELCOME", () => {
      const result = canSkipStep("WELCOME", {});
      expect(result.canSkip).toBe(true);
    });

    it("disallows skipping GOAL_SETTING", () => {
      const result = canSkipStep("GOAL_SETTING", {});
      expect(result.canSkip).toBe(false);
    });

    it("disallows skipping FOCUS_TIME", () => {
      const result = canSkipStep("FOCUS_TIME", {});
      expect(result.canSkip).toBe(false);
    });

    it("allows skipping NAME_SETUP", () => {
      const result = canSkipStep("NAME_SETUP", {});
      expect(result.canSkip).toBe(true);
    });

    it("allows skipping FIRST_SESSION_CTA", () => {
      const result = canSkipStep("FIRST_SESSION_CTA", {});
      expect(result.canSkip).toBe(true);
    });

    it("disallows skipping unknown steps", () => {
      const result = canSkipStep("UNKNOWN", {});
      expect(result.canSkip).toBe(false);
    });
  });
});

// ── Validation (combined) ─────────────────────────────────────────────────────

describe("validateOnboardingStep", () => {
  it("validates WELCOME step (always passes)", () => {
    const result = validateOnboardingStep("WELCOME", {});
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates GOAL_SETTING with valid goal", () => {
    const result = validateOnboardingStep("GOAL_SETTING", { goal: "WORK" });
    expect(result.success).toBe(true);
  });

  it("validates GOAL_SETTING with invalid goal", () => {
    const result = validateOnboardingStep("GOAL_SETTING", {
      goal: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("validates FOCUS_TIME with valid duration", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {
      focusDuration: 25,
    });
    expect(result.success).toBe(true);
  });

  it("validates FOCUS_TIME with invalid duration", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {
      focusDuration: 20,
    });
    expect(result.success).toBe(false);
  });

  it("warns on non-recommended duration for goal", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {
      focusDuration: 15,
      goal: "CREATIVE",
    });
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("validates NAME_SETUP with valid name", () => {
    const result = validateOnboardingStep("NAME_SETUP", {
      displayName: "Alice",
    });
    expect(result.success).toBe(true);
  });

  it("validates NAME_SETUP with invalid name", () => {
    const result = validateOnboardingStep("NAME_SETUP", { displayName: "" });
    expect(result.success).toBe(false);
  });

  it("validates FIRST_SESSION_CTA with warnings for missing data", () => {
    const result = validateOnboardingStep("FIRST_SESSION_CTA", {});
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("rejects unknown step", () => {
    const result = validateOnboardingStep("UNKNOWN", {});
    expect(result.success).toBe(false);
    expect(result.errors[0]!.code).toBe("UNKNOWN_STEP");
  });
});

describe("validateCompleteOnboarding", () => {
  it("validates complete valid state", () => {
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "Alice",
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.goal).toBe("WORK");
    expect(result.data!.focusDuration).toBe(25);
    expect(result.data!.displayName).toBe("Alice");
  });

  it("fails with missing goal", () => {
    const result = validateCompleteOnboarding({
      focusDuration: 25,
      displayName: "Alice",
    });
    expect(result.success).toBe(false);
  });

  it("fails with missing duration", () => {
    const result = validateCompleteOnboarding({
      goal: "WORK",
      displayName: "Alice",
    });
    expect(result.success).toBe(false);
  });

  it("fails with missing name", () => {
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
    });
    expect(result.success).toBe(false);
  });

  it("warns on rapid completion", () => {
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "Alice",
      startedAt: Date.now(),
      completedAt: Date.now() + 1000,
    });
    expect(result.success).toBe(true);
    const rapidWarning = result.warnings.find(
      (w) => w.code === "RAPID_COMPLETION",
    );
    expect(rapidWarning).toBeDefined();
  });

  it("warns on slow completion", () => {
    const now = Date.now();
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "Alice",
      startedAt: now,
      completedAt: now + 31 * 60 * 1000,
    });
    expect(result.success).toBe(true);
    const slowWarning = result.warnings.find(
      (w) => w.code === "SLOW_COMPLETION",
    );
    expect(slowWarning).toBeDefined();
  });

  it("warns on goal-duration mismatch", () => {
    const result = validateCompleteOnboarding({
      goal: "CREATIVE",
      focusDuration: 15,
      displayName: "Alice",
    });
    expect(result.success).toBe(true);
    const mismatchWarning = result.warnings.find(
      (w) => w.code === "GOAL_DURATION_MISMATCH",
    );
    expect(mismatchWarning).toBeDefined();
  });
});

// ── Language Tier ──────────────────────────────────────────────────────────────

describe("Language Tier", () => {
  describe("getLanguageTier", () => {
    it("returns gentle for calm profile", () => {
      expect(getLanguageTier("calm")).toBe("gentle");
    });

    it("returns gentle for friendly profile", () => {
      expect(getLanguageTier("friendly")).toBe("gentle");
    });

    it("returns gentle for study_focused profile", () => {
      expect(getLanguageTier("study_focused")).toBe("gentle");
    });

    it("returns intense for game_like profile", () => {
      expect(getLanguageTier("game_like")).toBe("intense");
    });

    it("returns intense for competitive profile", () => {
      expect(getLanguageTier("competitive")).toBe("intense");
    });

    it("returns intense for intense profile", () => {
      expect(getLanguageTier("intense")).toBe("intense");
    });

    it("returns gentle for null", () => {
      expect(getLanguageTier(null)).toBe("gentle");
    });

    it("returns gentle for undefined", () => {
      expect(getLanguageTier(undefined)).toBe("gentle");
    });
  });

  describe("getActiveLanguage", () => {
    it("returns gentle language for gentle tier", () => {
      const lang = getActiveLanguage("gentle");
      expect(lang).toBe(GENTLE_LANGUAGE);
      expect(lang.streakBrokenTitle).toBe("Your streak paused");
    });

    it("returns intense language for intense tier", () => {
      const lang = getActiveLanguage("intense");
      expect(lang).toBe(INTENSE_LANGUAGE);
      expect(lang.streakBrokenTitle).toBe("Streak broken");
    });
  });
});

// ── Reward Alignment ──────────────────────────────────────────────────────────

describe("Reward Alignment", () => {
  describe("getRewardAlignment", () => {
    it("finds existing reward alignment", () => {
      const alignment = getRewardAlignment("session_complete");
      expect(alignment).toBeDefined();
      expect(alignment!.pointsTo).toBe("consistency");
    });

    it("returns undefined for unknown reward", () => {
      const alignment = getRewardAlignment("nonexistent");
      expect(alignment).toBeUndefined();
    });
  });

  describe("getRewardWhy", () => {
    it("returns earnedBecause for existing reward", () => {
      const why = getRewardWhy("session_complete");
      expect(why).toBe(
        "You showed up and focused. That is the only thing that matters.",
      );
    });

    it("returns default message for unknown reward", () => {
      const why = getRewardWhy("nonexistent");
      expect(why).toBe("You earned this through focused work.");
    });
  });

  it("has at least 5 reward alignments", () => {
    expect(REWARD_ALIGNMENTS.length).toBeGreaterThanOrEqual(5);
  });
});

// ── Store Helpers ──────────────────────────────────────────────────────────────

describe("Store Helpers", () => {
  describe("mergeOnboardingCompletion", () => {
    it("returns completed state with userId", () => {
      const result = mergeOnboardingCompletion(true, Date.now());
      expect(result.isOnboarded).toBe(true);
      expect(result.completedAt).toBeDefined();
      expect(result.completedForUserId).toBe("test-user-id");
    });

    it("returns incomplete state with null userId", () => {
      const result = mergeOnboardingCompletion(false, null);
      expect(result.isOnboarded).toBe(false);
      expect(result.completedForUserId).toBeNull();
    });
  });

  describe("isCompletionValidForUser", () => {
    it("returns true when completion matches user", () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: "user-123",
      };
      expect(isCompletionValidForUser(state, "user-123")).toBe(true);
    });

    it("returns false when userId does not match", () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: "user-123",
      };
      expect(isCompletionValidForUser(state, "user-456")).toBe(false);
    });

    it("returns false when not onboarded", () => {
      const state = {
        isOnboarded: false,
        completedAt: null,
        completedForUserId: null,
      };
      expect(isCompletionValidForUser(state, "user-123")).toBe(false);
    });

    it("returns false for null userId", () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: "user-123",
      };
      expect(isCompletionValidForUser(state, null)).toBe(false);
    });

    it("returns false for undefined userId", () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: "user-123",
      };
      expect(isCompletionValidForUser(state, undefined)).toBe(false);
    });
  });

  describe("deriveMotivationProfile", () => {
    it("returns explicit style when set", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "mentor",
        "FLAME",
        "competitive",
      );
      expect(profile.primary).toBe("competitive");
    });

    it("derives STUDY → study_focused", () => {
      const profile = deriveMotivationProfile("STUDY", null, null, null);
      expect(profile.primary).toBe("study_focused");
    });

    it("derives WORK → worker", () => {
      const profile = deriveMotivationProfile("WORK", null, null, null);
      expect(profile.primary).toBe("worker");
    });

    it("derives CREATIVE → creator", () => {
      const profile = deriveMotivationProfile("CREATIVE", null, null, null);
      expect(profile.primary).toBe("creator");
    });

    it("derives PERSONAL → calm", () => {
      const profile = deriveMotivationProfile("PERSONAL", null, null, null);
      expect(profile.primary).toBe("calm");
    });

    it("defaults to calm when no goal", () => {
      const profile = deriveMotivationProfile(null, null, null, null);
      expect(profile.primary).toBe("calm");
    });

    it("adds intense for drill-sergeant persona", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "drill-sergeant",
        null,
        null,
      );
      expect(profile.secondary).toContain("intense");
    });

    it("adds friendly for cheerleader persona", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        "cheerleader",
        null,
        null,
      );
      expect(profile.secondary).toContain("friendly");
    });

    it("adds coach_led for mentor persona", () => {
      const profile = deriveMotivationProfile("WORK", "mentor", null, null);
      expect(profile.secondary).toContain("coach_led");
    });

    it("adds game_like and intense for FLAME element", () => {
      const profile = deriveMotivationProfile(
        "WORK",
        null,
        "FLAME",
        null,
      );
      expect(profile.secondary).toContain("game_like");
      expect(profile.secondary).toContain("intense");
    });

    it("adds calm for WAVE element", () => {
      const profile = deriveMotivationProfile("WORK", null, "WAVE", null);
      expect(profile.secondary).toContain("calm");
    });

    it("adds worker for TERRA element", () => {
      const profile = deriveMotivationProfile("WORK", null, "TERRA", null);
      expect(profile.secondary).toContain("worker");
    });

    it("adds friendly for ZEPHYR element", () => {
      const profile = deriveMotivationProfile("WORK", null, "ZEPHYR", null);
      expect(profile.secondary).toContain("friendly");
    });

    it("adds intense and competitive for VOID element", () => {
      const profile = deriveMotivationProfile("WORK", null, "VOID", null);
      expect(profile.secondary).toContain("intense");
      expect(profile.secondary).toContain("competitive");
    });

    it("adds study_focused for LUMINA element (default)", () => {
      const profile = deriveMotivationProfile(null, null, null, null);
      expect(profile.secondary).toContain("study_focused");
    });
  });
});

// ── Service Functions ─────────────────────────────────────────────────────────

describe("Service Functions", () => {
  describe("getStepName", () => {
    it("returns WELCOME for step 0", () => {
      expect(getStepName(0)).toBe("WELCOME");
    });

    it("returns GOAL_SETTING for step 1", () => {
      expect(getStepName(1)).toBe("GOAL_SETTING");
    });

    it("returns FOCUS_TIME for step 2", () => {
      expect(getStepName(2)).toBe("FOCUS_TIME");
    });

    it("returns NAME_SETUP for step 3", () => {
      expect(getStepName(3)).toBe("NAME_SETUP");
    });

    it("returns FIRST_SESSION_CTA for step 4", () => {
      expect(getStepName(4)).toBe("FIRST_SESSION_CTA");
    });

    it("returns WELCOME for out-of-range step", () => {
      expect(getStepName(10)).toBe("WELCOME");
    });
  });

  describe("canGoBack", () => {
    it("returns false for step 0", () => {
      expect(canGoBack(0)).toBe(false);
    });

    it("returns true for step 1", () => {
      expect(canGoBack(1)).toBe(true);
    });

    it("returns true for step 4", () => {
      expect(canGoBack(4)).toBe(true);
    });
  });

  describe("canSkip", () => {
    it("returns false for step 0", () => {
      expect(canSkip(0)).toBe(false);
    });

    it("returns true for step 1", () => {
      expect(canSkip(1)).toBe(true);
    });
  });

  describe("saveDisplayName", () => {
    it("returns true for valid name", () => {
      expect(saveDisplayName("Alice")).toBe(true);
    });

    it("returns false for short name", () => {
      expect(saveDisplayName("A")).toBe(false);
    });

    it("returns false for empty name", () => {
      expect(saveDisplayName("")).toBe(false);
    });

    it("trims whitespace", () => {
      expect(saveDisplayName("  Alice  ")).toBe(true);
    });
  });

  describe("getFirstSessionConfig", () => {
    it("returns default duration when none set", () => {
      const config = getFirstSessionConfig();
      expect(config.duration).toBeGreaterThan(0);
      expect(config.isOnboardingSession).toBe(true);
    });
  });

  describe("isOnboardingStalled", () => {
    it("returns false when not started", () => {
      expect(isOnboardingStalled()).toBe(false);
    });
  });

  describe("getEstimatedTimeRemaining", () => {
    it("returns time proportional to remaining steps", () => {
      const time0 = getEstimatedTimeRemaining(0);
      const time3 = getEstimatedTimeRemaining(3);
      expect(time0).toBeGreaterThan(time3);
    });

    it("returns 0 for last step", () => {
      expect(getEstimatedTimeRemaining(4)).toBe(0);
    });
  });

  describe("OnboardingError", () => {
    it("creates error with code and message", () => {
      const error = new OnboardingError("TEST_CODE", "Test message");
      expect(error.code).toBe("TEST_CODE");
      expect(error.message).toBe("Test message");
      expect(error.name).toBe("OnboardingError");
      expect(error instanceof Error).toBe(true);
    });
  });
});

// ── Onboarding State Machine ──────────────────────────────────────────────────

describe("Onboarding State Machine", () => {
  beforeEach(() => {
    // Reset in-memory state by re-initializing
  });

  describe("initializeOnboarding", () => {
    it("creates initial state for user", () => {
      const state = initializeOnboarding("user-1");
      expect(state.userId).toBe("user-1");
      expect(state.currentStep).toBe("WELCOME");
      expect(state.sessionsCompleted).toBe(0);
      expect(state.completedAt).toBeNull();
      expect(state.unlockedFeatures).toHaveLength(0);
      expect(state.skippedCustomization).toBe(false);
    });
  });

  describe("getOnboardingState", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingState("unknown-user")).toBeNull();
    });

    it("returns state for known user", () => {
      initializeOnboarding("user-2");
      const state = getOnboardingState("user-2");
      expect(state).not.toBeNull();
      expect(state!.userId).toBe("user-2");
    });
  });

  describe("advanceStep", () => {
    it("advances from WELCOME to QUICK_START", () => {
      initializeOnboarding("user-3");
      const state = advanceStep("user-3");
      expect(state).not.toBeNull();
      expect(state!.currentStep).toBe("QUICK_START");
    });

    it("returns null for unknown user", () => {
      expect(advanceStep("unknown")).toBeNull();
    });

    it("sets completedAt when reaching COMPLETE", () => {
      initializeOnboarding("user-4");
      // Advance through all steps
      for (let i = 0; i < 10; i++) {
        advanceStep("user-4");
      }
      const state = getOnboardingState("user-4");
      expect(state!.currentStep).toBe("COMPLETE");
      expect(state!.completedAt).not.toBeNull();
    });
  });

  describe("skipToFirstSession", () => {
    it("sets skippedCustomization and moves to FIRST_SESSION", () => {
      initializeOnboarding("user-5");
      const state = skipToFirstSession("user-5");
      expect(state).not.toBeNull();
      expect(state!.skippedCustomization).toBe(true);
      expect(state!.currentStep).toBe("FIRST_SESSION");
    });

    it("returns null for unknown user", () => {
      expect(skipToFirstSession("unknown")).toBeNull();
    });
  });

  describe("recordSession", () => {
    it("increments session count", () => {
      initializeOnboarding("user-6");
      const state = recordSession("user-6", 15);
      expect(state).not.toBeNull();
      expect(state!.sessionsCompleted).toBe(1);
    });

    it("sets firstSessionAt on first session", () => {
      initializeOnboarding("user-7");
      const state = recordSession("user-7", 15);
      expect(state!.firstSessionAt).not.toBeNull();
      expect(state!.currentStep).toBe("POST_SESSION");
    });

    it("does not overwrite firstSessionAt on subsequent sessions", () => {
      initializeOnboarding("user-8");
      recordSession("user-8", 15);
      const firstTime = getOnboardingState("user-8")!.firstSessionAt;
      recordSession("user-8", 25);
      expect(getOnboardingState("user-8")!.firstSessionAt).toBe(firstTime);
    });

    it("unlocks features when session threshold is met", () => {
      initializeOnboarding("user-9");
      // Today Strip requires 2 sessions
      recordSession("user-9", 15);
      recordSession("user-9", 15);
      const state = getOnboardingState("user-9");
      expect(state!.unlockedFeatures.length).toBeGreaterThanOrEqual(1);
    });

    it("returns null for unknown user", () => {
      expect(recordSession("unknown", 15)).toBeNull();
    });
  });
});

// ── Onboarding Progress ───────────────────────────────────────────────────────

describe("Onboarding Progress", () => {
  describe("getStepContent", () => {
    it("returns content for WELCOME step", () => {
      initializeOnboarding("progress-user-1");
      const state = getOnboardingState("progress-user-1")!;
      const content = getStepContent(state);
      expect(content.title).toBeDefined();
      expect(content.primaryAction).toBeDefined();
    });
  });

  describe("getOnboardingProgress", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingProgress("unknown")).toBeNull();
    });

    it("returns progress for known user", () => {
      initializeOnboarding("progress-user-2");
      const progress = getOnboardingProgress("progress-user-2");
      expect(progress).not.toBeNull();
      expect(progress!.totalSteps).toBe(STEP_ORDER.length);
      expect(progress!.percentComplete).toBeGreaterThan(0);
    });
  });

  describe("shouldShowOnboarding", () => {
    it("returns true for new user", () => {
      expect(shouldShowOnboarding("new-user")).toBe(true);
    });

    it("returns false for completed user", () => {
      initializeOnboarding("completed-user");
      for (let i = 0; i < 10; i++) advanceStep("completed-user");
      expect(shouldShowOnboarding("completed-user")).toBe(false);
    });
  });

  describe("isFeatureAvailable", () => {
    it("returns default for unknown user", () => {
      expect(isFeatureAvailable("unknown", "feature", true)).toBe(true);
      expect(isFeatureAvailable("unknown", "feature", false)).toBe(false);
    });

    it("returns false for locked feature", () => {
      initializeOnboarding("feature-user-1");
      expect(isFeatureAvailable("feature-user-1", "clean_today_strip")).toBe(
        false,
      );
    });

    it("returns true for unlocked feature", () => {
      initializeOnboarding("feature-user-2");
      recordSession("feature-user-2", 15);
      recordSession("feature-user-2", 15);
      expect(isFeatureAvailable("feature-user-2", "clean_today_strip")).toBe(
        true,
      );
    });
  });

  describe("getAvailableFeatures", () => {
    it("returns empty for unknown user", () => {
      expect(getAvailableFeatures("unknown")).toHaveLength(0);
    });

    it("returns features after sessions", () => {
      initializeOnboarding("avail-user");
      recordSession("avail-user", 15);
      recordSession("avail-user", 15);
      const features = getAvailableFeatures("avail-user");
      expect(features.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getNextFeatureUnlock", () => {
    it("returns first gate for unknown user", () => {
      const gate = getNextFeatureUnlock("unknown");
      expect(gate).not.toBeNull();
      expect(gate!.featureId).toBe(FEATURE_UNLOCK_GATES[0]!.featureId);
    });
  });
});

// ── Onboarding Gates ──────────────────────────────────────────────────────────

describe("Onboarding Gates", () => {
  it("has correct step order", () => {
    expect(STEP_ORDER).toContain("WELCOME");
    expect(STEP_ORDER).toContain("QUICK_START");
    expect(STEP_ORDER).toContain("FIRST_SESSION");
    expect(STEP_ORDER).toContain("POST_SESSION");
    expect(STEP_ORDER).toContain("HOME_INTRO");
    expect(STEP_ORDER).toContain("FEATURE_UNLOCK");
    expect(STEP_ORDER).toContain("COMPLETE");
    expect(STEP_ORDER.length).toBe(7);
  });

  it("has feature unlock gates sorted by session requirement", () => {
    for (let i = 1; i < FEATURE_UNLOCK_GATES.length; i++) {
      expect(FEATURE_UNLOCK_GATES[i]!.requiresSessions).toBeGreaterThanOrEqual(
        FEATURE_UNLOCK_GATES[i - 1]!.requiresSessions,
      );
    }
  });

  it("has step content for every step", () => {
    STEP_ORDER.forEach((step) => {
      expect(STEP_CONTENT[step]).toBeDefined();
      expect(STEP_CONTENT[step].title).toBeTruthy();
      expect(STEP_CONTENT[step].primaryAction).toBeTruthy();
      expect(STEP_CONTENT[step].content).toBeTruthy();
    });
  });

  it("has at least 4 feature unlock gates", () => {
    expect(FEATURE_UNLOCK_GATES.length).toBeGreaterThanOrEqual(4);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe("Onboarding Constants", () => {
  it("has 4 onboarding goals", () => {
    expect(ONBOARDING_GOALS.length).toBe(4);
  });

  it("has all required goal fields", () => {
    ONBOARDING_GOALS.forEach((goal) => {
      expect(goal.id).toBeTruthy();
      expect(goal.label).toBeTruthy();
      expect(goal.description).toBeTruthy();
    });
  });

  it("covers all focus goal types", () => {
    const ids = ONBOARDING_GOALS.map((g) => g.id);
    expect(ids).toContain("WORK");
    expect(ids).toContain("STUDY");
    expect(ids).toContain("CREATIVE");
    expect(ids).toContain("PERSONAL");
  });
});

// ── Store Action Types ────────────────────────────────────────────────────────

describe("Store Action Types", () => {
  describe("initialState", () => {
    it("has all required fields", () => {
      expect(initialState.isOnboarded).toBe(false);
      expect(initialState.currentStep).toBe(0);
      expect(initialState.goal).toBeNull();
      expect(initialState.focusDuration).toBeNull();
      expect(initialState.displayName).toBeNull();
      expect(initialState.startedAt).toBeNull();
      expect(initialState.completedAt).toBeNull();
      expect(initialState.profileStepsCompleted).toBe(false);
      expect(initialState.firstSessionStarted).toBe(false);
      expect(initialState.firstSessionCompleted).toBe(false);
    });
  });

  describe("advanceStepWithCompletionCheck", () => {
    it("advances to target step", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 0 }));
      advanceStepWithCompletionCheck(setMock, getMock, 3);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ currentStep: 3 }),
      );
    });

    it("marks profileStepsCompleted at step 5", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 4 }));
      advanceStepWithCompletionCheck(setMock, getMock, 5);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 5,
          profileStepsCompleted: true,
        }),
      );
    });

    it("does not mark profileStepsCompleted below step 5", () => {
      const setMock = jest.fn();
      const getMock = jest.fn(() => ({ currentStep: 2 }));
      advanceStepWithCompletionCheck(setMock, getMock, 3);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({ currentStep: 3 }),
      );
      const callArgs = setMock.mock.calls[0]![0];
      expect(callArgs.profileStepsCompleted).toBeUndefined();
    });
  });
});
