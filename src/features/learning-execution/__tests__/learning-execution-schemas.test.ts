/**
 * Tests for schemas.ts (all Zod schemas).
 */

import {
  LearningExecutionPersonaSchema,
  ContentStudyGateInputSchema,
  LearningSessionTargetSchema,
} from "../schemas";

describe("schemas – validation", () => {
  it("LearningExecutionPersonaSchema accepts all 5 personae", () => {
    for (const p of ["student", "work", "creative", "growth", "learning"]) {
      expect(LearningExecutionPersonaSchema.safeParse(p).success).toBe(true);
    }
  });

  it("LearningExecutionPersonaSchema rejects invalid value", () => {
    expect(LearningExecutionPersonaSchema.safeParse("invalid").success).toBe(false);
  });

  it("ContentStudyGateInputSchema validates valid input", () => {
    const result = ContentStudyGateInputSchema.safeParse({
      aiConfigured: true,
      featureHealth: "healthy",
      goal: "STUDY",
      hasPrivacyDisclosure: true,
      rateLimitsConfigured: true,
      storageConfigured: true,
      totalCompletedSessions: 3,
    });
    expect(result.success).toBe(true);
  });

  it("ContentStudyGateInputSchema rejects negative session count", () => {
    const result = ContentStudyGateInputSchema.safeParse({
      aiConfigured: true,
      featureHealth: "healthy",
      goal: "STUDY",
      hasPrivacyDisclosure: true,
      rateLimitsConfigured: true,
      storageConfigured: true,
      totalCompletedSessions: -1,
    });
    expect(result.success).toBe(false);
  });

  it("ContentStudyGateInputSchema accepts null goal", () => {
    const result = ContentStudyGateInputSchema.safeParse({
      aiConfigured: false,
      featureHealth: "degraded",
      goal: null,
      hasPrivacyDisclosure: false,
      rateLimitsConfigured: false,
      storageConfigured: false,
      totalCompletedSessions: 0,
    });
    expect(result.success).toBe(true);
  });

  it("LearningSessionTargetSchema rejects empty contentId", () => {
    const result = LearningSessionTargetSchema.safeParse({
      contentId: "",
      focusAreas: [],
      generationId: "g1",
      nextTaskId: null,
      persona: "student",
      remainingMinutes: 10,
      title: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("LearningSessionTargetSchema rejects remainingMinutes < 1", () => {
    const result = LearningSessionTargetSchema.safeParse({
      contentId: "c1",
      focusAreas: [],
      generationId: "g1",
      nextTaskId: null,
      persona: "student",
      remainingMinutes: 0,
      title: "Test",
    });
    expect(result.success).toBe(false);
  });
});
