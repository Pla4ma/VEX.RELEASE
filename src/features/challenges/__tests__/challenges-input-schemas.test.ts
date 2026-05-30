/**
 * Tests for Challenges — Input Schemas
 */

import { describe, it, expect } from "@jest/globals";

import {
  AssignChallengeInputSchema,
  UpdateChallengeProgressInputSchema,
  RerollChallengeInputSchema,
  ClaimChallengeRewardInputSchema,
  ChallengeGenerationConfigSchema,
  DailyChallengeContextSchema,
} from "../schemas";

describe("Input Schemas", () => {
  it("AssignChallengeInputSchema validates valid input", () => {
    const input = AssignChallengeInputSchema.parse({
      userId: "u-1",
      seasonId: "s-1",
      challengeType: "DAILY",
    });
    expect(input.challengeType).toBe("DAILY");
    expect(input.challengeId).toBeUndefined();
  });

  it("AssignChallengeInputSchema rejects empty userId", () => {
    expect(() =>
      AssignChallengeInputSchema.parse({ userId: "", seasonId: "s-1", challengeType: "DAILY" }),
    ).toThrow();
  });

  it("UpdateChallengeProgressInputSchema validates valid input", () => {
    const input = UpdateChallengeProgressInputSchema.parse({
      userId: "u-1",
      challengeId: "c-1",
      delta: 5,
      source: "session",
    });
    expect(input.delta).toBe(5);
  });

  it("UpdateChallengeProgressInputSchema rejects non-positive delta", () => {
    expect(() =>
      UpdateChallengeProgressInputSchema.parse({ userId: "u", challengeId: "c", delta: 0, source: "s" }),
    ).toThrow();
  });

  it("RerollChallengeInputSchema validates valid input", () => {
    const input = RerollChallengeInputSchema.parse({
      userId: "u-1",
      challengeId: "c-1",
      usePaidReroll: false,
    });
    expect(input.usePaidReroll).toBe(false);
  });

  it("ClaimChallengeRewardInputSchema validates valid input", () => {
    const input = ClaimChallengeRewardInputSchema.parse({
      userId: "u-1",
      challengeId: "c-1",
    });
    expect(input.userId).toBe("u-1");
  });

  it("ChallengeGenerationConfigSchema validates with defaults", () => {
    const config = ChallengeGenerationConfigSchema.parse({
      seasonId: "s-1",
      userId: "u-1",
      userLevel: 5,
      isPremium: false,
      hasSquad: false,
      challengeType: "DAILY",
    });
    expect(config.dailyChallengeCount).toBe(3);
    expect(config.weeklyChallengeCount).toBe(3);
  });

  it("DailyChallengeContextSchema accepts partial context", () => {
    const ctx = DailyChallengeContextSchema.parse({ minutesCompleted: 30 });
    expect(ctx.minutesCompleted).toBe(30);
    expect(ctx.sessionCount).toBeUndefined();
  });

  it("DailyChallengeContextSchema rejects out-of-range purity", () => {
    expect(() =>
      DailyChallengeContextSchema.parse({ purity: 150 }),
    ).toThrow();
  });
});
