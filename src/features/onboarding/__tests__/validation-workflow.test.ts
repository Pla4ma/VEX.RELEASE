import {
  validateOnboardingStep,
  validateCompleteOnboarding,
  getNextRecommendedStep,
  canSkipStep,
} from "../utils/validation";

describe("validateOnboardingStep", () => {
  it("should validate WELCOME step", () => {
    const result = validateOnboardingStep("WELCOME", {});
    expect(result.success).toBe(true);
  });

  it("should validate GOAL_SETTING step", () => {
    const result = validateOnboardingStep("GOAL_SETTING", { goal: "WORK" });
    expect(result.success).toBe(true);
  });

  it("should reject GOAL_SETTING without goal", () => {
    const result = validateOnboardingStep("GOAL_SETTING", {});
    expect(result.success).toBe(false);
  });

  it("should validate FOCUS_TIME step", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {
      focusDuration: 25,
      goal: "WORK",
    });
    expect(result.success).toBe(true);
  });

  it("should reject FOCUS_TIME without duration", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {});
    expect(result.success).toBe(false);
  });

  it("should validate NAME_SETUP step", () => {
    const result = validateOnboardingStep("NAME_SETUP", {
      displayName: "John",
    });
    expect(result.success).toBe(true);
  });

  it("should reject NAME_SETUP with invalid name", () => {
    const result = validateOnboardingStep("NAME_SETUP", { displayName: "A" });
    expect(result.success).toBe(false);
  });

  it("should warn about mismatched goal-duration", () => {
    const result = validateOnboardingStep("FOCUS_TIME", {
      focusDuration: 15,
      goal: "WORK",
    });
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("validateCompleteOnboarding", () => {
  it("should validate complete onboarding", () => {
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "John",
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.goal).toBe("WORK");
    expect(result.data?.focusDuration).toBe(25);
    expect(result.data?.displayName).toBe("John");
  });

  it("should reject incomplete onboarding", () => {
    const result = validateCompleteOnboarding({ goal: "WORK" });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should warn about rapid completion", () => {
    const now = Date.now();
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "John",
      startedAt: now - 1000,
      completedAt: now,
    });
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === "RAPID_COMPLETION")).toBe(
      true,
    );
  });

  it("should warn about slow completion", () => {
    const now = Date.now();
    const result = validateCompleteOnboarding({
      goal: "WORK",
      focusDuration: 25,
      displayName: "John",
      startedAt: now - 31 * 60 * 1000,
      completedAt: now,
    });
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.code === "SLOW_COMPLETION")).toBe(
      true,
    );
  });
});

describe("getNextRecommendedStep", () => {
  it("should recommend GOAL_SETTING after WELCOME", () => {
    const result = getNextRecommendedStep("WELCOME", {});
    expect(result?.step).toBe("GOAL_SETTING");
  });

  it("should recommend FOCUS_TIME after GOAL_SETTING", () => {
    const result = getNextRecommendedStep("GOAL_SETTING", { goal: "WORK" });
    expect(result?.step).toBe("FOCUS_TIME");
  });

  it("should not recommend step without required data", () => {
    const result = getNextRecommendedStep("GOAL_SETTING", {});
    expect(result).toBeNull();
  });

  it("should skip NAME_SETUP if skipName flag is set", () => {
    const result = getNextRecommendedStep("FOCUS_TIME", {
      focusDuration: 25,
      goal: "WORK",
      skipName: true,
    });
    expect(result?.step).toBe("FIRST_SESSION_CTA");
  });
});

describe("canSkipStep", () => {
  it("should allow skipping WELCOME", () => {
    const result = canSkipStep("WELCOME", {});
    expect(result.canSkip).toBe(true);
  });

  it("should not allow skipping GOAL_SETTING", () => {
    const result = canSkipStep("GOAL_SETTING", {});
    expect(result.canSkip).toBe(false);
  });

  it("should not allow skipping FOCUS_TIME", () => {
    const result = canSkipStep("FOCUS_TIME", {});
    expect(result.canSkip).toBe(false);
  });

  it("should allow skipping NAME_SETUP", () => {
    const result = canSkipStep("NAME_SETUP", {});
    expect(result.canSkip).toBe(true);
  });
});
