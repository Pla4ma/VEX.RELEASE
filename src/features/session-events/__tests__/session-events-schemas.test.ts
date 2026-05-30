/**
 * Tests for session-events feature: Zod schema validation.
 */

import {
  MidSessionEventTypeSchema,
  MidSessionBossTauntsSchema,
  EvaluateMidSessionEventInputSchema,
  MidSessionEventSchema,
} from "../schemas";
import type { EvaluateMidSessionEventInput } from "../schemas";

describe("schemas – validation", () => {
  const baseInput: EvaluateMidSessionEventInput = {
    bossHealthPercent: 80,
    elapsedSeconds: 300,
    isPaused: false,
    lastEventKey: null,
    purityScore: 75,
    sessionDurationSeconds: 1500,
  };

  it("MidSessionEventTypeSchema accepts all valid types", () => {
    const validTypes = [
      "BOSS_TAUNT",
      "PURITY_PULSE",
      "COMBO_WINDOW",
      "DISTRACTION_WAVE",
      "FOCUS_ZONE",
      "BOSS_RAGE",
    ];
    for (const type of validTypes) {
      expect(MidSessionEventTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it("MidSessionEventTypeSchema rejects invalid type", () => {
    expect(MidSessionEventTypeSchema.safeParse("INVALID").success).toBe(false);
  });

  it("MidSessionBossTauntsSchema accepts partial taunts", () => {
    expect(
      MidSessionBossTauntsSchema.safeParse({ spawn: "Hello" }).success,
    ).toBe(true);
    expect(MidSessionBossTauntsSchema.safeParse({}).success).toBe(true);
  });

  it("MidSessionBossTauntsSchema rejects extra fields (strict)", () => {
    expect(
      MidSessionBossTauntsSchema.safeParse({
        spawn: "Hello",
        extra: "field",
      }).success,
    ).toBe(false);
  });

  it("EvaluateMidSessionEventInputSchema accepts valid input", () => {
    expect(
      EvaluateMidSessionEventInputSchema.safeParse(baseInput).success,
    ).toBe(true);
  });

  it("EvaluateMidSessionEventInputSchema rejects purity > 100", () => {
    expect(
      EvaluateMidSessionEventInputSchema.safeParse({
        ...baseInput,
        purityScore: 101,
      }).success,
    ).toBe(false);
  });

  it("EvaluateMidSessionEventInputSchema rejects negative elapsedSeconds", () => {
    expect(
      EvaluateMidSessionEventInputSchema.safeParse({
        ...baseInput,
        elapsedSeconds: -1,
      }).success,
    ).toBe(false);
  });

  it("MidSessionEventSchema validates a complete event", () => {
    const result = MidSessionEventSchema.safeParse({
      key: "mid-session:0:PURITY_PULSE",
      type: "PURITY_PULSE",
      title: "Focus holding",
      message: "Purity is 75%.",
      toastType: "info",
      haptic: "selection",
    });
    expect(result.success).toBe(true);
  });

  it("MidSessionEventSchema rejects empty key", () => {
    const result = MidSessionEventSchema.safeParse({
      key: "",
      type: "PURITY_PULSE",
      title: "Test",
      message: "Test",
      toastType: "info",
      haptic: "selection",
    });
    expect(result.success).toBe(false);
  });
});
