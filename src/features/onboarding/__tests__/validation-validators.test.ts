import {
  GoalValidators,
  DurationValidators,
  NameValidators,
} from "../utils/validation";

describe("GoalValidators", () => {
  it("should validate valid goals", () => {
    const validGoals = ["WORK", "STUDY", "CREATIVE", "PERSONAL"];
    validGoals.forEach((goal) => {
      const result = GoalValidators.validate(goal);
      expect(result.success).toBe(true);
      expect(result.data).toBe(goal);
      expect(result.errors).toHaveLength(0);
    });
  });

  it("should reject invalid goals", () => {
    const invalidGoals = ["INVALID", "", null, undefined, 123];
    invalidGoals.forEach((goal) => {
      const result = GoalValidators.validate(goal);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  it("should provide goal suggestions", () => {
    expect(GoalValidators.getSuggestions("wor")).toContain("WORK");
    expect(GoalValidators.getSuggestions("stu")).toContain("STUDY");
    expect(GoalValidators.getSuggestions("cre")).toContain("CREATIVE");
    expect(GoalValidators.getSuggestions("per")).toContain("PERSONAL");
  });

  it("should return empty suggestions for no match", () => {
    expect(GoalValidators.getSuggestions("xyz")).toHaveLength(0);
  });
});

describe("DurationValidators", () => {
  it("should validate valid durations", () => {
    const validDurations = [15, 25, 45, 60];
    validDurations.forEach((duration) => {
      const result = DurationValidators.validate(duration);
      expect(result.success).toBe(true);
      expect(result.data).toBe(duration);
    });
  });

  it("should reject invalid durations", () => {
    const invalidDurations = [0, 10, 30, 90, null, "25"];
    invalidDurations.forEach((duration) => {
      const result = DurationValidators.validate(duration);
      expect(result.success).toBe(false);
    });
  });

  it("should provide suggestions for invalid duration", () => {
    const result = DurationValidators.validate(20);
    expect(result.success).toBe(false);
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions).toContain("15 minutes");
    expect(result.suggestions).toContain("25 minutes");
  });

  it("should warn about short duration", () => {
    const result = DurationValidators.validate(15);
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe("SHORT_DURATION_WARNING");
  });

  it("should warn about long duration", () => {
    const result = DurationValidators.validate(60);
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe("LONG_DURATION_WARNING");
  });

  it("should recommend durations for goals", () => {
    expect(DurationValidators.recommendForGoal("WORK")).toContain(25);
    expect(DurationValidators.recommendForGoal("STUDY")).toContain(25);
    expect(DurationValidators.recommendForGoal("CREATIVE")).toContain(45);
    expect(DurationValidators.recommendForGoal("PERSONAL")).toContain(25);
  });
});

describe("NameValidators", () => {
  it("should validate valid names", () => {
    const validNames = ["John", "Jane Doe", "User-123", "Test_User"];
    validNames.forEach((name) => {
      const result = NameValidators.validate(name);
      expect(result.success).toBe(true);
      expect(result.data).toBe(name.trim());
    });
  });

  it("should reject names that are too short", () => {
    const result = NameValidators.validate("A");
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe("NAME_TOO_SHORT");
  });

  it("should reject names that are too long", () => {
    const result = NameValidators.validate("A".repeat(31));
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe("NAME_TOO_LONG");
  });

  it("should reject names with invalid characters", () => {
    const result = NameValidators.validate("John@Doe!");
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe("NAME_INVALID_CHARACTERS");
  });

  it("should reject non-string values", () => {
    const result = NameValidators.validate(123);
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_NAME_TYPE");
  });

  it("should reject empty names", () => {
    const result = NameValidators.validate("   ");
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe("NAME_REQUIRED");
  });

  it("should warn about very short names", () => {
    const result = NameValidators.validate("Jo");
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].code).toBe("NAME_VERY_SHORT");
  });

  it("should warn about test-like names", () => {
    const result = NameValidators.validate("testuser");
    expect(result.success).toBe(true);
    expect(
      result.warnings.some((w) => w.code === "NAME_LIKE_TEST_DATA"),
    ).toBe(true);
  });

  it("should generate name suggestions", () => {
    const suggestions = NameValidators.generateSuggestions("ab");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toContain("ab");
  });
});
