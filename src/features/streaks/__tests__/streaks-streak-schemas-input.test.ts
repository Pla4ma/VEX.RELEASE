/**
 * Streaks Comprehensive Tests — Schemas Input
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import {
  ShieldSourceSchema,
  RecoverySourceSchema,
  ComebackStateSchema,
  StreakCalendarDaySchema,
  StreakActionSchema,
  RecordSessionInputSchema,
  UseShieldInputSchema,
  FreezeStreakInputSchema,
  RestoreStreakInputSchema,
} from "../schemas";

describe("Streak Schemas", () => {
  describe("ShieldSourceSchema", () => {
    it("accepts all valid sources", () => {
      for (const s of ["MILESTONE_30", "BOSS_DEFEAT", "SHOP_PURCHASE", "PROMOTIONAL"]) {
        expect(ShieldSourceSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("RecoverySourceSchema", () => {
    it("accepts all valid sources", () => {
      for (const s of ["SHIELD", "PURCHASE", "SPECIAL_EVENT", "MANUAL"]) {
        expect(RecoverySourceSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("ComebackStateSchema", () => {
    it("accepts valid comeback state", () => {
      const result = ComebackStateSchema.safeParse({
        isComeback: true,
        daysAbsent: 5,
        streakBefore: 10,
        streakNow: 0,
        rewardMultiplier: 1.5,
        streakRestoreEligible: true,
        message: "Welcome back!",
      });
      expect(result.success).toBe(true);
    });
    it("rejects empty message", () => {
      const result = ComebackStateSchema.safeParse({
        isComeback: false,
        daysAbsent: 0,
        streakBefore: 0,
        streakNow: 0,
        rewardMultiplier: 1,
        streakRestoreEligible: false,
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StreakCalendarDaySchema", () => {
    it("accepts valid calendar day", () => {
      const result = StreakCalendarDaySchema.safeParse({
        date: "2025-01-15",
        hasSession: true,
        sessionCount: 2,
        totalDuration: 1800,
        qualifiesForStreak: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("StreakActionSchema", () => {
    it("accepts all valid actions", () => {
      for (const a of ["INCREMENTED", "MAINTAINED", "BROKEN", "SHIELD_PROTECTED", "FROZEN", "COME_BACK", "ALREADY_TODAY"]) {
        expect(StreakActionSchema.safeParse(a).success).toBe(true);
      }
    });
  });

  describe("RecordSessionInputSchema", () => {
    it("accepts valid input", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 80,
      });
      expect(result.success).toBe(true);
    });
    it("rejects quality > 100", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 101,
      });
      expect(result.success).toBe(false);
    });
    it("rejects extra fields", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 80,
        extra: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UseShieldInputSchema", () => {
    it("accepts valid input", () => {
      expect(UseShieldInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        reason: "MANUAL",
      }).success).toBe(true);
    });
    it("rejects invalid reason", () => {
      expect(UseShieldInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        reason: "INVALID",
      }).success).toBe(false);
    });
  });

  describe("FreezeStreakInputSchema", () => {
    it("accepts valid input", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 24,
      }).success).toBe(true);
    });
    it("rejects duration > 72", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 73,
      }).success).toBe(false);
    });
    it("rejects duration < 1", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 0,
      }).success).toBe(false);
    });
  });

  describe("RestoreStreakInputSchema", () => {
    it("accepts valid input", () => {
      expect(RestoreStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        targetDays: 5,
        source: "SPECIAL_EVENT",
      }).success).toBe(true);
    });
    it("rejects targetDays < 1", () => {
      expect(RestoreStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        targetDays: 0,
        source: "MANUAL",
      }).success).toBe(false);
    });
  });

});
